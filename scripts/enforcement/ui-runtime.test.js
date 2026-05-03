const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

function readSource(...segments) {
  return fs.readFileSync(path.join(projectRoot, ...segments), "utf8");
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

test("Bradenton vs Sarasota comparison table is wrapped for mobile scrolling", () => {
  const guide = readSource("src", "guides", "bradenton-vs-sarasota.html");

  assert.equal(guide.includes(".compare-table-wrap"), true);
  assert.match(guide, /<div class="compare-table-wrap"[^>]*aria-label="Quick comparison table"[^>]*>/);
  assert.match(guide, /<div class="compare-table-wrap"[\s\S]*?<table class="compare-table">/);
  assert.match(guide, /@media\(max-width:600px\)\{\.compare-table\{min-width:560px/);
});

test("hero ticker uses real data hooks instead of hardcoded live theater", () => {
  const homepage = readSource("src", "index.njk");
  const heroScript = readSource("src", "assets", "js", "hero-v2.js");

  for (const staleClaim of ["78&deg;F", "7:42 PM", "2 homes open", "312 stays"]) {
    assert.equal(homepage.includes(staleClaim), false, `homepage still ships ${staleClaim}`);
  }

  assert.match(homepage, /id="hero-live-source"[^>]*type="application\/json"/);
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
  // homepage.js never tried to wire fake form fields.
  assert.equal(homepageScript.includes('[name="arrive"]'), false);
  assert.equal(homepageScript.includes('[name="depart"]'), false);
  assert.equal(homepageScript.includes('[name="guests"]'), false);
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
