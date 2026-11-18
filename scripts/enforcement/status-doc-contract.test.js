const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { MAX_BYTES } = require("./check-staged-file-size");
const { uncitedAnalyticsLines } = require("./sync-next-batch-from-analytics-receipt");

const projectRoot = path.resolve(__dirname, "..", "..");
const allowedStatuses = [
  "blocked by freshness",
  "fresh but below threshold",
  "open next batch"
];

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function matchAll(text, pattern) {
  return [...text.matchAll(pattern)];
}

test("next-batch declares exactly one allowed reread status and one concrete next move", () => {
  const nextBatch = read(path.join("docs", "status", "next-batch.md"));

  const statusMatches = matchAll(nextBatch, /^- Reread status:\s*`([^`]+)`\.\s*$/gm);
  assert.equal(statusMatches.length, 1, "next-batch should declare exactly one reread status");
  assert.ok(
    allowedStatuses.includes(statusMatches[0][1]),
    `reread status must be one of: ${allowedStatuses.join(", ")}`
  );

  const nextMoveMatches = matchAll(nextBatch, /^- Concrete next move:\s*(.+)$/gm);
  assert.equal(nextMoveMatches.length, 1, "next-batch should declare exactly one concrete next move");
  assert.match(nextMoveMatches[0][1], /\S/, "concrete next move should not be empty");
});

test("next-batch documents the only allowed reread statuses", () => {
  const nextBatch = read(path.join("docs", "status", "next-batch.md"));

  for (const status of allowedStatuses) {
    assert.equal(
      nextBatch.includes(`- \`${status}\``),
      true,
      `next-batch should document the allowed status "${status}"`
    );
  }
});

test("next-batch contract points updates through the analytics receipt sync script", () => {
  const nextBatch = read(path.join("docs", "status", "next-batch.md"));
  const syncScript = read(path.join("scripts", "enforcement", "sync-next-batch-from-analytics-receipt.js"));

  assert.equal(
    nextBatch.includes("sync-next-batch-from-analytics-receipt.js"),
    true,
    "next-batch should name the receipt sync script instead of inviting hand-written status updates"
  );
  assert.equal(
    syncScript.includes("receipt_type next_batch_decision"),
    true,
    "sync script should validate next_batch_decision receipts"
  );
});

