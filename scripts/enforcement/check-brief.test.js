const test = require("node:test");
const assert = require("node:assert/strict");
const { checkBriefContent, checkBriefNotes, isCheckableBrief, parseArgs } = require("./check-brief");

test("reports every missing content-gate field in one pass", () => {
  const problems = checkBriefContent("# Brief\n\n- persona: families\n");
  assert.ok(problems.some((problem) => problem.includes('"- primary keyword: ..."')));
  assert.ok(problems.some((problem) => problem.includes('"- anti-claims: ..."')));
  assert.equal(problems.some((problem) => problem.includes("at least two")), false);
  assert.ok(checkBriefNotes("# Brief\n")[0].includes("at least two"));
  assert.deepEqual(checkBriefNotes("- required internal links: /a/, /b/\n"), []);
});

test("checks Gate 0 when the brief has the block or --gate0 is passed", () => {
  const withBlock = "## Gate 0 Search And Attack Receipt\n\n| Field | Answer |\n| --- | --- |\n| Attack status | done |\n";
  const problems = checkBriefContent(withBlock);
  assert.ok(problems.some((problem) => problem.startsWith("Gate 0: Target query family")));
  assert.ok(problems.some((problem) => problem.includes("Attack status (completed")));
  assert.equal(checkBriefContent("# No gate").some((p) => p.startsWith("Gate 0")), false);
  assert.ok(checkBriefContent("# No gate", { gate0: true }).includes("Gate 0: Gate 0 block"));
});

test("skips templates and the README and parses flags", () => {
  assert.equal(isCheckableBrief("docs/briefs/_template.md"), false);
  assert.equal(isCheckableBrief("docs/briefs/_ai-visibility-batch-template.md"), false);
  assert.equal(isCheckableBrief("docs/briefs/README.md"), false);
  assert.equal(isCheckableBrief("docs/briefs/2026-10-shelling-guide-rescue.md"), true);
  assert.deepEqual(parseArgs(["--gate0", "a.md"]), { gate0: true, paths: ["a.md"] });
});
