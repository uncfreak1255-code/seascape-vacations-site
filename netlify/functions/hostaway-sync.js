const { getStore } = require("@netlify/blobs");
const { normalizeListing } = require("../../scripts/cache/normalize-hostaway");
const { fetchListings, getAccessToken } = require("./_hostaway");
const fs = require("fs");
const path = require("path");

const CACHE_KEY = "properties_cache_v1.json";
const TEMP_KEY = "properties_cache_v1.tmp.json";
const STORE_NAME = "seascape-cache";
const SLUG_MAP_PATH = path.join(process.cwd(), "src", "_data", "properties-fallback.json");

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

exports.handler = async () => {
  const token = await getAccessToken();
  const listings = await fetchListings(token);
  const slugMap = loadSlugMap();
  const properties = listings.map((listing) => normalizeListing(listing, slugMap));

  const store = getStore(STORE_NAME);
  const payload = {
    properties,
    syncStatus: "success",
    lastSuccessfulSync: new Date().toISOString()
  };

  await store.set(TEMP_KEY, payload);
  await store.set(CACHE_KEY, payload);

  return { statusCode: 200, body: "sync complete" };
};
