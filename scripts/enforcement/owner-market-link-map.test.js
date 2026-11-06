"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..", "..");
const siteDir = process.env.SEASCAPE_SITE_DIR
  ? path.resolve(process.env.SEASCAPE_SITE_DIR)
  : path.join(repoRoot, "_site");

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
 * not on the draft that first added them. This gate pins the brief's
 * "Required Internal Link Map" as a literal fixture and counts each link in
 * the built guide, so a later rewrite of a donor guide has to keep them or
 * change this file and say so in the PR.
 */

// Literal copy of the brief's Required Internal Link Map (lines 24-27 of
// docs/briefs/2026-10-owner-market-page-links.md). Keyed by the built route.
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

const BRIEF_PATH = path.join(repoRoot, "docs", "briefs", "2026-10-owner-market-page-links.md");

// Parse the brief's "## Required Internal Link Map" bullets so the fixture
// above cannot drift from the contract it pins without this test saying so.
function linkMapFromBrief(markdown) {
  const section = markdown.split(/^## Required Internal Link Map\s*$/m)[1];
  assert.ok(section, `[owner-market-link-map] ${BRIEF_PATH} has no "## Required Internal Link Map" section`);
  const body = section.split(/^## /m)[0];
  const map = {};
  for (const line of body.split("\n")) {
    const match = line.match(/^- src\/guides\/([a-z0-9-]+)\.html:\s*(.+)$/);
    if (!match) continue;
    map[`/guides/${match[1]}/`] = match[2].split(",").map((href) => href.trim());
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

test("the fixture matches the brief's Required Internal Link Map", () => {
  assert.deepEqual(
    linkMapFromBrief(fs.readFileSync(BRIEF_PATH, "utf8")),
    REQUIRED_LINK_MAP,
    `REQUIRED_LINK_MAP in this file and the link map in ${BRIEF_PATH} differ; change both together.`,
  );
});

test("each donor guide still carries the owner market links its brief requires", () => {
  assert.ok(
    fs.existsSync(siteDir),
    `[owner-market-link-map] no build output at ${siteDir} — run \`npm run build\` first`,
  );

  const missing = [];
  const counts = [];

  for (const [route, targets] of Object.entries(REQUIRED_LINK_MAP)) {
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

  assert.deepEqual(
    missing,
    [],
    `Owner market link map regressed:\n  ${missing.join("\n  ")}\n\n` +
      `Counts:\n  ${counts.join("\n  ")}\n\n` +
      "If a link was intentionally removed, update the brief's Required Internal " +
      "Link Map and REQUIRED_LINK_MAP in this file together and say so in the PR.",
  );
});
