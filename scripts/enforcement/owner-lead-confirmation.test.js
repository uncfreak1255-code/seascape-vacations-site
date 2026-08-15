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
  handler
} = require("../../netlify/functions/submission-created");
const { OWNER_LEAD_CONTACTS_KEY } = require("../../netlify/functions/_owner-lead-contacts");

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
}

function setGraphEnv(overrides = {}) {
  clearGraphEnv();
  Object.assign(process.env, GRAPH_ENV, overrides);
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

function ownerSubmitPayload(overrides = {}) {
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
      ...overrides
    }
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
  const response = await handler({
    httpMethod: "POST",
    body: JSON.stringify({ payload: ownerSubmitPayload() })
  });

  assert.equal(response.statusCode, 404);
  assert.equal(JSON.parse(response.body).reason, "event_only");
  clearGraphEnv();
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
  let contactBlob = null;
  let metricsBlob = null;
  const metricsStore = { async get() { return metricsBlob; }, async set(_k, v) { metricsBlob = v; } };
  const contactStore = {
    async get(key) { assert.equal(key, OWNER_LEAD_CONTACTS_KEY); return contactBlob; },
    async set(key, v) { assert.equal(key, OWNER_LEAD_CONTACTS_KEY); contactBlob = v; }
  };
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
  assert.equal(metricsBlob.includes("pat@example.com"), false);
});

test("submission-created does not send confirmation without email", async () => {
  let contactBlob = null;
  let metricsBlob = null;
  const metricsStore = { async get() { return metricsBlob; }, async set(_k, v) { metricsBlob = v; } };
  const contactStore = { async get() { return contactBlob; }, async set(_k, v) { contactBlob = v; } };
  const confirmations = [];

  await handleSubmissionCreated(
    {
      body: JSON.stringify({
        payload: ownerSubmitPayload({
          id: "no-email",
          email: "",
          name: "Phone Only",
          phone: "941-555-0199"
        })
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
  assert.equal(JSON.parse(contactBlob).contacts[0].phone, "941-555-0199");
  assert.equal(JSON.parse(contactBlob).contacts[0].email, "");
});

test("submission-created does not send confirmation for guest email_capture forms", async () => {
  let contactBlob = null;
  let metricsBlob = null;
  const metricsStore = { async get() { return metricsBlob; }, async set(_k, v) { metricsBlob = v; } };
  const contactStore = { async get() { return contactBlob; }, async set(_k, v) { contactBlob = v; } };
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
  assert.equal(contactBlob, null);
  assert.equal(metricsBlob, null);
});

test("submission-created does not re-send confirmation on webhook redelivery", async () => {
  let contactBlob = null;
  let metricsBlob = null;
  const metricsStore = { async get() { return metricsBlob; }, async set(_k, v) { metricsBlob = v; } };
  const contactStore = { async get() { return contactBlob; }, async set(_k, v) { contactBlob = v; } };
  const confirmations = [];
  const sendConfirmation = async (contact) => {
    confirmations.push(contact.submissionId);
    return { sent: true };
  };

  const event = {
    body: JSON.stringify({
      payload: {
        ...ownerSubmitPayload(),
        id: "submission-redeliver-mail"
      }
    })
  };
  await handleSubmissionCreated(event, undefined, metricsStore, contactStore, async () => {}, sendConfirmation);
  await handleSubmissionCreated(event, undefined, metricsStore, contactStore, async () => {}, sendConfirmation);

  assert.deepEqual(confirmations, ["submission-redeliver-mail"]);
});

test("submission-created retries confirmation after a failed delivery", async () => {
  let contactBlob = null;
  let metricsBlob = null;
  const metricsStore = { async get() { return metricsBlob; }, async set(_k, v) { metricsBlob = v; } };
  const contactStore = { async get() { return contactBlob; }, async set(_k, v) { contactBlob = v; } };
  const deliveryStates = [];
  let attempts = 0;

  const sendConfirmation = async (_contact, delivery) => {
    deliveryStates.push(delivery);
    attempts += 1;
    if (attempts === 1) {
      return { sent: false, ownerSent: false, internalSent: false, reason: "graph_send_failed:503" };
    }
    return { sent: true, ownerSent: true, internalSent: true, reason: "sent" };
  };

  const event = { body: JSON.stringify({ payload: ownerSubmitPayload({ id: "retry-mail" }) }) };
  await handleSubmissionCreated(event, undefined, metricsStore, contactStore, async () => {}, sendConfirmation);
  await handleSubmissionCreated(event, undefined, metricsStore, contactStore, async () => {}, sendConfirmation);

  assert.equal(attempts, 2);
  assert.deepEqual(deliveryStates, [
    { ownerSent: false, internalSent: false },
    { ownerSent: false, internalSent: false }
  ]);
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
  assert.match(envExample, /OWNER_LEAD_NOTIFY_WEBHOOK_URL=/);
  assert.doesNotMatch(envExample, /eyJ[A-Za-z0-9_-]{10,}/);
  assert.doesNotMatch(envExample, /MS_GRAPH_CLIENT_SECRET=(?!your_entra_app_client_secret$)[^\n]+/m);
});
