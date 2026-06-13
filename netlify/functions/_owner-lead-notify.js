// Channel-agnostic owner-lead notification. Posts to OWNER_LEAD_NOTIFY_WEBHOOK_URL
// if configured (a free Discord/Slack-style incoming webhook works as-is via the
// `content` field). When no webhook is configured it is a safe no-op: the durable
// contact store remains the zero-silent-drop guarantee, and Netlify's native form
// notification (parsed by ops owner-reachout-intake) stays on as the backstop.
function buildNotificationContent(message) {
  const contact = message && message.contact ? message.contact : {};
  const handle = contact.email || contact.phone || contact.name || contact.submissionId || "unknown";
  const where = contact.sourcePageSlug ? ` via ${contact.sourcePageSlug}` : "";
  if (message && message.stored === false) {
    return `⚠️ Owner lead capture FAILED to persist — follow up manually NOW: ${handle}${where}. Reason: ${message.error || "unknown"}.`;
  }
  return `🏠 New owner lead captured: ${handle}${where}.`;
}

async function notifyOwnerLead(message) {
  const url = (process.env.OWNER_LEAD_NOTIFY_WEBHOOK_URL || "").trim();
  if (!url) {
    return { notified: false, reason: "not_configured" };
  }

  const body = {
    content: buildNotificationContent(message),
    stored: message ? message.stored !== false : true,
    submissionId: message ? message.submissionId : undefined,
    contact: message ? message.contact : undefined,
    rawPayload: message ? message.rawPayload : undefined
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    return { notified: Boolean(response && response.ok), status: response ? response.status : undefined };
  } catch (error) {
    console.error("owner_lead_notify_request_failed", {
      message: error && error.message ? error.message : String(error)
    });
    return { notified: false, reason: "request_failed" };
  }
}

module.exports = {
  buildNotificationContent,
  notifyOwnerLead
};
