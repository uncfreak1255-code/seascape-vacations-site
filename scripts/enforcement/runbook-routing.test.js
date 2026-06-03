const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

const REQUIRED_RUNBOOKS = [
  {
    path: "docs/runbooks/release-incident.md",
    heading: /^# Release Incident$/m
  },
  {
    path: "docs/runbooks/failed-netlify-deploy.md",
    heading: /^# Failed Netlify Deploy$/m
  },
  {
    path: "docs/runbooks/failed-schema-smoke.md",
    heading: /^# Failed Schema Smoke$/m
  },
  {
    path: "docs/runbooks/failed-visual-gate.md",
    heading: /^# Failed Visual Gate$/m
  },
  {
    path: "docs/runbooks/stale-analytics-receipt.md",
    heading: /^# Stale Analytics Receipt$/m
  },
  {
    path: "docs/runbooks/legal-approval-blocked.md",
    heading: /^# Legal Approval Blocked$/m
  }
];

test("runbook index lists the required failure runbooks", () => {
  const index = read("docs/runbooks/README.md");

  for (const runbook of REQUIRED_RUNBOOKS) {
    assert.match(index, new RegExp(runbook.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("required runbook files exist with stable headings", () => {
  for (const runbook of REQUIRED_RUNBOOKS) {
    const contents = read(runbook.path);
    assert.match(contents, runbook.heading, `${runbook.path} should keep its top-level heading`);
  }
});

test("release and analytics workflow docs route failures to the runbooks", () => {
  const releaseGate = read(".claude/agents/release-gate.md");
  const beforeUserReview = read("docs/process/before-user-review-checklist.md");
  const beforeMerge = read("docs/process/before-merge-checklist.md");
  const postMerge = read("docs/process/post-merge-runtime-proof-checklist.md");
  const releaseCheatSheet = read("docs/process/git-release-cheat-sheet.md");
  const aiAudit = read("docs/process/ai-citation-audit-usage.md");

  assert.match(releaseGate, /docs\/runbooks\/README\.md/);
  assert.match(releaseGate, /docs\/runbooks\//);
  assert.match(beforeUserReview, /docs\/runbooks\/failed-visual-gate\.md/);
  assert.match(beforeMerge, /docs\/runbooks\/failed-schema-smoke\.md/);
  assert.match(beforeMerge, /docs\/runbooks\/failed-visual-gate\.md/);
  assert.match(beforeMerge, /docs\/runbooks\/legal-approval-blocked\.md/);
  assert.match(postMerge, /docs\/runbooks\/failed-netlify-deploy\.md/);
  assert.match(postMerge, /docs\/runbooks\/release-incident\.md/);
  assert.match(releaseCheatSheet, /docs\/runbooks\/failed-netlify-deploy\.md/);
  assert.match(releaseCheatSheet, /docs\/runbooks\/release-incident\.md/);
  assert.match(aiAudit, /docs\/runbooks\/stale-analytics-receipt\.md/);
});
