const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const { buildSeoPageHistory } = require("../seo/seo-page-history.js");

const projectRoot = path.resolve(__dirname, "..", "..");
const SITE_ORIGIN = "https://seascape-vacations.com";

// These checks read the RENDERED build (_site) and verify the lastmod CONTRACT:
// every generated owner and stay URL's <lastmod> must equal its entry-level
// seoPages.json history date when that history is available.
//
// Why not max(entry date, template/shared-data date): that flattens every page
// in the family whenever a shared template or support file changes. That is the
// original failure pattern. Shared rendering changes are covered by build and
// release proof; sitemap lastmod stays page-content-specific so Google can see
// which generated pages actually changed.
//
// In shallow-clone degraded mode, entry history is intentionally empty and the
// resolver falls back to seoPages.json plus shared source dates. This rendered
// equality check skips that degraded mode; resolver degradation itself is tested
// against fixtures in seo-page-history.test.js.
//
// Resolver correctness (first-parent walk, sibling-branch isolation, shallow
// degradation) is proven separately against fixture repositories in
// seo-page-history.test.js.
//
// Why this matters: on 2026-07-27, five money pages sat "Crawled - currently
// not indexed" with last-crawl dates predating the site's initial commit. All
// 27 owner URLs shared one <lastmod>, so the sitemap never told Google which
// page changed.

const FAMILIES = [
  {
    label: "owner",
    group: "owner",
    prefix: "/property-management/",
  },
  {
    label: "stay",
    group: "vacationer",
    prefix: "/stays/",
  },
];

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
  return entries.filter((entry) => entry.route.startsWith(prefix) && entry.route !== prefix);
}

let entryHistory = null;
function getEntryHistory() {
  if (!entryHistory) {
    entryHistory = buildSeoPageHistory({ cwd: projectRoot, warn: () => {} });
  }
  return entryHistory;
}

function historyDate(group, slug) {
  const entryHistory = getEntryHistory();
  const isoString = entryHistory.get(`${group}/${slug}`);
  return isoString ? isoString.slice(0, 10) : null;
}

for (const family of FAMILIES) {
  test(`${family.label} sitemap lastmod equals entry history per URL`, () => {
    const history = getEntryHistory();
    if (history.degraded) {
      return;
    }

    const entries = generatedFamily(readSitemapEntries(), family.prefix);
    assert.ok(
      entries.length > 1,
      `expected more than one generated ${family.label} URL in sitemap.xml, found ${entries.length}`
    );

    const mismatches = [];
    for (const entry of entries) {
      const slug = entry.route.slice(family.prefix.length).replace(/\/$/, "");
      const expected = historyDate(family.group, slug);
      assert.ok(expected, `missing entry history date for ${entry.route}`);
      if (entry.lastmod !== expected) {
        mismatches.push(
          `${entry.route}: <lastmod> ${entry.lastmod}, expected entry history date ${expected}`
        );
      }
    }

    assert.deepEqual(
      mismatches,
      [],
      `sitemap lastmod does not honor the per-entry contract:\n  ${mismatches.join("\n  ")}\n` +
        "Use seoPageLastModifiedDate(group, slug, ...fallbacks) in src/sitemap.njk; " +
        "the fallback paths must not override available entry history."
    );
  });

  test(`${family.label} sitemap lastmod preserves page-level discrimination`, () => {
    const history = getEntryHistory();
    if (history.degraded) {
      return;
    }

    const entries = generatedFamily(readSitemapEntries(), family.prefix);
    const distinct = new Set(entries.map((entry) => entry.lastmod));
    assert.ok(
      distinct.size > 1,
      `${family.label} generated URLs all share ${[...distinct][0]}; lastmod flattened again`
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

test("the entry-history resolver discriminates between entries on this repository", () => {
  // Not a rendered check: proves the resolver reads real per-entry history here,
  // whatever the sitemap currently combines it with. If this ever collapses to
  // one date on a full clone, the resolver is broken regardless of template
  // recency. Skipped in the shallow degraded mode, where an empty map is the
  // documented, deliberate behaviour (see seo-page-history.test.js).
  const history = buildSeoPageHistory({ cwd: projectRoot, warn: () => {} });
  if (history.degraded) {
    return;
  }
  assert.ok(history.size > 0, "entry history is empty on a full clone");
  const distinct = new Set([...history.values()].map((isoString) => isoString.slice(0, 10)));
  assert.ok(
    distinct.size > 1,
    `entry history resolved ${history.size} entries but only ${distinct.size} distinct date(s)`
  );
});
