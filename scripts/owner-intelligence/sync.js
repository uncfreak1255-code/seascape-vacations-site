#!/usr/bin/env node
"use strict";

// Private, operator-invoked adapter. No webhook, public endpoint, scheduler or sender.
const fs = require("node:fs");
const path = require("node:path");
const { getStore } = require("@netlify/blobs");
const {
  TRACKER_ID, FOLDER_ID, DRIVE_ID, TAB, digest,
  canonicalPermissions, requirePrivacy, planImport, timestamp
} = require("./mapping");

const { trackerHeaders, columnName } = require("./schema");
const { inspectWriter } = require("./writer-seat");
const { request } = require("./provider-request");
const { readSource } = require("./netlify-source");
const { privateDirectory, savePrivate, readPrivate } = require("./private-state");
const { googleToken } = require("./google-auth");
const { readReviewedSource, planReviewedInquiry, requireInquiryApproval } = require("./reviewed-inquiry");

async function readPermissions(id, token, fetchImpl) {
  const permissions = [];
  let pageToken = "";
  const seen = new Set();
  do {
    if (seen.has(pageToken)) throw new Error("permission_pagination_repeated");
    seen.add(pageToken);
    const url = new URL("https://www.googleapis.com/drive/v3/files/" + id + "/permissions");
    url.searchParams.set("supportsAllDrives", "true");
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("fields", "nextPageToken,permissions(id,type,role,emailAddress,deleted)");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const result = await request(url.href, token, {}, fetchImpl);
    if (!Array.isArray(result.permissions)) throw new Error("access_unverified");
    permissions.push(...result.permissions);
    pageToken = result.nextPageToken || "";
  } while (pageToken);
  return { id, permissions };
}

async function readAccess(token, fetchImpl) {
  const metadata = async (id) => request(
    "https://www.googleapis.com/drive/v3/files/" + id +
    "?supportsAllDrives=true&fields=id,parents,driveId,mimeType", token, {}, fetchImpl);
  const tracker = await metadata(TRACKER_ID);
  const folder = await metadata(FOLDER_ID);
  if (tracker.mimeType !== "application/vnd.google-apps.spreadsheet" ||
      tracker.parents?.length !== 1 || tracker.parents[0] !== FOLDER_ID ||
      folder.parents?.length !== 1 || folder.parents[0] !== DRIVE_ID || folder.driveId !== DRIVE_ID) {
    throw new Error("tracker_location_changed");
  }
  // Conservatively include managers and all parent membership, even if a limited
  // folder narrows access. No permission is changed by this adapter.
  const surfaces = [];
  for (const id of [TRACKER_ID, FOLDER_ID, DRIVE_ID]) {
    surfaces.push(await readPermissions(id, token, fetchImpl));
  }
  const canonical = canonicalPermissions(surfaces);
  return { surfaces: canonical, accessHash: digest(canonical) };
}

async function readTracker(token, fetchImpl) {
  const metadata = await request("https://sheets.googleapis.com/v4/spreadsheets/" + TRACKER_ID +
    "?fields=sheets(properties)", token, {}, fetchImpl);
  const sheet = metadata.sheets?.find((s) => s.properties.title === TAB)?.properties;
  if (!sheet || sheet.gridProperties.columnCount < 16 || sheet.gridProperties.rowCount > 1900) {
    throw new Error("tracker_bounds_require_review");
  }
  const base = "https://sheets.googleapis.com/v4/spreadsheets/" + TRACKER_ID + "/values/";
  // Inspect the complete header row: unknown columns must not be silently hidden.
  const readHeader = () => request(base + encodeURIComponent("'" + TAB + "'!1:1") +
    "?valueRenderOption=FORMULA", token, {}, fetchImpl);
  const normalizeHeader = (value) => {
    const row = (value || []).slice();
    while (row.length && !row.at(-1)) row.pop();
    return row;
  };
  const header = await readHeader();
  const headers = trackerHeaders(header.values?.[0] || []);
  if (sheet.gridProperties.columnCount < headers.length) throw new Error("tracker_bounds_require_review");
  const result = await request(base + encodeURIComponent("'" + TAB + "'!A1:" +
    columnName(headers.length) + sheet.gridProperties.rowCount) + "?valueRenderOption=FORMULA", token, {}, fetchImpl);
  if (!Array.isArray(result.values)) throw new Error("tracker_values_unavailable");
  const finalHeader = await readHeader();
  const observed = normalizeHeader(header.values?.[0]);
  if (digest(normalizeHeader(result.values[0])) !== digest(observed) ||
      digest(normalizeHeader(finalHeader.values?.[0])) !== digest(observed)) {
    throw new Error("source_or_tracker_changed_repreview_required");
  }
  return { rows: result.values, sheet };
}

