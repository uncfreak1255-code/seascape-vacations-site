// Channel-agnostic owner-lead notification. Posts to OWNER_LEAD_NOTIFY_WEBHOOK_URL
// if configured (a free Discord/Slack-style incoming webhook works as-is via the
// `content` field). When no webhook is configured it is a safe no-op: the durable
// contact store remains the zero-silent-drop guarantee, and Netlify's native form
// notification (parsed by ops owner-reachout-intake) stays on as the backstop.
function buildNotificationContent(message) {
  const submissionId = (message && message.submissionId) || "unknown";

  if (message && message.stored === false) {
    const contact = message.contact || {};
    const handle = contact.email || contact.phone || contact.name || submissionId;
    return `⚠️ Owner lead capture FAILED to persist — follow up MANUALLY now: ${handle} (submission ${submissionId}). Reason: ${message.error || "unknown"}.`;
  }

  // Success: keep PII out of the external channel — the durable contact store
  // holds the detail. The chat message is just a "go look" ping.
  return `🏠 New owner lead captured (submission ${submissionId}). Open the owner-leads store to follow up.`;
}

async function notifyOwnerLead(message) {
  const url = (process.env.OWNER_LEAD_NOTIFY_WEBHOOK_URL || "").trim();
  if (!url) {
    return { notified: false, reason: "not_configured" };
  }

  const stored = message ? message.stored !== false : true;
  const body = {
    content: buildNotificationContent(message),
    submissionId: message ? message.submissionId : undefined,
    stored
  };
  // Only attach the raw lead when persistence FAILED — the store has no copy then,
  // so the notification is the lead's only carrier. On success the store holds the
  // PII and we keep it out of the external channel.
  if (!stored) {
    body.contact = message ? message.contact : undefined;
    body.rawPayload = message ? message.rawPayload : undefined;
  }

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
