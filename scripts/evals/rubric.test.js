const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

const { loadRubric } = require(path.resolve(__dirname, "lib/rubric.js"));

const FIXTURES_DIR = path.resolve(__dirname, "__fixtures__");

const VALID_RUBRIC_MD = `# Owner Copy Evaluation Rubric

Some description here.

\`\`\`json eval-spec
{
  "id": "owner-copy",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [
    { "id": "decision-answer", "weight": 0.5, "max": 5, "criteria": "Does copy answer the owner decision question directly?" },
    { "id": "proof-density", "weight": 0.5, "max": 5, "criteria": "Are specific proof points used rather than generic claims?" }
  ],
  "autoFailPatterns": ["curated", "nestled"]
}
\`\`\`
`;

const OPUS_RUBRIC_MD = `# Bad Rubric

\`\`\`json eval-spec
{
  "id": "opus-test",
  "version": "1.0.0",
  "judgeModel": "claude-opus-4-5",
  "passFloor": 70,
  "dimensions": [
    { "id": "tone", "weight": 1.0, "max": 5, "criteria": "Good tone." }
  ],
  "autoFailPatterns": []
}
\`\`\`
`;

const MISWEIGHTED_RUBRIC_MD = `# Misweighted

\`\`\`json eval-spec
{
  "id": "bad-weights",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [
    { "id": "a", "weight": 0.3, "max": 5, "criteria": "Criterion a." },
    { "id": "b", "weight": 0.3, "max": 5, "criteria": "Criterion b." }
  ],
  "autoFailPatterns": []
}
\`\`\`
`;

const MISSING_KEYS_RUBRIC_MD = `# Missing keys

\`\`\`json eval-spec
{
  "id": "missing-keys",
  "dimensions": [
    { "id": "a", "weight": 1.0, "max": 5, "criteria": "Criterion a." }
  ]
}
\`\`\`
`;

const NO_SPEC_BLOCK_MD = `# No spec

Just markdown, no eval-spec block here.
`;

function writeTmp(name, content) {
  const tmpPath = path.join(FIXTURES_DIR, name);
  fs.writeFileSync(tmpPath, content, "utf8");
  return tmpPath;
}

test("loadRubric: parses a valid rubric markdown file", () => {
  const tmpPath = writeTmp("valid-rubric.md", VALID_RUBRIC_MD);
  const rubric = loadRubric(tmpPath);
  assert.equal(rubric.id, "owner-copy");
  assert.equal(rubric.version, "1.0.0");
  assert.equal(rubric.judgeModel, "claude-sonnet-4-6");
  assert.equal(rubric.passFloor, 70);
  assert.equal(rubric.dimensions.length, 2);
  assert.deepEqual(rubric.autoFailPatterns, ["curated", "nestled"]);
});

test("loadRubric: throws if judgeModel matches /opus/i", () => {
  const tmpPath = writeTmp("opus-rubric.md", OPUS_RUBRIC_MD);
  assert.throws(() => loadRubric(tmpPath), /[Oo]pus/);
});

test("loadRubric: throws if weights do not sum to ~1.0", () => {
  const tmpPath = writeTmp("misweighted-rubric.md", MISWEIGHTED_RUBRIC_MD);
  assert.throws(() => loadRubric(tmpPath), /weight/i);
});

test("loadRubric: throws if required keys are missing", () => {
  const tmpPath = writeTmp("missing-keys-rubric.md", MISSING_KEYS_RUBRIC_MD);
  assert.throws(() => loadRubric(tmpPath), /passFloor|version|judgeModel/i);
});

test("loadRubric: throws if no eval-spec block found", () => {
  const tmpPath = writeTmp("no-spec.md", NO_SPEC_BLOCK_MD);
  assert.throws(() => loadRubric(tmpPath), /eval-spec/i);
});

test("loadRubric: throws if dimensions is empty", () => {
  const emptyDimsMd = `# Empty dims
\`\`\`json eval-spec
{
  "id": "empty",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [],
  "autoFailPatterns": []
}
\`\`\`
`;
  const tmpPath = writeTmp("empty-dims.md", emptyDimsMd);
  assert.throws(() => loadRubric(tmpPath), /dimension/i);
});

test("loadRubric: throws if a dimension is missing required fields", () => {
  const badDimMd = `# Bad dim
\`\`\`json eval-spec
{
  "id": "bad-dim",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [
    { "id": "a", "weight": 1.0, "max": 5 }
  ],
  "autoFailPatterns": []
}
\`\`\`
`;
  const tmpPath = writeTmp("bad-dim.md", badDimMd);
  assert.throws(() => loadRubric(tmpPath), /criteria/i);
});

