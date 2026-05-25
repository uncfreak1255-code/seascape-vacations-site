const { connectLambda, getStore } = require("@netlify/blobs");
const {
  GUEST_EMAIL_CAPTURE_STORE_NAME,
  MAILCHIMP_EVENT_NAME,
  MAILCHIMP_ENDPOINT,
  MAILCHIMP_QUERY,
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
  withEmailDelivery,
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

function parseAudienceIds(value) {
  return String(value || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
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

function buildListmonkConfig(env = process.env) {
  const baseUrl = String(env.LISTMONK_API_URL || "").trim().replace(/\/+$/g, "");
  const username = String(env.LISTMONK_API_USER || "").trim();
  const token = String(env.LISTMONK_API_TOKEN || "").trim();
  const guestProspectsListId = Number.parseInt(env.LISTMONK_GUEST_PROSPECTS_LIST_ID || "", 10);

  if (!baseUrl || !username || !token || !Number.isFinite(guestProspectsListId) || guestProspectsListId <= 0) {
    return null;
  }

  return {
    baseUrl,
    username,
    token,
    guestProspectsListId
  };
}

function buildListmonkAuthHeader(config) {
  return `token ${config.username}:${config.token}`;
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

async function requestListmonkJson(config, pathname, method, body, injectedFetch) {
  const transport = injectedFetch || fetch;
  const response = await transport(`${config.baseUrl}${pathname}`, {
    method,
    headers: {
      authorization: buildListmonkAuthHeader(config),
      accept: "application/json",
      "content-type": "application/json; charset=utf-8"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error(`listmonk API ${method} ${pathname} failed with status ${response.status}`);
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

function isPopupCapture(receipt) {
  return (
    (receipt?.formName || "email_capture") === "email_capture" &&
    (receipt?.placement || "inline") === "popup"
  );
}

function buildListmonkSubscriberAttribs(receipt) {
  return {
    entry_point: receipt.entryPoint || "",
    source_page: receipt.sourcePage || receipt.sourcePageSlug || receipt.pageSlug || "",
    source_page_slug: receipt.sourcePageSlug || receipt.pageSlug || "",
    guide_slug: receipt.guideSlug || "",
    destination_interest: receipt.destinationInterest || "",
    trip_intent: receipt.tripIntent || "",
    party_size_band: receipt.partySizeBand || "",
    timing_window: receipt.timingWindow || "",
    property_interest: receipt.propertyInterest || "",
    market: receipt.market || "florida-gulf-coast",
    booking_stage: receipt.bookingStage || "",
    last_stay_property: receipt.lastStayProperty || "",
    last_checkout_month: receipt.lastCheckoutMonth || "",
    repeat_guest: receipt.repeatGuest || "",
    last_booking_source: receipt.lastBookingSource || "",
    page_slug: receipt.pageSlug || "",
    page_path: receipt.pagePath || "/",
    placement: receipt.placement || "inline",
    form_name: receipt.formName || "email_capture",
    submission_id: receipt.submissionId || "",
    created_at: receipt.createdAt || ""
  };
}

async function submitToMailchimpForm(payload, injectedFetch) {
  const transport = injectedFetch || fetch;
  const body = new URLSearchParams({
    EMAIL: payload.email,
    FNAME: payload.name
  });

  const response = await transport(`${MAILCHIMP_ENDPOINT}?${MAILCHIMP_QUERY}`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=utf-8"
    },
    body: body.toString(),
    redirect: "follow"
  });

  if (!response.ok) {
    throw new Error(`Mailchimp submission failed with status ${response.status}`);
  }

  return {
    mode: "legacy_form",
    warnings: [],
    tags: [],
    eventName: null
  };
}

async function submitToMailchimpApi(payload, receipt, config, injectedFetch) {
  const subscriberHash = buildMailchimpSubscriberHash(payload.email);
  const { firstName, lastName } = splitName(payload.name);
  const mergeFields = {};
  const tags = buildGuestMailchimpTags(receipt);
  const warnings = [];
  const event = buildGuestMailchimpEvent(receipt);

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
    } catch (_error) {
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
    } catch (_error) {
      warnings.push("mailchimp_event_sync_failed");
    }
  }

  return {
    platform: "mailchimp",
    mode: "marketing_api",
    warnings,
    tags,
    eventName: event ? event.name : MAILCHIMP_EVENT_NAME
  };
}

async function submitToListmonk(payload, receipt, config, injectedFetch) {
  await requestListmonkJson(
    config,
    "/api/subscribers",
    "POST",
    {
      email: String(payload.email || "").trim().toLowerCase(),
      name: String(payload.name || "").trim(),
      status: "enabled",
      lists: [config.guestProspectsListId],
      attribs: buildListmonkSubscriberAttribs(receipt),
      preconfirm_subscriptions: true
    },
    injectedFetch
  );

  return {
    platform: "listmonk",
    mode: "listmonk_api",
    warnings: [],
    listIds: [String(config.guestProspectsListId)]
  };
}

async function submitToMailchimp(payload, receipt, injectedFetch) {
  const config = buildMailchimpConfig();
  if (!config) {
    const fallbackResult = await submitToMailchimpForm(payload, injectedFetch);
    return {
      platform: "mailchimp",
      ...fallbackResult,
      warnings: ["marketing_api_unconfigured"]
    };
  }

  try {
    return await submitToMailchimpApi(payload, receipt, config, injectedFetch);
  } catch (_error) {
    const fallbackResult = await submitToMailchimpForm(payload, injectedFetch);
    return {
      platform: "mailchimp",
      ...fallbackResult,
      warnings: ["marketing_api_submit_failed"]
    };
  }
}

async function submitGuestProspect(payload, receipt, injectedFetch) {
  const listmonkConfig = buildListmonkConfig();
  if (listmonkConfig) {
    try {
      return await submitToListmonk(payload, receipt, listmonkConfig, injectedFetch);
    } catch (_error) {
      const mailchimpFallback = await submitToMailchimp(payload, receipt, injectedFetch);
      return {
        ...mailchimpFallback,
        warnings: [...new Set([...(mailchimpFallback.warnings || []), "listmonk_submit_failed"])]
      };
    }
  }

  const mailchimpFallback = await submitToMailchimp(payload, receipt, injectedFetch);
  return {
    ...mailchimpFallback,
    warnings: [...new Set([...(mailchimpFallback.warnings || []), "listmonk_unconfigured"])]
  };
}

async function handleGuestEmailCapture(event, _context, injectedStore, injectedFetch) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const payload = JSON.parse(event.body || "{}");
  const receipt = buildGuestEmailCaptureReceipt(payload);
  if (!receipt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ stored: false, reason: "invalid_payload" })
    };
  }

  const delivery = isPopupCapture(receipt)
    ? await submitToMailchimp(payload, receipt, injectedFetch)
    : await submitGuestProspect(payload, receipt, injectedFetch);
  const storedReceipt = withEmailDelivery(receipt, delivery);

  const store = resolveWritableStore(event, injectedStore);
  const existingMetrics = await readGuestEmailCaptureMetrics(store);
  const nextMetrics = mergeGuestEmailCaptureMetrics(existingMetrics, storedReceipt);
  await writeGuestEmailCaptureMetrics(store, nextMetrics);

  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      stored: true,
      totalCaptures: nextMetrics.totalCaptures,
      pagePath: storedReceipt.pagePath,
      placement: storedReceipt.placement,
      deliveryMode: delivery.mode
    })
  };
}

exports.buildMailchimpConfig = buildMailchimpConfig;
exports.buildListmonkConfig = buildListmonkConfig;
exports.requestMailchimpJson = requestMailchimpJson;
exports.requestListmonkJson = requestListmonkJson;
exports.submitToListmonk = submitToListmonk;
exports.submitToMailchimp = submitToMailchimp;
exports.handleGuestEmailCapture = handleGuestEmailCapture;
exports.handler = handleGuestEmailCapture;
