"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function savingsTile(source) {
  const match = source.match(/g-why-tile--savings[\s\S]*?<\/article>/);
  assert.ok(match, "homepage must include a savings tile");
  return match[0];
}

function assertNoSavingsTheater(html) {
  const tile = savingsTile(html);
  assert.doesNotMatch(
    tile,
    /\$|\d+\s*%|10-15%|15%|save \d+/i,
    "savings tile must not invent a dollar or percent"
  );
  return tile;
}

test("empty savings copy fails instead of passing", () => {
  assert.throws(() => assertNoSavingsTheater("<section></section>"), /must include a savings tile/);
  assert.throws(
    () => assertNoSavingsTheater('<article class="g-why-tile g-why-tile--savings"><p>Save 15% and $40</p></article>'),
    /must not invent/
  );
});

test("homepage adds a why-book-direct bento without touching the hero", () => {
  const index = read("src/index.njk");
  assert.match(index, /id="why-book-direct"/);
  assert.doesNotMatch(index, /data-why-direct|Layout options|g-why-tile-media|g-why-map/);
  assert.match(index, /Compare the full stay cost/);
  assert.doesNotMatch(index, /Airbnb and Vrbo add service fees|Skip Airbnb and Vrbo service fees/);
  assert.match(index, /g-why-tile--savings/);
  assert.match(index, /g-why-tile--host/);
  assert.match(index, /g-why-tile--pool/);
  assert.match(index, /g-why-tile--map/);
  assert.match(index, /g-why-tile--reviews/);
  assert.match(index, /href="\/guides\/booking-direct-vacation-rentals\/"/);
  assert.match(index, /href="\/properties\/" data-trip-link>Compare our homes/);
  assertNoSavingsTheater(index);
  assert.match(index, /class="g-arrival"/);
  assert.match(index, /Your people\./);
  assert.match(index, /Your place\./);
  const start = index.indexOf('id="why-book-direct"');
  const end = index.indexOf("</section>", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  assert.doesNotMatch(index.slice(start, end), /guest-email-capture/);
});

test("locked sliding-arrow-pill and arrival hero stay in place", () => {
  const guestCss = read("src/css/guest.css");
  const arrivalCss = read("src/css/arrival.css");
  assert.match(guestCss, /--g-control-treatment:sliding-arrow-pill/);
  assert.doesNotMatch(guestCss, /--g-control-treatment:ink-pill/);
  assert.match(arrivalCss, /\.g-arrival\{position:relative;height:clamp\(650px,82svh,850px\)/);
  assert.doesNotMatch(arrivalCss, /data-why-direct-layout|g-why-direct-picker/);
  assert.match(arrivalCss, /\.g-why-tile--savings\{grid-column:1\/8/);
});

test("discarded prototype selectors and simulated price feedback cannot ship", () => {
  const script = read("src/assets/js/guest.js");
  assert.doesNotMatch(script, /applyWhyDirect|why-direct|booking-feedback|feedback-frame|updateQuote/);
  assert.doesNotMatch(read("src/_includes/layouts/guest.njk"), /arrival-hero-previews|data-hero-style/);
});
