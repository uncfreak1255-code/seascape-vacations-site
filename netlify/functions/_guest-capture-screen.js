const { assessGuestCaptureBotSignals } = require("./_guest-capture-bot-guard");
const { recordGuestCaptureRejection } = require("./_guest-capture-rejection-metrics");
const { checkEmailDomain } = require("./_guest-capture-domain-check");

// Screens a parsed capture before any store or Mailchimp work. Returns the
// 422 response for a rejected submission, or null when it may proceed.
async function screenGuestCapture({ event, payload, receipt, injectedStore, resolveWritableStore, logContext, rejectedState }) {
  const botScreen = assessGuestCaptureBotSignals({ payload, headers: event && event.headers });
  const reasons = [...botScreen.reasons];
  if (!botScreen.rejected) {
    // A domain DNS says cannot take mail would bounce and be cleaned in
    // Mailchimp; refuse it here. Unknown DNS outcomes let the signup through.
    const domainCheck = await checkEmailDomain(payload.email);
    if (!domainCheck.deliverable) reasons.push("undeliverable_domain");
  }
  if (!reasons.length) return null;

  console.warn("guest_capture_rejected", {
    submissionId: receipt.submissionId,
    reasons,
    ...logContext
  });
  // The reply never names the rule, so a bot cannot probe the screen; the
  // count of which rule fired is kept privately for the metrics endpoint.
  try {
    await recordGuestCaptureRejection(resolveWritableStore(event, injectedStore), {
      reasons,
      placement: receipt.placement
    });
  } catch (error) {
    console.error("guest_capture_rejection_metrics_write_failed", {
      submissionId: receipt.submissionId,
      message: error && error.message ? error.message : String(error)
    });
  }
  return {
    statusCode: 422,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      stored: false,
      tagged: false,
      captureState: rejectedState,
      reason: "rejected"
    })
  };
}

module.exports = { screenGuestCapture };
