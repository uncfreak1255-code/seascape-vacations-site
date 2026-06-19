"use strict";

/**
 * run-lane.js — Shared lane runner used by run-owner-eval.js, run-aeo-eval.js,
 * and lint-evals.js.
 *
 * runLane(lane, options) -> Promise<{laneId, ok, skipped, failures}>
 *
 * lane        — lane config object from evals.config.json (may be undefined)
 * options     — { apiKey, require, explicitFiles }
 *
 * Behaviour:
 *   (a) lane missing/undefined          → print [skip] and return success
 *   (b) rubric file does not exist      → print [skip] rubric not authored yet and return success
 *   (c) loadRubric + loadGoldenDir validation
 *   (d) no apiKey                       → if require=true return failure; guest lane runs
 *                                        deterministic fallback; others skip
 *   (e) resolveTargets, judge+score each, print per-target report
 *   (f) return {laneId, ok, skipped, failures}
 *       blocking lane  → ok=false when any target is below floor/autoFails
 *       non-blocking   → ok always true (still print scores)
 */

const fs = require("node:fs");
const path = require("node:path");

const { loadRubric } = require("./rubric.js");
const { computeOverall, findAutoFailPatterns } = require("./score.js");
const { resolveTargets } = require("./targets.js");
const { loadGoldenDir } = require("./golden.js");
const { judge } = require("./judge.js");
const { createClient } = require("./anthropic-client.js");
const { collectLaneCopies } = require("./lane-copy.js");
const { runDeterministicGuestFallback } = require("./deterministic-guest.js");

const projectRoot = path.resolve(__dirname, "..", "..", "..");

/**
 * runLane(lane, options) -> Promise<{laneId, ok, skipped, failures}>
 *
 * @param {object|undefined} lane
 * @param {object} options
 * @param {string} [options.apiKey]        - Anthropic API key (may be empty/undefined)
 * @param {boolean} [options.require]      - If true and no apiKey, return failure
 * @param {string[]} [options.explicitFiles] - Override git-diff target resolution
 */
