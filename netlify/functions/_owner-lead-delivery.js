// Per-submission confirmation delivery state.
// A conditional pre-send claim prevents concurrent redeliveries from sending
// the same owner or internal message twice.

const OWNER_LEAD_DELIVERY_KEY_PREFIX = "owner_lead_confirmation_delivery/";
const MAX_DELIVERY_WRITE_ATTEMPTS = 5;
// Netlify function runtime is short; keep the lease above worst-case Graph+Blobs
// work so a live sender is not reclaimed, but allow recovery after a crash.
const OWNER_LEAD_CLAIM_LEASE_MS = 120000;
const DELIVERY_STATUSES = new Set(["pending", "sending", "sent", "failed", "unknown"]);

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function buildOwnerLeadDeliveryKey(submissionId) {
  const id = normalizeText(submissionId);
  if (!id) throw new Error("owner_lead_delivery_missing_submission_id");
  return OWNER_LEAD_DELIVERY_KEY_PREFIX + encodeURIComponent(id) + ".json";
}

function emptyDeliveryState() {
  return { ownerSent: false, internalSent: false, ownerStatus: "pending", internalStatus: "pending", deliveryStatus: "pending", updatedAt: null };
}

function normalizeLegStatus(value, sent) {
  if (sent) return "sent";
  return DELIVERY_STATUSES.has(value) ? value : "pending";
}

function normalizeDeliveryState(value) {
  if (!value || typeof value !== "object") return emptyDeliveryState();
  const ownerSent = value.ownerSent === true;
  const internalSent = value.internalSent === true;
  return {
    ownerSent,
    internalSent,
    ownerStatus: normalizeLegStatus(value.ownerStatus, ownerSent),
    internalStatus: normalizeLegStatus(value.internalStatus, internalSent),
    deliveryStatus: normalizeLegStatus(value.deliveryStatus, ownerSent && internalSent),
    updatedAt: normalizeText(value.updatedAt) || null
  };
}

function parseDeliveryValue(value) {
  if (!value) return null;
  if (typeof value === "string") { try { return JSON.parse(value); } catch (_error) { return null; } }
  return typeof value === "object" ? value : null;
}

function deliveryFlagsEqual(left, right) {
  const a = normalizeDeliveryState(left);
  const b = normalizeDeliveryState(right);
  return (
    a.ownerSent === b.ownerSent &&
    a.internalSent === b.internalSent &&
    a.ownerStatus === b.ownerStatus &&
    a.internalStatus === b.internalStatus &&
    a.deliveryStatus === b.deliveryStatus
  );
}

function buildWriteOptions(store, current) {
  const options = { contentType: "application/json; charset=utf-8" };
  const hasMetadata = store && typeof store.getWithMetadata === "function";

  // Writable updates must stay conditional when the store supports etags.
  // An etag-less read of an existing key is not safe to write: it can clobber a
  // concurrent "sending" claim and reopen a Graph send.
  if (hasMetadata) {
    if (current.etag) {
      options.onlyIfMatch = current.etag;
      return { options, safe: true };
    }
    if (!current.exists) {
      options.onlyIfNew = true;
      return { options, safe: true };
    }
    return { options, safe: false, reason: "owner_lead_delivery_missing_etag" };
  }

  return { options, safe: true };
}

async function readOwnerLeadDeliveryRecord(store, submissionId, { forWrite = false } = {}) {
  const key = buildOwnerLeadDeliveryKey(submissionId);

  if (store && typeof store.getWithMetadata === "function") {
    try {
      const result = await store.getWithMetadata(key, { type: "json" });
      if (!result) return { state: emptyDeliveryState(), etag: undefined, exists: false };
      return {
        state: normalizeDeliveryState(parseDeliveryValue(result.data)),
        etag: result.etag,
        exists: true
      };
    } catch (error) {
      // Reads may fall through to plain get. Writes must not — no etag means an
      // unsafe clobber risk against concurrent claims.
      if (forWrite) throw error;
    }
  }

  if (!store || typeof store.get !== "function") {
    return { state: emptyDeliveryState(), etag: undefined, exists: false };
  }

  try {
    const raw = await store.get(key, { type: "json" });
    if (raw == null) return { state: emptyDeliveryState(), etag: undefined, exists: false };
    return { state: normalizeDeliveryState(parseDeliveryValue(raw)), etag: undefined, exists: true };
  } catch (_error) {
    try {
      const raw = await store.get(key, { type: "text" });
      if (raw == null) return { state: emptyDeliveryState(), etag: undefined, exists: false };
      return { state: normalizeDeliveryState(parseDeliveryValue(raw)), etag: undefined, exists: true };
    } catch (_textError) {
      throw _textError || _error || new Error("owner_lead_delivery_read_failed");
    }
  }
}

