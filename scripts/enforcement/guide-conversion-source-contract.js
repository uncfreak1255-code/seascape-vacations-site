const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

// Source contracts for standalone, frontmatter-layout and inherited guides.
// Keep these separate from the browser event/booking simulations.
function assertGuideSourceContract(guide, projectRoot) {
  const source = fs.readFileSync(guide.file, "utf8");
  const layout = source.match(/(?:^layout:\s*|\{% extends ")([^"\s]+)/m);
  const framed = layout?.[1] === "layouts/guide-planning.njk";
  const layoutSource = layout
    ? fs.readFileSync(path.join(projectRoot, "src", "_includes", layout[1]), "utf8")
    : source;
  const kitSource = framed ? layoutSource : source;
  assert.equal(kitSource.includes('from "partials/guide-conversion-kit.njk" import guideConversionKit'), true);
  assert.equal(kitSource.includes(framed ? "guideConversionKit(guideKit)" : "guideConversionKit({"), true);
  assert.equal(source.includes(framed ? `  guideSlug: ${guide.slug}\n` : `guideSlug: "${guide.slug}"`), true, `${guide.slug} should pass its slug`);
  assert.equal(layoutSource.includes('{% include "partials/analytics-ga4.njk" %}'), true, `${guide.slug} should load analytics`);
  for (const href of guide.requiredLinks) {
    assert.equal(source.includes(href), true, `${guide.slug} should include ${href}`);
  }
}

module.exports = { assertGuideSourceContract };
