const { loadSafePropertyProjection } = require("../../src/_data/properties");

const AVAILABILITY_MAX_AGE_MS = 36 * 60 * 60 * 1000;
const REQUIRED_PROPERTY_SLUGS = [
  "dockside-dreams",
  "the-oasis",
  "sarasota-luxe",
  "river-house",
  "bradenton-pool-home"
];

function safePropertyProjectionPath(env = process.env) {
  return env.SEASCAPE_SAFE_PROPERTY_PROJECTION_PATH || "";
}

function shouldUseLegacyHostawayCache(env = process.env) {
  return env.SEASCAPE_ENABLE_LEGACY_HOSTAWAY_CACHE === "1";
}

function shouldRequireHostawayCache(env = process.env) {
  return shouldUseLegacyHostawayCache(env) && env.SEASCAPE_REQUIRE_HOSTAWAY_CACHE === "1";
}

function validateHostawayAvailabilityPayload(payload, options = {}) {
  const now = options.now || Date.now();
  const maxAgeMs = options.maxAgeMs || AVAILABILITY_MAX_AGE_MS;
  const requiredSlugs = options.requiredSlugs || REQUIRED_PROPERTY_SLUGS;

  if (!payload || !Array.isArray(payload.properties)) {
    throw new Error("Hostaway payload is missing properties");
  }

  const bySlug = new Map(payload.properties.map((property) => [property.slug, property]));
  const failures = [];

  for (const slug of requiredSlugs) {
    const property = bySlug.get(slug);
    if (!property) {
      failures.push(`${slug}: missing listing`);
      continue;
    }

    const availability = property.availability;
    const syncedAtMs = Date.parse(availability?.syncedAt || "");
    if (!availability || !availability.nextAvailable) {
      failures.push(`${slug}: missing next availability`);
      continue;
    }

    if (!Number.isFinite(syncedAtMs)) {
      failures.push(`${slug}: missing availability syncedAt`);
      continue;
    }

    if (now - syncedAtMs > maxAgeMs) {
      failures.push(`${slug}: stale availability synced at ${availability.syncedAt}`);
    }
  }

  if (failures.length) {
    throw new Error(`Hostaway availability freshness failed: ${failures.join("; ")}`);
  }

  return { checked: requiredSlugs.length };
}

function validateSafePropertyProjection(projectionPath, options = {}) {
  const properties = loadSafePropertyProjection(projectionPath);
  return validateHostawayAvailabilityPayload({ properties }, options);
}

async function main() {
  const projectionPath = safePropertyProjectionPath();
  if (projectionPath) {
    const report = validateSafePropertyProjection(projectionPath);
    console.log(
      `[safe-property-projection] using ${projectionPath}; verified ${report.checked} live availability cards`
    );
    return;
  }

  if (!shouldUseLegacyHostawayCache()) {
    console.log("[hostaway-cache] legacy raw Hostaway cache disabled; using booking-engine availability hydration");
    return;
  }

  const requireHostawayCache = shouldRequireHostawayCache();

  if (!process.env.HOSTAWAY_ID || !process.env.HOSTAWAY_SECRET) {
    const message = "[hostaway-cache] HOSTAWAY_ID/HOSTAWAY_SECRET not set";
    if (requireHostawayCache) {
      throw new Error(message);
    }
    const log = process.env.NETLIFY === "true" ? console.warn : console.log;
    log(`${message}; falling back to booking-engine availability hydration`);
    return;
  }

  try {
    const { syncHostawayCache } = require("../../netlify/functions/hostaway-sync");
    const payload = await syncHostawayCache();
    const report = validateHostawayAvailabilityPayload(payload);
    console.log(
      `[hostaway-cache] refreshed ${payload.properties.length} properties before build; verified ${report.checked} live availability cards`
    );
  } catch (error) {
    if (requireHostawayCache) {
      throw error;
    }
    console.warn(`[hostaway-cache] skipped: ${error.message}`);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`[hostaway-cache] failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  main,
  safePropertyProjectionPath,
  shouldUseLegacyHostawayCache,
  shouldRequireHostawayCache,
  validateHostawayAvailabilityPayload,
  validateSafePropertyProjection
};
