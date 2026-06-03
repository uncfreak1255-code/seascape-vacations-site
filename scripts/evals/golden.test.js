const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

const { validateGoldenFixture, loadGoldenDir } = require(path.resolve(__dirname, "lib/golden.js"));

const FIXTURES_DIR = path.resolve(__dirname, "__fixtures__", "golden");

const VALID_HIGH = {
  name: "owner-index-high",
  lane: "owner",
  sourceCite: "src/property-management/index.njk",
  copy: "We manage dock homes on Lake Norman. 40+ homes since 2018.",
  expect: {
    band: "high",
    minOverall: 70,
  },
};

const VALID_LOW = {
  name: "weak-copy-low",
  lane: "owner",
  sourceCite: "src/property-management/old.njk",
  copy: "Curated nestled homes that are truly seamless.",
  expect: {
    band: "low",
    maxOverall: 40,
  },
};

test("validateGoldenFixture: accepts valid high-band fixture", () => {
  const { ok, errors } = validateGoldenFixture(VALID_HIGH);
  assert.equal(ok, true, `Expected ok=true, got errors: ${errors}`);
  assert.equal(errors.length, 0);
});

test("validateGoldenFixture: accepts valid low-band fixture", () => {
  const { ok, errors } = validateGoldenFixture(VALID_LOW);
  assert.equal(ok, true, `Expected ok=true, got errors: ${errors}`);
  assert.equal(errors.length, 0);
});

test("validateGoldenFixture: rejects missing name", () => {
  const { name, ...noName } = VALID_HIGH;
  const { ok, errors } = validateGoldenFixture(noName);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes("name")));
});

test("validateGoldenFixture: rejects missing lane", () => {
  const { lane, ...noLane } = VALID_HIGH;
  const { ok, errors } = validateGoldenFixture(noLane);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes("lane")));
});

test("validateGoldenFixture: rejects missing sourceCite", () => {
  const { sourceCite, ...no } = VALID_HIGH;
  const { ok, errors } = validateGoldenFixture(no);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes("sourceCite")));
});

test("validateGoldenFixture: rejects missing copy", () => {
  const { copy, ...no } = VALID_HIGH;
  const { ok, errors } = validateGoldenFixture(no);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes("copy")));
});

test("validateGoldenFixture: rejects missing expect", () => {
  const { expect, ...no } = VALID_HIGH;
  const { ok, errors } = validateGoldenFixture(no);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes("expect")));
});

test("validateGoldenFixture: rejects invalid band value", () => {
  const bad = { ...VALID_HIGH, expect: { band: "medium", minOverall: 70 } };
  const { ok, errors } = validateGoldenFixture(bad);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes("band")));
});

test("validateGoldenFixture: rejects high band without minOverall", () => {
  const bad = { ...VALID_HIGH, expect: { band: "high" } };
  const { ok, errors } = validateGoldenFixture(bad);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes("minOverall")));
});

test("validateGoldenFixture: rejects low band without maxOverall", () => {
  const bad = { ...VALID_LOW, expect: { band: "low" } };
  const { ok, errors } = validateGoldenFixture(bad);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes("maxOverall")));
});

test("loadGoldenDir: returns empty array if dir missing", () => {
  const result = loadGoldenDir(path.join(FIXTURES_DIR, "does-not-exist"));
  assert.deepEqual(result, []);
});

test("loadGoldenDir: loads valid fixture files from fixtures dir", () => {
  // Write fixture files
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(FIXTURES_DIR, "valid-high.json"),
    JSON.stringify(VALID_HIGH),
    "utf8"
  );
  fs.writeFileSync(
    path.join(FIXTURES_DIR, "valid-low.json"),
    JSON.stringify(VALID_LOW),
    "utf8"
  );

  const results = loadGoldenDir(FIXTURES_DIR);
  assert.equal(results.length, 2);
  assert.ok(results.every((r) => r.ok), "all fixtures should be valid");
});

test("loadGoldenDir: reports invalid fixtures but still returns them", () => {
  const badFixturePath = path.join(FIXTURES_DIR, "invalid.json");
  fs.writeFileSync(badFixturePath, JSON.stringify({ name: "broken" }), "utf8");

  const results = loadGoldenDir(FIXTURES_DIR);
  const broken = results.find((r) => r.fixture && r.fixture.name === "broken");
  assert.ok(broken, "should include the broken fixture");
  assert.equal(broken.ok, false);

  // cleanup
  fs.unlinkSync(badFixturePath);
});
