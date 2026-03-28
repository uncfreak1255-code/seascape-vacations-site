const test = require("node:test");
const assert = require("node:assert/strict");

const { buildVerificationPlan } = require("./pre-push");

test("buildVerificationPlan escalates branch pushes with deploy-sensitive changes", () => {
  const plan = buildVerificationPlan({
    refs: [
      {
        localRef: "refs/heads/codex/pre-push-release-gate",
        localSha: "abc123",
        remoteRef: "refs/heads/codex/pre-push-release-gate",
        remoteSha: "0000000000000000000000000000000000000000"
      }
    ],
    changedFiles: ["src/guides/bradenton-area-guide/index.html", "docs/process/git-session-rules.md"],
    range: "origin/main...HEAD"
  });

  assert.equal(plan.fullVerificationReason, "deploy-sensitive changes detected");
  assert.deepEqual(plan.deploySensitivePaths, ["src/guides/bradenton-area-guide/index.html"]);
  assert.deepEqual(plan.commands, [
    {
      command: "node",
      args: ["scripts/enforcement/verify-release.js", "--paths-only", "--range", "origin/main...HEAD"]
    },
    {
      command: "node",
      args: ["scripts/enforcement/verify-release.js", "--range", "origin/main...HEAD"]
    }
  ]);
});

test("buildVerificationPlan keeps docs-only branch pushes on path checks", () => {
  const plan = buildVerificationPlan({
    refs: [
      {
        localRef: "refs/heads/codex/pre-push-release-gate",
        localSha: "abc123",
        remoteRef: "refs/heads/codex/pre-push-release-gate",
        remoteSha: "0000000000000000000000000000000000000000"
      }
    ],
    changedFiles: ["docs/process/git-session-rules.md", "rank-tracker-latest.md"],
    range: "origin/main...HEAD"
  });

  assert.equal(plan.fullVerificationReason, null);
  assert.deepEqual(plan.deploySensitivePaths, []);
  assert.deepEqual(plan.commands, [
    {
      command: "node",
      args: ["scripts/enforcement/verify-release.js", "--paths-only", "--range", "origin/main...HEAD"]
    }
  ]);
});

test("buildVerificationPlan still escalates protected main pushes", () => {
  const plan = buildVerificationPlan({
    refs: [
      {
        localRef: "refs/heads/codex/pre-push-release-gate",
        localSha: "abc123",
        remoteRef: "refs/heads/main",
        remoteSha: "def456"
      }
    ],
    changedFiles: ["docs/process/git-session-rules.md"],
    range: "origin/main...HEAD"
  });

  assert.equal(plan.fullVerificationReason, "protected main push detected");
  assert.deepEqual(plan.deploySensitivePaths, []);
  assert.deepEqual(plan.commands, [
    {
      command: "node",
      args: ["scripts/enforcement/verify-release.js", "--paths-only", "--range", "origin/main...HEAD"]
    },
    {
      command: "node",
      args: ["scripts/enforcement/verify-release.js", "--range", "origin/main...HEAD"]
    }
  ]);
});
