const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  LISTINGS,
  addDays,
  evaluateStay
} = require("../booking/stay-availability");
const {
  handleBookingAvailability,
  resetBookingAvailabilityCache
} = require("../../netlify/functions/booking-availability");

function day(date, overrides = {}) {
  return {
    date,
    isAvailable: 1,
    status: "available",
    minimumStay: 2,
    closedOnArrival: 0,
    closedOnDeparture: 0,
    ...overrides
  };
}

function stay(start, nights, overrides = {}) {
  return Array.from({ length: nights + 1 }, (_, offset) => day(addDays(start, offset), overrides));
}

test("a reserved night is not bookable even when the departure morning is open", () => {
  const days = stay("2026-10-18", 4);
  days[0] = day("2026-10-18", { isAvailable: 0, status: "reserved" });
  days[1] = day("2026-10-19", { isAvailable: 0, status: "reserved" });

  assert.deepEqual(evaluateStay(days, "2026-10-18", "2026-10-22"), {
    bookable: false,
    reason: "booked",
    minimumStay: 2
  });
});

test("minimum stay is enforced only after every requested night is open", () => {
  const days = stay("2026-09-29", 7, { minimumStay: 7 });

  assert.equal(evaluateStay(days, "2026-09-29", "2026-10-01").reason, "minimum-stay");
  assert.equal(evaluateStay(days, "2026-09-29", "2026-10-06").bookable, true);
});

test("checkout can fall on a reserved day when the stayed nights are open", () => {
  const days = stay("2026-09-26", 2, { minimumStay: 2 });
  days[2] = day("2026-09-28", { isAvailable: 0, status: "reserved", closedOnDeparture: 0 });

  assert.equal(evaluateStay(days, "2026-09-26", "2026-09-28").bookable, true);
});

test("closed arrival and closed departure are separate from a booked night", () => {
  const closedArrival = stay("2026-10-13", 2);
  closedArrival[0] = day("2026-10-13", { closedOnArrival: 1 });
  assert.equal(evaluateStay(closedArrival, "2026-10-13", "2026-10-15").reason, "closed-arrival");

  const closedDeparture = stay("2026-10-13", 2);
  closedDeparture[2] = day("2026-10-15", { closedOnDeparture: 1 });
  assert.equal(evaluateStay(closedDeparture, "2026-10-13", "2026-10-15").reason, "closed-departure");
});

test("calendar string flags follow the established Hostaway normalizer", () => {
  const days = stay("2026-10-13", 2, { isAvailable: "1" });
  assert.equal(evaluateStay(days, "2026-10-13", "2026-10-15").bookable, true);
  days[0].closedOnArrival = "1";
  assert.equal(evaluateStay(days, "2026-10-13", "2026-10-15").reason, "closed-arrival");
});

test("booking availability uses the same six listing ids as the site catalog", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "..", "src", "_data", "properties.js"), "utf8");
  for (const listing of LISTINGS) {
    assert.match(source, new RegExp(`"${listing.slug}": "${listing.id}"`));
  }
});

test("availability endpoint reports only the homes open for the requested stay", async () => {
  resetBookingAvailabilityCache();
  const calendars = {
    "dockside-dreams": stay("2026-09-26", 2).map((entry) => ({ ...entry, isAvailable: 0, status: "reserved" })),
    "the-oasis": stay("2026-09-26", 2).map((entry) => ({ ...entry, isAvailable: 0, status: "reserved" })),
    "sarasota-luxe": stay("2026-09-26", 2, { minimumStay: 7 }),
    "river-house": stay("2026-09-26", 2, { minimumStay: 2 }),
    "bradenton-pool-home": stay("2026-09-26", 2).map((entry) => ({ ...entry, isAvailable: 0, status: "reserved" })),
    "blue-house": stay("2026-09-26", 2, { minimumStay: 4 })
  };

  const response = await handleBookingAvailability(
    { httpMethod: "GET", queryStringParameters: { arrive: "2026-09-26", depart: "2026-09-28" } },
    { fetchCalendar: async (id) => calendars[LISTINGS.find((listing) => listing.id === id).slug] }
  );
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    body.homes.filter((home) => home.bookable).map((home) => home.slug),
    ["river-house"]
  );
  assert.equal(body.homes.find((home) => home.slug === "sarasota-luxe").reason, "minimum-stay");
  assert.equal(JSON.stringify(body).includes("price"), false);
});

