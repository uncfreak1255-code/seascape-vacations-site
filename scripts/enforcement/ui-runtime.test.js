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

test("homepage hero ticker uses live weather only after fetching real current data", () => {
  const homepage = readSource("src", "index.njk");
  const heroScript = readSource("src", "assets", "js", "hero-v2.js");
  const heroStyles = readSource("src", "css", "hero-v2.css");

  assert.equal(homepage.includes("78\u00b0F"), false);
  assert.equal(homepage.includes("SUNNY"), false);
  assert.match(homepage, /data-hero-ticker-badge-label>Local<\/span>/);
  assert.match(homepage, /data-hero-ticker-static/);
  assert.match(homepage, /\{\{ properties \| length \}\} private pool homes/);

  assert.equal(heroScript.includes("https://api.open-meteo.com/v1/forecast"), true);
  assert.equal(heroScript.includes("temperature_2m,weather_code,is_day"), true);
  assert.equal(heroScript.includes("temperature_unit', 'fahrenheit'"), true);
  assert.equal(heroScript.includes("Number.isFinite(temperature)"), true);
  assert.equal(heroScript.includes("setTickerBadge('Live')"), true);

  assert.match(heroStyles, /\.hero-v2-ticker-badge\[data-hero-ticker-live\]/);
  assert.match(heroStyles, /\.hero-v2-ticker-badge\[data-hero-ticker-live\] \.hero-v2-live-dot/);
});
