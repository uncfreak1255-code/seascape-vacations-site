const fs = require("fs");
const path = require("path");
const { getStore } = require("@netlify/blobs");

const FALLBACK_PATH = path.join(__dirname, "properties.json");
const CACHE_KEY = "properties_cache_v1.json";
const STORE_NAME = "seascape-cache";

async function loadFromCache() {
  const store = getStore(STORE_NAME);
  const cached = await store.get(CACHE_KEY, { type: "json" });
  if (!cached || !Array.isArray(cached.properties)) {
    return null;
  }
  return cached.properties.filter((property) => property.status !== "inactive");
}

function loadFallback() {
  if (!fs.existsSync(FALLBACK_PATH)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(FALLBACK_PATH, "utf8"));
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
