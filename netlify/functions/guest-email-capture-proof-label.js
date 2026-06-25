const { connectLambda, getStore } = require("@netlify/blobs");
const {
  GUEST_EMAIL_CAPTURE_STORE_NAME,
  formatGuestEmailCaptureSummary,
  getGuestEmailCaptureBlobsConfig,
  readAuthToken,
  readGuestEmailCaptureMetrics,
  relabelGuestEmailCaptureReceipts,
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
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .length
    : 0;
}

async function handleGuestEmailCaptureProofLabelRequest(event, _context, injectedStore) {
  const store = resolveWritableStore(event, injectedStore);
  const guestMetricsToken =
    process.env.GUEST_EMAIL_CAPTURE_METRICS_TOKEN ||
    process.env.OWNER_LEAD_METRICS_TOKEN;

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!guestMetricsToken) {
    console.error("guest_capture_proof_label_token_missing");
    return { statusCode: 503, body: "Guest email capture metrics token not configured" };
  }

  const authToken = readAuthToken(event);
  if (authToken !== guestMetricsToken) {
    console.warn("guest_capture_proof_label_unauthorized", {
      hasAuthToken: Boolean(authToken)
    });
    return { statusCode: 401, body: "Unauthorized" };
  }

  const body = parseRequestBody(event);
  if (!body || !Array.isArray(body.submissionIds) || typeof body.proofLabel !== "string") {
    console.warn("guest_capture_proof_label_invalid_payload", {
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
    const existingMetrics = await readGuestEmailCaptureMetrics(store);
    const { metrics, updatedCount, updatedSubmissionIds } = relabelGuestEmailCaptureReceipts(
      existingMetrics,
      body.submissionIds,
      body.proofLabel
    );

    await writeGuestEmailCaptureMetrics(store, metrics);
    console.log("guest_capture_proof_label_updated", {
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
        summary: formatGuestEmailCaptureSummary(metrics)
      })
    };
  } catch (error) {
    console.error("guest_capture_proof_label_update_failed", {
      requestedSubmissionIdsCount: countRequestedSubmissionIds(body),
      message: error && error.message ? error.message : String(error)
    });
    throw error;
  }
}

async function handler(event, context) {
  return handleGuestEmailCaptureProofLabelRequest(event, context);
}

exports.handleGuestEmailCaptureProofLabelRequest = handleGuestEmailCaptureProofLabelRequest;
exports.handler = handler;
