const { connectLambda, getStore } = require("@netlify/blobs");
const { OWNER_LEAD_FORM_NAME } = require("./_owner-lead-metrics");

// Full owner-lead CONTACT capture lives in its own restricted store, kept
// strictly separate from the attribution metrics blob (owner_lead_metrics_v1.json)
// that the token-authed owner-lead-metrics / owner-lead-proof-label endpoints read.
// PII must never enter the metrics blob; contact records must never be served by
// the attribution summary.
const OWNER_LEAD_CONTACT_STORE_NAME = "seascape-owner-lead-contacts";
const OWNER_LEAD_CONTACTS_KEY = "owner_lead_contacts_v1.json";
const MAX_CONTACTS = 500;

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function readSubmissionPayload(rawPayload) {
  if (!rawPayload || typeof rawPayload !== "object") return {};
  return rawPayload.payload && typeof rawPayload.payload === "object"
    ? rawPayload.payload
    : rawPayload;
}

function getFormName(payload) {
  return normalizeText(
    payload.form_name || payload.formName || payload.form?.name || payload.name
  );
}

function getSubmissionId(payload) {
  const candidate = payload.id || payload.submission_id || payload.number || payload.created_at;
  return normalizeText(String(candidate || ""));
}

function getCreatedAt(payload) {
  return normalizeText(payload.created_at || payload.createdAt || new Date().toISOString());
}

function getEventName(data) {
  return normalizeText(data.event_name || data.eventName) || "owner_form_submit";
}

function buildOwnerLeadContact(rawPayload) {
  const payload = readSubmissionPayload(rawPayload);
  if (getFormName(payload) !== OWNER_LEAD_FORM_NAME) return null;

  const data = payload.data && typeof payload.data === "object" ? payload.data : {};

  // Only real submissions carry contact info. Funnel telemetry events
  // (owner_primary_cta_click / owner_form_start) must not create a contact record.
  if (getEventName(data) !== "owner_form_submit") return null;

  const submissionId = getSubmissionId(payload);
  if (!submissionId) return null;

  const name = normalizeText(data.name);
  const email = normalizeText(data.email);
  const phone = normalizeText(data.phone);

  // No way to follow up on a lead with zero contact handles -> nothing to store.
  if (!name && !email && !phone) return null;

  return {
    submissionId,
    createdAt: getCreatedAt(payload),
    name,
    email,
    phone,
    propertyAddress: normalizeText(data.property_address),
    listingUrl: normalizeText(data.listing_url),
    currentManager: normalizeText(data.current_manager),
    currentFeeQuote: normalizeText(data.current_fee_quote),
    whatFeelsOff: normalizeText(data.what_feels_off),
    sourcePageSlug:
      normalizeText(data.source_page_slug) ||
      normalizeText(data.page_slug) ||
      "property-management",
    market: normalizeText(data.market) || "florida-gulf-coast",
    leadType: normalizeText(data.lead_type) || OWNER_LEAD_FORM_NAME
  };
}

function emptyContacts() {
  return { totalContacts: 0, contacts: [], updatedAt: null };
}

function mergeOwnerLeadContacts(existing, contact) {
  const base = {
    ...emptyContacts(),
    ...(existing || {}),
    contacts: Array.isArray(existing && existing.contacts) ? [...existing.contacts] : []
  };

  if (!contact) {
    base.totalContacts = base.contacts.length;
    return base;
  }

  if (base.contacts.some((entry) => entry.submissionId === contact.submissionId)) {
    base.totalContacts = base.contacts.length;
    return base;
  }

  base.contacts.push(contact);
  base.contacts.sort((left, right) => String(left.createdAt).localeCompare(String(right.createdAt)));
  if (base.contacts.length > MAX_CONTACTS) {
    base.contacts = base.contacts.slice(-MAX_CONTACTS);
  }

  base.totalContacts = base.contacts.length;
  base.updatedAt = new Date().toISOString();
  return base;
}

function getOwnerLeadContactBlobsConfig() {
  const siteID = normalizeText(process.env.OWNER_LEAD_CONTACT_BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID);
  const token = normalizeText(process.env.OWNER_LEAD_CONTACT_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN);
  if (!siteID || !token) return null;

  return { name: OWNER_LEAD_CONTACT_STORE_NAME, siteID, token };
}

function parseStoredContacts(value) {
  if (!value) return null;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (_error) {
      return null;
    }
  }

  if (typeof value === "object") {
    return value;
  }

  return null;
}

async function readOwnerLeadContacts(store) {
  try {
    return parseStoredContacts(await store.get(OWNER_LEAD_CONTACTS_KEY, { type: "json" }));
  } catch (_error) {
    if (!store || typeof store.get !== "function") return null;
  }

  try {
    return parseStoredContacts(await store.get(OWNER_LEAD_CONTACTS_KEY, { type: "text" }));
  } catch (_error) {
    return null;
  }
}

async function writeOwnerLeadContacts(store, contacts) {
  await store.set(
    OWNER_LEAD_CONTACTS_KEY,
    JSON.stringify(contacts),
    { contentType: "application/json; charset=utf-8" }
  );
}

function resolveContactStore(event, injectedStore) {
  if (injectedStore && typeof injectedStore.get === "function" && typeof injectedStore.set === "function") {
    return injectedStore;
  }

  const explicitConfig = getOwnerLeadContactBlobsConfig();
  if (explicitConfig) {
    return getStore(explicitConfig);
  }

  connectLambda(event);
  return getStore(OWNER_LEAD_CONTACT_STORE_NAME);
}

module.exports = {
  OWNER_LEAD_CONTACT_STORE_NAME,
  OWNER_LEAD_CONTACTS_KEY,
  buildOwnerLeadContact,
  mergeOwnerLeadContacts,
  getOwnerLeadContactBlobsConfig,
  parseStoredContacts,
  readOwnerLeadContacts,
  writeOwnerLeadContacts,
  resolveContactStore
};
