"use strict";

const { createHash } = require("node:crypto");

const TRACKER_ID = "1Zs4I4ZqBbberw4fZnJPirnS44pHxvDfiLi7v89qev9s";
const FOLDER_ID = "1q1gsZ6UOxPtrnQvWB39d_evFp4NHc8LK";
const DRIVE_ID = "0ALwEazFmxQSoUk9PVA";
const TAB = "Owner pipeline";
const HEADERS = [
  "Record ID", "Owner / representative", "Contact", "Property / listing",
  "Ownership confirmation", "Permission source / date", "Primary question",
  "Complete intake / time zone", "Stage", "Assessment / evidence link",
  "Next action", "Action owner / due", "Disposition / reason",
  "Exact approval evidence", "Delivery status / time", "Retention review date",
  "Source submission ID", "Source timestamp", "Source page", "Source market",
  "Last activity timestamp", "Verification status", "Ingested at",
  "Duplicate review", "Permission scope", "Retention status"
];

function digest(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function timestamp(value) {
  return typeof value === "string" && /(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    Number.isFinite(Date.parse(value));
}

function canonicalPermissions(surfaces) {
  if (!Array.isArray(surfaces) || surfaces.length !== 3) throw new Error("access_unverified");
  return surfaces.map(({ id, permissions }) => {
    if (!Array.isArray(permissions) || !permissions.length) throw new Error("access_unverified");
    const entries = permissions.filter((p) => p.deleted !== true).map((p) => {
      if (p.type !== "user" || !p.id || !p.role || !p.emailAddress) {
        throw new Error("access_not_private_or_unverified");
      }
      return [p.id, p.type, p.role, p.emailAddress.toLowerCase()];
    }).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    if (!entries.length) throw new Error("access_unverified");
    return { id, permissions: entries };
  }).sort((a, b) => a.id.localeCompare(b.id));
}

function requirePrivacy(policy, accessHash, now, writerId) {
  if (!policy || policy.trackerId !== TRACKER_ID || policy.accessHash !== accessHash ||
      policy.approvedBy !== "Sawyer" || !timestamp(policy.approvedAt) ||
      !timestamp(policy.expiresAt) || Date.parse(policy.approvedAt) > Date.parse(now) ||
      Date.parse(policy.expiresAt) <= Date.parse(now) ||
      Date.parse(policy.expiresAt) - Date.parse(policy.approvedAt) > 86400000 ||
      !text(policy.approvalEvidence) || policy.retentionReviewDays !== 90 ||
      policy.automaticDeletion !== false || policy.singleWriterId !== writerId ||
      !text(writerId) || policy.methodAcceptedBy !== "Patrick" ||
      !text(policy.methodAcceptanceEvidence) || policy.permissionScope !== "inbound_review_only") {
    throw new Error("privacy_access_retention_method_or_writer_not_approved");
  }
}

function assertHeaders(headers) {
  const used = headers.slice();
  while (used.length && !used[used.length - 1]) used.pop();
  if (![16, HEADERS.length].includes(used.length) ||
      used.some((h, i) => h !== HEADERS[i])) throw new Error("tracker_schema_changed");
}

function identity(contact, property) {
  // Exact normalized handle + property only. Do not guess fuzzy property identities.
  const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.exec(contact)?.[0];
  const phone = /(?:^|\n)Phone: ([^\n]+)/.exec(contact)?.[1];
  const handles = [email && "email:" + email.toLowerCase(), phone && "phone:" + phone.replace(/\D/g, "")]
    .filter(Boolean);
  return text(property) ? property.split("\n").filter(text).flatMap((part) =>
    handles.map((h) => h + "|" + part.trim().toLowerCase().replace(/\s+/g, " "))) : [];
}

function planImport({ contacts, rows, reviews = {}, now }) {
  if (!Array.isArray(contacts) || !Array.isArray(rows) || !timestamp(now)) {
    throw new Error("invalid_source_or_tracker");
  }
  assertHeaders(rows[0] || []);
  const ids = new Set();
  const identities = new Set();
  for (const row of rows.slice(1)) {
    if (!row.some(Boolean)) continue;
    if (!text(row[0]) || ids.has(row[0])) throw new Error("tracker_record_ids_missing_or_duplicate");
    ids.add(row[0]);
    for (const key of identity(text(row[2]), text(row[3]))) identities.add(key);
  }
  const sourceIds = new Set();
  const append = [];
  const held = [];
  let alreadyImported = 0;
  for (const c of contacts) {
    const id = text(c?.submissionId);
    if (!id || sourceIds.has(id)) throw new Error("source_submission_ids_missing_or_duplicate");
    sourceIds.add(id);
    const recordId = "netlify-owner:" + id;
    if (ids.has(recordId)) { alreadyImported += 1; continue; }
    const review = reviews[id];
    let reason = "";
    const contact = [text(c.email) && "Email: " + text(c.email), text(c.phone) && "Phone: " + text(c.phone)].filter(Boolean).join("\n");
    const property = [text(c.propertyAddress), text(c.listingUrl)].filter(Boolean).join("\n");
    const keys = identity(contact, property);
    if (text(c.proofLabel)) reason = "proof_or_test_submission";
    else if (c.sourceSubmissionIdVerified !== true || c.sourceTimestampVerified !== true ||
      !timestamp(c.createdAt) || Date.parse(c.createdAt) > Date.parse(now)) reason = "source_provenance_review_required";
    else if (!contact || !property || !text(c.name)) reason = "incomplete_identity_or_property";
    else if (!review || review.genuineInquiry !== true || review.ownerDirectPermissionConfirmed !== true ||
      !text(review.reviewedBy) || !text(review.evidence) || !timestamp(review.reviewedAt) ||
      Date.parse(review.reviewedAt) > Date.parse(now)) reason = "genuineness_and_permission_review_required";
    else if (keys.some((key) => identities.has(key))) reason = "possible_repeat_prospect";
    if (reason) { held.push({ submissionId: id, reason }); continue; }
    const retention = new Date(Date.parse(c.createdAt) + 90 * 86400000).toISOString().slice(0, 10);
    append.push([
      recordId, text(c.name), contact, property,
      c.submitterAuthority === "owner_or_authorized_representative"
        ? "Owner/representative self-attestation; ownership unverified" : "Not captured; see permission review",
      "Owner-form inquiry " + id + " at " + c.createdAt + "; " + review.evidence,
      text(c.whatFeelsOff), "", "Intake incomplete", "",
      "Verify ownership and complete intake; property fit unassessed", "Sawyer / pending",
      "", "", "Pending; no outreach approval", retention,
      id, c.createdAt, text(c.sourcePageSlug), text(c.market), c.createdAt,
      "Genuine inquiry reviewed; ownership and fit unverified", now,
      "No exact contact/property match; manual identity review still required",
      "inbound_review_only; no marketing or delivery authority", "Review only; no automatic deletion"
    ]);
    ids.add(recordId);
    for (const key of keys) identities.add(key);
  }
  return { append, held, alreadyImported, snapshotHash: digest(rows) };
}

module.exports = {
  TRACKER_ID, FOLDER_ID, DRIVE_ID, TAB, HEADERS, digest, timestamp,
  canonicalPermissions, requirePrivacy, assertHeaders, planImport
};
