const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  getMsGraphMailConfig,
  missingGraphConfigReason,
  buildGraphSendMailPayload,
  sendMailViaGraph
} = require("../../netlify/functions/_owner-lead-mail");
const {
  isUsableOwnerEmail,
  buildOwnerConfirmationEmail,
  buildInternalOwnerLeadNotifyEmail,
  sendOwnerLeadConfirmationEmails
} = require("../../netlify/functions/_owner-lead-confirmation");
const { OWNER_LEAD_FORM_NAME } = require("../../netlify/functions/_owner-lead-metrics");
const {
  handleSubmissionCreated,
  handler,
  isPublicHttpInvocation,
  isNetlifySubmissionCreatedEvent,
  verifyAuthenticatedNetlifyFormDelivery
} = require("../../netlify/functions/submission-created");
const { signNetlifyWebhookJws } = require("../../netlify/functions/_netlify-jws");
const ownerLeadFormWebhook = require("../../netlify/functions/owner-lead-form-webhook");
const { OWNER_LEAD_CONTACTS_KEY } = require("../../netlify/functions/_owner-lead-contacts");
const {
  OWNER_LEAD_DELIVERY_KEY_PREFIX,
  buildOwnerLeadDeliveryKey,
  isRetryableConfirmationFailure
} = require("../../netlify/functions/_owner-lead-delivery");
const {
  assertOwnerLeadMailAllowed,
  buildRateBucketKey,
  hourBucket
} = require("../../netlify/functions/_owner-lead-abuse");

const GRAPH_ENV = {
  MS_GRAPH_TENANT_ID: "tenant-1",
  MS_GRAPH_CLIENT_ID: "client-1",
  MS_GRAPH_CLIENT_SECRET: "secret-1"
};

function clearGraphEnv() {
  delete process.env.MS_GRAPH_TENANT_ID;
  delete process.env.MS_GRAPH_CLIENT_ID;
  delete process.env.MS_GRAPH_CLIENT_SECRET;
  delete process.env.AZURE_TENANT_ID;
  delete process.env.AZURE_CLIENT_ID;
  delete process.env.AZURE_CLIENT_SECRET;
  delete process.env.OWNER_LEAD_MAIL_FROM;
  delete process.env.OWNER_LEAD_INTERNAL_NOTIFY_TO;
  delete process.env.OWNER_LEAD_MAIL_RATE_LIMIT_PER_EMAIL_HOUR;
  delete process.env.OWNER_LEAD_MAIL_RATE_LIMIT_GLOBAL_HOUR;
  delete process.env.OWNER_LEAD_FORM_WEBHOOK_SECRET;
}

function setGraphEnv(overrides = {}) {
  clearGraphEnv();
  Object.assign(process.env, GRAPH_ENV, overrides);
}

function setWebhookSecret(secret = "test-owner-lead-form-webhook-secret") {
  process.env.OWNER_LEAD_FORM_WEBHOOK_SECRET = secret;
  return secret;
}

function signedNetlifyFormEvent(bodyObject, overrides = {}) {
  const {
    signNetlifyWebhookJws
  } = require("../../netlify/functions/_netlify-jws");
  const secret = overrides.secret || process.env.OWNER_LEAD_FORM_WEBHOOK_SECRET || setWebhookSecret();
  const body = JSON.stringify(bodyObject);
  const headers = {
    "content-type": "application/json",
    "user-agent": "Netlify",
    "x-netlify-event": "submission-created",
    "x-webhook-signature": signNetlifyWebhookJws(body, secret),
    ...(overrides.headers || {})
  };
  return {
    httpMethod: "POST",
    headers,
    body,
    ...overrides.event
  };
}

function patchConsoleMethod(methodName) {
  const original = console[methodName];
  const calls = [];
  console[methodName] = (...args) => {
    calls.push(args);
  };
  return {
    calls,
    restore() {
      console[methodName] = original;
    }
  };
}

function createMemoryStore(initial = {}) {
  const values = new Map(Object.entries(initial));
  const etags = new Map();
  let etagCounter = 1;

  return {
    async get(key, options = {}) {
      if (!values.has(key)) return null;
      const value = values.get(key);
      if (options.type === "json") {
        return typeof value === "string" ? JSON.parse(value) : value;
      }
      return typeof value === "string" ? value : JSON.stringify(value);
    },
    async getWithMetadata(key, options = {}) {
      if (!values.has(key)) return null;
      const data = await this.get(key, options);
      return { data, etag: etags.get(key) };
    },
    async set(key, value, options = {}) {
      const exists = values.has(key);
      if (options.onlyIfNew && exists) {
        return { modified: false };
      }
      if (options.onlyIfMatch) {
        if (!exists || etags.get(key) !== options.onlyIfMatch) {
          return { modified: false };
        }
      }
      values.set(key, value);
      const etag = `etag-${etagCounter++}`;
      etags.set(key, etag);
      return { modified: true, etag };
    },
    _values: values
  };
}

