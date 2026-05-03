const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeAvailability } = require("../cache/normalize-hostaway");
const {
  calendarDaysFromBookingEngineResponse,
  toBookingEngineHostname
} = require("../cache/booking-engine-calendar");

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
