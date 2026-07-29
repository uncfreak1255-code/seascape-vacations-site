// Tests for the Stop-hook proof gate.
//
// The gate turns "the agent says it is done" into "the repo's own declared
// test command passed, and here is a receipt pinned to the commit". It must
// block a stop when proof is absent or failing, and it must stay cheap on the
// conversational turns that changed nothing.

const test = require("node:test");
const assert = require("node:assert/strict");

const { evaluateStop, buildReceipt } = require("./proof-gate.js");

const HEAD = "a".repeat(40);
const BASE = "b".repeat(40);

function fixture(overrides = {}) {
  return {
    payload: {},
    config: { testCommand: "npm test" },
    dirty: true,
    headSha: HEAD,
    baseSha: BASE,
    runner: () => ({ status: 0, output: "713 passing" }),
    ...overrides,
  };
}

test("loop guard: never blocks twice for the same stop", () => {
  const result = evaluateStop(fixture({ payload: { stop_hook_active: true } }));
  assert.equal(result.block, false);
  assert.equal(result.ranTests, false);
  assert.match(result.message, /already retried/i);
});

test("clean tree is a no-op: does not spend 30s proving nothing changed", () => {
  let called = false;
  const result = evaluateStop(fixture({
    dirty: false,
    runner: () => { called = true; return { status: 0, output: "" }; },
  }));
  assert.equal(result.block, false);
  assert.equal(result.ranTests, false);
  assert.equal(called, false, "test command must not run when nothing changed");
});

test("empty testCommand does not silently pass as proof", () => {
  // landing-evaluator's requiredProofCommands() returns [] for an empty
  // testCommand, which makes the receipt vacuously valid. The gate must say so
  // out loud rather than emitting a receipt that proves nothing.
  const result = evaluateStop(fixture({ config: { testCommand: "" } }));
  assert.equal(result.block, false);
  assert.equal(result.wroteReceipt, false);
  assert.match(result.message, /no testCommand/i);
});

test("failing tests block the stop", () => {
  const result = evaluateStop(fixture({
    runner: () => ({ status: 1, output: "1 failing" }),
  }));
  assert.equal(result.block, true);
  assert.equal(result.receipt.status, "fail");
  assert.match(result.message, /npm test/);
});

test("passing tests allow the stop and emit an evaluator-shaped receipt", () => {
  const result = evaluateStop(fixture());
  assert.equal(result.block, false);
  assert.equal(result.wroteReceipt, true);
  assert.equal(result.receipt.status, "pass");
});

test("receipt matches the shape landing-evaluator accepts", () => {
  // Mirrors evaluateProof(): version === 1, status === "pass", headSha/baseSha
  // must equal the snapshot, and steps must contain a passing entry whose
  // command is byte-identical to .guardrails.json testCommand.
  const receipt = buildReceipt({
    command: "npm test",
    status: 0,
    headSha: HEAD,
    baseSha: BASE,
  });

  assert.equal(receipt.version, 1);
  assert.equal(receipt.status, "pass");
  assert.equal(receipt.headSha, HEAD);
  assert.equal(receipt.baseSha, BASE);

  const hasPassingCommand = receipt.steps.some(
    (step) => step && step.command === "npm test" && step.status === "pass",
  );
  assert.equal(hasPassingCommand, true, "landing-evaluator would reject this receipt");
});

test("a failing run is never recorded as a passing step", () => {
  const receipt = buildReceipt({
    command: "npm test",
    status: 1,
    headSha: HEAD,
    baseSha: BASE,
  });
  assert.equal(receipt.status, "fail");
  assert.equal(receipt.steps[0].status, "fail");
});
