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
  outputTail,
  receiptProves,
  writeHeadReceipt,
  worktreeIsDirty,
  worktreeFingerprint,
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

function runGit(projectRoot, args) {
  const git = spawnSync("git", args, { cwd: projectRoot, encoding: "utf8" });
  assert.equal(git.status, 0, git.stderr);
  return git.stdout.trim();
}

function createCliRepo(t, testCommand) {
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
    `${JSON.stringify({ testCommand })}\n`,
  );
  fs.writeFileSync(path.join(projectRoot, ".gitignore"), ".guardrails/receipts\n");
  fs.writeFileSync(path.join(projectRoot, "tracked.txt"), "committed\n");

  runGit(projectRoot, ["init"]);
  runGit(projectRoot, ["config", "user.email", "proof-gate@example.test"]);
  runGit(projectRoot, ["config", "user.name", "Proof Gate Test"]);
  runGit(projectRoot, ["add", "."]);
  runGit(projectRoot, ["commit", "-m", "fixture"]);

  return {
    projectRoot,
    scriptDir,
    headSha: runGit(projectRoot, ["rev-parse", "HEAD"]),
  };
}

function runGate({ projectRoot, scriptDir }, payload = {}) {
  return spawnSync(process.execPath, [path.join(scriptDir, "proof-gate.js")], {
    cwd: projectRoot,
    encoding: "utf8",
    input: JSON.stringify(payload),
  });
}

test("loop guard: never blocks twice for the same stop", () => {
  const result = evaluateStop(fixture({ payload: { stop_hook_active: true } }));
  assert.equal(result.block, false);
  assert.equal(result.ranTests, false);
  assert.match(result.message, /already retried/i);
});

