const test = require("node:test");
const assert = require("node:assert/strict");

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const { verdict, tally, codexUsage, claudeSkillNames, readFrontmatter } = require("./audit-skills");

function row(overrides) {
  return {
    canonical: true,
    reachable: true,
    descriptionLength: 80,
    hasTrigger: true,
    brokenPointers: [],
    ageDays: 120,
    claude: { all: 0, focused: 0 },
    codex: { all: 5, focused: 5 },
    ...overrides
  };
}

test("tally counts each unit once and splits out focused units", () => {
  const known = new Set(["a", "b"]);
  const wide = new Set(["a", ...Array.from({ length: 12 }, (_, i) => `x${i}`)]);
  const units = new Map([
    ["t1", new Set(["a", "b"])],
    ["t2", new Set(["a", "unknown"])],
    ["t3", wide]
  ]);
  assert.deepEqual(tally(units, known), {
    a: { all: 3, focused: 2 },
    b: { all: 1, focused: 1 }
  });
});

test("verdict keeps a skill with enough focused use", () => {
  assert.equal(verdict(row()).verdict, "KEEP");
});

test("verdict watches a skill with fewer than three focused uses", () => {
  assert.equal(verdict(row({ codex: { all: 4, focused: 2 } })).verdict, "WATCH");
});

test("verdict proposes retirement only for unused skills past the minimum age", () => {
  const unused = { claude: { all: 0, focused: 0 }, codex: { all: 0, focused: 0 } };
  assert.equal(verdict(row(unused)).verdict, "RETIRE?");
  assert.equal(verdict(row({ ...unused, ageDays: 10 })).verdict, "WATCH");
});

test("verdict never proposes retirement when a usage sensor is down", () => {
  const result = verdict(row({ codex: null, claude: { all: 0, focused: 0 } }));
  assert.equal(result.verdict, "KEEP");
  assert.match(result.reasons[0], /UNAVAILABLE/);
});

test("description rules bind canonical skills only", () => {
  const long = { descriptionLength: 400, hasTrigger: false };
  assert.equal(verdict(row(long)).verdict, "CHANGE");
  assert.equal(verdict(row({ ...long, canonical: false })).verdict, "KEEP");
});

test("disabled skills and broken pointers need a change", () => {
  assert.equal(verdict(row({ reachable: false })).verdict, "CHANGE");
  assert.equal(verdict(row({ brokenPointers: ["docs/missing.md"] })).verdict, "CHANGE");
});

test("claudeSkillNames reads Skill calls and SKILL.md reads", () => {
  const record = {
    message: {
      content: [
        { type: "tool_use", name: "Skill", input: { skill: "plugin:page-cro" } },
        { type: "tool_use", name: "Read", input: { file_path: "/r/.agents/skills/schema-markup/SKILL.md" } },
        { type: "text", text: "skills/ignored/SKILL.md" }
      ]
    }
  };
  assert.deepEqual(claudeSkillNames(record), ["page-cro", "schema-markup"]);
});

test("readFrontmatter returns the description", () => {
  const fm = readFrontmatter("---\nname: x\ndescription: Use when testing.\n---\nbody\n");
  assert.equal(fm.description, "Use when testing.");
});

test("codexUsage counts a skill read on a later line of a multiline command", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "audit-skills-"));
  const db = path.join(dir, "threads.sqlite");
  const item = (command) => JSON.stringify({ command }).replace(/'/g, "''");
  execFileSync("sqlite3", [
    db,
    "create table thread_items (thread_id text, item_type text, created_at_ms integer, item_json text);" +
      `insert into thread_items values ('single', 'commandExecution', 10, '${item("cat .agents/skills/example/SKILL.md")}');` +
      `insert into thread_items values ('multi', 'commandExecution', 10, '${item("pwd\ncat .agents/skills/example/SKILL.md")}');`
  ]);
  try {
    assert.deepEqual(codexUsage(db, 0, new Set(["example"])), { example: { all: 2, focused: 2 } });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
