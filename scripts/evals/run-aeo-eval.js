#!/usr/bin/env node
"use strict";

/**
 * run-aeo-eval.js — AEO lane evaluator
 *
 * Usage:
 *   node scripts/evals/run-aeo-eval.js [file1 file2 ...]
 *
 * Exit codes:
 *   0 — AEO lane ran
 *   1 — missing ANTHROPIC_API_KEY, missing aeo lane, or runner error
 */

const fs = require("node:fs");
const path = require("node:path");

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "evals.config.json"), "utf8")
);
const { requireAnthropicApiKey, runLane } = require("./lib/run-lane.js");

const LANE = config.lanes.find((l) => l.id === "aeo");
const explicitFiles = process.argv.slice(2).filter((a) => !a.startsWith("--"));

async function main() {
  requireAnthropicApiKey("scripts/evals/run-aeo-eval.js");
  if (!LANE) {
    throw new Error("scripts/evals/run-aeo-eval.js: aeo lane missing from evals.config.json");
  }

  const { ok } = await runLane(LANE, {
    apiKey: process.env.ANTHROPIC_API_KEY,
    require: true,
    explicitFiles,
  });
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(`[fatal] ${e.message}`);
  process.exit(1);
});
