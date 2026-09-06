const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const template = fs.readFileSync(path.resolve(__dirname, "../../src/properties/index.njk"), "utf8");

test("catalog facts and accommodation photos come from canonical property records", () => {
  for (const field of ["bedrooms", "bathrooms", "guests", "bookingUrl", "pageUrl", "highlights"]) {
    assert.ok(template.includes("property." + field), "missing canonical " + field);
  }
  assert.ok(template.includes("property.photography.photos[0].src"));
  assert.doesNotMatch(template, /seascape-og-default|this.src=/);
  for (const property of require("../../src/_data/properties-fallback.json")) {
    assert.ok(property.photography.photos.length >= 10, property.slug + " must include interiors");
    for (const photo of property.photography.photos) {
      assert.ok(photo.src.startsWith("/images/homes/" + property.slug + "/"));
      assert.ok(fs.existsSync(path.resolve(__dirname, "../..", photo.src.slice(1))));
      assert.ok(photo.sourceUrl.includes("bookingenginecdn.hostaway.com/listing/"));
    }
  }
  for (const claim of ["{{ property.price }}", "Availability · live", "weekendsLeft", "Booked 2 hours ago"]) {
    assert.ok(!template.includes(claim), "catalog must not imply a selected-date quote or scarcity: " + claim);
  }
});

test("cached openings start hidden and carry both range and freshness metadata", () => {
  assert.match(template, /<details hidden class="catalog-opening"[^>]*data-opening-start=[^>]*data-opening-end=[^>]*data-opening-synced=/);
  assert.ok(template.includes("confirm before booking"));
});
