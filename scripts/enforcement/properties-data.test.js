const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const propertiesData = require("../../src/_data/properties.js");
const fallbackProperties = require("../../src/_data/properties-fallback.json");

test("normalizeProperties harmonizes fallback and cached property fields", () => {
  assert.equal(typeof propertiesData.normalizeProperties, "function");
  const syncedAt = new Date().toISOString();
  const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [fallbackProperty, cachedProperty] = propertiesData.normalizeProperties([
    {
      id: "dockside-dreams",
      slug: "dockside-dreams",
      name: "Dockside Dreams",
      city: "Bradenton",
      destination: "bradenton",
      bedrooms: 4,
      bathrooms: 3,
      guests: 12,
      rating: 5,
      price: 450,
      image: "https://bookingenginecdn.hostaway.com/listing/example-image",
      highlights: ["Private Pool & Spa", "Waterfront Dock"],
      amenities: ["pool", "waterfront"],
      description: "Fallback-shaped property",
      specs: "4 BR · 3 BA · Sleeps 12"
    },
    {
      id: "206016",
      slug: "dockside-dreams",
      name: "Dockside Dreams",
      city: "Bradenton",
      destination: "bradenton",
      bedrooms: 4,
      bathrooms: 3,
      guests: 12,
      rating: 5,
      price: { amount: 450, currency: "USD", unit: "night" },
      image: "https://hostaway-platform.s3.us-west-2.amazonaws.com/example-image",
      bookingUrl: "",
      heroImage: "https://hostaway-platform.s3.us-west-2.amazonaws.com/example-hero",
      gallery: ["https://hostaway-platform.s3.us-west-2.amazonaws.com/example-gallery"],
      availability: {
        source: "hostaway",
        syncedAt,
        nextAvailable: {
          startDate,
          endDate,
          label: "Future 7-night range",
          nights: 7,
          nightlyRate: 425,
          subcopy: "7 nights from $425/night - Direct booking"
        },
        monthNights: [
          { label: "NIGHTS IN MAY", value: 7 },
          { label: "NIGHTS IN JUN", value: 0 }
        ],
        weekendsLeft: 1
      },
      highlights: ["Private Pool & Spa", "Waterfront Dock"],
      amenities: ["pool", "waterfront"],
      description: "Cached-shaped property",
      specs: ""
    }
  ]);

  assert.equal(fallbackProperty.id, "206016");
  assert.equal(fallbackProperty.bookingUrl, "https://book.seascape-vacations.com/listings/206016");
  assert.equal(fallbackProperty.pageUrl, "/properties/dockside-dreams/");
  assert.equal(fallbackProperty.price, 450);

  assert.equal(cachedProperty.id, "206016");
  assert.equal(cachedProperty.bookingUrl, "https://book.seascape-vacations.com/listings/206016");
  assert.equal(cachedProperty.pageUrl, "/properties/dockside-dreams/");
  assert.equal(cachedProperty.price, 450);
  assert.match(cachedProperty.image, /bookingenginecdn\.hostaway\.com/);
  assert.match(cachedProperty.heroImage, /bookingenginecdn\.hostaway\.com/);
  assert.match(cachedProperty.gallery[0], /bookingenginecdn\.hostaway\.com/);
  assert.equal(cachedProperty.availability.nextAvailable.label, "Future 7-night range");
  assert.equal(cachedProperty.availability.weekendsLeft, 1);
});

test("fallback property seed includes all curated homes shown in the collection", () => {
  assert.equal(typeof propertiesData.normalizeProperties, "function");

  const slugs = propertiesData
    .normalizeProperties(fallbackProperties)
    .map((property) => property.slug)
    .sort();

  assert.deepEqual(slugs, [
    "blue-house",
    "bradenton-pool-home",
    "coastal-stay",
    "dockside-dreams",
    "river-house",
    "sarasota-luxe",
    "the-oasis"
  ]);
});

