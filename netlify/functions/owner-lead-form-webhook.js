const {
  handleSubmissionCreated,
  isPublicHttpInvocation,
  verifyAuthenticatedNetlifyFormDelivery
} = require("./submission-created");

/**
 * Public HTTP entrypoint for Netlify Forms → HTTP notification webhooks.
 *
 * Event-named `submission-created` returns 403 to external HTTP (including
 * spoofed x-netlify-event). Platform event-function JWS is not customer-
 * verifiable. This non-event function is the signed delivery path: configure
 * Forms notification HTTP POST here with JWS secret matching
 * OWNER_LEAD_FORM_WEBHOOK_SECRET.
 */
async function handler(event, context) {
  if (isPublicHttpInvocation(event)) {
    const auth = verifyAuthenticatedNetlifyFormDelivery(event);
    console.warn("owner_lead_form_webhook_rejected", {
      reason: auth.reason || "event_only"
    });
    return {
      statusCode: 404,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        stored: false,
        reason: "event_only",
        authReason: auth.reason || "event_only"
      })
    };
  }

  return handleSubmissionCreated(event, context);
}

exports.handler = handler;
