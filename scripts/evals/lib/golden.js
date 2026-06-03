"use strict";

const fs = require("node:fs");
const path = require("node:path");

/**
 * validateGoldenFixture(obj) -> {ok, errors[]}
 *
 * Requires: {name, lane, sourceCite, copy, expect:{band:"high"|"low", ...}}
 * For band "high": require minOverall integer
 * For band "low": require maxOverall integer
 */
function validateGoldenFixture(obj) {
  const errors = [];

  if (!obj || typeof obj !== "object") {
    return { ok: false, errors: ["fixture must be an object"] };
  }

  // Required string fields
  for (const key of ["name", "lane", "sourceCite", "copy"]) {
    if (!obj[key] || typeof obj[key] !== "string") {
      errors.push(`"${key}" is required and must be a non-empty string`);
    }
  }

  // Validate expect
  if (!obj.expect || typeof obj.expect !== "object") {
    errors.push('"expect" is required and must be an object');
  } else {
    const { band, minOverall, maxOverall } = obj.expect;

    if (band !== "high" && band !== "low") {
      errors.push(`"expect.band" must be "high" or "low", got: ${JSON.stringify(band)}`);
    } else if (band === "high") {
      if (typeof minOverall !== "number" || !Number.isInteger(minOverall)) {
        errors.push('"expect.minOverall" is required and must be an integer for band "high"');
      }
    } else if (band === "low") {
      if (typeof maxOverall !== "number" || !Number.isInteger(maxOverall)) {
        errors.push('"expect.maxOverall" is required and must be an integer for band "low"');
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * loadGoldenDir(dir) -> [{ok, errors, fixture}]
 *
 * If dir missing, return [].
 * Else load+validate every *.json file.
 */
function loadGoldenDir(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const results = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    let fixture;
    try {
      fixture = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (e) {
      results.push({
        ok: false,
        errors: [`Failed to parse JSON in ${file}: ${e.message}`],
        fixture: null,
        filePath,
      });
      continue;
    }

    const { ok, errors } = validateGoldenFixture(fixture);
    results.push({ ok, errors, fixture, filePath });
  }

  return results;
}

module.exports = { validateGoldenFixture, loadGoldenDir };
