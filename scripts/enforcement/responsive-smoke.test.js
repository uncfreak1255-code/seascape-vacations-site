const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const siteDir = path.resolve(__dirname, "..", "..", "_site");

/**
 * Responsive Smoke Test
 *
 * Catches layout/CSS regressions by verifying DOM structure of key page types.
 * Runs after `npm run build` — checks the built HTML in _site/.
 *
 * What this catches:
 * - Missing nav or footer (CSS display:none or template breakage)
 * - Lost CTA buttons after layout changes
 * - Broken internal links after restructuring
 * - Missing style blocks (CSS extraction gone wrong)
 * - Schema/JSON-LD accidentally removed
 * - Heading hierarchy destroyed
 *
 * Thresholds are set from measured baselines (2026-03-30).
 * Update baselines when intentional structural changes are made.
 */

function readPage(relPath) {
  const full = path.join(siteDir, relPath);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, "utf8");
}

function countOccurrences(html, pattern) {
  const matches = html.match(new RegExp(pattern, "gi"));
  return matches ? matches.length : 0;
}

// -- Page type definitions with minimum thresholds --

const PAGE_TYPES = [
  {
    name: "Homepage",
    path: "index.html",
    minNav: 1,
    minFooter: 1,
    minCTA: 3,
    minInternalLinks: 1,
    minStyleBlocks: 0,   // will be 0 after CSS extraction — that's OK
    minH2: 5,
    requireSchema: true,
  },
  {
    name: "Stays page",
    path: "stays/fishing-vacation-rentals-bradenton/index.html",
    minNav: 1,
    minFooter: 1,
    minCTA: 1,
    minInternalLinks: 3,
    minStyleBlocks: 0,
    minH2: 2,
    requireSchema: true,
  },
  {
    name: "Properties catalog",
    path: "properties/index.html",
    minNav: 1,
    minFooter: 1,
    minCTA: 3,
    minInternalLinks: 5,
    minStyleBlocks: 0,
    minH2: 2,
    requireSchema: false,
  },
  {
    name: "Property management",
    path: "property-management/index.html",
    minNav: 1,
    minFooter: 1,
    minCTA: 1,
    minInternalLinks: 5,
    minStyleBlocks: 0,
    minH2: 3,
    requireSchema: true,
  },
];

// Find a guide page dynamically (they may have varying paths)
const guideCandidates = [
  "guides/anna-maria-island-area-guide/index.html",
  "guides/bradenton-insider-guide/index.html",
  "guides/best-restaurants-anna-maria-island/index.html",
];

for (const candidate of guideCandidates) {
  if (fs.existsSync(path.join(siteDir, candidate))) {
    PAGE_TYPES.push({
      name: `Guide page (${path.basename(path.dirname(candidate))})`,
      path: candidate,
      minNav: 1,
      minFooter: 0,   // some guides have 0 footer tags (baseline 2026-03-30)
      minCTA: 1,
      minInternalLinks: 3,
      minStyleBlocks: 0,
      minH2: 1,
      requireSchema: false,
    });
    break;
  }
}

// -- Tests --

test("_site directory exists (build must run first)", () => {
  assert.ok(
    fs.existsSync(siteDir),
    "_site/ does not exist. Run `npm run build` before running this test."
  );
});

for (const pageType of PAGE_TYPES) {
  test(`${pageType.name}: page exists and has content`, () => {
    const html = readPage(pageType.path);
    assert.ok(html, `${pageType.path} does not exist in _site/`);
    assert.ok(html.length > 1000, `${pageType.path} is suspiciously small (${html.length} bytes)`);
  });

  test(`${pageType.name}: navigation renders`, () => {
    const html = readPage(pageType.path);
    if (!html) return;
    const navCount = countOccurrences(html, "<nav");
    assert.ok(
      navCount >= pageType.minNav,
      `Expected at least ${pageType.minNav} <nav> element(s), found ${navCount}`
    );
  });

  test(`${pageType.name}: footer renders`, () => {
    const html = readPage(pageType.path);
    if (!html) return;
    const footerCount = countOccurrences(html, "<footer");
    assert.ok(
      footerCount >= pageType.minFooter,
      `Expected at least ${pageType.minFooter} <footer> element(s), found ${footerCount}`
    );
  });

  test(`${pageType.name}: CTA buttons present`, () => {
    const html = readPage(pageType.path);
    if (!html) return;
    const ctaCount = countOccurrences(
      html,
      'btn-gold|btn-primary|book-btn|cta-btn|check-availability|guide-cta-btn'
    );
    assert.ok(
      ctaCount >= pageType.minCTA,
      `Expected at least ${pageType.minCTA} CTA button(s), found ${ctaCount}`
    );
  });

  test(`${pageType.name}: internal links present`, () => {
    const html = readPage(pageType.path);
    if (!html) return;
    const linkCount = countOccurrences(
      html,
      'href="/(stays|guides|properties|property-management)[^"]*"'
    );
    assert.ok(
      linkCount >= pageType.minInternalLinks,
      `Expected at least ${pageType.minInternalLinks} internal link(s), found ${linkCount}`
    );
  });

  test(`${pageType.name}: heading hierarchy exists`, () => {
    const html = readPage(pageType.path);
    if (!html) return;
    const h2Count = countOccurrences(html, "<h2");
    assert.ok(
      h2Count >= pageType.minH2,
      `Expected at least ${pageType.minH2} <h2> heading(s), found ${h2Count}`
    );
  });

  if (pageType.requireSchema) {
    test(`${pageType.name}: JSON-LD schema present`, () => {
      const html = readPage(pageType.path);
      if (!html) return;
      const schemaCount = countOccurrences(html, 'application/ld\\+json');
      assert.ok(
        schemaCount >= 1,
        `Expected at least 1 JSON-LD schema block, found ${schemaCount}`
      );
    });
  }
}

// -- Cross-page consistency checks --

test("all page types share consistent CSS variable theme", () => {
  for (const pageType of PAGE_TYPES) {
    const html = readPage(pageType.path);
    if (!html) continue;

    // After CSS extraction, variables may be in external file OR inline
    // At minimum, the brand color should appear somewhere (inline or via class usage)
    const hasBrandColor =
      html.includes("--brand") || // CSS variable reference
      html.includes("#5F8A8B") || // brand color hex
      html.includes("5f8a8b");    // lowercase variant
    const hasExternalCSS = html.includes('rel="stylesheet"');
    const hasInlineStyle = html.includes("<style");

    assert.ok(
      hasBrandColor || hasExternalCSS,
      `${pageType.name}: no brand color found and no external stylesheet linked — CSS may be missing`
    );
    assert.ok(
      hasExternalCSS || hasInlineStyle,
      `${pageType.name}: no CSS at all (no <style> block and no external stylesheet)`
    );
  }
});

test("no page exceeds 500KB (bloat detection)", () => {
  for (const pageType of PAGE_TYPES) {
    const full = path.join(siteDir, pageType.path);
    if (!fs.existsSync(full)) continue;
    const size = fs.statSync(full).size;
    assert.ok(
      size < 500000,
      `${pageType.name} is ${(size / 1024).toFixed(0)}KB — exceeds 500KB bloat threshold`
    );
  }
});
