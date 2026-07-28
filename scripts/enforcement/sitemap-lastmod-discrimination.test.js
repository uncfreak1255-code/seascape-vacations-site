const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("fs");
const path = require("path");

const { buildSeoPageHistory } = require("../seo/seo-page-history.js");
const seoPages = require("../../src/_data/seoPages.json");

const projectRoot = path.resolve(__dirname, "..", "..");
const SITE_ORIGIN = "https://seascape-vacations.com";

// These checks read the RENDERED build (_site) and verify the lastmod CONTRACT:
// every generated owner and stay URL's <lastmod> must equal the newest relevant
// entry history, rendered shared input, and scoped governance/proof date.
//
// In shallow-clone degraded mode, entry history is intentionally empty and the
// resolver falls back to seoPages.json plus shared source dates. The rendered
// equality check below only asserts per-page equality when full entry history
// exists; resolver degradation itself is tested against fixtures in
// seo-page-history.test.js.
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
    sharedSources: ["src/property-management/property-management.njk"],
  },
  {
    label: "stay",
    group: "vacationer",
    prefix: "/stays/",
    sharedSources: ["src/stays/stays.njk", "src/_data/staysPages.js"],
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

function latestGovernanceDate(slug) {
  try {
    const isoString = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", `-S"${slug}"`, "--", "src/_data/seoGovernance.js"],
      { cwd: projectRoot, encoding: "utf8" }
    )
      .trim();
    return isoString ? isoString.slice(0, 10) : null;
  } catch {
    return null;
  }
}

function latestFileDate(candidatePath) {
  try {
    const isoString = execFileSync("git", ["log", "-1", "--format=%cI", "--", candidatePath], {
      cwd: projectRoot,
      encoding: "utf8",
    })
      .trim();
    return isoString ? isoString.slice(0, 10) : null;
  } catch {
    return null;
  }
}

function historyDate(group, slug) {
  const entryHistory = getEntryHistory();
  const isoString = entryHistory.get(`${group}/${slug}`);
  return isoString ? isoString.slice(0, 10) : null;
}

function expectedPageDate(family, slug) {
  const dates = [historyDate(family.group, slug), ...family.sharedSources.map(latestFileDate)];
  if (family.group === "vacationer") {
    dates.push(latestGovernanceDate(slug));
  }
  if (family.group === "owner") {
    const seoPageEntry = (seoPages.owner || []).find((page) => page.slug === slug);
    if (seoPageEntry?.proofAssetKey) {
      dates.push(latestFileDate("src/_data/ownerProofAssets.json"));
    }
  }
  return dates.filter(Boolean).sort().at(-1) || null;
}

for (const family of FAMILIES) {
  test(`${family.label} sitemap lastmod equals page-specific provenance per URL`, () => {
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
      const expected = expectedPageDate(family, slug);
      assert.ok(expected, `could not resolve a page-specific date for ${family.label}/${slug}`);
      if (entry.lastmod !== expected) {
        mismatches.push(
          `${entry.route}: <lastmod> ${entry.lastmod}, expected page-specific date ${expected}`
        );
      }
    }

    assert.deepEqual(
      mismatches,
      [],
      `sitemap lastmod does not honor the per-entry contract:\n  ${mismatches.join("\n  ")}\n` +
        "Use seoPageLastModifiedDate(group, slug, ...fallbacks) without letting " +
        "shared fallback paths override available page-specific history."
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
