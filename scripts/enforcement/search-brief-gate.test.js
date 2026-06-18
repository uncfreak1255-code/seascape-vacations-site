const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  assertSearchDecisionBriefContract,
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
| Current proof | fill after analytics rerun |
| Top visible competitors | To capture in the next branch |
| Competitor angle | direct booking |
| Seascape gap | faster answer block |
| Recommended action | update title and intro |
`;

  assert.deepEqual(findMissingGate0Fields(briefContent), [
    "Current proof",
    "Top visible competitors",
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
| Current proof | 12 clicks, 88 impressions, 5 GA4 sessions, and 2 tracked date-clicks in the latest final read. |
| Top visible competitors | Anna Maria Life Vacation Rentals, AMI Locals, and SeaBreeze Vacation. |
| Competitor angle | on-island inventory depth, local trust, and book-direct positioning |
| Seascape gap | faster near-island explanation and earlier direct-date routing |
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
