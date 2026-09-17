"use strict";

const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const ownerLanding = fs.readFileSync(
  path.join(projectRoot, "src", "property-management", "index.njk"),
  "utf8"
);
const catalog = fs.readFileSync(
  path.join(projectRoot, "src", "properties", "index.njk"),
  "utf8"
);
const propertyLayout = fs.readFileSync(
  path.join(projectRoot, "src", "_includes", "layouts", "property.njk"),
  "utf8"
);

function readBuilt(routeFile) {
  const builtPath = path.join(projectRoot, "_site", routeFile);
  assert.equal(fs.existsSync(builtPath), true, `missing built route ${routeFile}; run npm run build first`);
  return fs.readFileSync(builtPath, "utf8");
}

function countMains(html) {
  return (String(html).match(/<main\b[^>]*>/gi) || []).length;
}

test("owner hub source keeps one page root and no nested main landmark", () => {
  assert.match(ownerLanding, /<div class="g-owner" data-owner-page>/);
  assert.doesNotMatch(ownerLanding, /<main\b/i);
  assert.match(ownerLanding, /\n<\/div>\n\n<script>/);
});

test("built /property-management/ exposes exactly one main landmark", () => {
  const html = readBuilt("property-management/index.html");
  assert.equal(countMains(html), 1, "owner hub must keep the layout main and no nested main");
  assert.match(html, /<main id="main">/);
  assert.match(html, /<div class="g-owner" data-owner-page>/);
});

test("flagged aria-label hosts use allowed semantics instead of role-less generics", () => {
  assert.match(
    catalog,
    /<div class="catalog-filters" role="group" aria-label="Property filters">/
  );
  assert.match(
    propertyLayout,
    /<section class="g-gallery" aria-label="\{\{ property\.name \}\} photos">/
  );
  assert.match(
    propertyLayout,
    /<div class="property-trip-context" role="group" aria-label="Your trip">/
  );

  assert.match(ownerLanding, /<nav class="g-owner-steps" aria-label="Form progress">/);
  assert.match(ownerLanding, /class="g-owner-choices" role="group" aria-label="What feels off"/);
  assert.match(ownerLanding, /<dl class="g-owner-recap" aria-label="Your answers">/);
  assert.match(ownerLanding, /<aside class="g-owner-review" id="owner-cta" aria-labelledby="owner-review-title">/);
});

test("built catalog, property, and owner routes keep the named region semantics", () => {
  const catalogHtml = readBuilt("properties/index.html");
  const propertyHtml = readBuilt("properties/dockside-dreams/index.html");
  const ownerHtml = readBuilt("property-management/index.html");

  assert.match(catalogHtml, /class="catalog-filters"[^>]*role="group"[^>]*aria-label="Property filters"/);
  assert.match(propertyHtml, /<section class="g-gallery" aria-label="Dockside Dreams photos">/);
  assert.match(propertyHtml, /class="property-trip-context" role="group" aria-label="Your trip"/);
  assert.equal(countMains(propertyHtml), 1);
  assert.equal(countMains(catalogHtml), 1);

  assert.match(ownerHtml, /<nav class="g-owner-steps" aria-label="Form progress">/);
  assert.match(ownerHtml, /role="group"[^>]*aria-label="What feels off"/);
  assert.match(ownerHtml, /<aside class="g-owner-review" id="owner-cta" aria-labelledby="owner-review-title">/);
});

test("owner form step controls use Waterline ink on white, and no gold anywhere", () => {
  const ownerCss = fs.readFileSync(path.join(projectRoot, "src", "css", "owner.css"), "utf8");
  assert.match(
    ownerCss,
    /\.g-owner-step-dot\.is-active,\.g-owner-step-dot\.is-complete\{background:var\(--g-ink\);color:#fff;border-color:var\(--g-ink\)\}/
  );
  assert.match(ownerCss, /\.g-owner-step-line\.is-complete\{background:var\(--g-citron\)\}/);
  assert.doesNotMatch(ownerCss, /--gold|#c9a962|#C9A962/);
  assert.doesNotMatch(ownerCss, /transform:\s*scale/);
  assert.doesNotMatch(ownerLanding, /--gold|#c9a962|#C9A962|<style/i);
});
