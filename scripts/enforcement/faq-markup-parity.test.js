// FAQ markup parity (site #1016, Sawyer 2026-11-18).
// These guides carried FAQPage questions that never appeared on the visible
// page (Playwright innerText audit of the built site, 2026-11-24). Google's
// structured-data rules require FAQ markup to match visible content, so the
// markup was dropped. Do not add FAQPage back to one of these guides unless the
// same questions and answers are visible on the page.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const DROPPED = [
  "src/guides/anna-maria-city.html",
  "src/guides/anna-maria-island-area-guide/index.html",
  "src/guides/anna-maria-island-vacation-cost.html",
  "src/guides/best-restaurants-anna-maria-island.html",
  "src/guides/best-vacation-rental-companies-ami.html",
  "src/guides/bradenton-area-guide/index.html",
  "src/guides/bradenton-beach.html",
  "src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html",
  "src/guides/holmes-beach.html",
  "src/guides/holmes-beach-vs-bradenton-beach.html",
  "src/guides/siesta-key-area-guide/index.html",
  "src/guides/srq-airport-to-anna-maria-island.html",
  "src/guides/things-to-do-bradenton-fl.html"
];

for (const file of DROPPED) {
  test(`${file}: no FAQPage markup for questions the page does not show`, () => {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    assert.doesNotMatch(source, /FAQPage/, `${file} carries FAQPage markup again`);
    // guideFaqs feeds only the layout's FAQPage block, never visible copy.
    assert.doesNotMatch(source, /^guideFaqs:/m, `${file} sets guideFaqs, which renders hidden FAQPage markup`);
  });
}
