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
  readOwnerLeadConfirmationStamp,
  resolveContactStore,
  stampOwnerLeadConfirmationOnContact
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
const {
  OWNER_LEAD_FORM_WEBHOOK_SECRET_ENV,
  getOwnerLeadFormWebhookSecret,
  readRawBody,
  verifyNetlifyWebhookJws
} = require("./_netlify-jws");

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

function readEventHeader(event, headerName) {
  const headers = event && event.headers && typeof event.headers === "object"
    ? event.headers
    : {};
  const target = String(headerName || "").toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (String(key).toLowerCase() !== target) continue;
    if (Array.isArray(value)) {
      return value.length > 0 ? String(value[0] || "").trim() : "";
    }
    return value == null ? "" : String(value).trim();
  }
  return "";
}

function isNetlifySubmissionCreatedEvent(event) {
  const netlifyEvent = readEventHeader(event, "x-netlify-event").toLowerCase();
  return netlifyEvent === "submission-created" || netlifyEvent === "submission_created";
}

function hasHttpMethod(event) {
  return Boolean(
    event &&
    (
      typeof event.httpMethod === "string" ||
      (event.requestContext && event.requestContext.http && typeof event.requestContext.http.method === "string")
    )
  );
}

/**
 * Authenticated Netlify form delivery for HTTP invokes.
 *
 * Outgoing Forms notification webhooks are signed with the customer JWS secret
 * (`OWNER_LEAD_FORM_WEBHOOK_SECRET`). Event-function platform JWS is verified by
 * Netlify before invoke and is NOT customer-verifiable — do not treat
 * `x-netlify-event` alone as proof. Fail closed when the secret is missing or
 * the signature is absent/invalid/forged.
 *
 * Forms HTTP notifications may omit `x-netlify-event`; when that header is
 * present it must name submission-created.
 */
function verifyAuthenticatedNetlifyFormDelivery(event, env = process.env) {
  const secret = getOwnerLeadFormWebhookSecret(env);
  if (!secret) {
    return { ok: false, reason: "missing_webhook_secret" };
  }

  const jws = verifyNetlifyWebhookJws(
    readEventHeader(event, "x-webhook-signature"),
    readRawBody(event),
    secret
  );
  if (!jws.ok) return jws;

  const eventName = readEventHeader(event, "x-netlify-event");
  if (eventName && !isNetlifySubmissionCreatedEvent(event)) {
    return { ok: false, reason: "unexpected_netlify_event" };
  }

  return { ok: true, reason: "verified" };
}

function isPublicHttpInvocation(event, env = process.env) {
  if (!hasHttpMethod(event)) return false;
  return !verifyAuthenticatedNetlifyFormDelivery(event, env).ok;
}

function buildJsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body)
  };
}

async function resolveKnownDeliveryProgress(contactStore, submissionId, delivery) {
  const blobSent = Boolean(delivery && delivery.ownerSent && delivery.internalSent);
  if (blobSent) {
    return { ownerSent: true, internalSent: true, source: "delivery_blob" };
  }

  let stamp = { ownerSent: false, internalSent: false };
  try {
    stamp = await readOwnerLeadConfirmationStamp(contactStore, submissionId);
  } catch (error) {
    console.error("owner_lead_confirmation_stamp_read_failed", {
      submissionId,
      message: error && error.message ? error.message : String(error)
    });
    return {
      ownerSent: Boolean(delivery && delivery.ownerSent),
      internalSent: Boolean(delivery && delivery.internalSent),
      source: "stamp_read_failed",
      stampReadFailed: true
    };
  }

  return {
    ownerSent: Boolean(delivery && delivery.ownerSent) || stamp.ownerSent === true,
    internalSent: Boolean(delivery && delivery.internalSent) || stamp.internalSent === true,
    source: stamp.ownerSent || stamp.internalSent ? "contact_stamp" : "delivery_blob"
  };
}

async function persistAcceptedConfirmationDelivery(contactStore, contact, confirmationResult) {
  const mailAccepted = Boolean(
    confirmationResult &&
    (confirmationResult.ownerSent === true || confirmationResult.internalSent === true)
  );

  let stampPersisted = false;
  if (mailAccepted) {
    try {
      await stampOwnerLeadConfirmationOnContact(
        contactStore,
        contact.submissionId,
        confirmationResult
      );
      stampPersisted = true;
    } catch (error) {
      console.error("owner_lead_confirmation_stamp_write_failed", {
        submissionId: contact.submissionId,
        message: error && error.message ? error.message : String(error)
      });
    }
  }

  try {
    const persisted = await persistOwnerLeadConfirmationDelivery(
      contactStore,
      contact,
      confirmationResult
    );
    return { ...persisted, stampPersisted, mailAccepted };
  } catch (error) {
    error.stampPersisted = stampPersisted;
    error.mailAccepted = mailAccepted;
    throw error;
  }
}