function ownerContact(overrides = {}) {
  return {
    submissionId: "submission-1",
    createdAt: "2026-06-13T12:00:00.000Z",
    name: "Pat Owner",
    email: "pat@example.com",
    phone: "941-555-0100",
    propertyAddress: "12 Sarasota Key",
    listingUrl: "https://airbnb.com/h/123",
    currentManager: "Self-managed",
    whatFeelsOff: "Fees feel high",
    sourcePageSlug: "property-management",
    market: "florida-gulf-coast",
    leadType: OWNER_LEAD_FORM_NAME,
    ...overrides
  };
}

function ownerSubmitPayload(dataOverrides = {}, payloadOverrides = {}) {
  return {
    id: "submission-1",
    created_at: "2026-06-13T12:00:00.000Z",
    form_name: OWNER_LEAD_FORM_NAME,
    data: {
      name: "Pat Owner",
      email: "pat@example.com",
      phone: "941-555-0100",
      property_address: "12 Sarasota Key",
      listing_url: "https://airbnb.com/h/123",
      current_manager: "Self-managed",
      what_feels_off: "Fees feel high",
      source_page_slug: "property-management",
      market: "florida-gulf-coast",
      lead_type: "owner-revenue-teardown",
      event_name: "owner_form_submit",
      ...dataOverrides
    },
    ...payloadOverrides
  };
}

test("usable owner email gate accepts real addresses and rejects blanks", () => {
  assert.equal(isUsableOwnerEmail("pat@example.com"), true);
  assert.equal(isUsableOwnerEmail("  pat@example.com  "), true);
  assert.equal(isUsableOwnerEmail(""), false);
  assert.equal(isUsableOwnerEmail(null), false);
  assert.equal(isUsableOwnerEmail("not-an-email"), false);
  assert.equal(isUsableOwnerEmail("missing-domain@"), false);
});

test("graph mail config is null until all three credentials exist", () => {
  clearGraphEnv();
  assert.equal(getMsGraphMailConfig(process.env), null);
  assert.equal(missingGraphConfigReason(process.env), "missing_env:MS_GRAPH_TENANT_ID,MS_GRAPH_CLIENT_ID,MS_GRAPH_CLIENT_SECRET");

  setGraphEnv();
  assert.deepEqual(getMsGraphMailConfig(process.env), {
    tenantId: "tenant-1",
    clientId: "client-1",
    clientSecret: "secret-1",
    from: "info@seascape-vacations.com",
    internalTo: "info@seascape-vacations.com"
  });
  clearGraphEnv();
});

test("Graph sender and internal notify recipient cannot be widened by env overrides", () => {
  setGraphEnv({
    OWNER_LEAD_MAIL_FROM: "attacker@example.com",
    OWNER_LEAD_INTERNAL_NOTIFY_TO: "attacker@example.com"
  });

  assert.deepEqual(getMsGraphMailConfig(process.env), {
    tenantId: "tenant-1",
    clientId: "client-1",
    clientSecret: "secret-1",
    from: "info@seascape-vacations.com",
    internalTo: "info@seascape-vacations.com"
  });
  assert.equal(buildOwnerConfirmationEmail(ownerContact(), process.env).from, "info@seascape-vacations.com");
  assert.equal(buildInternalOwnerLeadNotifyEmail(ownerContact(), process.env).to, "info@seascape-vacations.com");
  clearGraphEnv();
});

test("public HTTP calls cannot reach the owner event handler", async () => {
  setGraphEnv();
  setWebhookSecret();
  const warningLogs = patchConsoleMethod("warn");
  try {
    const response = await handler({
      httpMethod: "POST",
      headers: {
        "user-agent": "Mozilla/5.0",
        "content-type": "application/json"
      },
      body: JSON.stringify({ payload: ownerSubmitPayload() })
    });

    assert.equal(response.statusCode, 404);
    assert.equal(JSON.parse(response.body).reason, "event_only");
    assert.equal(warningLogs.calls[0][0], "owner_lead_event_http_invocation_rejected");
  } finally {
    warningLogs.restore();
    clearGraphEnv();
  }
});

test("isPublicHttpInvocation requires verified Netlify JWS, not event-name header alone", () => {
  setWebhookSecret("unit-test-webhook-secret");
  const body = JSON.stringify({ payload: ownerSubmitPayload() });

  assert.equal(isPublicHttpInvocation({ body }), false);
  assert.equal(isPublicHttpInvocation({
    httpMethod: "POST",
    headers: {},
    body
  }), true);
  assert.equal(isPublicHttpInvocation({
    httpMethod: "POST",
    headers: { "x-netlify-event": "submission-created" },
    body
  }), true);
  assert.equal(isPublicHttpInvocation({
    httpMethod: "POST",
    headers: {
      "x-netlify-event": "submission-created",
      "x-webhook-signature": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy.sig"
    },
    body
  }), true);

  const signed = signedNetlifyFormEvent({ payload: ownerSubmitPayload() }, {
    secret: "unit-test-webhook-secret"
  });
  assert.equal(isPublicHttpInvocation(signed), false);
  assert.equal(verifyAuthenticatedNetlifyFormDelivery(signed).ok, true);
  assert.equal(isNetlifySubmissionCreatedEvent(signed), true);

  delete process.env.OWNER_LEAD_FORM_WEBHOOK_SECRET;
  assert.equal(isPublicHttpInvocation(signed), true);
  assert.equal(verifyAuthenticatedNetlifyFormDelivery(signed).reason, "missing_webhook_secret");
});

