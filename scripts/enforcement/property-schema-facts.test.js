const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const fallbackProperties = require("../../src/_data/properties-fallback.json");
const { renderSchemaAmenityLabels } = require("../regenerate-property-surfaces");
function readBuilt(relativePath) {
  return fs.readFileSync(path.join(__dirname, "../../_site", relativePath), "utf8");
}
function extractJsonLdObjects(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap((match) => {
      const parsed = JSON.parse(match[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    });
}

test("property template schema facts match fallback counts and amenity labels", () => {
  for (const property of fallbackProperties) {
    const template = readBuilt(`properties/${property.slug}/index.html`);
    const vacationRentalSchema = extractJsonLdObjects(template).find((item) => item["@type"] === "VacationRental");
    const accommodation = vacationRentalSchema?.containsPlace;

    if (property.slug === "relaxing-oasis") {
      // Existing preview remains noindex; verified coordinates are not available.
      assert.match(template, /noindex/);
      assert.equal(vacationRentalSchema, undefined);
      continue;
    }
    assert.ok(vacationRentalSchema, `${property.slug} must publish VacationRental schema`);
    assert.ok(accommodation, `${property.slug} VacationRental schema must include containsPlace accommodation facts`);
    assert.equal(accommodation.numberOfBedrooms, property.bedrooms, `${property.slug} schema bedroom count must match fallback`);
    assert.equal(
      accommodation.numberOfBathroomsTotal,
      property.bathrooms,
      `${property.slug} schema bathroom count must match fallback`
    );
    assert.equal(accommodation.occupancy.value, property.guests, `${property.slug} schema occupancy must match fallback guests`);
    assert.match(
      vacationRentalSchema.description,
      new RegExp(`${property.bedrooms} bedrooms, ${String(property.bathrooms).replace(".", "\\.")} bathrooms, sleeps ${property.guests} guests`, "i"),
      `${property.slug} schema description must carry fallback BR/BA/guest facts`
    );
    assert.deepEqual(
      accommodation.amenityFeature.map((item) => item.name),
      renderSchemaAmenityLabels(property),
      `${property.slug} schema amenities must match fallback structured labels`
    );
  }
});

