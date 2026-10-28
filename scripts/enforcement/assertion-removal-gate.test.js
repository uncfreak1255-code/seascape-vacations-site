const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const {
  assertNoNetAssertionRemoval,
  countAssertionChanges,
  isTestPath,
  logRangeFor,
} = require("./assertion-removal-gate");

const SAMPLE_DIFF = [
  "diff --git a/scripts/enforcement/metadata-integrity.test.js b/scripts/enforcement/metadata-integrity.test.js",
  "--- a/scripts/enforcement/metadata-integrity.test.js",
  "+++ b/scripts/enforcement/metadata-integrity.test.js",
  '-  assert.equal(head.title, "Old");',
  '+  assert.equal(head.title, "New");',
  "-  assert.equal(head.ogTitle, head.title);",
  "-  assert.equal(head.twitterTitle, head.title);",
  "diff --git a/src/guides/page.html b/src/guides/page.html",
  "-  assert.equal(notATest, 1);",
].join("\n");

test("counts assertion lines only in test files", () => {
  const { added, removed } = countAssertionChanges(SAMPLE_DIFF);
  assert.equal(added, 1);
  assert.equal(removed, 3);
  assert.equal(isTestPath("tests/visual/home.spec.js"), true);
  assert.equal(isTestPath("tests/e2e/site-flows.e2e.ts"), true);
  assert.equal(isTestPath("scripts/enforcement/lib.js"), false);
});

test("log range follows the diff range shape", () => {
  assert.equal(logRangeFor("origin/main"), "origin/main..HEAD");
  assert.equal(logRangeFor("a...b"), "a..b");
  assert.equal(logRangeFor("a..b"), "a..b");
});

// Fixture repos must not inherit a commit hook's GIT_DIR or GIT_INDEX_FILE, which
// would point these git calls at the real repository.
const FIXTURE_ENV = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_"))
);

function makeRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "assertion-gate-"));
  const git = (...args) =>
    execFileSync("git", args, { cwd: dir, env: FIXTURE_ENV, encoding: "utf8" });
  git("init", "-q", "-b", "main");
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "test");
  fs.writeFileSync(
    path.join(dir, "a.test.js"),
    "assert.equal(1, 1);\nassert.equal(2, 2);\nassert.equal(3, 3);\n"
  );
  git("add", "a.test.js");
  git("commit", "-q", "-m", "base");
  git("branch", "base");
  return { dir, git };
}

test("fails a net assertion loss and names the file", () => {
  const { dir, git } = makeRepo();
  fs.writeFileSync(path.join(dir, "a.test.js"), "assert.equal(1, 1);\n");
  git("commit", "-q", "-am", "drop checks");
  assert.throws(
    () => assertNoNetAssertionRemoval({ range: "base", cwd: dir, env: FIXTURE_ENV }),
    /removes 2 test assertions and adds 0[\s\S]*a\.test\.js[\s\S]*Assertions-Removed/
  );
});

test("passes a like-for-like update and an acknowledged removal", () => {
  const { dir, git } = makeRepo();
  fs.writeFileSync(
    path.join(dir, "a.test.js"),
    "assert.equal(1, 1);\nassert.equal(2, 2);\nassert.equal(4, 4);\n"
  );
  git("commit", "-q", "-am", "update");
  assert.equal(assertNoNetAssertionRemoval({ range: "base", cwd: dir, env: FIXTURE_ENV }).status, "passed");

  fs.writeFileSync(path.join(dir, "a.test.js"), "assert.equal(1, 1);\n");
  git("commit", "-q", "-am", "retire checks\n\nAssertions-Removed: feature deleted");
  assert.equal(assertNoNetAssertionRemoval({ range: "base", cwd: dir, env: FIXTURE_ENV }).status, "acknowledged");
});

test("commenting out or renaming a test out of discovery counts as removal", () => {
  const { dir, git } = makeRepo();
  fs.writeFileSync(
    path.join(dir, "a.test.js"),
    "// assert.equal(1, 1);\n// assert.equal(2, 2);\nassert.equal(3, 3);\n"
  );
  git("commit", "-q", "-am", "comment out");
  assert.throws(
    () => assertNoNetAssertionRemoval({ range: "base", cwd: dir, env: FIXTURE_ENV }),
    /removes 2 test assertions and adds 0/
  );

  git("reset", "-q", "--hard", "base");
  git("mv", "a.test.js", "a.js");
  git("commit", "-q", "-m", "rename");
  assert.throws(
    () => assertNoNetAssertionRemoval({ range: "base", cwd: dir, env: FIXTURE_ENV }),
    /removes 3 test assertions and adds 0/
  );
});
