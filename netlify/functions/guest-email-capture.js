const crypto = require("crypto");
const { connectLambda, getStore } = require("@netlify/blobs");
const {
  GUEST_EMAIL_CAPTURE_STORE_NAME,
  MAILCHIMP_EVENT_NAME,
  buildGuestEmailCaptureReceipt,
  buildGuestMailchimpEvent,
  buildGuestMailchimpTags,
  buildMailchimpSubscriberHash,
  deriveMailchimpAudienceId,
  deriveMailchimpServerPrefix,
  getGuestEmailCaptureBlobsConfig,
  mergeGuestEmailCaptureMetrics,
  readGuestEmailCaptureMetrics,
  splitName,
  withMailchimpDelivery,
  writeGuestEmailCaptureMetrics
} = require("./_guest-email-capture-metrics");

const CAPTURE_STATES = Object.freeze({
  TAGGED: "guest_capture_tag_applied",
  RETRY_QUEUED: "retry_queued",
  MANUAL_ATTENTION: "manual_attention_required",
  VISIBLE_FAILURE: "visible_failure"
});
const GUEST_CAPTURE_STATE_KEY_PREFIX = "guest_capture_state_v1";
const MAX_TAG_RETRY_ATTEMPTS = 3;

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

function parseAudienceIds(value) {
  return String(value || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildGuestCaptureLogContext(payload) {
  return {
    hasPagePath: Boolean(payload && typeof payload.pagePath === "string" && payload.pagePath.trim()),
    hasPlacement: Boolean(payload && typeof payload.placement === "string" && payload.placement.trim()),
    hasSourcePageSlug: Boolean(payload && typeof payload.sourcePageSlug === "string" && payload.sourcePageSlug.trim()),
    hasName: Boolean(payload && typeof payload.name === "string" && payload.name.trim()),
    hasEmail: Boolean(payload && typeof payload.email === "string" && payload.email.trim())
  };
}

function buildMailchimpConfig(env = process.env) {
  const apiKey = String(env.MAILCHIMP_API_KEY || "").trim();
  const serverPrefix = deriveMailchimpServerPrefix(apiKey, env.MAILCHIMP_SERVER_PREFIX);
  const audienceId = deriveMailchimpAudienceId(
    parseAudienceIds(env.MAILCHIMP_AUDIENCE_IDS)[0] || env.MAILCHIMP_AUDIENCE_ID
  );

  if (!apiKey || !serverPrefix || !audienceId) {
    return null;
  }

  return {
    apiKey,
    serverPrefix,
    audienceId
  };
}

function buildMailchimpAuthHeader(apiKey) {
  return `Basic ${Buffer.from(`seascape:${apiKey}`).toString("base64")}`;
}

async function requestMailchimpJson(config, pathname, method, body, injectedFetch) {
  const transport = injectedFetch || fetch;
  const response = await transport(
    `https://${config.serverPrefix}.api.mailchimp.com/3.0${pathname}`,
    {
      method,
      headers: {
        authorization: buildMailchimpAuthHeader(config.apiKey),
        accept: "application/json",
        "content-type": "application/json; charset=utf-8"
      },
      body: body ? JSON.stringify(body) : undefined
    }
  );

  if (!response.ok) {
    throw new Error(`Mailchimp API ${method} ${pathname} failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  const rawBody = typeof response.text === "function" ? await response.text() : "";
  if (!rawBody) {
    return null;
  }

  return JSON.parse(rawBody);
}

function deliveryHasGuestCaptureTag(delivery) {
  const tags = Array.isArray(delivery && delivery.tags) ? delivery.tags : [];
  const warnings = Array.isArray(delivery && delivery.warnings) ? delivery.warnings : [];
  return (
    delivery &&
    delivery.mode === "marketing_api" &&
    tags.includes("guest-capture") &&
    !warnings.includes("mailchimp_tags_sync_failed")
  );
}

function buildGuestCaptureQueueId(email, submissionId) {
  return crypto
    .createHash("sha256")
    .update(`${buildMailchimpSubscriberHash(email)}|${String(submissionId || "")}`)
    .digest("hex");
}

function buildGuestCaptureStateKey(email, submissionId) {
  return `${GUEST_CAPTURE_STATE_KEY_PREFIX}/retry/${buildGuestCaptureQueueId(email, submissionId)}.json`;
}

function buildGuestCaptureManualStateKey(email, submissionId) {
  return `${GUEST_CAPTURE_STATE_KEY_PREFIX}/manual/${buildGuestCaptureQueueId(email, submissionId)}.json`;
}

function parseGuestCaptureState(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return null;

  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

async function readGuestCaptureState(store, key) {
  if (!store) return null;

  try {
    return parseGuestCaptureState(
      await store.get(key, { type: "json", consistency: "strong" })
    );
  } catch (error) {
    console.error("guest_capture_state_read_failed", {
      key,
      message: error && error.message ? error.message : String(error)
    });
    return null;
  }
}

async function writeGuestCaptureState(store, key, state) {
  if (!store) {
    throw new Error("guest_capture_state_store_unavailable");
  }

  await store.set(key, JSON.stringify(state), {
    contentType: "application/json; charset=utf-8"
  });
}

function buildGuestCaptureState({ state, payload, receipt, attempts, reason }) {
  const config = buildMailchimpConfig();
  return {
    version: 1,
    state,
    queueId: buildGuestCaptureQueueId(payload.email, receipt.submissionId),
    submissionId: receipt.submissionId,
    subscriberHash: buildMailchimpSubscriberHash(payload.email),
    audienceId: config ? config.audienceId : null,
    tags: buildGuestMailchimpTags(receipt),
    attempts,
    maxAttempts: MAX_TAG_RETRY_ATTEMPTS,
    reason,
    updatedAt: new Date().toISOString()
  };
}

async function submitToMailchimpApi(payload, receipt, config, injectedFetch) {
  const subscriberHash = buildMailchimpSubscriberHash(payload.email);
  const { firstName, lastName } = splitName(payload.name);
  const mergeFields = {};
  const tags = buildGuestMailchimpTags(receipt);
  const warnings = [];
  const event = buildGuestMailchimpEvent(receipt);
  let appliedTags = [];

  if (firstName) {
    mergeFields.FNAME = firstName;
  }
  if (lastName) {
    mergeFields.LNAME = lastName;
  }

  const memberBody = {
    email_address: String(payload.email || "").trim().toLowerCase(),
    status_if_new: "subscribed"
  };
  if (Object.keys(mergeFields).length > 0) {
    memberBody.merge_fields = mergeFields;
  }

  await requestMailchimpJson(
    config,
    `/lists/${encodeURIComponent(config.audienceId)}/members/${subscriberHash}`,
    "PUT",
    memberBody,
    injectedFetch
  );

  if (tags.length > 0) {
    try {
      await requestMailchimpJson(
        config,
        `/lists/${encodeURIComponent(config.audienceId)}/members/${subscriberHash}/tags`,
        "POST",
        {
          tags: tags.map((name) => ({ name, status: "active" }))
        },
        injectedFetch
      );
      appliedTags = tags;
    } catch (error) {
      console.error("mailchimp_tags_sync_failed", {
        message: error && error.message ? error.message : String(error)
      });
      warnings.push("mailchimp_tags_sync_failed");
    }
  }

  if (event) {
    try {
      await requestMailchimpJson(
        config,
        `/lists/${encodeURIComponent(config.audienceId)}/members/${subscriberHash}/events`,
        "POST",
        event,
        injectedFetch
      );
    } catch (error) {
      console.error("mailchimp_event_sync_failed", {
        message: error && error.message ? error.message : String(error)
      });
      warnings.push("mailchimp_event_sync_failed");
    }
  }

  return {
    mode: "marketing_api",
    warnings,
    tags: appliedTags,
    eventName: event ? event.name : MAILCHIMP_EVENT_NAME,
    subscriberHash
  };
}

async function submitToMailchimp(payload, receipt, injectedFetch) {
  const config = buildMailchimpConfig();
  if (!config) {
    console.error("marketing_api_unconfigured", {
      reason: "missing_mailchimp_marketing_api_config"
    });
    const error = new Error("marketing_api_unconfigured");
    error.code = "marketing_api_unconfigured";
    throw error;
  }

  try {
    return await submitToMailchimpApi(payload, receipt, config, injectedFetch);
  } catch (error) {
    if (error && error.code === "marketing_api_unconfigured") {
      throw error;
    }
    console.error("marketing_api_submit_failed", {
      message: error && error.message ? error.message : String(error)
    });
    const wrapped = new Error("marketing_api_submit_failed");
    wrapped.code = "marketing_api_submit_failed";
    wrapped.cause = error;
    throw wrapped;
  }
}

function buildCaptureResponseBody({
  stored,
  tagged,
  captureState,
  retryAttempts,
  receipt,
  deliveryMode,
  reason,
  totalCaptures
}) {
  const body = {
    stored: Boolean(stored),
    tagged: Boolean(tagged),
    captureState,
    pagePath: receipt.pagePath,
    placement: receipt.placement,
    deliveryMode: deliveryMode || null
  };
  if (typeof totalCaptures === "number") {
    body.totalCaptures = totalCaptures;
  }
  if (reason) {
    body.reason = reason;
  }
  if (typeof retryAttempts === "number") {
    body.retryAttempts = retryAttempts;
  }
  return body;
}

async function persistGuestCaptureMetrics(store, receipt) {
  try {
    if (!store) throw new Error("guest_capture_metrics_store_unavailable");
    const existingMetrics = await readGuestEmailCaptureMetrics(store);
    const nextMetrics = mergeGuestEmailCaptureMetrics(existingMetrics, receipt);
    await writeGuestEmailCaptureMetrics(store, nextMetrics);
    return { stored: true, totalCaptures: nextMetrics.totalCaptures };
  } catch (error) {
    console.error("guest_capture_metrics_write_failed", {
      submissionId: receipt.submissionId,
      message: error && error.message ? error.message : String(error)
    });
    return { stored: false, totalCaptures: undefined };
  }
}

async function handleGuestEmailCapture(event, _context, injectedStore, injectedFetch) {
  if (event.httpMethod !== "POST") {
    console.warn("guest_capture_method_not_allowed", {
      httpMethod: event && event.httpMethod ? event.httpMethod : "unknown"
    });
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const payload = parseRequestBody(event);
  if (!payload) {
    console.warn("guest_capture_invalid_json", {
      bodyLength: typeof event.body === "string" ? event.body.length : 0
    });
    return {
      statusCode: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "invalid_json" })
    };
  }

  const receipt = buildGuestEmailCaptureReceipt(payload);
  if (!receipt) {
    console.warn("guest_capture_invalid_payload", buildGuestCaptureLogContext(payload));
    return {
      statusCode: 400,
      body: JSON.stringify({ stored: false, reason: "invalid_payload" })
    };
  }

  let store = null;
  try {
    store = resolveWritableStore(event, injectedStore);
  } catch (error) {
    console.error("guest_capture_store_unavailable", {
      submissionId: receipt.submissionId,
      message: error && error.message ? error.message : String(error)
    });
  }

  const manualStateKey = buildGuestCaptureManualStateKey(payload.email, receipt.submissionId);
  const manualState = await readGuestCaptureState(store, manualStateKey);
  if (manualState && manualState.state === CAPTURE_STATES.MANUAL_ATTENTION) {
    const manualReceipt = withMailchimpDelivery(receipt, {
      mode: "marketing_api",
      warnings: [manualState.reason || "mailchimp_tags_sync_failed"],
      tags: [],
      eventName: null
    });
    const metrics = await persistGuestCaptureMetrics(store, manualReceipt);
    return {
      statusCode: 503,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(
        buildCaptureResponseBody({
          stored: metrics.stored,
          tagged: false,
          captureState: CAPTURE_STATES.MANUAL_ATTENTION,
          retryAttempts: Number(manualState.attempts) || MAX_TAG_RETRY_ATTEMPTS,
          receipt,
          deliveryMode: "marketing_api",
          reason: manualState.reason || "mailchimp_tags_sync_failed",
          totalCaptures: metrics.totalCaptures
        })
      )
    };
  }

  const stateKey = buildGuestCaptureStateKey(payload.email, receipt.submissionId);
  const priorState = await readGuestCaptureState(store, stateKey);
  if (priorState && priorState.state === CAPTURE_STATES.RETRY_QUEUED) {
    const queuedReceipt = withMailchimpDelivery(receipt, {
      mode: "marketing_api",
      warnings: [priorState.reason || "mailchimp_tags_sync_failed"],
      tags: [],
      eventName: null
    });
    const metrics = await persistGuestCaptureMetrics(store, queuedReceipt);
    return {
      statusCode: 202,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(
        buildCaptureResponseBody({
          stored: metrics.stored,
          tagged: false,
          captureState: CAPTURE_STATES.RETRY_QUEUED,
          retryAttempts: Number(priorState.attempts) || 1,
          receipt,
          deliveryMode: "marketing_api",
          reason: priorState.reason || "mailchimp_tags_sync_failed",
          totalCaptures: metrics.totalCaptures
        })
      )
    };
  }

  let delivery;
  let captureState = CAPTURE_STATES.TAGGED;
  let retryAttempts;
  let incompleteReason = null;

  try {
    delivery = await submitToMailchimp(payload, receipt, injectedFetch);
  } catch (error) {
    const reason =
      (error && error.code) ||
      (error && error.message) ||
      "marketing_api_submit_failed";
    console.error("guest_capture_mailchimp_incomplete", {
      reason,
      message: error && error.message ? error.message : String(error)
    });
    return {
      statusCode: 502,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(
        buildCaptureResponseBody({
          stored: false,
          tagged: false,
          captureState: CAPTURE_STATES.VISIBLE_FAILURE,
          receipt,
          deliveryMode: null,
          reason
        })
      )
    };
  }

  if (!deliveryHasGuestCaptureTag(delivery)) {
    retryAttempts = 1;
    incompleteReason = delivery.warnings && delivery.warnings.includes("mailchimp_tags_sync_failed")
      ? "mailchimp_tags_sync_failed"
      : "guest_capture_tag_missing";
    captureState = CAPTURE_STATES.RETRY_QUEUED;

    try {
      await writeGuestCaptureState(
        store,
        stateKey,
        buildGuestCaptureState({
          state: captureState,
          payload,
          receipt,
          attempts: retryAttempts,
          reason: incompleteReason
        })
      );
    } catch (error) {
      console.error("guest_capture_retry_persistence_failed", {
        submissionId: receipt.submissionId,
        message: error && error.message ? error.message : String(error)
      });
      return {
        statusCode: 503,
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify(
          buildCaptureResponseBody({
            stored: false,
            tagged: false,
            captureState: CAPTURE_STATES.VISIBLE_FAILURE,
            retryAttempts,
            receipt,
            deliveryMode: delivery.mode,
            reason: "retry_persistence_failed"
          })
        )
      };
    }
  }

  const tagged = deliveryHasGuestCaptureTag(delivery);
  const storedReceipt = withMailchimpDelivery(receipt, delivery);

  const metrics = await persistGuestCaptureMetrics(store, storedReceipt);
  const metricsStored = metrics.stored;
  const totalCaptures = metrics.totalCaptures;

  if (captureState === CAPTURE_STATES.RETRY_QUEUED) {
    console.error("guest_capture_tagging_incomplete", {
      submissionId: storedReceipt.submissionId,
      reason: incompleteReason,
      stored: metricsStored
    });
    return {
      statusCode: 202,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(
        buildCaptureResponseBody({
          stored: metricsStored,
          tagged: false,
          captureState,
          retryAttempts,
          receipt: storedReceipt,
          deliveryMode: delivery.mode,
          reason: incompleteReason,
          totalCaptures
        })
      )
    };
  }

  if (captureState === CAPTURE_STATES.MANUAL_ATTENTION) {
    console.error("guest_capture_retry_exhausted", {
      submissionId: storedReceipt.submissionId,
      attempts: retryAttempts,
      reason: incompleteReason
    });
    return {
      statusCode: 503,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(
        buildCaptureResponseBody({
          stored: metricsStored,
          tagged: false,
          captureState,
          retryAttempts,
          receipt: storedReceipt,
          deliveryMode: delivery.mode,
          reason: incompleteReason,
          totalCaptures
        })
      )
    };
  }

  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(
      buildCaptureResponseBody({
        stored: metricsStored,
        tagged: true,
        captureState: CAPTURE_STATES.TAGGED,
        receipt: storedReceipt,
        deliveryMode: delivery.mode,
        totalCaptures
      })
    )
  };
}

async function handler(event, context) {
  return handleGuestEmailCapture(event, context);
}

exports.buildMailchimpConfig = buildMailchimpConfig;
exports.CAPTURE_STATES = CAPTURE_STATES;
exports.GUEST_CAPTURE_STATE_KEY_PREFIX = GUEST_CAPTURE_STATE_KEY_PREFIX;
exports.MAX_TAG_RETRY_ATTEMPTS = MAX_TAG_RETRY_ATTEMPTS;
exports.buildGuestCaptureQueueId = buildGuestCaptureQueueId;
exports.buildGuestCaptureManualStateKey = buildGuestCaptureManualStateKey;
exports.buildGuestCaptureStateKey = buildGuestCaptureStateKey;
exports.requestMailchimpJson = requestMailchimpJson;
exports.submitToMailchimp = submitToMailchimp;
exports.handleGuestEmailCapture = handleGuestEmailCapture;
exports.handler = handler;
