const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { HEADERS, digest } = require('../owner-intelligence/mapping');
const { COMMERCIAL_HEADERS } = require('../owner-intelligence/schema');
const { validateInquiry, readReviewedSource, planReviewedInquiry } = require('../owner-intelligence/reviewed-inquiry');
const { applyPlan, main, readTracker, privateDirectory, savePrivate } = require('../owner-intelligence/sync');
const { now, policy: originalPolicy, fakeProvider } = require('./owner-intelligence-test-provider');

const recordId = 'owner-opportunity:11111111-1111-4111-8111-111111111111';
const inquiry = (reviewedAt = now) => ({
  schemaVersion: 'reviewed-owner-inquiry/v1', recordId,
  source: { kind: 'email', namespace: 'outlook:synthetic@example.invalid', id: 'synthetic-original-message',
    receivedAt: '2026-10-06T12:00:00Z', lastActivityAt: '2026-10-07T12:00:00Z', evidence: 'https://example.invalid/original' },
  owner: { name: 'Invented Owner', email: 'invented-owner@example.invalid', property: 'Invented Property A' },
  question: 'Invented management inquiry', cameFrom: '', cameFromEvidence: '',
  review: { genuineInquiry: true, ownerDirectPermissionConfirmed: true, reviewedBy: 'Synthetic operator',
    reviewedAt, evidence: 'Synthetic original-message review, not a financial assessment' },
});
const sourceFor = value => ({ kind: 'reviewed-inquiry', inquiry: value, sourceHash: digest(value) });
const policyFor = source => {
  const p = { ...originalPolicy, inquiryHash: source.sourceHash };
  delete p.methodAcceptedBy; delete p.methodAcceptanceEvidence;
  return p;
};
const trackerFor = f => ({ rows: structuredClone(f.data.rows),
  sheet: { sheetId: 1, gridProperties: { rowCount: 1000, columnCount: 40 } } });

test('reviewed inquiry stays unassessed and unattributed; its original activity determines retention', () => {
  const source = sourceFor(inquiry());
  const plan = planReviewedInquiry({ source, rows: [HEADERS.slice(0, 16)], now });
  assert.equal(plan.headers.length, 17); assert.equal(plan.headers[16], 'Came from');
  const row = plan.append[0];
  assert.equal(row[0], recordId); assert.equal(row[15], '2027-01-05');
  for (const index of [7, 8, 10, 11, 12, 13, 14, 16]) assert.equal(row[index], '');
  assert.match(row[5], /outlook:synthetic@example.invalid:synthetic-original-message/);
  assert.equal(row[0].includes('netlify'), false);
});

test('genuineness, permission, provenance and record-specific attribution cannot be invented', () => {
  for (const alter of [
    v => { v.review.genuineInquiry = false; }, v => { v.review.ownerDirectPermissionConfirmed = false; },
    v => { v.source.receivedAt = '2026-10-06T12:00:00'; }, v => { v.source.lastActivityAt = '2027-01-01T12:00:00Z'; },
    v => { v.source.id = ''; }, v => { v.source.evidence = ''; },
    v => { v.cameFrom = 'Gretter referral'; }, v => { v.stage = 'Signed'; },
    v => { v.commercialStage = 'Proposal'; }, v => { v.financialAssessment = 'Approved'; },
    v => { v.recordId = 'netlify-owner:invented-submission'; },
  ]) {
    const value = inquiry(); alter(value);
    assert.throws(() => validateInquiry(value, now), /invalid_or_unreviewed/);
  }
  const known = inquiry(); known.cameFrom = 'Gretter referral'; known.cameFromEvidence = 'Synthetic specific introduction';
  const knownPlan = planReviewedInquiry({ source: sourceFor(known), rows: [HEADERS], now });
  assert.equal(knownPlan.append[0].at(-1), 'Gretter referral');
  assert.match(knownPlan.append[0][9], /Synthetic specific introduction/);
  known.cameFrom = 'Unfamiliar source';
  assert.equal(planReviewedInquiry({ source: sourceFor(known), rows: [HEADERS], now }).append[0].at(-1), 'Unfamiliar source');
});

test('same original source event cannot become a second record after contact details change', () => {
  const value = inquiry(); const source = sourceFor(value);
  const first = planReviewedInquiry({ source, rows: [HEADERS.slice(0, 16)], now });
  value.recordId = 'owner-opportunity:22222222-2222-4222-8222-222222222222';
  value.owner.email = 'changed@example.invalid'; value.owner.property = 'Changed invented property';
  const repeat = planReviewedInquiry({ source: sourceFor(value), rows: [first.headers, ...first.append], now });
  assert.equal(repeat.append.length, 0); assert.equal(repeat.held[0].reason, 'possible_repeat_prospect');
});

