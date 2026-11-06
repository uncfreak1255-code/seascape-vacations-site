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

// motion.css appends after guest.css, so an ungated zoom beats its reduced-motion reset.
function galleryHoverAllowsMotionOnly(css) {
  if (!galleryHoverIsGated(css)) return false;
  const hoverIndex = css.search(/\.g-gallery-photo:hover img\{transform:scale\(1\.03\)\}/);
  const mediaStart = css.slice(0, hoverIndex).lastIndexOf("@media(hover:hover) and (pointer:fine)");
  const query = css.slice(mediaStart, css.indexOf("{", mediaStart));
  return query.includes("(prefers-reduced-motion:no-preference)");
}

test("empty overlay CSS fails the gallery and dialog gates", () => {
  assert.equal(galleryHoverIsGated(""), false);
  assert.equal(galleryHoverIsGated(".g-gallery-photo:hover img{transform:scale(1.03)}"), false);
  assert.equal(galleryHoverAllowsMotionOnly("@media(hover:hover) and (pointer:fine){.g-gallery-photo:hover img{transform:scale(1.03)}}"), false);
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
  assert.equal(galleryHoverAllowsMotionOnly(css), true, "gallery zoom must also require prefers-reduced-motion:no-preference");
});

test("guest.css no longer owns the 650ms ungated gallery zoom", () => {
  const css = read("src/css/guest.css");
  assert.doesNotMatch(css, /transform \.65s/);
  assert.doesNotMatch(css, /\.g-gallery-photo:hover img\{transform:scale\(1\.03\)\}/);
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

// UI motion stays under 300ms with an ease-out curve (instant-feedback rule).
function animateDurations(js) {
  return [...js.matchAll(/\.animate\(\[[^\]]*\],\{duration:(\d+)/g)].map((match) => Number(match[1]));
}

test("animateDurations reads every Web Animations duration", () => {
  assert.deepEqual(animateDurations("a.animate([{o:1}],{duration:650,easing:'x'});b.animate([{o:0}],{duration:250})"), [650, 250]);
  assert.deepEqual(animateDurations(""), []);
});

test("homepage scene switch animates in 300ms or less with the shared ease-out curve", () => {
  const js = read("src/assets/js/home-scenes.js");
  const durations = animateDurations(js);
  assert.equal(durations.length, 2, "photo and caption animations");
  for (const duration of durations) assert.ok(duration <= 300, `scene animation ${duration}ms exceeds 300ms`);
  assert.doesNotMatch(js, /easing:'ease-out'/);
  assert.match(js, /cubic-bezier\(\.23,1,\.32,1\)/);
});

test("area-guide mobile booking bar enters at 250ms and leaves at 150ms on ease-out", () => {
  const partial = read("src/_includes/partials/area-guide-mobile-cta-guard.njk");
  assert.doesNotMatch(partial, /0\.28s ease/);
  assert.match(partial, /transform var\(--g-overlay-out,150ms\) var\(--g-ease-out,cubic-bezier\(\.23,1,\.32,1\)\)/);
  assert.match(partial, /transform var\(--g-overlay-in,250ms\) var\(--g-ease-out,cubic-bezier\(\.23,1,\.32,1\)\)/);
});

test("legacy buttons and review controls avoid transition:all and slow curves", () => {
  const base = read("src/css/base.css");
  assert.doesNotMatch(base, /transition:\s*all/);
  assert.doesNotMatch(base, /\.35s/);
  const reviews = read("src/css/property-reviews.css");
  assert.doesNotMatch(reviews, /240ms/);
  assert.match(reviews, /var\(--g-hover-duration,200ms\)/);
});

test("the unreferenced Hostaway mobile calendar partial is gone", () => {
  assert.equal(fs.existsSync(path.join(projectRoot, "src/_includes/partials/hostaway-mobile-calendar-fix.njk")), false);
});
