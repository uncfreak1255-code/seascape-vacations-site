const assert = require("node:assert/strict");
const test = require("node:test");
const {
  assertOwnerLeadMailAllowed,
  buildRateBucketKey,
  hourBucket
} = require("../../netlify/functions/_owner-lead-abuse");
const { claimOwnerLeadDelivery, isRetryableConfirmationFailure } = require("../../netlify/functions/_owner-lead-delivery");
const { sendMailViaGraph } = require("../../netlify/functions/_owner-lead-mail");
const { sendOwnerLeadConfirmationEmails } = require("../../netlify/functions/_owner-lead-confirmation");

function createConditionalStore() {
  const values = new Map();
  const versions = new Map();
  return {
    async getWithMetadata(key, options = {}) {
      const raw = values.get(key);
      if (raw == null) return null;
      return { data: options.type === "json" ? JSON.parse(raw) : raw, etag: String(versions.get(key)) };
    },
    async get(key, options = {}) {
      const raw = values.get(key);
      if (raw == null) return null;
      return options.type === "json" ? JSON.parse(raw) : raw;
    },
    async set(key, value, options = {}) {
      const version = versions.get(key);
      if (options.onlyIfNew && values.has(key)) return { modified: false };
      if (options.onlyIfMatch && String(version) !== String(options.onlyIfMatch)) return { modified: false };
      values.set(key, typeof value === "string" ? value : JSON.stringify(value));
      versions.set(key, (version || 0) + 1);
      return { modified: true };
    },
    values
  };
}

test("concurrent delivery claims permit only one sender", async () => {
  const store = createConditionalStore();
  const [first, second] = await Promise.all([
    claimOwnerLeadDelivery(store, "same-submission"),
    claimOwnerLeadDelivery(store, "same-submission")
  ]);
  assert.equal([first.claimed, second.claimed].filter(Boolean).length, 1);
  assert.ok([first.reason, second.reason].includes("in_flight"));
});

test("conditional rate bucket enforces email and global limits under concurrent submissions", async () => {
  const store = createConditionalStore();
  const env = { OWNER_LEAD_MAIL_RATE_LIMIT_PER_EMAIL_HOUR: "1", OWNER_LEAD_MAIL_RATE_LIMIT_GLOBAL_HOUR: "1" };
  const [first, second] = await Promise.all([
    assertOwnerLeadMailAllowed(store, "same@example.com", env, { submissionId: "one" }),
    assertOwnerLeadMailAllowed(store, "same@example.com", env, { submissionId: "two" })
  ]);
  assert.equal([first, second].filter((result) => result.allowed).length, 1);
  assert.ok([first.reason, second.reason].includes("rate_limited"));
  assert.ok(store.values.has(buildRateBucketKey(hourBucket())));
});

test("token transport failures are retryable but send transport failures are ambiguous", async () => {
  const env = { MS_GRAPH_TENANT_ID: "tenant", MS_GRAPH_CLIENT_ID: "client", MS_GRAPH_CLIENT_SECRET: "secret" };
  const tokenFailure = await sendMailViaGraph({ to: "owner@example.com", subject: "x", text: "x" }, async () => { throw new Error("fetch failed"); }, env);
  assert.equal(tokenFailure.reason.startsWith("graph_token_transport_failed:"), true);
  assert.equal(isRetryableConfirmationFailure(tokenFailure), true);

  let calls = 0;
  const sendFailure = await sendMailViaGraph({ to: "owner@example.com", subject: "x", text: "x" }, async () => {
    calls += 1;
    if (calls === 1) return { ok: true, async json() { return { access_token: "token" }; } };
    throw new Error("socket reset");
  }, env);
  assert.equal(sendFailure.ambiguous, true);
  assert.equal(sendFailure.reason.startsWith("graph_send_transport_unknown:"), true);
  assert.equal(isRetryableConfirmationFailure(sendFailure), false);
});

test("ambiguous internal-leg transport failures remain non-retryable", async () => {
  const env = { MS_GRAPH_TENANT_ID: "tenant", MS_GRAPH_CLIENT_ID: "client", MS_GRAPH_CLIENT_SECRET: "secret" };
  let calls = 0;
  const result = await sendOwnerLeadConfirmationEmails(
    { submissionId: "ambiguous-internal", email: "owner@example.com", name: "Owner" },
    async () => {
      calls += 1;
      if (calls === 1 || calls === 3) return { ok: true, async json() { return { access_token: "token" }; } };
      if (calls === 2) return { ok: true, status: 202 };
      throw new Error("socket reset");
    },
    env
  );
  assert.equal(result.ambiguous, true);
  assert.equal(isRetryableConfirmationFailure(result), false);
});

test("malformed Graph token responses are retryable", async () => {
  const env = { MS_GRAPH_TENANT_ID: "tenant", MS_GRAPH_CLIENT_ID: "client", MS_GRAPH_CLIENT_SECRET: "secret" };
  const result = await sendMailViaGraph(
    { to: "owner@example.com", subject: "x", text: "x" },
    async () => ({
      ok: true,
      status: 200,
      async json() {
        throw new Error("invalid json");
      }
    }),
    env
  );
  assert.equal(result.reason.startsWith("graph_token_response_invalid:"), true);
  assert.equal(isRetryableConfirmationFailure(result), true);
});

test("only explicit 429 Graph send failures are retryable", () => {
  assert.equal(isRetryableConfirmationFailure({ sent: false, reason: "graph_send_failed:429" }), true);
  assert.equal(isRetryableConfirmationFailure({ sent: false, reason: "graph_send_failed:400" }), false);
  assert.equal(isRetryableConfirmationFailure({ sent: false, reason: "graph_send_failed:503" }), false);
  assert.equal(isRetryableConfirmationFailure({ sent: false, reason: "graph_send_transport_unknown:socket reset", ambiguous: true }), false);
});

test("only transient Graph token HTTP failures are retryable", () => {
  assert.equal(isRetryableConfirmationFailure({ sent: false, reason: "graph_token_failed:429" }), true);
  assert.equal(isRetryableConfirmationFailure({ sent: false, reason: "graph_token_failed:500" }), true);
  assert.equal(isRetryableConfirmationFailure({ sent: false, reason: "graph_token_failed:400" }), false);
  assert.equal(isRetryableConfirmationFailure({ sent: false, reason: "graph_token_failed:401" }), false);
});