async function finalizeDeliveryStateFromKnownProgress(contactStore, contact, progress) {
  if (!progress || (!progress.ownerSent && !progress.internalSent)) {
    return { finalized: false, reason: "nothing_to_finalize" };
  }

  const bothSent = progress.ownerSent === true && progress.internalSent === true;
  // Only close the claim when both legs are known sent. Partial progress is
  // recovered by releasing the claim (pending) from the sender that exits after
  // Graph accept, or by lease expiry — never by an overlapping in_flight watcher.
  if (!bothSent) {
    return { finalized: false, reason: "partial_progress" };
  }

  await writeOwnerLeadDeliveryState(contactStore, contact.submissionId, {
    ownerSent: true,
    internalSent: true,
    sent: true,
    deliveryStatus: "sent",
    reason: "sent"
  });

  return {
    finalized: true,
    ownerSent: true,
    internalSent: true
  };
}

async function releaseOwnerLeadDeliveryClaimAfterSend(contactStore, contact, confirmationResult) {
  if (!contact || !confirmationResult) return { released: false };
  const ownerSent = confirmationResult.ownerSent === true;
  const internalSent = confirmationResult.internalSent === true;
  if (!ownerSent && !internalSent) return { released: false };

  const ambiguous = confirmationResult.ambiguous === true;
  const bothSent = ownerSent && internalSent;
  // Ambiguous Graph transport: never reopen the remaining leg as pending.
  // Durable partial failures reset remaining legs to pending so a later claim
  // can finish a clearly failed send.
  await writeOwnerLeadDeliveryState(contactStore, contact.submissionId, {
    ownerSent,
    internalSent,
    ownerStatus: ownerSent ? "sent" : (ambiguous ? "unknown" : "pending"),
    internalStatus: internalSent ? "sent" : (ambiguous ? "unknown" : "pending"),
    sent: bothSent,
    ambiguous,
    deliveryStatus: ambiguous ? "unknown" : (bothSent ? "sent" : "pending"),
    reason: ambiguous ? "delivery_unknown" : (bothSent ? "sent" : "owner_sent_internal_failed")
  });
  return { released: true, ownerSent, internalSent, bothSent, ambiguous };
}

async function maybeRepairOwnerLeadConfirmationAfterCaptureFailure({
  event,
  capture,
  injectedContactStore
}) {
  if (!capture || !capture.captureFailed || !capture.contact) {
    return null;
  }
  if (!isUsableOwnerEmail(capture.contact.email)) {
    return null;
  }

  let contactStore;
  try {
    contactStore = resolveContactStore(event, injectedContactStore);
  } catch (error) {
    console.error("owner_lead_repair_store_unavailable", {
      submissionId: capture.contact.submissionId,
      message: error && error.message ? error.message : String(error)
    });
    return {
      attempted: true,
      result: { sent: false, reason: "delivery_state_unavailable" },
      retryable: true,
      delivery: null
    };
  }

  let delivery;
  try {
    delivery = await readOwnerLeadDeliveryState(contactStore, capture.contact.submissionId);
  } catch (error) {
    // Cannot prove whether repair is needed. Keep Netlify retrying.
    console.error("owner_lead_delivery_read_failed", { submissionId: capture.contact.submissionId });
    return {
      attempted: true,
      result: { sent: false, reason: "delivery_state_unavailable" },
      retryable: true,
      delivery: null
    };
  }

  const needsRepair = Boolean(
    delivery.deliveryStatus === "sending" ||
    delivery.deliveryStatus === "unknown" ||
    delivery.ownerSent ||
    delivery.internalSent
  );
  if (!needsRepair) {
    return null;
  }

  const known = await resolveKnownDeliveryProgress(
    contactStore,
    capture.contact.submissionId,
    delivery
  );
  if (known.stampReadFailed) {
    return {
      attempted: true,
      result: {
        sent: false,
        ownerSent: known.ownerSent,
        internalSent: known.internalSent,
        reason: "confirmation_stamp_unavailable"
      },
      retryable: true,
      delivery
    };
  }

  if (known.ownerSent && known.internalSent) {
    try {
      await finalizeDeliveryStateFromKnownProgress(contactStore, capture.contact, known);
      return {
        attempted: true,
        result: {
          sent: true,
          ownerSent: true,
          internalSent: true,
          reason: "sent"
        },
        retryable: false,
        delivery
      };
    } catch (error) {
      console.error("owner_lead_confirmation_state_write_failed", {
        submissionId: capture.contact.submissionId,
        persistFailedAfterSend: true,
        message: error && error.message ? error.message : String(error)
      });
      return {
        attempted: true,
        result: {
          sent: false,
          ownerSent: true,
          internalSent: true,
          reason: "delivery_state_write_failed"
        },
        retryable: true,
        delivery
      };
    }
  }

  if (known.ownerSent || known.internalSent) {
    // Partial progress: do not clear a live claim from this path. Keep retrying
    // until the sender releases the claim or the lease expires.
    return {
      attempted: true,
      result: {
        sent: false,
        ownerSent: known.ownerSent,
        internalSent: known.internalSent,
        reason: "owner_sent_internal_failed"
      },
      retryable: true,
      delivery
    };
  }

  // Claim is in-flight / unknown with no durable stamp yet — keep retrying,
  // never send from the capture-failed path.
  return {
    attempted: true,
    result: {
      sent: false,
      ownerSent: known.ownerSent,
      internalSent: known.internalSent,
      reason: delivery.deliveryStatus === "unknown" ? "delivery_unknown" : "in_flight"
    },
    retryable: true,
    delivery
  };
}

