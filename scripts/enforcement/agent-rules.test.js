const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const claudeRulesDir = path.join(projectRoot, ".claude", "rules");
const sharedRulesDir = path.join(projectRoot, "docs", "agents", "rules");

// Claude loads .claude/rules/*.md on a matching file read; Codex reaches the same
// text only through the AGENTS.md pointer. An @import inside a rule loads at
// session start, so each rule must stay a symlink to its shared file.
test("every Claude rule is a path-scoped symlink to a shared rule that AGENTS.md names", () => {
  const agents = fs.readFileSync(path.join(projectRoot, "AGENTS.md"), "utf8");
  const claudeRules = fs.readdirSync(claudeRulesDir).filter((name) => name.endsWith(".md")).sort();
  const sharedRules = fs.readdirSync(sharedRulesDir).filter((name) => name.endsWith(".md")).sort();

  assert.ok(claudeRules.length > 0, "expected at least one .claude/rules entry");
  assert.deepEqual(claudeRules, sharedRules, ".claude/rules and docs/agents/rules must hold the same rule names");

  for (const name of claudeRules) {
    const link = path.join(claudeRulesDir, name);
    assert.ok(fs.lstatSync(link).isSymbolicLink(), `.claude/rules/${name} must be a symlink`);
    assert.equal(fs.readlinkSync(link), `../../docs/agents/rules/${name}`);

    const body = fs.readFileSync(path.join(sharedRulesDir, name), "utf8");
    assert.match(body, /^---\npaths:\n(?:  - "[^"]+"\n)+---\n/, `${name} needs paths: frontmatter`);
    assert.doesNotMatch(body, /^@/m, `${name} must not @import (imports load at session start)`);
    assert.ok(agents.includes(`docs/agents/rules/${name}`), `AGENTS.md must point to docs/agents/rules/${name}`);
  }
});
