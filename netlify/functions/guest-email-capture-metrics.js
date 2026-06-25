const { connectLambda, getStore } = require("@netlify/blobs");
const {
  GUEST_EMAIL_CAPTURE_STORE_NAME,
  formatGuestEmailCaptureSummary,
  getGuestEmailCaptureBlobsConfig,
  readAuthToken,
  readGuestEmailCaptureMetrics
} = require("./_guest-email-capture-metrics");

const GUEST_EMAIL_CAPTURE_METRICS_TOKEN =
  process.env.GUEST_EMAIL_CAPTURE_METRICS_TOKEN ||
  process.env.OWNER_LEAD_METRICS_TOKEN;

function resolveReadableStore(event, candidateStore) {
  if (candidateStore && typeof candidateStore.get === "function") {
    return candidateStore;
  }

  const explicitConfig = getGuestEmailCaptureBlobsConfig();
  if (explicitConfig) {
    return getStore(explicitConfig);
  }

  connectLambda(event);
  return getStore(GUEST_EMAIL_CAPTURE_STORE_NAME);
}

async function handleGuestEmailCaptureMetricsRequest(event, _context, injectedStore) {
  const store = resolveReadableStore(event, injectedStore);
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!GUEST_EMAIL_CAPTURE_METRICS_TOKEN) {
    console.error("guest_capture_metrics_token_missing");
    return { statusCode: 503, body: "Guest email capture metrics token not configured" };
  }

  const authToken = readAuthToken(event);
  if (authToken !== GUEST_EMAIL_CAPTURE_METRICS_TOKEN) {
    console.warn("guest_capture_metrics_unauthorized", {
      hasAuthToken: Boolean(authToken)
    });
    return { statusCode: 401, body: "Unauthorized" };
  }

  const metrics = await readGuestEmailCaptureMetrics(store);
  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(formatGuestEmailCaptureSummary(metrics))
  };
}

async function handler(event, context) {
  return handleGuestEmailCaptureMetricsRequest(event, context);
}

exports.handleGuestEmailCaptureMetricsRequest = handleGuestEmailCaptureMetricsRequest;
exports.handler = handler;
