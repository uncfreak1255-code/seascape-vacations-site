"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..", "..");
const siteDir = process.env.SEASCAPE_SITE_DIR
  ? path.resolve(process.env.SEASCAPE_SITE_DIR)
  : path.join(repoRoot, "_site");
const briefsDir = path.join(repoRoot, "docs", "briefs");

/*
 * Why this gate exists.
 *
 * PR #654 (2026-10-02, brief docs/briefs/2026-10-owner-market-page-links.md)
 * added one contextual owner sentence to each of four ranking guest guides so
 * that the three owner market pages gained inbound links from the strongest
 * pages on the site. On 2026-10-27 the Bradenton vs Sarasota guide was
 * rewritten from a new article draft (#819) whose brief never mentioned those
 * links, and the rewrite silently dropped both of them. Nothing failed: the
 * link validator only checks that links which exist still resolve, the
 * internal-link floor only watches the shared shell, and the visual gate
 * absorbed a rewritten page. The regression was found by hand a week later.
 *
 * So: a brief's required internal links can be a contract on the built page,
 * not on the draft that first added them. A brief declares that contract with
 * `- link map: enforced` in its header (docs/briefs/README.md -> Lifecycle);
 * this gate then counts every anchor in its "Required Internal Link Map"
 * sections in the built page. Enrollment is explicit because many older
 * briefs' maps are inventories of links a page already carried, not links the
 * batch added, and some list templates or assets rather than built anchors.
 * The #654 map is also pinned below as a literal fixture, so the regression
 * this file was written for stays covered whatever its brief says.
 */

// Literal copy of the #654 brief's Required Internal Link Map (lines 25-28 of
// docs/briefs/2026-10-owner-market-page-links.md). Keyed by the built route.
const OWNER_MARKET_BRIEF = "2026-10-owner-market-page-links.md";
const REQUIRED_LINK_MAP = {
  "/guides/bradenton-vs-sarasota/": [
    "/property-management/vacation-rental-management-bradenton/",
    "/property-management/vacation-rental-management-sarasota/",
  ],
  "/guides/anna-maria-island-vs-siesta-key/": [
    "/property-management/vacation-rental-management-anna-maria-island/",
    "/property-management/vacation-rental-management-sarasota/",
  ],
  "/guides/srq-airport-to-anna-maria-island/": [
    "/property-management/vacation-rental-management-anna-maria-island/",
    "/property-management/vacation-rental-management-bradenton/",
  ],
  "/guides/best-time-visit-anna-maria-island/": [
    "/property-management/vacation-rental-management-anna-maria-island/",
    "/stays/anna-maria-island-vacation-rentals/",
  ],
};

// Known limit: the gate asserts presence, not placement. A target that the
// page also links from a guest CTA (the best-time guide's /stays/ row) stays
// green even if the owner sentence itself is dropped; the three market-page
// targets are linked only by the owner sentence on every donor guide today.

const ENFORCED_MARKER = /^- link map:\s*enforced\b/m;

