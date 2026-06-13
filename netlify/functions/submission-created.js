const { connectLambda, getStore } = require("@netlify/blobs");
const {
  OWNER_LEAD_STORE_NAME,
  buildOwnerLeadReceipt,
  getOwnerLeadBlobsConfig,
  mergeOwnerLeadMetrics,
  readOwnerLeadMetrics,
  writeOwnerLeadMetrics
} = require("./_owner-lead-metrics");
const {
  buildOwnerLeadContact,
  mergeOwnerLeadContacts,
  readOwnerLeadContacts,
  writeOwnerLeadContacts,
  resolveContactStore
} = require("./_owner-lead-contacts");
const { notifyOwnerLead } = require("./_owner-lead-notify");

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

async function safeNotify(notify, message) {
  try {
    await notify(message);
  } catch (error) {
    console.error("owner_lead_notify_threw", {
      message: error && error.message ? error.message : String(error)
    });
  }
}

// Durable full-contact capture for a real owner submission, kept entirely
// separate from the PII-free attribution metrics blob. The lead must never be
// silently dropped: if persistence fails, push the raw lead to a human via notify.
async function captureOwnerLeadContact(event, payload, injectedContactStore, notify) {
  const contact = buildOwnerLeadContact(payload);
  if (!contact) return;

  try {
    const contactStore = resolveContactStore(event, injectedContactStore);
    const existingContacts = await readOwnerLeadContacts(contactStore);
    await writeOwnerLeadContacts(contactStore, mergeOwnerLeadContacts(existingContacts, contact));
    await safeNotify(notify, {
      type: "owner_lead_captured",
      stored: true,
      submissionId: contact.submissionId,
      contact
    });
  } catch (error) {
    console.error("owner_lead_contact_capture_failed", {
      submissionId: contact.submissionId,
      message: error && error.message ? error.message : String(error)
    });
    await safeNotify(notify, {
      type: "owner_lead_capture_failed",
      stored: false,
      submissionId: contact.submissionId,
      contact,
      rawPayload: payload,
      error: error && error.message ? error.message : String(error)
    });
  }
}

async function handleSubmissionCreated(event, _context, injectedStore, injectedContactStore = null, injectedNotify = null) {
  const store = resolveWritableStore(event, injectedStore);
  const payload = JSON.parse(event.body || "{}");
  const receipt = buildOwnerLeadReceipt(payload);

  if (!receipt) {
    return {
      statusCode: 200,
      body: JSON.stringify({ stored: false, reason: "ignored_form" })
    };
  }

  // Capture the durable contact + notify a human FIRST, so the lead survives
  // even if the (independent) attribution metrics write below fails.
  const notify = injectedNotify || notifyOwnerLead;
  await captureOwnerLeadContact(event, payload, injectedContactStore, notify);

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
