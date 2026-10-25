"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

function read(rel) {
  return fs.readFileSync(path.join(projectRoot, rel), "utf8");
}

function mobileBlocks(css) {
  return String(css || "")
    .split(/@media\(max-width:700px\)/)
    .slice(1)
    .map((block) => block.split(/@media/)[0])
    .join("\n");
}

function bookingInputFont(css) {
  const match = mobileBlocks(css).match(
    /\.g-booking \.g-trip-form input,\.g-booking \.g-trip-form select\{[^}]*font-size:(\d+)px/
  );
  return match ? Number(match[1]) : 0;
}

function bookingGuestsColumn(css) {
  const all = String(css || "");
  const matches = [...all.matchAll(/\.g-booking \.g-trip-form[^]{0,80}button\{grid-column:([^}]+)\}/g)];
  return matches.length ? matches[matches.length - 1][1].trim() : "";
}

test("empty booking-panel CSS fails the mobile floor", () => {
  assert.equal(bookingInputFont(""), 0);
  assert.ok(bookingInputFont("") < 16, "empty CSS must fail the 16px input floor");
  assert.equal(bookingGuestsColumn(""), "");
  assert.ok(!bookingGuestsColumn(""), "empty CSS must fail the guests-column gate");
});

test("phone booking panel keeps 16px fields and a full-width guests row", () => {
  const css = read("src/css/guest.css");
  const phone = mobileBlocks(css);
  assert.ok(phone, "missing 700px booking rules");
  assert.equal(bookingInputFont(css) >= 16, true, `booking input font ${bookingInputFont(css)}px`);
  assert.match(phone, /\.g-booking \.g-trip-form\{grid-template-columns:1fr/);
  assert.doesNotMatch(phone, /\.g-booking \.g-trip-form[^}]*grid-column:\s*auto/);
  assert.doesNotMatch(phone, /\.g-booking \.g-trip-form input\{font-size:12px\}/);
  assert.doesNotMatch(phone, /\.g-booking \.g-trip-form>button\{font-size:12px\}/);
  assert.equal(bookingGuestsColumn(css), "1/-1");
  assert.match(phone, /\.g-booking \.g-trip-form \.g-button\{font-size:14px;min-height:48px/);
  assert.match(phone, /\.g-mobile-booking \.g-button\{font-size:14px/);
});

test("trip form fields stay labeled native controls with no copy change", () => {
  const form = read("src/_includes/partials/guest-trip-form.njk");
  assert.match(form, /class="g-trip-field"/);
  assert.match(form, /<label for="\{\{ tripFormId \}\}-arrive">Arrival<\/label>/);
  assert.match(form, /<label for="\{\{ tripFormId \}\}-depart">Departure<\/label>/);
  assert.match(form, /<label for="\{\{ tripFormId \}\}-guests">Guests<\/label>/);
  assert.match(form, /Check dates/);
  assert.match(form, /Choose your dates and group size/);
  assert.doesNotMatch(form, /hostaway-calendar-widget/);
});
