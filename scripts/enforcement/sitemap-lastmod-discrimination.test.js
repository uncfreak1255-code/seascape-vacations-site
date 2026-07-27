const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..", "..");
const SITE_ORIGIN = "https://seascape-vacations.com";

// These checks read the RENDERED build (_site), not the sitemap template.
//
// Why this exists: every owner page is generated from the same three source
// files, so `gitLastModifiedDate('src/property-management/property-management.njk',
// 'src/_data/seoPages.json', 'src/_data/ownerProofAssets.json')` returned one
// identical value for all 27 owner URLs, and the stay loop did the same for its
// 43. Editing one page bumped every sibling's <lastmod> by the same amount, so
// the sitemap could never tell a crawler which page actually changed.
//
// That mattered concretely: on 2026-07-27, four owner pages and one stay money
// page were "Crawled - currently not indexed" with last-crawl dates of
// 2026-02-01, predating the current site's initial commit. The sitemap gave
// Google no per-page reason to come back. A template refactor that reverts to a
// per-file date would silently reintroduce that, with a green build.

function readSitemapEntries() {
  const sitemapPath = path.join(projectRoot, "_site", "sitemap.xml");
  const xml = fs.readFileSync(sitemapPath, "utf8");
  const entries = [];
  const pattern = /<loc>([^<]+)<\/loc>\s*<lastmod>([^<]*)<\/lastmod>/g;
  let match = pattern.exec(xml);
  while (match) {
    const url = match[1].trim();
    entries.push({
      route: url.startsWith(SITE_ORIGIN) ? url.slice(SITE_ORIGIN.length) : url,
      lastmod: match[2].trim(),
    });
    match = pattern.exec(xml);
  }
  return entries;
}

function generatedFamily(entries, prefix) {
  return entries.filter(
    (entry) => entry.route.startsWith(prefix) && entry.route !== prefix
  );
}

const FAMILIES = [
  { label: "owner", prefix: "/property-management/" },
  { label: "stay", prefix: "/stays/" },
];

for (const family of FAMILIES) {
  test(`${family.label} sitemap lastmod values are not all identical`, () => {
    const entries = generatedFamily(readSitemapEntries(), family.prefix);
    assert.ok(
      entries.length > 1,
      `expected more than one generated ${family.label} URL in sitemap.xml, found ${entries.length}`
    );

    const distinct = new Set(entries.map((entry) => entry.lastmod));
    assert.ok(
      distinct.size > 1,
      `all ${entries.length} ${family.label} URLs share <lastmod> ${[...distinct][0]}. ` +
        "That is the per-file-date bug: the sitemap cannot signal which page changed. " +
        "Use seoPageLastModifiedDate(group, slug, ...fallbacks) in src/sitemap.njk."
    );
  });

  test(`${family.label} sitemap lastmod values are well-formed dates`, () => {
    const entries = generatedFamily(readSitemapEntries(), family.prefix);
    for (const entry of entries) {
      assert.match(
        entry.lastmod,
        /^\d{4}-\d{2}-\d{2}$/,
        `${entry.route} has a malformed or empty <lastmod>: ${JSON.stringify(entry.lastmod)}`
      );
    }
  });
}

test("a page edited more recently than its siblings carries a newer lastmod", () => {
  // Guards the ordering, not just the distinctness. If the resolver ever
  // returned an arbitrary-but-varied value it would pass the test above while
  // still being useless to a crawler.
  const entries = generatedFamily(readSitemapEntries(), "/property-management/");
  const dates = [...new Set(entries.map((entry) => entry.lastmod))].sort();
  assert.ok(
    dates.length >= 2,
    "need at least two distinct owner lastmod values to assert ordering"
  );

  const newest = dates[dates.length - 1];
  const oldest = dates[0];
  assert.ok(
    Date.parse(newest) > Date.parse(oldest),
    `expected a real spread of owner lastmod dates, got ${oldest}..${newest}`
  );
});
