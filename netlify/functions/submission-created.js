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
  getOwnerLeadConfirmationDelivery,
  mergeOwnerLeadContacts,
  readOwnerLeadContacts,
  updateOwnerLeadConfirmationDelivery,
  writeOwnerLeadContacts,
  resolveContactStore
} = require("./_owner-lead-contacts");
const { notifyOwnerLead } = require("./_owner-lead-notify");
const {
  isUsableOwnerEmail,
  sendOwnerLeadConfirmationEmails
} = require("./_owner-lead-confirmation");

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

function parseRequestBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (error) {
    console.error("owner_lead_invalid_json", {
      bodyLength: typeof event.body === "string" ? event.body.length : 0,
      message: error && error.message ? error.message : String(error)
    });
    return null;
  }
}

function readSubmissionPayload(rawPayload) {
  if (!rawPayload || typeof rawPayload !== "object") return {};
  return rawPayload.payload && typeof rawPayload.payload === "object"
    ? rawPayload.payload
    : rawPayload;
}

function getPayloadFormName(rawPayload) {
  const payload = readSubmissionPayload(rawPayload);
  return String(
    payload.form_name ||
      payload.formName ||
      (payload.form && payload.form.name) ||
      payload.name ||
      ""
  ).trim();
}

function getPayloadSubmissionId(rawPayload) {
  const payload = readSubmissionPayload(rawPayload);
  return String(payload.id || payload.submission_id || payload.number || payload.created_at || "").trim();
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

async function safeConfirm(sendConfirmation, contact, delivery) {
  try {
    return await sendConfirmation(contact, delivery);
  } catch (error) {
    console.error("owner_lead_confirmation_threw", {
      submissionId: contact && contact.submissionId ? contact.submissionId : undefined,
      message: error && error.message ? error.message : String(error)
    });
    return { sent: false, reason: "confirmation_threw" };
  }
}

// Durable full-contact capture for a real owner submission, kept entirely
// separate from the PII-free attribution metrics blob. The lead must never be
// silently dropped: if persistence fails, push the raw lead to a human via notify.
async function captureOwnerLeadContact(event, payload, injectedContactStore, notify) {
  const contact = buildOwnerLeadContact(payload);
  if (!contact) {
    return { contact: null, alreadyStored: false, captureFailed: false };
  }

  try {
    const contactStore = resolveContactStore(event, injectedContactStore);
    const existingContacts = await readOwnerLeadContacts(contactStore);
    const existingContact =
      existingContacts &&
      Array.isArray(existingContacts.contacts)
        ? existingContacts.contacts.find((entry) => entry.submissionId === contact.submissionId)
        : null;
    const alreadyStored = Boolean(existingContact);
    const delivery = getOwnerLeadConfirmationDelivery(existingContact);
    await writeOwnerLeadContacts(contactStore, mergeOwnerLeadContacts(existingContacts, contact));
    // Idempotent: Netlify form webhooks are at-least-once, so a re-delivered
    // submission must not re-alert a human.
    if (!alreadyStored) {
      await safeNotify(notify, {
        type: "owner_lead_captured",
        stored: true,
        submissionId: contact.submissionId,
        contact
      });
    }
    return { contact, alreadyStored, delivery, captureFailed: false };
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
    return { contact, alreadyStored: false, captureFailed: true };
  }
}

async function persistOwnerLeadConfirmationDelivery(event, contact, result, injectedContactStore) {
  if (!contact || !result || (!result.ownerSent && !result.internalSent)) {
    return;
  }

  try {
    const contactStore = resolveContactStore(event, injectedContactStore);
    const existingContacts = await readOwnerLeadContacts(contactStore);
    const nextContacts = updateOwnerLeadConfirmationDelivery(
      existingContacts,
      contact.submissionId,
      result
    );
    await writeOwnerLeadContacts(contactStore, nextContacts);
  } catch (error) {
    console.error("owner_lead_confirmation_state_write_failed", {
      submissionId: contact.submissionId,
      message: error && error.message ? error.message : String(error)
    });
  }
}

function isPublicHttpInvocation(event) {
  return Boolean(
    event &&
    (
      typeof event.httpMethod === "string" ||
      (event.requestContext && event.requestContext.http && typeof event.requestContext.http.method === "string")
    )
  );
}

async function handleSubmissionCreated(
  event,
  _context,
  injectedStore,
  injectedContactStore = null,
  injectedNotify = null,
  injectedSendConfirmation = null
) {
  const payload = parseRequestBody(event);
  if (!payload) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ stored: false, reason: "invalid_json" })
    };
  }

  const receipt = buildOwnerLeadReceipt(payload);

  if (!receipt) {
    console.warn("owner_lead_payload_ignored", {
      formName: getPayloadFormName(payload) || "unknown",
      hasSubmissionId: Boolean(getPayloadSubmissionId(payload))
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ stored: false, reason: "ignored_form" })
    };
  }

  // Lead-safety FIRST: durable contact capture + human notify run before any
  // throw-prone metrics-store resolution, so a Blobs/connect failure on the
  // attribution path can never silently drop the lead.
  const notify = injectedNotify || notifyOwnerLead;
  const sendConfirmation = injectedSendConfirmation || (
    (contact, delivery) => sendOwnerLeadConfirmationEmails(contact, undefined, process.env, delivery)
  );
  const capture = await captureOwnerLeadContact(event, payload, injectedContactStore, notify);

  // One confirmation ack + internal info@ notify for usable-email submits only.
  // Skip redeliveries so the owner is not emailed twice. Skip phone/name-only
  // captures that have no address to deliver to.
  if (
    capture.contact &&
    isUsableOwnerEmail(capture.contact.email) &&
    (!capture.delivery.ownerSent || !capture.delivery.internalSent)
  ) {
    const confirmationResult = await safeConfirm(sendConfirmation, capture.contact, capture.delivery);
    await persistOwnerLeadConfirmationDelivery(
      event,
      capture.contact,
      confirmationResult,
      injectedContactStore
    );
  }

  // Attribution metrics are best-effort and fully independent of the lead record.
  // Resolve + read + write are guarded together so any failure degrades to a
  // metrics_write_failed response instead of throwing past the contact capture.
  try {
    const store = resolveWritableStore(event, injectedStore);
    const existingMetrics = await readOwnerLeadMetrics(store);
    const nextMetrics = mergeOwnerLeadMetrics(existingMetrics, receipt);
    await writeOwnerLeadMetrics(store, nextMetrics);
    return {
      statusCode: 200,
      body: JSON.stringify({
        stored: true,
        totalSubmissions: nextMetrics.totalSubmissions,
        sourcePageSlug: receipt.sourcePageSlug
      })
    };
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
}

async function handler(event, context) {
  if (isPublicHttpInvocation(event)) {
    console.warn("owner_lead_event_http_invocation_rejected");
    return {
      statusCode: 404,
      body: JSON.stringify({ stored: false, reason: "event_only" })
    };
  }

  return handleSubmissionCreated(event, context);
}

exports.handleSubmissionCreated = handleSubmissionCreated;
exports.isPublicHttpInvocation = isPublicHttpInvocation;
exports.handler = handler;
