const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  compareSkillSets,
  validateManifestEntries,
  listSkillDirs,
  runCheck
} = require("./skills-divergence");

const REPO_ROOT = path.resolve(__dirname, "..", "..");

test("listSkillDirs: broken symlinks are ERRORS, not omissions; misdirected symlinks are errors too", (t) => {
  // Adversarial review P1 pair: a deleted target with its tracked symlink
  // left behind must FAIL the gate, and a symlink pointing at the wrong
  // skill must not compare clean by basename.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "skills-divergence-"));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const skillsDir = path.join(tmp, "skills");
  const agentsRoot = path.join(tmp, "agents-skills");
  fs.mkdirSync(path.join(skillsDir, "real-dir-skill"), { recursive: true });
  fs.mkdirSync(path.join(agentsRoot, "symlinked-skill"), { recursive: true });
  fs.mkdirSync(path.join(agentsRoot, "other-skill"), { recursive: true });
  fs.symlinkSync(path.join(agentsRoot, "symlinked-skill"), path.join(skillsDir, "symlinked-skill"));
  fs.symlinkSync(path.join(tmp, "does-not-exist"), path.join(skillsDir, "broken-symlink-skill"));
  fs.symlinkSync(path.join(agentsRoot, "other-skill"), path.join(skillsDir, "misdirected-skill"));

  const symlinkErrors = [];
  const names = listSkillDirs(skillsDir, { symlinkErrors, expectTargetRoot: agentsRoot });
  assert.deepEqual(names, ["real-dir-skill", "symlinked-skill"]);
  assert.equal(symlinkErrors.length, 2);
  assert.ok(symlinkErrors.some((m) => m.includes("broken symlink")));
  assert.ok(symlinkErrors.some((m) => m.includes("misdirected symlink")));
});

test("undeclared divergence fails: skill present in one dir but not in manifest", () => {
  const result = compareSkillSets({
    agentsSkills: ["accessibility", "owner-outbound-batch"],
    claudeSkills: ["accessibility"],
    manifestEntries: []
  });

  assert.deepEqual(result.undeclared, [
    { skill: "owner-outbound-batch", only_in: ".agents" }
  ]);
  assert.deepEqual(result.stale, []);
  assert.equal(result.ok, false);
});

test("declared divergence passes: manifest entry matches actual state", () => {
  const result = compareSkillSets({
    agentsSkills: ["accessibility", "owner-outbound-batch"],
    claudeSkills: ["accessibility"],
    manifestEntries: [
      {
        skill: "owner-outbound-batch",
        only_in: ".agents",
        reason: "outbound sends are agent-lane only"
      }
    ]
  });

  assert.deepEqual(result.undeclared, []);
  assert.deepEqual(result.stale, []);
  assert.equal(result.ok, true);
});

test("stale manifest entry fails: declared divergence no longer exists", () => {
  const result = compareSkillSets({
    agentsSkills: ["accessibility"],
    claudeSkills: ["accessibility"],
    manifestEntries: [
      {
        skill: "owner-outbound-batch",
        only_in: ".agents",
        reason: "no longer true"
      }
    ]
  });

  assert.deepEqual(result.undeclared, []);
  assert.deepEqual(result.stale, [
    { skill: "owner-outbound-batch", only_in: ".agents" }
  ]);
  assert.equal(result.ok, false);
});

test("wrong-side declaration is both undeclared and stale", () => {
  const result = compareSkillSets({
    agentsSkills: ["owner-reply-intake"],
    claudeSkills: [],
    manifestEntries: [
      {
        skill: "owner-reply-intake",
        only_in: ".claude",
        reason: "declared on the wrong side"
      }
    ]
  });

  assert.deepEqual(result.undeclared, [
    { skill: "owner-reply-intake", only_in: ".agents" }
  ]);
  assert.deepEqual(result.stale, [
    { skill: "owner-reply-intake", only_in: ".claude" }
  ]);
  assert.equal(result.ok, false);
});

test("divergence in .claude direction is detected too", () => {
  const result = compareSkillSets({
    agentsSkills: [],
    claudeSkills: ["claude-only-skill"],
    manifestEntries: []
  });

  assert.deepEqual(result.undeclared, [
    { skill: "claude-only-skill", only_in: ".claude" }
  ]);
});

test("manifest entries require skill, valid only_in, and a non-empty reason", () => {
  const errors = validateManifestEntries([
    { skill: "a", only_in: ".agents", reason: "fine" },
    { skill: "", only_in: ".agents", reason: "missing skill" },
    { skill: "b", only_in: "somewhere", reason: "bad side" },
    { skill: "c", only_in: ".claude", reason: "  " },
    { skill: "a", only_in: ".agents", reason: "duplicate of first" }
  ]);

  assert.equal(errors.length, 4);
  assert.ok(errors.some((message) => message.includes("skill")));
  assert.ok(errors.some((message) => message.includes("only_in")));
  assert.ok(errors.some((message) => message.includes("reason")));
  assert.ok(errors.some((message) => message.includes("duplicate")));
});

test("current repo state passes: every actual divergence is declared, no stale entries", () => {
  const result = runCheck(REPO_ROOT);

  assert.deepEqual(result.manifestErrors, []);
  assert.deepEqual(
    result.undeclared,
    [],
    `undeclared skill-dir divergence — declare it with a reason in .agents/skills-divergence.json: ${JSON.stringify(result.undeclared)}`
  );
  assert.deepEqual(
    result.stale,
    [],
    `stale manifest entries — the divergence no longer exists, remove them from .agents/skills-divergence.json: ${JSON.stringify(result.stale)}`
  );
  assert.equal(result.ok, true);
});
