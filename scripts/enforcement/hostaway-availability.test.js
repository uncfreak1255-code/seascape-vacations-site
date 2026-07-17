const test = require("node:test");
const assert = require("node:assert/strict");

const {
  businessDateStamp,
  isCurrentAvailabilityRange,
  normalizeAvailability
} = require("../cache/normalize-hostaway");
const {
  validateSafePropertyProjection,
  validateHostawayAvailabilityPayload
} = require("../cache/sync-hostaway-build-cache");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  shouldRequirePropertiesAvailabilityOutput,
  validatePropertiesAvailabilityOutput
} = require("./validate-properties-availability-output");
const {
  calendarDaysFromBookingEngineResponse,
  toBookingEngineHostname
} = require("../cache/booking-engine-calendar");

test("availability ranges use the New York business date and reject expired or malformed dates", () => {
  const now = Date.parse("2026-07-17T00:30:00.000Z");

  assert.equal(businessDateStamp(now), "2026-07-16");
  assert.equal(
    isCurrentAvailabilityRange(
      { startDate: "2026-07-16", endDate: "2026-07-17" },
      { now }
    ),
    true
  );
  assert.equal(
    isCurrentAvailabilityRange(
      { startDate: "2026-07-15", endDate: "2026-07-17" },
      { now }
    ),
    false
  );
  assert.equal(
    isCurrentAvailabilityRange(
      { startDate: "not-a-date", endDate: "2026-07-17" },
      { now }
    ),
    false
  );
  assert.equal(
    isCurrentAvailabilityRange(
      { startDate: "2026-07-16-extra", endDate: "2026-07-17" },
      { now }
    ),
    false
  );
  assert.equal(
    isCurrentAvailabilityRange(
      { startDate: "2026-02-30", endDate: "2026-07-17" },
      { now }
    ),
    false
  );
  assert.equal(
    isCurrentAvailabilityRange(
      { startDate: "2026-07-16", endDate: "2026-07-16" },
      { now }
    ),
    false
  );
});

test("normalizeAvailability derives the next bookable card range from Hostaway calendar days", () => {
  const calendarDays = [
    { date: "2026-05-03", isAvailable: 0, price: 425, minimumStay: 3 },
    { date: "2026-05-04", isAvailable: 0, price: 425, minimumStay: 3 },
    { date: "2026-05-05", isAvailable: 0, price: 425, minimumStay: 3 },
    { date: "2026-05-06", isAvailable: 0, price: 425, minimumStay: 3 },
    { date: "2026-05-07", isAvailable: 0, price: 425, minimumStay: 3 },
    { date: "2026-05-08", isAvailable: 1, price: 425, minimumStay: 3 },
    { date: "2026-05-09", isAvailable: 1, price: 425, minimumStay: 3 },
    { date: "2026-05-10", isAvailable: 1, price: 425, minimumStay: 3 },
    { date: "2026-05-11", isAvailable: 1, price: 425, minimumStay: 3 },
    { date: "2026-05-12", isAvailable: 1, price: 425, minimumStay: 3 },
    { date: "2026-05-13", isAvailable: 1, price: 425, minimumStay: 3 },
    { date: "2026-05-14", isAvailable: 1, price: 425, minimumStay: 3 },
    { date: "2026-05-15", isAvailable: 0, price: 425, minimumStay: 3 }
  ];

  const availability = normalizeAvailability(calendarDays, {
    syncedAt: "2026-05-03T22:00:00.000Z",
    windowStart: "2026-05-03",
    windowEnd: "2026-10-30",
    basePrice: 450
  });

  assert.equal(availability.source, "hostaway");
  assert.deepEqual(availability.nextAvailable, {
    startDate: "2026-05-08",
    endDate: "2026-05-15",
    label: "May 08 - May 15",
    nights: 7,
    nightlyRate: 425,
    subcopy: "7 nights from $425/night - Direct booking"
  });
  assert.deepEqual(availability.monthNights, [
    { label: "NIGHTS IN MAY", value: 7 },
    { label: "NIGHTS IN JUN", value: 0 }
  ]);
  assert.equal(availability.weekendsLeft, 1);
});

test("normalizeAvailability refuses to invent next dates when available runs miss minimum stay", () => {
  const availability = normalizeAvailability(
    [
      { date: "2026-05-03", isAvailable: 1, minimumStay: 4 },
      { date: "2026-05-04", isAvailable: 1, minimumStay: 4 },
      { date: "2026-05-05", isAvailable: 0, minimumStay: 4 }
    ],
    {
      syncedAt: "2026-05-03T22:00:00.000Z",
      windowStart: "2026-05-03",
      windowEnd: "2026-05-06"
    }
  );

  assert.equal(availability.nextAvailable, null);
});

test("normalizeAvailability uses singular night copy for one-night openings", () => {
  const availability = normalizeAvailability(
    [
      { date: "2026-05-11", isAvailable: 1, price: 370, minimumStay: 1 },
      { date: "2026-05-12", isAvailable: 0, price: 370, minimumStay: 1 }
    ],
    {
      syncedAt: "2026-05-03T22:00:00.000Z",
      windowStart: "2026-05-03",
      windowEnd: "2026-05-13"
    }
  );

  assert.equal(availability.nextAvailable.subcopy, "1 night from $370/night - Direct booking");
});

