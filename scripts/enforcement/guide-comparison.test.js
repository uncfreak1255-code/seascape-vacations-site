const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "../..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("Bradenton comparison uses the approved Waterline frame without legacy styling", () => {
  const source = read("src/guides/bradenton-vs-sarasota.html");
  assert.match(source, /\{% extends "layouts\/guide-comparison\.njk" %\}/,
    "the approved guide must leave the standalone legacy frame");
  const layout = read("src/_includes/layouts/guide-comparison.njk");
  assert.match(layout, /<body class="guest-shell planning-guide comparison-guide">/,
    "the whole page must retain the enforced Waterline design floors");
  assert.match(layout, /partials\/guest-header\.njk/);
  assert.match(layout, /partials\/guest-footer\.njk/);
  assert.match(layout, /partials\/analytics-ga4\.njk/);
  assert.match(layout, /\/css\/comparison-guide\.css/);
  assert.doesNotMatch(source, /<style\b|\bstyle=|hero-badge|prototype-switcher|data-copy-block/);
  assert.match(source, /<\/table><\/div>\s*<aside class="direct-book-decision-aside"/,
    "the existing stay decision must remain immediately after the comparison");
});
