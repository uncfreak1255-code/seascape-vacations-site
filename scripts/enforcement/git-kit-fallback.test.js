const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");

// Hook Git variables identify the caller's checkout, not our disposable repos.
for (const key of Object.keys(process.env)) {
  if (key.startsWith("GIT_")) delete process.env[key];
}

const {
  main,
  parseSafeCommitArgs,
  resolveMacKitPath,
  runGitKitFallback
} = require("./git-kit-fallback");

const projectRoot = path.resolve(__dirname, "..", "..");

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function runGit(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return (result.stdout || "").trim();
}

function makeCommitRepo() {
  const cwd = makeTempDir("site-1-safe-commit-");
  runGit(["init", "-b", "cursor/site-1-kit-test"], cwd);
  runGit(["config", "user.email", "site-1@example.com"], cwd);
  runGit(["config", "user.name", "SITE-1"], cwd);
  runGit(["config", "commit.gpgsign", "false"], cwd);
  fs.writeFileSync(path.join(cwd, "seed.txt"), "seed\n");
  runGit(["add", "seed.txt"], cwd);
  runGit(["-c", "commit.gpgsign=false", "commit", "--no-gpg-sign", "-m", "seed"], cwd);
  return cwd;
}

test("empty git-kit command fails and names git-kit-fallback.js", () => {
  assert.throws(() => resolveMacKitPath(""), /git-kit-fallback\.js/);
  assert.throws(() => resolveMacKitPath(), /git-kit-fallback\.js/);
  assert.throws(() => main([]), /git-kit-fallback\.js: command required/);
});

test("missing Mac git kit falls through to repo pre-commit.js for preflight only", () => {
  const kitDir = makeTempDir("site-4-no-kit-");
  const status = runGitKitFallback("preflight", [], {
    kitDir,
    spawn: { stdio: "pipe", cwd: makeCommitRepo() }
  });
  assert.equal(status, 0);
});

test("present Mac git kit is used instead of pre-commit.js", () => {
  const kitDir = makeTempDir("site-4-kit-");
  const kitBin = path.join(kitDir, "guardrail-preflight");
  fs.writeFileSync(kitBin, "#!/bin/sh\nexit 7\n", { mode: 0o755 });

  const status = runGitKitFallback("preflight", [], {
    kitDir,
    spawn: { stdio: "pipe" }
  });
  assert.equal(status, 7);
});

test("package.json git wrappers use git-kit-fallback.js", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));
  assert.equal(pkg.scripts["git:preflight"], "node scripts/enforcement/git-kit-fallback.js preflight");
  assert.equal(pkg.scripts["git:safe-commit"], "node scripts/enforcement/git-kit-fallback.js safe-commit");
  assert.equal(pkg.scripts["git:merge-check"], "node scripts/enforcement/git-kit-fallback.js merge-check");
});

