const crypto = require("crypto");

const GUEST_EMAIL_CAPTURE_FORM_NAME = "email_capture";
const GUEST_EMAIL_CAPTURE_STORE_NAME = "seascape-guest-email-captures";
const GUEST_EMAIL_CAPTURE_METRICS_KEY = "guest_email_capture_metrics_v1.json";
const MAILCHIMP_ENDPOINT = "https://seascape-vacations.us6.list-manage.com/subscribe/post";
const MAILCHIMP_QUERY = "u=48f234eebd9cb530fd2f217fe&id=95e5a594d1&f_id=008996e5f0";
const MAILCHIMP_EVENT_NAME = "guest_email_capture";
const MAX_RECEIPTS = 500;
const MAX_PROOF_LABEL_LENGTH = 64;
const MAX_MAILCHIMP_TAG_LENGTH = 100;
const MAX_MAILCHIMP_WARNING_LENGTH = 64;

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function readPayloadValue(payload, keys) {
  if (!payload || typeof payload !== "object") return "";

  for (const key of keys) {
    if (!(key in payload)) continue;
    const value = payload[key];
    if (value === null || value === undefined) continue;
    const normalized = normalizeText(String(value));
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeEmail(value) {
  const email = normalizeText(value).toLowerCase();
  return email && email.includes("@") ? email : "";
}

function normalizeToken(value, maxLength = MAX_MAILCHIMP_TAG_LENGTH) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
}

function normalizeMailchimpEventName(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 40);
}

function normalizeProofLabel(value) {
  const normalized = normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");

  return normalized.slice(0, MAX_PROOF_LABEL_LENGTH);
}

