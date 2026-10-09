#!/usr/bin/env node
"use strict";

// Private, operator-invoked adapter. No webhook, public endpoint, scheduler or sender.
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { getStore } = require("@netlify/blobs");
const {
  OWNER_LEAD_CONTACT_STORE_NAME, OWNER_LEAD_CONTACTS_KEY, buildOwnerLeadContact
} = require("../../netlify/functions/_owner-lead-contacts");
const { OWNER_LEAD_FORM_NAME } = require("../../netlify/functions/_owner-lead-metrics");
const {
  TRACKER_ID, FOLDER_ID, DRIVE_ID, TAB, HEADERS, digest,
  canonicalPermissions, requirePrivacy, planImport, timestamp
} = require("./mapping");

function required(env, key) {
  if (!env[key]) throw new Error("missing_" + key);
  return env[key];
}

async function request(url, token, options = {}, fetchImpl = fetch) {
  let response;
  try {
    response = await fetchImpl(url, {
      ...options, redirect: "error", signal: AbortSignal.timeout(30000),
      headers: { authorization: "Bearer " + token, "content-type": "application/json" }
    });
  } catch (_error) { throw new Error("private_api_transport_failed"); }
  if (!response.ok) throw new Error("private_api_http_" + response.status);
  try { return await response.json(); }
  catch (_error) { throw new Error("private_api_invalid_json"); }
}

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
      if (contact) contacts.set(contact.submissionId, contact);
    }
    if (page === 100) throw new Error("forms_pagination_limit");
  }
  const list = [...contacts.values()].sort((a, b) => a.submissionId.localeCompare(b.submissionId));
  return {
    contacts: list, sourceHash: digest(list), blobCount: blob?.contacts.length || 0,
    blobPresent: blob !== null, formCount, deployId: site.published_deploy.id,
    deployCommit: site.published_deploy.commit_ref || null
  };
}

async function readTracker(token, fetchImpl) {
  const metadata = await request("https://sheets.googleapis.com/v4/spreadsheets/" + TRACKER_ID +
    "?fields=sheets(properties)", token, {}, fetchImpl);
  const sheet = metadata.sheets?.find((s) => s.properties.title === TAB)?.properties;
  if (!sheet || sheet.gridProperties.columnCount < HEADERS.length || sheet.gridProperties.rowCount > 1900) {
    throw new Error("tracker_bounds_require_review");
  }
  const result = await request("https://sheets.googleapis.com/v4/spreadsheets/" + TRACKER_ID + "/values/" +
    encodeURIComponent("'" + TAB + "'!A1:Z" + sheet.gridProperties.rowCount) + "?valueRenderOption=FORMULA", token, {}, fetchImpl);
  if (!Array.isArray(result.values)) throw new Error("tracker_values_unavailable");
  return { rows: result.values, sheet };
}

function batchForPlan(plan, tracker) {
  if (tracker.rows.length + plan.append.length > tracker.sheet.gridProperties.rowCount) {
    throw new Error("tracker_capacity_requires_review");
  }
  const update = (startRowIndex, rows) => ({ updateCells: {
    range: { sheetId: tracker.sheet.sheetId, startRowIndex, endRowIndex: startRowIndex + rows.length,
      startColumnIndex: 0, endColumnIndex: HEADERS.length },
    rows: rows.map((row) => ({ values: row.map((value) => ({ userEnteredValue: { stringValue: value } })) })),
    fields: "userEnteredValue"
  } });
  return [update(0, [HEADERS]), ...(plan.append.length ? [update(tracker.rows.length, plan.append)] : [])];
}

async function applyPlan({ plan, tracker, source, policy, env, now, fetchImpl, storeFactory = getStore }) {
  const token = required(env, "OWNER_INTELLIGENCE_GOOGLE_ACCESS_TOKEN");
  const freshSource = await readSource(env, fetchImpl, storeFactory);
  const freshTracker = await readTracker(token, fetchImpl);
  const freshAccess = await readAccess(token, fetchImpl);
  requirePrivacy(policy, freshAccess.accessHash, now, env.OWNER_INTELLIGENCE_WRITER_ID);
  if (source.sourceHash !== freshSource.sourceHash || plan.snapshotHash !== digest(freshTracker.rows)) {
    throw new Error("source_or_tracker_changed_repreview_required");
  }
  const requests = batchForPlan(plan, freshTracker);
  try {
    // Do not retry an ambiguous write. Fixed ranges + source IDs make a subsequent
    // full reconciliation safe, but a new run must read the tracker first.
    await request("https://sheets.googleapis.com/v4/spreadsheets/" + TRACKER_ID + ":batchUpdate", token,
      { method: "POST", body: JSON.stringify({ requests }) }, fetchImpl);
  } catch (_error) { throw new Error("tracker_write_unconfirmed_reconcile_before_retry"); }
  const readback = await readTracker(token, fetchImpl);
  const expected = [...tracker.rows];
  expected[0] = HEADERS;
  expected.push(...plan.append);
  // Sheets omits trailing empty strings on reads.
  const canonical = (rows) => rows.map((r) => { const row = r.slice(); while (row.length && row.at(-1) === "") row.pop(); return row; });
  if (digest(canonical(readback.rows)) !== digest(canonical(expected))) {
    throw new Error("tracker_readback_mismatch_reconcile_before_retry");
  }
  return { imported: plan.append.length, held: plan.held.length, alreadyImported: plan.alreadyImported };
}

