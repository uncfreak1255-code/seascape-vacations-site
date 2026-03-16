const fs = require("fs");
const path = require("path");
const { getStore } = require("@netlify/blobs");

const FALLBACK_PATH = path.join(__dirname, "properties.json");
const CACHE_KEY = "properties_cache_v1.json";
const STORE_NAME = "seascape-cache";
const HOSTAWAY_PREFIX = "https://hostaway-platform.s3.us-west-2.amazonaws.com/";
const CDN_PREFIX = "https://bookingenginecdn.hostaway.com/";

async function loadFromCache() {
  const store = getStore(STORE_NAME);
  const cached = await store.get(CACHE_KEY, { type: "json" });
  if (!cached || !Array.isArray(cached.properties)) {
    return null;
  }
  return normalizeProperties(cached.properties);
}

function loadFallback() {
  if (!fs.existsSync(FALLBACK_PATH)) {
    return [];
  }
  return normalizeProperties(JSON.parse(fs.readFileSync(FALLBACK_PATH, "utf8")));
}

function toHostawayCdn(url, width = 1600) {
  if (!url || typeof url !== "string") return url;
  const clean = url.split("?")[0];
  if (clean.includes("bookingenginecdn.hostaway.com/")) {
    return `${clean}?width=${width}&quality=80&format=webp&v=2`;
  }
  if (clean.startsWith(HOSTAWAY_PREFIX)) {
    return `${CDN_PREFIX}${clean.slice(HOSTAWAY_PREFIX.length)}?width=${width}&quality=80&format=webp&v=2`;
  }
  return clean;
}

function normalizeProperties(list) {
  return list
    .filter((property) => property.status !== "inactive")
    .map((property) => ({
      ...property,
      image: toHostawayCdn(property.image),
      heroImage: toHostawayCdn(property.heroImage),
      gallery: Array.isArray(property.gallery)
        ? property.gallery.map((url) => toHostawayCdn(url))
        : property.gallery
    }));
}

module.exports = async function () {
  try {
    if (process.env.NETLIFY_BLOBS_CONTEXT || global.netlifyBlobsContext) {
      const cached = await loadFromCache();
      if (cached) {
        return cached;
      }
    }
  } catch (error) {
    // Fallback to local seed if cache is unavailable.
  }

  return loadFallback();
};
