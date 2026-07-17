const fs = require("fs");
const path = require("path");
const { getStore } = require("@netlify/blobs");
const { fetchBookingEngineCalendar } = require("../../scripts/cache/booking-engine-calendar");
const {
  isCurrentAvailabilityRange,
  normalizeAvailability
} = require("../../scripts/cache/normalize-hostaway");

const FALLBACK_PATH = path.join(__dirname, "properties-fallback.json");
const VISUAL_TEST_AVAILABILITY_PATH = path.join(__dirname, "..", "..", "tests", "visual", "fixtures", "properties-availability.json");
const CACHE_KEY = "properties_cache_v1.json";
const STORE_NAME = "seascape-cache";
const HOSTAWAY_PREFIX = "https://hostaway-platform.s3.us-west-2.amazonaws.com/";
const CDN_PREFIX = "https://bookingenginecdn.hostaway.com/";
const BOOKING_ENGINE_PREFIX = "https://book.seascape-vacations.com/listings/";
const AVAILABILITY_MAX_AGE_MS = 36 * 60 * 60 * 1000;
const LISTING_ID_BY_SLUG = {
  "dockside-dreams": "206016",
  "the-oasis": "189511",
  "sarasota-luxe": "135881",
  "river-house": "135880",
  "bradenton-pool-home": "487798"
};
const STATIC_PROPERTY_SCHEMA_FACTS_BY_SLUG = {
  "dockside-dreams": {
    latitude: 27.4992,
    longitude: -82.5751,
    postalCode: "34205"
  },
  "the-oasis": {
    latitude: 27.4889,
    longitude: -82.5648,
    postalCode: "34209"
  },
  "sarasota-luxe": {
    latitude: 27.3364,
    longitude: -82.5307,
    postalCode: "34236"
  },
  "river-house": {
    latitude: 27.4989,
    longitude: -82.5748,
    postalCode: "34209"
  },
  "bradenton-pool-home": {
    latitude: 27.4789,
    longitude: -82.5548,
    postalCode: "34205"
  }
};