test("loop retry with changed tree state runs proof again", () => {
  let called = false;
  const result = evaluateStop(fixture({
    payload: { stop_hook_active: true },
    loopStateUnchanged: false,
    runner: () => {
      called = true;
      return { status: 1, output: "still failing" };
    },
  }));
  assert.equal(called, true);
  assert.equal(result.block, true);
  assert.match(result.message, /proof-failed/i);
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

test("valid proof for the same clean head and merge base is reused", () => {
  let called = false;
  const existingReceipt = buildReceipt({
    command: "npm test",
    status: 0,
    headSha: HEAD,
    baseSha: BASE,
  });
  const result = evaluateStop(fixture({
    existingReceipt,
    runner: () => {
      called = true;
      return { status: 0, output: "" };
    },
  }));

  assert.equal(result.block, false);
  assert.equal(result.ranTests, false);
  assert.equal(result.wroteReceipt, false);
  assert.equal(called, false);
  assert.match(result.message, /reusing/i);
});

test("proof for a different merge base is not reused", () => {
  let called = false;
  const existingReceipt = buildReceipt({
    command: "npm test",
    status: 0,
    headSha: HEAD,
    baseSha: "c".repeat(40),
  });
  const result = evaluateStop(fixture({
    existingReceipt,
    runner: () => {
      called = true;
      return { status: 0, output: "fresh proof" };
    },
  }));

  assert.equal(called, true);
  assert.equal(result.ranTests, true);
  assert.equal(result.wroteReceipt, true);
});

test("proof run that dirties a clean tree cannot emit a HEAD receipt", () => {
  const result = evaluateStop(fixture({
    inspectWorktree: () => true,
  }));

  assert.equal(result.block, true);
  assert.equal(result.loopRetryable, false);
  assert.equal(result.ranTests, true);
  assert.equal(result.wroteReceipt, false);
  assert.match(result.message, /proof-receipt-unavailable/i);
  assert.match(result.message, /repository changed while proof ran/i);
});

test("every actual proof rerun invalidates the existing receipt first", () => {
  const events = [];
  const result = evaluateStop(fixture({
    existingReceipt: buildReceipt({
      command: "old proof command",
      status: 0,
      headSha: HEAD,
      baseSha: BASE,
    }),
    beforeRun: () => events.push("invalidate"),
    runner: () => {
      events.push("run");
      return { status: 1, output: "failed" };
    },
  }));

  assert.deepEqual(events, ["invalidate", "run"]);
  assert.equal(result.block, true);
  assert.equal(result.receipt.status, "fail");
});

test("receipt invalidation failures remain blocking and are never loop-retryable", () => {
  const result = evaluateStop(fixture({
    beforeRun: () => {
      throw new Error("read-only receipt directory");
    },
  }));

  assert.equal(result.block, true);
  assert.equal(result.loopRetryable, false);
  assert.equal(result.ranTests, false);
  assert.match(result.message, /proof-receipt-invalidation-failed/i);
});

test("passing dirty-tree tests do not emit a receipt falsely pinned to HEAD", () => {
  const result = evaluateStop(fixture({ worktreeDirty: true }));
  assert.equal(result.block, true);
  assert.equal(result.loopRetryable, false);
  assert.equal(result.ranTests, true);
  assert.equal(result.wroteReceipt, false);
  assert.match(result.message, /proof-receipt-unavailable/i);
  assert.match(result.message, /worktree is dirty/i);
  assert.match(result.message, /No HEAD-pinned receipt/i);
});

test("unresolved base still runs proof but cannot emit a base-bound receipt", () => {
  const result = evaluateStop(fixture({ baseResolved: false }));
  assert.equal(result.block, true);
  assert.equal(result.loopRetryable, false);
  assert.equal(result.ranTests, true);
  assert.equal(result.wroteReceipt, false);
  assert.match(result.message, /proof-receipt-unavailable/i);
  assert.match(result.message, /base ref is unavailable/i);
  assert.match(result.message, /No base-bound receipt/i);
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
  const repo = createCliRepo(t, "node -e \"process.exit(0)\"");
  const { projectRoot, headSha } = repo;
  runGit(projectRoot, ["update-ref", "refs/remotes/origin/main", "HEAD"]);
  const receiptDir = path.join(projectRoot, ".guardrails", "receipts");
  const receiptPath = path.join(receiptDir, `proof-${headSha}.json`);
  fs.mkdirSync(receiptDir, { recursive: true });
  fs.writeFileSync(receiptPath, "{\"status\":\"pass\"}\n");

  const cleanFingerprint = worktreeFingerprint(projectRoot, headSha);
  fs.writeFileSync(path.join(projectRoot, "tracked.txt"), "dirty\n");
  const dirtyFingerprint = worktreeFingerprint(projectRoot, headSha);
  assert.notEqual(dirtyFingerprint, cleanFingerprint);

  const gate = runGate(repo);

  assert.equal(gate.status, 2, gate.stderr);
  assert.match(gate.stderr, /proof-receipt-unavailable/i);
  assert.match(gate.stderr, /worktree is dirty/i);
  assert.equal(fs.existsSync(receiptPath), false);

  const unchangedRetry = runGate(repo, { stop_hook_active: true });
  assert.equal(unchangedRetry.status, 2, unchangedRetry.stderr);
  assert.match(unchangedRetry.stderr, /proof-receipt-unavailable/i);
  assert.doesNotMatch(unchangedRetry.stderr, /already retried/i);
});

test("untracked files stay dirty when status.showUntrackedFiles is disabled", (t) => {
  const repo = createCliRepo(t, "node -e \"process.exit(0)\"");
  runGit(repo.projectRoot, ["update-ref", "refs/remotes/origin/main", "HEAD"]);
  runGit(repo.projectRoot, ["config", "status.showUntrackedFiles", "no"]);
  fs.writeFileSync(path.join(repo.projectRoot, "untracked-source.js"), "changed\n");

  assert.equal(worktreeIsDirty(repo.projectRoot), true);
  const gate = runGate(repo);
  assert.equal(gate.status, 2, gate.stderr);
  assert.match(gate.stderr, /proof-receipt-unavailable/i);
  assert.match(gate.stderr, /worktree is dirty/i);
  assert.equal(
    fs.existsSync(
      path.join(
        repo.projectRoot,
        ".guardrails",
        "receipts",
        `proof-${repo.headSha}.json`,
      ),
    ),
    false,
  );
});

test("CLI re-proves an edited retry, then bypasses only the unchanged failure", (t) => {
  const repo = createCliRepo(t, "node -e \"process.exit(1)\"");
  runGit(repo.projectRoot, ["update-ref", "refs/remotes/origin/main", "HEAD"]);

  fs.writeFileSync(path.join(repo.projectRoot, "tracked.txt"), "first edit\n");
  const first = runGate(repo);
  assert.equal(first.status, 2, first.stderr);

  fs.writeFileSync(path.join(repo.projectRoot, "tracked.txt"), "second edit\n");
  const editedRetry = runGate(repo, { stop_hook_active: true });
  assert.equal(editedRetry.status, 2, editedRetry.stderr);
  assert.match(editedRetry.stderr, /proof-failed/i);
  assert.doesNotMatch(editedRetry.stderr, /already retried/i);

  const unchangedRetry = runGate(repo, { stop_hook_active: true });
  assert.equal(unchangedRetry.status, 0, unchangedRetry.stderr);
  assert.match(unchangedRetry.stderr, /already retried/i);
});

test("CLI treats a clean checkout with no configured base ref as needing proof", (t) => {
  const repo = createCliRepo(t, "node -e \"process.exit(0)\"");
  const receiptPath = path.join(
    repo.projectRoot,
    ".guardrails",
    "receipts",
    `proof-${repo.headSha}.json`,
  );

  const gate = runGate(repo);
  assert.equal(gate.status, 2, gate.stderr);
  assert.match(gate.stderr, /proof-receipt-unavailable/i);
  assert.match(gate.stderr, /base ref is unavailable/i);
  assert.equal(fs.existsSync(receiptPath), false);
});

test("CLI receipt records the merge base when origin/main has advanced", (t) => {
  const repo = createCliRepo(t, "node -e \"process.exit(0)\"");
  const branchPoint = repo.headSha;

  runGit(repo.projectRoot, ["checkout", "-b", "feature"]);
  fs.writeFileSync(path.join(repo.projectRoot, "tracked.txt"), "feature\n");
  runGit(repo.projectRoot, ["add", "tracked.txt"]);
  runGit(repo.projectRoot, ["commit", "-m", "feature"]);
  const featureHead = runGit(repo.projectRoot, ["rev-parse", "HEAD"]);

  runGit(repo.projectRoot, ["checkout", "-b", "advanced-main", branchPoint]);
  fs.writeFileSync(path.join(repo.projectRoot, "main.txt"), "main advanced\n");
  runGit(repo.projectRoot, ["add", "main.txt"]);
  runGit(repo.projectRoot, ["commit", "-m", "advance main"]);
  const mainTip = runGit(repo.projectRoot, ["rev-parse", "HEAD"]);
  runGit(repo.projectRoot, ["update-ref", "refs/remotes/origin/main", mainTip]);
  runGit(repo.projectRoot, ["checkout", "feature"]);

  const gate = runGate(repo);
  assert.equal(gate.status, 0, gate.stderr);

  const receipt = JSON.parse(
    fs.readFileSync(
      path.join(
        repo.projectRoot,
        ".guardrails",
        "receipts",
        `proof-${featureHead}.json`,
      ),
      "utf8",
    ),
  );
  assert.equal(receipt.headSha, featureHead);
  assert.equal(receipt.baseSha, branchPoint);
  assert.notEqual(receipt.baseSha, mainTip);
});

test("CLI reuses an evaluator-valid receipt for an unchanged feature head", (t) => {
  const command = "node -e \"process.exit(0)\"";
  const repo = createCliRepo(t, command);
  const baseSha = repo.headSha;
  runGit(repo.projectRoot, ["update-ref", "refs/remotes/origin/main", baseSha]);

  fs.writeFileSync(path.join(repo.projectRoot, "tracked.txt"), "feature\n");
  runGit(repo.projectRoot, ["add", "tracked.txt"]);
  runGit(repo.projectRoot, ["commit", "-m", "feature"]);
  const headSha = runGit(repo.projectRoot, ["rev-parse", "HEAD"]);
  const receiptPath = path.join(
    repo.projectRoot,
    ".guardrails",
    "receipts",
    `proof-${headSha}.json`,
  );
  fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
  const existingReceipt = buildReceipt({
    command,
    status: 0,
    headSha,
    baseSha,
    output: "sentinel proof",
  });
  fs.writeFileSync(receiptPath, `${JSON.stringify(existingReceipt, null, 2)}\n`);

  const gate = runGate(repo);
  assert.equal(gate.status, 0, gate.stderr);
  assert.match(gate.stderr, /reusing/i);
  assert.equal(
    fs.readFileSync(receiptPath, "utf8"),
    `${JSON.stringify(existingReceipt, null, 2)}\n`,
  );
});

test("CLI suppresses a receipt when a successful proof dirties the tree", (t) => {
  const command =
    "node -e \"require('node:fs').writeFileSync('tracked.txt', 'changed by proof\\\\n')\"";
  const repo = createCliRepo(t, command);
  const baseSha = repo.headSha;
  runGit(repo.projectRoot, ["update-ref", "refs/remotes/origin/main", baseSha]);

  fs.writeFileSync(path.join(repo.projectRoot, "feature.txt"), "feature\n");
  runGit(repo.projectRoot, ["add", "feature.txt"]);
  runGit(repo.projectRoot, ["commit", "-m", "feature"]);
  const headSha = runGit(repo.projectRoot, ["rev-parse", "HEAD"]);
  const receiptPath = path.join(
    repo.projectRoot,
    ".guardrails",
    "receipts",
    `proof-${headSha}.json`,
  );

  const gate = runGate(repo);
  assert.equal(gate.status, 2, gate.stderr);
  assert.match(gate.stderr, /proof-receipt-unavailable/i);
  assert.match(gate.stderr, /repository changed while proof ran/i);
  assert.equal(fs.existsSync(receiptPath), false);
});

test("CLI suppresses a receipt when proof moves HEAD with a clean tree", (t) => {
  const repo = createCliRepo(t, "git commit --allow-empty -m proof-moved-head");
  const baseSha = repo.headSha;
  runGit(repo.projectRoot, ["update-ref", "refs/remotes/origin/main", baseSha]);

  fs.writeFileSync(path.join(repo.projectRoot, "feature.txt"), "feature\n");
  runGit(repo.projectRoot, ["add", "feature.txt"]);
  runGit(repo.projectRoot, ["commit", "-m", "feature"]);
  const testedHead = runGit(repo.projectRoot, ["rev-parse", "HEAD"]);
  const receiptPath = path.join(
    repo.projectRoot,
    ".guardrails",
    "receipts",
    `proof-${testedHead}.json`,
  );

  const gate = runGate(repo);
  assert.equal(gate.status, 2, gate.stderr);
  assert.match(gate.stderr, /proof-receipt-unavailable/i);
  assert.match(gate.stderr, /repository changed while proof ran/i);
  assert.notEqual(runGit(repo.projectRoot, ["rev-parse", "HEAD"]), testedHead);
  assert.equal(fs.existsSync(receiptPath), false);
});

test("CLI replaces stale passing proof before a clean rerun fails", (t) => {
  const testCommand = "node -e \"process.exit(0)\"";
  const repo = createCliRepo(t, testCommand);
  const baseSha = repo.headSha;
  runGit(repo.projectRoot, ["update-ref", "refs/remotes/origin/main", baseSha]);

  const keelDir = path.join(repo.projectRoot, ".keel");
  fs.mkdirSync(keelDir, { recursive: true });
  fs.writeFileSync(
    path.join(keelDir, "verify"),
    "node -e \"process.exit(1)\"\n",
  );
  runGit(repo.projectRoot, ["add", ".keel/verify"]);
  runGit(repo.projectRoot, ["commit", "-m", "feature proof"]);
  const headSha = runGit(repo.projectRoot, ["rev-parse", "HEAD"]);
  const receiptPath = path.join(
    repo.projectRoot,
    ".guardrails",
    "receipts",
    `proof-${headSha}.json`,
  );
  fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
  fs.writeFileSync(
    receiptPath,
    `${JSON.stringify(buildReceipt({
      command: testCommand,
      status: 0,
      headSha,
      baseSha,
    }), null, 2)}\n`,
  );

  const gate = runGate(repo);
  assert.equal(gate.status, 2, gate.stderr);
  const replacement = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
  assert.equal(replacement.status, "fail");
  assert.notEqual(replacement.steps[0].status, "pass");
});

test("CLI blocks when passing proof cannot persist its receipt", (t) => {
  const command =
    "node -e \"const fs=require('node:fs');fs.mkdirSync('.guardrails',{recursive:true});fs.writeFileSync('.guardrails/receipts','not a directory')\"";
  const repo = createCliRepo(t, command);
  const baseSha = repo.headSha;
  runGit(repo.projectRoot, ["update-ref", "refs/remotes/origin/main", baseSha]);

  fs.writeFileSync(path.join(repo.projectRoot, "feature.txt"), "feature\n");
  runGit(repo.projectRoot, ["add", "feature.txt"]);
  runGit(repo.projectRoot, ["commit", "-m", "feature"]);

  const gate = runGate(repo);
  assert.equal(gate.status, 2, gate.stderr);
  assert.match(gate.stderr, /proof-receipt-write-failed/i);
  assert.doesNotMatch(gate.stderr, /proof recorded/i);
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

test("receipt output tails stay below the evaluator byte limit", () => {
  const hostileOutput = `first line\n${"\u0000".repeat(100_000)}`;
  const receipt = buildReceipt({
    command: "npm run proof",
    status: 0,
    headSha: HEAD,
    baseSha: BASE,
    output: hostileOutput,
    additionalSteps: [{
      command: "npm test",
      status: 0,
      output: hostileOutput,
    }],
  });

  assert.match(outputTail(hostileOutput), /output truncated/i);
  assert.ok(
    Buffer.byteLength(JSON.stringify(receipt), "utf8") < 64 * 1024,
    "landing-evaluator would reject an oversized receipt",
  );
});

test("receipt persistence surfaces filesystem failures", (t) => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "proof-write-"));
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));
  fs.mkdirSync(path.join(projectRoot, ".guardrails"), { recursive: true });
  fs.writeFileSync(path.join(projectRoot, ".guardrails", "receipts"), "not a directory");

  assert.throws(
    () => writeHeadReceipt(projectRoot, HEAD, buildReceipt({
      command: "npm test",
      status: 0,
      headSha: HEAD,
      baseSha: BASE,
    })),
    /EEXIST|ENOTDIR/,
  );
});

