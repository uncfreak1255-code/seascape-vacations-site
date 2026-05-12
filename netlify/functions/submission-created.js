const { getStore } = require("@netlify/blobs");
const {
  OWNER_LEAD_STORE_NAME,
  OWNER_LEAD_METRICS_KEY,
  buildOwnerLeadReceipt,
  mergeOwnerLeadMetrics
} = require("./_owner-lead-metrics");

async function handleSubmissionCreated(event, store = getStore(OWNER_LEAD_STORE_NAME)) {
  const payload = JSON.parse(event.body || "{}");
  const receipt = buildOwnerLeadReceipt(payload);

  if (!receipt) {
    return {
      statusCode: 200,
      body: JSON.stringify({ stored: false, reason: "ignored_form" })
    };
  }

  const existingMetrics = (await store.get(OWNER_LEAD_METRICS_KEY, { type: "json" })) || null;
  const nextMetrics = mergeOwnerLeadMetrics(existingMetrics, receipt);
  await store.set(OWNER_LEAD_METRICS_KEY, nextMetrics);

  return {
    statusCode: 200,
    body: JSON.stringify({
      stored: true,
      totalSubmissions: nextMetrics.totalSubmissions,
      sourcePageSlug: receipt.sourcePageSlug
    })
  };
}

exports.handleSubmissionCreated = handleSubmissionCreated;
exports.handler = handleSubmissionCreated;
