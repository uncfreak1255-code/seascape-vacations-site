#!/usr/bin/env node
// Claude Code Stop hook: deterministic proof gate.
//
// Turns "the agent says it is done" into "this repo's own declared test
// command passed, and here is a receipt pinned to the commit". Without this,
// every completion claim reaching a reviewer is graded by the agent that
// produced it.
//
// Reads `testCommand` from .guardrails.json — the same field guardrail-kit's
// landing-evaluator reads — and emits a receipt in the exact shape
// evaluateProof() accepts, so `agent-finish` can consume it unchanged.
//
// Contract:
//   stop_hook_active      -> allow (loop guard; never block the same stop twice)
//   nothing changed       -> allow, run nothing (conversational turns stay fast)
//   empty testCommand     -> allow, but say so loudly and write no receipt
//   tests fail            -> exit 2, blocking the stop, with the failure fed back
//   tests pass, dirty tree-> exit 0, but no receipt falsely pinned to HEAD
//   tests pass, clean tree-> exit 0, receipt written to .guardrails/receipts/
//
// Deliberately fail-open on general hook infrastructure errors (missing git,
// unreadable config): a crashed gate that wedges every session is a worse
// failure than an unproven turn. Receipt invalidation is the one exception:
// leaving a stale passing receipt at a dirty HEAD would be false proof. Test
// FAILURE is always fail-closed.

"use strict";

const { spawnSync } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const LOG = "[proof-gate]";
const RECEIPT_DIR = path.join(".guardrails", "receipts");
const LOOP_STATE_FILE = path.join(RECEIPT_DIR, "proof-loop-state.json");
const OUTPUT_TAIL_SOURCE_BYTES = 4 * 1024;
const TEST_TIMEOUT_MS = 10 * 60 * 1000;

function outputTail(output) {
  const tail = String(output).split("\n").slice(-20).join("\n");
  const bytes = Buffer.from(tail, "utf8");
  if (bytes.length <= OUTPUT_TAIL_SOURCE_BYTES) {
    return tail;
  }

  const prefix = "[output truncated]\n";
  const budget = OUTPUT_TAIL_SOURCE_BYTES - Buffer.byteLength(prefix);
  const suffix = bytes.subarray(bytes.length - budget).toString("utf8");
  return `${prefix}${suffix.startsWith("\uFFFD") ? suffix.slice(1) : suffix}`;
}

/**
 * Build a proof receipt in the shape landing-evaluator's evaluateProof()
 * accepts. Any drift here silently degrades the receipt to PROOF_MISSING, so
 * the shape is asserted in proof-gate.test.js.
 *
 * @param {{command: string, status: number, headSha: string, baseSha: string, output?: string, additionalSteps?: Array<object>}} args
 * @returns {{version: 1, status: "pass"|"fail", headSha: string, baseSha: string, producedAt: string, steps: Array<object>}}
 */
function buildReceipt({
  command,
  status,
  headSha,
  baseSha,
  output = "",
  additionalSteps = [],
}) {
  const primaryPassed = status === 0;
  const steps = [
    {
      command,
      status: primaryPassed ? "pass" : "fail",
      exitCode: status,
      // Tail only: receipts are capped at 64KB by the evaluator.
      outputTail: outputTail(output),
    },
  ];

  for (const step of additionalSteps) {
    steps.push({
      command: step.command,
      status: step.status === 0 ? "pass" : "fail",
      exitCode: step.status,
      outputTail: outputTail(step.output || ""),
    });
  }

  const passed = primaryPassed && steps.every((step) => step.status === "pass");
  return {
    version: 1,
    status: passed ? "pass" : "fail",
    headSha,
    baseSha,
    producedAt: new Date().toISOString(),
    producer: "seascape-vacations-site/proof-gate",
    steps,
  };
}

function receiptProves({ receipt, headSha, baseSha, command, testCommand }) {
  if (
    !receipt ||
    receipt.version !== 1 ||
    receipt.status !== "pass" ||
    receipt.headSha !== headSha ||
    receipt.baseSha !== baseSha ||
    !Array.isArray(receipt.steps)
  ) {
    return false;
  }

  const requiredCommands = [command];
  if (testCommand && testCommand !== command) {
    requiredCommands.push(testCommand);
  }

  return requiredCommands.every((required) =>
    receipt.steps.some(
      (step) => step && step.command === required && step.status === "pass",
    ),
  );
}

