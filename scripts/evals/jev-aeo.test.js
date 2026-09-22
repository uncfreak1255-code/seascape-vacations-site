"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");

const {
  AEO_SCORE_LEVELS,
  buildAeoQuestions,
  fixtureMatchesExpectation,
  inputCostUsd,
  scoresFromTypeSafeResponse,
} = require("./lib/jev-aeo.js");
const { createTypeSafeClient, SYSTEM_ONE_URL } = require("./lib/typesafe-client.js");
const { loadGoldenDir } = require("./lib/golden.js");
const { loadRubric } = require("./lib/rubric.js");
const { isolatedGitEnvironment, prepareOutputDestination, releaseOutputDestination, renderMarkdown, run, sourceState, validateApprovedFixtures, validateApprovedPayload, validateResponseMetadata } = require("./run-jev-aeo-trial.js");

const RUBRIC = {
  dimensions: Object.keys(AEO_SCORE_LEVELS).map((id) => ({
    id,
    max: 5,
    criteria: `Canonical criterion for ${id}.`,
  })),
};

function scoreAnswer(score = 4, confidence = 0.8) {
  return {
    type: "score",
    score,
    confidence,
    probabilities: { 0: 0, 1: 0, 2: 0, 3: 0.2, 4: 0.8, 5: 0 },
    legend: {},
  };
}

test("buildAeoQuestions creates one complete Score question per canonical dimension", () => {
  const questions = buildAeoQuestions(RUBRIC);
  assert.deepEqual(Object.keys(questions), Object.keys(AEO_SCORE_LEVELS));
  for (const dimension of RUBRIC.dimensions) {
    assert.equal(questions[dimension.id].type, "score");
    assert.equal(questions[dimension.id].criteria.length, 6);
    assert.match(questions[dimension.id].instructions, new RegExp(dimension.id));
    assert.match(questions[dimension.id].instructions, /Canonical criterion/);
  }
});

test("scoresFromTypeSafeResponse preserves float scores and confidence", () => {
  const answers = Object.fromEntries(
    RUBRIC.dimensions.map((dimension, index) => [dimension.id, scoreAnswer(3.5 + index * 0.1, 0.7)])
  );
  const result = scoresFromTypeSafeResponse({ answers }, RUBRIC);
  assert.equal(result.scores["standalone-answer"], 3.5);
  assert.equal(result.confidence["standalone-answer"], 0.7);
});

test("scoresFromTypeSafeResponse rejects a missing dimension", () => {
  assert.throws(
    () => scoresFromTypeSafeResponse({ answers: {} }, RUBRIC),
    /missing score answer/
  );
});

test("golden expectation matching keeps high and low bands explicit", () => {
  assert.equal(
    fixtureMatchesExpectation({ expect: { band: "high", minOverall: 70 } }, 70),
    true
  );
  assert.equal(
    fixtureMatchesExpectation({ expect: { band: "low", maxOverall: 58 } }, 59),
    false
  );
});

test("input cost requires an explicit current price", () => {
  assert.equal(inputCostUsd(1_000_000), null);
  assert.equal(inputCostUsd(1_000_000, 0.042), 0.042);
});

test("returned model metadata is bounded to a safe identifier", () => {
  assert.doesNotThrow(() => validateResponseMetadata({ model: "jev-1.13.0" }));
  assert.throws(() => validateResponseMetadata({ model: "jev-1\nPROVIDER_RESPONSE_CONTENT_DO_NOT_LEAK" }), /missing returned model/);
});

test("TypeSafe client sends the pinned model, state, and questions without exposing the key", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      async json() {
        return { model: "jev-1.13.0", answers: { quality: scoreAnswer() }, usage: { input_tokens: 10, output_tokens: 1 } };
      },
    };
  };
  const client = createTypeSafeClient({ apiKey: "secret-test-key", fetchImpl });
  await client.evaluate({ copy: "Example" }, { quality: { type: "score", instructions: "Rate it", criteria: ["bad", "good"] } });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, SYSTEM_ONE_URL);
  assert.equal(calls[0].options.headers.Authorization, "Bearer secret-test-key");
  const body = JSON.parse(calls[0].options.body);
  assert.ok(calls[0].options.signal instanceof AbortSignal);
  assert.equal(body.model, "jev-latest");
  assert.deepEqual(body.state, { copy: "Example" });
});

