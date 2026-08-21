const { connectLambda, getStore } = require("@netlify/blobs");
const {
  GUEST_EMAIL_CAPTURE_STORE_NAME,
  getGuestEmailCaptureBlobsConfig
} = require("./_guest-email-capture-metrics");
const {
  CAPTURE_STATES,
  GUEST_CAPTURE_STATE_KEY_PREFIX,
  MAX_TAG_RETRY_ATTEMPTS,
  buildMailchimpConfig,
  requestMailchimpJson
} = require("./guest-email-capture");

const MAX_RETRY_BATCH_SIZE = 10;

function resolveRetryStore(event, candidateStore) {
  if (
    candidateStore &&
    typeof candidateStore.get === "function" &&
    typeof candidateStore.set === "function" &&
    typeof candidateStore.delete === "function" &&
    typeof candidateStore.list === "function"
  ) {
    return candidateStore;
  }

  const explicitConfig = getGuestEmailCaptureBlobsConfig();
  if (explicitConfig) return getStore(explicitConfig);

  connectLambda(event);
  return getStore(GUEST_EMAIL_CAPTURE_STORE_NAME);
}

function parseRetryState(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

async function persistRetryState(store, entry, state) {
  const options = { contentType: "application/json; charset=utf-8" };
  if (entry && entry.etag) options.onlyIfMatch = entry.etag;
  const result = await store.set(entry.key, JSON.stringify(state), options);
  if (result && result.modified === false) {
    throw new Error("guest_capture_retry_state_conflict");
  }
}

async function persistTerminalState(store, retryKey, directory, state) {
  const terminalKey = `${GUEST_CAPTURE_STATE_KEY_PREFIX}/${directory}/${state.queueId}.json`;
  await store.set(terminalKey, JSON.stringify(state), {
    contentType: "application/json; charset=utf-8"
  });
  await store.delete(retryKey);
}

async function processGuestCaptureRetryRecord(store, entry, injectedFetch) {
  const state = parseRetryState(
    await store.get(entry.key, { type: "json", consistency: "strong" })
  );
  if (!state || state.state !== CAPTURE_STATES.RETRY_QUEUED) {
    return { state: "skipped", key: entry.key };
  }

  const config = buildMailchimpConfig();
  const attempts = Math.max(0, Number(state.attempts) || 0) + 1;
  const base = {
    ...state,
    attempts,
    maxAttempts: MAX_TAG_RETRY_ATTEMPTS,
    updatedAt: new Date().toISOString()
  };

  if (
    !config ||
    !state.queueId ||
    !state.audienceId ||
    state.audienceId !== config.audienceId ||
    !state.subscriberHash ||
    !Array.isArray(state.tags) ||
    state.tags.length === 0
  ) {
    const next = {
      ...base,
      state: CAPTURE_STATES.MANUAL_ATTENTION,
      reason: "retry_config_invalid"
    };
    await persistTerminalState(store, entry.key, "manual", next);
    console.error("guest_capture_retry_manual_attention", {
      key: entry.key,
      attempts,
      reason: next.reason
    });
    return { state: next.state, key: entry.key };
  }

  try {
    await requestMailchimpJson(
      config,
      `/lists/${encodeURIComponent(config.audienceId)}/members/${state.subscriberHash}/tags`,
      "POST",
      {
        tags: state.tags.map((name) => ({ name, status: "active" }))
      },
      injectedFetch
    );
    const next = {
      ...base,
      state: CAPTURE_STATES.TAGGED,
      reason: "tag_retry_succeeded"
    };
    await persistTerminalState(store, entry.key, "tagged", next);
    return { state: next.state, key: entry.key };
  } catch (error) {
    const exhausted = attempts >= MAX_TAG_RETRY_ATTEMPTS;
    const next = {
      ...base,
      state: exhausted ? CAPTURE_STATES.MANUAL_ATTENTION : CAPTURE_STATES.RETRY_QUEUED,
      reason: "mailchimp_tags_sync_failed"
    };
    if (exhausted) {
      await persistTerminalState(store, entry.key, "manual", next);
      console.error("guest_capture_retry_manual_attention", {
        key: entry.key,
        attempts,
        reason: next.reason
      });
    } else {
      await persistRetryState(store, entry, next);
    }
    return { state: next.state, key: entry.key };
  }
}

async function handleGuestCaptureRetries(event, _context, injectedStore, injectedFetch) {
  const store = resolveRetryStore(event, injectedStore);
  const listing = await store.list({ prefix: `${GUEST_CAPTURE_STATE_KEY_PREFIX}/retry/` });
  const entries = Array.isArray(listing && listing.blobs)
    ? listing.blobs.slice(0, MAX_RETRY_BATCH_SIZE)
    : [];
  const settled = await Promise.allSettled(
    entries.map((entry) => processGuestCaptureRetryRecord(store, entry, injectedFetch))
  );
  const results = settled
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
  const failures = settled.filter((result) => result.status === "rejected");

  if (failures.length > 0) {
    console.error("guest_capture_retry_worker_failed", {
      failed: failures.length,
      processed: entries.length
    });
  }

  return {
    statusCode: failures.length > 0 ? 500 : 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      processed: entries.length,
      tagged: results.filter((result) => result.state === CAPTURE_STATES.TAGGED).length,
      retryQueued: results.filter((result) => result.state === CAPTURE_STATES.RETRY_QUEUED).length,
      manualAttention: results.filter((result) => result.state === CAPTURE_STATES.MANUAL_ATTENTION).length,
      skipped: results.filter((result) => result.state === "skipped").length,
      failures: failures.length
    })
  };
}

async function handler(event, context) {
  // netlify.toml declares this as a scheduled function, so Netlify does not
  // expose it as a public function route.
  return handleGuestCaptureRetries(event, context);
}

exports.MAX_RETRY_BATCH_SIZE = MAX_RETRY_BATCH_SIZE;
exports.handleGuestCaptureRetries = handleGuestCaptureRetries;
exports.processGuestCaptureRetryRecord = processGuestCaptureRetryRecord;
exports.handler = handler;
