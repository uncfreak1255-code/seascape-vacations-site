const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { shouldRunLighthouse } = require("./performance-scope");

// Hook Git variables belong to the outer checkout, never fixture repositories.
for (const key of Object.keys(process.env)) {
  if (key.startsWith("GIT_")) delete process.env[key];
}

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "performance-scope-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  const write = (file, text = "fixture\n") => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), text);
  };
  git("init", "-q");
  git("config", "user.email", "fixture@example.test");
  git("config", "user.name", "Fixture");
  const commit = () => { git("add", "-A"); git("commit", "-qm", "fixture"); return git("rev-parse", "HEAD"); };
  write("docs/guide.md"); write("README.md"); write("src/index.html");
  const base = commit();
  const event = (head = git("rev-parse", "HEAD")) => ({ pull_request: { base: { sha: base }, head: { sha: head } } });
  return { root, git, write, commit, event, base };
}

test("the workflow CLI reports docs-only without collecting Lighthouse", (t) => {
  const f = fixture(t);
  f.write("docs/guide.md", "updated\n"); f.write("AGENTS.md"); f.commit();
  const eventFile = path.join(f.root, "event.json"), output = path.join(f.root, "output");
  fs.writeFileSync(eventFile, JSON.stringify(f.event()));
  execFileSync(process.execPath, [path.join(__dirname, "performance-scope.js")], {
    cwd: f.root, env: { ...process.env, GITHUB_EVENT_NAME: "pull_request", GITHUB_EVENT_PATH: eventFile, GITHUB_OUTPUT: output }
  });
  assert.equal(fs.readFileSync(output, "utf8"), "run_lighthouse=false\n");
});

test("public source, configuration, mixed and unknown changes always require audits", (t) => {
  for (const file of ["src/index.html", "src/guide.md", "package.json", ".github/workflows/performance-budget.yml", "scripts/perf/performance-scope.js", "docs/perf.json", "unknown.md"]) {
    const f = fixture(t);
    f.write(file, `changed ${file}\n`); f.commit();
    assert.equal(shouldRunLighthouse("pull_request", f.event(), f.root), true, file);
  }
});

test("moving source into docs still requires audits for the removed source path", (t) => {
  const f = fixture(t);
  f.git("mv", "src/index.html", "docs/moved.md"); f.commit();
  assert.equal(shouldRunLighthouse("pull_request", f.event(), f.root), true);
});

test("a newer base's site changes in the checked-out merge require audits", (t) => {
  const f = fixture(t);
  f.write("docs/guide.md", "updated\n"); const docHead = f.commit();
  f.git("checkout", "-qb", "newer-base", f.base);
  f.write("src/index.html", "new base content\n"); f.commit();
  f.git("merge", "--no-edit", docHead);
  assert.equal(shouldRunLighthouse("pull_request", f.event(docHead), f.root), true);
});

test("scheduled, manual, empty and unreadable scope never silently skip", (t) => {
  const f = fixture(t);
  assert.equal(shouldRunLighthouse("schedule", {}, f.root), true);
  assert.equal(shouldRunLighthouse("workflow_dispatch", {}, f.root), true);
  assert.equal(shouldRunLighthouse("pull_request", f.event(), f.root), true);
  assert.throws(() => shouldRunLighthouse("pull_request", {}, f.root), /full base and head SHAs/);
  const missing = f.event(); missing.pull_request.base.sha = "0".repeat(40);
  assert.throws(() => shouldRunLighthouse("pull_request", missing, f.root));
});
