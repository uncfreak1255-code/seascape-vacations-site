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

test("hero booking pill does not expose inert fake controls", () => {
  const homepage = readSource("src", "index.njk");
  const homepageScript = readSource("src", "assets", "js", "homepage.js");

  assert.equal(homepage.includes('<button type="button" class="hero-booking-field"'), false);
  assert.match(homepage, /<div class="hero-booking-field hero-booking-field--display" aria-hidden="true">/);
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
