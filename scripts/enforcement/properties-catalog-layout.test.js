const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const propertiesTemplatePath = path.resolve(__dirname, "../../src/properties/index.njk");
const propertiesTemplate = fs.readFileSync(propertiesTemplatePath, "utf8");

test("properties catalog implements Property Card E with truthful listing data", () => {
  assert.match(
    propertiesTemplate,
    /\.catalog-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(auto-fill,\s*minmax\(min\(100%, 360px\), 440px\)\);/
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