test("spoofed x-netlify-event without valid JWS never reaches confirmation", async () => {
  setGraphEnv();
  setWebhookSecret("spoof-reject-secret");
  const confirmations = [];
  const warningLogs = patchConsoleMethod("warn");

  try {
    const spoofed = {
      httpMethod: "POST",
      headers: {
        "content-type": "application/json",
        "x-netlify-event": "submission-created",
        "x-webhook-signature": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.signature"
      },
      body: JSON.stringify({ payload: ownerSubmitPayload({}, { id: "spoofed-event" }) })
    };

    assert.equal(isPublicHttpInvocation(spoofed), true);
    const response = await handler(spoofed);
    assert.equal(response.statusCode, 404);
    assert.equal(JSON.parse(response.body).reason, "event_only");
    assert.match(JSON.parse(response.body).authReason, /invalid_signature/);
    assert.equal(confirmations.length, 0);
    assert.equal(warningLogs.calls[0][0], "owner_lead_event_http_invocation_rejected");

    const webhookResponse = await ownerLeadFormWebhook.handler(spoofed);
    assert.equal(webhookResponse.statusCode, 404);
    assert.equal(JSON.parse(webhookResponse.body).reason, "event_only");
  } finally {
    warningLogs.restore();
    clearGraphEnv();
  }
});

test("valid signed Netlify submission-created event reaches confirmation", async () => {
  clearGraphEnv();
  const secret = setWebhookSecret("valid-signed-event-secret");
  const metricsStore = createMemoryStore();
  const contactStore = createMemoryStore();
  const confirmations = [];
  const warningLogs = patchConsoleMethod("warn");

  try {
    const platformEvent = signedNetlifyFormEvent(
      { payload: ownerSubmitPayload({}, { id: "platform-event-allowed" }) },
      { secret }
    );

    assert.equal(isPublicHttpInvocation(platformEvent), false);

    const guarded = await handler(signedNetlifyFormEvent(
      {
        payload: {
          id: "ignored-guest",
          form_name: "email_capture",
          data: { email: "guest@example.com" }
        }
      },
      { secret }
    ));
    assert.equal(guarded.statusCode, 200);
    assert.equal(JSON.parse(guarded.body).reason, "ignored_form");
    assert.equal(
      warningLogs.calls.some((args) => args[0] === "owner_lead_event_http_invocation_rejected"),
      false
    );

    const response = await handleSubmissionCreated(
      platformEvent,
      undefined,
      metricsStore,
      contactStore,
      async () => {},
      async (contact) => {
        confirmations.push(contact);
        return { sent: true, ownerSent: true, internalSent: true, reason: "sent" };
      }
    );

    assert.equal(response.statusCode, 200);
    assert.equal(confirmations.length, 1);
    assert.equal(confirmations[0].submissionId, "platform-event-allowed");
    assert.equal(confirmations[0].email, "pat@example.com");
  } finally {
    warningLogs.restore();
    clearGraphEnv();
  }
});

test("missing or forged Netlify JWS is rejected as event_only", async () => {
  setWebhookSecret("forge-check-secret");
  const body = JSON.stringify({ payload: ownerSubmitPayload({}, { id: "forged" }) });

  const missingSig = await handler({
    httpMethod: "POST",
    headers: { "x-netlify-event": "submission-created" },
    body
  });
  assert.equal(missingSig.statusCode, 404);
  assert.equal(JSON.parse(missingSig.body).authReason, "missing_signature");

  const wrongSecretBody = JSON.stringify({ payload: ownerSubmitPayload({}, { id: "wrong-secret" }) });
  const forged = await handler({
    httpMethod: "POST",
    headers: {
      "x-netlify-event": "submission-created",
      "x-webhook-signature": signNetlifyWebhookJws(wrongSecretBody, "not-the-site-secret")
    },
    body: wrongSecretBody
  });
  assert.equal(forged.statusCode, 404);
  assert.equal(JSON.parse(forged.body).authReason, "invalid_signature");

  delete process.env.OWNER_LEAD_FORM_WEBHOOK_SECRET;
  const missingSecret = await handler(signedNetlifyFormEvent(
    { payload: ownerSubmitPayload({}, { id: "no-env-secret" }) },
    { secret: "orphan-secret" }
  ));
  assert.equal(missingSecret.statusCode, 404);
  assert.equal(JSON.parse(missingSecret.body).authReason, "missing_webhook_secret");
});

test("owner confirmation copy matches the thank-you page promise", () => {
  clearGraphEnv();
  const message = buildOwnerConfirmationEmail(ownerContact());
  assert.equal(message.from, "info@seascape-vacations.com");
  assert.equal(message.to, "pat@example.com");
  assert.equal(message.replyTo, "info@seascape-vacations.com");
  assert.match(message.subject, /revenue review request/i);
  assert.match(message.text, /within 48 hours/);
  assert.match(message.text, /reply to this email/i);
  assert.doesNotMatch(message.text, /teardown|commission|switch managers|airbnb host message/i);

  const thankYou = fs.readFileSync(
    path.join(__dirname, "../../src/property-management/revenue-review-requested.njk"),
    "utf8"
  );
  assert.match(thankYou, /follow up within 48 hours/);
  assert.match(thankYou, /reply to the confirmation email/);
});