test("availability endpoint fails closed when a calendar cannot be read", async () => {
  resetBookingAvailabilityCache();
  const response = await handleBookingAvailability(
    { httpMethod: "GET", queryStringParameters: { arrive: "2026-10-18", depart: "2026-10-22" } },
    { fetchCalendar: async () => { throw new Error("down"); } }
  );

  assert.equal(response.statusCode, 503);
  assert.equal(JSON.parse(response.body).ok, false);
});

test("a missing arrival or mid-stay day is incomplete, not booked", () => {
  assert.deepEqual(evaluateStay([], "2026-10-18", "2026-10-22"), {
    bookable: false,
    reason: "no-calendar",
    minimumStay: null
  });

  const days = stay("2026-10-18", 4);
  days.splice(2, 1);
  assert.equal(evaluateStay(days, "2026-10-18", "2026-10-22").reason, "no-calendar");

  // A reserved earlier day must not hide a later gap in a partial response.
  days[0] = day("2026-10-18", { isAvailable: 0, status: "reserved" });
  assert.equal(evaluateStay(days, "2026-10-18", "2026-10-22").reason, "no-calendar");

  const missingDeparture = stay("2026-10-18", 4).slice(0, -1);
  assert.equal(evaluateStay(missingDeparture, "2026-10-18", "2026-10-22").reason, "no-calendar");
});

test("availability endpoint fails open when a Hostaway calendar is empty or missing the stay", async () => {
  resetBookingAvailabilityCache();
  const empty = await handleBookingAvailability(
    { httpMethod: "GET", queryStringParameters: { arrive: "2026-10-18", depart: "2026-10-22" } },
    { fetchCalendar: async () => [] }
  );
  assert.equal(empty.statusCode, 503);
  assert.equal(JSON.parse(empty.body).ok, false);

  resetBookingAvailabilityCache();
  const calendars = Object.fromEntries(LISTINGS.map((listing) => [listing.slug, stay("2026-09-26", 2)]));
  calendars["river-house"] = stay("2026-09-01", 2);
  const missingRange = await handleBookingAvailability(
    { httpMethod: "GET", queryStringParameters: { arrive: "2026-09-26", depart: "2026-09-28" } },
    { fetchCalendar: async (id) => calendars[LISTINGS.find((listing) => listing.id === id).slug] }
  );
  assert.equal(missingRange.statusCode, 503);
  assert.equal(JSON.parse(missingRange.body).error, "calendar-unavailable");
});

test("an empty Hostaway calendar is not cached as booked homes", async () => {
  resetBookingAvailabilityCache();
  const first = await handleBookingAvailability(
    { httpMethod: "GET", queryStringParameters: { arrive: "2026-09-26", depart: "2026-09-28" } },
    { fetchCalendar: async () => [] }
  );
  assert.equal(first.statusCode, 503);

  const calendars = Object.fromEntries(LISTINGS.map((listing) => [listing.slug, stay("2026-09-26", 2)]));
  const second = await handleBookingAvailability(
    { httpMethod: "GET", queryStringParameters: { arrive: "2026-09-26", depart: "2026-09-28" } },
    { fetchCalendar: async (id) => calendars[LISTINGS.find((listing) => listing.id === id).slug] }
  );
  assert.equal(second.statusCode, 200);
  assert.equal(JSON.parse(second.body).homes.every((home) => home.bookable), true);
});

test("catalog leaves homes visible when the calendar check is incomplete or fails", () => {
  const catalog = fs.readFileSync(path.join(__dirname, "..", "..", "src", "assets", "js", "catalog.js"), "utf8");
  assert.match(catalog, /count > 0 && !visualTestMode/);
  assert.match(catalog, /home\.reason === "no-calendar"/);
  assert.match(catalog, /showCapacityState\(visible/);
  assert.match(catalog, /Availability could not be checked\. Confirm it on each booking page/);
  assert.match(catalog, /function emptyCopy\(\)/);
});

test("property checkout does not stay blocked after dates are cleared", () => {
  const guest = fs.readFileSync(path.join(__dirname, "..", "..", "src", "assets", "js", "guest.js"), "utf8");
  assert.match(guest, /function clearStayGate\(checkout\)/);
  assert.match(guest, /else \{clearStayGate\(checkout\);\}/);
  assert.match(guest, /home\.reason==='no-calendar'/);
  assert.match(guest, /delete checkout\.dataset\.stayBlocked/);
});
