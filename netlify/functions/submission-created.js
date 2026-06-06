const { connectLambda, getStore } = require("@netlify/blobs");
const {
  OWNER_LEAD_STORE_NAME,
  buildOwnerLeadReceipt,
  getOwnerLeadBlobsConfig,
  mergeOwnerLeadMetrics,
  readOwnerLeadMetrics,
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

async function handleSubmissionCreated(event, _context, injectedStore) {
  const store = resolveWritableStore(event, injectedStore);
  const payload = JSON.parse(event.body || "{}");
  const receipt = buildOwnerLeadReceipt(payload);

  if (!receipt) {
    return {
      statusCode: 200,
      body: JSON.stringify({ stored: false, reason: "ignored_form" })
    };
  }

  const existingMetrics = await readOwnerLeadMetrics(store);
  const nextMetrics = mergeOwnerLeadMetrics(existingMetrics, receipt);
  try {
    await writeOwnerLeadMetrics(store, nextMetrics);
  } catch (error) {
    console.error("owner_lead_metrics_write_failed", {
      sourcePageSlug: receipt.sourcePageSlug,
      submissionId: receipt.submissionId,
      message: error && error.message ? error.message : String(error)
    });
    return {
      statusCode: 200,
      body: JSON.stringify({
        stored: false,
        reason: "metrics_write_failed",
        sourcePageSlug: receipt.sourcePageSlug
      })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      stored: true,
      totalSubmissions: nextMetrics.totalSubmissions,
      sourcePageSlug: receipt.sourcePageSlug
    })
  };
}

async function handler(event, context) {
  return handleSubmissionCreated(event, context);
}

exports.handleSubmissionCreated = handleSubmissionCreated;
exports.handler = handler;
