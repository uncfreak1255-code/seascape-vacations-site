const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const fallbackProperties = require("../../src/_data/properties-fallback.json");
const seoPages = require("../../src/_data/seoPages.json");
const { normalizeListing } = require("../../scripts/cache/normalize-hostaway");
const {
  renderPropertySummary,
  renderSchemaAmenityLabels
} = require("../../scripts/regenerate-property-surfaces");

const DOCKSIDE_ONLY_CLAIM_SLUG = "dockside-dreams";

const STRICT_DOCK_OR_WATER_SLUGS = new Set([
  "bradenton-waterfront-vacation-rentals",
  "fishing-vacation-rentals-bradenton",
  "dolphin-watching-vacation-rentals-florida",
  "canal-homes-with-boat-dock",
  "gulf-coast-vacation-homes-with-dock",
  "waterfront-vacation-rentals-with-kayaks"
]);

function allSeoPages() {
  return Object.values(seoPages).flat();
}

function cleanText(value) {
  return JSON.stringify(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

function readSource(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function readBuilt(relativePath) {
  return fs.readFileSync(path.join(projectRoot, "_site", relativePath), "utf8");
}

test("Hostaway listing normalization sums full and guest bathroom fields", () => {
  const normalized = normalizeListing({
    id: 487798,
    name: "Bradenton Pool Home",
    city: "Bradenton",
    bedrooms: 3,
    bathrooms: 3,
    guestBathrooms: 0.5,
    personCapacity: 10,
    listingPrice: 250
  });

  assert.equal(normalized.bathrooms, 3.5);
});

test("fallback property facts keep waterfront and dock claims limited to Dockside Dreams", () => {
  for (const property of fallbackProperties) {
    assert.equal(
      property.specs,
      `${property.bedrooms} BR · ${property.bathrooms} BA · Sleeps ${property.guests}`,
      `${property.slug} specs must match fallback counts`
    );

    const text = cleanText({
      name: property.name,
      description: property.description,
      highlights: property.highlights,
      amenities: property.amenities,
      specs: property.specs
    });

    if (property.slug === DOCKSIDE_ONLY_CLAIM_SLUG) {
      assert.match(text, /\b(waterfront|dock|bayfront)\b/i);
      continue;
    }

    assert.doesNotMatch(
      text,
      /\b(waterfront|bayfront|canal[- ]front|private dock|boat dock|dock access|backyard dock)\b/i,
      `${property.slug} must not inherit Dockside-only waterfront/dock claims`
    );
  }
});

test("strict waterfront, dock, fishing, and dolphin pages match only Dockside Dreams", () => {
  const pagesBySlug = new Map(allSeoPages().map((page) => [page.slug, page]));

  for (const slug of STRICT_DOCK_OR_WATER_SLUGS) {
    const page = pagesBySlug.get(slug);
    if (!page) continue;

    assert.deepEqual(page.matchingProperties, ["dockside-dreams"], `${slug} must not match River House`);
    assert.doesNotMatch(cleanText(page), /\b(several|multiple)\s+[^.]{0,80}\b(waterfront|dock|canal)/i);
    assert.doesNotMatch(cleanText(page), /\bRiver House\b[^.]{0,140}\b(waterfront|canal|dock|dolphin|backyard)\b/i);
  }
});

test("strict rendered dock and waterfront stay pages only feature Dockside Dreams property cards", () => {
  const strictRenderedPages = [
    "stays/bradenton-waterfront-vacation-rentals/index.html",
    "stays/fishing-vacation-rentals-bradenton/index.html",
    "stays/canal-homes-with-boat-dock/index.html",
    "stays/dolphin-watching-vacation-rentals-florida/index.html"
  ];

  for (const relativePath of strictRenderedPages) {
    const html = readBuilt(relativePath);
    assert.match(html, /href="\/properties\/dockside-dreams\/"/, `${relativePath} should feature Dockside Dreams`);
    assert.match(html, /"numberOfItems":\s*1/, `${relativePath} should only list one strict-match property in ItemList schema`);
    assert.doesNotMatch(html, /href="\/properties\/river-house\/"/, `${relativePath} must not feature River House`);
    assert.doesNotMatch(html, /data-page-slug="river-house"/, `${relativePath} must not instrument River House cards`);
    assert.doesNotMatch(html, /"@id":\s*"https:\/\/seascape-vacations\.com\/#river-house"/, `${relativePath} must not publish River House in stay ItemList schema`);
  }
});

test("stay collection schema uses canonical property URLs and accommodation facts instead of stale priceRange strings", () => {
  const stayPages = [
    "stays/bradenton-vacation-rentals-near-beaches/index.html",
    "stays/large-group-vacation-rentals-anna-maria-island/index.html"
  ];

  for (const relativePath of stayPages) {
    const html = readBuilt(relativePath);
    const itemList = extractJsonLdObjects(html).find((item) => item["@type"] === "ItemList");

    assert.ok(itemList, `${relativePath} must publish ItemList schema`);
    assert.ok(Array.isArray(itemList.itemListElement), `${relativePath} ItemList must contain itemListElement entries`);

    for (const listItem of itemList.itemListElement) {
      const rental = listItem.item;

      assert.equal(rental["@type"], "VacationRental", `${relativePath} item must stay typed as VacationRental`);
      assert.match(rental.url, /^https:\/\/seascape-vacations\.com\/properties\/[^/]+\/$/, `${relativePath} items must point at canonical property URLs`);
      assert.match(rental.identifier, /^seascape-\d+$/, `${relativePath} items must include stable property identifiers`);
      assert.equal(typeof rental.latitude, "number", `${relativePath} items must include latitude`);
      assert.equal(typeof rental.longitude, "number", `${relativePath} items must include longitude`);
      assert.equal(typeof rental.address?.postalCode, "string", `${relativePath} items must include postal codes`);
      assert.equal(Boolean(rental.containsPlace), true, `${relativePath} items must include containsPlace facts`);
      assert.equal(rental.containsPlace.occupancy.value > 0, true, `${relativePath} items must include occupancy values`);
      assert.equal("priceRange" in rental, false, `${relativePath} items must not ship stale priceRange strings`);
      assert.equal(rental.offers?.["@type"], "Offer", `${relativePath} items must publish Offer objects`);
      assert.equal(rental.offers?.priceCurrency, "USD", `${relativePath} items must publish USD pricing`);
    }
  }
});

test("River House kayaking copy stays framed as a nearby public launch, not on-property waterfront", () => {
  const html = readBuilt("stays/kayaking-vacation-rentals-bradenton/index.html");

  assert.match(html, /River House isn(?:['’]t|&#39;t) on the water/i);
  assert.match(html, /public Warner Bayou boat ramp/i);
  assert.doesNotMatch(
    html,
    /River House[^.]{0,160}\b(private dock|waterfront|canal-front|canal[- ]side)\b/i,
    "River House must not inherit Dockside-only waterfront language on kayaking pages"
  );
});

test("River House property page keeps water access framed as the nearby boat ramp, not a riverfront stay", () => {
  const html = readBuilt("properties/river-house/index.html");

  assert.match(html, /Warner Bayou boat ramp 1 min away/i);
  assert.doesNotMatch(html, /Surrounded by nature on the river/i);
  assert.doesNotMatch(html, /view over the river/i);
  assert.doesNotMatch(html, /sits on the water/i);
});

test("Bradenton guides keep River House and dock access claims scoped to the right homes", () => {
  const insiderGuide = readBuilt("guides/bradenton-insider-guide/index.html");
  const areaGuide = readBuilt("guides/bradenton-area-guide/index.html");

  assert.match(insiderGuide, /Warner Bayou boat ramp/i);
  assert.doesNotMatch(insiderGuide, /River House[^.]{0,120}sits on the water/i);

  assert.match(areaGuide, /Dockside Dreams is the Bradenton home with a private dock/i);
  assert.doesNotMatch(areaGuide, /our Bradenton properties feature larger homes, private docks, and more space/i);
  assert.doesNotMatch(areaGuide, /launch your kayak from your private dock/i);
  assert.doesNotMatch(areaGuide, /Many of our waterfront vacation rentals offer dolphin and manatee sightings right from the backyard dock/i);
});

test("putting green is not described as mini-golf across durable marketing surfaces", () => {
  const surfaces = [
    "src/_data/properties-fallback.json",
    "src/_data/seoPages.json",
    "src/llms.txt",
    ...fallbackProperties.map((property) => `src/properties/${property.slug}/index.njk`)
  ];

  for (const surface of surfaces) {
    assert.doesNotMatch(readSource(surface), /\bmini[- ]golf\b/i, `${surface} must say putting green, not mini-golf`);
  }

  assert.match(readSource("src/_data/properties-fallback.json"), /\bputting green\b/i);
  assert.match(readSource("src/llms.txt"), /\bputting green\b/i);
});

test("fallback, llms, and property templates agree on property specs", () => {
  const llms = readSource("src/llms.txt");

  for (const property of fallbackProperties) {
    const compactSpec = `${property.bedrooms}BR/${property.bathrooms}BA`;
    const template = readSource(`src/properties/${property.slug}/index.njk`);

    assert.match(llms, new RegExp(`${property.name}[\\s\\S]*${compactSpec.replace(".", "\\.")}`));
    assert.match(template, new RegExp(`<div class="stat-val">${property.bedrooms}</div>[\\s\\S]*Bedrooms`));
    assert.match(template, new RegExp(`<div class="stat-val">${String(property.bathrooms).replace(".", "\\.")}</div>[\\s\\S]*Bathrooms`));
    assert.match(template, new RegExp(`<div class="stat-val">${property.guests}</div>[\\s\\S]*Max Guests`));
  }
});

test("llms property bullets are regenerated from the fallback summary renderer", () => {
  const llms = readSource("src/llms.txt");

  for (const property of fallbackProperties) {
    const expected = `- [${property.name}](https://seascape-vacations.com/properties/${property.slug}/): ${renderPropertySummary(property)}`;

    assert.match(llms, new RegExp(`^${escapeRegExp(expected)}$`, "m"), `${property.slug} llms bullet must match fallback data`);
  }
});

test("property template schema facts match fallback counts and amenity labels", () => {
  for (const property of fallbackProperties) {
    const template = readSource(`src/properties/${property.slug}/index.njk`);
    const vacationRentalSchema = extractJsonLdObjects(template).find((item) => item["@type"] === "VacationRental");
    const accommodation = vacationRentalSchema?.containsPlace;

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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractJsonLdObjects(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap((match) => {
      const parsed = JSON.parse(match[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    });
}
