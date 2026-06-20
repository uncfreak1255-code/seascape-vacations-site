const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  assertSearchDecisionBriefContract,
  findChangedBriefFiles,
  findMissingGate0Fields,
  findSearchDecisionFiles
} = require("./search-brief-gate");

function createFixture(files) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-search-brief-gate-"));

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(rootDir, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content);
  }

  return rootDir;
}

test("findSearchDecisionFiles targets public search surfaces and SEO routing files", () => {
  const changedFiles = [
    "src/guides/example.html",
    "src/_data/seoPages.json",
    "src/_redirects",
    "src/assets/site.css",
    "docs/briefs/example.md"
  ];

  assert.deepEqual(findSearchDecisionFiles(changedFiles), [
    "src/guides/example.html",
    "src/_data/seoPages.json",
    "src/_redirects",
  ]);
});

test("search decision gate skips branches with no search-driven source edits", () => {
  const result = assertSearchDecisionBriefContract({
    changedFiles: ["docs/process/content-quality-gate.md"]
  });

  assert.equal(result.status, "skipped");
});

test("search decision gate requires exactly one changed brief when search surfaces move", () => {
  assert.throws(
    () => assertSearchDecisionBriefContract({
      changedFiles: ["src/guides/example.html"]
    }),
    /must change exactly one active brief/i
  );
});

test("search decision gate does not count the brief template as an active brief", () => {
  assert.deepEqual(
    findChangedBriefFiles([
      "docs/briefs/_template.md",
      "docs/briefs/example.md",
    ]),
    ["docs/briefs/example.md"],
  );
});

test("search decision gate fails when the changed brief omits Gate 0", () => {
  const rootDir = createFixture({
    "docs/briefs/example.md": `# Brief: Example

## Content Gate Inputs

- persona: guest
`
  });

  assert.throws(
    () => assertSearchDecisionBriefContract({
      rootDir,
      changedFiles: ["src/guides/example.html", "docs/briefs/example.md"]
    }),
    /missing the Gate 0 search block/i
  );
});

test("search decision gate flags placeholder Gate 0 values", () => {
  const briefContent = `# Brief: Placeholder

## Gate 0 Rescue Block

| Field | Answer |
| --- | --- |
| Target query family | Anna Maria Island vacation rentals |
| Searcher intent | guest booking |
| Current Seascape URL | /stays/example/ |
| SERP observed date | 2026-06-20 |
| SERP stale after | 2026-06-27 |
| Current proof | fill after analytics rerun |
| Top visible competitors | To capture in the next branch |
| Competitor angle | direct booking |
| Seascape gap | faster answer block |
| Search fit | Query is guest booking intent and current URL is the right money page. |
| Local/GBP proof | N/A for this guest-booking SERP; no map pack observed. |
| AEO/readback note | AEO score not run yet because this is not a guide/research rescue. |
| Recommended action | update title and intro |
`;

  assert.deepEqual(findMissingGate0Fields(briefContent), [
    "Current proof",
    "Top visible competitors",
  ]);
});

test("search decision gate requires SERP freshness and search-fit fields", () => {
  const briefContent = `# Brief: Missing freshness

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | vacation rental management Sarasota |
| Searcher intent | owner-management |
| Current Seascape URL | /property-management/vacation-rental-management-sarasota/ |
| SERP observed date | 2026/06/20 |
| Current proof | Current analytics receipt is blocked, so this is a live SERP-only read. |
| Top visible competitors | Vacasa, Evolve, and local map-pack competitors. |
| Competitor angle | local trust and owner revenue proof |
| Seascape gap | weaker local proof and fewer links into the owner money page |
| Recommendation | prepare a rescue brief before editing source copy |
`;

  assert.deepEqual(findMissingGate0Fields(briefContent), [
    "SERP observed date (YYYY-MM-DD)",
    "SERP stale after",
    "Search fit",
    "Local/GBP proof",
    "AEO/readback note",
  ]);
});

test("search decision gate rejects backwards dates, bare N/A, and undated latest proof", () => {
  const briefContent = `# Brief: Weak semantics

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | Bradenton vs Sarasota |
| Searcher intent | guide/research |
| Current Seascape URL | /guides/bradenton-vs-sarasota/ |
| SERP observed date | 2026-06-20 |
| SERP stale after | 2026-06-13 |
| Current proof | latest joined read says the guide slipped. |
| Top visible competitors | Reddit Sarasota, MIDFLORIDA, and Zachos Realty. |
| Competitor angle | relocation pages are answering the comparison faster |
| Seascape gap | vacation-rental fit appears too late |
| Search fit | Existing winner guide should own this comparison and feed Bradenton stay clicks. |
| Local/GBP proof | N/A |
| AEO/readback note | not applicable |
| Recommended action | rescue existing guide intro and internal links |
`;

  assert.deepEqual(findMissingGate0Fields(briefContent), [
    "Current proof (dated receipt/window)",
    "Local/GBP proof (explain N/A)",
    "AEO/readback note (explain N/A)",
    "SERP stale after (on/after observed date)",
  ]);
});

test("search decision gate accepts a brief with a filled Gate 0 block", () => {
  const rootDir = createFixture({
    "docs/briefs/example.md": `# Brief: Example

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | Anna Maria Island vacation rentals |
| Searcher intent | guest booking |
| Current Seascape URL | /stays/anna-maria-island-vacation-rentals/ |
| SERP observed date | 2026-06-20 |
| SERP stale after | 2026-06-27 |
| Current proof | 12 clicks, 88 impressions, 5 GA4 sessions, and 2 tracked date-clicks in the dated 2026-06-09 to 2026-06-16 final read. |
| Top visible competitors | Anna Maria Life Vacation Rentals, AMI Locals, and SeaBreeze Vacation. |
| Competitor angle | on-island inventory depth, local trust, and book-direct positioning |
| Seascape gap | faster near-island explanation and earlier direct-date routing |
| Search fit | Query is guest booking intent, the existing stay money URL is the right page, and the conversion target is property/date clicks. |
| Local/GBP proof | N/A for this organic stay-money read; no local service map-pack action needed. |
| AEO/readback note | Not a guide/research rescue; keep answer block extractable and rerun AEO only if guide copy changes. |
| Recommendation | tighten title, intro, and internal links on the existing money page |
`
  });

  const result = assertSearchDecisionBriefContract({
    rootDir,
    changedFiles: ["src/_data/seoPages.json", "docs/briefs/example.md"]
  });

  assert.equal(result.status, "passed");
  assert.equal(result.briefPath, "docs/briefs/example.md");
});
