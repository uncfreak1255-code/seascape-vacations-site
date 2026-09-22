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
const APPROVED_FIXTURES = {
  "aeo-cost-compare-after": { copyBytes: 157, copySha256: "f985c4017189cca3a359109f955e7d7a3cdff0eb3f48f8907855894116106940" },
  "aeo-fluff-intro": { copyBytes: 120, copySha256: "3e57d5ba64dc392a08a62a51e5700c0db80a5dc8f163afedac1b80242997fefa" },
  "aeo-methodology-before": { copyBytes: 143, copySha256: "01ce81d7d089b6e635d7166065a8f0511e774b20d2c615b0526c2d349335061a" },
};
const APPROVED_QUESTIONS_SHA256 = "e26a0a091a61ee69d1add9e527fd4f0c170e07cc8309ad6546ee45592e99e4b5";
const OUTPUT_DESTINATION_CHANGED = "AEO findings destination changed during evaluation; stopping before further requests";

function parseArgs(argv) {
  const options = { preview: false, outputDir: null, pricePerMillionInputTokens: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--preview") options.preview = true;
    else if (arg === "--output") {
      const outputDir = argv[++index];
      if (typeof outputDir !== "string" || outputDir === "" || outputDir.startsWith("--")) {
        throw new Error("--output requires a directory");
      }
      options.outputDir = outputDir;
    } else if (arg === "--input-cost-per-million-usd") {
      const price = argv[++index];
      if (typeof price !== "string" || price === "" || price.startsWith("--")) {
        throw new Error("--input-cost-per-million-usd requires a non-negative number");
      }
      options.pricePerMillionInputTokens = Number(price);
    }
    else if (arg === "--help") options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
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
  const approvedNames = Object.keys(APPROVED_FIXTURES).sort();
  const exactNames = actualNames.length === approvedNames.length && actualNames.every((name, index) => name === approvedNames[index]);
  if (!exactNames || !goldenResults.every(({ fixture }) => fixture.lane === "aeo")) {
    throw new Error(`AEO fixtures do not match the approved AEO payload: expected ${approvedNames.join(", ")}`);
  }
}

function questionSha256(questions) {
  return crypto.createHash("sha256").update(JSON.stringify(questions)).digest("hex");
}

function validateApprovedPayload(goldenResults, questions) {
  validateApprovedFixtures(goldenResults);
  const manifest = fixtureManifest(goldenResults, Object.keys(questions).length);
  const fixturesMatch = manifest.every((fixture) => (
    fixture.judgmentCount === 5
    && fixture.copyBytes === APPROVED_FIXTURES[fixture.name]?.copyBytes
    && fixture.copySha256 === APPROVED_FIXTURES[fixture.name]?.copySha256
  ));
  if (!fixturesMatch || questionSha256(questions) !== APPROVED_QUESTIONS_SHA256) {
    throw new Error("AEO fixtures or rubric-derived questions do not match the approved external payload; run preview and update the reviewed bounds before transmission");
  }
}

function loadInputs() {
  const rubric = loadRubric(path.join(projectRoot, lane.rubric));
  const goldenResults = loadGoldenDir(path.join(projectRoot, lane.golden));
  const invalid = goldenResults.filter((entry) => !entry.ok);
  if (invalid.length > 0 || goldenResults.length === 0) throw new Error(`AEO golden fixtures are missing or invalid (${invalid.length} invalid)`);
  const questions = buildAeoQuestions(rubric);
  validateApprovedPayload(goldenResults, questions);
  return { rubric, goldenResults, questions };
}

function isolatedGitEnvironment() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (key.startsWith("GIT_")) delete env[key];
  }
  return env;
}

