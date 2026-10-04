const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseArgs,
  resolveReleaseRange,
  getChangedFiles
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

test("dirty tree without --range fails", () => {
  assert.throws(
    () => resolveReleaseRange({ rangeProvided: false, range: "" }, { dirty: true }),
    /required on a dirty worktree/
  );
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