test("receipt reuse validation mirrors evaluator identity and command checks", () => {
  const receipt = buildReceipt({
    command: "npm run lint:content && npm test",
    status: 0,
    headSha: HEAD,
    baseSha: BASE,
    additionalSteps: [{ command: "npm test", status: 0, output: "ok" }],
  });

  assert.equal(
    receiptProves({
      receipt,
      headSha: HEAD,
      baseSha: BASE,
      command: "npm run lint:content && npm test",
      testCommand: "npm test",
    }),
    true,
  );
  assert.equal(
    receiptProves({
      receipt,
      headSha: HEAD,
      baseSha: "c".repeat(40),
      command: "npm run lint:content && npm test",
      testCommand: "npm test",
    }),
    false,
  );
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

  assert.deepEqual(ran, [
    "npm run lint:content && npm test && npm run verify:links",
    "npm test",
  ]);
  assert.equal(result.receipt.status, "pass");
});

test("keel receipt still satisfies landing-evaluator's required testCommand", () => {
  // requiredProofCommands() demands a passing step whose command is
  // byte-identical to testCommand. Run it explicitly rather than inferring
  // execution from text inside the keel command.
  const ran = [];
  const result = evaluateStop(fixture({
    keelVerify: "npm run lint:content && npm test && npm run verify:links",
    runner: (command) => {
      ran.push(command);
      return { status: 0, output: "ok" };
    },
  }));

  assert.deepEqual(ran, [
    "npm run lint:content && npm test && npm run verify:links",
    "npm test",
  ]);
  const hasTestCommand = result.receipt.steps.some(
    (step) => step.command === "npm test" && step.status === "pass",
  );
  assert.equal(hasTestCommand, true, "landing-evaluator would report PROOF_MISSING");
});

test("runs testCommand separately even when keel only mentions it as text", () => {
  const ran = [];
  const result = evaluateStop(fixture({
    keelVerify: "echo npm test",
    runner: (command) => {
      ran.push(command);
      return { status: 0, output: "ok" };
    },
  }));

  assert.deepEqual(ran, ["echo npm test", "npm test"]);
  const testStep = result.receipt.steps.find((step) => step.command === "npm test");
  assert.equal(testStep.status, "pass");
});

test("a separately executed required test failure blocks the stop", () => {
  const result = evaluateStop(fixture({
    keelVerify: "echo npm test",
    runner: (command) =>
      command === "npm test"
        ? { status: 1, output: "required test failed" }
        : { status: 0, output: "keel passed" },
  }));

  assert.equal(result.block, true);
  assert.equal(result.receipt.status, "fail");
  assert.match(result.message, /required test failed/);
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
