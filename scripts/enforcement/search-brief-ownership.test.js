const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { assertSearchDecisionBriefContract } = require("./search-brief-gate");

const searchPath = "src/_data/seoPages.json";
const searchBrief = "docs/briefs/search.md";
const trackingBrief = "docs/briefs/tracking.md";
const sourceScope = (source) => `- source files likely to change: \`${source}\`\n`;

// Use the same filled search/attack receipt as the existing gate fixtures.
const gate0 = `## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | Anna Maria Island vacation rentals |
| Searcher intent | guest booking |
| Current Seascape URL | /stays/anna-maria-island-vacation-rentals/ |
| SERP observed date | 2026-06-20 |
| SERP stale after | 2026-06-27 |
| Current proof | 12 clicks and 88 impressions in the dated 2026-06-09 to 2026-06-16 read. |
| Top visible competitors | Anna Maria Life Vacation Rentals, AMI Locals, and SeaBreeze Vacation. |
| Competitor angle | on-island inventory depth and local trust |
| Visual/format gap | Keep matching homes and their tradeoffs easy to compare. |
| Seascape gap | faster near-island explanation |
| Search fit | The existing stay page answers this booking query. |
| Local/GBP proof | Not a GBP action because this is organic stay-page intent. |
| AEO/readback note | Preserve the current extractable answer; no AI visibility claim. |
| Recommendation | tighten the existing money page |
| Attack status | completed |
| Query variants inspected | anna maria island rentals, AMI vacation rentals |
| SERP source | Live web SERP observed 2026-06-20. |
| Competitor URLs inspected | https://example.com/competitor-guide |
| Content gap and Seascape answer | Answer the local trip decision with a faster comparison. |
| Design/format strategy | Preserve the answer block and comparison table. |
| Seascape proof available | Current dated analytics and existing page source. |
| Tools/plugins used | GSC receipt, browser inspection, and repo gates. |
| Decision and reason | Repair the existing page that already owns the query. |
`;

function fixture(t, searchContent, trackingContent) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "search-brief-ownership-"));
  t.after(() => fs.rmSync(rootDir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(rootDir, "docs/briefs"), { recursive: true });
  fs.writeFileSync(path.join(rootDir, searchBrief), searchContent);
  fs.writeFileSync(path.join(rootDir, trackingBrief), trackingContent);
  return () => assertSearchDecisionBriefContract({
    rootDir,
    changedFiles: [searchPath, searchBrief, trackingBrief],
  });
}

test("mixed search and measurement briefs require Gate 0 only from the search owner", (t) => {
  const run = fixture(t,
    `# Search\n${sourceScope(searchPath)}\n${gate0}`,
    `# Existing tracking repair\n${sourceScope("src/guides/tracked.html")}\nPreserve public copy and navigation.\n`,
  );
  assert.equal(run().status, "passed");
});

test("a valid unrelated brief cannot cover an owning brief's missing Gate 0", (t) => {
  const run = fixture(t,
    `# Search\n${sourceScope(searchPath)}`,
    `# Other search work\n${sourceScope("src/guides/other.html")}\n${gate0}`,
  );
  assert.throws(run, /search\.md.*missing the Gate 0/);
});

test("mixed briefs still block a changed search path without an owning brief", (t) => {
  const run = fixture(t,
    `# Other search work\n${sourceScope("src/guides/other.html")}\n${gate0}`,
    `# Tracking repair\n${sourceScope("src/guides/tracked.html")}`,
  );
  assert.throws(run, /each search-driven source edit must be named/);
});

test("every brief naming a changed search path must supply its own Gate 0", (t) => {
  const run = fixture(t,
    `# Search\n${sourceScope(searchPath)}\n${gate0}`,
    `# Another owner\n${sourceScope(searchPath)}`,
  );
  assert.throws(run, /tracking\.md.*missing the Gate 0/);
});
