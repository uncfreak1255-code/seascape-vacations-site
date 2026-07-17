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
    "bradenton-pool-home",
    "dockside-dreams",
    "river-house",
    "sarasota-luxe",
    "the-oasis"
  ]);
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

  assert.equal(properties.length, 5);
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

    assert.equal(properties.length, 5);
    assert.deepEqual(availabilityLabels, [
      "Jun 08 - Jun 10",
      "May 18 - May 20",
      "May 30 - Jun 06",
      "Aug 21 - Aug 23",
      "May 18 - May 19"
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
