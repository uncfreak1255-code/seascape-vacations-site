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
const fs = require("node:fs");
const path = require("node:path");

const LOG = "[proof-gate]";
const RECEIPT_DIR = path.join(".guardrails", "receipts");
const TEST_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * Build a proof receipt in the shape landing-evaluator's evaluateProof()
 * accepts. Any drift here silently degrades the receipt to PROOF_MISSING, so
 * the shape is asserted in proof-gate.test.js.
 *
 * @param {{command: string, status: number, headSha: string, baseSha: string, output?: string}} args
 * @returns {{version: 1, status: "pass"|"fail", headSha: string, baseSha: string, producedAt: string, steps: Array<object>}}
 */
function buildReceipt({ command, status, headSha, baseSha, output = "", alsoSatisfies = [] }) {
  const passed = status === 0;
  const stepStatus = passed ? "pass" : "fail";
  const steps = [
    {
      command,
      status: stepStatus,
      exitCode: status,
      // Tail only: receipts are capped at 64KB by the evaluator.
      outputTail: String(output).split("\n").slice(-20).join("\n"),
    },
  ];

  // A command that ran as a link in a passing `&&` chain provably ran and
  // provably succeeded — the chain could not have reached exit 0 otherwise.
  // Recording it lets landing-evaluator's requiredProofCommands() be satisfied
  // without running the narrower command a second time. Only ever recorded
  // when the chain passed.
  for (const satisfied of alsoSatisfies) {
    if (passed && satisfied && satisfied !== command) {
      steps.push({ command: satisfied, status: "pass", exitCode: 0, viaChain: command });
    }
  }

  return {
    version: 1,
    status: stepStatus,
    headSha,
    baseSha,
    producedAt: new Date().toISOString(),
    producer: "seascape-vacations-site/proof-gate",
    steps,
  };
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
  headSha,
  baseSha,
  runner,
  keelVerify = "",
}) {
  if (payload.stop_hook_active) {
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
      message:
        `${LOG} no .keel/verify and .guardrails.json declares no testCommand, so ` +
        `this repo has no proof to give. A receipt written now would pass ` +
        `vacuously. Not writing one.`,
    };
  }

  const { status, output } = runner(command);
  const alsoSatisfies =
    testCommand && command !== testCommand && command.includes(testCommand)
      ? [testCommand]
      : [];
  const receipt = buildReceipt({ command, status, headSha, baseSha, output, alsoSatisfies });
  const passed = receipt.status === "pass";
  const receiptMatchesHead = !worktreeDirty;

  return {
    block: !passed,
    ranTests: true,
    wroteReceipt: receiptMatchesHead,
    receipt,
    message: passed
      ? receiptMatchesHead
        ? `${LOG} proof recorded: \`${command}\` passed at ${headSha.slice(0, 8)}.`
        : `${LOG} \`${command}\` passed, but the worktree is dirty. ` +
          `No HEAD-pinned receipt was written; commit the tested changes and finish again.`
      : `${LOG} BLOCKED [proof-failed]\n` +
        `  Problem: \`${command}\` exited ${status}; this turn is not done.\n` +
        `  Next:    fix the failure, then finish the turn again.\n` +
        `  Repro:   ${command}\n` +
        `  Evidence:\n${String(output).split("\n").slice(-20).map((l) => `    ${l}`).join("\n")}`,
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
  const baseSha = git(projectRoot, ["merge-base", "origin/main", "HEAD"]) || headSha;
  if (!headSha) {
    console.error(`${LOG} could not resolve HEAD; allowing stop.`);
    process.exit(0);
  }

  const porcelain = git(projectRoot, ["status", "--porcelain"]);
  const worktreeDirty = Boolean(porcelain);
  const committed = git(projectRoot, ["rev-list", "--count", `${baseSha}..HEAD`]);
  const dirty = worktreeDirty || Number(committed) > 0;
  const payload = readPayload();

  // Remove any earlier clean receipt before dirty-tree tests begin. Otherwise
  // agent-finish could accept the stale file while the tested content no longer
  // equals HEAD. The retry-loop bypass stays side-effect free.
  if (worktreeDirty && !payload.stop_hook_active) {
    try {
      invalidateHeadReceipt(projectRoot, headSha);
    } catch (error) {
      console.error(
        `${LOG} BLOCKED [proof-receipt-invalidation-failed] ` +
        `Could not invalidate the stale HEAD receipt (${error.message}).`,
      );
      process.exit(2);
    }
  }

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
    headSha,
    baseSha,
    keelVerify,
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

  if (result.wroteReceipt && result.receipt) {
    try {
      const dir = path.join(projectRoot, RECEIPT_DIR);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, `proof-${headSha}.json`),
        `${JSON.stringify(result.receipt, null, 2)}\n`,
        { mode: 0o600 },
      );
    } catch (error) {
      console.error(`${LOG} receipt write failed: ${error.message}`);
    }
  }

  console.error(result.message);
  process.exit(result.block ? 2 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { evaluateStop, buildReceipt, invalidateHeadReceipt };
