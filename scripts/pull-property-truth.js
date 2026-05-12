#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { normalizeImage } = require("./cache/normalize-hostaway");

const projectRoot = path.resolve(__dirname, "..");
const DEFAULT_OUTPUT = path.join(projectRoot, "src", "_data", "properties-fallback.json");
const DEFAULT_SNAPSHOT_DIR = path.join(projectRoot, "scripts", "cache", "hostaway-property-snapshots");
const DEFAULT_LAST_GOOD = path.join(projectRoot, "scripts", "cache", "properties-fallback.last-good.json");
const DEFAULT_BASE_URL = "https://api.hostaway.com/v1";
const DEFAULT_SLUG_MAP = {
  "Dockside Dreams": "dockside-dreams",
  "The Oasis": "the-oasis",
  "Sarasota Luxe": "sarasota-luxe",
  "River House": "river-house",
  "Bradenton Pool Home": "bradenton-pool-home"
};

function normalizeNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function slugify(name) {
  return String(name || "seascape-property")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sumBathrooms(listing) {
  const full = normalizeNumber(listing.bathrooms ?? listing.bathroomsNumber);
  const guest = normalizeNumber(listing.guestBathrooms);
  return full + guest;
}

function normalizeAmenityName(value) {
  if (!value) return null;
  if (typeof value === "string") return value.trim();
  return (value.name || value.amenityName || value.title || "").trim();
}

function normalizeStructuredAmenities(listing) {
  const amenitySources = [
    listing.amenities,
    listing.listingAmenities,
    listing.listingAmenitiesObject
  ].filter(Array.isArray);

  return [...new Set(amenitySources.flat().map(normalizeAmenityName).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
}

function normalizeHostawayListing(listing, slugMap = DEFAULT_SLUG_MAP) {
  const name = listing.name || "Seascape Vacation Rental";
  const slug = slugMap[name] || slugify(name);
  const bedrooms = normalizeNumber(listing.bedrooms ?? listing.bedroomsNumber);
  const bathrooms = sumBathrooms(listing);
  const guests = normalizeNumber(listing.personCapacity ?? listing.guests);
  const images = (listing.listingImages || listing.images || [])
    .map((image) => normalizeImage(image.url || image))
    .filter(Boolean);
  const heroImage = images[0] || "/images/seascape-og-default.jpg";

  return {
    id: String(listing.id),
    slug,
    name,
    city: listing.city || "Bradenton",
    destination: (listing.city || "bradenton").toLowerCase().replace(/\s+/g, "-"),
    bedrooms,
    bathrooms,
    guests,
    rating: listing.reviewAverageRating ?? null,
    price: { amount: normalizeNumber(listing.listingPrice), currency: "USD", unit: "night" },
    description: listing.description || "",
    highlights: [],
    amenities: normalizeStructuredAmenities(listing),
    specs: `${bedrooms} BR · ${bathrooms} BA · Sleeps ${guests}`,
    bookingUrl: listing.listingUrl || "",
    heroImage,
    image: heroImage,
    gallery: images.length ? images.slice(0, 10) : [heroImage],
    status: listing.status || "active",
    updatedAt: listing.updatedAt || new Date().toISOString(),
    source: {
      system: "hostaway",
      listingId: String(listing.id),
      syncedAt: new Date().toISOString(),
      provenance: {
        bedrooms: listing.bedrooms !== undefined ? "bedrooms" : "bedroomsNumber",
        bathrooms: "bathrooms + guestBathrooms",
        guests: listing.personCapacity !== undefined ? "personCapacity" : "guests",
        price: "listingPrice; operational fallback only, not normal nightly truth without calendar context",
        description: "Hostaway description text copied through; not parsed for amenity facts",
        amenities: "structured Hostaway amenity arrays only; description text is not mined"
      }
    }
  };
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function ensureDir(fileOrDir, isDir = false) {
  fs.mkdirSync(isDir ? fileOrDir : path.dirname(fileOrDir), { recursive: true });
}

function writeJsonAtomic(outputPath, value) {
  ensureDir(outputPath);
  const tempPath = `${outputPath}.tmp`;
  fs.writeFileSync(tempPath, stableJson(value));
  fs.renameSync(tempPath, outputPath);
}

function createLineDiff(beforeText, afterText) {
  if (beforeText === afterText) return "";
  const before = beforeText.split("\n");
  const after = afterText.split("\n");
  const lines = [];
  const max = Math.max(before.length, after.length);

  for (let index = 0; index < max; index += 1) {
    if (before[index] === after[index]) continue;
    if (before[index] !== undefined) lines.push(`- ${before[index]}`);
    if (after[index] !== undefined) lines.push(`+ ${after[index]}`);
  }

  return lines.join("\n");
}

function snapshotName(now) {
  return `${now.replace(/[:.]/g, "-")}-hostaway-properties.json`;
}

function applyPropertyTruth({ properties, rawPayload, outputPath, snapshotDir, lastGoodPath, dryRun = false, now }) {
  const timestamp = now || new Date().toISOString();
  ensureDir(snapshotDir, true);
  const snapshotPath = path.join(snapshotDir, snapshotName(timestamp));
  writeJsonAtomic(snapshotPath, rawPayload);

  const beforeText = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
  const afterText = stableJson(properties);
  const diff = createLineDiff(beforeText, afterText);
  const changed = beforeText !== afterText;

  if (dryRun || !changed) {
    return { changed, wroteOutput: false, snapshotPath, diff };
  }

  if (beforeText) {
    writeJsonAtomic(lastGoodPath, JSON.parse(beforeText));
  }
  writeJsonAtomic(outputPath, properties);
  return { changed, wroteOutput: true, snapshotPath, diff };
}

function restoreLastGood({ outputPath = DEFAULT_OUTPUT, lastGoodPath = DEFAULT_LAST_GOOD } = {}) {
  if (!fs.existsSync(lastGoodPath)) {
    throw new Error(`No last-good snapshot found at ${lastGoodPath}`);
  }
  writeJsonAtomic(outputPath, JSON.parse(fs.readFileSync(lastGoodPath, "utf8")));
  return outputPath;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}) {
  const fetchImpl = options.fetchImpl || global.fetch;
  if (!fetchImpl) throw new Error("fetch is not available in this Node runtime");

  const retries = options.retries ?? 3;
  const sleepImpl = options.sleep || sleep;
  const headers = options.headers || {};

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetchImpl(url, { ...options, headers });
    if (response.ok) {
      return response.json();
    }

    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === retries) {
      const body = response.text ? await response.text() : "";
      throw new Error(`Hostaway request failed ${response.status}: ${body}`);
    }

    const retryAfter = Number(response.headers?.get?.("retry-after"));
    const delayMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : Math.min(30000, 1000 * 2 ** attempt);
    await sleepImpl(delayMs);
  }

  throw new Error("Hostaway request failed after retries");
}

async function pullHostawayListings({ baseUrl = DEFAULT_BASE_URL, token, fetchImpl } = {}) {
  const authToken = token || process.env.HOSTAWAY_API_TOKEN || process.env.HOSTAWAY_ACCESS_TOKEN;
  if (!authToken) throw new Error("Set HOSTAWAY_API_TOKEN or HOSTAWAY_ACCESS_TOKEN before pulling property truth");

  const payload = await fetchWithRetry(`${baseUrl}/listings?limit=500`, {
    fetchImpl,
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const listings = Array.isArray(payload.result) ? payload.result : Array.isArray(payload) ? payload : [];
  return { payload, properties: listings.map((listing) => normalizeHostawayListing(listing)) };
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    restore: false,
    outputPath: DEFAULT_OUTPUT,
    snapshotDir: DEFAULT_SNAPSHOT_DIR,
    lastGoodPath: DEFAULT_LAST_GOOD
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--restore-last-good") args.restore = true;
    else if (arg === "--output") args.outputPath = path.resolve(argv[++index]);
    else if (arg === "--snapshot-dir") args.snapshotDir = path.resolve(argv[++index]);
    else if (arg === "--last-good") args.lastGoodPath = path.resolve(argv[++index]);
    else if (arg === "--help") args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/pull-property-truth.js [--dry-run] [--restore-last-good]

Options:
  --dry-run             Fetch and snapshot Hostaway, then print diff without writing output
  --restore-last-good   Restore the previous properties-fallback.json backup
  --output <path>       Output JSON path, default src/_data/properties-fallback.json
  --snapshot-dir <dir>  Raw Hostaway snapshot directory
  --last-good <path>    Last-good backup path`);
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    printHelp();
    return;
  }
  if (args.restore) {
    const restored = restoreLastGood(args);
    console.log(`Restored ${restored} from ${args.lastGoodPath}`);
    return;
  }

  const { payload, properties } = await pullHostawayListings({});
  const result = applyPropertyTruth({
    properties,
    rawPayload: payload,
    outputPath: args.outputPath,
    snapshotDir: args.snapshotDir,
    lastGoodPath: args.lastGoodPath,
    dryRun: args.dryRun
  });

  console.log(`Snapshot: ${result.snapshotPath}`);
  console.log(result.changed ? "Diff:" : "No output changes.");
  if (result.diff) console.log(result.diff);
  console.log(result.wroteOutput ? `Wrote ${args.outputPath}` : "Output not written.");
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  applyPropertyTruth,
  fetchWithRetry,
  normalizeHostawayListing,
  parseArgs,
  restoreLastGood,
  writeJsonAtomic
};
