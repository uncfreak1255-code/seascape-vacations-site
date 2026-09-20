#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");

const { createTypeSafeClient, DEFAULT_MODEL } = require("./lib/typesafe-client.js");
const { loadRubric } = require("./lib/rubric.js");
const { loadGoldenDir } = require("./lib/golden.js");
const { computeOverall } = require("./lib/score.js");
const {
  buildAeoQuestions,
  fixtureMatchesExpectation,
  inputCostUsd,
  scoresFromTypeSafeResponse,
} = require("./lib/jev-aeo.js");

const projectRoot = path.resolve(__dirname, "..", "..");
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "evals.config.json"), "utf8"));
const lane = config.lanes.find((entry) => entry.id === "aeo");

function formatUsd(value) {
  return `$${value.toFixed(6)}`;
}

async function main() {
  if (!process.env.TYPESAFE_API_KEY) {
    console.error("[blocked] Jev AEO trial requires TYPESAFE_API_KEY; no request was sent");
    process.exit(2);
  }

  const rubric = loadRubric(path.join(projectRoot, lane.rubric));
  const goldenResults = loadGoldenDir(path.join(projectRoot, lane.golden));
  const invalid = goldenResults.filter((entry) => !entry.ok);
  if (invalid.length > 0 || goldenResults.length === 0) {
    throw new Error(`AEO golden fixtures are missing or invalid (${invalid.length} invalid)`);
  }

  const questions = buildAeoQuestions(rubric);
  const client = createTypeSafeClient({ apiKey: process.env.TYPESAFE_API_KEY });
  const results = [];

  for (const { fixture } of goldenResults) {
    const startedAt = performance.now();
    const response = await client.evaluate({ copy: fixture.copy }, questions);
    const latencyMs = Math.round(performance.now() - startedAt);
    const { scores, confidence } = scoresFromTypeSafeResponse(response, rubric);
    const scored = computeOverall(scores, rubric, fixture.copy);
    const inputTokens = response.usage.input_tokens;
    const costUsd = inputCostUsd(inputTokens);
    const matches = fixtureMatchesExpectation(fixture, scored.overall);

    results.push({
      name: fixture.name,
      expectedBand: fixture.expect.band,
      overall: scored.overall,
      matches,
      confidence,
      inputTokens,
      costUsd,
      latencyMs,
      model: response.model,
    });

    console.log(
      `${matches ? "[match]" : "[mismatch]"} ${fixture.name}: overall=${scored.overall} ` +
        `tokens=${inputTokens} cost=${formatUsd(costUsd)} latency=${latencyMs}ms`
    );
  }

  const summary = {
    model: results[0]?.model || DEFAULT_MODEL,
    fixtures: results.length,
    matches: results.filter((entry) => entry.matches).length,
    inputTokens: results.reduce((sum, entry) => sum + entry.inputTokens, 0),
    costUsd: results.reduce((sum, entry) => sum + entry.costUsd, 0),
    latencyMs: results.reduce((sum, entry) => sum + entry.latencyMs, 0),
  };
  console.log(`[summary] ${JSON.stringify(summary)}`);

  process.exit(summary.matches === summary.fixtures ? 0 : 1);
}

main().catch((error) => {
  console.error(`[fatal] ${error.message}`);
  process.exit(1);
});
