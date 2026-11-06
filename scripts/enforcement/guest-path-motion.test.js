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
  return [...js.matchAll(/\.animate\(\[[^\]]*\],\{([^}]*)\}/g)].map((match) => {
    const duration = /duration:(\d+)/.exec(match[1]);
    const easing = /easing:'([^']*)'/.exec(match[1]);
    return { duration: duration ? Number(duration[1]) : Infinity, easing: easing ? easing[1] : "" };
  });
}

test("animateDurations reads every Web Animations duration", () => {
  assert.deepEqual(animateDurations("a.animate([{o:1}],{duration:650,easing:'x'});b.animate([{o:0}],{easing:'y',duration:250})"), [{ duration: 650, easing: "x" }, { duration: 250, easing: "y" }]);
  assert.deepEqual(animateDurations("a.animate([{o:1}],{easing:'x'})"), [{ duration: Infinity, easing: "x" }]);
  assert.deepEqual(animateDurations(""), []);
});

test("homepage scene switch animates in 300ms or less with the shared ease-out curve", () => {
  const js = read("src/assets/js/home-scenes.js");
  const durations = animateDurations(js);
  assert.equal(durations.length, 2, "photo and caption animations");
  for (const { duration, easing } of durations) {
    assert.ok(duration <= 300, `scene animation ${duration}ms exceeds 300ms`);
    assert.equal(easing, "cubic-bezier(.23,1,.32,1)", "every scene animation uses the shared ease-out curve");
  }
});

test("area-guide mobile booking bar enters at 250ms and leaves at 150ms on ease-out", () => {
  const partial = read("src/_includes/partials/area-guide-mobile-cta-guard.njk");
  assert.doesNotMatch(partial, /0\.28s ease/);
  const curve = "var(--g-ease-out,cubic-bezier(.23,1,.32,1))";
  const hidden = /\.mobile-cta-bar \{[^}]*transition: ([^;]*);/.exec(partial);
  const shown = /mobile-cta-visible \.mobile-cta-bar \{[^}]*transition: ([^;]*);/.exec(partial);
  assert.ok(hidden && shown, "both bar states declare a transition");
  assert.equal(hidden[1], `transform var(--g-overlay-out,150ms) ${curve}, opacity var(--g-overlay-out,150ms) ${curve}, visibility 0s linear var(--g-overlay-out,150ms)`);
  assert.equal(shown[1], `transform var(--g-overlay-in,250ms) ${curve}, opacity var(--g-overlay-in,250ms) ${curve}`);
});

test("legacy buttons and review controls avoid transition:all and slow curves", () => {
  const base = read("src/css/base.css");
  assert.doesNotMatch(base, /transition:\s*all/);
  for (const match of base.matchAll(/transition:([^;]*);/g)) {
    for (const seconds of match[1].matchAll(/(\d*\.?\d+)s\b/g)) assert.ok(Number(seconds[1]) <= 0.3, `base.css transition ${match[1]} exceeds 300ms`);
  }
  const reviews = read("src/css/property-reviews.css");
  assert.doesNotMatch(reviews, /240ms/);
  assert.match(reviews, /background-color var\(--g-hover-duration,200ms\) var\(--g-ease-out,cubic-bezier\(\.23,1,\.32,1\)\)/);
  assert.match(reviews, /transform var\(--g-press-duration,120ms\) var\(--g-ease-out,cubic-bezier\(\.23,1,\.32,1\)\)/);
});

test("the unreferenced Hostaway mobile calendar partial is gone", () => {
  assert.equal(fs.existsSync(path.join(projectRoot, "src/_includes/partials/hostaway-mobile-calendar-fix.njk")), false);
});

test("home photo morph between pages plays in 400ms on the shared ease-out curve, motion-safe only", () => {
  const css = read("src/css/guest.css");
  const groups = [...css.matchAll(/::view-transition-group\(\*\)\{([^}]*)\}/g)];
  assert.equal(groups.length, 1, "one rule times every shared-photo morph");
  assert.equal(groups[0][1], "animation-duration:.4s;animation-timing-function:cubic-bezier(.23,1,.32,1)");
  assert.match(css, /@media\(prefers-reduced-motion:no-preference\)\{@view-transition\{navigation:auto\}\s*::view-transition-group\(\*\)\{/, "the morph only runs when reduced motion is off");
  assert.match(css, /@media\(prefers-reduced-motion:no-preference\)\{::view-transition-group\(root\)\{animation-duration:\.2s\}\}/, "the page crossfade stays at 200ms");
});