test('a source-bearing 17-column grid remains readable without a 26-column minimum', async () => {
  const headers = [...HEADERS.slice(0, 16), 'Came from'];
  const f = fakeProvider({ initialRows: [headers] });
  const provider = async (url, options) => {
    const response = await f.fetchImpl(url, options); const value = await response.json();
    if (value.sheets) value.sheets[0].properties.gridProperties.columnCount = 17;
    return { ok: true, json: async () => value };
  };
  assert.deepEqual((await readTracker('synthetic', provider)).rows, [headers]);
});

test('all six existing layouts preserve operator cells, append once, and replay with zero further writes', async () => {
  for (const base of [HEADERS.slice(0, 16), HEADERS, [...HEADERS, ...COMMERCIAL_HEADERS]]) {
    for (const withSource of [false, true]) {
      const headers = withSource ? [...base, 'Came from'] : base;
      const operator = Array(headers.length).fill('');
      operator[0] = 'synthetic-existing'; operator[8] = 'Unfamiliar operator Stage'; operator[10] = 'Preserved operator action';
      if (withSource) operator[headers.length - 1] = 'Gretter referral';
      const f = fakeProvider({ initialRows: [headers, operator] });
      const source = sourceFor(inquiry()); const tracker = trackerFor(f);
      const plan = planReviewedInquiry({ source, rows: tracker.rows, now });
      const result = await applyPlan({ plan, tracker, source, policy: policyFor(source), env: f.env, now,
        fetchImpl: f.fetchImpl, sourceReader: async () => source });
      assert.equal(result.imported, 1); assert.equal(f.data.netlifyReads, 0); assert.equal(f.data.writes, 1);
      assert.deepEqual(f.data.rows[0], plan.headers); assert.deepEqual(f.data.rows[1], operator);
      for (const field of COMMERCIAL_HEADERS.filter(x => x !== 'Opportunity ID')) {
        const index = plan.headers.indexOf(field); if (index >= 0) assert.equal(f.data.rows[2][index], '');
      }
      const replay = planReviewedInquiry({ source, rows: f.data.rows, now });
      assert.equal(replay.alreadyImported, 1); assert.equal(replay.append.length, 0);
      await applyPlan({ plan: replay, tracker: trackerFor(f), source, policy: policyFor(source), env: f.env, now,
        fetchImpl: f.fetchImpl, sourceReader: async () => source });
      assert.equal(f.data.writes, 1); assert.deepEqual(f.data.rows[1], operator);
    }
  }
});

test('duplicates and unapproved or changed inputs cause no mutation, including no source-header write', async () => {
  for (const scenario of ['duplicate', 'missing_pin', 'source', 'tracker', 'access']) {
    const f = fakeProvider({ accessChanged: scenario === 'access' });
    const source = sourceFor(inquiry()); const tracker = trackerFor(f);
    if (scenario === 'duplicate') {
      const existing = planReviewedInquiry({ source, rows: tracker.rows, now }).append[0];
      existing[0] = 'synthetic-other-id'; f.data.rows = [[...HEADERS.slice(0, 16), 'Came from'], existing];
      tracker.rows = structuredClone(f.data.rows);
    }
    const plan = planReviewedInquiry({ source, rows: tracker.rows, now });
    const policy = policyFor(source); if (scenario === 'missing_pin') delete policy.inquiryHash;
    if (scenario === 'tracker') f.data.rows.push(['synthetic-concurrent']);
    const fresh = structuredClone(source); if (scenario === 'source') fresh.sourceHash = 'different';
    await assert.rejects(applyPlan({ plan, tracker, source, policy, env: f.env, now,
      fetchImpl: f.fetchImpl, sourceReader: async () => fresh }), /held|not_approved|changed_repreview/);
    assert.equal(f.data.writes, 0);
  }
});

