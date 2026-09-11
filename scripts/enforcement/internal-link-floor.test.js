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
 * On 2026-09-10 the Waterline shell replaced the legacy header and footer on
 * every page (#565). The legacy footer had linked the four area-guide hubs;
 * the Waterline footer did not. Nothing failed: URLs, titles, canonicals,
 * descriptions and JSON-LD were all byte-identical, the link validator only
 * checks that links which exist still resolve, and the visual gate's per-route
 * pixel tolerance absorbed the footer change without a diff. The regression was
 * only visible by counting inbound links across the whole built site, where
 * three of those hubs had quietly dropped from 59, 59 and 50 inbound pages to
 * 27, 27 and 18.
 *
 * So: a link that exists is not the same as a link that is still distributed.
 * Any edit to a shared header, footer or nav partial silently redistributes
 * internal links across every page at once, and that is exactly the change no
 * other gate in this repo can see. This one counts.
 */

// Hub pages whose internal-link distribution is load-bearing for SEO. These are
// reached from the shared shell, so every built page should carry them; the
// floor is deliberately well below 100% so that legitimately shell-less output
// (an internal QA harness, a future noindex utility page) does not fail the
// gate, while dropping the link from the shared shell does.
const PROTECTED_HUBS = [
  "/guides/anna-maria-island-area-guide/",
  "/guides/bradenton-area-guide/",
  "/guides/sarasota-area-guide/",
  "/guides/siesta-key-area-guide/",
  "/properties/",
  "/property-management/",
  "/guides/",
];

const MINIMUM_SHARE_OF_PAGES = 0.7;

function walkHtml(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkHtml(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });
}

// Match an anchor whose href is exactly this hub. Deliberately anchors only:
// a <link rel=...> or a stylesheet href is not internal-link equity, and a
// prefix match would count /guides/anna-maria-city/ toward /guides/.
function linksToHub(html, hub) {
  const escaped = hub.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`<a\\b[^>]*\\bhref="${escaped}"`, "i").test(html);
}

test("shared-shell edits keep internal links distributed to the protected hubs", () => {
  assert.ok(
    fs.existsSync(siteDir),
    `[internal-link-floor] no build output at ${siteDir} — run \`npm run build\` first`,
  );

  const pages = walkHtml(siteDir);
  assert.ok(
    pages.length > 0,
    `[internal-link-floor] ${siteDir} contained no .html pages, so this gate would pass vacuously`,
  );

  const floor = Math.ceil(pages.length * MINIMUM_SHARE_OF_PAGES);
  const shortfalls = [];

  for (const hub of PROTECTED_HUBS) {
    let inbound = 0;
    for (const page of pages) {
      if (linksToHub(fs.readFileSync(page, "utf8"), hub)) inbound += 1;
    }
    if (inbound < floor) {
      shortfalls.push(
        `${hub} is linked from ${inbound} of ${pages.length} built pages, below the floor of ${floor}`,
      );
    }
  }

  assert.deepEqual(
    shortfalls,
    [],
    `Internal-link distribution regressed:\n  ${shortfalls.join("\n  ")}\n\n` +
      "If a hub was intentionally dropped from the shared shell, remove it from " +
      "PROTECTED_HUBS in this file and say so in the PR. Do not lower the floor.",
  );
});
