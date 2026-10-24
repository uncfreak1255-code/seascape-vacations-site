"use strict";

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
const COMMERCIAL_HEADERS = [
  "Opportunity ID", "Commercial stage", "Commercial evidence", "Commercial updated at",
  "Reply state", "Reply cycle", "Latest inbound ref", "Latest inbound at",
  "Reply resolution evidence", "Reply resolved through", "Reply updated at"
];

function trackerHeaders(headers) {
  const used = headers.slice();
  while (used.length && !used.at(-1)) used.pop();
  const expanded = [...HEADERS, ...COMMERCIAL_HEADERS];
  const expected = used.length === expanded.length ? expanded : HEADERS;
  if (![16, HEADERS.length, expanded.length].includes(used.length) ||
      used.some((header, index) => header !== expected[index])) {
    throw new Error("tracker_schema_changed");
  }
  // Preserve the existing 16 -> 26 intake extension, never opt into commercial fields.
  return expected.slice();
}

function columnName(count) {
  let name = "";
  for (let value = count; value > 0; value = Math.floor((value - 1) / 26)) {
    name = String.fromCharCode(65 + (value - 1) % 26) + name;
  }
  return name;
}

module.exports = { HEADERS, COMMERCIAL_HEADERS, trackerHeaders, columnName };
