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
    base.contacts = base.contacts.slice(base.contacts.length - MAX_CONTACTS);
    // A captured contact is irreplaceable: never let cap eviction drop the lead we
    // just added, even if its createdAt sorts older than the retained records.
    if (!base.contacts.some((entry) => entry.submissionId === contact.submissionId)) {
      base.contacts[0] = contact;
      base.contacts.sort((left, right) => String(left.createdAt).localeCompare(String(right.createdAt)));
    }
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

async function readOwnerLeadContactsWithEtag(store) {
  if (store && typeof store.getWithMetadata === "function") {
    try {
      const result = await store.getWithMetadata(OWNER_LEAD_CONTACTS_KEY, { type: "json" });
      if (!result) {
        return { contacts: null, etag: undefined, exists: false };
      }
      return {
        contacts: parseStoredContacts(result.data),
        etag: result.etag,
        exists: true
      };
    } catch (_error) {
      // Fall through for stores that only implement get/set.
    }
  }

  const contacts = await readOwnerLeadContacts(store);
  return {
    contacts,
    etag: undefined,
    exists: Boolean(contacts)
  };
}

// Conditional read/modify/write so overlapping captures cannot overwrite each other
// with a stale whole-blob snapshot.
async function mutateOwnerLeadContacts(store, mutator, { attempts = 5 } = {}) {
  if (!store || typeof store.set !== "function") {
    throw new Error("owner_lead_contact_store_unavailable");
  }

  let lastError = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const current = await readOwnerLeadContactsWithEtag(store);
    const next = mutator(current.contacts);
    const options = { contentType: "application/json; charset=utf-8" };
    if (current.etag) {
      options.onlyIfMatch = current.etag;
    } else if (!current.exists && typeof store.getWithMetadata === "function") {
      options.onlyIfNew = true;
    }

    try {
      const writeResult = await store.set(
        OWNER_LEAD_CONTACTS_KEY,
        JSON.stringify(next),
        options
      );
      if (writeResult && writeResult.modified === false) {
        lastError = new Error("owner_lead_contacts_write_conflict");
        continue;
      }
      return next;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("owner_lead_contacts_write_failed");
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

function readConfirmationStampFromContact(contact) {
  if (!contact || typeof contact !== "object") {
    return { ownerSent: false, internalSent: false };
  }
  return {
    ownerSent: contact.confirmationOwnerSent === true,
    internalSent: contact.confirmationInternalSent === true
  };
}

async function readOwnerLeadConfirmationStamp(store, submissionId) {
  const id = normalizeText(submissionId);
  if (!id) return { ownerSent: false, internalSent: false };
  const contacts = await readOwnerLeadContacts(store);
  const match = contacts && Array.isArray(contacts.contacts)
    ? contacts.contacts.find((entry) => entry && entry.submissionId === id)
    : null;
  return readConfirmationStampFromContact(match);
}

// Durable backup for Graph acceptance. Lives on the contact record that already
// persisted in this request, so a later delivery-blob write failure can still
// prove "mail already sent" on webhook retry without calling Graph again.
async function stampOwnerLeadConfirmationOnContact(store, submissionId, result) {
  const id = normalizeText(submissionId);
  if (!id || !result) {
    throw new Error("owner_lead_confirmation_stamp_invalid");
  }

  const ownerSent = result.ownerSent === true;
  const internalSent = result.internalSent === true;
  if (!ownerSent && !internalSent) {
    return { stamped: false, reason: "nothing_to_stamp" };
  }

  let stamped = false;
  await mutateOwnerLeadContacts(store, (existingContacts) => {
    const base = {
      ...emptyContacts(),
      ...(existingContacts || {}),
      contacts: Array.isArray(existingContacts && existingContacts.contacts)
        ? existingContacts.contacts.map((entry) => ({ ...entry }))
        : []
    };
    const index = base.contacts.findIndex((entry) => entry && entry.submissionId === id);
    if (index < 0) {
      return base;
    }

    const current = base.contacts[index];
    const nextOwnerSent = current.confirmationOwnerSent === true || ownerSent;
    const nextInternalSent = current.confirmationInternalSent === true || internalSent;
    base.contacts[index] = {
      ...current,
      confirmationOwnerSent: nextOwnerSent,
      confirmationInternalSent: nextInternalSent,
      confirmationUpdatedAt: new Date().toISOString()
    };
    base.totalContacts = base.contacts.length;
    base.updatedAt = new Date().toISOString();
    stamped = true;
    return base;
  });

  if (!stamped) {
    throw new Error("owner_lead_confirmation_stamp_missing_contact");
  }

  return {
    stamped: true,
    ownerSent: ownerSent,
    internalSent: internalSent
  };
}

module.exports = {
  OWNER_LEAD_CONTACT_STORE_NAME,
  OWNER_LEAD_CONTACTS_KEY,
  buildOwnerLeadContact,
  mergeOwnerLeadContacts,
  getOwnerLeadContactBlobsConfig,
  parseStoredContacts,
  readOwnerLeadContacts,
  readOwnerLeadContactsWithEtag,
  writeOwnerLeadContacts,
  mutateOwnerLeadContacts,
  resolveContactStore,
  readConfirmationStampFromContact,
  readOwnerLeadConfirmationStamp,
  stampOwnerLeadConfirmationOnContact
};
