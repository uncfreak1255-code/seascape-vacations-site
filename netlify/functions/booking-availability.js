const { fetchBookingEngineCalendar } = require("../../scripts/cache/booking-engine-calendar");
const { LISTINGS, summarizeStay, validateRange } = require("../../scripts/booking/stay-availability");

const CACHE_MS = 3 * 60 * 1000;
let cache = null;

function todayStamp(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    },
    body: JSON.stringify(body)
  };
}

async function loadCalendars(fetchCalendar, now = new Date()) {
  const startingDate = todayStamp(now);
  if (cache && cache.startingDate === startingDate && now.getTime() - cache.at < CACHE_MS) {
    return cache.calendars;
  }

  const loader = fetchCalendar || fetchBookingEngineCalendar;
  const entries = await Promise.all(
    LISTINGS.map(async (listing) => [listing.slug, await loader(listing.id, startingDate)])
  );
  const calendars = Object.fromEntries(entries);
  const incomplete = LISTINGS.some((listing) => {
    const days = calendars[listing.slug];
    return !Array.isArray(days) || days.length === 0;
  });
  if (incomplete) {
    throw new Error("calendar-unavailable");
  }
  cache = { startingDate, at: now.getTime(), calendars };
  return calendars;
}

async function handleBookingAvailability(event = {}, options = {}) {
  if ((event.httpMethod || "GET").toUpperCase() !== "GET") {
    return json(405, { ok: false, error: "method-not-allowed" });
  }

  const params = event.queryStringParameters || {};
  const range = validateRange(params.arrive, params.depart);
  if (!range.ok) return json(400, { ok: false, error: range.error });

  try {
    const calendars = await loadCalendars(options.fetchCalendar, options.now);
    const homes = summarizeStay(calendars, params.arrive, params.depart);
    if (homes.some((home) => home.reason === "no-calendar")) {
      return json(503, { ok: false, error: "calendar-unavailable" });
    }
    return json(200, {
      ok: true,
      checkedAt: (options.now || new Date()).toISOString(),
      arrive: params.arrive,
      depart: params.depart,
      homes
    });
  } catch (error) {
    return json(503, { ok: false, error: "calendar-unavailable" });
  }
}

function resetBookingAvailabilityCache() {
  cache = null;
}

exports.handler = (event) => handleBookingAvailability(event);
exports.handleBookingAvailability = handleBookingAvailability;
exports.resetBookingAvailabilityCache = resetBookingAvailabilityCache;
