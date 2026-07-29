// Tests for the Stop-hook proof gate.
//
// The gate turns "the agent says it is done" into "the repo's own declared
// test command passed, and here is a receipt pinned to the commit". It must
// block a stop when proof is absent or failing, and it must stay cheap on the
// conversational turns that changed nothing.

const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  evaluateStop,
  buildReceipt,
  invalidateHeadReceipt,
} = require("./proof-gate.js");

const HEAD = "a".repeat(40);
const BASE = "b".repeat(40);

function fixture(overrides = {}) {
  return {
    payload: {},
    config: { testCommand: "npm test" },
    dirty: true,
    worktreeDirty: false,
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

test("passing dirty-tree tests do not emit a receipt falsely pinned to HEAD", () => {
  const result = evaluateStop(fixture({ worktreeDirty: true }));
  assert.equal(result.block, false);
  assert.equal(result.ranTests, true);
  assert.equal(result.wroteReceipt, false);
  assert.match(result.message, /worktree is dirty/i);
  assert.match(result.message, /No HEAD-pinned receipt/i);
});

test("failing dirty-tree tests still block and do not emit a HEAD receipt", () => {
  const result = evaluateStop(fixture({
    worktreeDirty: true,
    runner: () => ({ status: 1, output: "1 failing" }),
  }));
  assert.equal(result.block, true);
  assert.equal(result.ranTests, true);
  assert.equal(result.wroteReceipt, false);
  assert.equal(result.receipt.status, "fail");
});

test("a dirty-tree run invalidates a stale receipt for the same HEAD", (t) => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "proof-gate-"));
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));

  const receiptDir = path.join(projectRoot, ".guardrails", "receipts");
  const receiptPath = path.join(receiptDir, `proof-${HEAD}.json`);
  fs.mkdirSync(receiptDir, { recursive: true });
  fs.writeFileSync(receiptPath, "{\"status\":\"pass\"}\n");

  invalidateHeadReceipt(projectRoot, HEAD);
  assert.equal(fs.existsSync(receiptPath), false);

  assert.doesNotThrow(() => invalidateHeadReceipt(projectRoot, HEAD));
});

test("CLI with a dirty fresh clone passes tests but removes and writes no HEAD receipt", (t) => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "proof-gate-cli-"));
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));

  const scriptDir = path.join(projectRoot, "scripts", "enforcement");
  fs.mkdirSync(scriptDir, { recursive: true });
  fs.copyFileSync(
    path.join(__dirname, "proof-gate.js"),
    path.join(scriptDir, "proof-gate.js"),
  );
  fs.writeFileSync(
    path.join(projectRoot, ".guardrails.json"),
    `${JSON.stringify({ testCommand: "node -e \"process.exit(0)\"" })}\n`,
  );
  fs.writeFileSync(path.join(projectRoot, "tracked.txt"), "committed\n");

  for (const args of [
    ["init"],
    ["config", "user.email", "proof-gate@example.test"],
    ["config", "user.name", "Proof Gate Test"],
    ["add", "."],
    ["commit", "-m", "fixture"],
  ]) {
    const git = spawnSync("git", args, { cwd: projectRoot, encoding: "utf8" });
    assert.equal(git.status, 0, git.stderr);
  }

  const headSha = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: projectRoot,
    encoding: "utf8",
  }).stdout.trim();
  const receiptDir = path.join(projectRoot, ".guardrails", "receipts");
  const receiptPath = path.join(receiptDir, `proof-${headSha}.json`);
  fs.mkdirSync(receiptDir, { recursive: true });
  fs.writeFileSync(receiptPath, "{\"status\":\"pass\"}\n");
  fs.writeFileSync(path.join(projectRoot, "tracked.txt"), "dirty\n");

  const gate = spawnSync(process.execPath, [path.join(scriptDir, "proof-gate.js")], {
    cwd: projectRoot,
    encoding: "utf8",
    input: "{}",
  });

  assert.equal(gate.status, 0, gate.stderr);
  assert.match(gate.stderr, /worktree is dirty/i);
  assert.equal(fs.existsSync(receiptPath), false);
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

test("prefers .keel/verify over testCommand when the repo declares one", () => {
  // The repo has already declared its proof command. .guardrails.json's
  // testCommand (`npm test`) is a strict subset of it, so running the narrower
  // command would record a receipt that proves less than the repo asks for.
  const ran = [];
  const result = evaluateStop(fixture({
    keelVerify: "npm run lint:content && npm test && npm run verify:links",
    runner: (command) => { ran.push(command); return { status: 0, output: "ok" }; },
  }));

  assert.deepEqual(ran, ["npm run lint:content && npm test && npm run verify:links"]);
  assert.equal(result.receipt.status, "pass");
});

test("keel receipt still satisfies landing-evaluator's required testCommand", () => {
  // requiredProofCommands() demands a passing step whose command is
  // byte-identical to testCommand. When the keel chain provably contains and
  // passed it, record it explicitly so the evaluator is satisfied honestly.
  const result = evaluateStop(fixture({
    keelVerify: "npm run lint:content && npm test && npm run verify:links",
    runner: () => ({ status: 0, output: "ok" }),
  }));

  const hasTestCommand = result.receipt.steps.some(
    (step) => step.command === "npm test" && step.status === "pass",
  );
  assert.equal(hasTestCommand, true, "landing-evaluator would report PROOF_MISSING");
});

test("does not fabricate a testCommand step when keel does not contain it", () => {
  const result = evaluateStop(fixture({
    keelVerify: "make check",
    runner: () => ({ status: 0, output: "ok" }),
  }));

  const fabricated = result.receipt.steps.some((step) => step.command === "npm test");
  assert.equal(fabricated, false, "must never claim a command ran that did not");
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