test("client listing map stays in sync with properties.js including Blue House", () => {
  const trackingSource = fs.readFileSync(
    path.join(__dirname, "../../src/assets/js/conversion-tracking.js"),
    "utf8"
  );
  const propertiesSource = fs.readFileSync(
    path.join(__dirname, "../../src/_data/properties.js"),
    "utf8"
  );
  const clientBlock = trackingSource.match(/var PROPERTY_SLUG_BY_LISTING_ID = \{([^}]+)\}/);
  const serverBlock = propertiesSource.match(/const LISTING_ID_BY_SLUG = \{([^}]+)\}/);
  assert.ok(clientBlock, "conversion-tracking.js must define PROPERTY_SLUG_BY_LISTING_ID");
  assert.ok(serverBlock, "properties.js must define LISTING_ID_BY_SLUG");

  const clientEntries = [...clientBlock[1].matchAll(/"(\d+)":\s*"([a-z0-9-]+)"/g)]
    .map((match) => [match[1], match[2]])
    .sort((left, right) => left[1].localeCompare(right[1]));
  const serverEntries = [...serverBlock[1].matchAll(/"([a-z0-9-]+)":\s*"(\d+)"/g)]
    .map((match) => [match[2], match[1]])
    .sort((left, right) => left[1].localeCompare(right[1]));

  assert.deepEqual(clientEntries, serverEntries);
  assert.deepEqual(clientEntries.find((entry) => entry[1] === "blue-house"), ["589288", "blue-house"]);
});

