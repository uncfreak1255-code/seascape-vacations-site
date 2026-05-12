const { getStore } = require("@netlify/blobs");
const {
  OWNER_LEAD_STORE_NAME,
  OWNER_LEAD_METRICS_KEY,
  formatOwnerLeadSummary,
  readAuthToken
} = require("./_owner-lead-metrics");

const OWNER_LEAD_METRICS_TOKEN = process.env.OWNER_LEAD_METRICS_TOKEN;

async function handleOwnerLeadMetricsRequest(event, store = getStore(OWNER_LEAD_STORE_NAME)) {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!OWNER_LEAD_METRICS_TOKEN) {
    return { statusCode: 503, body: "Owner lead metrics token not configured" };
  }

  if (readAuthToken(event) !== OWNER_LEAD_METRICS_TOKEN) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const metrics = (await store.get(OWNER_LEAD_METRICS_KEY, { type: "json" })) || null;
  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(formatOwnerLeadSummary(metrics))
  };
}

exports.handleOwnerLeadMetricsRequest = handleOwnerLeadMetricsRequest;
exports.handler = handleOwnerLeadMetricsRequest;
