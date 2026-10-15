const fs = require("fs");
const path = require("path");

const OWNER_FILE = "src/_data/properties-fallback.json";
const TRACKING_FILE = "src/assets/js/conversion-tracking.js";
const CLIENT_MAP_SEAM = "var PROPERTY_SLUG_BY_LISTING_ID = null;";
const HAND_TYPED_CLIENT_MAP = /PROPERTY_SLUG_BY_LISTING_ID\s*=\s*\{/;
const FALLBACK_PATH = path.join(__dirname, "..", "..", "src", "_data", "properties-fallback.json");

function readFallbackCatalog() {
  if (!fs.existsSync(FALLBACK_PATH)) {
    throw new Error(`${OWNER_FILE} is missing`);
  }
  return JSON.parse(fs.readFileSync(FALLBACK_PATH, "utf8"));
}

function listingIdBySlug(catalog = readFallbackCatalog()) {
  if (!Array.isArray(catalog) || catalog.length === 0) {
    throw new Error(`${OWNER_FILE} has no catalog rows`);
  }

  const map = {};
  for (const row of catalog) {
    const slug = row && typeof row.slug === "string" ? row.slug.trim() : "";
    const listingId = row && row.listingId != null ? String(row.listingId).trim() : "";
    if (!listingId) {
      throw new Error(`${OWNER_FILE} row ${slug || "(missing slug)"} is missing listingId`);
    }
    if (!slug) {
      throw new Error(`${OWNER_FILE} row is missing slug`);
    }
    if (Object.hasOwn(map, slug)) {
      throw new Error(`${OWNER_FILE} duplicate slug ${slug}`);
    }
    map[slug] = listingId;
  }
  return map;
}

function invertListingIdBySlug(bySlug) {
  if (!bySlug || typeof bySlug !== "object" || Array.isArray(bySlug) || Object.keys(bySlug).length === 0) {
    throw new Error(`${OWNER_FILE} has no catalog rows`);
  }

  const inverted = {};
  for (const [slug, listingId] of Object.entries(bySlug)) {
    if (Object.hasOwn(inverted, listingId)) {
      throw new Error(`${OWNER_FILE} duplicate listingId ${listingId}`);
    }
    inverted[listingId] = slug;
  }
  return inverted;
}

function generateClientListingIdMap(trackingSource, catalog = readFallbackCatalog()) {
  if (typeof trackingSource !== "string" || !trackingSource.trim()) {
    throw new Error(`${TRACKING_FILE} is missing`);
  }
  if (HAND_TYPED_CLIENT_MAP.test(trackingSource)) {
    throw new Error(`hand-typed PROPERTY_SLUG_BY_LISTING_ID literal remains in ${TRACKING_FILE}`);
  }
  const seamCount = trackingSource.split(CLIENT_MAP_SEAM).length - 1;
  if (seamCount !== 1) {
    throw new Error(`${TRACKING_FILE} is missing PROPERTY_SLUG_BY_LISTING_ID generate seam`);
  }
  const inverted = invertListingIdBySlug(listingIdBySlug(catalog));
  return trackingSource.replace(
    CLIENT_MAP_SEAM,
    `var PROPERTY_SLUG_BY_LISTING_ID = ${JSON.stringify(inverted)};`
  );
}

function writeGeneratedClientListingIdMap(root = process.cwd()) {
  const sourcePath = path.join(root, TRACKING_FILE);
  const catalogPath = path.join(root, OWNER_FILE);
  const outputPath = path.join(root, "_site", "assets", "js", "conversion-tracking.js");
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`${TRACKING_FILE} is missing`);
  }
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`${OWNER_FILE} is missing`);
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const generated = generateClientListingIdMap(
    fs.readFileSync(sourcePath, "utf8"),
    JSON.parse(fs.readFileSync(catalogPath, "utf8"))
  );
  fs.writeFileSync(outputPath, generated);
  return outputPath;
}

module.exports = {
  OWNER_FILE,
  TRACKING_FILE,
  CLIENT_MAP_SEAM,
  listingIdBySlug,
  invertListingIdBySlug,
  generateClientListingIdMap,
  writeGeneratedClientListingIdMap
};
