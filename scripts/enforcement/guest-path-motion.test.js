"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

function read(rel) {
  return fs.readFileSync(path.join(projectRoot, rel), "utf8");
}

function galleryHoverIsGated(css) {
  if (!css || typeof css !== "string") return false;
  const hoverIndex = css.search(/\.g-gallery-photo:hover img\{transform:scale\(1\.03\)\}/);
  if (hoverIndex < 0) return false;
  const before = css.slice(0, hoverIndex);
  const lastHoverMedia = before.lastIndexOf("@media(hover:hover) and (pointer:fine)");
  const lastOtherMedia = Math.max(
    before.lastIndexOf("@media(prefers-reduced-motion"),
    before.lastIndexOf("@media(max-width")
  );
  return lastHoverMedia >= 0 && lastHoverMedia > lastOtherMedia;
}

test("empty overlay CSS fails the gallery and dialog gates", () => {
  assert.equal(galleryHoverIsGated(""), false);
  assert.equal(galleryHoverIsGated(".g-gallery-photo:hover img{transform:scale(1.03)}"), false);
  assert.doesNotMatch("", /--g-overlay-in:250ms/);
});

test("motion.css extends #788 tokens for overlay enter and exit", () => {
  const css = read("src/css/motion.css");
  assert.match(css, /--g-overlay-in:250ms/);
  assert.match(css, /--g-overlay-out:150ms/);
  assert.match(css, /--g-overlay-scale:\.96/);
  assert.match(css, /--g-ease-out:cubic-bezier\(\.23,1,\.32,1\)/);
  assert.doesNotMatch(css, /--g-control-treatment:/);
  assert.doesNotMatch(css, /transition:\s*all/);
  assert.doesNotMatch(css, /0\.175,\s*0\.885,\s*0\.32,\s*1\.275/);
  assert.match(css, /\.catalog-dialog\[open\]/);
  assert.match(css, /\.g-photo-dialog\[open\]/);
  assert.match(css, /allow-discrete/);
  assert.match(css, /\.g-mobile-menu\.is-open/);
  assert.equal(galleryHoverIsGated(css), true, "desktop gallery hover must sit inside (hover:hover) and (pointer:fine)");
});

test("guest.css no longer owns the 650ms ungated gallery zoom", () => {
  const css = read("src/css/guest.css");
  assert.doesNotMatch(css, /transform \.65s/);
  assert.doesNotMatch(css, /\.g-gallery-photo:hover img\{transform:scale\(1\.03\)\}/);
  assert.match(css, /--g-control-treatment:sliding-arrow-pill/);
});

test("catalog.css drops the ungated card zoom leftover", () => {
  const css = read("src/css/catalog.css");
  assert.doesNotMatch(css, /catalog-card-media:hover img/);
  assert.doesNotMatch(css, /transition:transform \.3s ease/);
  assert.equal(/catalog-card-media:hover img/.test(""), false);
});

test("email popup motion drops display toggling and bounce", () => {
  const partial = read("src/_includes/partials/email-popup.njk");
  const style = partial.slice(0, partial.indexOf("</style>"));
  assert.match(style, /\.email-popup-overlay\{[^}]*display:flex/);
  assert.doesNotMatch(style, /\.email-popup-overlay\{[^}]*display:none/);
  assert.doesNotMatch(style, /\.email-popup-overlay\.active\{display:flex/);
  assert.doesNotMatch(style, /cubic-bezier\(\.175,\.885,\.32,1\.275\)/);
  assert.match(style, /--g-overlay-in,250ms/);
  assert.match(style, /--g-overlay-out,150ms/);
  assert.doesNotMatch(partial, /o\.style\.display="flex"/);
  assert.doesNotMatch(partial, /e\.style\.display="none"/);
  assert.match(partial, /classList\.add\("active"\)/);
});

test("phone menu Escape stays instant and click can wait for exit", () => {
  const js = read("src/assets/js/guest-menu.js");
  assert.match(js, /closeMenu\(true\)/);
  assert.match(js, /closeMenu\(false\)/);
  assert.match(js, /--g-overlay-out/);
  assert.match(js, /classList\.add\('is-open'\)/);
  assert.doesNotMatch(js, /menuPanel\.hidden=!open/);
});
