"use strict";

const fs = require("node:fs");
const path = require("node:path");

const { collectLaneCopies } = require("./lane-copy.js");
const { findAutoFailPatterns } = require("./score.js");
const { resolveTargets } = require("./targets.js");

const projectRoot = path.resolve(__dirname, "..", "..", "..");

function runDeterministicGuestFallback(lane, rubric, options = {}) {
  const explicitFiles = options.explicitFiles || [];
  const targets = resolveTargets(lane, explicitFiles);

  if (targets.length === 0) {
    console.log(`[info] lane ${lane.id}: no targets — nothing to check`);
    return { ok: true, checked: 0, failures: [] };
  }

  const failures = [];
  let checked = 0;

  for (const relPath of targets) {
    const absPath = path.join(projectRoot, relPath);
    if (!fs.existsSync(absPath)) {
      console.warn(`[warn] lane ${lane.id}: target not found, skipping: ${relPath}`);
      continue;
    }

    let laneCopies;
    try {
      const raw = fs.readFileSync(absPath, "utf8");
      laneCopies = collectLaneCopies(lane, relPath, raw);
    } catch (error) {
      console.error(
        `[error] lane ${lane.id}: could not extract copy from ${relPath}: ${error.message}`
      );
      failures.push(`${relPath}: extract failed`);
      continue;
    }

    if (laneCopies.length === 0) {
      console.log(`[skip] lane ${lane.id}: ${relPath}: no lane entries extracted`);
      continue;
    }

    for (const { label, copy } of laneCopies) {
      if (!copy.trim()) {
        console.log(`[skip] lane ${lane.id}: ${label}: no reader copy extracted`);
        continue;
      }

      checked += 1;
      const matches = findAutoFailPatterns(copy, rubric.autoFailPatterns);
      if (matches.length > 0) {
        console.error(
          `[FAIL] lane ${lane.id} deterministic fallback: ${label}: ${matches.join(", ")}`
        );
        failures.push(`${label}: ${matches.join(", ")}`);
      } else {
        console.log(`[PASS] lane ${lane.id} deterministic fallback: ${label}`);
      }
    }
  }

  return { ok: failures.length === 0, checked, failures };
}

module.exports = { runDeterministicGuestFallback };
