"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const {
  AEO_SCORE_LEVELS,
  buildAeoQuestions,
  fixtureMatchesExpectation,
  inputCostUsd,
  scoresFromTypeSafeResponse,
} = require("./lib/jev-aeo.js");
const { createTypeSafeClient, SYSTEM_ONE_URL } = require("./lib/typesafe-client.js");
const { renderMarkdown, run, sourceState, validateApprovedFixtures } = require("./run-jev-aeo-trial.js");

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

test("evaluation fingerprint includes the deterministic scoring module", () => {
  const state = sourceState([]);
  assert.ok(state.evidenceFiles.includes("scripts/evals/lib/score.js"));
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
