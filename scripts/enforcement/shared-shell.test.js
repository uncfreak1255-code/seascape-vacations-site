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
 * Waterline design floor F5 (DESIGN.md "Floors"): every built HTML page
 * carries exactly one `class="g-header"` and one `class="g-footer"` — the
 * shared guest shell. This walks the built site directly (not the browser)
 * so it also runs in the fast `npm run test:unit` node:test gate.
 *
 * Only *.html output is in scope; sitemap.xml, robots.txt, llms.txt and the
 * /ai/*.json discovery feeds are not pages and are not walked at all.
 *
 * Exemption list: pages that are real build output under _site but are not
 * guest-facing routes, so the shared shell does not apply to them. Keep this
 * list short — a route a guest can land on belongs in the fix, not here.
 */
const EXEMPTIONS = {
  "internal/ai-engine-click-test/index.html":
    'Noindex internal QA harness (meta robots "noindex, follow") for verifying AI-labeled click tracking. Not a guest-facing route; ships with no shared header/footer by design.',
};

function listHtmlFiles(dir) {
  const out = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        out.push(full);
      }
    }
  };
  walk(dir);
  return out;
}

function toPosixRelative(fromDir, filePath) {
  return path.relative(fromDir, filePath).split(path.sep).join("/");
}

test("site output directory exists (build the lane output before running this test)", () => {
  assert.ok(
    fs.existsSync(siteDir),
    `${siteDir} does not exist. Build first (e.g. SEASCAPE_VISUAL_TEST=1 npx @11ty/eleventy --output=<dir>) ` +
      "and point SEASCAPE_SITE_DIR at it, or run from a checkout that already has _site/."
  );
});

test("every non-exempt HTML page has exactly one g-header and one g-footer (F5)", () => {
  if (!fs.existsSync(siteDir)) {
    // Reported by the dedicated existence test above; do not double-fail here.
    return;
  }

  const offenders = [];
  const unusedExemptions = new Set(Object.keys(EXEMPTIONS));

  for (const filePath of listHtmlFiles(siteDir)) {
    const relativePath = toPosixRelative(siteDir, filePath);

    if (Object.prototype.hasOwnProperty.call(EXEMPTIONS, relativePath)) {
      unusedExemptions.delete(relativePath);
      continue;
    }

    // Count only markup the browser will render: an HTML comment or a
    // <template> still contains the literal class string, so a header that was
    // commented out rather than removed would otherwise pass this gate.
    const html = fs
      .readFileSync(filePath, "utf8")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<template[\s\S]*?<\/template>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ");
    const headerCount = (html.match(/class="g-header"/g) || []).length;
    const footerCount = (html.match(/class="g-footer"/g) || []).length;

    if (headerCount !== 1 || footerCount !== 1) {
      offenders.push(`${relativePath}: g-header x${headerCount}, g-footer x${footerCount}`);
    }
  }

  assert.equal(
    offenders.length,
    0,
    `F5 shared-shell violations — ${offenders.length} page(s) without exactly one shared header and footer:\n` +
      offenders.join("\n")
  );

  // An exemption path that no longer exists in the build is stale, not safe:
  // it means the entry is silently exempting nothing (or the route moved) —
  // surface that instead of letting the list drift.
  assert.equal(
    unusedExemptions.size,
    0,
    `Stale F5 exemption path(s) not found in ${siteDir} (remove or fix the path):\n` +
      Array.from(unusedExemptions).join("\n")
  );
});