/**
 * Decide whether this stop may proceed. Pure: all IO is injected, so the
 * decision table is testable without a git repo or a 30-second test run.
 *
 * @returns {{block: boolean, ranTests: boolean, wroteReceipt: boolean, receipt: object|null, message: string}}
 */
function evaluateStop({
  payload = {},
  config = {},
  dirty,
  worktreeDirty = false,
  baseResolved = true,
  loopStateUnchanged = true,
  headSha,
  baseSha,
  runner,
  keelVerify = "",
  existingReceipt = null,
  beforeRun = () => {},
  inspectWorktree = () => worktreeDirty,
}) {
  if (payload.stop_hook_active && loopStateUnchanged) {
    return {
      block: false,
      ranTests: false,
      wroteReceipt: false,
      receipt: null,
      message: `${LOG} stop already retried once; allowing so the session cannot wedge.`,
    };
  }

  if (!dirty) {
    return {
      block: false,
      ranTests: false,
      wroteReceipt: false,
      receipt: null,
      message: `${LOG} no working-tree changes; nothing to prove.`,
    };
  }

  // A repo that ships .keel/verify has already declared its proof command.
  // Prefer it: .guardrails.json's testCommand is frequently a strict subset
  // (here, `npm test` vs `lint:content && npm test && verify:links`), so
  // running the narrower one would record a receipt proving less than the repo
  // asks for.
  const testCommand = String(config.testCommand || "").trim();
  const declared = String(keelVerify || "").trim();
  const command = declared || testCommand;

  if (!command) {
    return {
      block: false,
      ranTests: false,
      wroteReceipt: false,
      receipt: null,
      loopRetryable: false,
      message:
        `${LOG} no .keel/verify and .guardrails.json declares no testCommand, so ` +
        `this repo has no proof to give. A receipt written now would pass ` +
        `vacuously. Not writing one.`,
    };
  }

  if (
    !worktreeDirty &&
    baseResolved &&
    receiptProves({ receipt: existingReceipt, headSha, baseSha, command, testCommand })
  ) {
    return {
      block: false,
      ranTests: false,
      wroteReceipt: false,
      receipt: existingReceipt,
      message:
        `${LOG} existing proof is valid for head ${headSha.slice(0, 8)} ` +
        `and base ${baseSha.slice(0, 8)}; reusing it.`,
    };
  }

  try {
    beforeRun();
  } catch (error) {
    return {
      block: true,
      ranTests: false,
      wroteReceipt: false,
      receipt: null,
      loopRetryable: false,
      message:
        `${LOG} BLOCKED [proof-receipt-invalidation-failed] ` +
        `Could not invalidate the existing HEAD receipt (${error.message}).`,
    };
  }

  const primaryRun = runner(command);
  const additionalSteps = [];
  if (primaryRun.status === 0 && testCommand && command !== testCommand) {
    additionalSteps.push({ ...runner(testCommand), command: testCommand });
  }
  const receipt = buildReceipt({
    command,
    status: primaryRun.status,
    headSha,
    baseSha,
    output: primaryRun.output,
    additionalSteps,
  });
  const passed = receipt.status === "pass";
  let worktreeDirtyAfterRun = true;
  try {
    worktreeDirtyAfterRun = Boolean(inspectWorktree());
  } catch {
    worktreeDirtyAfterRun = true;
  }
  const receiptMatchesHead =
    !worktreeDirty && !worktreeDirtyAfterRun && baseResolved;
  const failedStep = receipt.steps.find((step) => step.status === "fail");
  const failedCommand = failedStep ? failedStep.command : command;
  const failedStatus = failedStep ? failedStep.exitCode : primaryRun.status;
  const failedOutput = failedStep ? failedStep.outputTail : primaryRun.output;

  return {
    block: !passed || !receiptMatchesHead,
    ranTests: true,
    wroteReceipt: receiptMatchesHead,
    receipt,
    loopRetryable: !passed,
    message: passed
      ? receiptMatchesHead
        ? `${LOG} proof recorded: \`${command}\` passed at ${headSha.slice(0, 8)}.`
        : !baseResolved
          ? `${LOG} BLOCKED [proof-receipt-unavailable] \`${command}\` passed, but the configured base ref is unavailable. ` +
            `No base-bound receipt was written; fetch the base ref and finish again.`
        : worktreeDirty
          ? `${LOG} BLOCKED [proof-receipt-unavailable] \`${command}\` passed, but the worktree is dirty. ` +
            `No HEAD-pinned receipt was written; commit the tested changes and finish again.`
          : `${LOG} BLOCKED [proof-receipt-unavailable] \`${command}\` passed, but the repository changed while proof ran. ` +
            `No HEAD-pinned receipt was written; inspect the changes and finish again.`
      : `${LOG} BLOCKED [proof-failed]\n` +
        `  Problem: \`${failedCommand}\` exited ${failedStatus}; this turn is not done.\n` +
        `  Next:    fix the failure, then finish the turn again.\n` +
        `  Repro:   ${failedCommand}\n` +
        `  Evidence:\n${String(failedOutput).split("\n").slice(-20).map((l) => `    ${l}`).join("\n")}`,
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function readPayload() {
  try {
    const raw = fs.readFileSync(0, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function git(projectRoot, args) {
  const result = spawnSync("git", args, { cwd: projectRoot, encoding: "utf8" });
  return result.status === 0 ? String(result.stdout).trim() : "";
}

function worktreeIsDirty(projectRoot) {
  const result = spawnSync(
    "git",
    ["status", "--porcelain", "--untracked-files=all"],
    {
      cwd: projectRoot,
      encoding: "utf8",
    },
  );
  return result.status !== 0 || Boolean(String(result.stdout).trim());
}

function gitBuffer(projectRoot, args) {
  const result = spawnSync("git", args, { cwd: projectRoot });
  return result.status === 0 ? result.stdout : null;
}

function worktreeFingerprint(projectRoot, headSha) {
  const diff = gitBuffer(projectRoot, ["diff", "--binary", "HEAD"]);
  const untracked = gitBuffer(projectRoot, [
    "ls-files",
    "--others",
    "--exclude-standard",
    "-z",
  ]);
  if (!diff || !untracked) {
    return "";
  }

  const hash = crypto.createHash("sha256");
  hash.update(headSha);
  hash.update(diff);

  const untrackedPaths = untracked
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .sort();
  for (const relativePath of untrackedPaths) {
    const absolutePath = path.join(projectRoot, relativePath);
    hash.update("\0");
    hash.update(relativePath);
    try {
      const stats = fs.lstatSync(absolutePath);
      hash.update(`:${stats.mode}:`);
      if (stats.isSymbolicLink()) {
        hash.update(fs.readlinkSync(absolutePath));
      } else if (stats.isFile()) {
        hash.update(fs.readFileSync(absolutePath));
      }
    } catch {
      hash.update(":unreadable");
    }
  }

  return `sha256:${hash.digest("hex")}`;
}

function readLoopState(projectRoot) {
  try {
    return JSON.parse(fs.readFileSync(path.join(projectRoot, LOOP_STATE_FILE), "utf8"));
  } catch {
    return null;
  }
}

function writeLoopState(projectRoot, headSha, fingerprint) {
  const statePath = path.join(projectRoot, LOOP_STATE_FILE);
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(
    statePath,
    `${JSON.stringify({ version: 1, headSha, fingerprint }, null, 2)}\n`,
    { mode: 0o600 },
  );
}

function clearLoopState(projectRoot) {
  fs.rmSync(path.join(projectRoot, LOOP_STATE_FILE), { force: true });
}

function readHeadReceipt(projectRoot, headSha) {
  try {
    return JSON.parse(
      fs.readFileSync(
        path.join(projectRoot, RECEIPT_DIR, `proof-${headSha}.json`),
        "utf8",
      ),
    );
  } catch {
    return null;
  }
}

function writeHeadReceipt(projectRoot, headSha, receipt) {
  const dir = path.join(projectRoot, RECEIPT_DIR);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `proof-${headSha}.json`),
    `${JSON.stringify(receipt, null, 2)}\n`,
    { mode: 0o600 },
  );
}

function invalidateHeadReceipt(projectRoot, headSha) {
  fs.rmSync(path.join(projectRoot, RECEIPT_DIR, `proof-${headSha}.json`), {
    force: true,
  });
}

function main() {
  const projectRoot = path.resolve(__dirname, "..", "..");

  let config;
  try {
    config = JSON.parse(fs.readFileSync(path.join(projectRoot, ".guardrails.json"), "utf8"));
  } catch (error) {
    console.error(`${LOG} could not read .guardrails.json (${error.message}); allowing stop.`);
    process.exit(0);
  }

  const headSha = git(projectRoot, ["rev-parse", "HEAD"]);
  if (!headSha) {
    console.error(`${LOG} could not resolve HEAD; allowing stop.`);
    process.exit(0);
  }

  const configuredBaseRef =
    String(config.mergeBase || "").split("...")[0].trim() || "origin/main";
  const resolvedBaseTip = git(projectRoot, ["rev-parse", configuredBaseRef]);
  const mergeBaseSha = resolvedBaseTip
    ? git(projectRoot, ["merge-base", configuredBaseRef, "HEAD"])
    : "";
  const baseResolved = Boolean(resolvedBaseTip && mergeBaseSha);
  const baseSha = mergeBaseSha || headSha;
  const worktreeDirty = worktreeIsDirty(projectRoot);
  const dirty = worktreeDirty || !baseResolved || headSha !== baseSha;
  const payload = readPayload();
  const fingerprint = worktreeFingerprint(projectRoot, headSha);
  const loopState = readLoopState(projectRoot);
  const loopStateUnchanged = Boolean(
    payload.stop_hook_active &&
    fingerprint &&
    loopState &&
    loopState.version === 1 &&
    loopState.headSha === headSha &&
    loopState.fingerprint === fingerprint,
  );

  let keelVerify = "";
  try {
    keelVerify = fs.readFileSync(path.join(projectRoot, ".keel", "verify"), "utf8").trim();
  } catch {
    keelVerify = "";
  }

  const result = evaluateStop({
    payload,
    config,
    dirty,
    worktreeDirty,
    baseResolved,
    loopStateUnchanged,
    headSha,
    baseSha,
    keelVerify,
    existingReceipt: readHeadReceipt(projectRoot, headSha),
    beforeRun: () => invalidateHeadReceipt(projectRoot, headSha),
    inspectWorktree: () =>
      worktreeIsDirty(projectRoot) ||
      git(projectRoot, ["rev-parse", "HEAD"]) !== headSha ||
      (baseResolved &&
        git(projectRoot, ["merge-base", configuredBaseRef, "HEAD"]) !== baseSha),
    runner: (command) => {
      const run = spawnSync(command, {
        cwd: projectRoot,
        shell: true,
        encoding: "utf8",
        timeout: TEST_TIMEOUT_MS,
      });
      return {
        status: run.status === null ? 1 : run.status,
        output: `${run.stdout || ""}${run.stderr || ""}`,
      };
    },
  });

  if (result.block && result.loopRetryable && fingerprint) {
    try {
      writeLoopState(projectRoot, headSha, fingerprint);
    } catch (error) {
      console.error(`${LOG} could not persist loop state (${error.message}).`);
    }
  } else {
    try {
      clearLoopState(projectRoot);
    } catch (error) {
      console.error(`${LOG} could not clear loop state (${error.message}).`);
    }
  }

  if (result.wroteReceipt && result.receipt) {
    try {
      writeHeadReceipt(projectRoot, headSha, result.receipt);
    } catch (error) {
      console.error(
        `${LOG} BLOCKED [proof-receipt-write-failed] ` +
        `Could not persist the passing HEAD receipt (${error.message}).`,
      );
      process.exit(2);
    }
  }

  console.error(result.message);
  process.exit(result.block ? 2 : 0);
}

if (require.main === module) {
  main();
}

module.exports = {
  evaluateStop,
  buildReceipt,
  invalidateHeadReceipt,
  outputTail,
  receiptProves,
  writeHeadReceipt,
  worktreeIsDirty,
  worktreeFingerprint,
};