test("loadRubric: accepts passFloor of 0 and 100", () => {
  const makeRubric = (floor) => `# Test
\`\`\`json eval-spec
{
  "id": "floor-test",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": ${floor},
  "dimensions": [
    { "id": "a", "weight": 1.0, "max": 5, "criteria": "Test." }
  ],
  "autoFailPatterns": []
}
\`\`\`
`;
  const path0 = writeTmp("floor0.md", makeRubric(0));
  const path100 = writeTmp("floor100.md", makeRubric(100));
  assert.equal(loadRubric(path0).passFloor, 0);
  assert.equal(loadRubric(path100).passFloor, 100);
});

// Fix 2: dimension value sanity — max and weight must be valid
function makeDimRubric(dimOverrides) {
  const dim = Object.assign({ id: "a", weight: 1.0, max: 5, criteria: "Test." }, dimOverrides);
  return `# Dim sanity test
\`\`\`json eval-spec
{
  "id": "dim-sanity",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [${JSON.stringify(dim)}],
  "autoFailPatterns": []
}
\`\`\`
`;
}

test("loadRubric: throws when dimension max is 0", () => {
  const tmpPath = writeTmp("dim-max0.md", makeDimRubric({ max: 0 }));
  assert.throws(() => loadRubric(tmpPath), /max/i);
});

test("loadRubric: throws when dimension max is negative", () => {
  const tmpPath = writeTmp("dim-max-neg.md", makeDimRubric({ max: -1 }));
  assert.throws(() => loadRubric(tmpPath), /max/i);
});

test("loadRubric: throws when dimension weight is 0", () => {
  // Note: we need dimensions to sum to 1.0, but we test max sanity separately.
  // A weight:0 single-dimension rubric would also fail weight-sum, but the max check
  // must fire. Test with two dims so weight-sum error doesn't mask it.
  const twoZeroWeightMd = `# Two dims weight zero
\`\`\`json eval-spec
{
  "id": "weight-zero",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [
    { "id": "a", "weight": 0, "max": 5, "criteria": "A." },
    { "id": "b", "weight": 1.0, "max": 5, "criteria": "B." }
  ],
  "autoFailPatterns": []
}
\`\`\`
`;
  const tmpPath = writeTmp("dim-weight0.md", twoZeroWeightMd);
  assert.throws(() => loadRubric(tmpPath), /weight/i);
});

test("loadRubric: throws when dimension weight is negative", () => {
  const twoNegWeightMd = `# Two dims negative weight
\`\`\`json eval-spec
{
  "id": "weight-neg",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [
    { "id": "a", "weight": -0.5, "max": 5, "criteria": "A." },
    { "id": "b", "weight": 1.0, "max": 5, "criteria": "B." }
  ],
  "autoFailPatterns": []
}
\`\`\`
`;
  const tmpPath = writeTmp("dim-weight-neg.md", twoNegWeightMd);
  assert.throws(() => loadRubric(tmpPath), /weight/i);
});

test("loadRubric: throws when dimension weight is not a number", () => {
  const twoStrWeightMd = `# Two dims string weight
\`\`\`json eval-spec
{
  "id": "weight-str",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [
    { "id": "a", "weight": "x", "max": 5, "criteria": "A." },
    { "id": "b", "weight": 1.0, "max": 5, "criteria": "B." }
  ],
  "autoFailPatterns": []
}
\`\`\`
`;
  const tmpPath = writeTmp("dim-weight-str.md", twoStrWeightMd);
  assert.throws(() => loadRubric(tmpPath), /weight/i);
});

// Fix 3: multiple eval-spec blocks must throw
test("loadRubric: throws when markdown contains two eval-spec blocks", () => {
  const twoBlocksMd = `# Two blocks

\`\`\`json eval-spec
{
  "id": "first",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [{ "id": "a", "weight": 1.0, "max": 5, "criteria": "A." }],
  "autoFailPatterns": []
}
\`\`\`

Some text in between.

\`\`\`json eval-spec
{
  "id": "second",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [{ "id": "a", "weight": 1.0, "max": 5, "criteria": "A." }],
  "autoFailPatterns": []
}
\`\`\`
`;
  const tmpPath = writeTmp("two-spec-blocks.md", twoBlocksMd);
  assert.throws(() => loadRubric(tmpPath), /ambig|multiple|more than one/i);
});

test("loadRubric: one eval-spec block still works after multi-block guard", () => {
  const tmpPath = writeTmp("valid-rubric.md", VALID_RUBRIC_MD);
  const rubric = loadRubric(tmpPath);
  assert.equal(rubric.id, "owner-copy");
});
