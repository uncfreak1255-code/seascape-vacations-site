const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(full) : [full];
  });
}

test("Sarasota home copy does not claim walkability", () => {
  const sources = [
    "src/_data/seoPages.json",
    "src/guides/anna-maria-island-vs-longboat-key.html",
    "src/guides/sarasota-area-guide/index.html",
    "src/properties/sarasota-luxe/index.njk"
  ].map(read).join("\n");

  for (const unsupported of [
    /Sarasota Luxe[^\n]{0,240}(?:walkable|walking distance|walk to|steps from|accessible on foot)/i,
    /(?:walkable|walking distance|walk to|steps from|accessible on foot)[^\n]{0,240}Sarasota Luxe/i,
    /Sarasota (?:home|property|rental)[^\n]{0,240}(?:walkable|walking distance|walk to|steps from|accessible on foot)/i
  ]) {
    assert.doesNotMatch(sources, unsupported);
  }

  assert.doesNotMatch(sources, /walkable to downtown|walkable downtown|walking distance from downtown|walk to downtown|steps from downtown|spot you can walk from|accessible on foot|on-foot access to Sarasota|no car needed for evening/i);
});

test("fixed direct-booking and comparison savings claims stay removed", () => {
  const sources = sourceFiles(path.join(root, "src"))
    .filter((file) => /\.(?:html|njk|json|md|txt)$/.test(file))
    .filter((file) => !file.includes("anna-maria-island-vacation-cost-guide-2026"))
    .filter((file) => !file.includes("best-time-to-visit-anna-maria-island"))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");

  assert.doesNotMatch(sources, /save 10[-–]15%|save up to 15%|30[-–]40% (?:less|off)|typical direct savings/i);
});

test("P0 routes and tax quarantine remain intact", () => {
  const redirects = read("src/_redirects");
  const taxPage = read("src/property-management/property-management.njk");

  assert.match(redirects, /^\/contact\s+\/#contact\s+301$/m);
  assert.match(redirects, /^\/guides\/bradenton-vs-sarasota-cost-of-living\/\s+\/guides\/bradenton-vs-sarasota\/\s+301$/m);
  assert.match(taxPage, /noindex, nofollow/);
  assert.match(taxPage, /This tax guide is not available for reliance\./);
});
