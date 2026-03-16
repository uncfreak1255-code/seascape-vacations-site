const { getStore } = require("@netlify/blobs");
const { normalizeListing } = require("../../scripts/cache/normalize-hostaway");
const { fetchListing, getAccessToken } = require("./_hostaway");
const fs = require("fs");
const path = require("path");

const SECRET = process.env.HOSTAWAY_WEBHOOK_SECRET;
const CACHE_KEY = "properties_cache_v1.json";
const TEMP_KEY = "properties_cache_v1.tmp.json";
const EVENT_KEY = "hostaway_webhook_events_v1.json";
const STORE_NAME = "seascape-cache";
const SLUG_MAP_PATH = path.join(process.cwd(), "src", "_data", "properties.json");

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
  const normalized = normalizeListing(listing, slugMap);

  const cache = (await store.get(CACHE_KEY, { type: "json" })) || {
    properties: []
  };
  const next = cache.properties.filter((item) => item.id !== normalized.id);
  next.push(normalized);

  const nextCache = {
    ...cache,
    properties: next,
    syncStatus: "success",
    lastSuccessfulSync: new Date().toISOString()
  };

  await store.set(TEMP_KEY, nextCache);
  await store.set(CACHE_KEY, nextCache);

  return { statusCode: 200, body: "ok" };
};
