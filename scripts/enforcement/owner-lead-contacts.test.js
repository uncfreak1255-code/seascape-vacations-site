const test = require("node:test");
const assert = require("node:assert/strict");

const {
  OWNER_LEAD_CONTACT_STORE_NAME,
  OWNER_LEAD_CONTACTS_KEY,
  buildOwnerLeadContact,
  mergeOwnerLeadContacts,
  getOwnerLeadContactBlobsConfig
} = require("../../netlify/functions/_owner-lead-contacts");
const { OWNER_LEAD_FORM_NAME } = require("../../netlify/functions/_owner-lead-metrics");
const { handleSubmissionCreated } = require("../../netlify/functions/submission-created");
const { buildNotificationContent, notifyOwnerLead } = require("../../netlify/functions/_owner-lead-notify");

const ownerSubmitPayload = (overrides = {}) => ({
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
    source_page_slug: "owner-fee-revenue-leak-benchmark-2026",
    market: "florida-gulf-coast",
    lead_type: "owner-revenue-teardown",
    ...overrides
  }
});

test("owner lead contact captures full contact details on an owner form submit", () => {
  const contact = buildOwnerLeadContact(ownerSubmitPayload());

  assert.equal(contact.submissionId, "submission-1");
  assert.equal(contact.createdAt, "2026-06-13T12:00:00.000Z");
  assert.equal(contact.name, "Pat Owner");
  assert.equal(contact.email, "pat@example.com");
  assert.equal(contact.phone, "941-555-0100");
  assert.equal(contact.propertyAddress, "12 Sarasota Key");
  assert.equal(contact.listingUrl, "https://airbnb.com/h/123");
  assert.equal(contact.currentManager, "Self-managed");
  assert.equal(contact.sourcePageSlug, "owner-fee-revenue-leak-benchmark-2026");
  assert.equal(contact.market, "florida-gulf-coast");
});

test("owner lead contact ignores non-owner forms", () => {
  assert.equal(
    buildOwnerLeadContact({ id: "x", form_name: "newsletter-signup", data: { email: "a@b.com" } }),
    null
  );
});

test("owner lead contact ignores non-submit funnel events (no PII for clicks/starts)", () => {
  assert.equal(
    buildOwnerLeadContact({
      id: "c1",
      form_name: OWNER_LEAD_FORM_NAME,
      data: { event_name: "owner_primary_cta_click", email: "a@b.com" }
    }),
    null
  );
});

test("owner lead contact ignores submits with no contact info", () => {
  assert.equal(
    buildOwnerLeadContact({
      id: "s1",
      form_name: OWNER_LEAD_FORM_NAME,
      data: { source_page_slug: "owner-fee-revenue-leak-benchmark-2026" }
    }),
    null
  );
});

test("owner lead contacts dedupe by submission id", () => {
  const contact = buildOwnerLeadContact(ownerSubmitPayload());
  const first = mergeOwnerLeadContacts(null, contact);
  const deduped = mergeOwnerLeadContacts(first, contact);

  assert.equal(first.contacts.length, 1);
  assert.equal(deduped.contacts.length, 1);
  assert.equal(deduped.totalContacts, 1);
});

test("submission-created writes full contact to the contact store and keeps PII out of the metrics store", async () => {
  let metricsBlob = null;
  let contactBlob = null;
  const metricsStore = { async get() { return metricsBlob; }, async set(_k, v) { metricsBlob = v; } };
  const contactStore = {
    async get(key) { assert.equal(key, OWNER_LEAD_CONTACTS_KEY); return contactBlob; },
    async set(key, v) { assert.equal(key, OWNER_LEAD_CONTACTS_KEY); contactBlob = v; }
  };
  const notifications = [];
  const notify = async (message) => { notifications.push(message); };

  const event = { body: JSON.stringify({ payload: ownerSubmitPayload() }) };
  const response = await handleSubmissionCreated(event, undefined, metricsStore, contactStore, notify);

  // The cross-repo metrics blob must NEVER carry PII.
  assert.equal(metricsBlob.includes("pat@example.com"), false);
  assert.equal(metricsBlob.includes("Pat Owner"), false);
  assert.equal(metricsBlob.includes("941-555-0100"), false);

  // The separate restricted contact store carries the full lead.
  const parsedContacts = JSON.parse(contactBlob);
  assert.equal(parsedContacts.contacts[0].submissionId, "submission-1");
  assert.equal(parsedContacts.contacts[0].email, "pat@example.com");
  assert.equal(parsedContacts.contacts[0].phone, "941-555-0100");

  // A notification fired for the captured lead.
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].stored, true);
  assert.equal(notifications[0].contact.email, "pat@example.com");
  assert.equal(response.statusCode, 200);
});

test("submission-created notifies with the raw lead when the contact store write fails", async () => {
  const metricsStore = { async get() { return null; }, async set() {} };
  const failingContactStore = {
    async get() { return null; },
    async set() { throw new Error("contact blob write failed"); }
  };
  const notifications = [];
  const notify = async (message) => { notifications.push(message); };

  const event = { body: JSON.stringify({ payload: ownerSubmitPayload({ id: "submission-x" }) }) };
  const response = await handleSubmissionCreated(event, undefined, metricsStore, failingContactStore, notify);

  // The lead must NOT be silently dropped on a persistence failure.
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].stored, false);
  assert.ok(notifications[0].rawPayload, "raw payload included so the lead still reaches a human");
  assert.equal(notifications[0].contact.email, "pat@example.com");
  assert.equal(response.statusCode, 200);
});

