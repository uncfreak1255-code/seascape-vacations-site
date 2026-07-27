const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("fs");
const path = require("path");

const { buildSeoPageHistory } = require("../seo/seo-page-history.js");

const projectRoot = path.resolve(__dirname, "..", "..");
const SITE_ORIGIN = "https://seascape-vacations.com";

// These checks read the RENDERED build (_site) and verify the lastmod CONTRACT:
// every generated owner and stay URL's <lastmod> must equal
//
//   max( that entry's own last-change date in seoPages.json history,
//        the newest shared-source date for its family )
//
// Why equality and not "dates must differ": the first version of this test
// asserted the family's dates were not all identical. Review caught two holes.
// A legitimate template commit updates every page's rendered output, so
// identical dates are CORRECT that week and the diversity assertion rejected a
// valid build. And the identical-dates escape hatch added to compensate could
// be satisfied by the original broken per-file resolver whenever production
// dates happened to line up. The equality contract has neither hole: it is
// deterministic per URL, it cannot be lucked through, and it holds in the
// shallow-clone degraded mode too (entry history is empty there, so the
// expected value collapses to the shared-source date by design).
//
// Resolver correctness (first-parent walk, sibling-branch isolation, shallow
// degradation) is proven separately against fixture repositories in
// seo-page-history.test.js.
//
// Why this matters: on 2026-07-27, five money pages sat "Crawled - currently
// not indexed" with last-crawl dates predating the site's initial commit. All
// 27 owner URLs shared one <lastmod>, so the sitemap never told Google which
// page changed.

// Must mirror the fallback paths passed in src/sitemap.njk.
const FAMILIES = [
  {
    label: "owner",
    group: "owner",
    prefix: "/property-management/",
    sharedSources: [
      "src/property-management/property-management.njk",
      "src/_data/ownerProofAssets.json",
    ],
  },
  {
    label: "stay",
    group: "vacationer",
    prefix: "/stays/",
    sharedSources: [
      "src/stays/stays.njk",
      "src/_data/staysPages.js",
      "src/_data/seoGovernance.js",
    ],
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

function latestSharedDate(candidatePaths) {
  const dates = candidatePaths
    .map((candidatePath) => {
      try {
        const isoString = execFileSync(
          "git",
          ["log", "-1", "--format=%cI", "--", candidatePath],
          { cwd: projectRoot, encoding: "utf8" }
        ).trim();
        return isoString ? isoString.slice(0, 10) : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort();
  return dates[dates.length - 1] || null;
}

let entryHistory = null;
function historyDate(group, slug) {
  if (!entryHistory) {
    entryHistory = buildSeoPageHistory({ cwd: projectRoot, warn: () => {} });
  }
  const isoString = entryHistory.get(`${group}/${slug}`);
  return isoString ? isoString.slice(0, 10) : null;
}

for (const family of FAMILIES) {
  test(`${family.label} sitemap lastmod equals max(entry date, shared-source date) per URL`, () => {
    const entries = generatedFamily(readSitemapEntries(), family.prefix);
    assert.ok(
      entries.length > 1,
      `expected more than one generated ${family.label} URL in sitemap.xml, found ${entries.length}`
    );

    const sharedDate = latestSharedDate(family.sharedSources);
    assert.ok(sharedDate, `could not resolve a shared-source date for ${family.label}`);

    const mismatches = [];
    for (const entry of entries) {
      const slug = entry.route.slice(family.prefix.length).replace(/\/$/, "");
      const entryDate = historyDate(family.group, slug);
      const candidates = [entryDate, sharedDate].filter(Boolean).sort();
      const expected = candidates[candidates.length - 1];
      if (entry.lastmod !== expected) {
        mismatches.push(
          `${entry.route}: <lastmod> ${entry.lastmod}, expected max(entry ${entryDate}, shared ${sharedDate}) = ${expected}`
        );
      }
    }

    assert.deepEqual(
      mismatches,
      [],
      `sitemap lastmod does not honor the per-entry contract:\n  ${mismatches.join("\n  ")}\n` +
        "Use seoPageLastModifiedDate(group, slug, ...fallbacks) in src/sitemap.njk with " +
        "fallbacks matching FAMILIES.sharedSources in this test."
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