test("TypeSafe client does not expose an API error body", async () => {
  const client = createTypeSafeClient({
    apiKey: "secret-test-key",
    fetchImpl: async () => ({ ok: false, status: 401, text: async () => "echoed-secret" }),
  });
  await assert.rejects(
    client.evaluate({ copy: "Example" }, { quality: { type: "score", instructions: "Rate it", criteria: ["bad", "good"] } }),
    (error) => error.message === "TypeSafe API error 401"
  );
});

test("TypeSafe client redacts malformed success-response JSON", async () => {
  const client = createTypeSafeClient({
    apiKey: "secret-test-key",
    fetchImpl: async () => ({
      ok: true,
      json: async () => {
        throw new SyntaxError("Unexpected token secret-from-provider in JSON at position 1");
      },
    }),
  });
  await assert.rejects(
    client.evaluate({ copy: "Example" }, { quality: { type: "score", instructions: "Rate it", criteria: ["bad", "good"] } }),
    (error) => error.message === "TypeSafe API response could not be parsed"
  );
});

test("TypeSafe client redacts request failures and unreadable response metadata", async () => {
  const marker = "PROVIDER_RESPONSE_CONTENT_DO_NOT_LEAK";
  const requestClient = createTypeSafeClient({
    apiKey: "secret-test-key",
    fetchImpl: async () => { throw new Error(marker); },
  });
  await assert.rejects(
    requestClient.evaluate({ copy: "Example" }, {}),
    (error) => error.message === "TypeSafe API request failed" && !error.message.includes(marker)
  );
  const responseClient = createTypeSafeClient({
    apiKey: "secret-test-key",
    fetchImpl: async () => ({ get ok() { throw new Error(marker); } }),
  });
  await assert.rejects(
    responseClient.evaluate({ copy: "Example" }, {}),
    (error) => error.message === "TypeSafe API response metadata could not be read" && !error.message.includes(marker)
  );
});

test("Jev AEO trial fails closed without a TypeSafe key and sends nothing", () => {
  const script = path.join(__dirname, "run-jev-aeo-trial.js");
  const result = spawnSync(process.execPath, [script], {
    cwd: path.resolve(__dirname, "..", ".."),
    env: { ...process.env, TYPESAFE_API_KEY: "" },
    encoding: "utf8",
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /requires TYPESAFE_API_KEY; no request was sent/);
});

test("a flag cannot be consumed as an output directory and trigger a provider call", async () => {
  const previousKey = process.env.TYPESAFE_API_KEY;
  let clientCreated = false;
  process.env.TYPESAFE_API_KEY = "test-only";
  try {
    await assert.rejects(
      run(["--output", "--preview"], { createClient: () => { clientCreated = true; return {}; } }),
      /--output requires a directory/
    );
    assert.equal(clientCreated, false);
  } finally {
    if (previousKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = previousKey;
  }
});

test("an unusable findings destination prevents provider-client construction", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "jev-aeo-unusable-output-"));
  const outputPath = path.join(root, "not-a-directory");
  fs.writeFileSync(outputPath, "existing file");
  const previousKey = process.env.TYPESAFE_API_KEY;
  let clientCreated = false;
  process.env.TYPESAFE_API_KEY = "test-only";
  try {
    await assert.rejects(
      run(["--output", outputPath], { createClient: () => { clientCreated = true; return {}; } }),
      /findings destination is unavailable/
    );
    assert.equal(clientCreated, false);
  } finally {
    if (previousKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = previousKey;
  }
});

