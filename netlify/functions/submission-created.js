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
  mutateOwnerLeadContacts,
  resolveContactStore
} = require("./_owner-lead-contacts");
const { notifyOwnerLead } = require("./_owner-lead-notify");
const {
  isUsableOwnerEmail,
  sendOwnerLeadConfirmationEmails
} = require("./_owner-lead-confirmation");
const {
  claimOwnerLeadDelivery,
  isRetryableConfirmationFailure,
  readOwnerLeadDeliveryState,
  writeOwnerLeadDeliveryState
} = require("./_owner-lead-delivery");
const { assertOwnerLeadMailAllowed } = require("./_owner-lead-abuse");

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
    const result = await sendConfirmation(contact, delivery);
    if (result && result.sent === true && typeof result.ownerSent !== "boolean") {
      return { ...result, ownerSent: true, internalSent: true };
    }
    return result;
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
    return { contact: null, alreadyStored: false, captureFailed: false, contactStore: null };
  }

  try {
    const contactStore = resolveContactStore(event, injectedContactStore);
    let alreadyStored = false;
    await mutateOwnerLeadContacts(contactStore, (existingContacts) => {
      alreadyStored = Boolean(
        existingContacts &&
        Array.isArray(existingContacts.contacts) &&
        existingContacts.contacts.some((entry) => entry.submissionId === contact.submissionId)
      );
      return mergeOwnerLeadContacts(existingContacts, contact);
    });

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
    return { contact, alreadyStored, captureFailed: false, contactStore };
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
    return {
      contact,
      alreadyStored: false,
      captureFailed: true,
      contactStore: null
    };
  }
}

async function persistOwnerLeadConfirmationDelivery(contactStore, contact, result) {
  if (!contact || !result) {
    return { persisted: true, unchanged: true, state: null };
  }

  return writeOwnerLeadDeliveryState(contactStore, contact.submissionId, result);
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

function buildJsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body)
  };
}

async function maybeSendOwnerLeadConfirmation({
  event,
  capture,
  injectedContactStore,
  sendConfirmation
}) {
  if (!capture.contact || capture.captureFailed || !isUsableOwnerEmail(capture.contact.email)) {
    return { attempted: false, result: null, retryable: false };
  }

  const contactStore = capture.contactStore || resolveContactStore(event, injectedContactStore);
  let delivery;
  try {
    delivery = await readOwnerLeadDeliveryState(contactStore, capture.contact.submissionId);
  } catch (error) {
    console.error("owner_lead_delivery_read_failed", { submissionId: capture.contact.submissionId });
    return { attempted: false, result: { sent: false, reason: "delivery_state_unavailable" }, retryable: false };
  }

  if (delivery.ownerSent && delivery.internalSent) return { attempted: false, result: null, retryable: false, delivery };

  const rate = await assertOwnerLeadMailAllowed(contactStore, capture.contact.email, process.env, { submissionId: capture.contact.submissionId });
  if (!rate.allowed) {
    console.error("owner_lead_confirmation_rate_limited", { reason: rate.reason, scope: rate.scope, submissionId: capture.contact.submissionId });
    return { attempted: true, result: { sent: false, ownerSent: delivery.ownerSent, internalSent: delivery.internalSent, reason: rate.reason }, retryable: false, delivery };
  }

  const claim = await claimOwnerLeadDelivery(contactStore, capture.contact.submissionId);
  if (!claim.claimed) {
    return { attempted: false, result: { sent: false, ownerSent: delivery.ownerSent, internalSent: delivery.internalSent, reason: claim.reason }, retryable: false, delivery: claim.state || delivery };
  }

  const confirmationResult = await safeConfirm(sendConfirmation, capture.contact, delivery);
  try {
    await persistOwnerLeadConfirmationDelivery(contactStore, capture.contact, confirmationResult);
  } catch (error) {
    console.error("owner_lead_confirmation_state_write_failed", { submissionId: capture.contact.submissionId, persistFailedAfterSend: Boolean(confirmationResult && (confirmationResult.ownerSent || confirmationResult.internalSent)) });
    return {
      attempted: true,
      result: { ...confirmationResult, sent: false, reason: "delivery_state_unknown", ambiguous: true },
      retryable: false,
      delivery: claim.state
    };
  }

  return { attempted: true, result: confirmationResult, retryable: isRetryableConfirmationFailure(confirmationResult), delivery: claim.state };
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
    return buildJsonResponse(400, { stored: false, reason: "invalid_json" });
  }

  const receipt = buildOwnerLeadReceipt(payload);

  if (!receipt) {
    console.warn("owner_lead_payload_ignored", {
      formName: getPayloadFormName(payload) || "unknown",
      hasSubmissionId: Boolean(getPayloadSubmissionId(payload))
    });
    return buildJsonResponse(200, { stored: false, reason: "ignored_form" });
  }

  // Lead-safety FIRST: durable contact capture + human notify run before any
  // throw-prone metrics-store resolution, so a Blobs/connect failure on the
  // attribution path can never silently drop the lead.
  const notify = injectedNotify || notifyOwnerLead;
  const sendConfirmation = injectedSendConfirmation || (
    (contact, delivery) => sendOwnerLeadConfirmationEmails(contact, undefined, process.env, delivery)
  );
  const capture = await captureOwnerLeadContact(event, payload, injectedContactStore, notify);

  // Confirmation ack only after durable contact capture. Failed Graph sends
  // return retryable 503 so Netlify redelivers; per-submission delivery flags
  // prevent duplicate owner/internal mail on those retries.
  const confirmation = await maybeSendOwnerLeadConfirmation({
    event,
    capture,
    injectedContactStore,
    sendConfirmation
  });

  // Attribution metrics are best-effort and fully independent of the lead record.
  let metricsBody = {
    stored: false,
    reason: "metrics_write_failed",
    sourcePageSlug: receipt.sourcePageSlug
  };

  try {
    const store = resolveWritableStore(event, injectedStore);
    const existingMetrics = await readOwnerLeadMetrics(store);
    const nextMetrics = mergeOwnerLeadMetrics(existingMetrics, receipt);
    await writeOwnerLeadMetrics(store, nextMetrics);
    metricsBody = {
      stored: true,
      totalSubmissions: nextMetrics.totalSubmissions,
      sourcePageSlug: receipt.sourcePageSlug
    };
  } catch (error) {
    console.error("owner_lead_metrics_write_failed", {
      sourcePageSlug: receipt.sourcePageSlug,
      submissionId: receipt.submissionId,
      message: error && error.message ? error.message : String(error)
    });
  }

  if (confirmation.retryable) {
    return buildJsonResponse(503, {
      ...metricsBody,
      confirmation: {
        sent: false,
        reason: confirmation.result && confirmation.result.reason
          ? confirmation.result.reason
          : "confirmation_retryable"
      }
    });
  }

  return buildJsonResponse(200, {
    ...metricsBody,
    confirmation: confirmation.attempted
      ? {
          sent: Boolean(confirmation.result && confirmation.result.sent),
          reason: confirmation.result && confirmation.result.reason
            ? confirmation.result.reason
            : undefined
        }
      : undefined
  });
}

async function handler(event, context) {
  if (isPublicHttpInvocation(event)) {
    console.warn("owner_lead_event_http_invocation_rejected");
    return buildJsonResponse(404, { stored: false, reason: "event_only" });
  }

  return handleSubmissionCreated(event, context);
}

exports.handleSubmissionCreated = handleSubmissionCreated;
exports.isPublicHttpInvocation = isPublicHttpInvocation;
exports.handler = handler;