// The header block is everything before the first `## ` heading; lifecycle
// and the enforcement marker live there, never in the body.
function briefHeader(markdown) {
  return markdown.split(/^## /m)[0];
}

function isLinkMapEnforced(markdown) {
  return ENFORCED_MARKER.test(briefHeader(markdown));
}

// Map a brief's source path to its built route. Returns null for a source
// that is not a page (a data file, a layout), which the parser skips. A
// pagination template (`src/stays/stays.njk`) maps to a route that is never
// built; an enforced brief lists built pages, and the sweep names a missing
// build so the author sees it.
function routeFromSource(source) {
  const trimmed = source.trim();
  if (trimmed.startsWith("src/_")) return null;
  const relative = trimmed.replace(/^src\//, "");
  if (relative === "index.njk" || relative === "index.html") return "/";
  const match = relative.match(/^(.+?)(?:\/index)?\.(?:njk|html|md)$/);
  return match ? `/${match[1]}/` : null;
}

// A target is a site path: starts with `/`, no whitespace, no template braces.
// A comma-separated entry keeps its first word, so an inline note after the
// href (`/y/ (already present)`) still yields `/y/`; an entry that is not a
// site path (a templated placeholder) is not a link the built page can carry
// and is dropped.
function targetFromEntry(entry) {
  const token = entry.trim().split(/\s+/)[0] || "";
  return /^\/[^{}]*$/.test(token) ? token : null;
}

// Parse every "## Required Internal Link Map" section (a suffixed heading such
// as "— October 5 correction" counts) into { route: [targets] }. A source
// listed on more than one line, or in more than one section, merges its
// targets. Returns null when the brief has no such section.
function linkMapFromBrief(markdown) {
  const sections = markdown.split(/^(?=## )/m).filter((chunk) => /^## Required Internal Link Map\b/.test(chunk));
  if (sections.length === 0) return null;
  const map = {};
  for (const section of sections) {
    for (const line of section.split("\n")) {
      const match = line.match(/^- (src\/\S+?):\s*(.+)$/);
      if (!match) continue;
      const route = routeFromSource(match[1]);
      if (!route) continue;
      const targets = match[2].split(",").map(targetFromEntry).filter(Boolean);
      map[route] = Array.from(new Set([...(map[route] || []), ...targets]));
    }
  }
  return map;
}

// Count anchors whose href is exactly this target. Anchors only: a
// <link rel=...> or a stylesheet href is not internal-link equity, and a
// prefix match would count a sibling route toward the target. The attribute
// must stand alone (`\\s` before it) so a `data-href` is not counted. Exact
// means exact: an enforced brief writes the href as the built page carries
// it, trailing slash included.
function countAnchors(html, href) {
  const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = html.match(new RegExp(`<a\\b[^>]*\\shref="${escaped}"`, "gi"));
  return matches ? matches.length : 0;
}

function builtPagePath(route) {
  return path.join(siteDir, ...route.split("/").filter(Boolean), "index.html");
}

// Check one link map against the built site. Returns { missing, counts }.
function checkLinkMap(map) {
  const missing = [];
  const counts = [];
  for (const [route, targets] of Object.entries(map)) {
    const file = builtPagePath(route);
    if (!fs.existsSync(file)) {
      missing.push(`${route} was not built at ${file}`);
      continue;
    }
    const html = fs.readFileSync(file, "utf8");
    for (const target of targets) {
      const count = countAnchors(html, target);
      counts.push(`${route} -> ${target}: ${count}`);
      if (count === 0) missing.push(`${route} has no anchor to ${target}`);
    }
  }
  return { missing, counts };
}

// Briefs that declared their map a contract. README.md and `_template.md`
// are not briefs.
function enforcedBriefs() {
  return fs
    .readdirSync(briefsDir)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_") && name !== "README.md")
    .sort()
    .map((name) => ({ name, markdown: fs.readFileSync(path.join(briefsDir, name), "utf8") }))
    .filter((brief) => isLinkMapEnforced(brief.markdown))
    .map((brief) => ({ name: brief.name, map: linkMapFromBrief(brief.markdown) }));
}

test("the #654 fixture matches its brief's Required Internal Link Map", () => {
  const markdown = fs.readFileSync(path.join(briefsDir, OWNER_MARKET_BRIEF), "utf8");
  assert.ok(isLinkMapEnforced(markdown), `docs/briefs/${OWNER_MARKET_BRIEF} must keep \`- link map: enforced\` in its header`);
  const map = linkMapFromBrief(markdown);
  assert.ok(map, `docs/briefs/${OWNER_MARKET_BRIEF} has no "## Required Internal Link Map" section`);
  assert.deepEqual(
    map,
    REQUIRED_LINK_MAP,
    `REQUIRED_LINK_MAP in this file and the link map in docs/briefs/${OWNER_MARKET_BRIEF} differ; change both together.`,
  );
});

test("each donor guide still carries the owner market links its brief requires", () => {
  assert.ok(
    fs.existsSync(siteDir),
    `[owner-market-link-map] no build output at ${siteDir} — run \`npm run build\` first`,
  );

  const { missing, counts } = checkLinkMap(REQUIRED_LINK_MAP);

  assert.deepEqual(
    missing,
    [],
    `Owner market link map regressed:\n  ${missing.join("\n  ")}\n\n` +
      `Counts:\n  ${counts.join("\n  ")}\n\n` +
      "If a link was intentionally removed, update the brief's Required Internal " +
      "Link Map and REQUIRED_LINK_MAP in this file together and say so in the PR.",
  );
});

test("every brief with an enforced link map still holds in the built site", () => {
  assert.ok(
    fs.existsSync(siteDir),
    `[owner-market-link-map] no build output at ${siteDir} — run \`npm run build\` first`,
  );

  const failures = [];
  for (const brief of enforcedBriefs()) {
    if (!brief.map || Object.keys(brief.map).length === 0) {
      failures.push(`docs/briefs/${brief.name}: declares \`link map: enforced\` but has no Required Internal Link Map entries`);
      continue;
    }
    const { missing } = checkLinkMap(brief.map);
    for (const line of missing) failures.push(`docs/briefs/${brief.name}: ${line}`);
  }

  assert.deepEqual(
    failures,
    [],
    `An enforced brief's link map regressed:\n  ${failures.join("\n  ")}\n\n` +
      "Restore the link, or if it was intentionally removed, update that brief's " +
      `Required Internal Link Map in the same PR (and REQUIRED_LINK_MAP in this file for ${OWNER_MARKET_BRIEF}) and say so.`,
  );
});

module.exports = { linkMapFromBrief, routeFromSource, countAnchors, checkLinkMap, isLinkMapEnforced };
