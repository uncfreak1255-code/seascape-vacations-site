#!/usr/bin/env node
"use strict";

/**
 * run-guest-eval.js — Guest/stay reader-copy quality eval lane (BLOCKING)
 *
 * Judges reader copy on guest stay pages — the `vacationer` entries in
 * src/_data/seoPages.json and pages under src/stays/ — against
 * docs/process/guest-stay-eval-rubric.md.
 *
 * Unlike run-aeo-eval.js (score-only), this lane is blocking: a page with a
 * buried answer (standalone-answer below its hard floor) or zero information
 * gain (information-gain below its hard floor) exits non-zero.
 *
 * Usage:
 *   node scripts/evals/run-guest-eval.js [file1 file2 ...] [--require]
 *
 * Exit codes:
 *   0 — lane passed, or skipped (no rubric/golden/targets, or no
 *       ANTHROPIC_API_KEY without --require)
 *   1 — blocking lane failed, or --require with no ANTHROPIC_API_KEY
 */

const fs = require("node:fs");
const path = require("node:path");

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "evals.config.json"), "utf8")
);
const { runLane } = require("./lib/run-lane.js");

const LANE = config.lanes.find((l) => l.id === "guest");
const requireFlag = process.argv.includes("--require");
const explicitFiles = process.argv.slice(2).filter((a) => !a.startsWith("--"));

async function main() {
  const result = await runLane(LANE, {
    apiKey: process.env.ANTHROPIC_API_KEY,
    require: requireFlag,
    explicitFiles,
  });
  process.exit(result.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(`[fatal] guest eval error: ${e.message}`);
  process.exit(1);
});