function batchForPlan(plan, tracker) {
  const original = (tracker.rows[0] || []).slice();
  while (original.length && !original.at(-1)) original.pop();
  const headers = plan.headers || trackerHeaders(original);
  trackerHeaders(headers);
  if (plan.headers && (original.some((value, index) => headers[index] !== value) ||
      ![original.length, original.length + 1].includes(headers.length) ||
      (headers.length > original.length && headers.at(-1) !== "Came from"))) {
    throw new Error("tracker_schema_changed");
  }
  if (plan.append.some((row) => row.length !== headers.length)) throw new Error("tracker_plan_width_mismatch");
  if (tracker.sheet.gridProperties.columnCount < headers.length) throw new Error("tracker_bounds_require_review");
  if (tracker.rows.length + plan.append.length > tracker.sheet.gridProperties.rowCount) {
    throw new Error("tracker_capacity_requires_review");
  }
  const update = (startRowIndex, rows, startColumnIndex = 0) => ({ updateCells: {
    range: { sheetId: tracker.sheet.sheetId, startRowIndex, endRowIndex: startRowIndex + rows.length,
      startColumnIndex, endColumnIndex: startColumnIndex + rows[0].length },
    rows: rows.map((row) => ({ values: row.map((value) => ({ userEnteredValue: { stringValue: value } })) })),
    fields: "userEnteredValue"
  } });
  const headerUpdates = plan.headers
    ? (headers.length > original.length ? [update(0, [["Came from"]], original.length)] : [])
    : [update(0, [headers])];
  return [...headerUpdates, ...(plan.append.length ? [update(tracker.rows.length, plan.append)] : [])];
}

async function applyPlan({ plan, tracker, source, policy, env, now, fetchImpl, storeFactory = getStore,
  sourceReader = readSource, googleAccessToken }) {
  const token = googleAccessToken || await googleToken(env, { fetchImpl });
  const freshSource = await sourceReader(env, fetchImpl, storeFactory);
  const freshTracker = await readTracker(token, fetchImpl);
  const freshAccess = await readAccess(token, fetchImpl);
  requirePrivacy(policy, freshAccess.accessHash, now, env.OWNER_INTELLIGENCE_WRITER_ID);
  requireInquiryApproval(policy, freshSource);
  if (source.kind === "reviewed-inquiry" && plan.held.length) throw new Error("reviewed_inquiry_held");
  if (source.sourceHash !== freshSource.sourceHash || plan.snapshotHash !== digest(freshTracker.rows)) {
    throw new Error("source_or_tracker_changed_repreview_required");
  }
  const requests = batchForPlan(plan, freshTracker);
  try {
    // Do not retry an ambiguous write. Fixed ranges + source IDs make a subsequent
    // full reconciliation safe, but a new run must read the tracker first.
    if (requests.length) await request("https://sheets.googleapis.com/v4/spreadsheets/" + TRACKER_ID + ":batchUpdate", token,
      { method: "POST", body: JSON.stringify({ requests }) }, fetchImpl);
  } catch (_error) { throw new Error("tracker_write_unconfirmed_reconcile_before_retry"); }
  const readback = await readTracker(token, fetchImpl);
  const expected = [...tracker.rows];
  expected[0] = plan.headers || trackerHeaders(tracker.rows[0] || []);
  expected.push(...plan.append);
  // Sheets omits trailing empty strings on reads.
  const canonical = (rows) => rows.map((r) => { const row = r.slice(); while (row.length && row.at(-1) === "") row.pop(); return row; });
  if (digest(canonical(readback.rows)) !== digest(canonical(expected))) {
    throw new Error("tracker_readback_mismatch_reconcile_before_retry");
  }
  return { imported: plan.append.length, held: plan.held.length, alreadyImported: plan.alreadyImported };
}