function sourceState(goldenResults, root = projectRoot) {
  const evidenceFiles = [
    "scripts/evals/evals.config.json", lane.rubric,
    "scripts/evals/run-jev-aeo-trial.js", "scripts/evals/lib/jev-aeo.js",
    "scripts/evals/lib/typesafe-client.js", "scripts/evals/lib/rubric.js",
    "scripts/evals/lib/golden.js", "scripts/evals/lib/score.js",
    ...goldenResults.map(({ filePath }) => path.relative(projectRoot, filePath)),
  ].sort();
  const digest = crypto.createHash("sha256");
  for (const relativePath of evidenceFiles) {
    digest.update(`${relativePath}\0`);
    digest.update(fs.readFileSync(path.join(root, relativePath)));
  }
  const evaluationDigest = digest.digest("hex");
  try {
    return {
      commit: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8", env: isolatedGitEnvironment() }).trim(),
      evaluationDigest,
      evidenceFiles,
      dirty: execFileSync("git", ["status", "--porcelain", "--", ...evidenceFiles], { cwd: root, encoding: "utf8", env: isolatedGitEnvironment() }).trim().length > 0,
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
  if (typeof response?.model !== "string" || !/^[A-Za-z0-9._:-]{1,128}$/.test(response.model)) {
    throw new Error("TypeSafe response is missing returned model");
  }
}

function formatUsd(value) { return value === null ? "not calculated" : `$${value.toFixed(9)}`; }

function renderMarkdown(findings) {
  const returnedModel = findings.provider.modelReturned || (findings.provider.requestAttempted ? "not returned" : "not called");
  const lines = [
    "# Seascape AEO evaluation findings", "",
    `- Status: \`${findings.status}\``, `- Generated: ${findings.generatedAt}`,
    `- Source commit: \`${findings.source.commit}\``, `- Evaluation digest: \`${findings.source.evaluationDigest}\``,
    `- Relevant source dirty: \`${findings.source.dirty}\``, `- Requested model: \`${findings.provider.modelRequested}\``,
    `- Returned model: \`${returnedModel}\``, `- Credential lifecycle: \`${findings.credentialLifecycle}\``,
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

function prepareOutputDestination(outputDir) {
  const destination = {
    outputDir,
    jsonPath: path.join(outputDir, "findings.json"),
    markdownPath: path.join(outputDir, "findings.md"),
  };
  const reservedPaths = [];
  try {
    let created = false;
    try {
      fs.mkdirSync(outputDir, { recursive: false, mode: 0o700 });
      created = true;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
    const directory = fs.lstatSync(outputDir);
    if (!directory.isDirectory() || directory.isSymbolicLink()) throw new Error("not a directory");
    if (created) fs.chmodSync(outputDir, 0o700);
    const verifiedDirectory = fs.statSync(outputDir);
    if ((verifiedDirectory.mode & 0o077) !== 0 || (verifiedDirectory.mode & 0o200) === 0) {
      throw new Error("directory is not a private writable destination");
    }
    destination.directoryIdentity = { dev: verifiedDirectory.dev, ino: verifiedDirectory.ino };
    for (const [descriptorName, filePath] of [["jsonDescriptor", destination.jsonPath], ["markdownDescriptor", destination.markdownPath]]) {
      const descriptor = fs.openSync(filePath, "wx", 0o600);
      reservedPaths.push(filePath);
      destination[descriptorName] = descriptor;
      fs.fchmodSync(descriptor, 0o600);
      const file = fs.fstatSync(descriptor);
      if (!file.isFile() || (file.mode & 0o077) !== 0) throw new Error("artifact is not private");
      destination[`${descriptorName}Identity`] = { dev: file.dev, ino: file.ino };
    }
    destination.directoryMode = verifiedDirectory.mode & 0o777;
    fs.chmodSync(outputDir, destination.directoryMode & ~0o200);
  } catch {
    for (const descriptor of [destination.jsonDescriptor, destination.markdownDescriptor]) {
      if (typeof descriptor === "number") {
        try { fs.closeSync(descriptor); } catch {}
      }
    }
    for (const filePath of reservedPaths) {
      try { fs.unlinkSync(filePath); } catch {}
    }
    throw new Error("AEO findings destination is unavailable; choose a new writable private directory");
  }
  return destination;
}

function outputDestinationMatches(destination) {
  try {
    const directory = fs.lstatSync(destination.outputDir);
    if (!directory.isDirectory() || directory.isSymbolicLink() || directory.dev !== destination.directoryIdentity.dev || directory.ino !== destination.directoryIdentity.ino) return false;
    for (const [filePath, identity] of [[destination.jsonPath, destination.jsonDescriptorIdentity], [destination.markdownPath, destination.markdownDescriptorIdentity]]) {
      const file = fs.lstatSync(filePath);
      if (!file.isFile() || file.isSymbolicLink() || file.dev !== identity.dev || file.ino !== identity.ino) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function verifyOutputDestination(destination) {
  if (!outputDestinationMatches(destination)) throw new Error(OUTPUT_DESTINATION_CHANGED);
}

function writeFindings(destination, findings) {
  const write = (descriptor, contents) => {
    fs.ftruncateSync(descriptor, 0);
    fs.writeSync(descriptor, contents, 0, "utf8");
    fs.fchmodSync(descriptor, 0o600);
    fs.fsyncSync(descriptor);
  };
  write(destination.jsonDescriptor, `${JSON.stringify(findings, null, 2)}\n`);
  write(destination.markdownDescriptor, renderMarkdown(findings));
  return { jsonPath: destination.jsonPath, markdownPath: destination.markdownPath };
}

function releaseOutputDestination(destination) {
  let restoreError = null;
  try {
    if (outputDestinationMatches(destination)) fs.chmodSync(destination.outputDir, destination.directoryMode);
  } catch (error) {
    restoreError = error;
  }
  for (const descriptor of [destination.jsonDescriptor, destination.markdownDescriptor]) {
    fs.closeSync(descriptor);
  }
  if (restoreError) throw restoreError;
}

function completedModels(results) {
  return [...new Set(results.map((result) => result.model))].join(", ") || null;
}

function recordReturnedModel(current, model) {
  return [...new Set([...(current ? current.split(", ") : []), model])].join(", ");
}

async function run(argv = process.argv.slice(2), dependencies = {}) {
  const options = parseArgs(argv);
  if (options.help) { console.log("Usage: npm run eval:aeo:typesafe -- [--preview] [--output DIR] [--input-cost-per-million-usd RATE]"); return 0; }
  const outputDir = path.resolve(options.outputDir || defaultOutputDir());
  const { rubric, goldenResults, questions } = loadInputs();
  const destination = prepareOutputDestination(outputDir);
  try {
    const base = {
      schemaVersion: 1, generatedAt: new Date().toISOString(), source: sourceState(goldenResults),
      status: options.preview ? "PREVIEW" : "RUNNING",
      credentialLifecycle: "not inspected; verify any trial-key revocation by exact dashboard name",
      provider: { endpoint: "https://api.typesafe.ai/v1/systemone", modelRequested: DEFAULT_MODEL, modelReturned: null, requestAttempted: false, inputCostPerMillionUsd: options.pricePerMillionInputTokens },
      payload: { scope: "three non-guest repository AEO golden fixtures", externalData: "fixture copy plus five rubric-derived Score questions", fixtures: fixtureManifest(goldenResults, Object.keys(questions).length) },
    };
    if (options.preview) {
      const paths = writeFindings(destination, base);
      verifyOutputDestination(destination);
      console.log(`[preview] ${JSON.stringify(paths)}`);
      return 0;
    }
    const apiKey = process.env.TYPESAFE_API_KEY;
    if (!apiKey) {
      base.status = "BLOCKED_NO_CREDENTIAL";
      const paths = writeFindings(destination, base);
      verifyOutputDestination(destination);
      console.error(`[blocked] TypeSafe AEO evaluation requires TYPESAFE_API_KEY; no request was sent; findings=${paths.markdownPath}`);
      return 2;
    }
    verifyOutputDestination(destination);
    const client = dependencies.createClient ? dependencies.createClient({ apiKey }) : createTypeSafeClient({ apiKey });
    verifyOutputDestination(destination);
    const results = [];
    for (const { fixture } of goldenResults) {
      const startedAt = performance.now();
      try {
        verifyOutputDestination(destination);
        base.provider.requestAttempted = true;
        const response = await client.evaluate({ copy: fixture.copy }, questions);
        verifyOutputDestination(destination);
        validateResponseMetadata(response);
        base.provider.modelReturned = recordReturnedModel(base.provider.modelReturned, response.model);
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
        if (error.message === OUTPUT_DESTINATION_CHANGED) throw error;
        base.status = "PROVIDER_ERROR";
        base.results = results;
        base.error = "TypeSafe AEO provider evaluation failed; inspect the local provider error class before retrying.";
        const paths = writeFindings(destination, base);
        verifyOutputDestination(destination);
        console.error(`[provider-error] ${base.error}; findings=${paths.markdownPath}`);
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
    const paths = writeFindings(destination, base);
    verifyOutputDestination(destination);
    console.log(`[complete] ${JSON.stringify({ ...base.summary, ...paths })}`);
    return 0;
  } finally {
    releaseOutputDestination(destination);
  }
}

if (require.main === module) {
  run().then((code) => { process.exitCode = code; }).catch((error) => { console.error(`[fatal] ${error.message}`); process.exitCode = 1; });
}

module.exports = { fixtureManifest, isolatedGitEnvironment, outputDestinationMatches, parseArgs, prepareOutputDestination, releaseOutputDestination, renderMarkdown, run, sourceState, validateApprovedFixtures, validateApprovedPayload, validateResponseMetadata, verifyOutputDestination, writeFindings };
