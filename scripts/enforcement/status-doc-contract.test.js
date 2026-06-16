const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

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

test("repo instructions and next-batch skill use the single status contract", () => {
  const agents = read("AGENTS.md");
  const claude = read("CLAUDE.md");
  const skill = read(path.join(".agents", "skills", "next-batch-gate", "SKILL.md"));

  assert.equal(agents.includes("canonical reread handoff surface"), true);
  assert.equal(claude.includes("Reread Status Contract"), true);

  for (const status of allowedStatuses) {
    assert.equal(skill.includes(`\`${status}\``), true, `skill should mention status "${status}"`);
  }

  assert.equal(
    skill.includes("Return one verdict matching the repo contract"),
    true,
    "next-batch skill should align with the repo contract"
  );
});