test("normalizeAvailability requires contiguous calendar days for a displayed range", () => {
  const availability = normalizeAvailability(
    [
      { date: "2026-05-03", isAvailable: 1, minimumStay: 2 },
      { date: "2026-05-05", isAvailable: 1, minimumStay: 2 },
      { date: "2026-05-06", isAvailable: 0, minimumStay: 2 }
    ],
    {
      syncedAt: "2026-05-03T22:00:00.000Z",
      windowStart: "2026-05-03",
      windowEnd: "2026-05-07"
    }
  );

  assert.equal(availability.nextAvailable, null);
});

test("booking engine calendar adapter exposes Hostaway day objects without private API credentials", () => {
  const days = calendarDaysFromBookingEngineResponse({
    status: "success",
    result: {
      "2026-05-03": { date: "2026-05-03", isAvailable: 0 },
      "2026-05-04": { date: "2026-05-04", isAvailable: 1 }
    }
  });

  assert.deepEqual(days, [
    { date: "2026-05-03", isAvailable: 0 },
    { date: "2026-05-04", isAvailable: 1 }
  ]);
  assert.equal(toBookingEngineHostname("https://book.seascape-vacations.com"), "book.seascape-vacations.com");
});

test("Netlify builds require rendered live availability cards", () => {
  assert.equal(shouldRequirePropertiesAvailabilityOutput({ NETLIFY: "true" }), true);
  assert.equal(shouldRequirePropertiesAvailabilityOutput({ SEASCAPE_REQUIRE_PROPERTIES_AVAILABILITY: "1" }), true);
  assert.equal(shouldRequirePropertiesAvailabilityOutput({}), false);
});

test("rendered availability output gate rejects stale fallback cards", () => {
  const liveHtml = `
    <article
      class="catalog-card"
      data-next-available-start="2026-08-01"
      data-next-available-end="2026-08-03"
    ><span>Availability · live</span><div class="catalog-next-lbl">Next available</div></article>
    <article
      class="catalog-card"
      data-next-available-start="2026-08-04"
      data-next-available-end="2026-08-06"
    ><span>Availability · live</span><div class="catalog-next-lbl">Next available</div></article>
    <script>badge.textContent = "Calendar · secure";</script>
  `;

  const report = validatePropertiesAvailabilityOutput(liveHtml, { expectedCards: 2 });
  assert.equal(report.cardCount, 2);
  assert.equal(report.nextAvailableCount, 2);
  assert.equal(report.calendarSecureCount, 0);

  assert.throws(
    () =>
      validatePropertiesAvailabilityOutput(
        `<article class="catalog-card"><span>Calendar · secure</span><div class="catalog-next-lbl">Live calendar</div></article>`,
        { expectedCards: 1 }
      ),
    /availability output check failed/
  );
});

test("Hostaway build cache freshness gate rejects missing or stale card availability", () => {
  const freshPayload = {
    properties: [
      {
        slug: "dockside-dreams",
        availability: {
          syncedAt: "2026-05-03T22:00:00.000Z",
          nextAvailable: { startDate: "2026-05-08", endDate: "2026-05-10" }
        }
      },
      {
        slug: "the-oasis",
        availability: {
          syncedAt: "2026-05-03T22:00:00.000Z",
          nextAvailable: { startDate: "2026-05-18", endDate: "2026-05-20" }
        }
      }
    ]
  };

  assert.deepEqual(
    validateHostawayAvailabilityPayload(freshPayload, {
      now: Date.parse("2026-05-04T00:00:00.000Z"),
      requiredSlugs: ["dockside-dreams", "the-oasis"]
    }),
    { checked: 2 }
  );

  assert.throws(
    () =>
      validateHostawayAvailabilityPayload(freshPayload, {
        now: Date.parse("2026-05-06T12:00:00.000Z"),
        requiredSlugs: ["dockside-dreams", "the-oasis"]
      }),
    /stale availability/
  );

  assert.throws(
    () =>
      validateHostawayAvailabilityPayload(
        { properties: [{ slug: "dockside-dreams", availability: null }] },
        {
          now: Date.parse("2026-05-04T00:00:00.000Z"),
          requiredSlugs: ["dockside-dreams", "the-oasis"]
        }
      ),
    /missing next availability.*the-oasis: missing listing/
  );
});

test("safe property projection is validated as the build-time availability surface", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "safe-property-build-"));
  const projectionPath = path.join(dir, "properties-latest.json");
  const syncedAt = new Date().toISOString();
  const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const endDate = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const availability = {
    source: "seascape-ops",
    syncedAt,
    nextAvailable: {
      startDate,
      endDate,
      label: "Future 2-night range",
      nights: 2,
      nightlyRate: 425,
      subcopy: "2 nights from $425/night - Direct booking"
    }
  };

  fs.writeFileSync(
    projectionPath,
    JSON.stringify({
      records: [
        { property_slug: "dockside-dreams", listing_map_id: 206016, availability },
        { property_slug: "the-oasis", listing_map_id: 189511, availability },
        { property_slug: "sarasota-luxe", listing_map_id: 135881, availability },
        { property_slug: "river-house", listing_map_id: 135880, availability },
        { property_slug: "bradenton-pool-home", listing_map_id: 487798, availability }
      ]
    })
  );

  assert.deepEqual(
    validateSafePropertyProjection(projectionPath),
    { checked: 5 }
  );
});
