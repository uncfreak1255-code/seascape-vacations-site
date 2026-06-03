const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { computeOverall } = require(path.resolve(__dirname, "lib/score.js"));

const RUBRIC = {
  passFloor: 70,
  dimensions: [
    { id: "decision-answer", weight: 0.5, max: 5 },
    { id: "proof-density", weight: 0.5, max: 5 },
  ],
  autoFailPatterns: ["curated", "nestled"],
};

test("computeOverall: computes correct overall score", () => {
  // Both dims at max -> 100
  const result = computeOverall(
    { "decision-answer": 5, "proof-density": 5 },
    RUBRIC,
    "Great copy with no banned words."
  );
  assert.equal(result.overall, 100);
  assert.equal(result.pass, true);
  assert.equal(result.autoFails.length, 0);
});

test("computeOverall: computes partial score correctly", () => {
  // decision-answer: 3/5 = 0.6, proof-density: 4/5 = 0.8
  // overall = round((0.6*0.5 + 0.8*0.5) * 100) = round(70) = 70
  const result = computeOverall(
    { "decision-answer": 3, "proof-density": 4 },
    RUBRIC,
    "Good copy with specific proof points."
  );
  assert.equal(result.overall, 70);
  assert.equal(result.pass, true);
});

test("computeOverall: fails below passFloor", () => {
  // decision-answer: 1/5 = 0.2, proof-density: 2/5 = 0.4
  // overall = round((0.1 + 0.2) * 100) = 30
  const result = computeOverall(
    { "decision-answer": 1, "proof-density": 2 },
    RUBRIC,
    "Weak copy."
  );
  assert.equal(result.overall, 30);
  assert.equal(result.pass, false);
});

test("computeOverall: detects autoFail patterns (case-insensitive)", () => {
  const result = computeOverall(
    { "decision-answer": 5, "proof-density": 5 },
    RUBRIC,
    "This is a CURATED selection of nestled homes."
  );
  assert.equal(result.pass, false);
  assert.ok(result.autoFails.includes("curated"), "should report curated as autofail");
  assert.ok(result.autoFails.includes("nestled"), "should report nestled as autofail");
});

test("computeOverall: autoFail overrides passing score", () => {
  const result = computeOverall(
    { "decision-answer": 5, "proof-density": 5 },
    RUBRIC,
    "Best curated homes around."
  );
  assert.equal(result.overall, 100);
  assert.equal(result.pass, false, "autoFail should override passing overall");
});

test("computeOverall: clamps scores to 0 at minimum", () => {
  const result = computeOverall(
    { "decision-answer": 0, "proof-density": 0 },
    RUBRIC,
    "Copy."
  );
  assert.equal(result.overall, 0);
  assert.equal(result.pass, false);
});

test("computeOverall: perDimension includes all fields", () => {
  const result = computeOverall(
    { "decision-answer": 4, "proof-density": 2 },
    RUBRIC,
    "Some copy here."
  );
  assert.equal(result.perDimension.length, 2);
  const dim0 = result.perDimension.find((d) => d.id === "decision-answer");
  assert.ok(dim0, "should have decision-answer");
  assert.equal(dim0.raw, 4);
  assert.ok(typeof dim0.normalized === "number");
  assert.equal(dim0.weight, 0.5);
});

test("computeOverall: no autoFailPatterns means empty autoFails", () => {
  const rubricNoFail = {
    passFloor: 70,
    dimensions: [{ id: "tone", weight: 1.0, max: 5 }],
    autoFailPatterns: [],
  };
  const result = computeOverall({ tone: 4 }, rubricNoFail, "Curated nestled text.");
  assert.equal(result.autoFails.length, 0);
  assert.equal(result.pass, true);
});

test("computeOverall: overall is rounded integer", () => {
  // 3/5 = 0.6, weight 1.0 -> 60
  const rubric = {
    passFloor: 50,
    dimensions: [{ id: "a", weight: 1.0, max: 5 }],
    autoFailPatterns: [],
  };
  const result = computeOverall({ a: 3 }, rubric, "Copy.");
  assert.equal(result.overall, 60);
  assert.equal(typeof result.overall, "number");
  assert.equal(Math.round(result.overall), result.overall);
});

// Fix 4: word-boundary autoFail matching
test("computeOverall: autoFail pattern 'ai' does NOT fire on 'available'", () => {
  const rubric = {
    passFloor: 70,
    dimensions: [{ id: "a", weight: 1.0, max: 5 }],
    autoFailPatterns: ["ai"],
  };
  const result = computeOverall({ a: 5 }, rubric, "Our homes are available year-round.");
  assert.equal(result.autoFails.length, 0, "should not fire on 'available'");
  assert.equal(result.pass, true);
});

test("computeOverall: autoFail pattern 'ai' does NOT fire on 'rain'", () => {
  const rubric = {
    passFloor: 70,
    dimensions: [{ id: "a", weight: 1.0, max: 5 }],
    autoFailPatterns: ["ai"],
  };
  const result = computeOverall({ a: 5 }, rubric, "Despite the rain, the view is stunning.");
  assert.equal(result.autoFails.length, 0, "should not fire on 'rain'");
});

test("computeOverall: autoFail pattern 'curated' fires on 'curated beach homes'", () => {
  const rubric = {
    passFloor: 70,
    dimensions: [{ id: "a", weight: 1.0, max: 5 }],
    autoFailPatterns: ["curated"],
  };
  const result = computeOverall({ a: 5 }, rubric, "curated beach homes await you.");
  assert.ok(result.autoFails.includes("curated"), "should fire on 'curated'");
  assert.equal(result.pass, false);
});

test("computeOverall: autoFail pattern 'game-changer' fires on 'a game-changer for owners'", () => {
  const rubric = {
    passFloor: 70,
    dimensions: [{ id: "a", weight: 1.0, max: 5 }],
    autoFailPatterns: ["game-changer"],
  };
  const result = computeOverall({ a: 5 }, rubric, "This is a game-changer for owners.");
  assert.ok(result.autoFails.includes("game-changer"), "should fire on 'game-changer'");
  assert.equal(result.pass, false);
});

// Fix 4: defensive guard for dim.max <= 0
test("computeOverall: dim.max <= 0 treats normalized as 0 without dividing", () => {
  const rubric = {
    passFloor: 70,
    dimensions: [{ id: "a", weight: 1.0, max: 0 }],
    autoFailPatterns: [],
  };
  // Should not throw; normalized should be 0
  const result = computeOverall({ a: 3 }, rubric, "Copy.");
  assert.equal(result.overall, 0);
  assert.equal(result.pass, false);
});
