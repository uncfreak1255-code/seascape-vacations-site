const fs = require("fs");
const test = require("node:test");
const assert = require("node:assert/strict");

const { shouldBlockProtectedBranchCommit } = require("./pre-commit");

test("shouldBlockProtectedBranchCommit blocks sync-only protected branches", () => {
  assert.equal(shouldBlockProtectedBranchCommit("main"), true);
  assert.equal(shouldBlockProtectedBranchCommit("master"), true);
  assert.equal(shouldBlockProtectedBranchCommit("codex/repo-safety-hardening"), false);
});

test("guardrail config treats generated deploy output as non-source", () => {
  const config = JSON.parse(fs.readFileSync(".guardrails.json", "utf8"));

  assert.equal(config.generatedPaths.includes("_site/"), true);
});

test("legacy archival deploy tree stays deleted from version control", () => {
  // Removed 2026-07-24; scripts/enforcement/lib.js still bans the path as a
  // forbidden source so it cannot be reintroduced.
  assert.equal(fs.existsSync("DEPLOY THIS FOLDER TO NETLIFY"), false);
});
