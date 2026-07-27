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

function latestSharedDate(candidatePaths) {
  const dates = candidatePaths
    .map((candidatePath) => {
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
    })
    .filter(Boolean)
    .sort();
  return dates.at(-1) || null;
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
  }B‚™[˜İ[Ûˆ\İÜQ]JÜ›İ\ÛYÊHÂˆÛÛœİ[R\İÜHHÙ][R\İÜJ
NÂˆÛÛœİ\ÛÔİš[™ÈH[R\İÜK™Ù]
	ÙÜ›İ\KÉÜÛYßX
NÂˆ™]\›ˆ\ÛÔİš[™ÈÈ\ÛÔİš[™ËœÛXÙJL
Hˆ[ÂŸB‚™[˜İ[ÛˆÚ\™Y]Q›ÜŠ˜[Z[KÛYË\İÜJHÂˆÛÛœİÙ[ÔYÙQ[HH
Ù[ÔYÙ\ÖÙ˜[Z[K™Ü›İ\H×JK™š[™

YÙJHOˆYÙKœÛYÈOOHÛYÊNÂˆÛÛœİÚ\™YÛİ\˜Ù\ÈHË‹‹™˜[Z[KœÚ\™YÛİ\˜Ù\×NÂˆYˆ
˜[Z[K™Ü›İ\OOH›İÛ™\ˆˆ	‰ˆÙ[ÔYÙQ[OËœ›ÛÙ\ÜÙ]Ù^JHÂˆÚ\™YÛİ\˜Ù\Ëœ\Ú
œÜ˜Ë×Ù]KÛİÛ™\”›ÛÙ\ÜÙ]ËšœÛÛˆŠNÂˆBˆYˆ
\İÜK™YÜ˜YY
HÂˆÚ\™YÛİ\˜Ù\Ëœ\Ú
œÜ˜Ë×Ù]KÜÙ[ÔYÙ\ËšœÛÛˆŠNÂˆB‚ˆÛÛœİ]\ÈHÛ]\İÚ\™Y]JÚ\™YÛİ\˜Ù\ÊWNÂˆYˆ
˜[Z[K™Ü›İ\OOH˜XØ][Û™\ˆŠHÂˆ]\Ëœ\Ú
]\İÛİ™\›˜[˜ÙQ]JÛYÊJNÂˆBˆ™]\›ˆ]\Ë™š[\Š›ÛÛX[ŠKœÛÜ

K˜]
LJH[ÂŸB‚™›Üˆ
ÛÛœİ˜[Z[HÙˆSRSQTÊHÂˆ\İ
	Ù˜[Z[K›X™[HÚ][X\\İ[Ù\]X[ÈX^
[H]KÚ\™Y\Ûİ\˜ÙH]JH\ˆT“

HOˆÂˆÛÛœİ\İÜHHÙ][R\İÜJ
NÂˆÛÛœİ[šY\ÈHÙ[™\˜]Y˜[Z[J™XYÚ][X\[šY\Ê
K˜[Z[Kœ™Yš^
NÂˆ\ÜÙ\›ÚÊˆ[šY\Ë›[™İˆKˆ^XİY[Ü™H[ˆÛ™HÙ[™\˜]Y	Ù˜[Z[K›X™[HT“[ˆÚ][X\[›İ[™	Ù[šY\Ë›[™İXˆ
NÂ‚ˆÛÛœİZ\ÛX]Ú\ÈH×NÂˆ›Üˆ
ÛÛœİ[HÙˆ[šY\ÊHÂˆÛÛœİÛYÈH[Kœ›İ]KœÛXÙJ˜[Z[Kœ™Yš^›[™İ
Kœ™\XÙJ×ÉËˆŠNÂˆÛÛœİ[Q]HH\İÜQ]J˜[Z[K™Ü›İ\ÛYÊNÂˆÛÛœİÚ\™Y]HHÚ\™Y]Q›ÜŠ˜[Z[KÛYË\İÜJNÂˆ\ÜÙ\›ÚÊÚ\™Y]KÛİ[›İ™\ÛÛ™HHÚ\™Y\Ûİ\˜ÙH]H›Üˆ	Ù˜[Z[K›X™[KÉÜÛYßX
NÂˆÛÛœİØ[™Y]\ÈHÙ[Q]KÚ\™Y]WK™š[\Š›ÛÛX[ŠKœÛÜ

NÂˆÛÛœİ^XİYHØ[™Y]\Ë˜]
LJNÂˆYˆ
[K›\İ[ÙOOH^XİY
HÂˆZ\ÛX]Ú\Ëœ\Ú
ˆ	Ù[Kœ›İ]_Nˆ\İ[Ùˆ	Ù[K›\İ[ÙK^XİYX^
[H	Ù[Q]_KÚ\™Y	ÜÚ\™Y]_JHH	Ù^XİYXˆ
NÂˆBˆB‚ˆ\ÜÙ\™Y\\]X[
ˆZ\ÛX]Ú\Ëˆ×KˆÚ][X\\İ[ÙÙ\È›İÛ›ÜˆH\‹Y[HÛÛ˜Xİ—ˆ	ÛZ\ÛX]Ú\Ëš›Ú[Š—ˆŠ_W˜
Âˆ•\ÙHÙ[ÔYÙS\İ[ÙYšYY]JÜ›İ\ÛYË‹‹™˜[˜XÚÜÊH[ˆÜ˜ËÜÚ][X\›ššÈÚ]ˆ
Âˆ™˜[˜XÚÜÈX]Ú[™ÈHØÛÜYÚ\™YÛİ\˜Ù\È[ˆ\È\İˆ‚ˆ
NÂˆJNÂ‚ˆ\İ
	Ù˜[Z[K›X™[HÚ][X\\İ[Ù˜[Y\È\™HÙ[Y›Ü›YY]\Ø

HOˆÂˆÛÛœİ[šY\ÈHÙ[™\˜]Y˜[Z[J™XYÚ][X\[šY\Ê
K˜[Z[Kœ™Yš^
NÂˆ›Üˆ
ÛÛœİ[HÙˆ[šY\ÊHÂˆ\ÜÙ\›X]Ú
ˆ[K›\İ[Ùˆ×—ÍKWÌŸKWÌŸIËˆ	Ù[Kœ›İ]_H\ÈHX[›Ü›YYÜˆ[\H\İ[Ùˆ	Ò”ÓÓ‹œİš[™ÚYJ[K›\İ[Ù
_Xˆ
NÂˆBˆJNÂŸB