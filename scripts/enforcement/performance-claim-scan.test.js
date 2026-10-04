const test = require("node:test");
const assert = require("node:assert/strict");

const {
  findPerformanceClaimHits,
  lintPerformanceClaims,
  scanRepoPublicCopy,
  formatPerformanceClaimReport
} = require("./performance-claim-scan");

const PLANTED_GUIDE_TABLE = `
  <h1>Bradenton vacation rental market</h1>
  <table>
    <tr><th>Market</th><th>Occupancy</th><th>ADR</th></tr>
    <tr><td>Bradenton</td><td>75-80% occupancy</td><td>$301 ADR</td></tr>
  </table>
`;

test("empty performance-claim input fails", () => {
  assert.throws(() => findPerformanceClaimHits(""), /non-empty text/);
  assert.throws(() => findPerformanceClaimHits("   "), /non-empty text/);
  assert.throws(() => findPerformanceClaimHits(), /non-empty text/);
  assert.throws(() => findPerformanceClaimHits(null), /non-empty text/);
});

test("planted guide occupancy table fails the public performance-claim scan", () => {
  const hits = findPerformanceClaimHits(PLANTED_GUIDE_TABLE);
  assert.ok(
    hits.some((hit) => hit.id === "occupancy-percent"),
    `expected occupancy hit, got ${JSON.stringify(hits)}`
  );

  const violations = lintPerformanceClaims("src/guides/planted-occupancy.html", PLANTED_GUIDE_TABLE);
  assert.ok(violations.length > 0, "planted guide occupancy table must fail lint:content");
  assert.match(violations.join("\n"), /75-80% occupancy/);
});

test("guest price comparisons are not occupancy/ADR/revenue claims", () => {
  const hits = findPerformanceClaimHits(
    "Longboat Key is quieter and 15–30% more expensive than AMI."
  );
  assert.deepEqual(hits, []);
});

test("public copy occupancy/ADR/revenue scan reports hits without rewriting", () => {
  const hits = scanRepoPublicCopy();
  const report = formatPerformanceClaimReport(hits);
  console.log(report);
  assert.equal(typeof report, "string");
  assert.match(report, /occupancy\/ADR\/revenue scan:/);
  assert.ok(Array.isArray(hits));
});