function deriveSlug(property) {
  if (property && typeof property.slug === "string" && property.slug.trim()) {
    return property.slug.trim();
  }

  const base = property && typeof property.name === "string" ? property.name : "seascape-property";
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizePrice(price) {
  if (typeof price === "number" && Number.isFinite(price)) {
    return price;
  }

  if (price && typeof price === "object") {
    const amount = Number(price.amount);
    if (Number.isFinite(amount)) {
      return amount;
    }
  }

  const numeric = Number(price);
  return Number.isFinite(numeric) ? numeric : 0;
}

function normalizeCount(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function deriveListingId(property, slug) {
  if (property && property.listingId !== undefined && property.listingId !== null && `${property.listingId}`.trim()) {
    return String(property.listingId);
  }

  if (property && property.id !== undefined && property.id !== null) {
    const id = String(property.id).trim();
    if (/^\d+$/.test(id)) {
      return id;
    }
  }

  return LISTING_ID_BY_SLUG[slug] || (property && property.id ? String(property.id).trim() : slug);
}

function deriveBookingUrl(property, slug, listingId) {
  if (property && typeof property.bookingUrl === "string" && property.bookingUrl.trim()) {
    return property.bookingUrl.trim();
  }

  if (/^\d+$/.test(listingId)) {
    return `${BOOKING_ENGINE_PREFIX}${listingId}`;
  }

  const mappedListingId = LISTING_ID_BY_SLUG[slug];
  return mappedListingId ? `${BOOKING_ENGINE_PREFIX}${mappedListingId}` : "";
}

function deriveSpecs(property) {
  if (property && typeof property.specs === "string" && property.specs.trim()) {
    return property.specs.trim();
  }

  return `${normalizeCount(property.bedrooms)} BR · ${normalizeCount(property.bathrooms)} BA · Sleeps ${normalizeCount(property.guests)}`;
}

function normalizeAvailabilitySummary(availability, now = Date.now()) {
  if (!availability || typeof availability !== "object") return null;
  const nextAvailable = availability.nextAvailable;
  if (!nextAvailable || typeof nextAvailable !== "object") return null;

  const syncedAtMs = Date.parse(availability.syncedAt || "");
  if (!Number.isFinite(syncedAtMs) || now - syncedAtMs > AVAILABILITY_MAX_AGE_MS) {
    return null;
  }

  const startDate = typeof nextAvailable.startDate === "string" ? nextAvailable.startDate : "";
  const endDate = typeof nextAvailable.endDate === "string" ? nextAvailable.endDate : "";
  const label = typeof nextAvailable.label === "string" ? nextAvailable.label : "";
  const subcopy = typeof nextAvailable.subcopy === "string" ? nextAvailable.subcopy : "";
  const nights = normalizeCount(nextAvailable.nights);
  if (
    !startDate ||
    !endDate ||
    !label ||
    !nights ||
    !isCurrentAvailabilityRange(nextAvailable, { now })
  ) {
    return null;
  }

  const monthNights = Array.isArray(availability.monthNights)
    ? availability.monthNights
        .map((item) => ({
          label: typeof item.label === "string" ? item.label : "",
          value: normalizeCount(item.value)
        }))
        .filter((item) => item.label)
        .slice(0, 2)
    : [];

  return {
    source: availability.source || "hostaway",
    syncedAt: availability.syncedAt,
    nextAvailable: {
      startDate,
      endDate,
      label,
      nights,
      nightlyRate: normalizeCount(nextAvailable.nightlyRate),
      subcopy
    },
    monthNights,
    weekendsLeft: normalizeCount(availability.weekendsLeft)
  };
}

function todayStamp(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function isVisualTestMode() {
  return process.env.SEASCAPE_VISUAL_TEST === "1";
}

function shouldFetchPublicAvailability() {
  return process.env.SEASCAPE_DISABLE_PUBLIC_AVAILABILITY !== "1" && process.env.GITHUB_ACTIONS !== "true";
}

function loadVisualTestAvailabilityFixture() {
  if (!fs.existsSync(VISUAL_TEST_AVAILABILITY_PATH)) {
    return {};
  }

  try {
    const fixture = JSON.parse(fs.readFileSync(VISUAL_TEST_AVAILABILITY_PATH, "utf8"));
    return fixture && typeof fixture === "object" ? fixture : {};
  } catch (error) {
    return {};
  }
}

function applyAvailabilityFixture(properties, fixtureBySlug) {
  return properties.map((property) => {
    const fixture = fixtureBySlug[property.slug];
    if (!fixture) {
      return property;
    }

    const fixtureNow = Date.parse(fixture.syncedAt || "");
    return {
      ...property,
      availability: normalizeAvailabilitySummary(
        fixture,
        Number.isFinite(fixtureNow) ? fixtureNow : Date.now()
      )
    };
  });
}

async function enrichMissingAvailability(properties) {
  if (!shouldFetchPublicAvailability()) return properties;

  const syncedAt = new Date().toISOString();
  const windowStart = todayStamp(new Date(syncedAt));

  return Promise.all(
    properties.map(async (property) => {
      if (property.availability || !/^\d+$/.test(property.id)) {
        return property;
      }

      try {
        const calendar = await fetchBookingEngineCalendar(property.id, windowStart);
        const availability = normalizeAvailability(calendar, {
          syncedAt,
          windowStart,
          basePrice: property.price
        });
        return {
          ...property,
          availability: normalizeAvailabilitySummary(availability)
        };
      } catch (error) {
        return property;
      }
    })
  );
}

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

function safeProjectionPath() {
  return process.env.SEASCAPE_SAFE_PROPERTY_PROJECTION_PATH || "";
}

function projectionRecords(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.properties)) return payload.properties;
  if (payload && Array.isArray(payload.records)) return payload.records;
  return [];
}

function slugFromProjection(record) {
  if (record.slug || record.property_slug) {
    return String(record.slug || record.property_slug).trim();
  }
  const listingId = record.listing_map_id || record.listingId || record.id;
  return Object.entries(LISTING_ID_BY_SLUG).find(([, id]) => String(id) === String(listingId))?.[0] || null;
}

function safeProjectionOverlay(record) {
  const listingId = record.listing_map_id || record.listingId || record.id || null;
  const bookingUrls = Array.isArray(record.booking_engine_urls) ? record.booking_engine_urls : [];
  return {
    listingId,
    id: listingId,
    bookingUrl: record.bookingUrl || bookingUrls[0],
    price: record.price || record.base_price || record.nightly_rate,
    availability: record.availability || null,
    projection: {
      source: "seascape-ops",
      sourceSystem: record.source_system || "hostaway",
      capturedAt: record.provenance?.captured_at || record.generated_at || null,
      staleAfter: record.provenance?.stale_after || record.stale_after || null
    }
  };
}

function mergeSafePropertyProjection(fallbackProperties, records) {
  const bySlug = new Map();
  for (const record of records) {
    const slug = slugFromProjection(record);
    if (slug) bySlug.set(slug, record);
  }

  return fallbackProperties.map((property) => {
    const slug = deriveSlug(property);
    const projection = bySlug.get(slug);
    if (!projection) return property;
    const overlay = safeProjectionOverlay(projection);
    return {
      ...property,
      ...Object.fromEntries(Object.entries(overlay).filter(([, value]) => value !== undefined && value !== null && value !== "")),
      slug
    };
  });
}

function loadSafePropertyProjection(projectionPath = safeProjectionPath()) {
  if (!projectionPath || !fs.existsSync(projectionPath)) {
    return null;
  }
  const payload = JSON.parse(fs.readFileSync(projectionPath, "utf8"));
  const records = projectionRecords(payload);
  if (!records.length) return null;
  return normalizeProperties(mergeSafePropertyProjection(JSON.parse(fs.readFileSync(FALLBACK_PATH, "utf8")), records));
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
    .map((property) => {
      const slug = deriveSlug(property);
      const listingId = deriveListingId(property, slug);
      const staticSchemaFacts = STATIC_PROPERTY_SCHEMA_FACTS_BY_SLUG[slug] || {};
      const image = toHostawayCdn(property.image);
      const heroImage = toHostawayCdn(property.heroImage || property.image);
      const gallery = Array.isArray(property.gallery)
        ? property.gallery.map((url) => toHostawayCdn(url))
        : Array.isArray(property.images)
          ? property.images.map((url) => toHostawayCdn(url))
          : heroImage
            ? [heroImage]
            : [];

      return {
        ...property,
        id: listingId,
        slug,
        pageUrl: property.pageUrl || `/properties/${slug}/`,
        bookingUrl: deriveBookingUrl(property, slug, listingId),
        price: normalizePrice(property.price),
        bedrooms: normalizeCount(property.bedrooms),
        bathrooms: normalizeCount(property.bathrooms),
        guests: normalizeCount(property.guests),
        rating: normalizeCount(property.rating) || 5,
        specs: deriveSpecs(property),
        schemaIdentifier: property.schemaIdentifier || `seascape-${listingId}`,
        latitude: Number.isFinite(Number(property.latitude)) ? Number(property.latitude) : staticSchemaFacts.latitude || null,
        longitude: Number.isFinite(Number(property.longitude)) ? Number(property.longitude) : staticSchemaFacts.longitude || null,
        postalCode: property.postalCode || staticSchemaFacts.postalCode || "",
        image,
        heroImage,
        gallery,
        availability: normalizeAvailabilitySummary(property.availability)
      };
    });
}

async function getProperties() {
  if (isVisualTestMode()) {
    return applyAvailabilityFixture(loadFallback(), loadVisualTestAvailabilityFixture());
  }

  try {
    const projected = loadSafePropertyProjection();
    if (projected) {
      return projected;
    }

    if (process.env.NETLIFY_BLOBS_CONTEXT || global.netlifyBlobsContext) {
      const cached = await loadFromCache();
      if (cached) {
        return enrichMissingAvailability(cached);
      }
    }
  } catch (error) {
    // Fallback to local seed if cache is unavailable.
  }

  return enrichMissingAvailability(loadFallback());
}

module.exports = getProperties;
module.exports.normalizeProperties = normalizeProperties;
module.exports.toHostawayCdn = toHostawayCdn;
module.exports.normalizeAvailabilitySummary = normalizeAvailabilitySummary;
module.exports.enrichMissingAvailability = enrichMissingAvailability;
module.exports.loadSafePropertyProjection = loadSafePropertyProjection;
module.exports.mergeSafePropertyProjection = mergeSafePropertyProjection;
