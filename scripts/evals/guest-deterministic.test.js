"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { runDeterministicGuestFallback } = require(path.resolve(
  __dirname,
  "lib/deterministic-guest.js"
));
const { findAutoFailPatterns } = require(path.resolve(__dirname, "lib/score.js"));
const { loadRubric } = require(path.resolve(__dirname, "lib/rubric.js"));

const projectRoot = path.resolve(__dirname, "..", "..");
const CONFIG_PATH = path.join(__dirname, "evals.config.json");
const RUBRIC_PATH = path.join(projectRoot, "docs/process/guest-stay-eval-rubric.md");

test("guest deterministic fallback stays clean on the current targeted seoPages entries", () => {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const lane = config.lanes.find((entry) => entry.id === "guest");
  const rubric = loadRubric(RUBRIC_PATH);

  const result = runDeterministicGuestFallback(lane, rubric, {
    explicitFiles: ["src/_data/seoPages.json"],
  });

  assert.equal(result.ok, true, "current targeted stay copy should pass the fallback");
  assert.equal(result.checked, 6, "fallback should inspect the six allowlisted stay targets");
  assert.deepEqual(result.failures, []);
});

test("guest deterministic fallback stays quiet on the clean decision-first rewrite fixture", () => {
  const rubric = loadRubric(RUBRIC_PATH);
  const cleanCopy =
    "A pool home near Anna Maria Island gets you the beach without the island's two real costs: nightly rates and parking. Seascape's homes sit in Bradenton, 10-15 minutes from Holmes Beach, Bradenton Beach, and Coquina Beach, close enough for a sunrise beach run, far enough that you get a private heated pool and room for up to 16 guests instead of a tight on-island condo.";

  assert.deepEqual(findAutoFailPatterns(cleanCopy, rubric.autoFailPatterns), []);
});
