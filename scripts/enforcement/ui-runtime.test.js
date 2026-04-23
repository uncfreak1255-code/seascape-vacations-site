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
