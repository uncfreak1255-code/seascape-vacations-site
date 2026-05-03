const { getStore } = require("@netlify/blobs");
const { normalizeAvailability, normalizeListing } = require("../../scripts/cache/normalize-hostaway");
const { fetchListingCalendar, fetchListings, getAccessToken } = require("./_hostaway");
const fs = require("fs");
const path = require("path");

const CACHE_KEY = "properties_cache_v1.json";
const TEMP_KEY = "properties_cache_v1.tmp.json";
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

async function normalizeListingWithAvailability(token, listing, slugMap, window, syncedAt) {
  const normalized = normalizeListing(listing, slugMap);

  try {
    const calendar = await fetchListingCalendar(token, normalized.id, window.startDate, window.endDate);
    return {
      ...normalized,
      availability: normalizeAvailability(calendar, {
        syncedAt,
        windowStart: window.startDate,
        windowEnd: window.endDate,
        basePrice: normalized.price.amount
      })
    };
  } catch (error) {
    return {
      ...normalized,
      availability: null,
      availabilityError: "calendar_sync_failed"
    };
  }
}

async function syncHostawayCache() {
  const token = await getAccessToken();
  const listings = await fetchListings(token);
  const slugMap = loadSlugMap();
  const syncedAt = new Date().toISOString();
  const window = availabilityWindow(new Date(syncedAt));
  const properties = [];

  for (const listing of listings) {
    properties.push(await normalizeListingWithAvailability(token, listing, slugMap, window, syncedAt));
  }

  const store = getStore(STORE_NAME);
  const payload = {
    properties,
    syncStatus: "success",
    lastSuccessfulSync: syncedAt
  };

  await store.set(TEMP_KEY, payload);
  await store.set(CACHE_KEY, payload);

  return payload;
}

exports.syncHostawayCache = syncHostawayCache;

exports.handler = async () => {
  await syncHostawayCache();

  return { statusCode: 200, body: "sync complete" };
};
