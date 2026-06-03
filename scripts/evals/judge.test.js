const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { judge } = require(path.resolve(__dirname, "lib/judge.js"));

const RUBRIC = {
  id: "owner-copy",
  judgeModel: "claude-sonnet-4-6",
  dimensions: [
    { id: "decision-answer", weight: 0.5, max: 5, criteria: "Does copy answer the owner decision question directly?" },
    { id: "proof-density", weight: 0.5, max: 5, criteria: "Are specific proof points used?" },
  ],
  autoFailPatterns: ["curated"],
};

const COPY = "Rent your Lake Norman dock home. We have managed 40+ homes since 2018.";

function makeMockClient(responseText) {
  return {
    complete(systemPrompt, userPrompt) {
      return Promise.resolve(responseText);
    },
  };
}

// Capture the prompts sent to the mock
function makeCapturingClient(responseText) {
  const calls = [];
  return {
    calls,
    complete(systemPrompt, userPrompt) {
      calls.push({ systemPrompt, userPrompt });
      return Promise.resolve(responseText);
    },
  };
}

const VALID_RESPONSE = `Let me reason about each dimension.

For decision-answer: The copy does answer the question about renting a dock home directly. Score: 4.
For proof-density: "40+ homes since 2018" is a specific proof point. Score: 3.

\`\`\`json
{"decision-answer": 4, "proof-density": 3}
\`\`\``;

const EXTRA_JSON_BLOCK_RESPONSE = `Here's my initial thought:
\`\`\`json
{"decision-answer": 999, "proof-density": 999}
\`\`\`
Wait, let me reconsider.

\`\`\`json
{"decision-answer": 4, "proof-density": 3}
\`\`\``;

const MISSING_DIM_RESPONSE = `Some reasoning here.

\`\`\`json
{"decision-answer": 4}
\`\`\``;

const OUT_OF_RANGE_RESPONSE = `Reasoning.

\`\`\`json
{"decision-answer": 10, "proof-density": 3}
\`\`\``;

const NON_INTEGER_RESPONSE = `Reasoning.

\`\`\`json
{"decision-answer": 4.5, "proof-density": 3}
\`\`\``;

test("judge: returns correct dimScores from valid response", async () => {
  const client = makeMockClient(VALID_RESPONSE);
  const scores = await judge({ copy: COPY, rubric: RUBRIC, client });
  assert.equal(scores["decision-answer"], 4);
  assert.equal(scores["proof-density"], 3);
});

test("judge: uses LAST json block (not first) when multiple blocks exist", async () => {
  const client = makeMockClient(EXTRA_JSON_BLOCK_RESPONSE);
  const scores = await judge({ copy: COPY, rubric: RUBRIC, client });
  assert.equal(scores["decision-answer"], 4, "should use last block, not first");
  assert.equal(scores["proof-density"], 3, "should use last block");
});

test("judge: prompt includes each dimension id", async () => {
  const client = makeCapturingClient(VALID_RESPONSE);
  await judge({ copy: COPY, rubric: RUBRIC, client });
  assert.equal(client.calls.length, 1);
  const { userPrompt } = client.calls[0];
  assert.ok(userPrompt.includes("decision-answer"), "prompt should include dimension id");
  assert.ok(userPrompt.includes("proof-density"), "prompt should include dimension id");
});

test("judge: prompt includes each dimension criteria", async () => {
  const client = makeCapturingClient(VALID_RESPONSE);
  await judge({ copy: COPY, rubric: RUBRIC, client });
  const { userPrompt } = client.calls[0];
  assert.ok(
    userPrompt.includes("Does copy answer the owner decision question directly?"),
    "prompt should include criteria for decision-answer"
  );
  assert.ok(
    userPrompt.includes("Are specific proof points used?"),
    "prompt should include criteria for proof-density"
  );
});

test("judge: throws if a required dimension is missing from response", async () => {
  const client = makeMockClient(MISSING_DIM_RESPONSE);
  await assert.rejects(
    () => judge({ copy: COPY, rubric: RUBRIC, client }),
    /proof-density|dimension|missing/i
  );
});

test("judge: throws if score is out of range", async () => {
  const client = makeMockClient(OUT_OF_RANGE_RESPONSE);
  await assert.rejects(
    () => judge({ copy: COPY, rubric: RUBRIC, client }),
    /range|out of|max|10/i
  );
});

test("judge: throws if score is not an integer", async () => {
  const client = makeMockClient(NON_INTEGER_RESPONSE);
  await assert.rejects(
    () => judge({ copy: COPY, rubric: RUBRIC, client }),
    /integer|float|number/i
  );
});

test("judge: throws if no json block found in response", async () => {
  const client = makeMockClient("I think the copy is pretty good overall. No score given.");
  await assert.rejects(
    () => judge({ copy: COPY, rubric: RUBRIC, client }),
    /json|block|parse/i
  );
});

// Fix 5: tolerate trailing whitespace/blank lines before closing ```
test("judge: tolerates trailing spaces in json block before closing fence", async () => {
  const responseWithTrailingSpaces = `Reasoning step.

\`\`\`json
{"decision-answer": 4, "proof-density": 3}
\`\`\``;
  const client = makeMockClient(responseWithTrailingSpaces);
  const scores = await judge({ copy: COPY, rubric: RUBRIC, client });
  assert.equal(scores["decision-answer"], 4);
  assert.equal(scores["proof-density"], 3);
});

test("judge: tolerates blank lines before closing fence in json block", async () => {
  const responseWithBlankLines = `Reasoning step.

\`\`\`json
{"decision-answer": 4, "proof-density": 3}

\`\`\``;
  const client = makeMockClient(responseWithBlankLines);
  const scores = await judge({ copy: COPY, rubric: RUBRIC, client });
  assert.equal(scores["decision-answer"], 4);
  assert.equal(scores["proof-density"], 3);
});
