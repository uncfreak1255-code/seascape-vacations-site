const { connectLambda, getStore } = require("@netlify/blobs");
const {
  BOOKING_HANDOFF_STORE_NAME,
  buildBookingHandoffReceipt,
  getBookingHandoffBlobsConfig,
  mergeBookingHandoffMetrics,
  readBookingHandoffMetrics,
  writeBookingHandoffMetrics
} = require("./_booking-handoff-metrics");

function resolveWritableStore(event, candidateStore) {
  if (candidateStore && typeof candidateStore.get === "function" && typeof candidateStore.set === "function") {
    return candidateStore;
  }

  const explicitConfig = getBookingHandoffBlobsConfig();
  if (explicitConfig) {
    return getStore(explicitConfig);
  }

  connectLambda(event);
  return getStore(BOOKING_HANDOFF_STORE_NAME);
}

function parseRequestBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_error) {
    return null;
  }
}

function buildHandoffLogContext(payload) {
  return {
    hasHandoffId: Boolean(payload && (payload.handoffId || payload.handoff_id || payload.booking_handoff_id)),
    hasLinkUrl: Boolean(payload && (payload.linkUrl || payload.link_url)),
    hasPagePath: Boolean(payload && (payload.pagePath || payload.page_path)),
    hasPlacement: Boolean(payload && payload.placement)
  };
}

async function handleBookingHandoff(event, _context, injectedStore) {
  if (event.httpMethod !== "POST") {
    console.warn("booking_handoff_method_not_allowed", {
      httpMethod: event && event.httpMethod ? event.httpMethod : "unknown"
    });
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const payload = parseRequestBody(event);
  if (!payload) {
    console.warn("booking_handoff_invalid_json", {
      bodyLength: typeof event.body === "string" ? event.body.length : 0
    });
    return {
      statusCode: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ stored: false, reason: "invalid_json" })
    };
  }

  const receipt = buildBookingHandoffReceipt(payload);
  if (!receipt) {
    console.warn("booking_handoff_invalid_payload", buildHandoffLogContext(payload));
    return {
      statusCode: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ stored: false, reason: "invalid_payload" })
    };
  }

  try {
    const store = resolveWritableStore(event, injectedStore);
    const existingMetrics = await readBookingHandoffMetrics(store);
    const nextMetrics = mergeBookingHandoffMetrics(existingMetrics, receipt);
    await writeBookingHandoffMetrics(store, nextMetrics);
    return {
      statusCode: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        stored: true,
        totalHandoffs: nextMetrics.totalHandoffs,
        handoffId: receipt.handoffId,
        pagePath: receipt.pagePath,
        listingId: receipt.listingId
      })
    };
  } catch (error) {
    console.error("booking_handoff_metrics_write_failed", {
      handoffId: receipt.handoffId,
      message: error && error.message ? error.message : String(error)
    });
    return {
      statusCode: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        stored: false,
        handoffId: receipt.handoffId,
        pagePath: receipt.pagePath,
        listingId: receipt.listingId
      })
    };
  }
}

async function handler(event, context) {
  return handleBookingHandoff(event, context);
}

exports.handleBookingHandoff = handleBookingHandoff;
exports.handler = handler;