async function maybeSendOwnerLeadConfirmation({
  event,
  capture,
  injectedContactStore,
  sendConfirmation
}) {
  if (!capture.contact || !isUsableOwnerEmail(capture.contact.email)) {
    return { attempted: false, result: null, retryable: false };
  }

  if (capture.captureFailed) {
    const repair = await maybeRepairOwnerLeadConfirmationAfterCaptureFailure({
      event,
      capture,
      injectedContactStore
    });
    if (repair) return repair;
    return { attempted: false, result: null, retryable: false };
  }

  const contactStore = capture.contactStore || resolveContactStore(event, injectedContactStore);
  let delivery;
  try {
    delivery = await readOwnerLeadDeliveryState(contactStore, capture.contact.submissionId);
  } catch (error) {
    console.error("owner_lead_delivery_read_failed", { submissionId: capture.contact.submissionId });
    return { attempted: false, result: { sent: false, reason: "delivery_state_unavailable" }, retryable: true };
  }

  const known = await resolveKnownDeliveryProgress(
    contactStore,
    capture.contact.submissionId,
    delivery
  );

  // Cannot prove prior Graph acceptance from the contact stamp. Suppress send and
  // return 503 so Netlify keeps retrying state repair instead of soft-acking.
  if (known.stampReadFailed) {
    return {
      attempted: true,
      result: {
        sent: false,
        ownerSent: known.ownerSent,
        internalSent: known.internalSent,
        reason: "confirmation_stamp_unavailable"
      },
      retryable: true,
      delivery
    };
  }

  // Graph already accepted once (delivery blob and/or contact stamp). Never send
  // again — only repair the per-submission delivery blob if it lagged the stamp.
  if (known.ownerSent && known.internalSent) {
    if (!(delivery.ownerSent && delivery.internalSent)) {
      try {
        await finalizeDeliveryStateFromKnownProgress(contactStore, capture.contact, known);
      } catch (error) {
        console.error("owner_lead_confirmation_state_write_failed", {
          submissionId: capture.contact.submissionId,
          persistFailedAfterSend: true,
          message: error && error.message ? error.message : String(error)
        });
        return {
          attempted: true,
          result: {
            sent: false,
            ownerSent: true,
            internalSent: true,
            reason: "delivery_state_write_failed"
          },
          retryable: true,
          delivery
        };
      }
    }
    return { attempted: false, result: null, retryable: false, delivery };
  }

  const rate = await assertOwnerLeadMailAllowed(contactStore, capture.contact.email, process.env, { submissionId: capture.contact.submissionId });
  if (!rate.allowed) {
    console.error("owner_lead_confirmation_rate_limited", { reason: rate.reason, scope: rate.scope, submissionId: capture.contact.submissionId });
    return {
      attempted: true,
      result: { sent: false, ownerSent: known.ownerSent, internalSent: known.internalSent, reason: rate.reason },
      retryable: rate.reason !== "rate_limited",
      delivery
    };
  }

  const claim = await claimOwnerLeadDelivery(contactStore, capture.contact.submissionId, {
    ownerSent: known.ownerSent,
    internalSent: known.internalSent
  });
  if (!claim.claimed) {
    // in_flight after a prior Graph accept: finalize only when both legs are
    // already proven sent. Partial progress must not clear a live claim.
    if (claim.reason === "in_flight") {
      const progress = await resolveKnownDeliveryProgress(
        contactStore,
        capture.contact.submissionId,
        claim.state || delivery
      );
      if (progress.stampReadFailed) {
        return {
          attempted: true,
          result: {
            sent: false,
            ownerSent: progress.ownerSent,
            internalSent: progress.internalSent,
            reason: "confirmation_stamp_unavailable"
          },
          retryable: true,
          delivery: claim.state || delivery
        };
      }
      if (progress.ownerSent && progress.internalSent) {
        try {
          await finalizeDeliveryStateFromKnownProgress(contactStore, capture.contact, progress);
          return {
            attempted: true,
            result: {
              sent: true,
              ownerSent: true,
              internalSent: true,
              reason: "sent"
            },
            retryable: false,
            delivery: claim.state || delivery
          };
        } catch (error) {
          console.error("owner_lead_confirmation_state_write_failed", {
            submissionId: capture.contact.submissionId,
            persistFailedAfterSend: true,
            message: error && error.message ? error.message : String(error)
          });
          return {
            attempted: true,
            result: {
              sent: false,
              ownerSent: true,
              internalSent: true,
              reason: "delivery_state_write_failed"
            },
            retryable: true,
            delivery: claim.state || delivery
          };
        }
      }

      return {
        attempted: true,
        result: {
          sent: false,
          ownerSent: progress.ownerSent,
          internalSent: progress.internalSent,
          reason: "in_flight"
        },
        retryable: true,
        delivery: claim.state || delivery
      };
    }

    const claimRetryable = claim.reason === "delivery_store_unavailable" || claim.reason === "delivery_claim_failed";
    return {
      attempted: false,
      result: { sent: false, ownerSent: known.ownerSent, internalSent: known.internalSent, reason: claim.reason },
      retryable: claimRetryable,
      delivery: claim.state || delivery
    };
  }

  const confirmationResult = await safeConfirm(sendConfirmation, capture.contact, {
    ownerSent: known.ownerSent || Boolean(claim.state && claim.state.ownerSent),
    internalSent: known.internalSent || Boolean(claim.state && claim.state.internalSent)
  });

  try {
    await persistAcceptedConfirmationDelivery(contactStore, capture.contact, confirmationResult);
  } catch (error) {
    const mailAccepted = Boolean(
      error && error.mailAccepted !== undefined
        ? error.mailAccepted
        : confirmationResult && (confirmationResult.ownerSent || confirmationResult.internalSent)
    );
    const stampPersisted = Boolean(error && error.stampPersisted);
    console.error("owner_lead_confirmation_state_write_failed", {
      submissionId: capture.contact.submissionId,
      persistFailedAfterSend: mailAccepted,
      stampPersisted,
      message: error && error.message ? error.message : String(error)
    });

    // Graph already accepted: release the sending claim into durable leg flags
    // when possible, then return 503 so Netlify retries without double-sending.
    // Ambiguous transport must stay at-most-once even if the delivery blob lag
    // still needs a human/ops follow-up — do not reopen Graph via 503.
    if (mailAccepted) {
      try {
        await releaseOwnerLeadDeliveryClaimAfterSend(
          contactStore,
          capture.contact,
          confirmationResult
        );
      } catch (releaseError) {
        console.error("owner_lead_confirmation_claim_release_failed", {
          submissionId: capture.contact.submissionId,
          message: releaseError && releaseError.message ? releaseError.message : String(releaseError)
        });
      }
      const ambiguous = confirmationResult && confirmationResult.ambiguous === true;
      return {
        attempted: true,
        result: {
          ...confirmationResult,
          sent: false,
          reason: ambiguous ? "delivery_unknown" : "delivery_state_write_failed"
        },
        retryable: ambiguous ? false : true,
        delivery: claim.state
      };
    }
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
    const auth = verifyAuthenticatedNetlifyFormDelivery(event);
    console.warn("owner_lead_event_http_invocation_rejected", {
      reason: auth.reason || "event_only"
    });
    return buildJsonResponse(404, {
      stored: false,
      reason: "event_only",
      authReason: auth.reason || "event_only"
    });
  }

  return handleSubmissionCreated(event, context);
}

exports.handleSubmissionCreated = handleSubmissionCreated;
exports.isPublicHttpInvocation = isPublicHttpInvocation;
exports.isNetlifySubmissionCreatedEvent = isNetlifySubmissionCreatedEvent;
exports.verifyAuthenticatedNetlifyFormDelivery = verifyAuthenticatedNetlifyFormDelivery;
exports.OWNER_LEAD_FORM_WEBHOOK_SECRET_ENV = OWNER_LEAD_FORM_WEBHOOK_SECRET_ENV;
exports.handler = handler;
