const crypto = require("crypto");

const GUEST_EMAIL_CAPTURE_FORM_NAME = "email_capture";
const GUEST_EMAIL_CAPTURE_STORE_NAME = "seascape-guest-email-captures";
const GUEST_EMAIL_CAPTURE_METRICS_KEY = "guest_email_capture_metrics_v1.json";
const MAILCHIMP_ENDPOINT = "https://seascape-vacations.us6.list-manage.com/subscribe/post";
const MAILCHIMP_QUERY = "u=48f234eebd9cb530fd2f217fe&id=95e5a594d1&f_id=008996e5f0";
const MAX_RECEIPTS = 500;
const MAX_PROOF_LABEL_LENGTH = 64;

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeEmail(value) {
  const email = normalizeText(value).toLowerCase();
  return email && email.includes("@") ? email : "";
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

function buildSubmissionId(email, createdAt, pagePath, placement) {
  return crypto
    .createHash("sha1")
    .update([email, createdAt, pagePath, placement].join("|"))
    .digest("hex")
    .slice(0, 24);
}

function buildGuestEmailCaptureReceipt(rawPayload) {
  const payload = readPayload(rawPayload);
  const name = normalizeText(payload.name);
  const email = normalizeEmail(payload.email);
  if (!name || !email) return null;

  const createdAt = normalizeText(payload.createdAt || payload.created_at || new Date().toISOString());
  const pagePath = normalizePath(payload.pagePath || payload.page_path || "/");
  const placement = normalizeText(payload.placement) || "inline";
  const pageSlug = normalizeText(payload.pageSlug || payload.page_slug) || slugFromPath(pagePath);
  const guideSlug = normalizeText(payload.guideSlug || payload.guide_slug) || "";
  const sourcePageSlug =
    normalizeText(payload.sourcePageSlug || payload.source_page_slug) ||
    pageSlug;
  const proofLabel = normalizeProofLabel(payload.proofLabel || payload.proof_label);

  const receipt = {
    submissionId:
      normalizeText(payload.submissionId || payload.submission_id || payload.id) ||
      buildSubmissionId(email, createdAt, pagePath, placement),
    createdAt,
    formName: GUEST_EMAIL_CAPTURE_FORM_NAME,
    pagePath,
    pageSlug,
    guideSlug,
    sourcePageSlug,
    market: normalizeText(payload.market) || "florida-gulf-coast",
    placement
  };

  if (proofLabel) {
    receipt.proofLabel = proofLabel;
  }

  return receipt;
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
        pagePath: receipt.pagePath,
        pageSlug: receipt.pageSlug,
        guideSlug: receipt.guideSlug,
        sourcePageSlug: receipt.sourcePageSlug,
        market: receipt.market,
        placement: receipt.placement
      };

      if (normalizeProofLabel(receipt.proofLabel)) {
        safeReceipt.proofLabel = normalizeProofLabel(receipt.proofLabel);
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
  MAILCHIMP_QUERY,
  buildGuestEmailCaptureReceipt,
  mergeGuestEmailCaptureMetrics,
  relabelGuestEmailCaptureReceipts,
  formatGuestEmailCaptureSummary,
  readAuthToken,
  getGuestEmailCaptureBlobsConfig,
  parseStoredMetrics,
  readGuestEmailCaptureMetrics,
  writeGuestEmailCaptureMetrics
};
