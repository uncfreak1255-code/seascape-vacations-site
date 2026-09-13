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

test("owner hub source no longer nests a second main landmark", () => {
  assert.match(ownerLanding, /<div class="owner-field" data-owner-field-page>/);
  assert.doesNotMatch(ownerLanding, /<main\b/i);
  assert.match(ownerLanding, /\n<\/div>\n\n<script>/);
});

test("built /property-management/ exposes exactly one main landmark", () => {
  const html = readBuilt("property-management/index.html");
  assert.equal(countMains(html), 1, "owner hub must keep the layout main and no nested main");
  assert.match(html, /<main class="main-content">/);
  assert.match(html, /<div class="owner-field" data-owner-field-page>/);
  assert.doesNotMatch(html, /<main class="owner-field"/);
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

  assert.match(ownerLanding, /class="owner-field-phrase"[^>]*role="group"[^>]*aria-label="island rental"/);
  assert.match(
    ownerLanding,
    /class="owner-field-ticker-dots" role="group" aria-label="Fee guide fact selector"/
  );
  assert.match(
    ownerLanding,
    /class="owner-field-proof-strip" role="group" aria-label="Fee comparison sources"/
  );
  assert.match(
    ownerLanding,
    /class="owner-field-map" role="region" aria-label="Bradenton Sarasota corridor portfolio map"/
  );
  assert.match(
    ownerLanding,
    /class="owner-field-mega" role="img" aria-label="Three fees are not one comparison"/
  );
  assert.match(
    ownerLanding,
    /<nav class="owner-field-steps" aria-label="Form progress">/
  );
  assert.match(
    ownerLanding,
    /class="owner-field-form-proof" role="group" aria-label="Owner review proof points"/
  );
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

  assert.match(ownerHtml, /role="group"[^>]*aria-label="Fee guide fact selector"/);
  assert.match(ownerHtml, /role="region"[^>]*aria-label="Bradenton Sarasota corridor portfolio map"/);
  assert.match(ownerHtml, /role="img"[^>]*aria-label="Three fees are not one comparison"/);
  assert.match(ownerHtml, /<nav class="owner-field-steps" aria-label="Form progress">/);
});

test("owner form step controls use Waterline ink on white, not gold as text", () => {
  const activeBlock = ownerLanding.match(
    /\.owner-field-step-dot\.is-active,\s*\n\s*\.owner-field-step-dot\.is-complete \{[\s\S]*?\n  \}/
  );
  assert.ok(activeBlock, "expected a shared active/complete step-dot rule");
  assert.match(activeBlock[0], /background: #173D42;/);
  assert.match(activeBlock[0], /color: #FFFFFF;/);
  assert.doesNotMatch(activeBlock[0], /color:\s*var\(--gold\)/);
  assert.doesNotMatch(activeBlock[0], /background:\s*var\(--gold\)/);

  const activeOnlyBlock = ownerLanding.match(
    /\.owner-field-step-dot\.is-active \{\n[\s\S]*?\n  \}/
  );
  assert.ok(activeOnlyBlock, "expected an active step-dot rule");
  assert.match(activeOnlyBlock[0], /transform: scale\(1\.08\);/);
  assert.match(activeOnlyBlock[0], /box-shadow: 0 0 0 2px var\(--owner-paper\), 0 0 0 4px var\(--gold\);/);

  const completeBlock = ownerLanding.match(/\.owner-field-step-dot\.is-complete \{\n[\s\S]*?\n  \}/);
  assert.ok(completeBlock, "expected a completed step-dot rule");
  assert.match(completeBlock[0], /background: #173D42;/);
  assert.match(completeBlock[0], /color: #FFFFFF;/);
  assert.doesNotMatch(completeBlock[0], /var\(--gold\)/);

  assert.match(ownerLanding, /\.owner-field-step-line\.is-complete \{\n\s*background: var\(--gold\);/);
  assert.match(
    ownerLanding,
    /\.owner-field-step-dot,\s*\n\s*\.owner-field-step-dot\.is-active \{\n\s*animation: none;\n\s*transform: none;\n\s*transition: none;/
  );
});
