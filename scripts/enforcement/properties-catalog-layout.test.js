const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const propertiesTemplatePath = path.resolve(__dirname, "../../src/properties/index.njk");
const propertiesTemplate = fs.readFileSync(propertiesTemplatePath, "utf8");

test("properties catalog implements Property Card E with truthful listing data", () => {
  assert.match(
    propertiesTemplate,
    /\.catalog-grid\s*\{[\s\S]*display:\s*flex;[\s\S]*flex-wrap:\s*wrap;[\s\S]*justify-content:\s*center;[\s\S]*gap:\s*28px;/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-card\s*\{[\s\S]*flex:\s*0 1 440px;[\s\S]*width:\s*min\(100%, 440px\);/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-card\s*\{[\s\S]*width:\s*min\(100%, 440px\);[\s\S]*border-radius:\s*20px;[\s\S]*box-shadow:\s*0 20px 60px rgba\(0, 0, 0, 0\.08\);/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-card-media\s*\{[\s\S]*height:\s*280px;[\s\S]*overflow:\s*hidden;/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-card-scrim\s*\{[\s\S]*linear-gradient\(180deg,[\s\S]*rgba\(0, 0, 0, 0\.6\)\);/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-live-pill::before\s*\{[\s\S]*animation:\s*catalogPulse 2s infinite;/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-live-pill\.is-muted::before\s*\{[\s\S]*animation:\s*none;/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-next\s*\{[\s\S]*background:\s*#F5FBF2;[\s\S]*border:\s*1px solid rgba\(127, 219, 164, 0\.35\);/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-card-foot\s*\{[\s\S]*display:\s*flex;[\s\S]*justify-content:\s*space-between;/
  );

  for (const token of [
    "{{ property.image | imgProxy(900) }}",
    "{{ property.rating }}",
    "{{ property.bedrooms }}",
    "{{ property.bathrooms }}",
    "{{ property.guests }}",
    "{{ property.price }}",
    "{{ bookingHref }}",
    "{% set availability = property.availability %}",
    "{{ availability.nextAvailable.label }}",
    "{{ availability.nextAvailable.subcopy }}",
    "{{ month.value }}",
    "{{ availability.weekendsLeft }}",
    "Availability · live",
    "Calendar · secure",
    "startingDate="
  ]) {
    assert.equal(propertiesTemplate.includes(token), true, `template missing ${token}`);
  }

  for (const fakeAvailabilityCopy of [
    "Booked 2 hours ago",
    "Mar 28",
    "NIGHTS IN MAR",
    "NIGHTS IN APR",
    "Save $476"
  ]) {
    assert.equal(
      propertiesTemplate.includes(fakeAvailabilityCopy),
      false,
      `template should not hardcode ${fakeAvailabilityCopy}`
    );
  }
});

test("properties catalog keeps mobile rhythm before the first card compact", () => {
  assert.equal(
    propertiesTemplate.includes('class="catalog-hero" style='),
    false,
    "catalog hero spacing must stay in CSS so mobile breakpoints can override it"
  );

  assert.match(
    propertiesTemplate,
    /@media \(max-width: 680px\)\s*\{[\s\S]*\.catalog-hero\s*\{[\s\S]*padding:\s*42px 20px 34px;/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-filters\s*\{[\s\S]*flex-wrap:\s*nowrap;[\s\S]*overflow-x:\s*auto;/
  );

  assert.match(
    propertiesTemplate,
    /\.catalog-filter\s*\{[\s\S]*flex:\s*0 0 auto;[\s\S]*white-space:\s*nowrap;/
  );
});
