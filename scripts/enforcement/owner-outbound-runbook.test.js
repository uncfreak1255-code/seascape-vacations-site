const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

test("owner outbound runbook exists and keeps sends out of the demand gate", () => {
  const runbook = read("docs/status/owner-outbound.md");

  assert.match(runbook, /^# Owner Outbound$/m);
  assert.match(runbook, /no sends authorized by this file alone/i);
  assert.match(runbook, /SENT means an outbound touch went to a named prospect/i);
  assert.match(runbook, /It proves only that the lane was executed/i);
  assert.match(runbook, /does not prove owner demand/i);
  assert.match(runbook, /test sends/i);
  assert.match(runbook, /labeled sends/i);
  assert.match(runbook, /internal helper submits/i);
});

test("owner outbound runbook defines the list milestone before the lead clock starts", () => {
  const runbook = read("docs/status/owner-outbound.md");

  assert.match(runbook, /Homeowner-List Milestone/);
  assert.match(runbook, /does not start its time-to-first-lead clock/i);
  assert.match(runbook, /at least `10` named homeowner-reachable prospects/i);
  assert.match(runbook, /contact path that another agent can re-open/i);
  assert.match(runbook, /no scraped or guessed private contact data/i);
  assert.match(runbook, /no send scheduled from research alone/i);
});

test("owner outbound runbook routes real demand proof to the hub register only after validation", () => {
  const runbook = read("docs/status/owner-outbound.md");

  assert.match(runbook, /Gate 2: REAL Reply/);
  assert.match(runbook, /owner-demand-trust-outcome-register\.md/);
  assert.match(runbook, /dated interaction or receipt window/i);
  assert.match(runbook, /owner pain or objection/i);
  assert.match(runbook, /evidence path another agent can re-open/i);
  assert.match(runbook, /Email-origin demand is provisional/i);
  assert.match(runbook, /Do not paste private email content/i);
});

test("owner outbound runbook keeps generated receipt projection read-only", () => {
  const runbook = read("docs/status/owner-outbound.md");

  assert.match(runbook, /Do not edit the generated `owner-receipt-projection` block by hand/);
  assert.match(runbook, /hand-authored `## Register` section is the only durable destination/);
});

test("owner outbound runbook includes effect and decay stops", () => {
  const runbook = read("docs/status/owner-outbound.md");

  assert.match(runbook, /After two batches that actually went out and got zero real replies/i);
  assert.match(runbook, /If zero sends happened, do not call that channel failure/i);
  assert.match(runbook, /Current lane state: `(not started|ready|sent-no-reply|reply-qualified|teardown-complete|decayed)`/);
  assert.match(runbook, /does not authorize a send, count\s+as demand, or create a Hub register row/i);
  assert.match(runbook, /`decayed`: no real send or update for `3` consecutive weeks/i);
});
