const test = require('node:test');
const assert = require('node:assert/strict');
const { googleToken } = require('../owner-intelligence/google-auth');

const account = 'synthetic-operator@example.invalid';
const env = { OWNER_INTELLIGENCE_GOOGLE_AUTH: 'gws', OWNER_INTELLIGENCE_GOOGLE_ACCOUNT: account,
  OWNER_INTELLIGENCE_GWS_BIN: '/synthetic/gws' };
const credentials = { type: 'authorized_user', client_id: 'synthetic-client', client_secret: 'synthetic-secret',
  refresh_token: 'synthetic-refresh', token_uri: 'https://example.invalid/must-not-use' };

test('existing bearer mode never exports credentials, refreshes, or opens login', async () => {
  assert.equal(await googleToken({ OWNER_INTELLIGENCE_GOOGLE_ACCESS_TOKEN: 'synthetic-existing' }, {
    run: async () => { throw new Error('must not run'); }, fetchImpl: async () => { throw new Error('must not fetch'); },
  }), 'synthetic-existing');
});

test('explicit reuse keeps existing credentials and bearer only in memory and verifies the account', async () => {
  const calls = [];
  const token = await googleToken(env, {
    run: async (binary, args) => { assert.equal(binary, '/synthetic/gws');
      assert.deepEqual(args, ['auth', 'export', '--unmasked']); return { stdout: JSON.stringify(credentials) }; },
    fetchImpl: async (url, options) => {
      calls.push(url); assert.equal(options.redirect, 'error');
      if (url === 'https://oauth2.googleapis.com/token') {
        const body = new URLSearchParams(options.body);
        assert.equal(body.get('refresh_token'), 'synthetic-refresh'); assert.equal(body.has('scope'), false);
        return { ok: true, json: async () => ({ access_token: 'synthetic-access', token_type: 'Bearer' }) };
      }
      assert.equal(url, 'https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)');
      assert.equal(options.headers.authorization, 'Bearer synthetic-access');
      return { ok: true, json: async () => ({ user: { emailAddress: account.toUpperCase() } }) };
    },
  });
  assert.equal(token, 'synthetic-access'); assert.equal(calls.length, 2);
});

test('pre-obtained CLI token still needs identity proof and never exports or refreshes', async () => {
  let reads = 0;
  const token = await googleToken({ ...env, GOOGLE_WORKSPACE_CLI_TOKEN: 'synthetic-access' }, {
    run: async () => { throw new Error('must not export'); },
    fetchImpl: async url => { reads += 1; assert.match(url, /drive\/v3\/about/);
      return { ok: true, json: async () => ({ user: { emailAddress: account } }) }; },
  });
  assert.equal(token, 'synthetic-access'); assert.equal(reads, 1);
});

test('wrong account, invalid credentials, failed refresh and child output never disclose secrets', async () => {
  for (const scenario of ['child', 'masked', 'service_account', 'refresh', 'account']) {
    const run = async () => {
      if (scenario === 'child') throw Object.assign(new Error('synthetic-secret'), { stdout: 'synthetic-refresh', stderr: 'private provider text' });
      return { stdout: JSON.stringify({ ...credentials,
        ...(scenario === 'masked' ? { refresh_token: '***' } : {}),
        ...(scenario === 'service_account' ? { type: 'service_account' } : {}) }) };
    };
    const fetchImpl = async url => url.includes('/token')
      ? { ok: scenario !== 'refresh', json: async () => ({ access_token: 'synthetic-access', token_type: 'Bearer' }) }
      : { ok: true, json: async () => ({ user: { emailAddress: 'wrong@example.invalid' } }) };
    await assert.rejects(googleToken(env, { run, fetchImpl }), error => {
      assert.equal(error.message, 'existing_google_auth_unavailable_or_account_mismatch');
      assert.equal(error.stdout, undefined); assert.equal(error.stderr, undefined); assert.equal(error.cause, undefined);
      assert.equal(JSON.stringify(error).includes('synthetic-secret'), false); return true;
    });
  }
  await assert.rejects(googleToken({ OWNER_INTELLIGENCE_GOOGLE_AUTH: 'gws' }), /missing_OWNER_INTELLIGENCE_GOOGLE_ACCOUNT/);
  await assert.rejects(googleToken({ OWNER_INTELLIGENCE_GOOGLE_AUTH: 'unexpected' }), /google_auth_mode_invalid/);
});
