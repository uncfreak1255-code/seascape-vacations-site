const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  TRACKER_ID, FOLDER_ID, DRIVE_ID, HEADERS, digest, planImport,
  canonicalPermissions, requirePrivacy
} = require("../owner-intelligence/mapping");
const {
  request, readAccess, readSource, batchForPlan, applyPlan, privateDirectory, savePrivate
} = require("../owner-intelligence/sync");
const { buildOwnerLeadContact } = require("../../netlify/functions/_owner-lead-contacts");
const {
  OWNER_LEAD_FORM_NAME, OWNER_LEAD_STORE_NAME, OWNER_LEAD_METRICS_KEY,
  buildOwnerLeadReceipt, relabelOwnerLeadReceipts
} = require("../../netlify/functions/_owner-lead-metrics");
const emptyStores = ({ name }) => ({ get: async () => name === OWNER_LEAD_STORE_NAME ? { receipts: [] } : null });
const { now, contact, reviews, permissions, accessHash, policy, plan, fakeProvider } = require('./owner-intelligence-test-provider');

test("contact capture preserves raw authority, test marker and provenance; legacy fallback stays unverified", () => {
  const captured = buildOwnerLeadContact({ form_name: OWNER_LEAD_FORM_NAME, id: "synthetic-1", created_at: now,
    data: { email: "owner@example.invalid", submitter_authority: "owner_or_authorized_representative", proof_label: "synthetic" } });
  assert.equal(captured.submitterAuthority, "owner_or_authorized_representative");
  assert.equal(captured.proofLabel, "synthetic");
  assert.equal(captured.sourceSubmissionIdVerified, true);
  assert.equal(captured.sourceTimestampVerified, true);
  const legacy = buildOwnerLeadContact({ form_name: OWNER_LEAD_FORM_NAME, number: 9, data: { email: "owner@example.invalid" } });
  assert.equal(legacy.sourceSubmissionIdVerified, false);
  assert.equal(legacy.sourceTimestampVerified, false);
});

test("synthetic import preserves source time and permission; no clock, assessment, approval or delivery is invented", () => {
  const p = plan();
  assert.equal(p.append.length, 1);
  const row = p.append[0];
  assert.equal(row[0], "netlify-owner:synthetic-1");
  assert.equal(row[7], "");
  assert.equal(row[8], "Intake incomplete");
  assert.equal(row[13], "");
  assert.equal(row[14], "Pending; no outreach approval");
  assert.equal(row[17], contact().createdAt);
  assert.equal(row[20], contact().createdAt);
  assert.equal(row[15], "2026-08-30"); // Backfill does not renew retention.
  assert.match(row[5], /Synthetic form permission evidence/);
  const replay = plan([contact()], [HEADERS, ...p.append]);
  assert.equal(replay.append.length, 0);
  assert.equal(replay.alreadyImported, 1);
});

test("existing operator changes survive replay, with no qualification or overwrite", () => {
  const row = plan().append[0];
  row[8] = "Conversation";
  row[10] = "Operator next step";
  assert.deepEqual(plan([contact()], [HEADERS, row]).append, []);
  assert.equal(row[10], "Operator next step");
});

test("tests, missing/offsetless/future provenance and unreviewed permission are held", () => {
  for (const [override, expected] of [
    [{ proofLabel: "synthetic" }, "proof_or_test_submission"],
    [{ sourceSubmissionIdVerified: false }, "source_provenance_review_required"],
    [{ sourceTimestampVerified: false }, "source_provenance_review_required"],
    [{ createdAt: "2026-06-01T12:00:00" }, "source_provenance_review_required"],
    [{ createdAt: "2026-10-09T12:00:00Z" }, "source_provenance_review_required"],
    [{ email: "", phone: "" }, "incomplete_identity_or_property"]
  ]) {
    const p = plan([contact(override)]);
    assert.equal(p.append.length, 0);
    assert.equal(p.held[0].reason, expected);
  }
  assert.equal(plan([contact()], [HEADERS], {}).held[0].reason, "genuineness_and_permission_review_required");
});

test("same contact/property with a new submission ID is held; a different property remains a distinct opportunity", () => {
  const row = plan().append[0];
  const secondReview = { ...reviews, "synthetic-2": reviews["synthetic-1"] };
  const repeated = plan([contact({ submissionId: "synthetic-2", email: "OWNER@example.invalid",
    listingUrl: "https://example.invalid/property" })], [HEADERS, row], secondReview);
  assert.equal(repeated.held[0].reason, "possible_repeat_prospect");
  assert.equal(plan([contact({ submissionId: "synthetic-2", propertyAddress: "Synthetic Property B" })],
    [HEADERS, row], secondReview).append.length, 1);
});

