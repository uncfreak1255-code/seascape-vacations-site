const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "../..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("Rainy Day uses selected B's shared Waterline activity frame", () => {
  const source = read("src/guides/rainy-day-activities-bradenton-sarasota.html");
  assert.match(source, /\{% extends "layouts\/guide-activity\.njk" %\}/,
    "the selected article must leave its legacy standalone design");
  const layout = read("src/_includes/layouts/guide-activity.njk");
  assert.match(layout, /guest-shell planning-guide activity-guide/,
    "the full page must keep Waterline design floors");
  assert.match(layout, /partials\/guest-header\.njk/);
  assert.match(layout, /partials\/guest-footer\.njk/);
  assert.match(layout, /partials\/analytics-ga4\.njk/);
  assert.doesNotMatch(source, /<style\b|\bstyle=|__prototype|preview-switcher/);
  assert.ok(source.indexOf("{% block guideComparison %}") < source.indexOf("{% block guideArticle %}"),
    "B presents its comparison before the long article");
  assert.match(source, /partials\/guide-stay-here\.njk/,
    "the real property box must survive the raw-template prototype");
  assert.match(source, /data-placement="sticky_book_bar"/);
  assert.match(source, /data-placement="bottom_cta"/);
});
