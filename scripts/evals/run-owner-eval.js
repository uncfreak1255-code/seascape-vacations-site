#!/usr/bin/env node
"use strict";

/**
 * run-owner-eval.js — Owner lane evaluator (blocking)
 *
 * Usage:
 *   node scripts/evals/run-owner-eval.js [file1 file2 ...]
 *
 * Exit codes:
 *   0 — all targets pass (or no targets / skip conditions)
 *   1 — any target fails (below floor or autoFail); or --require with no API key
 */

const fs = require("node:fs");
const path = require("node:path");

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "evals.config.json"), "utf8")
);
const { runLane } = require("./lib/run-lane.js");

const LANE = config.lanes.find((l) => l.id === "owner");
const requireFlag = process.argv.includes("--require");
const explicitFiles = process.argv.slice(2).filter((a) => !a.startsWith("--"));

async function main() {
  const { ok } = await runLane(LANE, {
    apiKey: process.env.ANTHROPIC_API_KEY,
    require: requireFlag,
    explicitFiles,
  });
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(`[fatal] ${e.message}`);
  process.exit(1);
});