async function runLane(lane, options = {}) {
  const { apiKey, require: requireKey = false, explicitFiles = [] } = options;

  // (a) lane missing/undefined
  if (!lane) {
    console.log("[skip] lane undefined: no lane config found");
    return { laneId: undefined, ok: true, skipped: true, failures: [] };
  }

  const laneId = lane.id;

  // (b) rubric file does not exist
  const rubricPath = path.join(projectRoot, lane.rubric);
  if (!fs.existsSync(rubricPath)) {
    console.log(`[skip] lane ${laneId}: rubric not authored yet (${lane.rubric})`);
    return { laneId, ok: true, skipped: true, failures: [] };
  }

  // (c) loadRubric + loadGoldenDir validation
  let rubric;
  try {
    rubric = loadRubric(rubricPath);
    console.log(`[ok] lane ${laneId}: rubric loaded`);
  } catch (e) {
    console.error(`[error] lane ${laneId}: rubric parse failed: ${e.message}`);
    const ok = !lane.blocking;
    return { laneId, ok, skipped: false, failures: [e.message] };
  }

  const goldenDir = path.join(projectRoot, lane.golden);
  const goldenResults = loadGoldenDir(goldenDir);
  let goldenErrorCount = 0;
  for (const g of goldenResults) {
    if (!g.ok) {
      console.error(`[error] lane ${laneId}: invalid golden fixture ${g.filePath}: ${g.errors.join("; ")}`);
      goldenErrorCount++;
    }
  }
  if (goldenErrorCount > 0) {
    console.error(`[error] lane ${laneId}: ${goldenErrorCount} invalid golden fixture(s)`);
    if (lane.blocking) {
      return { laneId, ok: false, skipped: false, failures: [`${goldenErrorCount} invalid golden fixture(s)`] };
    }
  } else if (goldenResults.length > 0) {
    console.log(`[ok] lane ${laneId}: ${goldenResults.length} golden fixture(s) valid`);
  }

  // (d) no apiKey
  if (!apiKey) {
    if (requireKey) {
      console.error(`[error] --require flag passed but ANTHROPIC_API_KEY is not set`);
      return { laneId, ok: false, skipped: false, failures: ["ANTHROPIC_API_KEY not set"] };
    }
    if (laneId === "guest") {
      console.log(
        `[fallback] lane ${laneId}: no ANTHROPIC_API_KEY; checking exact blocked guest-copy patterns`
      );
      const fallback = runDeterministicGuestFallback(lane, rubric, { explicitFiles });
      if (!fallback.ok) {
        return { laneId, ok: false, skipped: false, failures: fallback.failures };
      }
      if (fallback.checked > 0) {
        console.log(
          `[ok] lane ${laneId}: deterministic fallback passed on ${fallback.checked} target(s)`
        );
        return { laneId, ok: true, skipped: false, failures: [] };
      }
    }
    console.log(`[skip judge] lane ${laneId}: no ANTHROPIC_API_KEY; validated rubric + golden only`);
    return { laneId, ok: true, skipped: true, failures: [] };
  }

  // (e) resolveTargets + judge + score each target
  const targets = resolveTargets(lane, explicitFiles);
  if (targets.length === 0) {
    console.log(`[info] lane ${laneId}: no targets — nothing to judge`);
    return { laneId, ok: true, skipped: false, failures: [] };
  }

  let client;
  try {
    client = createClient({ apiKey, model: rubric.judgeModel });
  } catch (e) {
    if (laneId === "guest") {
      console.warn(
        `[fallback] lane ${laneId}: client creation failed (${e.message}); checking exact blocked guest-copy patterns`
      );
      const fallback = runDeterministicGuestFallback(lane, rubric, { explicitFiles });
      return { laneId, ok: fallback.ok, skipped: false, failures: fallback.failures };
    }
    console.error(`[error] lane ${laneId}: client creation failed: ${e.message}`);
    return { laneId, ok: !lane.blocking, skipped: false, failures: [e.message] };
  }

  const failures = [];

  for (const relPath of targets) {
    const absPath = path.join(projectRoot, relPath);
    if (!fs.existsSync(absPath)) {
      console.warn(`[warn] lane ${laneId}: target not found, skipping: ${relPath}`);
      continue;
    }

    let laneCopies;
    try {
      const raw = fs.readFileSync(absPath, "utf8");
      laneCopies = collectLaneCopies(lane, relPath, raw);
    } catch (e) {
      console.error(`[error] lane ${laneId}: could not extract copy from ${relPath}: ${e.message}`);
      if (lane.blocking) {
        failures.push(relPath);
      }
      continue;
    }

    if (laneCopies.length === 0) {
      console.log(`[skip] lane ${laneId}: ${relPath}: no lane entries extracted`);
      continue;
    }

    for (const { label, copy } of laneCopies) {
      if (!copy.trim()) {
        console.log(`[skip] lane ${laneId}: ${label}: no reader copy extracted`);
        continue;
      }

      console.log(`\n[judging] lane ${laneId}: ${label}`);

      let dimScores;
      try {
        dimScores = await judge({ copy, rubric, client });
      } catch (e) {
        if (laneId === "guest") {
          const matches = findAutoFailPatterns(copy, rubric.autoFailPatterns);
          if (matches.length > 0) {
            console.error(`[error] lane ${laneId}: judge failed for ${label}: ${e.message}`);
            console.error(`  deterministic fallback matched: ${matches.join(", ")}`);
            failures.push(label);
          } else {
            console.warn(`[warn] lane ${laneId}: judge failed for ${label}: ${e.message}`);
            console.warn("  deterministic fallback found no exact blocked patterns");
          }
          continue;
        }
        console.error(`[error] lane ${laneId}: judge failed for ${label}: ${e.message}`);
        if (lane.blocking) {
          failures.push(label);
        }
        continue;
      }

      const result = computeOverall(dimScores, rubric, copy);
      const passLabel = lane.blocking
        ? result.pass ? "[PASS]" : "[FAIL]"
        : "[score-only]";

      console.log(`  overall: ${result.overall} ${passLabel}`);
      for (const d of result.perDimension) {
        const dimDef = rubric.dimensions.find((x) => x.id === d.id);
        console.log(`  ${d.id}: ${d.raw}/${dimDef.max} (norm: ${d.normalized.toFixed(2)}, weight: ${d.weight})`);
      }
      if (result.autoFails.length > 0) {
        const label = lane.blocking ? "autoFails" : "autoFails (non-blocking)";
        console.log(`  ${label}: ${result.autoFails.join(", ")}`);
      }

      if (lane.blocking && !result.pass) {
        failures.push(label);
      }
    }
  }

  // (f) return structured result
  // Non-blocking lanes always ok=true; blocking lanes ok=false if any failure
  const ok = lane.blocking ? failures.length === 0 : true;
  return { laneId, ok, skipped: false, failures };
}

module.exports = { runLane };
