// Shared invented provider and intake records for owner-intelligence tests.
const { TRACKER_ID, FOLDER_ID, DRIVE_ID, HEADERS, digest, planImport, canonicalPermissions } = require('../owner-intelligence/mapping');
const { OWNER_LEAD_FORM_NAME } = require('../../netlify/functions/_owner-lead-metrics');
const now = "2026-10-08T16:00:00.000Z";
const contact = (overrides = {}) => ({
  submissionId: "synthetic-1", createdAt: "2026-06-01T12:00:00.000Z",
  sourceSubmissionIdVerified: true, sourceTimestampVerified: true,
  name: "Synthetic Owner", email: "owner@example.invalid", phone: "",
  propertyAddress: "Synthetic Property A", listingUrl: "",
  submitterAuthority: "owner_or_authorized_representative", whatFeelsOff: "Synthetic question",
  ...overrides
});
const reviews = { "synthetic-1": {
  genuineInquiry: true, ownerDirectPermissionConfirmed: true, reviewedBy: "Synthetic operator",
  reviewedAt: now, evidence: "Synthetic form permission evidence"
} };
const permissions = [TRACKER_ID, FOLDER_ID, DRIVE_ID].map((id) => ({
  id, permissions: [{ id: "synthetic-user", type: "user", role: "organizer", emailAddress: "synthetic@example.invalid" }]
}));
const accessHash = digest(canonicalPermissions(permissions));
const policy = {
  trackerId: TRACKER_ID, accessHash, approvedBy: "Sawyer", approvedAt: now,
  expiresAt: "2026-10-09T15:00:00.000Z", approvalEvidence: "Synthetic approval only",
  retentionReviewDays: 90, automaticDeletion: false, singleWriterId: "synthetic-writer",
  methodAcceptedBy: "Patrick", methodAcceptanceEvidence: "Synthetic method proof",
  permissionScope: "inbound_review_only"
};
const plan = (contacts = [contact()], rows = [HEADERS.slice(0, 16)], r = reviews) =>
  planImport({ contacts, rows, reviews: r, now });

function fakeProvider({ lostReply = false, sourceChanged = false, accessChanged = false, initialRows } = {}) {
  const env = { OWNER_LEAD_CONTACT_BLOBS_SITE_ID: "synthetic-site", OWNER_LEAD_CONTACT_BLOBS_TOKEN: "synthetic",
    OWNER_INTELLIGENCE_GOOGLE_ACCESS_TOKEN: "synthetic", OWNER_INTELLIGENCE_WRITER_ID: "synthetic-writer" };
  const data = { rows: structuredClone(initialRows || [HEADERS.slice(0, 16)]), writes: 0, netlifyReads: 0 };
  const fetchImpl = async (url, options = {}) => {
    let value;
    if (url.includes("/permissions")) {
      value = { permissions: permissions[0].permissions.map((p) => ({ ...p, role: accessChanged ? "reader" : p.role })) };
    } else if (url.includes("drive/v3/files/" + TRACKER_ID)) {
      value = { mimeType: "application/vnd.google-apps.spreadsheet", parents: [FOLDER_ID] };
    } else if (url.includes("drive/v3/files/" + FOLDER_ID)) {
      value = { parents: [DRIVE_ID], driveId: DRIVE_ID };
    } else if (url.includes("/sites/synthetic-site/forms")) {
      value = [{ id: "synthetic-form", name: OWNER_LEAD_FORM_NAME }];
    } else if (url.includes("/forms/synthetic-form/submissions")) {
      value = new URL(url).searchParams.get("page") === "1" ? [{ id: "synthetic-1", created_at: contact().createdAt, form_id: "synthetic-form",
        data: { name: "Synthetic Owner", email: "owner@example.invalid", property_address: "Synthetic Property A",
          submitter_authority: "owner_or_authorized_representative", what_feels_off: "Synthetic question" } }] : [];
      if (sourceChanged && value.length) value[0].data.name = "Changed synthetic owner";
    } else if (url.includes("/sites/synthetic-site")) {
      data.netlifyReads += 1;
      value = { id: "synthetic-site", custom_domain: "seascape-vacations.com",
        published_deploy: { id: "synthetic-deploy", context: "production" } };
    } else if (url.includes(":batchUpdate")) {
      data.writes += 1;
      for (const r of JSON.parse(options.body).requests) {
        for (let i = 0; i < r.updateCells.rows.length; i += 1) {
          data.rows[r.updateCells.range.startRowIndex + i] = r.updateCells.rows[i].values.map((v) => v.userEnteredValue.stringValue);
        }
      }
      if (lostReply) throw new Error("Synthetic lost response");
      value = {};
    } else if (url.includes("/values/")) value = { values: data.rows };
    else value = { sheets: [{ properties: { title: "Owner pipeline", sheetId: 1, gridProperties: { rowCount: 1000, columnCount: 40 } } }] };
    return { ok: true, json: async () => structuredClone(value) };
  };
  return { env, data, fetchImpl };
}

module.exports = { now, contact, reviews, permissions, accessHash, policy, plan, fakeProvider };