test("the current analytics read is cited or explicitly marked historical and unverified", () => {
  const nextBatch = read("docs/status/next-batch.md");
  const activeRead = nextBatch.match(/## Latest Execution Read\n([\s\S]*?)\n## Likely Priorities/);
  assert.ok(activeRead, "next-batch should contain the active execution read");
  const cited = /^- Evidence for this read: \[Analytics receipt\]\(https:\/\/github\.com\/uncfreak1255-code\/seascape-analytics\/blob\/[a-f0-9]{40}\/docs\/status\/[A-Za-z0-9_.-]+\.json\)/m.test(activeRead[1]);
  // Preserve only the unchanged pre-existing unverified block; any later edit
  // must replace it with a sourced read instead of adding unsupported claims.
  const legacy = createHash("sha256").update(activeRead[1]).digest("hex") ===
    "827a5c38c2a8835525929b4c59c0f5ff4ab12da6b285f80303c8cbd2c8f2e146";
  assert.ok(cited || legacy, "a new analytics read needs a commit-pinned receipt");
  if (cited) assert.deepEqual(uncitedAnalyticsLines(activeRead[1]), [], "active analytics claims and tables must cite their receipt");
});

test("each active traffic claim and numeric metrics table has a receipt", () => {
  const url = `https://github.com/uncfreak1255-code/seascape-analytics/blob/${"a".repeat(40)}/docs/status/decision.json`;
  const cited = `[Analytics receipt](${url})`;
  assert.deepEqual(uncitedAnalyticsLines(`- Guide has 3 sessions. ${cited}\n\nCluster evidence ${cited}\n\n| cluster | sessions |\n|---|---:|\n| guide | 3 |`), []);
  assert.deepEqual(uncitedAnalyticsLines(`- Guide has 3 sessions. ${cited}\n- Another guide has 2 clicks.`), ["- Another guide has 2 clicks."]);
  assert.deepEqual(uncitedAnalyticsLines(`Cluster evidence\n\n| cluster | sessions |\n|---|---:|\n| guide | 3 |`), ["| cluster | sessions |"]);
});

test("next-batch warns near the staged-file size limit", (t) => {
  const remaining = MAX_BYTES - fs.statSync(path.join(projectRoot, "docs/status/next-batch.md")).size;
  if (remaining <= 500) {
    t.diagnostic(`next-batch.md is ${remaining} bytes from the staged-file limit; move dated detail to docs/status/next-batch-history.md`);
  }
});

test("current-state defers volatile reread detail to next-batch", () => {
  const currentState = read(path.join("docs", "status", "current-state.md"));

  assert.equal(
    currentState.includes("`docs/status/next-batch.md` is the canonical operator-read status surface"),
    true,
    "current-state should point to next-batch as the canonical reread surface"
  );
  assert.equal(
    /BigQuery GSC data was current only through/i.test(currentState),
    false,
    "current-state should not duplicate stale blocked-window narration"
  );
  assert.equal(
    /latest GSC-covered 7-day fallback window/i.test(currentState),
    false,
    "current-state should not duplicate volatile fallback window detail"
  );
});

test("open risks preserves the GSC Pages export boundary for per-URL index claims", () => {
  const openRisks = read(path.join("docs", "status", "open-risks.md"));

  assert.match(openRisks, /GSC Pages export gap/i);
  assert.match(openRisks, /GSC Pages/i);
  assert.match(openRisks, /rank-tracker-latest\.md/);
  assert.match(openRisks, /docs\/status\/next-batch\.md/);
  assert.match(openRisks, /seascape-analytics/);
});

test("repo instructions and next-batch skill use the single status contract", () => {
  const agents = read("AGENTS.md");
  const claude = read("CLAUDE.md");
  const skill = read(path.join(".agents", "skills", "next-batch-gate", "SKILL.md"));

  assert.equal(agents.includes("canonical reread handoff surface"), true);
  assert.equal(
    claude.includes("Reread Status Contract") || claude.includes("Read `AGENTS.md` first. It is canonical"),
    true
  );

  for (const status of allowedStatuses) {
    assert.equal(skill.includes(`\`${status}\``), true, `skill should mention status "${status}"`);
  }

  assert.equal(
    skill.includes("Return one verdict matching the repo contract"),
    true,
    "next-batch skill should align with the repo contract"
  );
});

test("a hold verdict still requires a completed attack lane", () => {
  const workflow = read(path.join("docs", "process", "batch-workflow.md"));
  const searchOperator = read(path.join(".claude", "agents", "search-operator.md"));
  const briefTemplate = read(path.join("docs", "briefs", "_template.md"));

  assert.match(workflow, /`hold` is incomplete/i);
  assert.match(searchOperator, /none found after named checks/i);
  assert.match(searchOperator, /current\s+source, SERP evidence, and competitor pages/i);
  assert.match(briefTemplate, /Competitor URLs inspected/i);
  assert.match(briefTemplate, /Design\/format strategy/i);
  assert.match(briefTemplate, /Tools\/plugins used/i);
});

test("active pool-heat instructions preserve the cap and property exceptions", () => {
  const nextBatch = read("docs/status/next-batch.md");
  const plan = read("docs/plans/2026-11-content-priorities.md");
  assert.match(nextBatch, /docs\/plans\/2026-11-content-priorities\.md/);
  for (const text of [nextBatch, plan]) {
    assert.doesNotMatch(text, /never included|optional extra at \*\*every managed home\*\*/i);
    assert.match(text, /Coastal/);
    assert.match(text, /\$280/);
  }
  assert.match(plan, /automatically.*unless.*declines/);
  assert.match(plan, /long-stay flat rates/);
  assert.match(plan, /already-confirmed reservation inclusions/);
  assert.match(plan, /property-pool-heat-invariants\.test\.js/);
});
