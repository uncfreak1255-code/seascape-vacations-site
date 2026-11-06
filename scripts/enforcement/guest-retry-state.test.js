const test = require('node:test');
const assert = require('node:assert/strict');
const { processGuestCaptureRetryRecord } = require('../../netlify/functions/guest-email-capture-retry');
const { CAPTURE_STATES } = require('../../netlify/functions/guest-email-capture');
const key = 'guest_capture_state_v1/retry/fixture.json';
function fixture(t, options = {}) {
  const prior = { ...process.env };
  process.env.MAILCHIMP_API_KEY = 'fixture-us6';
  process.env.MAILCHIMP_AUDIENCE_ID = 'fixture';
  delete process.env.MAILCHIMP_AUDIENCE_IDS;
  t.after(() => { for (const k of ['MAILCHIMP_API_KEY','MAILCHIMP_AUDIENCE_ID','MAILCHIMP_AUDIENCE_IDS']) {
    if (prior[k] === undefined) delete process.env[k]; else process.env[k] = prior[k];
  }});
  const values = new Map([[key, JSON.stringify({ state: CAPTURE_STATES.RETRY_QUEUED,
    queueId: 'fixture', audienceId: 'fixture', subscriberHash: 'fake', tags: ['guest-capture'], attempts: 1 })]]);
  const versions = new Map([[key, 1]]);
  const store = {
    async get(k) { return values.get(k) || null; },
    async getWithMetadata(k) { return values.has(k) ? { data: JSON.parse(values.get(k)), etag: String(versions.get(k)) } : null; },
    async set(k, v, opts = {}) {
      if (opts.onlyIfMatch && opts.onlyIfMatch !== String(versions.get(k))) return { modified: false };
      if (opts.onlyIfNew && values.has(k)) return { modified: false };
      values.set(k, v); versions.set(k, (versions.get(k) || 0) + 1);
      return { modified: true, etag: String(versions.get(k)) };
    },
    async delete(k) { if (options.deleteFails) throw new Error('delete unavailable'); values.delete(k); },
  };
  return { store, values, entry: { key, etag: '1' } };
}
const success = async () => ({ ok: true, status: 204, text: async () => '' });
test('concurrent retry workers claim one provider attempt before sending', async t => {
  const { store, entry } = fixture(t);
  let calls = 0;
  await Promise.all([1,2].map(() => processGuestCaptureRetryRecord(store, entry, async () => { calls++; return success(); })));
  assert.equal(calls, 1, 'same queued attempt must not reach Mailchimp twice');
});
test('successful tagging followed by failed queue cleanup never becomes a provider failure or repeats the send', async t => {
  const { store, entry, values } = fixture(t, { deleteFails: true });
  let calls = 0;
  const send = async () => { calls++; return success(); };
  await processGuestCaptureRetryRecord(store, entry, send).catch(() => {});
  await processGuestCaptureRetryRecord(store, entry, send).catch(() => {});
  assert.equal(calls, 1, 'durable tagged outcome must suppress replay after cleanup failure');
  assert.equal(JSON.parse(values.get('guest_capture_state_v1/tagged/fixture.json')).state, CAPTURE_STATES.TAGGED);
  assert.notEqual(JSON.parse(values.get(key)).reason, 'mailchimp_tags_sync_failed');
});

test('expired in-flight attempts freeze for attention without replay', async t => {
  const { store, entry, values } = fixture(t);
  const state = JSON.parse(values.get(key));
  await store.set(key, JSON.stringify({ ...state, state: 'retry_running', updatedAt: '2020-01-01T00:00:00Z' }));
  let calls = 0;
  const result = await processGuestCaptureRetryRecord(store, entry, async () => { calls++; return success(); });
  assert.equal(calls, 0);
  assert.equal(result.state, CAPTURE_STATES.MANUAL_ATTENTION);
  assert.equal(JSON.parse(values.get('guest_capture_state_v1/manual/fixture.json')).reason, 'retry_delivery_unknown');
});

test('missing conditional storage support stops before a provider call', async t => {
  const { store, entry } = fixture(t);
  delete store.getWithMetadata;
  let calls = 0;
  await assert.rejects(processGuestCaptureRetryRecord(store, entry, async () => { calls++; return success(); }), /missing_cas/);
  assert.equal(calls, 0);
});

test('request duplicates respect running, terminal, and archived retry outcomes', async t => {
  const { store } = fixture(t);
  const { handleGuestEmailCapture, buildGuestCaptureStateKey } = require('../../netlify/functions/guest-email-capture');
  const payload = { submissionId: 'test-duplicate', name: 'Test Guest', email: 'guest@example.test', pagePath: '/', placement: 'popup', createdAt: '2026-05-12T12:00:00Z' };
  const retryKey = buildGuestCaptureStateKey(payload.email, payload.submissionId);
  const event = { httpMethod: 'POST', headers: { origin: 'https://seascape-vacations.com' }, body: JSON.stringify(payload) };
  let calls = 0;
  for (const [state, expected] of [['retry_running', 202], [CAPTURE_STATES.TAGGED, 200], [CAPTURE_STATES.MANUAL_ATTENTION, 503]]) {
    await store.set(retryKey, JSON.stringify({ state, attempts: 2 }));
    const response = await handleGuestEmailCapture(event, null, store, async () => { calls++; return success(); });
    assert.equal(response.statusCode, expected, state);
  }
  await store.delete(retryKey);
  await store.set(retryKey.replace('/retry/', '/tagged/'), JSON.stringify({ state: CAPTURE_STATES.TAGGED }));
  assert.equal((await handleGuestEmailCapture(event, null, store, async () => { calls++; return success(); })).statusCode, 200);
  assert.equal(calls, 0);
});

test('a lost provider response freezes the ambiguous attempt instead of replaying', async t => {
  const { store, entry, values } = fixture(t);
  let calls = 0;
  const send = async () => { calls++; throw new Error('connection lost after acceptance'); };
  const first = await processGuestCaptureRetryRecord(store, entry, send);
  await processGuestCaptureRetryRecord(store, entry, send);
  assert.equal(calls, 1);
  assert.equal(first.state, CAPTURE_STATES.MANUAL_ATTENTION);
  assert.equal(JSON.parse(values.get('guest_capture_state_v1/manual/fixture.json')).reason, 'retry_delivery_unknown');
});

for (const failure of ['read', 'claim', 'outcome']) test(`storage ${failure} failure does not reopen a provider attempt`, async t => {
  const { store, entry, values } = fixture(t);
  const read = store.getWithMetadata;
  const write = store.set;
  if (failure === 'read') store.getWithMetadata = async () => { throw new Error('read unavailable'); };
  store.set = async (k, v, opts) => {
    const state = JSON.parse(v).state;
    if ((failure === 'claim' && state === 'retry_running') || (failure === 'outcome' && state === CAPTURE_STATES.TAGGED)) throw new Error('write unavailable');
    return write(k, v, opts);
  };
  let calls = 0;
  const send = async () => { calls++; return success(); };
  await assert.rejects(processGuestCaptureRetryRecord(store, entry, send), /unavailable/);
  assert.equal(calls, failure === 'outcome' ? 1 : 0);
  if (failure === 'outcome') {
    assert.equal(JSON.parse(values.get(key)).state, 'retry_running');
    await processGuestCaptureRetryRecord(store, entry, send);
    assert.equal(calls, 1);
  }
  store.getWithMetadata = read;
});
