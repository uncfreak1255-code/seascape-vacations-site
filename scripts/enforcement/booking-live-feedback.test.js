"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const ALLOWED = new Set(["reel", "rise", "pulse"]);

function read(rel) {
  return fs.readFileSync(path.join(projectRoot, rel), "utf8");
}

function readToken(css) {
  const match = String(css || "").match(/--g-booking-feedback:([^;\s]+)/);
  return match ? match[1].trim() : "";
}

test("empty booking-feedback CSS fails the token gate", () => {
  assert.equal(readToken(""), "");
  assert.equal(readToken(".g-booking{color:red}"), "");
  assert.ok(!readToken(""), "empty CSS must fail");
});

test("booking feedback ships three named treatments and keeps the locked pill", () => {
  const css = read("src/css/booking-feedback.css");
  const guest = read("src/css/guest.css");
  const treatment = readToken(css);
  assert.ok(treatment, "missing --g-booking-feedback");
  assert.equal(ALLOWED.has(treatment), true, `unknown treatment ${treatment}`);
  assert.equal(treatment, "reel");
  assert.match(css, /\[data-booking-feedback\]/);
  assert.match(css, /reel/);
  assert.match(css, /rise/);
  assert.match(css, /pulse/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /g-booking-spin/);
  assert.match(css, /g-booking-check/);
  assert.match(guest, /--g-control-treatment:sliding-arrow-pill/);
  assert.doesNotMatch(css, /--g-control-treatment:/);
});

test("quote markup uses published property numbers and does not invent rates", () => {
  const layout = read("src/_includes/layouts/property.njk");
  const form = read("src/_includes/partials/guest-trip-form.njk");
  const guest = read("src/assets/js/guest.js");
  assert.match(layout, /data-booking-quote/);
  assert.match(layout, /listedNightly = property\.price/);
  assert.match(layout, /property\.availability\.nextAvailable\.nightlyRate/);
  assert.doesNotMatch(layout, /\$425|\$399|\$999|\$1,200/);
  assert.match(form, /data-booking-label/);
  assert.match(form, /Check dates/);
  assert.match(form, /Choose your dates and group size\. You’ll see the full price before you pay\./);
  assert.match(guest, /These dates are open\. You’ll see the full price on the next screen, before you pay\./);
  assert.match(guest, /renderBooking\('failed'/);
  assert.match(guest, /setActionWord/);
  assert.match(guest, /setBookingUi/);
  assert.match(guest, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(guest, /datesOpen\s*=\s*'[^']*\$/);
});

function readAllowed(js) {
  const match = String(js || "").match(/feedbackAllowed=\{([^}]+)\}/);
  if (!match) return [];
  return [...match[1].matchAll(/(\w+):1/g)].map((item) => item[1]);
}

test("empty guest feedback helpers fail closed", () => {
  assert.deepEqual(readAllowed(""), []);
  assert.ok(!readAllowed("").length, "empty JS must fail");
  assert.deepEqual(readAllowed(read("src/assets/js/guest.js")), ["reel", "rise", "pulse"]);
  assert.match(read("src/_includes/layouts/guest.njk"), /booking-feedback\.css/);
});
