const { connectLambda, getStore } = require("@netlify/blobs");
const {
  OWNER_LEAD_STORE_NAME,
  formatOwnerLeadSummary,
  getOwnerLeadBlobsConfig,
  readAuthToken,
  readOwnerLeadMetrics,
  relabelOwnerLeadReceipts,
  writeOwnerLeadMetrics
} = require("./_owner-lead-metrics");

function resolveWritableStore(event, candidateStore) {
  if (candidateStore && typeof candidateStore.get === "function" && typeof candidateStore.set === "function") {
    return candidateStore;
  }

  const explicitConfig = getOwnerLeadBlobsConfig();
  if (explicitConfig) {
    return getStore(explicitConfig);
  }

  connectLambda(event);
  return getStore(OWNER_LEAD_STORE_NAME);
}

function parseRequestBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_error) {
    return null;
  }
}

function countRequestedSubmissionIds(body) {
  return Array.isArray(body && body.submissionIds)
    ? body.submissionIds
      .map((value) => normalizeText(String(value || "")))
      .filter(Boolean)
      .length
    : 0;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function handleOwnerLeadProofLabelRequest(event, _context, injectedStore) {
  const store = resolveWritableStore(event, injectedStore);
  const ownerLeadMetricsToken = process.env.OWNER_LEAD_METRICS_TOKEN;
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!ownerLeadMetricsToken) {
    console.error("owner_lead_proof_label_token_missing");
    return { statusCode: 503, body: "Owner lead metrics token not configured" };
  }

  const authToken = readAuthToken(event);
  if (authToken !== ownerLeadMetricsToken) {
    console.warn("owner_lead_proof_label_unauthorized", {
      hasAuthToken: Boolean(authToken)
    });
    return { statusCode: 401, body: "Unauthorized" };
  }

  const body = parseRequestBody(event);
  if (!body || !Array.isArray(body.submissionIds) || typeof body.proofLabel !== "string") {
    console.warn("owner_lead_proof_label_invalid_payload", {
      requestedSubmissionIdsCount: countRequestedSubmissionIds(body),
      hasProofLabel: typeof (body && body.proofLabel) === "string"
    });
    return {
      statusCode: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ updated: false, reason: "invalid_payload" })
    };
  }

  try {
    const existingMetrics = await readOwnerLeadMetrics(store);
    const { metrics, updatedCount, updatedSubmissionIds } = relabelOwnerLeadReceipts(
      existingMetrics,
      body.submissionIds,
      body.proofLabel
    );

    await writeOwnerLeadMetrics(store, metrics);
    console.log("owner_lead_proof_label_updated", {
      requestedSubmissionIdsCount: countRequestedSubmissionIds(body),
      updatedCount
    });

    return {
      statusCode: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        updated: true,
        updatedCount,
        updatedSubmissionIds,
        proofLabel: body.proofLabel,
        summary: formatOwnerLeadSummary(metrics)
      })
    };
  } catch (error) {
    console.error("owner_lead_proof_label_update_failed", {
      requestedSubmissionIdsCount: countRequestedSubmissionIds(body),
      message: error && error.message ? error.message : String(error)
    });
    throw error;
  }
}

async function handler(event, context) {
  return handleOwnerLeadProofLabelRequest(event, context);
}

exports.handleOwnerLeadProofLabelRequest = handleOwnerLeadProofLabelRequest;
exports.handler = handler;
