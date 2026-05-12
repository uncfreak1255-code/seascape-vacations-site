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

async function handleOwnerLeadProofLabelRequest(event, _context, injectedStore) {
  const store = resolveWritableStore(event, injectedStore);
  const ownerLeadMetricsToken = process.env.OWNER_LEAD_METRICS_TOKEN;
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!ownerLeadMetricsToken) {
    return { statusCode: 503, body: "Owner lead metrics token not configured" };
  }

  if (readAuthToken(event) !== ownerLeadMetricsToken) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const body = parseRequestBody(event);
  if (!body || !Array.isArray(body.submissionIds) || typeof body.proofLabel !== "string") {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ updated: false, reason: "invalid_payload" })
    };
  }

  const existingMetrics = await readOwnerLeadMetrics(store);
  const { metrics, updatedCount, updatedSubmissionIds } = relabelOwnerLeadReceipts(
    existingMetrics,
    body.submissionIds,
    body.proofLabel
  );

  await writeOwnerLeadMetrics(store, metrics);

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
}

exports.handleOwnerLeadProofLabelRequest = handleOwnerLeadProofLabelRequest;
exports.handler = handleOwnerLeadProofLabelRequest;
