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
 * So: a brief's required internal links are a contract on the built page,
 * not on the draft that first added them. This gate reads the "Required
 * Internal Link Map" of every brief whose lifecycle is `completed` (the
 * scoped source change is finished, per docs/briefs/README.md -> Lifecycle)
 * and counts each link in the built page. Marking a brief `completed` enrolls
 * its map here with no other change. `active` briefs may still be adding
 * their links, `reference` and `superseded` briefs record history, and an
 * unlabeled brief has unknown lifecycle by the README's own rule, so none of
 * those are enforced. The #654 map is also pinned below as a literal fixture,
 * because it is the regression this file was written for.
 */

// Literal copy of the #654 brief's Required Internal Link Map (lines 24-27 of
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

function briefLifecycle(markdown) {
  const match = markdown.match(/^- lifecycle:\s*([a-z]+)/m);
  return match ? match[1] : null;
}

// Map a brief's source path to its built route. Returns null for a source
// that is not a page (a data file, a layout), which the sweep skips.
function routeFromSource(source) {
  const trimmed = source.trim();
  if (trimmed.startsWith("src/_")) return null;
  const relative = trimmed.replace(/^src\//, "");
  if (relative === "index.njk" || relative === "index.html") return "/";
  const match = relative.match(/^(.+?)(?:\/index)?\.(?:njk|html|md)$/);
  return match ? `/${match[1]}/` : null;
}

// Parse a brief's "## Required Internal Link Map" bullets
// (`- src/<path>: /a/, /b/`) into { route: [targets] }.
function linkMapFromBrief(markdown) {
  const section = markdown.split(/^## Required Internal Link Map\s*$/m)[1];
  if (!section) return null;
  const body = section.split(/^## /m)[0];
  const map = {};
  for (const line of body.split("\n")) {
    const match = line.match(/^- (src\/\S+?):\s*(.+)$/);
    if (!match) continue;
    const route = routeFromSource(match[1]);
    if (!route) continue;
    map[route] = match[2].split(",").map((href) => href.trim()).filter(Boolean);
  }
  return map;
}

// Count anchors whose href is exactly this target. Anchors only: a
// <link rel=...> or a stylesheet href is not internal-link equity, and a
// prefix match would count a sibling route toward the target. The attribute
// must stand alone (`\\s` before it) so a `data-href` is not counted.
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

function completedBriefsWithLinkMaps() {
  return fs
    .readdirSync(briefsDir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => {
      const markdown = fs.readFileSync(path.join(briefsDir, name), "utf8");
      return { name, lifecycle: briefLifecycle(markdown), map: linkMapFromBrief(markdown) };
    })
    .filter((brief) => brief.lifecycle === "completed" && brief.map && Object.keys(brief.map).length > 0);
}

test("the #654 fixture matches its brief's Required Internal Link Map", () => {
  const markdown = fs.readFileSync(path.join(briefsDir, OWNER_MARKET_BRIEF), "utf8");
  assert.equal(briefLifecycle(markdown), "completed", `${OWNER_MARKET_BRIEF} must stay a completed brief`);
  assert.deepEqual(
    linkMapFromBrief(markdown),
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

test("every completed brief's Required Internal Link Map still holds in the built site", () => {
  assert.ok(
    fs.existsSync(siteDir),
    `[owner-market-link-map] no build output at ${siteDir} — run \`npm run build\` first`,
  );

  const briefs = completedBriefsWithLinkMaps();
  assert.ok(
    briefs.some((brief) => brief.name === OWNER_MARKET_BRIEF),
    `the completed-brief sweep must include docs/briefs/${OWNER_MARKET_BRIEF}`,
  );

  const failures = [];
  for (const brief of briefs) {
    const { missing } = checkLinkMap(brief.map);
    for (const line of missing) failures.push(`docs/briefs/${brief.name}: ${line}`);
  }

  assert.deepEqual(
    failures,
    [],
    `A completed brief's link map regressed:\n  ${failures.join("\n  ")}\n\n` +
      "Restore the link, or if it was intentionally removed, update that brief's " +
      "Required Internal Link Map in the same PR and say so.",
  );
});

module.exports = { linkMapFromBrief, routeFromSource, countAnchors, checkLinkMap, briefLifecycle };
