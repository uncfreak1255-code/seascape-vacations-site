const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

function readSource(...segments) {
  return fs.readFileSync(path.join(projectRoot, ...segments), "utf8");
}

function walkFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

test("guest footer legal and support links point to real routes", () => {
  const html=readSource("_site","index.html");
  for (const route of ["guides","privacy","terms","cookies"]) {
    assert.ok(html.includes('href="/'+route+'/"'));
    assert.ok(fs.existsSync(path.join(projectRoot,"_site",route,"index.html")));
  }
  assert.doesNotMatch(html,/data-legal-modal|openLegalModal/);
  assert.ok(html.includes('mailto:info@seascape-vacations.com'));
  assert.ok(html.includes('tel:9417048545'));
});

test("Bradenton vs Sarasota comparison table fits mobile width without forced horizontal overflow", () => {
  const guide = readSource("src", "guides", "bradenton-vs-sarasota.html");

  assert.equal(guide.includes(".compare-table-wrap"), true);
  assert.match(guide, /<div class="compare-table-wrap"[^>]*aria-label="Quick comparison table"[^>]*>/);
  assert.match(guide, /<div class="compare-table-wrap"[\s\S]*?<table class="compare-table">/);
  assert.equal(guide.includes("min-width:560px"), false);
  assert.match(
    guide,
    /@media\(max-width:600px\)\{\.compare-table\{table-layout:fixed;font-size:12px\}/
  );
  assert.match(
    guide,
    /\.compare-table td,\.compare-table th\{padding:10px 8px;white-space:normal;overflow-wrap:anywhere\}/
  );
});

test("visible source templates do not ship emoji glyphs", () => {
  const allowedSymbols = new Set(["©"]);
  const emojiPattern =
    /\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*?/gu;
  const offenders = [];

  for (const filePath of walkFiles(path.join(projectRoot, "src"))) {
    const relativePath = path.relative(projectRoot, filePath);
    const source = fs.readFileSync(filePath, "utf8");
    const lines = source.split(/\r?\n/);

    for (const [index, line] of lines.entries()) {
      const matches = [...line.matchAll(emojiPattern)].map((match) => match[0]);
      const disallowed = [...new Set(matches)].filter((match) => !allowedSymbols.has(match));
      if (!disallowed.length) {
        continue;
      }
      offenders.push(`${relativePath}:${index + 1} -> ${disallowed.join(" ")}`);
    }
  }

  assert.deepEqual(offenders, []);
});

test("area guides with hero stats keep the guarded mobile CTA reveal", () => {
  const guardedAreaGuides = [
    ["anna-maria-island-area-guide", "index.html"],
    ["bradenton-area-guide", "index.html"],
    ["sarasota-area-guide", "index.html"],
    ["siesta-key-area-guide", "index.html"],
  ];

  const partial = readSource("src", "_includes", "partials", "area-guide-mobile-cta-guard.njk");
  const cardSurface = readSource("src", "_includes", "partials", "card-link-surface.njk");
  assert.match(partial, /mobile-cta-visible/);
  assert.match(partial, /#sticky-book-bar/);
  assert.match(partial, /querySelector\("\.quick-stats"\)/);
  assert.match(partial, /\{% include "partials\/card-link-surface\.njk" %\}/);
  assert.match(cardSurface, /\[data-card-link\]/);
  assert.match(cardSurface, /querySelectorAll\("\[data-card-link\]"\)/);
  assert.match(cardSurface, /function isInteractiveElement\(element, card\)/);
  assert.match(cardSurface, /interactiveAncestor && interactiveAncestor !== card/);
  assert.match(cardSurface, /window\.location\.assign\(href\)/);

  for (const segments of guardedAreaGuides) {
    const guide = readSource("src", "guides", ...segments);
    assert.match(
      guide,
      /\{% include "partials\/area-guide-mobile-cta-guard\.njk" %\}/,
      `${segments.join("/")} is missing the guarded mobile CTA include`
    );
  }
});

test("guide cards expose full-card taps without breaking inline links", () => {
  const annaMariaGuide = readSource("src", "guides", "anna-maria-island-area-guide", "index.html");
  const bradentonGuide = readSource("src", "guides", "bradenton-area-guide", "index.html");
  const sarasotaGuide = readSource("src", "guides", "sarasota-area-guide", "index.html");
  const beachComparisonGuide = readSource("src", "guides", "bradenton-vs-sarasota-beaches", "index.html");
  const familyComparisonGuide = readSource("src", "guides", "bradenton-vs-sarasota-for-families", "index.html");

  assert.match(annaMariaGuide, /class="neighborhood-card" data-card-link="\/guides\/anna-maria-city\/"/);
  assert.match(annaMariaGuide, /class="neighborhood-card" data-card-link="\/guides\/holmes-beach-area-guide\/"/);
  assert.match(annaMariaGuide, /class="neighborhood-card" data-card-link="\/guides\/bradenton-beach-area-guide\/"/);
  assert.match(annaMariaGuide, /class="neighborhood-card" data-card-link="\/stays\/gulf-coast-vacation-homes-with-dock\/"/);
  assert.match(annaMariaGuide, /class="property-card" data-card-link="\/properties\/dockside-dreams\/"/);
  assert.match(annaMariaGuide, /class="property-card" data-card-link="\/properties\/the-oasis\/"/);
  assert.match(annaMariaGuide, /class="property-card" data-card-link="\/properties\/river-house\/"/);
  assert.match(
    annaMariaGuide,
    /<p class="neighborhood-desc">The historic north end\. <a href="\/stays\/quiet-relaxing-vacation-rentals-florida\/">/
  );

  assert.match(bradentonGuide, /class="property-card" data-card-link="\/properties\/dockside-dreams\/"/);
  assert.match(bradentonGuide, /class="property-card" data-card-link="\/properties\/the-oasis\/"/);
  assert.match(bradentonGuide, /class="property-card" data-card-link="\/properties\/river-house\/"/);

  assert.match(sarasotaGuide, /class="property-card" data-card-link="\/properties\/sarasota-luxe\/"/);
  assert.equal(
    sarasotaGuide.includes(`onclick='window.location.href="https://book.seascape-vacations.com/listings/135881"'`),
    false
  );

  assert.match(beachComparisonGuide, /class="property-card" data-card-link="\/properties\/dockside-dreams\/"/);
  assert.match(beachComparisonGuide, /class="property-card" data-card-link="\/properties\/bradenton-pool-home\/"/);

  assert.match(familyComparisonGuide, /class="property-card" data-card-link="\/properties\/the-oasis\/"/);
  assert.match(familyComparisonGuide, /class="property-card" data-card-link="\/properties\/dockside-dreams\/"/);
});

test("property booking panels provide native controls and hide their mobile shortcut", () => {
  const script=readSource("src/assets/js/guest.js");
  assert.match(script,/IntersectionObserver/);
  assert.match(script,/sticky.hidden=entries\[0\].isIntersecting/);
  assert.match(readSource("src/css/guest.css"),/env\(safe-area-inset-bottom\)/);
  for(const property of require("../../src/_data/properties-fallback.json")) {
    const html=readSource("_site/properties",property.slug,"index.html");
    assert.match(html,/id="booking"/);
    assert.match(html,/data-guest-trip-form/);
    assert.match(html,/name="start" type="date"/);
    assert.match(html,/name="end" type="date"/);
    assert.match(html,/data-property-checkout/);
    assert.doesNotMatch(html,/hostaway-calendar-widget/);
  }
});

test("Anna Maria mobile sticky CTAs reserve safe-area bottom space", () => {
  const guide = readSource("src", "guides", "anna-maria-island-area-guide", "index.html");

  assert.match(guide, /\.mobile-cta-bar\{[^}]*padding:12px 16px calc\(12px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(guide, /body\{padding-bottom:calc\(70px \+ env\(safe-area-inset-bottom\)\)\}/);
  assert.match(
    guide,
    /<div style="[^"]*padding:12px 20px calc\(12px \+ env\(safe-area-inset-bottom\)\)[^"]*" id="sticky-book-bar"/
  );
});

test("homepage does not present weather or cached openings as live booking evidence", () => {
  const html=readSource("_site/index.html");
  assert.doesNotMatch(html,/hero-live-source|hero-v2.js|data-live-fact|Live home collection|homes open|312 stays/);
  assert.match(html,/data-property-photo="the-oasis"/);
  assert.doesNotMatch(html,/seascape-og-default/);
});

test("homepage exposes native trip controls and a no-JavaScript collection route", () => {
  const html=readSource("_site/index.html");
  assert.match(html,/<form[^>]+action="\/properties\/"[^>]+method="get"/);
  for(const name of ["arrive","depart"]) assert.match(html,new RegExp('name="'+name+'" type="date"'));
  assert.match(html,/<select[^>]+name="guests"/);
  assert.match(html,/<button[^>]+type="submit"/);
  assert.doesNotMatch(html,/hero-booking-field--display/);
  assert.match(html,/\/assets\/js\/guest.js/);
});

test("hero booking popovers stay in the viewport when the booking bar sits low", () => {
  const heroScript = readSource("src", "assets", "js", "hero-v2.js");

  assert.match(heroScript, /document\.body\.appendChild\(popover\);[\s\S]*?popover\.getBoundingClientRect\(\)/);
  assert.match(heroScript, /top \+ pRect\.height > window\.innerHeight - viewportPad/);
  assert.match(heroScript, /top = rect\.top - pRect\.height - gap/);
  assert.match(heroScript, /Math\.min\(top, window\.innerHeight - pRect\.height - viewportPad\)/);
  assert.match(heroScript, /Math\.min\(left, window\.innerWidth - pRect\.width - viewportPad\)/);
});

test("hero v2 uses local fonts and respects reduced motion", () => {
  const heroStyles = readSource("src", "css", "hero-v2.css");
  const heroScript = readSource("src", "assets", "js", "hero-v2.js");
  const homepage = readSource("src", "index.njk");

  assert.equal(heroStyles.includes("fonts.googleapis.com"), false);
  assert.match(heroStyles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(heroScript, /prefers-reduced-motion: reduce/);
  assert.match(heroScript, /if \(!reducedMotion && phrases\.length > 1\)/);
  assert.equal(homepage.includes('aria-live="polite"'), false);
});