test('lost response reconciles without another write; full readback catches an altered far-right operator cell', async () => {
  const source = sourceFor(inquiry());
  const f = fakeProvider({ lostReply: true });
  const tracker = trackerFor(f); const plan = planReviewedInquiry({ source, rows: tracker.rows, now });
  const run = (p, t, provider = f.fetchImpl) => applyPlan({ plan: p, tracker: t, source, policy: policyFor(source), env: f.env,
    now, fetchImpl: provider, sourceReader: async () => source });
  await assert.rejects(run(plan, tracker), /write_unconfirmed/);
  assert.equal(f.data.writes, 1);
  await run(planReviewedInquiry({ source, rows: f.data.rows, now }), trackerFor(f));
  assert.equal(f.data.writes, 1);
  const headers = [...HEADERS, ...COMMERCIAL_HEADERS, 'Came from'];
  const operator = Array(headers.length).fill(''); operator[0] = 'synthetic-existing'; operator[37] = 'Gretter referral';
  const g = fakeProvider({ initialRows: [headers, operator] });
  const gTracker = trackerFor(g); const gPlan = planReviewedInquiry({ source, rows: gTracker.rows, now });
  const corrupt = async (url, options) => {
    const response = await g.fetchImpl(url, options); const value = await response.json();
    if (g.data.writes && value.values?.[1]) value.values[1][37] = 'Altered operator source';
    return { ok: true, json: async () => value };
  };
  await assert.rejects(applyPlan({ plan: gPlan, tracker: gTracker, source, policy: policyFor(source), env: g.env,
    now, fetchImpl: corrupt, sourceReader: async () => source }), /readback_mismatch/);
});

test('private input inspection has no provider or runtime-state effects; insecure inputs fail', async () => {
  const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'synthetic-reviewed-'));
  fs.chmodSync(root, 0o700);
  const file = path.join(root, 'inquiry.json'); fs.writeFileSync(file, JSON.stringify(inquiry()), { mode: 0o600 });
  const runtime = path.join(root, 'absent-runtime');
  try {
    const result = await main(['--inspect-reviewed', file], { SEASCAPE_RUNTIME_HOME: runtime, OWNER_INTELLIGENCE_GOOGLE_AUTH: 'gws' });
    assert.equal(result.localInputValid, true); assert.equal(result.writesPerformed, false);
    assert.equal(result.liveAccessVerified, false); assert.equal(fs.existsSync(runtime), false);
    assert.equal(JSON.stringify(result).includes('Invented Owner'), false);
    fs.chmodSync(file, 0o644); assert.throws(() => readReviewedSource(file, now), /permissions/);
    fs.chmodSync(file, 0o600); const link = path.join(root, 'link.json'); fs.symlinkSync(file, link);
    assert.throws(() => readReviewedSource(link, now), /path_unsafe/);
    fs.mkdirSync(path.join(root, '.git')); assert.throws(() => readReviewedSource(file, now), /path_unsafe/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('actual reviewed preview/apply entrypoints use exact approval and reject an expired or changed preview', async () => {
  for (const scenario of ['success', 'expired', 'source_changed']) {
    const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'synthetic-reviewed-cli-'));
    fs.chmodSync(root, 0o700);
    const f = fakeProvider(); f.env.SEASCAPE_RUNTIME_HOME = path.join(root, 'runtime');
    const current = new Date().toISOString(); const value = inquiry(current); const source = sourceFor(value);
    const file = path.join(root, 'inquiry.json'); fs.writeFileSync(file, JSON.stringify(value), { mode: 0o600 });
    const directory = privateDirectory(f.env);
    savePrivate(directory, 'approved-policy.json', { ...policyFor(source), approvedAt: current,
      expiresAt: new Date(Date.parse(current) + 3600000).toISOString() });
    const originalFetch = global.fetch; global.fetch = f.fetchImpl;
    try {
      const preview = await main(['--preview-reviewed', file], f.env);
      assert.equal(preview.written, false); assert.equal(preview.importable, 1); assert.equal(f.data.writes, 0);
      if (scenario === 'expired') {
        const p = JSON.parse(fs.readFileSync(path.join(directory, 'reviewed-preview.json')));
        p.now = new Date(Date.now() - 3601000).toISOString(); savePrivate(directory, 'reviewed-preview.json', p);
      }
      if (scenario === 'source_changed') {
        value.question = 'Changed synthetic inquiry'; fs.writeFileSync(file, JSON.stringify(value));
      }
      if (scenario === 'success') {
        assert.equal((await main(['--apply-reviewed', file], f.env)).imported, 1);
        assert.equal(f.data.rows[0].length, 17); assert.equal(f.data.writes, 1);
      } else {
        await assert.rejects(main(['--apply-reviewed', file], f.env), /preview_stale|exact_inquiry_not_approved/);
        assert.equal(f.data.writes, 0);
      }
      assert.equal(fs.existsSync(path.join(directory, 'writer.lock')), false);
    } finally { global.fetch = originalFetch; fs.rmSync(root, { recursive: true, force: true }); }
  }
});
