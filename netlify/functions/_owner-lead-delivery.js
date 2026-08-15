// Per-submission confirmation delivery state.
// Kept off the contacts list blob so overlapping submits cannot clobber leads
// or wipe successful-send flags via a stale whole-blob write.

const OWNER_LEAD_DELIVERY_KEY_PREFIX = "owner_lead_confirmation_delivery/";
const MAX_DELIVERY_WRITE_ATTEMPTS = 5;

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function buildOwnerLeadDeliveryKey(submissionId) {
  const id = normalizeText(submissionId);
  if (!id) {
    throw new Error("owner_lead_delivery_missing_submission_id");
  }
  return `${OWNER_LEAD_DELIVERY_KEY_PREFIX}${encodeURIComponent(id)}.json`;
}

function emptyDeliveryState() {
  return { ownerSent: false, internalSent: false, updatedAt: null };
}

function normalizeDeliveryState(value) {
  if (!value || typeof value !== "object") {
    return emptyDeliveryState();
  }
  return {
    ownerSent: value.ownerSent === true,
    internalSent: value.internalSent === true,
    updatedAt: normalizeText(value.updatedAt) || null
  };
}

function parseDeliveryValue(value) {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (_error) {
      return null;
    }
  }
  if (typeof value === "object") {
    return value;
  }
  return null;
}

async function readOwnerLeadDeliveryRecord(store, submissionId) {
  const key = buildOwnerLeadDeliveryKey(submissionId);

  if (store && typeof store.getWithMetadata === "function") {
    try {
      const result = await store.getWithMetadata(key, { type: "json" });
      if (!result) {
        return { state: emptyDeliveryState(), etag: undefined, exists: false };
      }
      return {
        state: normalizeDeliveryState(parseDeliveryValue(result.data)),
        etag: result.etag,
        exists: true
      };
    } catch (_error) {
      // Fall through to plain get for test doubles / older stores.
    }
  }

  if (!store || typeof store.get !== "function") {
    return { state: emptyDeliveryState(), etag: undefined, exists: false };
  }

  try {
    const raw = await store.get(key, { type: "json" });
    if (raw == null) {
      return { state: emptyDeliveryState(), etag: undefined, exists: false };
    }
    return {
      state: normalizeDeliveryState(parseDeliveryValue(raw)),
      etag: undefined,
      exists: true
    };
  } catch (_error) {
    try {
      const raw = await store.get(key, { type: "text" });
      if (raw == null) {
        return { state: emptyDeliveryState(), etag: undefined, exists: false };
      }
      return {
        state: normalizeDeliveryState(parseDeliveryValue(raw)),
        etag: undefined,
        exists: true
      };
    } catch (_textError) {
      return { state: emptyDeliveryState(), etag: undefined, exists: false };
    }
  }
}

async function readOwnerLeadDeliveryState(store, submissionId) {
  const record = await readOwnerLeadDeliveryRecord(store, submissionId);
  return record.state;
}

function mergeDeliveryState(existing, result) {
  const current = normalizeDeliveryState(existing);
  return {
    ownerSent: current.ownerSent || result?.ownerSent === true,
    internalSent: current.internalSent || result?.internalSent === true,
    updatedAt: new Date().toISOString()
  };
}

async function writeOwnerLeadDeliveryState(store, submissionId, result) {
  if (!store || typeof store.set !== "function") {
    throw new Error("owner_lead_delivery_store_unavailable");
  }

  const key = buildOwnerLeadDeliveryKey(submissionId);
  let lastError = null;

  for (let attempt = 0; attempt < MAX_DELIVERY_WRITE_ATTEMPTS; attempt += 1) {
    const current = await readOwnerLeadDeliveryRecord(store, submissionId);
    const next = mergeDeliveryState(current.state, result);
    if (
      next.ownerSent === current.state.ownerSent &&
      next.internalSent === current.state.internalSent &&
      current.exists
    ) {
      return { state: current.state, persisted: true, unchanged: true };
    }

    const options = { contentType: "application/json; charset=utf-8" };
    if (current.etag) {
      options.onlyIfMatch = current.etag;
    } else if (!current.exists && typeof store.getWithMetadata === "function") {
      options.onlyIfNew = true;
    }

    try {
      const writeResult = await store.set(key, JSON.stringify(next), options);
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

function isRetryableConfirmationFailure(result) {
  if (!result || result.sent === true) {
    return false;
  }

  const reason = String(result.reason || "");
  if (!reason) return false;
  if (reason.startsWith("missing_env:")) return false;
  if (reason === "missing_email" || reason === "missing_contact") return false;
  if (reason === "rate_limited") return false;
  if (reason === "delivery_state_write_failed") return true;
  if (reason === "confirmation_threw") return true;
  if (reason.startsWith("graph_token_failed")) return true;
  if (reason.includes("graph_send_failed")) return true;
  if (reason === "owner_sent_internal_failed") return true;
  return false;
}

module.exports = {
  OWNER_LEAD_DELIVERY_KEY_PREFIX,
  buildOwnerLeadDeliveryKey,
  emptyDeliveryState,
  normalizeDeliveryState,
  readOwnerLeadDeliveryRecord,
  readOwnerLeadDeliveryState,
  writeOwnerLeadDeliveryState,
  mergeDeliveryState,
  isRetryableConfirmationFailure
};