async function main(argv = process.argv.slice(2), env = process.env) {
  const mode = argv[0] || "--preview";
  if (mode === "--inspect-writer" && argv.length === 1) return inspectWriter(env);
  const reviewed = ["--inspect-reviewed", "--preview-reviewed", "--apply-reviewed"].includes(mode);
  if (reviewed && (argv.length !== 2 || !argv[1])) throw new Error("reviewed_inquiry_file_required");
  if (mode === "--inspect-reviewed") {
    const source = readReviewedSource(argv[1]);
    return { localInputValid: true, inquiryHash: source.sourceHash, liveAccessVerified: false, writesPerformed: false };
  }
  if (!reviewed && (!["--inspect-access", "--inspect-source", "--preview", "--apply"].includes(mode) || argv.length > 1)) {
    throw new Error("use_inspect_preview_or_apply_mode");
  }
  const directory = privateDirectory(env);
  const lockPath = path.join(directory, "writer.lock");
  let lock;
  try { lock = fs.openSync(lockPath, "wx", 0o600); }
  catch (_error) { throw new Error("writer_lock_exists_operator_review_required"); }
  try {
    fs.writeFileSync(lock, String(process.pid));
    const now = new Date().toISOString();
    if (mode === "--inspect-source") {
      const source = await readSource(env);
      savePrivate(directory, "source-review.json", source);
      return { blobPresent: source.blobPresent, blobCount: source.blobCount, formCount: source.formCount,
        reconciledCandidates: source.contacts.length, sourceVerified: true };
    }
    const token = await googleToken(env);
    const access = await readAccess(token);
    savePrivate(directory, "access-review.json", { ...access, observedAt: now });
    if (mode === "--inspect-access") return { accessVerified: true, surfaceCount: access.surfaces.length };
    const policy = readPrivate(directory, "approved-policy.json");
    requirePrivacy(policy, access.accessHash, now, env.OWNER_INTELLIGENCE_WRITER_ID);
    const sourceReader = reviewed ? () => readReviewedSource(argv[1], now) : readSource;
    const source = await sourceReader(env);
    requireInquiryApproval(policy, source);
    const tracker = await readTracker(token);
    const reviewPath = path.join(directory, "inquiry-reviews.json");
    const reviews = fs.existsSync(reviewPath) ? readPrivate(directory, "inquiry-reviews.json") : {};
    const plan = reviewed ? planReviewedInquiry({ source, rows: tracker.rows, now })
      : planImport({ contacts: source.contacts, rows: tracker.rows, reviews, now });
    const previewName = reviewed ? "reviewed-preview.json" : "preview.json";
    if (["--preview", "--preview-reviewed"].includes(mode)) {
      savePrivate(directory, previewName, { now, accessHash: access.accessHash, source, plan });
      return { candidates: reviewed ? 1 : source.contacts.length, importable: plan.append.length, held: plan.held.length,
        alreadyImported: plan.alreadyImported, written: false };
    }
    const preview = readPrivate(directory, previewName);
    if (!timestamp(preview.now) || Date.parse(now) - Date.parse(preview.now) > 3600000 || Date.parse(preview.now) > Date.parse(now) ||
        preview.accessHash !== access.accessHash || preview.source.sourceHash !== source.sourceHash ||
        preview.plan.snapshotHash !== plan.snapshotHash ||
        digest(preview.plan.headers || []) !== digest(plan.headers || []) ||
        digest(preview.plan.held) !== digest(plan.held) ||
        // Ignore only ingestion time in reviewed rows; source, disposition and permission must match.
        digest(preview.plan.append.map((r) => r.filter((_v, i) => i !== 22))) !==
          digest(plan.append.map((r) => r.filter((_v, i) => i !== 22)))) {
      throw new Error("preview_stale_or_changed");
    }
    const result = await applyPlan({ plan, tracker, source, policy, env, now, fetchImpl: fetch,
      sourceReader, googleAccessToken: token });
    savePrivate(directory, "last-result.json", { now, ...result });
    return result;
  } finally {
    fs.closeSync(lock);
    fs.unlinkSync(lockPath);
  }
}

if (require.main === module) {
  main().then((result) => console.log(JSON.stringify(result))).catch((_error) => {
    // Provider bodies, exception text, paths and contact values never reach logs.
    const allowed = /^(missing_[A-Z_]+|[a-z_]+(?:_\d+)?)$/;
    const code = allowed.test(_error.message) ? _error.message : "private_sync_failed";
    console.error(JSON.stringify({ blocked: true, reason: code }));
    process.exitCode = 1;
  });
}

module.exports = { request, readAccess, readSource, readTracker, batchForPlan, applyPlan, privateDirectory, savePrivate, main };
