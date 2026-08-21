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
    eventName: event ? event.name : MAILCHIMP_EVENT_NAME
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
  receipt,
  deliveryMode,
  reason,
  totalCaptures
}) {
  const body = {
    stored: Boolean(stored),
    tagged: Boolean(tagged),
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
  return body;
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

  let delivery;
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
          receipt,
          deliveryMode: null,
          reason
        })
      )
    };
  }

  const tagged = deliveryHasGuestCaptureTag(delivery);
  const incompleteReason = !tagged
    ? (delivery.warnings && delivery.warnings.includes("mailchimp_tags_sync_failed")
      ? "mailchimp_tags_sync_failed"
      : "guest_capture_tag_missing")
    : null;
  const storedReceipt = withMailchimpDelivery(receipt, delivery);

  let metricsStored = false;
  let totalCaptures;
  try {
    const store = resolveWritableStore(event, injectedStore);
    const existingMetrics = await readGuestEmailCaptureMetrics(store);
    const nextMetrics = mergeGuestEmailCaptureMetrics(existingMetrics, storedReceipt);
    await writeGuestEmailCaptureMetrics(store, nextMetrics);
    metricsStored = true;
    totalCaptures = nextMetrics.totalCaptures;
  } catch (error) {
    console.error("guest_capture_metrics_write_failed", {
      submissionId: storedReceipt.submissionId,
      message: error && error.message ? error.message : String(error)
    });
  }

  if (!tagged) {
    console.error("guest_capture_tagging_incomplete", {
      submissionId: storedReceipt.submissionId,
      reason: incompleteReason,
      stored: metricsStored
    });
    return {
      statusCode: 502,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(
        buildCaptureResponseBody({
          stored: metricsStored,
          tagged: false,
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
exports.requestMailchimpJson = requestMailchimpJson;
exports.submitToMailchimp = submitToMailchimp;
exports.handleGuestEmailCapture = handleGuestEmailCapture;
exports.handler = handler;
