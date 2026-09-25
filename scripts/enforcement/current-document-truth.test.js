const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertDocumentReference(documentPath, reference, targetPath) {
  assert.match(
    read(documentPath),
    new RegExp(reference.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    `${documentPath} must reference ${reference}`
  );
  assert.equal(
    fs.existsSync(path.join(root, targetPath)),
    true,
    `${documentPath} points at missing repository path ${targetPath}`
  );
}

test("current skill guidance links to the owning directories instead of caching inventories or counts", () => {
  const countedSkills = /\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|\d+)\s+(?:active\s+)?(?:local\s+|site-specific\s+)?skills\b/i;
  const claudeReadme = read(".claude/skills/README.md");
  const disabledReadme = read(".agents/_disabled-skills-2026-04-28/README.md");
  const disabledCurrentSection = disabledReadme.split("Archived snapshot moved here")[0];
  const pluginReadme = read("plugins/seascape-seo-os/README.md");

  assert.doesNotMatch(claudeReadme, /^\s*- `[^`]+`\s*$/m);
  assert.doesNotMatch(disabledCurrentSection, /^\s*- `[^`]+`\s*$/m);
  assert.doesNotMatch(pluginReadme, countedSkills);
});

test("current brand and design guidance leaves the exact portfolio count to code", () => {
  const fixedPortfolioCount = /\b(?:five|six|5|6)\s+(?:(?:private pool|vacation)\s+)?(?:homes|properties|property pages)\b/i;

  for (const documentPath of [
    "DESIGN.md",
    "docs/style/writing-style-guide.md",
  ]) {
    assert.doesNotMatch(read(documentPath), fixedPortfolioCount, documentPath);
  }
});

test("current documentation names repository paths that exist", () => {
  assertDocumentReference(
    "scripts/design/design-sync/templates/README.md",
    "src/_includes/layouts/guest.njk",
    "src/_includes/layouts/guest.njk"
  );
  assertDocumentReference(
    "docs/status/search-growth-map.md",
    "src/ai-discovery.json.njk",
    "src/ai-discovery.json.njk"
  );
  assertDocumentReference(
    "docs/style/writing-style-guide.md",
    "src/_data/properties.js",
    "src/_data/properties.js"
  );
  assertDocumentReference(
    "docs/reports/2026-04-18-seo-action-plan.md",
    "2026-04-18-full-seo-audit.md",
    "docs/reports/2026-04-18-full-seo-audit.md"
  );
  assertDocumentReference(
    "docs/reports/2026-04-18-seo-action-plan.md",
    "../briefs/2026-04-winner-guide-consolidation-round-2.md",
    "docs/briefs/2026-04-winner-guide-consolidation-round-2.md"
  );

  for (const documentPath of [
    "docs/source-of-truth.md",
    "docs/process/agent-safety-standard.md",
    "docs/status/current-state.md",
  ]) {
    assert.match(read(documentPath), /removed legacy deploy path/i, documentPath);
  }
});

test("DataForSEO findings disclose that their raw responses are not retained", () => {
  const findingPaths = [
    "seo-findings/keywords/seascape-vacations.md",
    "seo-findings/keywords/seascape-vacations-bradenton.md",
    "seo-findings/keywords/seascape-vacations-anna-maria-island.md",
    "seo-findings/keywords/seascape-vacations-sarasota.md",
    "seo-findings/keywords/vacation-rentals-near-anna-maria-island.md",
  ];

  for (const findingPath of findingPaths) {
    const source = read(findingPath);
    assert.doesNotMatch(source, /^- raw file:/m, findingPath);
    assert.match(source, /^- raw response: not retained in this repository/m, findingPath);
  }

  const latestRun = JSON.parse(read("seo-findings/latest-run.json"));
  assert.equal(latestRun.input_dir, null);
  assert.equal(latestRun.raw_responses_retained, false);

  const captureSheet = read("workspace/dataforseo-results-capture-sheet-first-5-calls.md");
  assert.doesNotMatch(captureSheet, /\/Users\/sawbeck\/Projects\/seascape-vacations-site\/workspace\/dataforseo-/);
  assert.match(captureSheet, /raw\s+responses were deliberately removed from version control/i);
});

test("current outreach guidance does not imply docks across the collection", () => {
  assert.doesNotMatch(
    read("docs/strategy/link-building-targets.md"),
    /\b(?:homes|properties)\s+with\s+(?:pools\s+and\s+)?docks\b/i
  );
});
