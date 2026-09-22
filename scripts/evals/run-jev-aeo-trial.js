#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { performance } = require("node:perf_hooks");
const { createTypeSafeClient, DEFAULT_MODEL } = require("./lib/typesafe-client.js");
const { loadRubric } = require("./lib/rubric.js");
const { loadGoldenDir } = require("./lib/golden.js");
const { computeOverall } = require("./lib/score.js");
const { buildAeoQuestions, fixtureMatchesExpectation, inputCostUsd, scoresFromTypeSafeResponse } = require("./lib/jev-aeo.js");

const projectRoot = path.resolve(__dirname, "..", "..");
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "evals.config.json"), "utf8"));
const lane = config.lanes.find((entry) => entry.id === "aeo");
const APPROVED_FIXTURE_NAMES = ["aeo-cost-compare-after", "aeo-fluff-intro", "aeo-methodology-before"];

function parseArgs(argv) {
  const options = { preview: false, outputDir: null, pricePerMillionInputTokens: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--preview") options.preview = true;
    else if (arg === "--output") options.outputDir = argv[++index];
    else if (arg === "--input-cost-per-million-usd") options.pricePerMillionInputTokens = Number(argv[++index]);
    else if (arg === "--help") options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (options.outputDir === undefined || options.outputDir === "") throw new Error("--output requires a directory");
  if (options.pricePerMillionInputTokens !== null && (!Number.isFinite(options.pricePerMillionInputTokens) || options.pricePerMillionInputTokens < 0)) {
    throw new Error("--input-cost-per-million-usd requires a non-negative number");
  }
  return options;
}

function defaultOutputDir() {
  return path.join(os.tmpdir(), `seascape-aeo-evaluation-${new Date().toISOString().replace(/[:.]/g, "-")}`);
}

function validateApprovedFixtures(goldenResults) {
  const actualNames = goldenResults.map(({ fixture }) => fixture.name).sort();
  const exactNames = actualNames.length === APPROVED_FIXTURE_NAMES.length && actualNames.every((name, index) => name === APPROVED_FIXTURE_NAMES[index]);
  if (!exactNames || !goldenResults.every(({ fixture }) => fixture.lane === "aeo")) {
    throw new Error(`AEO fixtures do not match the approved AEO payload: expected ${APPROVED_FIXTURE_NAMES.join(", ")}`);
  }
}

function loadInputs() {
  const rubric = loadRubric(path.join(projectRoot, lane.rubric));
  const goldenResults = loadGoldenDir(path.join(projectRoot, lane.golden));
  const invalid = goldenResults.filter((entry) => !entry.ok);
  if (invalid.length > 0 || goldenResults.length === 0) throw new Error(`AEO golden fixtures are missing or invalid (${invalid.length} invalid)`);
  validateApprovedFixtures(goldenResults);
  return { rubric, goldenResults, questions: buildAeoQuestions(rubric) };
}

function sourceState(goldenResults) {
  const evidenceFiles = [
    "scripts/evals/evals.config.json", lane.rubric,
    "scripts/evals/run-jev-aeo-trial.js", "scripts/evals/lib/jev-aeo.js",
    "scripts/evals/lib/typesafe-client.js", "scripts/evals/lib/score.js",
    ...goldenResults.map(({ filePath }) => path.relative(projectRoot, filePath)),
  ].sort();
  const digest = crypto.createHash("sha256");
  for (const relativePath of evidenceFiles) {
    digest.update(`${relativePath}\0`);
    digest.update(fs.readFileSync(path.join(projectRoot, relativePath)));
  }
  const evaluationDigest = digest.digest("hex");
  try {
    return {
      commit: execFileSync("git", ["rev-parse", "HEAD"], { cwd: projectRoot, encoding: "utf8" }).trim(),
      evaluationDigest,
      evidenceFiles,
      dirty: execFileSync("git", ["status", "--porcelain", "--", ...evidenceFiles], { cwd: projectRoot, encoding: "utf8" }).trim().length > 0,
    };
  } catch {
    return { commit: "unknown", evaluationDigest, evidenceFiles, dirty: null };
  }
}

function fixtureManifest(goldenResults, questionCount) {
  return goldenResults.map(({ fixture }) => ({
    name: fixture.name, lane: fixture.lane, expectedBand: fixture.expect.band,
    copyBytes: Buffer.byteLength(fixture.copy, "utf8"),
    copySha256: crypto.createHash("sha256").update(fixture.copy).digest("hex"),
    judgmentCount: questionCount,
  }));
}

function validateResponseMetadata(response) {
  if (typeof response?.model !== "string" || response.model.trim() === "") {
    throw new Error("TypeSafe response is missing returned model");
  }
}

function formatUsd(value) { return value === null ? "not calculated" : `$${value.toFixed(9)}`; }

function renderMarkdown(findings) {
  const lines = [
    "# Seascape AEO evaluation findings", "",
    `- Status: \`${findings.status}\``, `- Generated: ${findings.generatedAt}`,
    `- Source commit: \`${findings.source.commit}\``, `- Evaluation digest: \`${findings.source.evaluationDigest}\``,
    `- Relevant source dirty: \`${findings.source.dirty}\``, `- Requested model: \`${findings.provider.modelRequested}\``,
    `- Returned model: \`${findings.provider.modelReturned || "not called"}\``, `- Credential lifecycle: \`${findings.credentialLifecycle}\``,
    "", "## Payload manifest", "", "| Fixture | Bytes | SHA-256 | Judgments |", "|---|---:|---|---:|",
    ...findings.payload.fixtures.map((fixture) => `| ${fixture.name} | ${fixture.copyBytes} | \`${fixture.copySha256}\` | ${fixture.judgmentCount} |`),
  ];
  if (findings.results?.length > 0) {
    lines.push("", "## Results", "", "| Fixture | Expected | Score | Match | Mean confidence | Input tokens | Latency |", "|---|---|---:|---|---:|---:|---:|",
      ...findings.results.map((result) => `| ${result.name} | ${result.expectedBand} | ${result.overall} | ${result.matches ? "yes" : "no"} | ${result.meanConfidence.toFixed(3)} | ${result.inputTokens} | ${result.latencyMs} ms |`));
  }
  if (findings.summary) {
    lines.push("", "## Summary", "", `- Fixture matches: ${findings.summary.matches}/${findings.summary.fixtures}`,
      `- Input tokens: ${findings.summary.inputTokens}`, `- Estimated input cost: ${formatUsd(findings.summary.costUsd)}`,
      `- Total request latency: ${findings.summary.latencyMs} ms`, `- Decision: \`${findings.summary.decision}\``, "", findings.summary.note);
  }
  if (findings.error) lines.push("", "## Provider failure", "", findings.error);
  return `${lines.join("\n")}\n`;
}

function writeFindings(outputDir, findings) {
  fs.mkdirSync(outputDir, { recursive: true, mode: 0o700 });
  const jsonPath = path.join(outputDir, "findings.json");
  const markdownPath = path.join(outputDir, "findings.md");
  fs.writeFileSync(jsonPath, `${JSON.stringify(findings, null, 2)}\n`, { mode: 0o600 });
  fs.writeFileSync(markdownPath, renderMarkdown(findings), { mode: 0o600 });
  fs.chmodSync(jsonPath, 0o600); fs.chmodSync(markdownPath, 0o600);
  return { jsonPath, markdownPath };
}

function completedModels(results) {
  return [...new Set(results.map((result) => result.model))].join(", ") || null;
}

async function run(argv = process.argv.slice(2), dependencies = {}) {
  const options = parseArgs(argv);
  if (options.help) { console.log("Usage: npm run eval:aeo:typesafe -- [--preview] [--output DIR] [--input-cost-per-million-usd RATE]"); return 0; }
  const outputDir = path.resolve(options.outputDir || defaultOutputDir());
  const { rubric, goldenResults, questions } = loadInputs();
  const base = {
    schemaVersion: 1, generatedAt: new Date().toISOString(), source: sourceState(goldenResults),
    status: options.preview ? "PREVIEW" : "RUNNING",
    credentialLifecycle: "not inspected; verify any trial-key revocation by exact dashboard name",
    provider: { endpoint: "https://api.typesafe.ai/v1/systemone", modelRequested: DEFAULT_MODEL, modelReturned: null, inputCostPerMillionUsd: options.pricePerMillionInputTokens },
    payload: { scope: "three non-guest repository AEO golden fixtures", externalData: "fixture copy plus five rubric-derived Score questions", fixtures: fixtureManifest(goldenResults, Object.keys(questions).length) },
  };
  if (options.preview) { const paths = writeFindings(outputDir, base); console.log(`[preview] ${JSON.stringify(paths)}`); return 0; }
  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) {
    base.status = "BLOCKED_NO_CREDENTIAL";
    const paths = writeFindings(outputDir, base);
    console.error(`[blocked] TypeSafe AEO evaluation requires TYPESAFE_API_KEY; no request was sent; findings=${paths.markdownPath}`);
    return 2;
  }
  const client = dependencies.createClient ? dependencies.createClient({ apiKey }) : createTypeSafeClient({ apiKey });
  const results = [];
  for (const { fixture } of goldenResults) {
    const startedAt = performance.now();
    try {
      const response = await client.evaluate({ copy: fixture.copy }, questions);
      validateResponseMetadata(response);
      const { scores, confidence } = scoresFromTypeSafeResponse(response, rubric);
      const scored = computeOverall(scores, rubric, fixture.copy);
      const inputTokens = response.usage.input_tokens;
      const confidenceValues = Object.values(confidence);
      results.push({
        name: fixture.name, expectedBand: fixture.expect.band, overall: scored.overall,
        matches: fixtureMatchesExpectation(fixture, scored.overall), scores, confidence,
        meanConfidence: confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length,
        inputTokens, costUsd: inputCostUsd(inputTokens, options.pricePerMillionInputTokens),
        latencyMs: Math.round(performance.now() - startedAt), model: response.model,
      });
      base.provider.modelReturned = completedModels(results);
    } catch (error) {
      base.status = "PROVIDER_ERROR";
      base.results = results;
      base.provider.modelReturned = completedModels(results);
      base.error = error.message;
      const paths = writeFindings(outputDir, base);
      console.error(`[provider-error] ${error.message}; findings=${paths.markdownPath}`);
      return 3;
    }
  }
  base.status = "COMPLETE_SHADOW_ONLY";
  base.provider.modelReturned = completedModels(results);
  base.results = results;
  base.summary = {
    fixtures: results.length, matches: results.filter((entry) => entry.matches).length,
    inputTokens: results.reduce((sum, entry) => sum + entry.inputTokens, 0),
    costUsd: options.pricePerMillionInputTokens === null ? null : results.reduce((sum, entry) => sum + entry.costUsd, 0),
    latencyMs: results.reduce((sum, entry) => sum + entry.latencyMs, 0), decision: "SHADOW_ONLY",
    note: "This three-fixture run cannot replace the canonical evaluator or become a release gate. Expand representative fixtures and approve a separate adoption decision.",
  };
  const paths = writeFindings(outputDir, base);
  console.log(`[complete] ${JSON.stringify({ ...base.summary, ...paths })}`);
  return base.summary.matches === base.summary.fixtures ? 0 : 1;
}

if (require.main === module) {
  run().then((code) => { process.exitCode = code; }).catch((error) => { console.error(`[fatal] ${error.message}`); process.exitCode = 1; });
}

module.exports = { fixtureManifest, parseArgs, renderMarkdown, run, sourceState, validateApprovedFixtures, validateResponseMetadata, writeFindings };
