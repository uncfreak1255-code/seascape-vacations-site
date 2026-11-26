const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  parseArgs,
  buildReceipt,
  resolveReleaseRange,
  getChangedFiles,
  worktreeStatus
} = require("./verify-release");

test("parseArgs does not invent a range when --range is missing", () => {
  const parsed = parseArgs([]);
  assert.equal(parsed.rangeProvided, false);
  assert.equal(parsed.range, "");
});

test("parseArgs records an explicit empty --range", () => {
  const parsed = parseArgs(["--range"]);
  assert.equal(parsed.rangeProvided, true);
  assert.equal(parsed.range, "");
});

test("empty --range input fails", () => {
  assert.throws(
    () => resolveReleaseRange({ rangeProvided: true, range: "" }, { dirty: false }),
    /non-empty git range/
  );
  assert.throws(
    () => resolveReleaseRange({ rangeProvided: true, range: "   " }, { dirty: true }),
    /non-empty git range/
  );
  assert.throws(() => getChangedFiles(""), /non-empty git range/);
  assert.throws(() => getChangedFiles(), /non-empty git range/);
});

test("dirty tree with untracked files and no --range fails and names them", () => {
  assert.throws(
    () =>
      resolveReleaseRange(
        { rangeProvided: false, range: "" },
        { dirty: true, untracked: ["src/new-page.njk"] }
      ),
    /untracked files.*src\/new-page\.njk/
  );
});

test("dirty tree with only tracked changes and no --range diffs the working tree against the merge base", () => {
  assert.equal(
    resolveReleaseRange(
      { rangeProvided: false, range: "" },
      { dirty: true, untracked: [], mergeBase: "abc123" }
    ),
    "abc123"
  );
});

test("dirty-tree default ignores commits main made after the branch split", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-release-mb-"));
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")));
  const git = (...args) =>
    execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], { cwd: dir, env, encoding: "utf8" });
  try {
    git("init", "-q", "-b", "main");
    fs.writeFileSync(path.join(dir, "keep.txt"), "one\n");
    fs.writeFileSync(path.join(dir, "mine.txt"), "one\n");
    git("add", "-A");
    git("commit", "-q", "-m", "base");
    git("checkout", "-q", "-b", "task");
    git("checkout", "-q", "main");
    fs.writeFileSync(path.join(dir, "keep.txt"), "two\n");
    git("commit", "-q", "-am", "main moves on");
    git("update-ref", "refs/remotes/origin/main", "main");
    git("checkout", "-q", "task");
    fs.writeFileSync(path.join(dir, "mine.txt"), "two\n");
    fs.writeFileSync(path.join(dir, "new.txt"), "new\n");

    const untracked = worktreeStatus(dir);
    assert.deepEqual(untracked, { dirty: true, untracked: ["new.txt"] });

    git("add", "new.txt");
    const status = worktreeStatus(dir);
    assert.deepEqual(status, { dirty: true, untracked: [] });
    const base = resolveReleaseRange(
      { rangeProvided: false, range: "" },
      { ...status, mergeBase: git("merge-base", "origin/main", "HEAD").trim() }
    );
    const changed = git("diff", "--name-only", base).trim().split("\n").sort();
    assert.deepEqual(changed, ["mine.txt", "new.txt"]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("clean tree without --range uses origin/main...HEAD", () => {
  assert.equal(
    resolveReleaseRange({ rangeProvided: false, range: "" }, { dirty: false }),
    "origin/main...HEAD"
  );
});

test("explicit --range wins on a dirty tree", () => {
  assert.equal(
    resolveReleaseRange({ rangeProvided: true, range: "abc...def" }, { dirty: true }),
    "abc...def"
  );
});

test("release receipt counts path assertions and command checks and names the first failure", () => {
  const { summary } = buildReceipt({
    args: { range: "origin/main...HEAD" },
    pathAssertions: [{ label: "netlify build truth", status: "passed" }],
    checks: [
      { label: "build", status: "failed" },
      { label: "tests", status: "failed" }
    ]
  });

  assert.deepEqual(summary, {
    verdict: "fail",
    total_checks: 3,
    failed_checks: 2,
    first_failure: "build"
  });
  assert.equal(
    buildReceipt({ args: { range: "" }, pathAssertions: [], checks: [] }).summary.verdict,
    "pass"
  );
});
