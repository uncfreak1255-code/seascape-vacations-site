"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

function read(rel) {
  return fs.readFileSync(path.join(projectRoot, rel), "utf8");
}

function hoverRuleIsGated(css) {
  if (!css || typeof css !== "string") return false;
  const hoverIndex = css.search(/\.g-button:hover,\s*\.guest-site \.btn:hover/);
  if (hoverIndex < 0) return false;
  const before = css.slice(0, hoverIndex);
  const mediaIndex = before.lastIndexOf("@media(hover:hover) and (pointer:fine)");
  if (mediaIndex < 0) return false;
  const between = before.slice(mediaIndex);
  return !between.includes("}");
}

function pressRuleIsGated(css) {
  if (!css || typeof css !== "string") return false;
  const pressIndex = css.search(/transform:scale\(var\(--g-press-scale\)\)/);
  if (pressIndex < 0) return false;
  const before = css.slice(0, pressIndex);
  return before.lastIndexOf("@media(prefers-reduced-motion:no-preference)") >= 0;
}

test("empty motion CSS fails the hover and press gates", () => {
  assert.equal(hoverRuleIsGated(""), false);
  assert.equal(pressRuleIsGated(""), false);
  assert.equal(hoverRuleIsGated(".g-button:hover,.guest-site .btn:hover{background:red}"), false);
  assert.equal(pressRuleIsGated("button{transform:scale(.97)}"), false);
});

test("motion.css owns gated hover, press, and interrupt tokens", () => {
  const css = read("src/css/motion.css");
  assert.match(css, /--g-press-duration:120ms/);
  assert.match(css, /--g-hover-duration:200ms/);
  assert.match(css, /--g-press-scale:\.97/);
  assert.match(css, /--g-ease-out:cubic-bezier\(\.23,1,\.32,1\)/);
  assert.match(css, /transition:background var\(--g-hover-duration\)/);
  assert.match(css, /transform var\(--g-press-duration\) var\(--g-ease-out\)/);
  assert.doesNotMatch(css, /transition:\s*all/);
  assert.doesNotMatch(css, /--g-control-treatment:/);
  assert.doesNotMatch(css, /transform:\s*none/);
  assert.equal(hoverRuleIsGated(css), true, "button hover must sit inside (hover:hover) and (pointer:fine)");
  assert.equal(pressRuleIsGated(css), true, "press scale must sit inside reduced-motion:no-preference");
  assert.match(css, /:active:not\(:focus-visible\)/);
  assert.match(css, /\[data-pressed\]/);
  assert.match(css, /-webkit-tap-highlight-color:transparent/);
});

test("guest.css keeps the locked treatment and leaves hover/press to motion.css", () => {
  const css = read("src/css/guest.css");
  assert.match(css, /--g-control-treatment:sliding-arrow-pill/);
  assert.match(css, /touch-action:manipulation/);
  assert.match(css, /src\/css\/motion\.css/);
  assert.doesNotMatch(css, /@media\(hover:hover\) and \(pointer:fine\)\{\.g-button:hover/);
  assert.doesNotMatch(css, /transform:scale\(\.97\)/);
});

test("press tracking covers catalog pills so a finger can cancel", () => {
  const js = read("src/assets/js/guest-menu.js");
  assert.match(js, /catalog-filter/);
  assert.match(js, /catalog-compare-toggle/);
  assert.match(js, /data-pressed/);
  assert.doesNotMatch("", /catalog-filter/);
});

test("built guest.css appends motion.css without a second request", () => {
  const builtPath = path.join(projectRoot, "_site", "css", "guest.css");
  assert.equal(fs.existsSync(builtPath), true, "missing built guest.css; run npm run build first");
  const built = fs.readFileSync(builtPath, "utf8");
  assert.match(built, /--g-control-treatment:sliding-arrow-pill/);
  assert.match(built, /--g-press-scale:\.97/);
  assert.equal(hoverRuleIsGated(built), true);
  const html = read("_site/index.html");
  assert.match(html, /href="\/css\/guest\.css/);
  assert.doesNotMatch(html, /href="\/css\/motion\.css/);
});
