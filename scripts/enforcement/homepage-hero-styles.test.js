"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..", "..");
const ALLOWED = ["cinema", "split", "inset"];

function read(rel) {
  return fs.readFileSync(path.join(repoRoot, rel), "utf8");
}

function loadResolver() {
  const layout = read("src/_includes/layouts/guest.njk");
  const match = layout.match(/function resolveHomepageHeroStyle\([^)]*\)\s*\{[^}]+\}/);
  assert.ok(match, "guest.njk must keep resolveHomepageHeroStyle for the preview allowlist");
  return vm.runInNewContext(`${match[0]}; resolveHomepageHeroStyle`);
}

test("empty or unknown hero style fails the allowlist", () => {
  const resolve = loadResolver();
  assert.equal(resolve(""), "");
  assert.equal(resolve(null), "");
  assert.equal(resolve(undefined), "");
  assert.equal(resolve("current"), "");
  assert.equal(resolve("CINEMA"), "");
  assert.ok(!resolve(""), "empty hero style must fail");
});

test("only cinema, split, and inset resolve as homepage hero previews", () => {
  const resolve = loadResolver();
  assert.deepEqual(
    ALLOWED.map((value) => resolve(value)),
    ALLOWED
  );
});

test("homepage source keeps current copy and does not bake in a hero style", () => {
  const page = read("src/index.njk");
  const layout = read("src/_includes/layouts/guest.njk");
  const css = read("src/css/arrival-hero-previews.css");
  assert.match(page, /Your people\.<br><em>Your place\.<\/em>/);
  assert.match(page, /Private-pool homes · Bradenton & Sarasota/);
  assert.doesNotMatch(page, /data-hero-style/);
  assert.doesNotMatch(page, /why-book-direct|bento/);
  assert.match(layout, /arrival-hero-previews\.css/);
  assert.match(layout, /get\("hero"\)/);
  assert.match(css, /data-hero-style=cinema/);
  assert.match(css, /data-hero-style=split/);
  assert.match(css, /data-hero-style=inset/);
});

test("hero preview CSS does not restyle the booking panel or unlock the pill", () => {
  const css = read("src/css/arrival-hero-previews.css");
  const guest = read("src/css/guest.css");
  const start = css.indexOf("html[data-hero-style=cinema]");
  assert.notEqual(start, -1, "arrival-hero-previews.css must keep the named preview block");
  const preview = css.slice(start);
  assert.doesNotMatch(preview, /\.g-home-trip|\.g-trip-form|--g-control-treatment/);
  assert.match(guest, /--g-control-treatment:sliding-arrow-pill/);
});

test("built homepage stays on the current hero until ?hero= is set", () => {
  const builtPath = path.join(repoRoot, "_site", "index.html");
  assert.ok(fs.existsSync(builtPath), "missing _site/index.html — run the build before this gate");
  const html = fs.readFileSync(builtPath, "utf8");
  assert.doesNotMatch(html, /<html[^>]*data-hero-style/);
  assert.match(html, /id="home-heading"/);
  assert.match(html, /class="g-arrival"/);
  assert.match(html, /data-home-scenes/);
  assert.doesNotMatch(html, /312 stays|homes open|Live home collection/);
});
