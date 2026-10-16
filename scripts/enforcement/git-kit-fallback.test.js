const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");

const {
  main,
  resolveMacKitPath,
  runGitKitFallback
} = require("./git-kit-fallback");

const projectRoot = path.resolve(__dirname, "..", "..");

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

test("empty git-kit command fails and names git-kit-fallback.js", () => {
  assert.throws(() => resolveMacKitPath(""), /git-kit-fallback\.js/);
  assert.throws(() => resolveMacKitPath(), /git-kit-fallback\.js/);
  assert.throws(() => main([]), /git-kit-fallback\.js: command required/);
});

test("missing Mac git kit falls through to repo pre-commit.js", () => {
  const kitDir = makeTempDir("site-4-no-kit-");
  const status = runGitKitFallback("preflight", [], {
    kitDir,
    spawn: { stdio: "pipe" }
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
  const result = spawnSync("npm", ["run", "git:preflight"], {
    cwd: projectRoot,
    encoding: "utf8",
    env: { ...process.env, SEASCAPE_GIT_KIT_DIR: makeTempDir("site-4-npm-kit-") }
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
