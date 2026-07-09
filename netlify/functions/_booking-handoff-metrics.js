const crypto = require("crypto");

const BOOKING_HANDOFF_STORE_NAME = "seascape-booking-handoffs";
const BOOKING_HANDOFF_METRICS_KEY = "booking_handoff_metrics_v1.json";
const MAX_RECEIPTS = 1000;
const MAX_TOKEN_LENGTH = 96;
const MAX_CONTEXT_LENGTH = 160;

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeToken(value, maxLength = MAX_TOKEN_LENGTH) {
  return normalizeText(value)
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
}

function normalizeContextValue(value, maxLength = MAX_CONTEXT_LENGTH) {
  return normalizeText(value).replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizePath(value) {
  const input = normalizeText(value);
  if (!input) return "/";

  try {
    const parsed = new URL(input);
    return normalizePath(parsed.pathname);
  } catch (_error) {
    // Relative path.
  }

  let path = input.startsWith("/") ? input : `/${input}`;
  if (path !== "/" && path.endsWith(".html")) {
    path = path.slice(0, -5);
  }
  if (path !== "/" && !path.endsWith("/")) {
    path += "/";
  }
  return path;
}

function slugFromPath(path) {
  const normalizedPath = normalizePath(path);
  if (normalizedPath === "/") return "home";
  return normalizedPath.replace(/^\/+|\/+$/g, "").split("/").pop() || "home";
}

function normalizeBookingUrl(value) {
  const input = normalizeText(value);
  if (!input) return "";

  try {
    const url = new URL(input, "https://seascape-vacations.com/");
    if (url.hostname.replace(/^www\./, "").toLowerCase() !== "book.seascape-vacations.com") {
      return "";
    }

    for (const key of [...url.searchParams.keys()]) {
      if (![
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "ref",
        "checkin",
        "checkout",
        "guests",
        "sv_handoff_id",
        "sv_session_id",
        "sv_guide_click_id"
      ].includes(key)) {
        url.searchParams.delete(key);
      }
    }

    return url.toString();
  } catch (_error) {
    return "";
  }
}

function extractListingId(linkUrl, explicitListingId) {
  const explicit = normalizeToken(explicitListingId, 32);
  if (explicit) return explicit;

  try {
    const url = new URL(normalizeText(linkUrl), "https://seascape-vacations.com/");
    const match = url.pathname.match(/\/listings\/([^/?#]+)/);
    return match ? normalizeToken(match[1], 32) : "";
  } catch (_error) {
    return "";
  }
}

function buildFallbackHandoffId(payload, createdAt) {
  return crypto
    .createHash("sha1")
    .update([
      normalizeText(payload.sessionId || payload.session_id),
      normalizeText(payload.linkUrl || payload.link_url),
      normalizeText(payload.pagePath || payload.page_path),
      createdAt
    ].join("|"))
    .digest("hex")
    .slice(0, 24);
}

function buildBookingHandoffReceipt(rawPayload) {
  const payload = rawPayload && typeof rawPayload === "object" ? rawPayload : {};
  const createdAt = normalizeText(payload.createdAt || payload.created_at || new Date().toISOString());
  const linkUrl = normalizeBookingUrl(payload.linkUrl || payload.link_url);
  const handoffId =
    normalizeToken(payload.handoffId || payload.handoff_id || payload.booking_handoff_id) ||
    buildFallbackHandoffId(payload, createdAt);

  if (!handoffId || !linkUrl) return null;

  const pagePath = normalizePath(payload.pagePath || payload.page_path || "/");
  const pageSlug = normalizeToken(payload.pageSlug || payload.page_slug, 80) || slugFromPath(pagePath);

  return {
    handoffId,
    sessionId: normalizeToken(payload.sessionId || payload.session_id || payload.booking_session_id),
    guideDirectClickId: normalizeToken(payload.guideDirectClickId || payload.guide_direct_click_id, 96),
    createdAt,
    linkUrl,
    listingId: extractListingId(linkUrl, payload.listingId || payload.listing_id || payload.booking_listing_id),
    pagePath,
    pageSlug,
    guideSlug: normalizeToken(payload.guideSlug || payload.guide_slug, 80),
    sourcePageSlug: normalizeToken(payload.sourcePageSlug || payload.source_page_slug, 80) || pageSlug,
    placement: normalizeToken(payload.placement, 80),
    linkText: normalizeContextValue(payload.linkText || payload.link_text),
    sourceContext: normalizeToken(payload.sourceContext || payload.source_context, 80),
    aiPlatform: normalizeToken(payload.aiPlatform || payload.ai_platform, 80),
    referrerHost: normalizeContextValue(payload.referrerHost || payload.referrer_host, 120),
    utmSource: normalizeContextValue(payload.utmSource || payload.utm_source, 80),
    utmMedium: normalizeContextValue(payload.utmMedium || payload.utm_medium, 80),
    utmCampaign: normalizeContextValue(payload.utmCampaign || payload.utm_campaign, 120),
    utmContent: normalizeContextValue(payload.utmContent || payload.utm_content, 120),
    ref: normalizeContextValue(payload.ref, 120)
  };
}

function emptyMetrics() {
  return {
    totalHandoffs: 0,
    byPagePath: {},
    byListingId: {},
    byPlacement: {},
    receipts: [],
    updatedAt: null
  };
}

function mergeBookingHandoffMetrics(existingMetrics, receipt) {
  const base = {
    ...emptyMetrics(),
    ...(existingMetrics || {}),
    byPagePath: { ...((existingMetrics && existingMetrics.byPagePath) || {}) },
    byListingId: { ...((existingMetrics && existingMetrics.byListingId) || {}) },
    byPlacement: { ...((existingMetrics && existingMetrics.byPlacement) || {}) },
    receipts: Array.isArray(existingMetrics && existingMetrics.receipts)
      ? [...existingMetrics.receipts]
      : []
  };

  if (!receipt) return base;
  if (base.receipts.some((entry) => entry.handoffId === receipt.handoffId)) {
    return base;
  }

  base.receipts.push(receipt);
  base.receipts.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  if (base.receipts.length > MAX_RECEIPTS) {
    base.receipts = base.receipts.slice(-MAX_RECEIPTS);
  }

  base.totalHandoffs = base.receipts.length;
  base.byPagePath[receipt.pagePath] = (base.byPagePath[receipt.pagePath] || 0) + 1;
  if (receipt.listingId) {
    base.byListingId[receipt.listingId] = (base.byListingId[receipt.listingId] || 0) + 1;
  }
  if (receipt.placement) {
    base.byPlacement[receipt.placement] = (base.byPlacement[receipt.placement] || 0) + 1;
  }
  base.updatedAt = new Date().toISOString();

  return base;
}

function getBookingHandoffBlobsConfig() {
  const siteID = normalizeText(process.env.BOOKING_HANDOFF_BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID);
  const token = normalizeText(process.env.BOOKING_HANDOFF_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN);
  if (!siteID || !token) return null;

  return {
    name: BOOKING_HANDOFF_STORE_NAME,
    siteID,
    token
  };
}

function parseStoredMetrics(value) {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (_error) {
      return null;
    }
  }
  if (typeof value === "object") return value;
  return null;
}

async function readBookingHandoffMetrics(store) {
  try {
    return parseStoredMetrics(await store.get(BOOKING_HANDOFF_METRICS_KEY, { type: "json" }));
  } catch (_error) {
    if (!store || typeof store.get !== "function") return null;
  }

  try {
    return parseStoredMetrics(await store.get(BOOKING_HANDOFF_METRICS_KEY, { type: "text" }));
  } catch (_error) {
    return null;
  }
}

async function writeBookingHandoffMetrics(store, metrics) {
  await store.set(
    BOOKING_HANDOFF_METRICS_KEY,
    JSON.stringify(metrics),
    { contentType: "application/json; charset=utf-8" }
  );
}

module.exports = {
  BOOKING_HANDOFF_STORE_NAME,
  BOOKING_HANDOFF_METRICS_KEY,
  buildBookingHandoffReceipt,
  mergeBookingHandoffMetrics,
  getBookingHandoffBlobsConfig,
  parseStoredMetrics,
  readBookingHandoffMetrics,
  writeBookingHandoffMetrics
};