test("internal notify email carries lead detail for info@ and stays off public pages", () => {
  const message = buildInternalOwnerLeadNotifyEmail(ownerContact());
  assert.equal(message.to, "info@seascape-vacations.com");
  assert.match(message.text, /pat@example.com/);
  assert.match(message.text, /941-555-0100/);
  assert.match(message.text, /founder-gated/i);

  const thankYou = fs.readFileSync(
    path.join(__dirname, "../../src/property-management/revenue-review-requested.njk"),
    "utf8"
  );
  assert.equal(thankYou.includes("pat@example.com"), false);
  assert.equal(thankYou.includes("941-555-0100"), false);
});

test("sendMailViaGraph posts token then sendMail as info@", async () => {
  setGraphEnv();
  const calls = [];
  const fakeFetch = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method, body: options.body, headers: options.headers });
    if (String(url).includes("/oauth2/v2.0/token")) {
      return {
        ok: true,
        status: 200,
        async json() {
          return { access_token: "token-abc" };
        }
      };
    }
    return { ok: true, status: 202 };
  };

  const result = await sendMailViaGraph(
    {
      to: "pat@example.com",
      subject: "We got your Seascape revenue review request",
      text: "Thanks"
    },
    fakeFetch,
    process.env
  );

  assert.equal(result.sent, true);
  assert.equal(result.from, "info@seascape-vacations.com");
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /login\.microsoftonline\.com\/tenant-1\/oauth2\/v2\.0\/token/);
  assert.match(calls[1].url, /users\/info%40seascape-vacations\.com\/sendMail/);
  assert.equal(calls[1].headers.authorization, "Bearer token-abc");
  const payload = JSON.parse(calls[1].body);
  assert.equal(payload.message.toRecipients[0].emailAddress.address, "pat@example.com");
  assert.equal(payload.message.replyTo[0].emailAddress.address, "info@seascape-vacations.com");
  clearGraphEnv();
});

test("confirmation send is skipped when Graph env is missing (no fake success)", async () => {
  clearGraphEnv();
  const errorLogs = patchConsoleMethod("error");
  try {
    const result = await sendOwnerLeadConfirmationEmails(ownerContact(), async () => {
      throw new Error("fetch should not run");
    });
    assert.equal(result.sent, false);
    assert.match(result.reason, /missing_env/);
    assert.equal(errorLogs.calls[0][0], "owner_lead_confirmation_not_sent");
    assert.equal(isRetryableConfirmationFailure(result), false);
  } finally {
    errorLogs.restore();
  }
});

test("confirmation send is skipped without a usable email", async () => {
  setGraphEnv();
  const result = await sendOwnerLeadConfirmationEmails(ownerContact({ email: "" }), async () => {
    throw new Error("fetch should not run");
  });
  assert.deepEqual(result, { sent: false, reason: "missing_email" });
  clearGraphEnv();
});

test("confirmation send delivers owner ack then internal notify when Graph is configured", async () => {
  setGraphEnv();
  const sendBodies = [];
  const fakeFetch = async (url, options = {}) => {
    if (String(url).includes("/oauth2/v2.0/token")) {
      return {
        ok: true,
        status: 200,
        async json() {
          return { access_token: "token-abc" };
        }
      };
    }
    sendBodies.push(JSON.parse(options.body));
    return { ok: true, status: 202 };
  };

  const result = await sendOwnerLeadConfirmationEmails(ownerContact(), fakeFetch, process.env);
  assert.equal(result.sent, true);
  assert.equal(sendBodies.length, 2);
  assert.equal(sendBodies[0].message.toRecipients[0].emailAddress.address, "pat@example.com");
  assert.equal(sendBodies[1].message.toRecipients[0].emailAddress.address, "info@seascape-vacations.com");
  assert.match(sendBodies[0].message.body.content, /within 48 hours/);
  assert.match(sendBodies[1].message.body.content, /pat@example.com/);
  clearGraphEnv();
});

test("submission-created sends confirmation on valid owner submit with email", async () => {
  clearGraphEnv();
  const metricsStore = createMemoryStore();
  const contactStore = createMemoryStore();
  const confirmations = [];
  const notifications = [];

  const response = await handleSubmissionCreated(
    { body: JSON.stringify({ payload: ownerSubmitPayload() }) },
    undefined,
    metricsStore,
    contactStore,
    async (message) => { notifications.push(message); },
    async (contact) => {
      confirmations.push(contact);
      return { sent: true, reason: "sent" };
    }
  );

  assert.equal(response.statusCode, 200);
  assert.equal(confirmations.length, 1);
  assert.equal(confirmations[0].email, "pat@example.com");
  assert.equal(notifications.length, 1);
  const metricsBlob = await metricsStore.get(Object.keys(Object.fromEntries(metricsStore._values))[0]);
  assert.equal(JSON.stringify(metricsStore._values).includes("pat@example.com"), false);
  assert.ok(contactStore._values.has(buildOwnerLeadDeliveryKey("submission-1")));
  void metricsBlob;
});

