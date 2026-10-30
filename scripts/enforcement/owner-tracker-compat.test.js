const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { HEADERS, planImport } = require('../owner-intelligence/mapping');
const { COMMERCIAL_HEADERS, trackerHeaders } = require('../owner-intelligence/schema');
const { batchForPlan, readTracker, main } = require('../owner-intelligence/sync');
const { inspectWriter } = require('../owner-intelligence/writer-seat');

test('accepts exact legacy and extended schemas, rejecting unknown or reordered fields', () => {
  const extended = [...HEADERS, ...COMMERCIAL_HEADERS];
  for (const headers of [HEADERS.slice(0, 16), HEADERS, extended]) {
    assert.deepEqual(trackerHeaders([...headers, '', '']), headers.length === 16 ? HEADERS : headers);
  }
  assert.throws(() => trackerHeaders([...extended, 'Unexpected']), /tracker_schema_changed/);
  assert.throws(() => trackerHeaders([...HEADERS, ...COMMERCIAL_HEADERS.slice().reverse()]), /tracker_schema_changed/);
});

test('import and fixed-range batch preserve commercial columns and operator rows', () => {
  const headers = [...HEADERS, ...COMMERCIAL_HEADERS];
  const existing = Array(headers.length).fill('');
  existing[0] = 'netlify-owner:existing';
  existing[26] = existing[0]; existing[27] = 'Proposal'; existing[30] = 'Open';
  const rows = [headers, existing];
  const before = structuredClone(rows);
  const now = '2026-10-24T12:00:00Z';
  const contact = { submissionId: 'new', createdAt: now, sourceSubmissionIdVerified: true,
    sourceTimestampVerified: true, name: 'Synthetic', email: 'new@example.invalid',
    propertyAddress: 'Synthetic home' };
  const reviews = { new: { genuineInquiry: true, ownerDirectPermissionConfirmed: true,
    reviewedBy: 'Synthetic operator', reviewedAt: now, evidence: 'Synthetic permission' } };
  const plan = planImport({ rows, contacts: [contact], reviews, now });
  assert.equal(plan.append[0].length, headers.length);
  assert.equal(plan.append[0][26], 'netlify-owner:new');
  assert.equal(plan.append[0][27], ''); // Intake import does not assert commercial progress.
  assert.equal(plan.append[0][30], ''); // Unknown, never a false None/all-clear.
  const requests = batchForPlan(plan, { rows, sheet: { sheetId: 1, gridProperties: { rowCount: 10 } } });
  assert.equal(requests[0].updateCells.range.endColumnIndex, 37);
  assert.equal(requests[1].updateCells.range.startRowIndex, 2);
  assert.deepEqual(rows, before);
  const replay = planImport({ rows: [...rows, ...plan.append], contacts: [contact], reviews, now });
  assert.equal(replay.append.length, 0);
  assert.equal(replay.alreadyImported, 1);
});

test('read adapter reads all headers before selecting its bounded body width', async () => {
  const headers = [...HEADERS, ...COMMERCIAL_HEADERS];
  const urls = [];
  const fake = async url => {
    urls.push(decodeURIComponent(url));
    return { ok: true, json: async () => url.includes('/values/') ? { values: [headers] } :
      { sheets: [{ properties: { title: 'Owner pipeline', sheetId: 1,
        gridProperties: { rowCount: 10, columnCount: 40 } } }] } };
  };
  assert.deepEqual((await readTracker('synthetic', fake)).rows[0], headers);
  assert.ok(urls.some(url => url.includes('!1:1')));
  assert.ok(urls.some(url => url.includes('!A1:AK10')));
  headers.push('Unexpected');
  await assert.rejects(readTracker('synthetic', fake), /tracker_schema_changed/);
});

test('writer inspection is read-only, distinguishes mismatch and expiry, and exposes no credentials', async () => {
  const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'synthetic-seat-'));
  const env = { SEASCAPE_RUNTIME_HOME: root, OWNER_INTELLIGENCE_WRITER_ID: 'synthetic-seat',
    OWNER_INTELLIGENCE_GOOGLE_ACCESS_TOKEN: 'secret-synthetic-do-not-print' };
  const now = '2026-10-24T12:00:00Z';
  try {
    assert.equal(inspectWriter(env, now).status, 'policy_unavailable');
    assert.deepEqual(fs.readdirSync(root), []);
    const directory = path.join(root, 'state/staging/owner-intelligence');
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
    const file = path.join(directory, 'approved-policy.json');
    const policy = { trackerId: require('../owner-intelligence/mapping').TRACKER_ID,
      singleWriterId: 'synthetic-seat', approvedBy: 'Sawyer', approvedAt: now,
      expiresAt: '2026-10-25T11:00:00Z', approvalEvidence: 'private-reference' };
    fs.writeFileSync(file, JSON.stringify(policy), { mode: 0o600 });
    const before = fs.readFileSync(file, 'utf8');
    assert.equal(inspectWriter(env, now).status, 'local_binding_matches');
    assert.equal(inspectWriter({ ...env, OWNER_INTELLIGENCE_WRITER_ID: 'different' }, now).status, 'writer_mismatch');
    assert.equal(inspectWriter(env, policy.expiresAt).status, 'policy_expired_or_invalid');
    const result = await main(['--inspect-writer'], env);
    assert.equal(result.liveAccessVerified, false);
    assert.ok(!JSON.stringify(result).includes('secret-synthetic'));
    assert.ok(!JSON.stringify(result).includes('private-reference'));
    assert.equal(fs.readFileSync(file, 'utf8'), before);
    assert.deepEqual(fs.readdirSync(directory), ['approved-policy.json']);
    fs.chmodSync(file, 0o644);
    assert.equal(inspectWriter(env, now).status, 'private_policy_unreadable');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});


test('header expansion during a bounded body read is rejected instead of hiding commercial cells', async () => {
  for (const original of [HEADERS.slice(0, 16), HEADERS]) {
    const expanded = original.length === 16 ? HEADERS : [...HEADERS, ...COMMERCIAL_HEADERS];
    let headerReads = 0;
    const fake = async url => {
      const decoded = decodeURIComponent(url);
      let value;
      if (!url.includes('/values/')) value = { sheets: [{ properties: {
        title: 'Owner pipeline', sheetId: 1, gridProperties: { rowCount: 10, columnCount: 37 }
      } }] };
      else if (decoded.includes('!1:1')) value = { values: [++headerReads === 1 ? original : expanded] };
      else value = { values: [expanded.slice(0, HEADERS.length)] };
      return { ok: true, json: async () => value };
    };
    await assert.rejects(readTracker('synthetic', fake), /changed_repreview_required/);
  }
});


test('Came from is accepted only as an exact final column, preserving each existing layout', () => {
  for (const base of [HEADERS.slice(0, 16), HEADERS, [...HEADERS, ...COMMERCIAL_HEADERS]]) {
    const headers = [...base, 'Came from'];
    assert.deepEqual(trackerHeaders([...headers, '', '']), headers);
    assert.throws(() => trackerHeaders(['Came from', ...base]), /tracker_schema_changed/);
    assert.throws(() => trackerHeaders([...headers, 'Unexpected']), /tracker_schema_changed/);
  }
});