function privateDirectory(env) {
  const runtime = env.SEASCAPE_RUNTIME_HOME || path.join(os.homedir(), "Library", "Application Support", "seascape-ops");
  const directory = path.join(runtime, "state", "staging", "owner-intelligence");
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const real = fs.realpathSync(directory);
  for (let current = real; ; current = path.dirname(current)) {
    if (fs.existsSync(path.join(current, ".git"))) throw new Error("private_state_inside_repository");
    if (path.dirname(current) === current) break;
  }
  fs.chmodSync(real, 0o700);
  return real;
}

function savePrivate(directory, name, value) {
  const target = path.join(directory, name);
  // Atomic replacement; never follow an existing symlink to a permissive file.
  const temporary = path.join(directory, "." + name + "." + process.pid);
  const fd = fs.openSync(temporary, "wx", 0o600);
  try { fs.writeFileSync(fd, JSON.stringify(value, null, 2) + "\n"); }
  finally { fs.closeSync(fd); }
  fs.renameSync(temporary, target);
}

function readPrivate(directory, name) {
  const file = path.join(directory, name);
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0) {
    throw new Error("private_input_permissions_require_review");
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

async function main(argv = process.argv.slice(2), env = process.env) {
  const mode = argv[0] || "--preview";
  if (!["--inspect-access", "--inspect-source", "--preview", "--apply"].includes(mode) || argv.length > 1) {
    throw new Error("use_inspect_access_inspect_source_preview_or_apply");
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
    const token = required(env, "OWNER_INTELLIGENCE_GOOGLE_ACCESS_TOKEN");
    const access = await readAccess(token);
    savePrivate(directory, "access-review.json", { ...access, observedAt: now });
    if (mode === "--inspect-access") return { accessVerified: true, surfaceCount: access.surfaces.length };
    const policy = readPrivate(directory, "approved-policy.json");
    requirePrivacy(policy, access.accessHash, now, env.OWNER_INTELLIGENCE_WRITER_ID);
    const source = await readSource(env);
    const tracker = await readTracker(token);
    const reviewPath = path.join(directory, "inquiry-reviews.json");
    const reviews = fs.existsSync(reviewPath) ? readPrivate(directory, "inquiry-reviews.json") : {};
    const plan = planImport({ contacts: source.contacts, rows: tracker.rows, reviews, now });
    if (mode === "--preview") {
      savePrivate(directory, "preview.json", { now, accessHash: access.accessHash, source, plan });
      return { candidates: source.contacts.length, importable: plan.append.length, held: plan.held.length,
        alreadyImported: plan.alreadyImported, written: false };
    }
    const preview = readPrivate(directory, "preview.json");
    if (!timestamp(preview.now) || Date.parse(now) - Date.parse(preview.now) > 3600000 || Date.parse(preview.now) > Date.parse(now) ||
        preview.accessHash !== access.accessHash || preview.source.sourceHash !== source.sourceHash ||
        preview.plan.snapshotHash !== plan.snapshotHash ||
        digest(preview.plan.held) !== digest(plan.held) ||
        // Ignore only ingestion time in reviewed rows; source, disposition and permission must match.
        digest(preview.plan.append.map((r) => r.filter((_v, i) => i !== 22))) !==
          digest(plan.append.map((r) => r.filter((_v, i) => i !== 22)))) {
      throw new Error("preview_stale_or_changed");
    }
    const result = await applyPlan({ plan, tracker, source, policy, env, now, fetchImpl: fetch });
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

module.exports = { request, readAccess, readSource, readTracker, batchForPlan, applyPlan, privateDirectory, savePrivate };
