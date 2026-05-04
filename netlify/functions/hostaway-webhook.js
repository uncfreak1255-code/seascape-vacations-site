const { getStore } = require("@netlify/blobs");
const { normalizeAvailability, normalizeListing } = require("../../scripts/cache/normalize-hostaway");
const { fetchListing, fetchListingCalendar, getAccessToken } = require("./_hostaway");
const fs = require("fs");
const path = require("path");

const SECRET = process.env.HOSTAWAY_WEBHOOK_SECRET;
const CACHE_KEY = "properties_cache_v1.json";
const TEMP_KEY = "properties_cache_v1.tmp.json";
const EVENT_KEY = "hostaway_webhook_events_v1.json";
const STORE_NAME = "seascape-cache";
const SLUG_MAP_PATH = path.join(process.cwd(), "src", "_data", "properties-fallback.json");
const AVAILABILITY_WINDOW_DAYS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;

function loadSlugMap() {
  if (!fs.existsSync(SLUG_MAP_PATH)) return {};
  try {
    const seed = JSON.parse(fs.readFileSync(SLUG_MAP_PATH, "utf8"));
    return seed.reduce((acc, entry) => {
      if (entry.name && entry.slug) acc[entry.name] = entry.slug;
      return acc;
    }, {});
  } catch (err) {
    return {};
  }
}

function toDateStamp(date) {
  return date.toISOString().slice(0, 10);
}

function availabilityWindow(now = new Date()) {
  const startDate = toDateStamp(now);
  const endDate = toDateStamp(new Date(now.getTime() + AVAILABILITY_WINDOW_DAYS * DAY_MS));
  return { startDate, endDate };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (
    SECRET &&
    event.headers["x-webhook-secret"] !== SECRET &&
    event.queryStringParameters?.secret !== SECRET
  ) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const store = getStore(STORE_NAME);
  const payload = JSON.parse(event.body || "{}");
  const listingId =
    payload.listingId || payload.listing?.id || payload.id || payload.listingID;

  if (!listingId) {
    return { statusCode: 400, body: "Missing listingId" };
  }

  const eventId = payload.eventId || payload.event?.id || payload.id;
  if (eventId) {
    const seen = (await store.get(EVENT_KEY, { type: "json" })) || [];
    if (seen.includes(eventId)) {
      return { statusCode: 200, body: "duplicate" };
    }
    seen.push(eventId);
    await store.set(EVENT_KEY, seen.slice(-200));
  }

  const token = await getAccessToken();
  const listing = await fetchListing(token, listingId);
  const slugMap = loadSlugMap();
  const syncedAt = new Date().toISOString();
  const window = availabilityWindow(new Date(syncedAt));
  const normalizedListing = normalizeListing(listing, slugMap);
  let normalized = normalizedListing;

  try {
    const calendar = await fetchListingCalendar(token, normalizedListing.id, window.startDate, window.endDate);
    normalized = {
      ...normalizedListing,
      availability: normalizeAvailability(calendar, {
        syncedAt,
        windowStart: window.startDate,
        windowEnd: window.endDate,
        basePrice: normalizedListing.price.amount
      })
    };
  } catch (error) {
    normalized = {
      ...normalizedListing,
      availability: null,
      availabilityError: "calendar_sync_failed"
    };
  }

  const cache = (await store.get(CACHE_KEY, { type: "json" })) || {
    properties: []
  };
  const next = cache.properties.filter((item) => item.id !== normalized.id);
  next.push(normalized);

  const nextCache = {
    ...cache,
    properties: next,
    syncStatus: "success",
    lastSuccessfulSync: syncedAt
  };

  await store.set(TEMP_KEY, nextCache);
  await store.set(CACHE_KEY, nextCache);

  return { statusCode: 200, body: "ok" };
};