test("a read-only findings directory prevents provider-client construction", async () => {
  const outputPath = fs.mkdtempSync(path.join(os.tmpdir(), "jev-aeo-read-only-output-"));
  const previousKey = process.env.TYPESAFE_API_KEY;
  let clientCreated = false;
  fs.chmodSync(outputPath, 0o500);
  process.env.TYPESAFE_API_KEY = "test-only";
  try {
    await assert.rejects(
      run(["--output", outputPath], { createClient: () => { clientCreated = true; return {}; } }),
      /findings destination is unavailable/
    );
    assert.equal(clientCreated, false);
  } finally {
    fs.chmodSync(outputPath, 0o700);
    if (previousKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = previousKey;
  }
});

test("preflight leaves an existing private output directory's permissions unchanged", () => {
  const outputPath = fs.mkdtempSync(path.join(os.tmpdir(), "jev-aeo-preserve-output-mode-"));
  const before = fs.statSync(outputPath).mode & 0o777;
  const destination = prepareOutputDestination(outputPath);
  try {
    assert.equal(fs.statSync(outputPath).mode & 0o777, before);
  } finally {
    releaseOutputDestination(destination);
  }
  assert.equal(fs.statSync(outputPath).mode & 0o777, before);
});

test("a client-construction failure writes a private no-request finding", async () => {
  const outputPath = fs.mkdtempSync(path.join(os.tmpdir(), "jev-aeo-client-failure-output-"));
  const previousKey = process.env.TYPESAFE_API_KEY;
  process.env.TYPESAFE_API_KEY = "test-only";
  try {
    assert.equal(await run(["--output", outputPath], { createClient: () => { throw new Error("test client construction failure"); } }), 2);
    const findings = JSON.parse(fs.readFileSync(path.join(outputPath, "findings.json"), "utf8"));
    assert.equal(findings.status, "BLOCKED_CLIENT_SETUP");
    assert.equal(findings.provider.requestAttempted, false);
    assert.equal(findings.error.includes("test client construction failure"), false);
  } finally {
    if (previousKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = previousKey;
  }
});

test("a swapped findings directory stops after the active fake evaluation", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "jev-aeo-swapped-output-"));
  const outputPath = path.join(root, "out");
  const retiredPath = path.join(root, "retired");
  const redirectPath = path.join(root, "redirect");
  const previousKey = process.env.TYPESAFE_API_KEY;
  let evaluations = 0;
  fs.mkdirSync(redirectPath, { mode: 0o700 });
  process.env.TYPESAFE_API_KEY = "test-only";
  try {
    await assert.rejects(
      run(["--output", outputPath], {
        createClient: () => ({
          evaluate: async () => {
            evaluations += 1;
            fs.renameSync(outputPath, retiredPath);
            fs.symlinkSync(redirectPath, outputPath);
            return {
              model: "jev-test",
              answers: Object.fromEntries(RUBRIC.dimensions.map(({ id }) => [id, scoreAnswer()])),
              usage: { input_tokens: 1 },
            };
          },
        }),
      }),
      /findings destination changed during evaluation/
    );
    assert.equal(evaluations, 1);
    assert.equal(fs.existsSync(path.join(redirectPath, "findings.json")), false);
  } finally {
    if (fs.existsSync(retiredPath)) fs.chmodSync(retiredPath, 0o700);
    if (previousKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = previousKey;
  }
});

test("provider-error findings render without a success summary", () => {
  const markdown = renderMarkdown({
    status: "PROVIDER_ERROR",
    generatedAt: "2026-09-22T00:00:00.000Z",
    source: { commit: "abc", evaluationDigest: "def", dirty: false },
    credentialLifecycle: "unresolved",
    provider: { modelRequested: "jev-latest", modelReturned: null },
    payload: { fixtures: [] },
    results: [],
    error: "TypeSafe API error 401",
  });
  assert.match(markdown, /Provider failure/);
  assert.match(markdown, /TypeSafe API error 401/);
});

test("approved fixture validation rejects extra or non-AEO payload entries", () => {
  const approved = [
    { fixture: { name: "aeo-cost-compare-after", lane: "aeo" } },
    { fixture: { name: "aeo-methodology-before", lane: "aeo" } },
    { fixture: { name: "aeo-fluff-intro", lane: "aeo" } },
  ];
  assert.doesNotThrow(() => validateApprovedFixtures(approved));
  assert.throws(
    () => validateApprovedFixtures([...approved, { fixture: { name: "guest-copy", lane: "guest" } }]),
    /approved AEO payload/
  );
});