function normalizePath(value) {
  const input = normalizeText(value);
  if (!input) return "/";

  try {
    const parsed = new URL(input);
    return normalizePath(parsed.pathname);
  } catch (_error) {
    // Fall through for relative paths.
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

  return normalizedPath
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .pop() || "home";
}

function readPayload(rawPayload) {
  if (!rawPayload || typeof rawPayload !== "object") return {};
  return rawPayload.payload && typeof rawPayload.payload === "object"
    ? rawPayload.payload
    : rawPayload;
}

function readNormalizedToken(payload, keys, maxLength = MAX_MAILCHIMP_TAG_LENGTH) {
  return normalizeToken(readPayloadValue(payload, keys), maxLength);
}

function buildSubmissionId(email, createdAt, pagePath, placement) {
  return crypto
    .createHash("sha1")
    .update([email, createdAt, pagePath, placement].join("|"))
    .digest("hex")
    .slice(0, 24);
}

function buildMailchimpSubscriberHash(email) {
  return crypto
    .createHash("md5")
    .update(normalizeEmail(email))
    .digest("hex");
}

function splitName(value) {
  const name = normalizeText(value);
  if (!name) {
    return {
      firstName: "",
      lastName: ""
    };
  }

  const [firstName, ...rest] = name.split(/\s+/);
  return {
    firstName,
    lastName: rest.join(" ")
  };
}

function deriveMailchimpServerPrefix(apiKey, explicitPrefix) {
  const normalizedPrefix = normalizeToken(explicitPrefix, 20);
  if (normalizedPrefix) {
    return normalizedPrefix;
  }

  const match = normalizeText(apiKey).match(/-([a-z0-9]+)$/i);
  return match ? normalizeToken(match[1], 20) : "";
}

function deriveMailchimpAudienceId(explicitAudienceId) {
  const audienceId = normalizeText(explicitAudienceId);
  if (audienceId) {
    return audienceId;
  }

  const params = new URLSearchParams(MAILCHIMP_QUERY);
  return normalizeText(params.get("id"));
}

function sanitizeMailchimpWarnings(warnings = []) {
  return [
    ...new Set(
      warnings
        .map((warning) => normalizeToken(warning, MAX_MAILCHIMP_WARNING_LENGTH))
        .filter(Boolean)
    )
  ];
}

function buildGuestMailchimpTags(receipt) {
  if (!receipt || typeof receipt !== "object") return [];

  const isPopupCapture =
    (receipt.formName || GUEST_EMAIL_CAPTURE_FORM_NAME) === GUEST_EMAIL_CAPTURE_FORM_NAME &&
    (receipt.placement || "inline") === "popup";

  const candidateTags = [
    isPopupCapture ? "guest-capture" : "guest-prospect",
    `guest-capture-form-${receipt.formName || GUEST_EMAIL_CAPTURE_FORM_NAME}`,
    "guest-capture-source-site",
    `guest-capture-placement-${receipt.placement || "inline"}`,
    `guest-capture-market-${receipt.market || "florida-gulf-coast"}`,
    `guest-capture-page-${receipt.pageSlug || slugFromPath(receipt.pagePath || "/")}`
  ];

  if (receipt.entryPoint) {
    candidateTags.push(`guest-capture-entry-${receipt.entryPoint}`);
  }

  if (receipt.sourcePage && receipt.sourcePage !== receipt.pageSlug) {
    candidateTags.push(`guest-capture-source-${receipt.sourcePage}`);
  }

  if (receipt.guideSlug) {
    candidateTags.push(`guest-capture-guide-${receipt.guideSlug}`);
    candidateTags.push("guide-optin");
  } else if (receipt.sourcePageSlug && receipt.sourcePageSlug !== receipt.pageSlug) {
    candidateTags.push(`guest-capture-source-page-${receipt.sourcePageSlug}`);
  }

  if (receipt.destinationInterest) {
    candidateTags.push(`guest-capture-destination-${receipt.destinationInterest}`);
  }

  if (receipt.tripIntent) {
    candidateTags.push(receipt.tripIntent);
    candidateTags.push(`guest-capture-intent-${receipt.tripIntent}`);
  }

  if (receipt.timingWindow) {
    candidateTags.push(`guest-capture-timing-${receipt.timingWindow}`);
  }

  if (receipt.propertyInterest) {
    candidateTags.push(`guest-capture-property-${receipt.propertyInterest}`);
  }

  if (receipt.bookingStage) {
    candidateTags.push(`guest-capture-stage-${receipt.bookingStage}`);
  }

  return [...new Set(candidateTags.map((tag) => normalizeToken(tag)).filter(Boolean))];
}

function buildGuestMailchimpEvent(receipt) {
  if (!receipt || typeof receipt !== "object") return null;

  return {
    name: MAILCHIMP_EVENT_NAME,
    properties: {
      submissionId: receipt.submissionId || "",
      formName: receipt.formName || GUEST_EMAIL_CAPTURE_FORM_NAME,
      pagePath: receipt.pagePath || "/",
      pageSlug: receipt.pageSlug || slugFromPath(receipt.pagePath || "/"),
      guideSlug: receipt.guideSlug || "",
      sourcePageSlug: receipt.sourcePageSlug || receipt.pageSlug || "",
      sourcePage: receipt.sourcePage || receipt.sourcePageSlug || receipt.pageSlug || "",
      entryPoint: receipt.entryPoint || "",
      destinationInterest: receipt.destinationInterest || "",
      tripIntent: receipt.tripIntent || "",
      partySizeBand: receipt.partySizeBand || "",
      timingWindow: receipt.timingWindow || "",
      propertyInterest: receipt.propertyInterest || "",
      bookingStage: receipt.bookingStage || "",
      lastStayProperty: receipt.lastStayProperty || "",
      lastCheckoutMonth: receipt.lastCheckoutMonth || "",
      repeatGuest: receipt.repeatGuest || "",
      lastBookingSource: receipt.lastBookingSource || "",
      market: receipt.market || "florida-gulf-coast",
      placement: receipt.placement || "inline",
      createdAt: receipt.createdAt || ""
    }
  };
}

function buildGuestEmailCaptureReceipt(rawPayload) {
  const payload = readPayload(rawPayload);
  const name = normalizeText(payload.name);
  const email = normalizeEmail(payload.email);
  if (!name || !email) return null;

  const createdAt = readPayloadValue(payload, ["createdAt", "created_at"]) || new Date().toISOString();
  const pagePath = normalizePath(readPayloadValue(payload, ["pagePath", "page_path"]) || "/");
  const placement = readNormalizedToken(payload, ["placement"], 40) || "inline";
  const pageSlug = readNormalizedToken(payload, ["pageSlug", "page_slug"], 80) || slugFromPath(pagePath);
  const guideSlug = readNormalizedToken(payload, ["guideSlug", "guide_slug"], 80) || "";
  const sourcePageSlug =
    readNormalizedToken(payload, ["sourcePageSlug", "source_page_slug"], 80) ||
    pageSlug;
  const formName =
    readNormalizedToken(payload, ["formName", "form_name"], 40) ||
    GUEST_EMAIL_CAPTURE_FORM_NAME;
  const entryPoint =
    readNormalizedToken(payload, ["entryPoint", "entry_point"], 40) ||
    (placement === "popup" ? "popup" : guideSlug ? "guide" : pageSlug === "properties" ? "properties" : "site");
  const proofLabel = normalizeProofLabel(payload.proofLabel || payload.proof_label);

  const receipt = {
    submissionId:
      readPayloadValue(payload, ["submissionId", "submission_id", "id"]) ||
      buildSubmissionId(email, createdAt, pagePath, placement),
    createdAt,
    formName,
    pagePath,
    pageSlug,
    guideSlug,
    sourcePageSlug,
    sourcePage:
      readNormalizedToken(payload, ["sourcePage", "source_page"], 80) ||
      sourcePageSlug,
    entryPoint,
    destinationInterest: readNormalizedToken(payload, ["destinationInterest", "destination_interest"], 80),
    tripIntent: readNormalizedToken(payload, ["tripIntent", "trip_intent"], 80),
    partySizeBand: readNormalizedToken(payload, ["partySizeBand", "party_size_band"], 40),
    timingWindow: readNormalizedToken(payload, ["timingWindow", "timing_window"], 40),
    propertyInterest: readNormalizedToken(payload, ["propertyInterest", "property_interest"], 80),
    market: readNormalizedToken(payload, ["market"], 80) || "florida-gulf-coast",
    bookingStage: readNormalizedToken(payload, ["bookingStage", "booking_stage"], 40),
    lastStayProperty: readNormalizedToken(payload, ["lastStayProperty", "last_stay_property"], 80),
    lastCheckoutMonth: readNormalizedToken(payload, ["lastCheckoutMonth", "last_checkout_month"], 20),
    repeatGuest: readNormalizedToken(payload, ["repeatGuest", "repeat_guest"], 20),
    lastBookingSource: readNormalizedToken(payload, ["lastBookingSource", "last_booking_source"], 40),
    placement
  };

  if (proofLabel) {
    receipt.proofLabel = proofLabel;
  }

  return receipt;
}

function withEmailDelivery(receipt, delivery = {}) {
  if (!receipt || typeof receipt !== "object") return receipt;

  const mode = normalizeToken(delivery.mode, 40);
  const tags = Array.isArray(delivery.tags)
    ? [...new Set(delivery.tags.map((tag) => normalizeToken(tag)).filter(Boolean))]
    : [];
  const warnings = sanitizeMailchimpWarnings(delivery.warnings);
  const eventName = normalizeMailchimpEventName(delivery.eventName);
  const listIds = Array.isArray(delivery.listIds)
    ? [...new Set(delivery.listIds.map((value) => normalizeText(String(value || ""))).filter(Boolean))]
    : [];
  const platform =
    normalizeToken(delivery.platform, 20) ||
    (mode === "listmonk-api" ? "listmonk" : "mailchimp");

  if (!mode && tags.length === 0 && warnings.length === 0 && !eventName && listIds.length === 0) {
    return receipt;
  }

  const deliveryMeta = {
    ...(mode ? { mode } : {}),
    ...(eventName ? { eventName } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    ...(warnings.length > 0 ? { warnings } : {}),
    ...(listIds.length > 0 ? { listIds } : {})
  };

  if (Object.keys(deliveryMeta).length === 0) {
    return receipt;
  }

  return {
    ...receipt,
    [platform]: deliveryMeta
  };
}

function withMailchimpDelivery(receipt, delivery = {}) {
  return withEmailDelivery(receipt, { ...delivery, platform: "mailchimp" });
}

function emptyMetrics() {
  return {
    totalCaptures: 0,
    byPagePath: {},
    byPlacement: {},
    receipts: [],
    updatedAt: null
  };
}

function mergeGuestEmailCaptureMetrics(existingMetrics, receipt) {
  const base = {
    ...emptyMetrics(),
    ...(existingMetrics || {}),
    byPagePath: { ...((existingMetrics && existingMetrics.byPagePath) || {}) },
    byPlacement: { ...((existingMetrics && existingMetrics.byPlacement) || {}) },
    receipts: Array.isArray(existingMetrics && existingMetrics.receipts)
      ? [...existingMetrics.receipts]
      : []
  };

  if (!receipt) return base;
  if (base.receipts.some((entry) => entry.submissionId === receipt.submissionId)) {
    return base;
  }

  base.receipts.push(receipt);
  base.receipts.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  if (base.receipts.length > MAX_RECEIPTS) {
    base.receipts = base.receipts.slice(-MAX_RECEIPTS);
  }

  base.totalCaptures = base.receipts.length;
  base.byPagePath[receipt.pagePath] = (base.byPagePath[receipt.pagePath] || 0) + 1;
  base.byPlacement[receipt.placement] = (base.byPlacement[receipt.placement] || 0) + 1;
  base.updatedAt = new Date().toISOString();

  return base;
}

function relabelGuestEmailCaptureReceipts(existingMetrics, submissionIds, proofLabel) {
  const base = {
    ...emptyMetrics(),
    ...(existingMetrics || {}),
    byPagePath: { ...((existingMetrics && existingMetrics.byPagePath) || {}) },
    byPlacement: { ...((existingMetrics && existingMetrics.byPlacement) || {}) },
    receipts: Array.isArray(existingMetrics && existingMetrics.receipts)
      ? [...existingMetrics.receipts]
      : []
  };

  const normalizedLabel = normalizeProofLabel(proofLabel);
  if (!normalizedLabel) {
    return { metrics: base, updatedCount: 0, updatedSubmissionIds: [] };
  }

  const wantedSubmissionIds = new Set(
    (Array.isArray(submissionIds) ? submissionIds : [])
      .map((value) => normalizeText(String(value || "")))
      .filter(Boolean)
  );

  if (wantedSubmissionIds.size === 0) {
    return { metrics: base, updatedCount: 0, updatedSubmissionIds: [] };
  }

  const updatedSubmissionIds = [];
  base.receipts = base.receipts.map((receipt) => {
    if (!wantedSubmissionIds.has(receipt.submissionId)) {
      return receipt;
    }

    if (normalizeProofLabel(receipt.proofLabel) === normalizedLabel) {
      updatedSubmissionIds.push(receipt.submissionId);
      return receipt;
    }

    updatedSubmissionIds.push(receipt.submissionId);
    return {
      ...receipt,
      proofLabel: normalizedLabel
    };
  });

  if (updatedSubmissionIds.length > 0) {
    base.updatedAt = new Date().toISOString();
  }

  return {
    metrics: base,
    updatedCount: updatedSubmissionIds.length,
    updatedSubmissionIds
  };
}

function formatGuestEmailCaptureSummary(metrics) {
  const safeMetrics = {
    ...emptyMetrics(),
    ...(metrics || {}),
    byPagePath: { ...((metrics && metrics.byPagePath) || {}) },
    byPlacement: { ...((metrics && metrics.byPlacement) || {}) },
    receipts: Array.isArray(metrics && metrics.receipts) ? metrics.receipts : []
  };

  return {
    totalCaptures: safeMetrics.totalCaptures,
    byPagePath: safeMetrics.byPagePath,
    byPlacement: safeMetrics.byPlacement,
    receipts: safeMetrics.receipts.map((receipt) => {
      const safeReceipt = {
        submissionId: receipt.submissionId,
        createdAt: receipt.createdAt,
        formName: receipt.formName,
        pagePath: receipt.pagePath,
        pageSlug: receipt.pageSlug,
        guideSlug: receipt.guideSlug,
        sourcePageSlug: receipt.sourcePageSlug,
        sourcePage: receipt.sourcePage,
        entryPoint: receipt.entryPoint,
        destinationInterest: receipt.destinationInterest,
        tripIntent: receipt.tripIntent,
        partySizeBand: receipt.partySizeBand,
        timingWindow: receipt.timingWindow,
        propertyInterest: receipt.propertyInterest,
        market: receipt.market,
        bookingStage: receipt.bookingStage,
        lastStayProperty: receipt.lastStayProperty,
        lastCheckoutMonth: receipt.lastCheckoutMonth,
        repeatGuest: receipt.repeatGuest,
        lastBookingSource: receipt.lastBookingSource,
        placement: receipt.placement
      };
      for (const key of Object.keys(safeReceipt)) {
        if (safeReceipt[key] === undefined || safeReceipt[key] === null || safeReceipt[key] === "") {
          delete safeReceipt[key];
        }
      }

      if (normalizeProofLabel(receipt.proofLabel)) {
        safeReceipt.proofLabel = normalizeProofLabel(receipt.proofLabel);
      }

      for (const platform of ["mailchimp", "listmonk"]) {
        if (!receipt[platform] || typeof receipt[platform] !== "object") {
          continue;
        }

        const delivery = {};
        const mode = normalizeToken(receipt[platform].mode, 40);
        const eventName = normalizeMailchimpEventName(receipt[platform].eventName);
        const tags = Array.isArray(receipt[platform].tags)
          ? [...new Set(receipt[platform].tags.map((tag) => normalizeToken(tag)).filter(Boolean))]
          : [];
        const warnings = sanitizeMailchimpWarnings(receipt[platform].warnings);
        const listIds = Array.isArray(receipt[platform].listIds)
          ? [...new Set(receipt[platform].listIds.map((value) => normalizeText(String(value || ""))).filter(Boolean))]
          : [];

        if (mode) {
          delivery.mode = mode;
        }
        if (eventName) {
          delivery.eventName = eventName;
        }
        if (tags.length > 0) {
          delivery.tags = tags;
        }
        if (warnings.length > 0) {
          delivery.warnings = warnings;
        }
        if (listIds.length > 0) {
          delivery.listIds = listIds;
        }

        if (Object.keys(delivery).length > 0) {
          safeReceipt[platform] = delivery;
        }
      }

      return safeReceipt;
    })
  };
}

function readAuthToken(event) {
  const authorization = normalizeText(event?.headers?.authorization || event?.headers?.Authorization);
  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  return normalizeText(event?.queryStringParameters?.token);
}

function getGuestEmailCaptureBlobsConfig() {
  const siteID = normalizeText(
    process.env.GUEST_EMAIL_CAPTURE_BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID
  );
  const token = normalizeText(
    process.env.GUEST_EMAIL_CAPTURE_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN
  );
  if (!siteID || !token) return null;

  return {
    name: GUEST_EMAIL_CAPTURE_STORE_NAME,
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

  if (typeof value === "object") {
    return value;
  }

  return null;
}

async function readGuestEmailCaptureMetrics(store) {
  try {
    return parseStoredMetrics(
      await store.get(GUEST_EMAIL_CAPTURE_METRICS_KEY, { type: "json" })
    );
  } catch (_error) {
    if (!store || typeof store.get !== "function") return null;
  }

  try {
    return parseStoredMetrics(
      await store.get(GUEST_EMAIL_CAPTURE_METRICS_KEY, { type: "text" })
    );
  } catch (_error) {
    return null;
  }
}

async function writeGuestEmailCaptureMetrics(store, metrics) {
  await store.set(
    GUEST_EMAIL_CAPTURE_METRICS_KEY,
    JSON.stringify(metrics),
    { contentType: "application/json; charset=utf-8" }
  );
}

module.exports = {
  GUEST_EMAIL_CAPTURE_FORM_NAME,
  GUEST_EMAIL_CAPTURE_STORE_NAME,
  GUEST_EMAIL_CAPTURE_METRICS_KEY,
  MAILCHIMP_ENDPOINT,
  MAILCHIMP_EVENT_NAME,
  MAILCHIMP_QUERY,
  buildGuestEmailCaptureReceipt,
  buildGuestMailchimpEvent,
  buildGuestMailchimpTags,
  buildMailchimpSubscriberHash,
  deriveMailchimpAudienceId,
  deriveMailchimpServerPrefix,
  mergeGuestEmailCaptureMetrics,
  sanitizeMailchimpWarnings,
  splitName,
  withEmailDelivery,
  withMailchimpDelivery,
  relabelGuestEmailCaptureReceipts,
  formatGuestEmailCaptureSummary,
  readAuthToken,
  getGuestEmailCaptureBlobsConfig,
  parseStoredMetrics,
  readGuestEmailCaptureMetrics,
  writeGuestEmailCaptureMetrics
};