test("duplicate source IDs, missing tracker IDs and schema drift fail closed", () => {
  assert.throws(() => plan([contact(), contact()]), /source_submission_ids/);
  assert.throws(() => plan([contact()], [HEADERS, ["", "Synthetic Owner"]]), /tracker_record_ids/);
  assert.throws(() => plan([contact()], [["Unexpected header"]]), /tracker_schema/);
  const row = plan().append[0];
  assert.throws(() => plan([contact()], [HEADERS, row, row]), /tracker_record_ids/);
});

test("access changes, public/group shares, stale policy and retention gaps cannot authorize a write", () => {
  assert.doesNotThrow(() => requirePrivacy(policy, accessHash, now, "synthetic-writer"));
  for (const patch of [{ accessHash: "different" }, { automaticDeletion: true },
    { approvedBy: "Other" }, { expiresAt: now }, { singleWriterId: "different" }, { permissionScope: "marketing" }]) {
    assert.throws(() => requirePrivacy({ ...policy, ...patch }, accessHash, now, "synthetic-writer"), /not_approved/);
  }
  assert.throws(() => canonicalPermissions(permissions.map((s) => ({ ...s, permissions: [{ type: "anyone" }] }))), /access_not_private/);
  assert.throws(() => canonicalPermissions(permissions.map((s) => ({ ...s, permissions: [{ type: "group" }] }))), /access_not_private/);
});

test("cell strings are literal, including spreadsheet formulas; fixed-range batches preserve operator rows", () => {
  const p = plan([contact({ name: '=IMPORTDATA("https://example.invalid")' })]);
  const requests = batchForPlan(p, { rows: [HEADERS.slice(0, 16)], sheet: { sheetId: 1, gridProperties: { rowCount: 1000 } } });
  assert.equal(requests[1].updateCells.rows[0].values[1].userEnteredValue.stringValue, '=IMPORTDATA("https://example.invalid")');
  assert.equal(requests[1].updateCells.range.startRowIndex, 1);
  assert.equal(requests[1].updateCells.fields, "userEnteredValue");
});

test("provider errors omit private bodies and refuse credential redirects", async () => {
  await assert.rejects(request("https://example.invalid", "synthetic", {}, async (_url, options) => {
    assert.equal(options.redirect, "error");
    return { ok: false, status: 403, text: async () => "private contact" };
  }), /^Error: private_api_http_403$/);
});


test("authenticated source recovery restores legacy evidence from canonical Forms without mistaking a missing blob for no inquiries", async () => {
  const f = fakeProvider();
  const source = await readSource(f.env, f.fetchImpl, emptyStores);
  assert.equal(source.blobPresent, false);
  assert.equal(source.formCount, 1);
  assert.equal(source.contacts[0].submitterAuthority, "owner_or_authorized_representative");
  assert.equal(source.contacts[0].sourceTimestampVerified, true);
  await assert.rejects(readSource(f.env, f.fetchImpl, () => ({ get: async () => { throw new Error("private body"); } })), /contact_store_read_failed/);
});