test("approved payload validation rejects changed fixture copy or rubric questions", () => {
  const goldenResults = loadGoldenDir(path.join(__dirname, "golden", "aeo"));
  const questions = buildAeoQuestions(loadRubric(path.join(__dirname, "..", "..", "docs", "process", "aeo-citability-rubric.md")));
  assert.doesNotThrow(() => validateApprovedPayload(goldenResults, questions));
  const changedCopy = goldenResults.map((entry, index) => index === 0 ? { ...entry, fixture: { ...entry.fixture, copy: `${entry.fixture.copy} changed` } } : entry);
  assert.throws(() => validateApprovedPayload(changedCopy, questions), /approved external payload/);
  assert.throws(() => validateApprovedPayload(goldenResults, { ...questions, extra: { type: "score" } }), /approved external payload/);
});

test("evaluation fingerprint includes every loaded scoring dependency", () => {
  const state = sourceState([]);
  for (const file of [
    "scripts/evals/lib/jev-aeo.js",
    "scripts/evals/lib/rubric.js",
    "scripts/evals/lib/golden.js",
    "scripts/evals/lib/score.js",
    "scripts/evals/lib/typesafe-client.js",
  ]) assert.ok(state.evidenceFiles.includes(file));
});

test("each declared evaluation dependency changes the fingerprint and marks provenance dirty", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "jev-aeo-source-state-"));
  const files = sourceState([]).evidenceFiles;
  for (const file of files) {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${file}\n`);
  }
  const gitOptions = { cwd: root, env: isolatedGitEnvironment() };
  execFileSync("git", ["init", "--quiet"], gitOptions);
  execFileSync("git", ["add", "."], gitOptions);
  execFileSync("git", ["-c", "user.name=Test", "-c", "user.email=test@example.invalid", "commit", "--quiet", "-m", "baseline"], gitOptions);
  for (const file of files) {
    const before = sourceState([], root);
    fs.appendFileSync(path.join(root, file), "changed\n");
    const after = sourceState([], root);
    assert.notEqual(after.evaluationDigest, before.evaluationDigest, file);
    assert.equal(after.dirty, true, file);
    execFileSync("git", ["checkout", "--", file], gitOptions);
  }
});

test("provider and response-validation failures both write private findings artifacts", async () => {
  const cases = [
    {
      name: "provider rejection",
      evaluate: async () => {
        throw new Error("TypeSafe API error 429");
      },
    },
    {
      name: "malformed success response",
      evaluate: async () => ({ model: "jev-test", answers: {}, usage: { input_tokens: 1 } }),
    },
    {
      name: "success response without returned model",
      evaluate: async () => ({
        answers: Object.fromEntries(RUBRIC.dimensions.map(({ id }) => [id, scoreAnswer()])),
        usage: { input_tokens: 1 },
      }),
    },
  ];

  const previousKey = process.env.TYPESAFE_API_KEY;
  process.env.TYPESAFE_API_KEY = "test-only";
  try {
    for (const entry of cases) {
      const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-aeo-provider-error-"));
      const exitCode = await run(
        ["--output", outputDir],
        { createClient: () => ({ evaluate: entry.evaluate }) }
      );
      assert.equal(exitCode, 3, entry.name);
      const jsonPath = path.join(outputDir, "findings.json");
      const markdownPath = path.join(outputDir, "findings.md");
      assert.equal(JSON.parse(fs.readFileSync(jsonPath, "utf8")).status, "PROVIDER_ERROR", entry.name);
      assert.match(fs.readFileSync(markdownPath, "utf8"), /Provider failure/, entry.name);
      assert.equal(fs.statSync(jsonPath).mode & 0o777, 0o600, entry.name);
      assert.equal(fs.statSync(markdownPath).mode & 0o777, 0o600, entry.name);
    }
  } finally {
    if (previousKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = previousKey;
  }
});

test("partial provider failures retain already-returned model metadata", async () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-aeo-partial-failure-"));
  const previousKey = process.env.TYPESAFE_API_KEY;
  process.env.TYPESAFE_API_KEY = "test-only";
  let calls = 0;
  try {
    const exitCode = await run(["--output", outputDir], {
      createClient: () => ({
        evaluate: async () => {
          calls += 1;
          if (calls === 2) throw new Error("TypeSafe API error 429");
          return {
            model: "jev-test-1",
            answers: Object.fromEntries(RUBRIC.dimensions.map(({ id }) => [id, scoreAnswer()])),
            usage: { input_tokens: 1 },
          };
        },
      }),
    });
    assert.equal(exitCode, 3);
    const findings = JSON.parse(fs.readFileSync(path.join(outputDir, "findings.json"), "utf8"));
    assert.equal(findings.provider.modelReturned, "jev-test-1");
    assert.match(fs.readFileSync(path.join(outputDir, "findings.md"), "utf8"), /Returned model: `jev-test-1`/);
  } finally {
    if (previousKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = previousKey;
  }
});

test("response-validation failures record a provider attempt and returned model", async () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-aeo-validation-failure-"));
  const previousKey = process.env.TYPESAFE_API_KEY;
  process.env.TYPESAFE_API_KEY = "test-only";
  try {
    const exitCode = await run(["--output", outputDir], {
      createClient: () => ({
        evaluate: async () => ({ model: "jev-before-score", answers: {}, usage: { input_tokens: 1 } }),
      }),
    });
    assert.equal(exitCode, 3);
    const findings = JSON.parse(fs.readFileSync(path.join(outputDir, "findings.json"), "utf8"));
    assert.equal(findings.provider.requestAttempted, true);
    assert.equal(findings.provider.modelReturned, "jev-before-score");
    assert.match(fs.readFileSync(path.join(outputDir, "findings.md"), "utf8"), /Returned model: `jev-before-score`/);
  } finally {
    if (previousKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = previousKey;
  }
});

test("provider failures never copy provider text into findings or stderr", async () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-aeo-redacted-provider-error-"));
  const previousKey = process.env.TYPESAFE_API_KEY;
  const originalError = console.error;
  const marker = "PROVIDER_RESPONSE_CONTENT_DO_NOT_LEAK";
  const stderr = [];
  process.env.TYPESAFE_API_KEY = "test-only";
  console.error = (message) => stderr.push(message);
  try {
    const exitCode = await run(["--output", outputDir], {
      createClient: () => ({ evaluate: async () => { throw new Error(marker); } }),
    });
    assert.equal(exitCode, 3);
    const json = fs.readFileSync(path.join(outputDir, "findings.json"), "utf8");
    const markdown = fs.readFileSync(path.join(outputDir, "findings.md"), "utf8");
    assert.equal(json.includes(marker), false);
    assert.equal(markdown.includes(marker), false);
    assert.equal(stderr.join("\n").includes(marker), false);
  } finally {
    console.error = originalError;
    if (previousKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = previousKey;
  }
});

test("completed shadow comparisons exit zero even when a fixture misses", async () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-aeo-shadow-mismatch-"));
  const previousKey = process.env.TYPESAFE_API_KEY;
  process.env.TYPESAFE_API_KEY = "test-only";
  try {
    const exitCode = await run(["--output", outputDir], {
      createClient: () => ({
        evaluate: async () => ({
          model: "jev-test",
          answers: Object.fromEntries(RUBRIC.dimensions.map(({ id }) => [id, scoreAnswer(0)])),
          usage: { input_tokens: 1 },
        }),
      }),
    });
    assert.equal(exitCode, 0);
    const findings = JSON.parse(fs.readFileSync(path.join(outputDir, "findings.json"), "utf8"));
    assert.equal(findings.status, "COMPLETE_SHADOW_ONLY");
    assert.ok(findings.summary.matches < findings.summary.fixtures);
  } finally {
    if (previousKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = previousKey;
  }
});