test("submission-created does not send confirmation without email", async () => {
  const metricsStore = createMemoryStore();
  const contactStore = createMemoryStore();
  const confirmations = [];

  await handleSubmissionCreated(
    {
      body: JSON.stringify({
        payload: ownerSubmitPayload({
          email: "",
          name: "Phone Only",
          phone: "941-555-0199"
        }, { id: "no-email" })
      })
    },
    undefined,
    metricsStore,
    contactStore,
    async () => {},
    async (contact) => {
      confirmations.push(contact);
      return { sent: true };
    }
  );

  assert.equal(confirmations.length, 0);
  const contacts = await contactStore.get(OWNER_LEAD_CONTACTS_KEY, { type: "json" });
  assert.equal(contacts.contacts[0].phone, "941-555-0199");
  assert.equal(contacts.contacts[0].email, "");
});

test("submission-created does not send confirmation for guest email_capture forms", async () => {
  const metricsStore = createMemoryStore();
  const contactStore = createMemoryStore();
  const confirmations = [];

  const response = await handleSubmissionCreated(
    {
      body: JSON.stringify({
        payload: {
          id: "guest-1",
          form_name: "email_capture",
          data: { email: "guest@example.com", name: "Guest" }
        }
      })
    },
    undefined,
    metricsStore,
    contactStore,
    async () => {},
    async (contact) => {
      confirmations.push(contact);
      return { sent: true };
    }
  );

  assert.equal(JSON.parse(response.body).reason, "ignored_form");
  assert.equal(confirmations.length, 0);
  assert.equal(contactStore._values.size, 0);
  assert.equal(metricsStore._values.size, 0);
});

test("submission-created does not re-send confirmation on webhook redelivery", async () => {
  const metricsStore = createMemoryStore();
  const contactStore = createMemoryStore();
  const confirmations = [];
  const sendConfirmation = async (contact) => {
    confirmations.push(contact.submissionId);
    return { sent: true, ownerSent: true, internalSent: true };
  };

  const event = {
    body: JSON.stringify({
      payload: ownerSubmitPayload({}, { id: "submission-redeliver-mail" })
    })
  };
  await handleSubmissionCreated(event, undefined, metricsStore, contactStore, async () => {}, sendConfirmation);
  await handleSubmissionCreated(event, undefined, metricsStore, contactStore, async () => {}, sendConfirmation);

  assert.deepEqual(confirmations, ["submission-redeliver-mail"]);
});

test("submission-created returns 503 so Netlify retries a failed Graph delivery", async () => {
  const metricsStore = createMemoryStore();
  const contactStore = createMemoryStore();
  const deliveryStates = [];
  let attempts = 0;

  const sendConfirmation = async (_contact, delivery) => {
    deliveryStates.push(delivery);
    attempts += 1;
    if (attempts === 1) {
      return { sent: false, ownerSent: false, internalSent: false, reason: "graph_send_failed:429" };
    }
    return { sent: true, ownerSent: true, internalSent: true, reason: "sent" };
  };

  const event = {
    body: JSON.stringify({
      payload: ownerSubmitPayload({}, { id: "retry-mail" })
    })
  };
  const first = await handleSubmissionCreated(
    event,
    undefined,
    metricsStore,
    contactStore,
    async () => {},
    sendConfirmation
  );
  assert.equal(first.statusCode, 503);
  assert.equal(JSON.parse(first.body).confirmation.reason, "graph_send_failed:429");

  const second = await handleSubmissionCreated(
    event,
    undefined,
    metricsStore,
    contactStore,
    async () => {},
    sendConfirmation
  );
  assert.equal(second.statusCode, 200);
  assert.equal(attempts, 2);
  assert.equal(deliveryStates.length, 2);
  assert.equal(deliveryStates[0].ownerSent, false);
  assert.equal(deliveryStates[0].internalSent, false);
  assert.equal(deliveryStates[1].ownerSent, false);
  assert.equal(deliveryStates[1].internalSent, false);
});

test("submission-created does not send when contact capture fails", async () => {
  const metricsStore = createMemoryStore();
  const confirmations = [];
  const notifications = [];

  const response = await handleSubmissionCreated(
    { body: JSON.stringify({ payload: ownerSubmitPayload({}, { id: "capture-failed" }) }) },
    undefined,
    metricsStore,
    {
      async get() { throw new Error("contact store unavailable"); },
      async set() { throw new Error("should not write after failed read"); }
    },
    async (message) => { notifications.push(message); },
    async () => {
      confirmations.push(true);
      return { sent: true, ownerSent: true, internalSent: true };
    }
  );

  assert.equal(response.statusCode, 503);
  assert.equal(JSON.parse(response.body).confirmation.reason, "delivery_state_unavailable");
  assert.equal(confirmations.length, 0);
  assert.equal(notifications[0].type, "owner_lead_capture_failed");
});