test("private staged artifacts cannot live in a repository, and have restrictive permissions", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "synthetic-owner-sync-"));
  try {
    const directory = privateDirectory({ SEASCAPE_RUNTIME_HOME: root });
    savePrivate(directory, "synthetic.json", { synthetic: true });
    assert.equal(fs.statSync(path.join(directory, "synthetic.json")).mode & 0o777, 0o600);
    assert.equal(fs.statSync(directory).mode & 0o777, 0o700);
    fs.mkdirSync(path.join(root, ".git"));
    assert.throws(() => privateDirectory({ SEASCAPE_RUNTIME_HOME: root }), /inside_repository/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("synthetic full integration writes once, confirms readback, then reconciles as a no-op", async () => {
  const f = fakeProvider();
  const storeFactory = emptyStores;
  const source = await readSource(f.env, f.fetchImpl, storeFactory);
  const p = plan(source.contacts, f.data.rows);
  const tracker = { rows: structuredClone(f.data.rows), sheet: { sheetId: 1, gridProperties: { rowCount: 1000 } } };
  const result = await applyPlan({ plan: p, tracker, source, policy, env: f.env, now, fetchImpl: f.fetchImpl, storeFactory });
  assert.equal(result.imported, 1);
  assert.equal(f.data.writes, 1);
  assert.equal(f.data.rows[1][17], contact().createdAt);
  assert.equal(plan(source.contacts, f.data.rows).append.length, 0);
});

test("lost write response never retries; next reconciliation finds the landed row instead of duplicating it", async () => {
  const f = fakeProvider({ lostReply: true });
  const storeFactory = emptyStores;
  const source = await readSource(f.env, f.fetchImpl, storeFactory);
  const p = plan(source.contacts, f.data.rows);
  const tracker = { rows: structuredClone(f.data.rows), sheet: { sheetId: 1, gridProperties: { rowCount: 1000 } } };
  await assert.rejects(applyPlan({ plan: p, tracker, source, policy, env: f.env, now, fetchImpl: f.fetchImpl, storeFactory }), /write_unconfirmed/);
  assert.equal(f.data.writes, 1);
  assert.equal(plan(source.contacts, f.data.rows).alreadyImported, 1);
  assert.equal(plan(source.contacts, f.data.rows).append.length, 0);
});

test("fresh access and tracker checks block mutations when approved evidence changes", async () => {
  for (const scenario of ["access", "tracker", "source"]) {
    const f = fakeProvider({ accessChanged: scenario === "access" });
    const storeFactory = emptyStores;
    const source = await readSource(f.env, f.fetchImpl, storeFactory);
    const p = plan(source.contacts, f.data.rows);
    const tracker = { rows: structuredClone(f.data.rows), sheet: { sheetId: 1, gridProperties: { rowCount: 1000 } } };
    if (scenario === "tracker") f.data.rows.push(["manual-record", "Synthetic manual owner"]);
    if (scenario === "source") source.sourceHash = "prior-source";
    await assert.rejects(applyPlan({ plan: p, tracker, source, policy, env: f.env, now, fetchImpl: f.fetchImpl, storeFactory }),
      /not_approved|changed_repreview/);
    assert.equal(f.data.writes, 0);
  }
});

test("fresh Drive metadata verifies all three access surfaces and refuses a changed parent", async () => {
  const f = fakeProvider();
  assert.equal((await readAccess("synthetic", f.fetchImpl)).accessHash, accessHash);
  await assert.rejects(readAccess("synthetic", async () => ({ ok: true, json: async () => ({ parents: [] }) })), /location_changed/);
});

test("post-hoc proof labels hold an otherwise reviewed genuine inquiry without writing PII into metrics", async () => {
  const f = fakeProvider();
  const receipt = buildOwnerLeadReceipt({ form_name: OWNER_LEAD_FORM_NAME, id: "synthetic-1", created_at: now,
    data: { email: "owner@example.invalid", name: "Synthetic Owner" } });
  const metrics = relabelOwnerLeadReceipts({ receipts: [receipt] }, ["synthetic-1"], "Live Smoke").metrics;
  const originalMetrics = structuredClone(metrics);
  const calls = [];
  const storeFactory = (config) => ({ get: async (key, options) => {
    calls.push({ config, key, options });
    return config.name === OWNER_LEAD_STORE_NAME ? structuredClone(metrics) : null;
  } });
  const source = await readSource(f.env, f.fetchImpl, storeFactory);
  const p = plan(source.contacts, f.data.rows);
  assert.equal(p.append.length, 0);
  assert.equal(p.held[0].reason, "proof_or_test_submission");
  assert.equal(source.contacts[0].proofLabel, "live-smoke");
  assert.equal(calls.find((c) => c.key === OWNER_LEAD_METRICS_KEY).options.consistency, "strong");
  assert.deepEqual(metrics, originalMetrics);
  assert.equal(JSON.stringify(metrics).includes("owner@example.invalid"), false);
});

test("proof labels added after preview invalidate the source hash before any tracker write", async () => {
  const f = fakeProvider();
  let metrics = { receipts: [buildOwnerLeadReceipt({ form_name: OWNER_LEAD_FORM_NAME,
    id: "synthetic-1", created_at: now, data: {} })] };
  const storeFactory = ({ name }) => ({ get: async () => name === OWNER_LEAD_STORE_NAME ? structuredClone(metrics) : null });
  const source = await readSource(f.env, f.fetchImpl, storeFactory);
  const p = plan(source.contacts, f.data.rows);
  assert.equal(p.append.length, 1);
  metrics = relabelOwnerLeadReceipts(metrics, ["synthetic-1"], "late-proof").metrics;
  await assert.rejects(applyPlan({ plan: p, source, policy, env: f.env, now, fetchImpl: f.fetchImpl, storeFactory,
    tracker: { rows: structuredClone(f.data.rows), sheet: { sheetId: 1, gridProperties: { rowCount: 1000 } } } }), /changed_repreview/);
  assert.equal(f.data.writes, 0);
});

test("Forms recovery preserves capture proof labels and unrelated receipt labels do not taint genuine inquiries", async () => {
  const f = fakeProvider();
  for (const captureLabel of ["captured-proof", ""]) {
    const source = await readSource(f.env, f.fetchImpl, ({ name }) => ({ get: async () =>
      name === OWNER_LEAD_STORE_NAME
        ? { receipts: [{ submissionId: "synthetic-other", proofLabel: "unrelated-proof" }] }
        : { totalContacts: 1, contacts: [contact({ proofLabel: captureLabel })] }
    }));
    assert.equal(source.contacts[0].proofLabel, captureLabel);
    assert.equal(plan(source.contacts, f.data.rows).append.length, captureLabel ? 0 : 1);
  }
});

test("unavailable or malformed proof-label receipts block reconciliation instead of silently treating tests as genuine", async () => {
  const f = fakeProvider();
  for (const value of [null, {}, { receipts: [null] }, { receipts: [{ submissionId: "synthetic-1", proofLabel: true }] }]) {
    await assert.rejects(readSource(f.env, f.fetchImpl, ({ name }) => ({ get: async () => name === OWNER_LEAD_STORE_NAME ? value : null })),
      /proof_labels_unavailable_or_invalid/);
  }
  await assert.rejects(readSource(f.env, f.fetchImpl, ({ name }) => ({ get: async () => {
    if (name === OWNER_LEAD_STORE_NAME) throw new Error("private provider body");
    return null;
  } })), /proof_labels_read_failed/);
});


test("extended commercial schema survives the full import and readback without changing existing operator cells", async () => {
  const { COMMERCIAL_HEADERS } = require("../owner-intelligence/schema");
  const f = fakeProvider();
  const headers = [...HEADERS, ...COMMERCIAL_HEADERS];
  const existing = Array(headers.length).fill("");
  existing[0] = "synthetic-existing";
  existing[26] = existing[0]; existing[27] = "Proposal"; existing[30] = "Open";
  f.data.rows = [headers, existing];
  const provider = async (url, options) => {
    const response = await f.fetchImpl(url, options);
    const value = await response.json();
    if (value.sheets) value.sheets[0].properties.gridProperties.columnCount = headers.length;
    return { ok: true, json: async () => value };
  };
  const source = await readSource(f.env, provider, emptyStores);
  const p = plan(source.contacts, f.data.rows);
  const tracker = { rows: structuredClone(f.data.rows), sheet: { sheetId: 1, gridProperties: { rowCount: 1000 } } };
  assert.equal((await applyPlan({ plan: p, tracker, source, policy, env: f.env, now, fetchImpl: provider, storeFactory: emptyStores })).imported, 1);
  assert.deepEqual(f.data.rows[0], headers);
  assert.deepEqual(f.data.rows[1], existing);
  assert.equal(f.data.rows[2][26], "netlify-owner:synthetic-1");
  assert.equal(f.data.rows[2][30], "");
  assert.equal(plan(source.contacts, f.data.rows).alreadyImported, 1);
});


test("source-bearing layouts preserve operator source and Stage through import, full readback and replay", async () => {
  const commercial = require('../owner-intelligence/schema').COMMERCIAL_HEADERS;
  for (const base of [HEADERS.slice(0, 16), HEADERS, [...HEADERS, ...commercial]]) {
    const headers = [...base, 'Came from'];
    const operator = Array(headers.length).fill('');
    operator[0] = 'synthetic-manual'; operator[8] = 'Operator assessment stage';
    operator[headers.length - 1] = 'Gretter referral';
    const f = fakeProvider({ initialRows: [headers, operator] });
    const source = await readSource(f.env, f.fetchImpl, emptyStores);
    const p = plan(source.contacts, f.data.rows);
    assert.equal(p.append[0].length, headers.length);
    assert.equal(p.append[0].at(-1), ''); // No attribution invented from missing evidence.
    const tracker = { rows: structuredClone(f.data.rows), sheet: { sheetId: 1, gridProperties: { rowCount: 1000 } } };
    await applyPlan({ plan: p, tracker, source, policy, env: f.env, now, fetchImpl: f.fetchImpl, storeFactory: emptyStores });
    assert.deepEqual(f.data.rows[0], headers);
    assert.deepEqual(f.data.rows[1], operator);
    assert.equal(plan(source.contacts, f.data.rows).alreadyImported, 1);
    assert.equal(plan(source.contacts, f.data.rows).append.length, 0);
  }
});
