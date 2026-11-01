"use strict";
const { getStore } = require("@netlify/blobs");
const { OWNER_LEAD_CONTACT_STORE_NAME, OWNER_LEAD_CONTACTS_KEY, buildOwnerLeadContact } = require("../../netlify/functions/_owner-lead-contacts");
const { OWNER_LEAD_FORM_NAME, OWNER_LEAD_STORE_NAME, OWNER_LEAD_METRICS_KEY } = require("../../netlify/functions/_owner-lead-metrics");
const { digest } = require("./mapping");
const { required, request } = require("./provider-request");

async function readSource(env, fetchImpl, storeFactory = getStore) {
  const siteID = required(env, "OWNER_LEAD_CONTACT_BLOBS_SITE_ID");
  const token = required(env, "OWNER_LEAD_CONTACT_BLOBS_TOKEN");
  const site = await request("https://api.netlify.com/api/v1/sites/" + encodeURIComponent(siteID), token, {}, fetchImpl);
  if (site.id !== siteID || !["seascape-vacations.com", "www.seascape-vacations.com"].includes(site.custom_domain) ||
      !site.published_deploy?.id || site.published_deploy.context !== "production") {
    throw new Error("production_site_unverified");
  }
  let blob;
  try {
    const store = storeFactory({ name: OWNER_LEAD_CONTACT_STORE_NAME, siteID, token, consistency: "strong" });
    blob = await store.get(OWNER_LEAD_CONTACTS_KEY, { type: "json", consistency: "strong" });
  } catch (_error) { throw new Error("contact_store_read_failed"); }
  if (blob !== null && (!Array.isArray(blob.contacts) || blob.totalContacts !== blob.contacts.length)) {
    throw new Error("contact_store_invalid");
  }
  // Forms is the recovery source for evicted/legacy contacts. It preserves the
  // actual submission ID, original time and authority field the old blob omitted.
  const forms = await request("https://api.netlify.com/api/v1/sites/" + encodeURIComponent(siteID) + "/forms", token, {}, fetchImpl);
  if (!Array.isArray(forms)) throw new Error("forms_source_invalid");
  const matching = forms.filter((f) => f.name === OWNER_LEAD_FORM_NAME);
  if (matching.length !== 1 || !matching[0].id) throw new Error("owner_form_source_unverified");
  const contacts = new Map();
  for (const c of blob?.contacts || []) {
    if (!c?.submissionId || contacts.has(c.submissionId)) throw new Error("source_submission_ids_missing_or_duplicate");
    contacts.set(c.submissionId, c);
  }
  let formCount = 0;
  const formIds = new Set();
  const pages = new Set();
  for (let page = 1; page <= 100; page += 1) {
    const submissions = await request("https://api.netlify.com/api/v1/forms/" + encodeURIComponent(matching[0].id) +
      "/submissions?per_page=100&page=" + page, token, {}, fetchImpl);
    if (!Array.isArray(submissions)) throw new Error("forms_source_invalid");
    if (!submissions.length) break;
    const fingerprint = digest(submissions.map((s) => s.id));
    if (pages.has(fingerprint)) throw new Error("forms_pagination_repeated");
    pages.add(fingerprint);
    for (const s of submissions) {
      if (!s.id || !s.created_at || !s.data || (s.form_id && s.form_id !== matching[0].id)) {
        throw new Error("form_submission_invalid");
      }
      if (formIds.has(String(s.id))) throw new Error("forms_changed_during_pagination");
      formIds.add(String(s.id));
      formCount += 1;
      const contact = buildOwnerLeadContact({ ...s, form_name: OWNER_LEAD_FORM_NAME });
      if (contact) {
        // Recovery must not erase a proof marker retained in the private capture.
        contact.proofLabel = contact.proofLabel || contacts.get(contact.submissionId)?.proofLabel || "";
        contacts.set(contact.submissionId, contact);
      }
    }
    if (page === 100) throw new Error("forms_pagination_limit");
  }
  // The existing relabel endpoint updates only metrics receipts. Join its labels
  // into this private projection by ID; never copy contact fields into metrics.
  if (env.OWNER_LEAD_BLOBS_SITE_ID && env.OWNER_LEAD_BLOBS_SITE_ID !== siteID) {
    throw new Error("proof_labels_site_mismatch");
  }
  let metrics;
  try {
    const store = storeFactory({ name: OWNER_LEAD_STORE_NAME, siteID,
      token: env.OWNER_LEAD_BLOBS_TOKEN || token, consistency: "strong" });
    metrics = await store.get(OWNER_LEAD_METRICS_KEY, { type: "json", consistency: "strong" });
  } catch (_error) { throw new Error("proof_labels_read_failed"); }
  if (!metrics || !Array.isArray(metrics.receipts)) throw new Error("proof_labels_unavailable_or_invalid");
  for (const receipt of metrics.receipts) {
    if (!receipt || typeof receipt.submissionId !== "string" || !receipt.submissionId.trim() ||
        (receipt.proofLabel !== undefined && typeof receipt.proofLabel !== "string")) {
      throw new Error("proof_labels_unavailable_or_invalid");
    }
    const label = receipt.proofLabel?.trim();
    const contact = contacts.get(receipt.submissionId);
    if (label && contact) contact.proofLabel = contact.proofLabel || label;
  }
  const list = [...contacts.values()].sort((a, b) => a.submissionId.localeCompare(b.submissionId));
  return {
    contacts: list, sourceHash: digest(list), blobCount: blob?.contacts.length || 0,
    blobPresent: blob !== null, formCount, deployId: site.published_deploy.id,
    deployCommit: site.published_deploy.commit_ref || null
  };
}

module.exports = { readSource };
