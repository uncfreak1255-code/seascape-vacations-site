const { connectLambda, getStore } = require("@netlify/blobs");
const {
  GUEST_EMAIL_CAPTURE_STORE_NAME,
  MAILCHIMP_ENDPOINT,
  MAILCHIMP_QUERY,
  buildGuestEmailCaptureReceipt,
  getGuestEmailCaptureBlobsConfig,
  mergeGuestEmailCaptureMetrics,
  readGuestEmailCaptureMetrics,
  writeGuestEmailCaptureMetrics
} = require("./_guest-email-capture-metrics");

function resolveWritableStore(event, candidateStore) {
  if (candidateStore && typeof candidateStore.get === "function" && typeof candidateStore.set === "function") {
    return candidateStore;
  }

  const explicitConfig = getGuestEmailCaptureBlobsConfig();
  if (explicitConfig) {
    return getStore(explicitConfig);
  }

  connectLambda(event);
  return getStore(GUEST_EMAIL_CAPTURE_STORE_NAME);
}

async function submitToMailchimp(payload, injectedFetch) {
  const transport = injectedFetch || fetch;
  const body = new URLSearchParams({
    EMAIL: payload.email,
    FNAME: payload.name
  });

  const response = await transport(`${MAILCHIMP_ENDPOINT}?${MAILCHIMP_QUERY}`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=utf-8"
    },
    body: body.toString(),
    redirect: "follow"
  });

  if (!response.ok) {
    throw new Error(`Mailchimp submission failed with status ${response.status}`);
  }
}

async function handleGuestEmailCapture(event, _context, injectedStore, injectedFetch) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const payload = JSON.parse(event.body || "{}");
  const receipt = buildGuestEmailCaptureReceipt(payload);
  if (!receipt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ stored: false, reason: "invalid_payload" })
    };
  }

  await submitToMailchimp(payload, injectedFetch);

  const store = resolveWritableStore(event, injectedStore);
  const existingMetrics = await readGuestEmailCaptureMetrics(store);
  const nextMetrics = mergeGuestEmailCaptureMetrics(existingMetrics, receipt);
  await writeGuestEmailCaptureMetrics(store, nextMetrics);

  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      stored: true,
      totalCaptures: nextMetrics.totalCaptures,
      pagePath: receipt.pagePath,
      placement: receipt.placement
    })
  };
}

exports.submitToMailchimp = submitToMailchimp;
exports.handleGuestEmailCapture = handleGuestEmailCapture;
exports.handler = handleGuestEmailCapture;
