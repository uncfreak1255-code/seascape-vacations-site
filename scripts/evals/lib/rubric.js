"use strict";

const fs = require("node:fs");

/**
 * loadRubric(mdPath) -> parsed rubric spec from the ```json eval-spec block
 *
 * Validates:
 * - Required keys present: id, version, judgeModel, passFloor, dimensions, autoFailPatterns
 * - dimensions non-empty
 * - Each dimension has id/weight/max/criteria
 * - Weights sum to ~1.0 (±0.001)
 * - judgeModel must NOT match /opus/i
 * - passFloor 0-100
 */
function loadRubric(mdPath) {
  const content = fs.readFileSync(mdPath, "utf8");

  // Extract the json eval-spec fenced block
  // Match ```json eval-spec ... ``` (only backtick fences)
  const specBlockRegex = /```json eval-spec\s*\n([\s\S]*?)\n```/g;
  const allMatches = [];
  let m;
  while ((m = specBlockRegex.exec(content)) !== null) {
    allMatches.push(m);
  }
  if (allMatches.length === 0) {
    throw new Error(
      `No \`\`\`json eval-spec block found in rubric file: ${mdPath}`
    );
  }
  if (allMatches.length > 1) {
    throw new Error(
      `Ambiguous rubric ${mdPath}: found ${allMatches.length} \`\`\`json eval-spec blocks. ` +
        `Only one eval-spec block is allowed per rubric file.`
    );
  }

  let spec;
  try {
    spec = JSON.parse(allMatches[0][1]);
  } catch (e) {
    throw new Error(`Failed to parse eval-spec JSON in ${mdPath}: ${e.message}`);
  }

  // Validate required top-level keys
  const REQUIRED_KEYS = ["id", "version", "judgeModel", "passFloor", "dimensions", "autoFailPatterns"];
  const missing = REQUIRED_KEYS.filter((k) => !(k in spec));
  if (missing.length > 0) {
    throw new Error(
      `Rubric ${mdPath} is missing required keys: ${missing.join(", ")}`
    );
  }

  // Validate judgeModel is not opus
  if (/opus/i.test(spec.judgeModel)) {
    throw new Error(
      `Rubric ${mdPath}: judgeModel "${spec.judgeModel}" matches /opus/i. ` +
        `Opus models are banned for eval judging (cost control). Use a Sonnet/Haiku model.`
    );
  }

  // Validate passFloor
  if (typeof spec.passFloor !== "number" || spec.passFloor < 0 || spec.passFloor > 100) {
    throw new Error(
      `Rubric ${mdPath}: passFloor must be a number between 0 and 100, got: ${spec.passFloor}`
    );
  }

  // Validate dimensions non-empty
  if (!Array.isArray(spec.dimensions) || spec.dimensions.length === 0) {
    throw new Error(
      `Rubric ${mdPath}: dimensions must be a non-empty array`
    );
  }

  // Validate each dimension
  const DIM_REQUIRED = ["id", "weight", "max", "criteria"];
  spec.dimensions.forEach((dim, i) => {
    const dimMissing = DIM_REQUIRED.filter((k) => !(k in dim));
    if (dimMissing.length > 0) {
      throw new Error(
        `Rubric ${mdPath}: dimension[${i}] is missing required fields: ${dimMissing.join(", ")}`
      );
    }
    // max must be a positive integer
    if (!Number.isInteger(dim.max) || dim.max <= 0) {
      throw new Error(
        `Rubric ${mdPath}: dimension[${i}] (id: "${dim.id}") max must be an integer > 0, got: ${dim.max}`
      );
    }
    // weight must be a finite positive number
    if (typeof dim.weight !== "number" || !isFinite(dim.weight) || dim.weight <= 0) {
      throw new Error(
        `Rubric ${mdPath}: dimension[${i}] (id: "${dim.id}") weight must be a finite number > 0, got: ${dim.weight}`
      );
    }

    // Optional per-dimension hard floor. When present, a raw score below this
    // threshold fails the page outright (enforced in score.js). Integer in [0, max].
    if ("autoFailBelow" in dim) {
      if (!Number.isInteger(dim.autoFailBelow) || dim.autoFailBelow < 0 || dim.autoFailBelow > dim.max) {
        throw new Error(
          `Rubric ${mdPath}: dimension[${i}] (id: "${dim.id}") autoFailBelow must be an integer between 0 and ${dim.max}, got: ${dim.autoFailBelow}`
        );
      }
    }
  });

  // Validate weights sum to ~1.0
  const weightSum = spec.dimensions.reduce((sum, d) => sum + d.weight, 0);
  if (Math.abs(weightSum - 1.0) > 0.001) {
    throw new Error(
      `Rubric ${mdPath}: dimension weights sum to ${weightSum.toFixed(4)}, expected ~1.0 (±0.001)`
    );
  }

  return spec;
}

module.exports = { loadRubric };