test("submission-created keeps repairing after capture failure when delivery is already in flight", async () => {
  const metricsStore = createMemoryStore();
  const contactStore = createMemoryStore();
  const deliveryKey = buildOwnerLeadDeliveryKey("capture-fail-repair");
  await contactStore.set(
    deliveryKey,
    JSON.stringify({
      ownerSent: true,
      internalSent: false,
      ownerStatus: "sent",
      internalStatus: "pending",
      deliveryStatus: "sending",
      updatedAt: "2026-08-16T12:00:00.000Z"
    }),
    { contentType: "application/json; charset=utf-8" }
  );
  await contactStore.set(
    OWNER_LEAD_CONTACTS_KEY,
    JSON.stringify({
      totalContacts: 1,
      contacts: [{
        submissionId: "capture-fail-repair",
        email: "pat@example.com",
        confirmationOwnerSent: true,
        confirmationInternalSent: false
      }],
      updatedAt: "2026-08-16T12:00:00.000Z"
    }),
    { contentType: "application/json; charset=utf-8" }
  );

  const originalGetWithMetadata = contactStore.getWithMetadata.bind(contactStore);
  contactStore.getWithMetadata = async (key, options = {}) => {
    if (String(key) === OWNER_LEAD_CONTACTS_KEY) {
      throw new Error("contacts metadata unavailable");
    }
    return originalGetWithMetadata(key, options);
  };

  let sendCalls = 0;
  const response = await handleSubmissionCreated(
    { body: JSON.stringify({ payload: ownerSubmitPayload({}, { id: "capture-fail-repair" }) }) },
    undefined,
    metricsStore,
    contactStore,
    async () => {},
    async () => {
      sendCalls += 1;
      return { sent: true, ownerSent: true, internalSent: true };
    }
  );

  assert.equal(response.statusCode, 503);
  assert.equal(JSON.parse(response.body).confirmation.reason, "owner_sent_internal_failed");
  assert.equal(sendCalls, 0);

  const delivery = await contactStore.get(deliveryKey, { type: "json" });
  assert.equal(delivery.ownerSent, true);
  assert.equal(delivery.internalSent, false);
  assert.equal(delivery.deliveryStatus, "sending");
});

test("submission-created does not resend when delivery-state persistence fails after Graph acceptance", async () => {
  const metricsStore = createMemoryStore();
  const contactStore = createMemoryStore();
  const originalSet = contactStore.set.bind(contactStore);
  let deliveryWrites = 0;
  let failDeliveryWrites = true;
  contactStore.set = async (key, value, options) => {
    if (String(key).startsWith(OWNER_LEAD_DELIVERY_KEY_PREFIX)) {
      deliveryWrites += 1;
      // Claim write (first delivery key write) succeeds; post-send persist fails
      // until the webhook retry, matching production Blobs blips after Graph.
      if (failDeliveryWrites && deliveryWrites > 1) {
        throw new Error("delivery blob unavailable");
      }
    }
    return originalSet(key, value, options);
  };
  let sendCalls = 0;
  const sendConfirmation = async () => {
    sendCalls += 1;
    return { sent: true, ownerSent: true, internalSent: true, reason: "sent" };
  };
  const event = { body: JSON.stringify({ payload: ownerSubmitPayload({}, { id: "persist-fail" }) }) };
  const first = await handleSubmissionCreated(event, undefined, metricsStore, contactStore, async () => {}, sendConfirmation);

  assert.equal(first.statusCode, 503);
  assert.equal(JSON.parse(first.body).confirmation.reason, "delivery_state_write_failed");
  assert.equal(sendCalls, 1);

  const contactsAfterSend = await contactStore.get(OWNER_LEAD_CONTACTS_KEY, { type: "json" });
  assert.equal(contactsAfterSend.contacts[0].confirmationOwnerSent, true);
  assert.equal(contactsAfterSend.contacts[0].confirmationInternalSent, true);

  failDeliveryWrites = false;
  const second = await handleSubmissionCreated(event, undefined, metricsStore, contactStore, async () => {}, sendConfirmation);

  assert.equal(second.statusCode, 200);
  assert.equal(sendCalls, 1, "retry must not call Graph/send again");
  assert.equal(JSON.parse(second.body).confirmation, undefined);

  const delivery = await contactStore.get(buildOwnerLeadDeliveryKey("persist-fail"), { type: "json" });
  assert.equal(delivery.ownerSent, true);
  assert.equal(delivery.internalSent, true);
  assert.equal(delivery.deliveryStatus, "sent");
});

