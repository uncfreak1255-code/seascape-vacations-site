const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const fallbackProperties = require("../../src/_data/properties-fallback.json");
const seoPages = require("../../src/_data/seoPages.json");
const { normalizeListing } = require("../../scripts/cache/normalize-hostaway");

const PROPERTY_TRUTH = new Map([
  ["dockside-dreams", { bedrooms: 4, bathrooms: 3, guests: 12, waterfront: true, dock: true }],
  ["the-oasis", { bedrooms: 5, bathrooms: 3, guests: 16, puttingGreen: true }],
  ["sarasota-luxe", { bedrooms: 4, bathrooms: 3, guests: 12 }],
  ["river-house", { bedrooms: 4, bathrooms: 3, guests: 12, waterfront: false, dock: false }],
  ["bradenton-pool-home", { bedrooms: 3, bathrooms: 3.5, guests: 10 }]
]);

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
    const truth = PROPERTY_TRUTH.get(property.slug);
    assert.ok(truth, `Missing truth contract for ${property.slug}`);

    assert.equal(property.bedrooms, truth.bedrooms, `${property.slug} bedrooms drifted`);
    assert.equal(property.bathrooms, truth.bathrooms, `${property.slug} bathrooms drifted`);
    assert.equal(property.guests, truth.guests, `${property.slug} guest capacity drifted`);
    assert.equal(
      property.specs,
      `${truth.bedrooms} BR · ${truth.bathrooms} BA · Sleeps ${truth.guests}`,
      `${property.slug} specs must match fallback counts`
    );

    const text = cleanText({
      name: property.name,
      description: property.description,
      highlights: property.highlights,
      amenities: property.amenities,
      specs: property.specs
    });

    if (property.slug === "dockside-dreams") {
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
    const truth = PROPERTY_TRUTH.get(property.slug);
    const compactSpec = `${truth.bedrooms}BR/${truth.bathrooms}BA`;
    const template = readSource(`src/properties/${property.slug}/index.njk`);

    assert.match(llms, new RegExp(`${property.name}[\\s\\S]*${compactSpec.replace(".", "\\.")}`));
    assert.match(template, new RegExp(`<div class="stat-val">${truth.bedrooms}</div>[\\s\\S]*Bedrooms`));
    assert.match(template, new RegExp(`<div class="stat-val">${String(truth.bathrooms).replace(".", "\\.")}</div>[\\s\\S]*Bathrooms`));
    assert.match(template, new RegExp(`<div class="stat-val">${truth.guests}</div>[\\s\\S]*Max Guests`));
  }
});