test("owner lead contact blobs config reads explicit fallback credentials", () => {
  process.env.OWNER_LEAD_CONTACT_BLOBS_SITE_ID = "site-123";
  process.env.OWNER_LEAD_CONTACT_BLOBS_TOKEN = "token-abc";

  assert.deepEqual(getOwnerLeadContactBlobsConfig(), {
    name: OWNER_LEAD_CONTACT_STORE_NAME,
    siteID: "site-123",
    token: "token-abc"
  });

  delete process.env.OWNER_LEAD_CONTACT_BLOBS_SITE_ID;
  delete process.env.OWNER_LEAD_CONTACT_BLOBS_TOKEN;
});

// Regression: metrics-store resolution must not be able to drop the lead.
// If the metrics store cannot be resolved, contact capture + notify must already
// have run, and the handler must degrade gracefully instead of throwing.
test("submission-created captures the lead and notifies even when the metrics store cannot be resolved", async () => {
  let contactBlob = null;
  const contactStore = { async get() { return contactBlob; }, async set(_k, v) { contactBlob = v; } };
  const invalidMetricsStore = {}; // no get/set -> resolveWritableStore falls through to connectLambda(event) and throws
  const notifications = [];
  const notify = async (message) => { notifications.push(message); };

  const event = { body: JSON.stringify({ payload: ownerSubmitPayload({ id: "submission-resolve-fail" }) }) };
  const response = await handleSubmissionCreated(event, undefined, invalidMetricsStore, contactStore, notify);

  assert.equal(JSON.parse(contactBlob).contacts[0].email, "pat@example.com");
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].stored, true);
  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).reason, "metrics_write_failed");
});

// Regression: Netlify form webhooks are at-least-once. A re-delivered submission
// must not produce a second "new lead" notification.
test("submission-created does not re-notify when an already-captured submission is re-delivered", async () => {
  let contactBlob = null;
  let metricsBlob = null;
  const contactStore = { async get() { return contactBlob; }, async set(_k, v) { contactBlob = v; } };
  const metricsStore = { async get() { return metricsBlob; }, async set(_k, v) { metricsBlob = v; } };
  const notifications = [];
  const notify = async (message) => { notifications.push(message); };

  const event = { body: JSON.stringify({ payload: ownerSubmitPayload({ id: "submission-redeliver" }) }) };
  await handleSubmissionCreated(event, undefined, metricsStore, contactStore, notify);
  await handleSubmissionCreated(event, undefined, metricsStore, contactStore, notify);

  assert.equal(JSON.parse(contactBlob).contacts.length, 1);
  assert.equal(notifications.length, 1);
});

// Regression: the freshly captured contact must never be evicted by the cap,
// even when its createdAt is older than the retained records.
test("merge never evicts the freshly captured contact even at the cap", () => {
  let metrics = null;
  for (let i = 0; i < 500; i++) {
    metrics = mergeOwnerLeadContacts(metrics, {
      submissionId: `old-${i}`,
      createdAt: `2027-01-01T00:00:${String(i % 60).padStart(2, "0")}.000Z`,
      email: `old${i}@example.com`
    });
  }
  const fresh = buildOwnerLeadContact({
    id: "REAL-NEW",
    created_at: "2026-06-13T12:00:00.000Z",
    form_name: OWNER_LEAD_FORM_NAME,
    data: { email: "reallead@example.com" }
  });
  const after = mergeOwnerLeadContacts(metrics, fresh);

  assert.equal(fresh.submissionId, "REAL-NEW");
  assert.ok(after.contacts.some((c) => c.submissionId === "REAL-NEW"), "fresh lead must survive eviction");
  assert.equal(after.contacts.length, 500);
});

// PII hygiene: the success notification must not leak contact details; the
// failure notification may carry recovery detail (the store has no copy then).
test("notification content omits PII on success and signals manual follow-up on failure", () => {
  const success = buildNotificationContent({ stored: true, submissionId: "s1", contact: { email: "pat@example.com" } });
  assert.equal(success.includes("pat@example.com"), false);

  const failure = buildNotificationContent({ stored: false, submissionId: "s1", contact: { email: "pat@example.com" }, error: "boom" });
  assert.equal(failure.toLowerCase().includes("manual"), true);
});

test("owner lead notify is a safe no-op when no webhook is configured", async () => {
  delete process.env.OWNER_LEAD_NOTIFY_WEBHOOK_URL;
  const result = await notifyOwnerLead({ stored: true, submissionId: "s1", contact: {} });
  assert.deepEqual(result, { notified: false, reason: "not_configured" });
});

test("notify webhook body omits PII on success and carries the lead only on failure", async () => {
  process.env.OWNER_LEAD_NOTIFY_WEBHOOK_URL = "https://example.test/hook";
  const originalFetch = global.fetch;
  const bodies = [];
  global.fetch = async (_url, options) => {
    bodies.push(JSON.parse(options.body));
    return { ok: true, status: 204 };
  };

  try {
    await notifyOwnerLead({ stored: true, submissionId: "s1", contact: { email: "pat@example.com", phone: "x" } });
    await notifyOwnerLead({ stored: false, submissionId: "s2", contact: { email: "fail@example.com" }, rawPayload: { a: 1 } });
  } finally {
    global.fetch = originalFetch;
    delete process.env.OWNER_LEAD_NOTIFY_WEBHOOK_URL;
  }

  assert.equal("contact" in bodies[0], false);
  assert.equal("rawPayload" in bodies[0], false);
  assert.equal(JSON.stringify(bodies[0]).includes("pat@example.com"), false);
  assert.equal(bodies[1].contact.email, "fail@example.com");
  assert.ok(bodies[1].rawPayload);
});
