"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { HEADERS, digest, timestamp, identity } = require("./mapping");
const { trackerHeaders } = require("./schema");
const { readPrivate } = require("./private-state");
const text = value => typeof value === "string" ? value.trim() : "";
const object = (value, keys) => value && typeof value === "object" && !Array.isArray(value) &&
  Object.keys(value).every(key => keys.includes(key));

function validateInquiry(value, now) {
  const invalid = () => { throw new Error("reviewed_inquiry_invalid_or_unreviewed"); };
  if (!timestamp(now) || !object(value, ["schemaVersion", "recordId", "source", "owner", "question", "review", "cameFrom", "cameFromEvidence"]) ||
      value.schemaVersion !== "reviewed-owner-inquiry/v1" ||
      !/^owner-opportunity:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.recordId || "") ||
      !object(value.source, ["kind", "namespace", "id", "receivedAt", "lastActivityAt", "evidence"]) ||
      !object(value.owner, ["name", "email", "phone", "property"]) ||
      !object(value.review, ["genuineInquiry", "ownerDirectPermissionConfirmed", "reviewedBy", "reviewedAt", "evidence"])) invalid();
  const { source, owner, review } = value;
  if (!["email", "manual"].includes(source.kind) ||
      ![source.namespace, source.id, source.evidence, owner.name, owner.property, value.question,
        review.reviewedBy, review.evidence].every(v => text(v) && v.length <= 5000) ||
      ![owner.email, owner.phone, value.cameFrom, value.cameFromEvidence]
        .every(v => v === undefined || (typeof v === "string" && v.length <= 5000)) ||
      !(text(owner.email) || text(owner.phone)) || review.genuineInquiry !== true ||
      review.ownerDirectPermissionConfirmed !== true ||
      ![source.receivedAt, source.lastActivityAt, review.reviewedAt].every(timestamp) ||
      Date.parse(source.receivedAt) > Date.parse(source.lastActivityAt) ||
      Date.parse(source.lastActivityAt) > Date.parse(review.reviewedAt) ||
      Date.parse(review.reviewedAt) > Date.parse(now) ||
      (text(value.cameFrom) && !text(value.cameFromEvidence))) invalid();
  return value;
}

function readReviewedSource(file, now = new Date().toISOString()) {
  const absolute = path.resolve(file);
  for (let current = absolute; ; current = path.dirname(current)) {
    if (fs.lstatSync(current).isSymbolicLink() || fs.existsSync(path.join(current, ".git"))) {
      throw new Error("reviewed_inquiry_path_unsafe");
    }
    if (path.dirname(current) === current) break;
  }
  if (fs.statSync(absolute).size > 65536 || (fs.statSync(path.dirname(absolute)).mode & 0o077) !== 0) {
    throw new Error("reviewed_inquiry_path_unsafe");
  }
  const inquiry = validateInquiry(readPrivate(path.dirname(absolute), path.basename(absolute)), now);
  return { kind: "reviewed-inquiry", inquiry, sourceHash: digest(inquiry) };
}

function requireInquiryApproval(policy, source) {
  if (source.kind === "reviewed-inquiry" && policy.inquiryHash !== source.sourceHash) {
    throw new Error("exact_inquiry_not_approved");
  }
}

function planReviewedInquiry({ source, rows, now }) {
  const inquiry = validateInquiry(source.inquiry, now);
  const original = (rows[0] || []).slice();
  while (original.length && !original.at(-1)) original.pop();
  trackerHeaders(original); // Validate every supported layout without its 16→26 upgrade.
  const ids = new Set();
  const identities = new Set();
  const eventRef = inquiry.source.namespace + ":" + inquiry.source.id;
  let sameEvent = false;
  for (const row of rows.slice(1)) {
    if (!row.some(Boolean)) continue;
    if (!text(row[0]) || ids.has(row[0])) throw new Error("tracker_record_ids_missing_or_duplicate");
    ids.add(row[0]);
    if (text(row[5]).startsWith(eventRef + " at ")) sameEvent = true;
    for (const key of identity(text(row[2]), text(row[3]))) identities.add(key);
  }
  const base = { append: [], held: [], alreadyImported: 0, snapshotHash: digest(rows), headers: original };
  if (ids.has(inquiry.recordId)) return { ...base, alreadyImported: 1 };
  const contact = [text(inquiry.owner.email) && "Email: " + text(inquiry.owner.email),
    text(inquiry.owner.phone) && "Phone: " + text(inquiry.owner.phone)].filter(Boolean).join("\n");
  const property = text(inquiry.owner.property);
  if (sameEvent || identity(contact, property).some(key => identities.has(key))) {
    return { ...base, held: [{ recordId: inquiry.recordId, reason: "possible_repeat_prospect" }] };
  }
  const headers = original.includes("Came from") ? original : [...original, "Came from"];
  const s = inquiry.source;
  const retention = new Date(Date.parse(s.lastActivityAt) + 90 * 86400000).toISOString().slice(0, 10);
  const values = Object.fromEntries(HEADERS.map(header => [header, ""]));
  Object.assign(values, {
    "Record ID": inquiry.recordId, "Owner / representative": text(inquiry.owner.name), Contact: contact,
    "Property / listing": property, "Ownership confirmation": "Owner self-report; ownership unverified",
    "Permission source / date": s.namespace + ":" + s.id + " at " + s.receivedAt + "; " + inquiry.review.evidence,
    "Primary question": text(inquiry.question),
    "Assessment / evidence link": [text(s.evidence), text(inquiry.cameFromEvidence)].filter(Boolean).join("\n"),
    "Retention review date": retention, "Source submission ID": s.namespace + ":" + s.id,
    "Source timestamp": s.receivedAt, "Last activity timestamp": s.lastActivityAt,
    "Verification status": "Genuine inquiry reviewed; ownership and fit unverified", "Ingested at": now,
    "Duplicate review": "No exact contact/property match; manual identity review still required",
    "Permission scope": "inbound_review_only; no marketing or delivery authority",
    "Retention status": "Review only; no automatic deletion", "Opportunity ID": inquiry.recordId,
    "Came from": text(inquiry.cameFrom),
  });
  // No assessment Stage, financial output, commercial milestone, reply state,
  // operator action, approval or delivery is inferred from an inquiry.
  return { ...base, headers, append: [headers.map(header => values[header] || "")] };
}

module.exports = { validateInquiry, readReviewedSource, requireInquiryApproval, planReviewedInquiry };
