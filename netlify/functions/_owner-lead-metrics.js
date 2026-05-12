const OWNER_LEAD_FORM_NAME = "owner-revenue-teardown";
const OWNER_LEAD_STORE_NAME = "seascape-owner-leads";
const OWNER_LEAD_METRICS_KEY = "owner_lead_metrics_v1.json";
const MAX_RECEIPTS = 200;
const MAX_PROOF_LABEL_LENGTH = 64;

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeProofLabel(value) {
  const normalized = normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");

  return normalized.slice(0, MAX_PROOF_LABEL_LENGTH);
}

function readSubmissionPayload(rawPayload) {
  if (!rawPayload || typeof rawPayload !== "object") return {};
  return rawPayload.payload && typeof rawPayload.payload === "object"
    ? rawPayload.payload
    : rawPayload;
}

function getFormName(payload) {
  return normalizeText(
    payload.form_name ||
      payload.formName ||
      payload.form?.name ||
      payload.name
  );
}

function getSubmissionId(payload) {
  const candidate =
    payload.id ||
    payload.submission_id ||
    payload.number ||
    payload.created_at;
  return normalizeText(String(candidate || ""));
}

function getCreatedAt(payload) {
  return normalizeText(payload.created_at || payload.createdAt || new Date().toISOString());
}

function buildOwnerLeadReceipt(rawPayload) {
  const payload = readSubmissionPayload(rawPayload);
  if (getFormName(payload) !== OWNER_LEAD_FORM_NAME) return null;

  const data = payload.data && typeof payload.data === "object" ? payload.data : {};
  const submissionId = getSubmissionId(payload);
  if (!submissionId) return null;

  const proofLabel = normalizeProofLabel(data.proof_label || data.proofLabel);
  const receipt = {
    submissionId,
    createdAt: getCreatedAt(payload),
    formName: OWNER_LEAD_FORM_NAME,
    pageSlug: normalizeText(data.page_slug) || "property-management",
    sourcePageSlug:
      normalizeText(data.source_page_slug) ||
      normalizeText(data.page_slug) ||
      "property-management",
    market: normalizeText(data.market) || "florida-gulf-coast",
    leadType: normalizeText(data.lead_type) || OWNER_LEAD_FORM_NAME
  };

  if (proofLabel) {
    receipt.proofLabel = proofLabel;
  }

  return receipt;
}

function emptyMetrics() {
  return {
    totalSubmissions: 0,
    bySourcePageSlug: {},
    receipts: [],
    updatedAt: null
  };
}

function mergeOwnerLeadMetrics(existingMetrics, receipt) {
  const base = {
    ...emptyMetrics(),
    ...(existingMetrics || {}),
    bySourcePageSlug: { ...((existingMetrics && existingMetrics.bySourcePageSlug) || {}) },
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

  base.totalSubmissions = base.receipts.length;
  base.bySourcePageSlug[receipt.sourcePageSlug] =
    (base.bySourcePageSlug[receipt.sourcePageSlug] || 0) + 1;
  base.updatedAt = new Date().toISOString();

  return base;
}

function relabelOwnerLeadReceipts(existingMetrics, submissionIds, proofLabel) {
  const base = {
    ...emptyMetrics(),
    ...(existingMetrics || {}),
    bySourcePageSlug: { ...((existingMetrics && existingMetrics.bySourcePageSlug) || {}) },
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

function formatOwnerLeadSummary(metrics) {
  const safeMetrics = {
    ...emptyMetrics(),
    ...(metrics || {}),
    bySourcePageSlug: { ...((metrics && metrics.bySourcePageSlug) || {}) },
    receipts: Array.isArray(metrics && metrics.receipts) ? metrics.receipts : []
  };

  return {
    totalSubmissions: safeMetrics.totalSubmissions,
    bySourcePageSlug: safeMetrics.bySourcePageSlug,
    receipts: safeMetrics.receipts.map((receipt) => {
      const safeReceipt = {
        submissionId: receipt.submissionId,
        createdAt: receipt.createdAt,
        pageSlug: receipt.pageSlug,
        sourcePageSlug: receipt.sourcePageSlug,
        market: receipt.market,
        leadType: receipt.leadType
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

function getOwnerLeadBlobsConfig() {
  const siteID = normalizeText(process.env.OWNER_LEAD_BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID);
  const token = normalizeText(process.env.OWNER_LEAD_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN);
  if (!siteID || !token) return null;

  return {
    name: OWNER_LEAD_STORE_NAME,
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

async function readOwnerLeadMetrics(store) {
  try {
    return parseStoredMetrics(await store.get(OWNER_LEAD_METRICS_KEY, { type: "json" }));
  } catch (_error) {
    if (!store || typeof store.get !== "function") return null;
  }

  try {
    return parseStoredMetrics(await store.get(OWNER_LEAD_METRICS_KEY, { type: "text" }));
  } catch (_error) {
    return null;
  }
}

async function writeOwnerLeadMetrics(store, metrics) {
  await store.set(
    OWNER_LEAD_METRICS_KEY,
    JSON.stringify(metrics),
    { contentType: "application/json; charset=utf-8" }
  );
}

module.exports = {
  OWNER_LEAD_FORM_NAME,
  OWNER_LEAD_STORE_NAME,
  OWNER_LEAD_METRICS_KEY,
  buildOwnerLeadReceipt,
  mergeOwnerLeadMetrics,
  relabelOwnerLeadReceipts,
  formatOwnerLeadSummary,
  readAuthToken,
  getOwnerLeadBlobsConfig,
  parseStoredMetrics,
  readOwnerLeadMetrics,
  writeOwnerLeadMetrics
};
