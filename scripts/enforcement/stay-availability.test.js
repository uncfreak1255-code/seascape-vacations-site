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
