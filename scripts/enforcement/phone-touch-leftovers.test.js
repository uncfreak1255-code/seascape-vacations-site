"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

function read(rel) {
  return fs.readFileSync(path.join(projectRoot, rel), "utf8");
}

function headBytes(rel) {
  return Number(
    execFileSync("git", ["cat-file", "-s", `HEAD:${rel}`], {
      cwd: projectRoot,
      encoding: "utf8"
    }).trim()
  );
}

function ruleIsInsideHoverMedia(css, selector) {
  if (!css || typeof css !== "string" || !selector) return false;
  const media = "@media(hover:hover) and (pointer:fine)";
  let from = 0;
  while (from < css.length) {
    const mediaIndex = css.indexOf(media, from);
    if (mediaIndex < 0) return false;
    const open = css.indexOf("{", mediaIndex + media.length);
    if (open < 0) return false;
    let depth = 1;
    let i = open + 1;
    while (i < css.length && depth > 0) {
      if (css[i] === "{") depth += 1;
      else if (css[i] === "}") depth -= 1;
      i += 1;
    }
    if (css.slice(open + 1, i - 1).includes(selector)) return true;
    from = i;
  }
  return false;
}

function afterFirst(css, marker) {
  if (!css || typeof css !== "string" || !marker) return "";
  const idx = css.indexOf(marker);
  return idx < 0 ? "" : css.slice(idx);
}

function phoneTripInputSize(css) {
  const phone = afterFirst(css, "@media(max-width:700px)");
  const match = phone.match(/\.g-trip-form input,\.g-trip-form select\{font-size:(\d+)px/);
  return match ? match[1] : "";
}

function bookingPhoneInputSize(css) {
  const phone = afterFirst(css, "@media(max-width:700px)");
  const match = phone.match(/\.g-booking \.g-trip-form input\{font-size:(\d+)px/);
  return match ? match[1] : "";
}

function catalogPhoneTrip(css) {
  const phone = afterFirst(css, "@media(max-width:767px) {");
  if (!phone) return { columns: "", input: "", select: "" };
  const end = phone.indexOf("\n}");
  const block = end < 0 ? "" : phone.slice(0, end);
  const columns = (block.match(/#catalog-trip-form \{ grid-template-columns:([^;]+);/) || [])[1] || "";
  const input = (block.match(/#catalog-trip-form input \{ font-size:(\d+)px/) || [])[1] || "";
  const select = (block.match(/#catalog-trip-form select \{ font-size:(\d+)px/) || [])[1] || "";
  return { columns: columns.trim(), input, select };
}

function hasViewportFit(html) {
  return typeof html === "string" && /viewport-fit=cover/.test(html) && !/maximum-scale=1/.test(html);
}

function hasPaperThemeColor(html) {
  return typeof html === "string" && /<meta name="theme-color" content="#f6f3eb">/.test(html);
}

test("empty leftovers fail closed", () => {
  assert.equal(ruleIsInsideHoverMedia("", ".g-nav a:hover"), false);
  assert.equal(
    ruleIsInsideHoverMedia(".g-nav a:hover,.g-inline-link:hover{color:red}", ".g-nav a:hover"),
    false
  );
  assert.equal(phoneTripInputSize(""), "");
  assert.equal(bookingPhoneInputSize(""), "");
  assert.deepEqual(catalogPhoneTrip(""), { columns: "", input: "", select: "" });
  assert.equal(hasViewportFit(""), false);
  assert.equal(hasViewportFit('<meta name="viewport" content="width=device-width,initial-scale=1">'), false);
  assert.equal(hasPaperThemeColor(""), false);
  assert.equal(hasPaperThemeColor('<meta name="theme-color" content="#ffffff">'), false);
});

test("guest.css and guest.js stay at or below HEAD", () => {
  const guestCss = "src/css/guest.css";
  const guestJs = "src/assets/js/guest.js";
  assert.ok(
    fs.statSync(path.join(projectRoot, guestCss)).size <= headBytes(guestCss),
    "guest.css may not grow"
  );
  assert.ok(
    fs.statSync(path.join(projectRoot, guestJs)).size <= headBytes(guestJs),
    "guest.js may not grow"
  );
});

test("home and catalog trip fields are 16px; booking stays 12px", () => {
  const guest = read("src/css/guest.css");
  const catalog = read("src/css/catalog.css");
  assert.equal(phoneTripInputSize(guest), "16");
  assert.equal(bookingPhoneInputSize(guest), "12");
  assert.match(guest, /\.g-booking \.g-trip-form select\{font-size:13px\}/);
  const trip = catalogPhoneTrip(catalog);
  assert.equal(trip.columns, "1fr");
  assert.equal(trip.input, "16");
  assert.equal(trip.select, "16");
  assert.match(catalog, /#catalog-trip-form \.btn \{ padding:12px 8px; font-size:12px; width:100%; \}/);
});

test("leftover hovers are gated; gallery hover stays with #789", () => {
  const guest = read("src/css/guest.css");
  const catalog = read("src/css/catalog.css");
  const arrival = read("src/css/arrival.css");
  const gallery = read("src/css/property-gallery.css");
  assert.equal(ruleIsInsideHoverMedia(guest, ".g-nav a:hover"), true);
  assert.equal(ruleIsInsideHoverMedia(guest, ".g-inline-link:hover"), true);
  assert.equal(ruleIsInsideHoverMedia(guest, ".g-header-phone:hover"), true);
  assert.equal(ruleIsInsideHoverMedia(catalog, ".catalog-card-media:hover img"), true);
  assert.equal(ruleIsInsideHoverMedia(arrival, ".g-homepage .g-header-phone:hover"), true);
  assert.equal(ruleIsInsideHoverMedia(guest, ".g-gallery-photo:hover img"), false);
  assert.match(gallery, /\.g-gallery-photo:hover img\{transform:none\}/);
  assert.doesNotMatch(gallery, /@media\(hover:hover\) and \(pointer:fine\)\{\.g-gallery-photo:hover/);
});

test("sitewide tap-highlight, control user-select, viewport-fit, and paper theme-color", () => {
  const base = read("src/css/base.css");
  const layout = read("src/_includes/layouts/guest.njk");
  assert.match(base, /html \{\s*-webkit-tap-highlight-color: transparent;/);
  assert.match(
    base,
    /button,\s*\.btn,\s*\.g-button,\s*\[role=button\] \{\s*-webkit-user-select: none;\s*user-select: none;/
  );
  assert.doesNotMatch(base, /html \{[^}]*user-select:\s*none/);
  assert.equal(hasViewportFit(layout), true);
  assert.equal(hasPaperThemeColor(layout), true);
});

test("sticky Check-dates hides while the inset gallery is on screen", () => {
  const script = read("src/assets/js/guest.js");
  assert.match(script, /IntersectionObserver/);
  assert.match(script, /sticky\.hidden=true/);
  assert.match(script, /document\.querySelector\('\.g-gallery-frame'\)/);
  assert.match(script, /h\.b\|\|h\.g/);
  assert.match(script, /w\(booking,'b',\.15\)/);
  assert.match(script, /w\([^,]+,'g',0\)/);
});

test("sliding-arrow-pill treatment is unchanged", () => {
  const css = read("src/css/guest.css");
  assert.match(css, /--g-control-treatment:sliding-arrow-pill/);
  assert.match(css, /--g-control-radius:999px/);
  assert.match(css, /--g-button-arrow:1/);
});
