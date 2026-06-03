#!/usr/bin/env node
"use strict";

/**
 * run-aeo-eval.js — AEO lane evaluator (score-only, never exits non-zero)
 *
 * Usage:
 *   node scripts/evals/run-aeo-eval.js [file1 file2 ...]
 *
 * Exit codes:
 *   Always 0 — score-only lane; prints scores but never blocks CI
 */

const fs = require("node:fs");
const path = require("node:path");

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "evals.config.json"), "utf8")
);
const { runLane } = require("./lib/run-lane.js");

const LANE = config.lanes.find((l) => l.id === "aeo");
const requireFlag = process.argv.includes("--require");
const explicitFiles = process.argv.slice(2).filter((a) => !a.startsWith("--"));

async function main() {
  // AEO is non-blocking — runLane always returns ok=true for non-blocking lanes.
  // Even --require with no key: for non-blocking lanes we still exit 0.
  await runLane(LANE, {
    apiKey: process.env.ANTHROPIC_API_KEY,
    require: false, // AEO never blocks even with --require
    explicitFiles,
  });
  process.exit(0);
}

main().catch((e) => {
  console.error(`[warn] aeo eval error (non-blocking): ${e.message}`);
  process.exit(0);
});