async function readOwnerLeadDeliveryState(store, submissionId) {
  return (await readOwnerLeadDeliveryRecord(store, submissionId)).state;
}

function mergeDeliveryState(existing, result) {
  const current = normalizeDeliveryState(existing);
  const ownerSent = current.ownerSent || result?.ownerSent === true;
  const internalSent = current.internalSent || result?.internalSent === true;
  const ownerStatus = ownerSent ? "sent" : (result?.ownerStatus || current.ownerStatus);
  const internalStatus = internalSent ? "sent" : (result?.internalStatus || current.internalStatus);
  const deliveryStatus = result?.ambiguous === true
    ? "unknown"
    : (ownerSent && internalSent ? "sent" : (result?.deliveryStatus || "pending"));
  return { ownerSent, internalSent, ownerStatus, internalStatus, deliveryStatus, updatedAt: new Date().toISOString() };
}

async function writeOwnerLeadDeliveryState(store, submissionId, result) {
  if (!store || typeof store.set !== "function") throw new Error("owner_lead_delivery_store_unavailable");
  const key = buildOwnerLeadDeliveryKey(submissionId);
  let lastError = null;

  for (let attempt = 0; attempt < MAX_DELIVERY_WRITE_ATTEMPTS; attempt += 1) {
    let current;
    try {
      current = await readOwnerLeadDeliveryRecord(store, submissionId, { forWrite: true });
    } catch (error) {
      lastError = error;
      continue;
    }

    const next = mergeDeliveryState(current.state, result);
    if (current.exists && deliveryFlagsEqual(next, current.state)) {
      return { state: current.state, persisted: true, unchanged: true };
    }

    const prepared = buildWriteOptions(store, current);
    if (!prepared.safe) {
      lastError = new Error(prepared.reason || "owner_lead_delivery_write_unsafe");
      continue;
    }

    try {
      const writeResult = await store.set(key, JSON.stringify(next), prepared.options);
      if (writeResult && writeResult.modified === false) {
        lastError = new Error("owner_lead_delivery_write_conflict");
        continue;
      }
      return { state: next, persisted: true, unchanged: false };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("owner_lead_delivery_write_failed");
}

function isOwnerLeadClaimLeaseExpired(state, nowMs = Date.now()) {
  const updatedAtMs = Date.parse(state && state.updatedAt ? state.updatedAt : "");
  if (!Number.isFinite(updatedAtMs)) return true;
  return nowMs - updatedAtMs > OWNER_LEAD_CLAIM_LEASE_MS;
}

async function claimOwnerLeadDelivery(store, submissionId, durableProgress = {}) {
  if (!store || typeof store.set !== "function") return { claimed: false, reason: "delivery_store_unavailable" };
  const key = buildOwnerLeadDeliveryKey(submissionId);
  const progressOwnerSent = durableProgress && durableProgress.ownerSent === true;
  const progressInternalSent = durableProgress && durableProgress.internalSent === true;

  for (let attempt = 0; attempt < MAX_DELIVERY_WRITE_ATTEMPTS; attempt += 1) {
    let current;
    try {
      current = await readOwnerLeadDeliveryRecord(store, submissionId, { forWrite: true });
    } catch (_error) {
      if (attempt + 1 >= MAX_DELIVERY_WRITE_ATTEMPTS) return { claimed: false, reason: "delivery_claim_failed" };
      continue;
    }

    const state = current.state;
    const ownerSent = state.ownerSent || progressOwnerSent;
    const internalSent = state.internalSent || progressInternalSent;
    if (state.ownerSent && state.internalSent) return { claimed: false, reason: "already_sent", state };

    if (state.deliveryStatus === "sending") {
      if (!isOwnerLeadClaimLeaseExpired(state)) {
        return { claimed: false, reason: "in_flight", state };
      }

      // Stale claim with no durable progress anywhere (blob OR contact stamp):
      // Graph may already have accepted. Prefer at-most-once — freeze unknown.
      // Partial durable progress (either source) may reclaim the remaining leg.
      if (!ownerSent && !internalSent) {
        const frozen = {
          ...state,
          deliveryStatus: "unknown",
          updatedAt: new Date().toISOString()
        };
        const prepared = buildWriteOptions(store, current);
        if (!prepared.safe) {
          if (attempt + 1 >= MAX_DELIVERY_WRITE_ATTEMPTS) {
            return { claimed: false, reason: "delivery_unknown", state };
          }
          continue;
        }
        try {
          const result = await store.set(key, JSON.stringify(frozen), prepared.options);
          if (result && result.modified === false) continue;
          return { claimed: false, reason: "delivery_unknown", state: frozen };
        } catch (_error) {
          if (attempt + 1 >= MAX_DELIVERY_WRITE_ATTEMPTS) {
            return { claimed: false, reason: "delivery_unknown", state };
          }
          continue;
        }
      }

      // Reclaim with any known durable leg flags folded into the new claim so
      // sendConfirmation skips already-accepted legs.
      const next = {
        ...state,
        ownerSent,
        internalSent,
        ownerStatus: ownerSent ? "sent" : state.ownerStatus,
        internalStatus: internalSent ? "sent" : state.internalStatus,
        deliveryStatus: "sending",
        updatedAt: new Date().toISOString()
      };
      const prepared = buildWriteOptions(store, current);
      if (!prepared.safe) {
        if (attempt + 1 >= MAX_DELIVERY_WRITE_ATTEMPTS) return { claimed: false, reason: "delivery_claim_failed" };
        continue;
      }
      try {
        const result = await store.set(key, JSON.stringify(next), prepared.options);
        if (result && result.modified === false) continue;
        return { claimed: true, state: next };
      } catch (_error) {
        if (attempt + 1 >= MAX_DELIVERY_WRITE_ATTEMPTS) return { claimed: false, reason: "delivery_claim_failed" };
        continue;
      }
    }

    if (state.deliveryStatus === "unknown") return { claimed: false, reason: "delivery_unknown", state };

    const next = {
      ...state,
      ownerSent,
      internalSent,
      ownerStatus: ownerSent ? "sent" : state.ownerStatus,
      internalStatus: internalSent ? "sent" : state.internalStatus,
      deliveryStatus: "sending",
      updatedAt: new Date().toISOString()
    };
    const prepared = buildWriteOptions(store, current);
    if (!prepared.safe) {
      if (attempt + 1 >= MAX_DELIVERY_WRITE_ATTEMPTS) return { claimed: false, reason: "delivery_claim_failed" };
      continue;
    }

    try {
      const result = await store.set(key, JSON.stringify(next), prepared.options);
      if (result && result.modified === false) continue;
      return { claimed: true, state: next };
    } catch (_error) {
      if (attempt + 1 >= MAX_DELIVERY_WRITE_ATTEMPTS) return { claimed: false, reason: "delivery_claim_failed" };
    }
  }
  return { claimed: false, reason: "delivery_claim_failed" };
}

function isRetryableConfirmationFailure(result) {
  if (!result || result.sent === true || result.ambiguous === true) return false;
  const reason = String(result.reason || "");
  if (!reason) return false;
  if (reason.startsWith("missing_env:")) return false;
  if (reason === "missing_email" || reason === "missing_contact" || reason === "rate_limited") return false;
  if (reason === "delivery_state_write_failed" || reason === "confirmation_threw") return true;
  if (
    reason.startsWith("graph_token_transport_failed:") ||
    reason.startsWith("graph_token_response_invalid:") ||
    reason === "graph_token_missing_access_token"
  ) return true;
  const graphTokenStatus = reason.match(/^graph_token_failed:(\d+)$/);
  if (graphTokenStatus) {
    const status = Number(graphTokenStatus[1]);
    return status === 429 || status >= 500;
  }
  const graphSendStatus = reason.match(/^graph_send_failed:(\d+)$/);
  if (graphSendStatus) return Number(graphSendStatus[1]) === 429;
  if (reason === "owner_sent_internal_failed") {
    return isRetryableConfirmationFailure(result.internal);
  }
  return false;
}

module.exports = {
  OWNER_LEAD_DELIVERY_KEY_PREFIX,
  OWNER_LEAD_CLAIM_LEASE_MS,
  buildOwnerLeadDeliveryKey,
  emptyDeliveryState,
  normalizeDeliveryState,
  readOwnerLeadDeliveryRecord,
  readOwnerLeadDeliveryState,
  writeOwnerLeadDeliveryState,
  mergeDeliveryState,
  claimOwnerLeadDelivery,
  isOwnerLeadClaimLeaseExpired,
  isRetryableConfirmationFailure,
  deliveryFlagsEqual
};
