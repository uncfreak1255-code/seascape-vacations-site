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

test("homepage footer legal links use semantic buttons wired through data attributes", () => {
  const homepage = readSource("src", "index.njk");
  const homepageScript = readSource("src", "assets", "js", "homepage.js");
  const homepageStyles = readSource("src", "css", "homepage.css");

  assert.match(
    homepage,
    /<button[^>]*class="footer-link footer-link--button"[^>]*data-legal-modal="support"/
  );
  assert.match(
    homepage,
    /<button[^>]*class="footer-link footer-link--button"[^>]*data-legal-modal="privacy"/
  );
  assert.equal(homepage.includes('<span class="footer-link" onclick="openLegalModal'), false);
  assert.equal(
    homepageScript.includes("document.querySelectorAll('[data-legal-modal]')"),
    true
  );
  assert.equal(homepageStyles.includes(".footer-link--button"), true);
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

test("property catalog cards expose non-nested detail taps without swallowing Check Dates", () => {
  const catalog = readSource("src", "properties", "index.njk");

  assert.match(catalog, /\.catalog-card \{[\s\S]*?position: relative;/);
  assert.match(catalog, /\.catalog-card-detail-link \{[\s\S]*?position: absolute;[\s\S]*?inset: 0;[\s\S]*?z-index: 1;/);
  assert.match(catalog, /class="catalog-card"[\s\S]*?data-detail-url="\{\{ property\.pageUrl \}\}"[\s\S]*?data-detail-track-label="\{\{ property\.name \}\}"/);
  assert.match(catalog, /class="catalog-card-detail-link"[\s\S]*?href="\{\{ property\.pageUrl \}\}"[\s\S]*?data-placement="catalog_card_surface"/);
  assert.match(catalog, /class="catalog-title-link"[\s\S]*?data-track-event="catalog_view_details_click"/);
  assert.match(catalog, /class="btn btn-brand catalog-check-dates"[\s\S]*?data-track-event="catalog_book_direct_click"/);
  assert.equal(catalog.includes('<a class="catalog-card"'), false);
  assert.equal(catalog.includes('role="link"'), false);
  assert.match(catalog, /function isInteractiveElement\(element\)/);
  assert.match(catalog, /if \(isInteractiveElement\(event\.target\)\) return;/);
  assert.match(catalog, /openCardDetails\(card, "catalog_card_surface"\)/);
});

test("property catalog mobile filters wrap without horizontal scroll padding", () => {
  const catalog = readSource("src", "properties", "index.njk");

  assert.match(
    catalog,
    /\.catalog-filters \{[\s\S]*?flex-wrap: wrap;[\s\S]*?overflow: visible;[\s\S]*?margin: 0 0 22px;[\s\S]*?padding: 0;/
  );
  assert.match(catalog, /\.catalog-filter \{[\s\S]*?flex: 0 1 auto;/);
  assert.equal(catalog.includes("overflow-x: auto;"), false);
  assert.equal(catalog.includes("scroll-padding-inline:"), false);
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

test("property booking calendars collapse cleanly on mobile without sticky CTA overlap", () => {
  const propertyPages = [
    ["dockside-dreams", "206016"],
    ["the-oasis", "189511"],
    ["river-house", "135880"],
    ["sarasota-luxe", "135881"],
    ["bradenton-pool-home", "487798"],
  ];
  const mobileCalendarFix = readSource(
    "src",
    "_includes",
    "partials",
    "hostaway-mobile-calendar-fix.njk"
  );

  assert.match(mobileCalendarFix, /\.sticky-book\.sticky-book--hidden/);
  assert.match(mobileCalendarFix, /transform: translateY\(calc\(100% \+ env\(safe-area-inset-bottom\)\)\)/);
  assert.match(mobileCalendarFix, /#hostaway-calendar-widget \.gRAtCh/);
  assert.match(mobileCalendarFix, /max-width: none/);
  assert.match(mobileCalendarFix, /#hostaway-calendar-widget \.dvfhrq/);
  assert.match(mobileCalendarFix, /#hostaway-calendar-widget \.hKhBw/);
  assert.match(mobileCalendarFix, /grid-template-columns: repeat\(7, minmax\(0, 1fr\)\)/);
  assert.match(mobileCalendarFix, /grid-auto-rows: 2\.2rem/);
  assert.match(mobileCalendarFix, /document\.querySelector\("\.sticky-book"\)/);
  assert.match(mobileCalendarFix, /document\.getElementById\("check-availability"\)/);
  assert.match(mobileCalendarFix, /new IntersectionObserver/);
  assert.match(mobileCalendarFix, /stickyBook\.classList\.toggle\("sticky-book--hidden", hidden\)/);

  for (const [slug, listingId] of propertyPages) {
    const page = readSource("src", "properties", slug, "index.njk");
    assert.match(page, /\{% include "partials\/hostaway-mobile-calendar-fix\.njk" %\}/);
    assert.match(page, /window\.matchMedia\('\(min-width:48rem\)'\)\.matches\?2:1/);
    assert.match(page, new RegExp(`listingId:${listingId},`));
    assert.match(page, /numberOfMonths:numberOfMonths/);
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

test("hero ticker uses real data hooks instead of hardcoded live theater", () => {
  const homepage = readSource("src", "index.njk");
  const heroScript = readSource("src", "assets", "js", "hero-v2.js");

  for (const staleClaim of ["78&deg;F", "7:42 PM", "2 homes open", "312 stays"]) {
    assert.equal(homepage.includes(staleClaim), false, `homepage still ships ${staleClaim}`);
  }

  assert.match(homepage, /id="hero-live-source"[^>]*type="application\/json"/);
  assert.match(homepage, /id="hero-property-source"[^>]*type="application\/json"/);
  assert.match(homepage, /data-live-fact="weather"/);
  assert.match(homepage, /data-live-fact="sunset"/);
  assert.match(homepage, /properties\.length/);
  assert.match(heroScript, /fetch\(config\.weatherUrl/);
  assert.match(heroScript, /fetch\(config\.sunsetUrl/);
  assert.match(heroScript, /data-source-label/);
});

test("hero booking pill exposes real controls, not inert fakes", () => {
  const homepage = readSource("src", "index.njk");
  const heroScript = readSource("src", "assets", "js", "hero-v2.js");
  const homepageScript = readSource("src", "assets", "js", "homepage.js");

  // The Where field is a real <button>, not a <label> wrapping a <select>.
  assert.match(
    homepage,
    /<button type="button" class="hero-booking-field hero-booking-field--primary"/
  );
  // Arrive / Depart / Guests are real <button> elements that open popovers.
  const fieldButtonCount = (
    homepage.match(/<button type="button" class="hero-booking-field"[^-]/g) || []
  ).length;
  assert.equal(fieldButtonCount, 3);
  // No aria-hidden inert markers on field cells.
  assert.equal(
    homepage.includes('class="hero-booking-field hero-booking-field--display"'),
    false
  );
  assert.equal(homepage.includes('id="location-select"'), false);
  // Real interaction handlers are wired in hero-v2.js.
  assert.match(heroScript, /booking\.addEventListener\('submit'/);
  assert.match(heroScript, /whereField\.addEventListener\('click'/);
  assert.match(heroScript, /arriveField\.addEventListener\('click'/);
  assert.match(heroScript, /departField\.addEventListener\('click'/);
  assert.match(heroScript, /guestsField\.addEventListener\('click'/);
  assert.match(heroScript, /document\.getElementById\('hero-property-source'\)/);
  assert.match(heroScript, /home match/);
  assert.equal(heroScript.includes("home available"), false);
  assert.equal(homepage.includes("{{ properties.length }} homes direct"), false);
  assert.equal(heroScript.includes("var HOMES = ["), false);
  assert.equal(heroScript.includes("dockside-dreams',"), false);
  // homepage.js never tried to wire fake form fields.
  assert.equal(homepageScript.includes('[name="arrive"]'), false);
  assert.equal(homepageScript.includes('[name="depart"]'), false);
  assert.equal(homepageScript.includes('[name="guests"]'), false);
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