test("npm run git:preflight reaches repo checks when the Mac binary is missing", () => {
  // pre-commit.js refuses on main; point its branch check at a task-branch
  // repo so this passes when CI runs on a push to main.
  const result = spawnSync("npm", ["run", "git:preflight"], {
    cwd: projectRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_DIR: path.join(makeCommitRepo(), ".git"),
      SEASCAPE_GIT_KIT_DIR: makeTempDir("site-4-npm-kit-")
    }
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("missing Mac kit merge-check fails instead of skip-as-pass", () => {
  assert.throws(
    () =>
      runGitKitFallback("merge-check", [], {
        kitDir: makeTempDir("site-1-no-merge-kit-"),
        spawn: { stdio: "pipe" }
      }),
    /git-kit-fallback\.js: merge-check cannot skip-as-pass/
  );
});

test("missing Mac kit safe-commit without a message fails instead of skip-as-pass", () => {
  assert.deepEqual(parseSafeCommitArgs(["--stage-source"]), { stageSource: true, message: "" });
  for (const branch of ["cursor/site-1-kit-test", "main", "master"]) {
    const cwd = makeCommitRepo();
    if (branch !== "cursor/site-1-kit-test") runGit(["branch", "-m", branch], cwd);
    fs.writeFileSync(path.join(cwd, "note.txt"), "must remain untracked\n");
    const beforeHead = runGit(["rev-parse", "HEAD"], cwd);
    const beforeIndex = fs.readFileSync(path.join(cwd, ".git", "index"));

    for (const args of [["--stage-source"], ["--stage-source", "-m", " \t "]]) {
      assert.throws(
        () =>
          runGitKitFallback("safe-commit", args, {
            kitDir: makeTempDir("site-1-no-commit-msg-"),
            spawn: { stdio: "pipe", cwd }
          }),
        /git-kit-fallback\.js: safe-commit requires -m/,
        `${branch} must reject the missing message before checking the branch`
      );
    }
    assert.equal(runGit(["rev-parse", "HEAD"], cwd), beforeHead);
    assert.deepEqual(fs.readFileSync(path.join(cwd, ".git", "index")), beforeIndex);
    assert.equal(runGit(["status", "--porcelain"], cwd), "?? note.txt");
  }
});

test("portable safe-commit refuses protected branches before staging or committing", () => {
  for (const branch of ["main", "master"]) {
    const cwd = makeCommitRepo();
    runGit(["branch", "-m", branch], cwd);
    fs.writeFileSync(path.join(cwd, "note.txt"), "must remain untracked\n");
    const beforeHead = runGit(["rev-parse", "HEAD"], cwd);
    const beforeIndex = fs.readFileSync(path.join(cwd, ".git", "index"));

    const status = runGitKitFallback("safe-commit", ["--stage-source", "-m", "test: refuse protected branch"], {
      kitDir: makeTempDir("site-1-protected-commit-"),
      spawn: { stdio: "pipe", cwd }
    });

    assert.notEqual(status, 0, `${branch} must refuse the commit`);
    assert.equal(runGit(["rev-parse", "HEAD"], cwd), beforeHead);
    assert.deepEqual(fs.readFileSync(path.join(cwd, ".git", "index")), beforeIndex);
    assert.equal(runGit(["status", "--porcelain"], cwd), "?? note.txt");
  }
});

test("missing Mac kit safe-commit --stage-source creates a commit", () => {
  const cwd = makeCommitRepo();
  fs.writeFileSync(path.join(cwd, "note.txt"), "portable commit\n");
  fs.mkdirSync(path.join(cwd, "_site"));
  fs.writeFileSync(path.join(cwd, "_site", "index.html"), "<p>generated</p>\n");

  const status = runGitKitFallback("safe-commit", ["--stage-source", "-m", "test: portable safe-commit"], {
    kitDir: makeTempDir("site-1-portable-commit-"),
    spawn: { stdio: "pipe", cwd }
  });

  assert.equal(status, 0);
  assert.equal(runGit(["log", "-1", "--pretty=%s"], cwd), "test: portable safe-commit");
  assert.equal(runGit(["ls-files"], cwd), "note.txt\nseed.txt");
});

test("missing Mac kit safe-commit fails when only generated files changed", () => {
  const cwd = makeCommitRepo();
  fs.mkdirSync(path.join(cwd, "_site"));
  fs.writeFileSync(path.join(cwd, "_site", "index.html"), "<p>generated</p>\n");

  assert.throws(
    () =>
      runGitKitFallback("safe-commit", ["--stage-source", "-m", "test: generated only"], {
        kitDir: makeTempDir("site-1-generated-only-"),
        spawn: { stdio: "pipe", cwd }
      }),
    /git-kit-fallback\.js: safe-commit --stage-source found no source files/
  );
});

test("portable commit fixtures isolate inherited Git hook identity", (t) => {
  const outer = makeCommitRepo();
  t.after(() => fs.rmSync(outer, { recursive: true, force: true }));
  runGit(["config", "user.name", "Outer Repo"], outer);
  const configPath = path.join(outer, ".git", "config");
  const beforeConfig = fs.readFileSync(configPath, "utf8");
  const beforeHead = runGit(["rev-parse", "HEAD"], outer);
  const childEnv = {
    ...process.env,
    GIT_DIR: path.join(outer, ".git"),
    GIT_WORK_TREE: outer,
    GIT_INDEX_FILE: path.join(outer, ".git", "index")
  };
  delete childEnv.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath, [
    "--test",
    "--test-name-pattern", "^missing Mac kit safe-commit (--stage-source creates a commit|fails when only generated files changed)$",
    __filename
  ], {
    cwd: projectRoot,
    encoding: "utf8",
    env: childEnv
  });

  assert.equal(fs.readFileSync(configPath, "utf8"), beforeConfig, "fixture must preserve the hook caller's Git config");
  assert.equal(runGit(["rev-parse", "HEAD"], outer), beforeHead);
  assert.equal(runGit(["status", "--porcelain"], outer), "");
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
