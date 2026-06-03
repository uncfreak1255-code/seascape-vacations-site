#!/usr/bin/env node
"use strict";

/**
 * lint-evals.js — Orchestrator over evals.config.json
 *
 * For each lane:
 * 1. If rubric does not exist → skip (success)
 * 2. If rubric exists → deterministic validation: loadRubric + loadGoldenDir
 * 3. If ANTHROPIC_API_KEY missing → print skip judge message, exit 0
 *    (unless --require, then exit 1 for blocking lanes)
 * 4. If API key present → resolveTargets, judge each target, computeOverall, report
 *
 * Exit codes:
 *   0 — all blocking lanes pass (or skipped/no API key)
 *   1 — any blocking lane fails
 */

const fs = require("node:fs");
const path = require("node:path");

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "evals.config.json"), "utf8")
);
const { runLane } = require("./lib/run-lane.js");

const requireFlag = process.argv.includes("--require");
const explicitFiles = process.argv.slice(2).filter((a) => !a.startsWith("--"));

async function main() {
  const lanes = config.lanes || [];
  let anyBlockingFailed = false;

  for (const lane of lanes) {
    const result = await runLane(lane, {
      apiKey: process.env.ANTHROPIC_API_KEY,
      require: requireFlag,
      explicitFiles,
    });
    if (!result.ok && lane.blocking) {
      anyBlockingFailed = true;
    }
  }

  if (anyBlockingFailed) {
    console.error("\n[lint:evals] FAILED — one or more blocking lanes did not pass");
    process.exit(1);
  } else {
    console.log("\n[lint:evals] OK");
    process.exit(0);
  }
}

main().catch((e) => {
  console.error(`[fatal] ${e.message}`);
  process.exit(1);
});
