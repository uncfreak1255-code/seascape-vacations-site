"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
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

test("input cost uses the published Jev input-token price", () => {
  assert.equal(inputCostUsd(1_000_000), 0.042);
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
  assert.equal(body.model, "jev-1.13.0");
  assert.deepEqual(body.state, { copy: "Example" });
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
