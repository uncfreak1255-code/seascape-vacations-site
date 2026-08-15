// Per-submission confirmation delivery state.
// A conditional pre-send claim prevents concurrent redeliveries from sending
// the same owner or internal message twice.

const OWNER_LEAD_DELIVERY_KEY_PREFIX = "owner_lead_confirmation_delivery/";
const MAX_DELIVERY_WRITE_ATTEMPTS = 5;
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

async function readOwnerLeadDeliveryRecord(store, submissionId) {
  const key = buildOwnerLeadDeliveryKey(submissionId);
  if (store && typeof store.getWithMetadata === "function") {
    const result = await store.getWithMetadata(key, { type: "json" });
    if (!result) return { state: emptyDeliveryState(), etag: undefined, exists: false };
    return { state: normalizeDeliveryState(parseDeliveryValue(result.data)), etag: result.etag, exists: true };
  }
  if (!store || typeof store.get !== "function") return { state: emptyDeliveryState(), etag: undefined, exists: false };
  const raw = await store.get(key, { type: "json" });
  if (raw == null) return { state: emptyDeliveryState(), etag: undefined, exists: false };
  return { state: normalizeDeliveryState(parseDeliveryValue(raw)), etag: undefined, exists: true };
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
    const current = await readOwnerLeadDeliveryRecord(store, submissionId);
    const next = mergeDeliveryState(current.state, result);
    if (current.exists && JSON.stringify(next) === JSON.stringify(current.state)) return { state: current.state, persisted: true, unchanged: true };
    const options = { contentType: "application/json; charset=utf-8" };
    if (current.etag) options.onlyIfMatch = current.etag;
    else if (!current.exists && typeof store.getWithMetadata === "function") options.onlyIfNew = true;
    try {
      const writeResult = await store.set(key, JSON.stringify(next), options);
      if (writeResult && writeResult.modified === false) { lastError = new Error("owner_lead_delivery_write_conflict"); continue; }
      return { state: next, persisted: true, unchanged: false };
    } catch (error) { lastError = error; }
  }
  throw lastError || new Error("owner_lead_delivery_write_failed");
}

async function claimOwnerLeadDelivery(store, submissionId) {
  if (!store || typeof store.set !== "function") return { claimed: false, reason: "delivery_store_unavailable" };
  const key = buildOwnerLeadDeliveryKey(submissionId);
  for (let attempt = 0; attempt < MAX_DELIVERY_WRITE_ATTEMPTS; attempt += 1) {
    const current = await readOwnerLeadDeliveryRecord(store, submissionId);
    const state = current.state;
    if (state.ownerSent && state.internalSent) return { claimed: false, reason: "already_sent", state };
    if (state.deliveryStatus === "sending") return { claimed: false, reason: "in_flight", state };
    if (state.deliveryStatus === "unknown") return { claimed: false, reason: "delivery_unknown", state };
    const next = { ...state, deliveryStatus: "sending", updatedAt: new Date().toISOString() };
    const options = { contentType: "application/json; charset=utf-8" };
    if (current.etag) options.onlyIfMatch = current.etag;
    else if (!current.exists && typeof store.getWithMetadata === "function") options.onlyIfNew = true;
    try {
      const result = await store.set(key, JSON.stringify(next), options);
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
  if (reason.startsWith("graph_token_transport_failed:") || reason.startsWith("graph_token_failed")) return true;
  if (reason === "graph_send_failed:429" || reason === "owner_sent_internal_failed") return true;
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
  claimOwnerLeadDelivery,
  isRetryableConfirmationFailure
}