test("homepage postcard fan stays in one count-agnostic desktop row", () => {
  const css = fs.readFileSync(path.join(__dirname, "../../src/css/arrival.css"), "utf8");
  const postcardBlock = css.match(/\.g-postcards\{[^}]+\}/);
  assert.ok(postcardBlock, "arrival.css must define .g-postcards");
  assert.match(postcardBlock[0], /grid-auto-flow:column/);
  assert.match(postcardBlock[0], /grid-auto-columns:minmax\(0,1fr\)/);
  assert.doesNotMatch(postcardBlock[0], /repeat\(5/);
  // Seven tilt steps mirror around a flat centre card, and any later card gets a neutral default
  // so a newly onboarded home never renders with an undefined transform.
  assert.match(css, /\.g-postcard:nth-child\(1\)\{--card-angle:-6deg/);
  assert.match(css, /\.g-postcard:nth-child\(4\)\{--card-angle:0deg/);
  assert.match(css, /\.g-postcard:nth-child\(7\)\{--card-angle:6deg/);
  assert.match(css, /\.g-postcard:nth-child\(n\+8\)\{--card-angle:0deg;--card-offset:0px/);
});

test("River House gallery leads with the dusk outdoor set and keeps one daytime yard shot", () => {
  const riverHouse = propertiesData
    .normalizeProperties(fallbackProperties)
    .find((property) => property.slug === "river-house");

  assert.ok(riverHouse);
  assert.equal(riverHouse.photography.photos.length, 12);
  assert.equal(riverHouse.photography.photos[0].src, "/images/homes/river-house/01.webp");
  assert.match(riverHouse.photography.photos[0].alt, /sunset/i);
  assert.equal(riverHouse.photography.photos[1].src, "/images/homes/river-house/36.webp");
  assert.match(riverHouse.photography.photos[1].alt, /pool/i);
  assert.equal(riverHouse.photography.photos[5].src, "/images/homes/river-house/02.webp");
  assert.match(riverHouse.photography.photos[5].alt, /daytime/i);
  assert.equal(riverHouse.image, "https://seascape-vacations.com/images/homes/river-house/01.webp");
  assert.equal(
    riverHouse.photography.photos.filter((photo) => /bedroom/i.test(photo.alt)).length,
    1
  );
});

test("Blue House normalizes to the verified Hostaway identity and local photography", () => {
  const blueHouse = propertiesData
    .normalizeProperties(fallbackProperties)
    .find((property) => property.slug === "blue-house");

  assert.ok(blueHouse);
  assert.equal(blueHouse.id, "589288");
  assert.equal(blueHouse.guests, 11);
  assert.equal(blueHouse.specs, "4 BR · 2 BA · Sleeps 11");
  assert.equal(blueHouse.bookingUrl, "https://book.seascape-vacations.com/listings/589288");
  assert.equal(blueHouse.pageUrl, "/properties/blue-house/");
  assert.equal(blueHouse.latitude, 27.50860514);
  assert.equal(blueHouse.longitude, -82.63215404);
  assert.equal(blueHouse.postalCode, "34209");
  assert.equal(blueHouse.photography.photos.length, 13);
  assert.equal(blueHouse.guestFacts.verifiedAt, "2026-09-13");
  assert.equal(blueHouse.guestFacts.capacityVerifiedAt, "2026-09-30");
});

test("normalizeAvailabilitySummary drops stale or incomplete calendar summaries", () => {
  assert.equal(typeof propertiesData.normalizeAvailabilitySummary, "function");
  const now = Date.parse("2026-07-17T00:30:00.000Z");

  assert.equal(
    propertiesData.normalizeAvailabilitySummary({
      syncedAt: "2020-01-01T00:00:00.000Z",
      nextAvailable: {
        startDate: "2026-05-08",
        endDate: "2026-05-15",
        label: "May 08 - May 15",
        nights: 7,
        subcopy: "7 nights from $425/night - Direct booking"
      }
    }),
    null
  );

  assert.equal(
    propertiesData.normalizeAvailabilitySummary({
      syncedAt: new Date().toISOString(),
      nextAvailable: null
    }),
    null
  );

  assert.equal(
    propertiesData.normalizeAvailabilitySummary(
      {
        syncedAt: "2026-07-16T23:00:00.000Z",
        nextAvailable: {
          startDate: "2026-07-15",
          endDate: "2026-07-17",
          label: "Jul 15 - Jul 17",
          nights: 2,
          subcopy: "2 nights - Direct booking"
        }
      },
      now
    ),
    null
  );

  assert.equal(
    propertiesData.normalizeAvailabilitySummary(
      {
        syncedAt: "2026-07-16T23:00:00.000Z",
        nextAvailable: {
          startDate: "2026-07-16",
          endDate: "2026-07-18",
          label: "Jul 16 - Jul 18",
          nights: 2,
          subcopy: "2 nights - Direct booking"
        }
      },
      now
    )?.nextAvailable.startDate,
    "2026-07-16"
  );
});

test("safe property projection overlays public availability without replacing curated property truth", () => {
  assert.equal(typeof propertiesData.loadSafePropertyProjection, "function");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "safe-property-projection-"));
  const projectionPath = path.join(dir, "properties-latest.json");
  const syncedAt = new Date().toISOString();
  const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const endDate = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  fs.writeFileSync(
    projectionPath,
    JSON.stringify({
      records: [
        {
          listing_map_id: 206016,
          booking_engine_urls: ["https://book.seascape-vacations.com/listings/206016"],
          availability: {
            source: "seascape-ops",
            syncedAt,
            nextAvailable: {
              startDate,
              endDate,
              label: "Future 2-night range",
              nights: 2,
              nightlyRate: 450,
              subcopy: "2 nights from $450/night - Direct booking"
            },
            monthNights: [{ label: "NIGHTS IN JUN", value: 2 }],
            weekendsLeft: 1
          },
          provenance: {
            captured_at: syncedAt,
            stale_after: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        }
      ]
    })
  );

  const properties = propertiesData.loadSafePropertyProjection(projectionPath);
  const dockside = properties.find((property) => property.slug === "dockside-dreams");

  assert.equal(properties.length, 7);
  assert.equal(dockside.name, "Dockside Dreams");
  assert.equal(dockside.id, "206016");
  assert.equal(dockside.availability.source, "seascape-ops");
  assert.equal(dockside.availability.nextAvailable.label, "Future 2-night range");
  assert.equal(dockside.projection.source, "seascape-ops");
});

test("visual test mode keeps fixture availability live for deterministic snapshots", async () => {
  const previousVisualTestValue = process.env.SEASCAPE_VISUAL_TEST;
  process.env.SEASCAPE_VISUAL_TEST = "1";

  try {
    const properties = await propertiesData();
    const availabilityLabels = properties.map((property) => property.availability?.nextAvailable?.label ?? null);

    assert.equal(properties.length, 7);
    assert.deepEqual(availabilityLabels, [
      "Jun 08 - Jun 10",
      "May 18 - May 20",
      "May 30 - Jun 06",
      "Aug 21 - Aug 23",
      "May 18 - May 19",
      "Sep 18 - Sep 21",
      null
    ]);
    assert.equal(properties[0].availability.syncedAt, "2026-05-17T15:39:21.311Z");
  } finally {
    if (previousVisualTestValue === undefined) {
      delete process.env.SEASCAPE_VISUAL_TEST;
    } else {
      process.env.SEASCAPE_VISUAL_TEST = previousVisualTestValue;
    }
  }
});

test("Coastal Stay keeps final identity, ten guests and provider conflicts outside advertised facts", () => {
  const home = propertiesData.normalizeProperties(fallbackProperties).find(p => p.slug === "coastal-stay");
  assert.ok(home);
  assert.equal(home.id, "599394");
  assert.equal(home.name, "Pickleball, Pool, Spa, Hoops & Mini Golf");
  assert.equal(home.guests, 10);
  assert.equal(home.bedrooms, 3);
  assert.equal(home.bathrooms, 2);
  assert.equal(home.bookingUrl, "https://book.seascape-vacations.com/listings/599394");
  assert.equal(home.guestFacts.sleeping.length, 3);
  assert.match(home.guestFacts.sleeping[2], /twin-over-twin.*trundle/);
  assert.equal(home.guestFacts.finalReferenceUrl, "https://www.airbnb.com/rooms/1790003469785984034");
  assert.equal(home.photography.photos.length, 12);
  assert.ok(home.photography.photos.every(p => p.sourceUrl.includes("51916-599394-")));
  assert.doesNotMatch(JSON.stringify(home.guestFacts), /\$40|\b85\b|\bcrib\b|highchair|infants do not count/i);
  assert.ok(!home.amenities.includes("fire-pit"));
});

test("legacy cache requires every curated exact identity after onboarding", () => {
  assert.equal(propertiesData.normalizeCompleteCachedProperties({ properties: fallbackProperties }).length, 7);
  assert.equal(propertiesData.normalizeCompleteCachedProperties({ properties: fallbackProperties.filter(p => p.slug !== "coastal-stay") }), null);
  const wrongIdentity = fallbackProperties.map(p => p.slug === "coastal-stay" ? { ...p, id: "589288" } : p);
  assert.equal(propertiesData.normalizeCompleteCachedProperties({ properties: wrongIdentity }), null);
});

test("unreadable public calendar leaves Coastal Stay availability unknown", async t => {
  const https = require("node:https");
  const { EventEmitter } = require("node:events");
  t.mock.method(https, "request", () => {
    const request = new EventEmitter();
    request.end = () => queueMicrotask(() => request.emit("error", new Error("calendar unavailable")));
    return request;
  });
  const previous = [process.env.GITHUB_ACTIONS, process.env.SEASCAPE_DISABLE_PUBLIC_AVAILABILITY];
  delete process.env.GITHUB_ACTIONS;
  delete process.env.SEASCAPE_DISABLE_PUBLIC_AVAILABILITY;
  try {
    const home = propertiesData.normalizeProperties(fallbackProperties).find(p => p.slug === "coastal-stay");
    const [result] = await propertiesData.enrichMissingAvailability([home]);
    assert.equal(result.availability, null);
    assert.equal(result.id, "599394");
  } finally {
    ["GITHUB_ACTIONS", "SEASCAPE_DISABLE_PUBLIC_AVAILABILITY"].forEach((key, i) => {
      if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i];
    });
  }
});