test("submission-created still skips resend when delivery persist and contact stamp both fail after Graph acceptance", async () => {
  const metricsStore = createMemoryStore();
  const contactStore = createMemoryStore();
  const originalSet = contactStore.set.bind(contactStore);
  let deliveryWrites = 0;
  contactStore.set = async (key, value, options) => {
    if (String(key).startsWith(OWNER_LEAD_DELIVERY_KEY_PREFIX)) {
      deliveryWrites += 1;
      if (deliveryWrites > 1) throw new Error("delivery blob unavailable");
      return originalSet(key, value, options);
    }
    if (String(key) === OWNER_LEAD_CONTACTS_KEY) {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      const stamped = Array.isArray(parsed && parsed.contacts)
        && parsed.contacts.some((entry) => entry && entry.confirmationOwnerSent === true);
      if (stamped) throw new Error("contact stamp unavailable");
    }
    return originalSet(key, value, options);
  };
  let sendCalls = 0;
  const sendConfirmation = async () => {
    sendCalls += 1;
    return { sent: true, ownerSent: true, internalSent: true, reason: "sent" };
  };
  const event = { body: JSON.stringify({ payload: ownerSubmitPayload({}, { id: "persist-and-stamp-fail" }) }) };
  const first = await handleSubmissionCreated(event, undefined, metricsStore, contactStore, async () => {}, sendConfirmation);
  const second = await handleSubmissionCreated(event, undefined, metricsStore, contactStore, async () => {}, sendConfirmation);

  assert.equal(first.statusCode, 503);
  assert.equal(JSON.parse(first.body).confirmation.reason, "delivery_state_write_failed");
  assert.equal(second.statusCode, 503);
  assert.equal(JSON.parse(second.body).confirmation.reason, "in_flight");
  assert.equal(sendCalls, 1, "even without a contact stamp, in_flight claim must block a second send");
});

test("submission-created retries when contact-stamp reads fail after an in-flight Graph accept", async () => {
  const metricsStore = createMemoryStore();
  const contactStore = createMemoryStore();
  const originalSet = contactStore.set.bind(contactStore);
  const originalGet = contactStore.get.bind(contactStore);
  let deliveryWrites = 0;
  let failStampReads = false;
  const etags = new Map();
  let etagCounter = 1000;

  contactStore.set = async (key, value, options = {}) => {
    if (String(key).startsWith(OWNER_LEAD_DELIVERY_KEY_PREFIX)) {
      deliveryWrites += 1;
      if (deliveryWrites > 1) throw new Error("delivery blob unavailable");
    }
    const exists = contactStore._values.has(key);
    if (options.onlyIfNew && exists) return { modified: false };
    if (options.onlyIfMatch && etags.get(key) !== options.onlyIfMatch) return { modified: false };
    contactStore._values.set(key, value);
    const etag = `etag-stamp-${etagCounter++}`;
    etags.set(key, etag);
    return { modified: true, etag };
  };
  // Stamp path uses plain get(). Capture/mutate keep working through a
  // getWithMetadata that does not call the throwing get().
  contactStore.get = async (key, options = {}) => {
    if (failStampReads && String(key) === OWNER_LEAD_CONTACTS_KEY) {
      throw new Error("contacts read unavailable");
    }
    return originalGet(key, options);
  };
  contactStore.getWithMetadata = async (key, options = {}) => {
    if (!contactStore._values.has(key)) return null;
    const raw = contactStore._values.get(key);
    const data = options.type === "json"
      ? (typeof raw === "string" ? JSON.parse(raw) : raw)
      : raw;
    return { data, etag: etags.get(key) };
  };

  let sendCalls = 0;
  const sendConfirmation = async () => {
    sendCalls += 1;
    return { sent: true, ownerSent: true, internalSent: true, reason: "sent" };
  };
  const event = { body: JSON.stringify({ payload: ownerSubmitPayload({}, { id: "stamp-read-fail" }) }) };
  const first = await handleSubmissionCreated(event, undefined, metricsStore, contactStore, async () => {}, sendConfirmation);
  assert.equal(first.statusCode, 503);
  assert.equal(JSON.parse(first.body).confirmation.reason, "delivery_state_write_failed");
  assert.equal(sendCalls, 1);

  failStampReads = true;
  const second = await handleSubmissionCreated(event, undefined, metricsStore, contactStore, async () => {}, sendConfirmation);
  assert.equal(second.statusCode, 503);
  assert.equal(JSON.parse(second.body).confirmation.reason, "confirmation_stamp_unavailable");
  assert.equal(sendCalls, 1, "stamp read failure must not resend");
});

test("overlapping contact writes keep both leads via conditional retry", async () => {
  const store = createMemoryStore();
  const { mutateOwnerLeadContacts, mergeOwnerLeadContacts, buildOwnerLeadContact } = require(
    "../../netlify/functions/_owner-lead-contacts"
  );

  const first = buildOwnerLeadContact(ownerSubmitPayload({}, { id: "lead-a" }));
  const second = buildOwnerLeadContact(
    ownerSubmitPayload({ email: "other@example.com" }, { id: "lead-b" })
  );

  let conflictInjected = false;
  const originalSet = store.set.bind(store);
  store.set = async (key, value, options = {}) => {
    if (!conflictInjected) {
      conflictInjected = true;
      await originalSet(key, JSON.stringify(mergeOwnerLeadContacts(null, second)), {});
      return { modified: false };
    }
    return originalSet(key, value, options);
  };

  await mutateOwnerLeadContacts(store, (existing) => mergeOwnerLeadContacts(existing, first));
  const stored = await store.get(OWNER_LEAD_CONTACTS_KEY, { type: "json" });
  assert.equal(stored.contacts.length, 2);
  assert.ok(stored.contacts.some((entry) => entry.submissionId === "lead-a"));
  assert.ok(stored.contacts.some((entry) => entry.submissionId === "lead-b"));
});

