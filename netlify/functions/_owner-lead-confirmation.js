// One-shot owner-form confirmation + internal notify.
// Not a drip. Not sales outreach. Not guest Mailchimp.
// Only fires for owner-revenue-teardown submits that include a usable email.

const {
  DEFAULT_FROM,
  getMsGraphMailConfig,
  missingGraphConfigReason,
  sendMailViaGraph
} = require("./_owner-lead-mail");

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function isUsableOwnerEmail(email) {
  const value = normalizeText(email);
  if (!value || value.length > 254) return false;
  // Practical gate only: require local@domain.tld shape. Do not invent DNS checks.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function firstNameFromContact(contact) {
  const name = normalizeText(contact && contact.name);
  if (!name) return "";
  return name.split(/\s+/)[0];
}

function buildOwnerConfirmationEmail(contact, env = process.env) {
  const config = getMsGraphMailConfig(env);
  const from = (config && config.from) || DEFAULT_FROM;
  const email = normalizeText(contact && contact.email);
  const greetingName = firstNameFromContact(contact);
  const greeting = greetingName ? `Hi ${greetingName},` : "Hi,";

  const text = [
    greeting,
    "",
    "Thanks for sending your revenue review request. A real person at Seascape will follow up within 48 hours.",
    "",
    "If you still need to add a listing link or property address, or a sentence about what feels off, reply to this email.",
    "",
    "— Sawyer and the Seascape team",
    from,
    "(941) 704-8545"
  ].join("\n");

  return {
    kind: "owner_confirmation",
    from,
    to: email,
    replyTo: from,
    subject: "We got your Seascape revenue review request",
    contentType: "Text",
    text
  };
}

function buildInternalOwnerLeadNotifyEmail(contact, env = process.env) {
  const config = getMsGraphMailConfig(env);
  const from = (config && config.from) || DEFAULT_FROM;
  const internalTo = (config && config.internalTo) || from;
  const submissionId = normalizeText(contact && contact.submissionId) || "unknown";

  const lines = [
    "A new owner-revenue-teardown submission needs a human follow-up within 48 hours.",
    "",
    `Name: ${normalizeText(contact && contact.name) || "(none)"}`,
    `Email: ${normalizeText(contact && contact.email) || "(none)"}`,
    `Phone: ${normalizeText(contact && contact.phone) || "(none)"}`,
    `Property address: ${normalizeText(contact && contact.propertyAddress) || "(none)"}`,
    `Listing URL: ${normalizeText(contact && contact.listingUrl) || "(none)"}`,
    `Current manager: ${normalizeText(contact && contact.currentManager) || "(none)"}`,
    `What feels off: ${normalizeText(contact && contact.whatFeelsOff) || "(none)"}`,
    `Source page: ${normalizeText(contact && contact.sourcePageSlug) || "(none)"}`,
    `Market: ${normalizeText(contact && contact.market) || "(none)"}`,
    `Submission ID: ${submissionId}`,
    "",
    "The owner was sent a confirmation ack only. Sales next steps stay founder-gated."
  ];

  return {
    kind: "internal_notify",
    from,
    to: internalTo,
    replyTo: normalizeText(contact && contact.email) || from,
    subject: `New owner lead — revenue review request (${submissionId})`,
    contentType: "Text",
    text: lines.join("\n")
  };
}

async function sendOwnerLeadConfirmationEmails(
  contact,
  injectedFetch,
  env = process.env,
  deliveryState = {}
) {
  if (!contact || typeof contact !== "object") {
    return { sent: false, reason: "missing_contact" };
  }

  if (!isUsableOwnerEmail(contact.email)) {
    return { sent: false, reason: "missing_email" };
  }

  const ownerAlreadySent = deliveryState && deliveryState.ownerSent === true;
  const internalAlreadySent = deliveryState && deliveryState.internalSent === true;
  const config = getMsGraphMailConfig(env);
  if (!config) {
    const reason = missingGraphConfigReason(env);
    console.error("owner_lead_confirmation_not_sent", {
      reason,
      submissionId: normalizeText(contact.submissionId) || undefined,
      hasEmail: true
    });
    return {
      sent: false,
      ownerSent: ownerAlreadySent,
      internalSent: internalAlreadySent,
      reason
    };
  }

  const ownerMessage = buildOwnerConfirmationEmail(contact, env);
  const internalMessage = buildInternalOwnerLeadNotifyEmail(contact, env);

  const ownerResult = ownerAlreadySent
    ? { sent: true, reason: "already_sent" }
    : await sendMailViaGraph(ownerMessage, injectedFetch, env);

  if (!ownerResult.sent) {
    console.error("owner_lead_confirmation_not_sent", {
      reason: ownerResult.reason,
      submissionId: normalizeText(contact.submissionId) || undefined,
      hasEmail: true
    });
    return {
      sent: false,
      ownerSent: false,
      internalSent: internalAlreadySent,
      reason: ownerResult.reason,
      ambiguous: Boolean(ownerResult.ambiguous),
      owner: ownerResult,
      internal: { sent: false, reason: "skipped_after_owner_failure" }
    };
  }

  const internalResult = internalAlreadySent
    ? { sent: true, reason: "already_sent" }
    : await sendMailViaGraph(internalMessage, injectedFetch, env);
  const ownerSent = true;
  const internalSent = internalAlreadySent || internalResult.sent;
  const ambiguous = Boolean(ownerResult.ambiguous || internalResult.ambiguous);

  if (!internalResult.sent && !internalAlreadySent) {
    console.error("owner_lead_internal_notify_not_sent", {
      reason: internalResult.reason,
      submissionId: normalizeText(contact.submissionId) || undefined
    });
  }

  return {
    sent: ownerSent && internalSent,
    ownerSent,
    internalSent,
    ambiguous,
    deliveryStatus: ambiguous ? "unknown" : undefined,
    reason: internalSent ? "sent" : "owner_sent_internal_failed",
    owner: ownerResult,
    internal: internalResult
  };
}

module.exports = {
  isUsableOwnerEmail,
  buildOwnerConfirmationEmail,
  buildInternalOwnerLeadNotifyEmail,
  sendOwnerLeadConfirmationEmails
};
