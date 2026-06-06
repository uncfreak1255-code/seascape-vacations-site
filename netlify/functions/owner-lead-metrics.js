const { connectLambda, getStore } = require("@netlify/blobs");
const {
  OWNER_LEAD_STORE_NAME,
  formatOwnerLeadSummary,
  getOwnerLeadBlobsConfig,
  readAuthToken,
  readOwnerLeadMetrics
} = require("./_owner-lead-metrics");

const OWNER_LEAD_METRICS_TOKEN = process.env.OWNER_LEAD_METRICS_TOKEN;

function resolveReadableStore(event, candidateStore) {
  if (candidateStore && typeof candidateStore.get === "function") {
    return candidateStore;
  }

  const explicitConfig = getOwnerLeadBlobsConfig();
  if (explicitConfig) {
    return getStore(explicitConfig);
  }

  connectLambda(event);
  return getStore(OWNER_LEAD_STORE_NAME);
}

async function handleOwnerLeadMetricsRequest(event, _context, injectedStore) {
  const store = resolveReadableStore(event, injectedStore);
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!OWNER_LEAD_METRICS_TOKEN) {
    return { statusCode: 503, body: "Owner lead metrics token not configured" };
  }

  if (readAuthToken(event) !== OWNER_LEAD_METRICS_TOKEN) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const metrics = await readOwnerLeadMetrics(store);
  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(formatOwnerLeadSummary(metrics))
  };
}

async function handler(event, context) {
  return handleOwnerLeadMetricsRequest(event, context);
}

exports.handleOwnerLeadMetricsRequest = handleOwnerLeadMetricsRequest;
exports.handler = handler;