test("mail rate limit blocks repeated confirmation attempts for the same recipient", async () => {
  process.env.OWNER_LEAD_MAIL_RATE_LIMIT_PER_EMAIL_HOUR = "1";
  const store = createMemoryStore();
  const first = await assertOwnerLeadMailAllowed(store, "pat@example.com", process.env, {
    submissionId: "rate-1"
  });
  const second = await assertOwnerLeadMailAllowed(store, "pat@example.com", process.env, {
    submissionId: "rate-2"
  });
  const retrySameSubmission = await assertOwnerLeadMailAllowed(store, "pat@example.com", process.env, {
    submissionId: "rate-1"
  });

  assert.equal(first.allowed, true);
  assert.equal(second.allowed, false);
  assert.equal(second.reason, "rate_limited");
  assert.equal(retrySameSubmission.allowed, true);
  assert.equal(retrySameSubmission.reserved, true);
  assert.ok(store._values.has(buildRateBucketKey(hourBucket())));
  delete process.env.OWNER_LEAD_MAIL_RATE_LIMIT_PER_EMAIL_HOUR;
});

test("graph sendMail payload builder never embeds secrets", () => {
  const payload = buildGraphSendMailPayload({
    to: "pat@example.com",
    subject: "We got your Seascape revenue review request",
    text: "Thanks",
    replyTo: "info@seascape-vacations.com"
  });
  const serialized = JSON.stringify(payload);
  assert.equal(serialized.includes("secret"), false);
  assert.equal(serialized.includes("token"), false);
  assert.equal(payload.message.toRecipients[0].emailAddress.address, "pat@example.com");
});

test("env example documents Graph turn-on without embedding secrets", () => {
  const envExample = fs.readFileSync(path.join(__dirname, "../../.env.example"), "utf8");
  assert.match(envExample, /MS_GRAPH_TENANT_ID=your_entra_tenant_id/);
  assert.match(envExample, /MS_GRAPH_CLIENT_ID=your_entra_app_client_id/);
  assert.match(envExample, /MS_GRAPH_CLIENT_SECRET=your_entra_app_client_secret/);
  assert.match(envExample, /OWNER_LEAD_FORM_WEBHOOK_SECRET=your_long_random_shared_secret/);
  assert.match(envExample, /OWNER_LEAD_NOTIFY_WEBHOOK_URL=/);
  assert.doesNotMatch(envExample, /eyJ[A-Za-z0-9_-]{10,}/);
  assert.doesNotMatch(envExample, /MS_GRAPH_CLIENT_SECRET=(?!your_entra_app_client_secret$)[^\n]+/m);
});

test("submission-created retries when delivery-state reads are unavailable", async () => {
  clearGraphEnv();
  const metricsStore = createMemoryStore();
  const contactStore = createMemoryStore();
  const originalGetWithMetadata = contactStore.getWithMetadata.bind(contactStore);
  const originalGet = contactStore.get.bind(contactStore);
  contactStore.getWithMetadata = async (key, options = {}) => {
    if (String(key).startsWith(OWNER_LEAD_DELIVERY_KEY_PREFIX)) {
      throw new Error("delivery read unavailable");
    }
    return originalGetWithMetadata(key, options);
  };
  contactStore.get = async (key, options = {}) => {
    if (String(key).startsWith(OWNER_LEAD_DELIVERY_KEY_PREFIX)) {
      throw new Error("delivery read unavailable");
    }
    return originalGet(key, options);
  };
  let sendCalls = 0;
  const response = await handleSubmissionCreated(
    { body: JSON.stringify({ payload: ownerSubmitPayload({}, { id: "delivery-read-fail" }) }) },
    undefined,
    metricsStore,
    contactStore,
    async () => {},
    async () => {
      sendCalls += 1;
      return { sent: true, ownerSent: true, internalSent: true };
    }
  );
  assert.equal(response.statusCode, 503);
  assert.equal(JSON.parse(response.body).confirmation.reason, "delivery_state_unavailable");
  assert.equal(sendCalls, 0);
});

test("submission-created retries when the rate store is unavailable", async () => {
  clearGraphEnv();
  const metricsStore = createMemoryStore();
  const contactStore = createMemoryStore();
  const originalGetWithMetadata = contactStore.getWithMetadata.bind(contactStore);
  contactStore.getWithMetadata = async (key, options = {}) => {
    if (String(key).startsWith("owner_lead_mail_rate/bucket/")) {
      throw new Error("rate read unavailable");
    }
    return originalGetWithMetadata(key, options);
  };
  let sendCalls = 0;
  const response = await handleSubmissionCreated(
    { body: JSON.stringify({ payload: ownerSubmitPayload({}, { id: "rate-store-fail" }) }) },
    undefined,
    metricsStore,
    contactStore,
    async () => {},
    async () => {
      sendCalls += 1;
      return { sent: true, ownerSent: true, internalSent: true };
    }
  );
  assert.equal(response.statusCode, 503);
  assert.equal(JSON.parse(response.body).confirmation.reason, "rate_store_unavailable");
  assert.equal(sendCalls, 0);
});
