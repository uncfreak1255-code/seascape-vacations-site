// Private counts of which bot-screen rule rejected a guest capture. The 422
// reply stays a plain "rejected" so a bot cannot learn which rule it tripped;
// this record is read only through the token-protected metrics endpoint.
// It lives under its own key so a rejection write can never overwrite the
// capture metrics. Concurrent writes may drop a count; these are diagnostics.

const GUEST_CAPTURE_REJECTIONS_KEY = "guest_email_capture_rejections_v1.json";
const MAX_RECENT_REJECTIONS = 200;
const MAX_PLACEMENT_KEYS = 50;
const PLACEMENT_PATTERN = /^[a-z0-9_-]{1,40}$/;
// Keys that name Object.prototype members would bypass the cap or the count.
const RESERVED_KEYS = new Set(["__proto__", "constructor", "prototype", "tostring", "valueof", "hasownproperty"]);

function emptyRejections() {
  return { total: 0, byReason: {}, byPlacement: {}, recent: [], updatedAt: null };
}

function countMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const counts = {};
  for (const [key, count] of Object.entries(value)) {
    if (!RESERVED_KEYS.has(key.toLowerCase()) && Number.isInteger(count) && count > 0) counts[key] = count;
  }
  return counts;
}

function increment(counts, key) {
  counts[key] = (Object.hasOwn(counts, key) ? counts[key] : 0) + 1;
}

function isRuleName(value) {
  return typeof value === "string" && PLACEMENT_PATTERN.test(value) && !RESERVED_KEYS.has(value);
}

// Only the fields this module writes survive a read, so nothing else stored
// under the key can reach the metrics endpoint.
function recentEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  if (typeof entry.at !== "string" || typeof entry.placement !== "string") return null;
  const reasons = Array.isArray(entry.reasons) ? entry.reasons.filter(isRuleName) : [];
  return { at: entry.at, placement: entry.placement, reasons };
}

function parseStoredRejections(value) {
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch (_error) {
      return emptyRejections();
    }
  }
  if (!parsed || typeof parsed !== "object" || !Number.isInteger(parsed.total) || parsed.total < 0) {
    return emptyRejections();
  }
  const recent = Array.isArray(parsed.recent) ? parsed.recent.map(recentEntry).filter(Boolean) : [];
  return {
    total: parsed.total,
    byReason: countMap(parsed.byReason),
    byPlacement: countMap(parsed.byPlacement),
    recent: recent.slice(-MAX_RECENT_REJECTIONS),
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null
  };
}

// Placement comes from the request body, so only short slug-shaped values are
// kept, and the number of distinct keys is capped.
function placementKey(placement, byPlacement) {
  const value = typeof placement === "string" ? placement.trim().toLowerCase() : "";
  if (!isRuleName(value)) return "other";
  if (Object.hasOwn(byPlacement, value) || Object.keys(byPlacement).length < MAX_PLACEMENT_KEYS) return value;
  return "other";
}

function mergeGuestCaptureRejection(existing, { reasons, placement, at }) {
  const next = parseStoredRejections(existing);
  const ruleNames = Array.isArray(reasons) ? reasons.filter(isRuleName) : [];
  const place = placementKey(placement, next.byPlacement);
  next.total += 1;
  for (const reason of ruleNames) increment(next.byReason, reason);
  increment(next.byPlacement, place);
  next.recent = [...next.recent, { at, placement: place, reasons: ruleNames }].slice(-MAX_RECENT_REJECTIONS);
  next.updatedAt = at;
  return next;
}

// The record is read as text and parsed here, so stored bytes that are not
// JSON start a fresh count instead of failing every later read.
async function readGuestCaptureRejections(store) {
  try {
    return parseStoredRejections(await store.get(GUEST_CAPTURE_REJECTIONS_KEY, { type: "text" }));
  } catch (_error) {
    return { ...emptyRejections(), readFailed: true };
  }
}

// A failed read throws rather than starting from zero, so a transient store
// error cannot overwrite the accumulated counts. The read is strongly
// consistent so a rejection seconds after the last one sees its write.
async function recordGuestCaptureRejection(store, { reasons, placement, at = new Date().toISOString() }) {
  const existing = await store.get(GUEST_CAPTURE_REJECTIONS_KEY, { type: "text", consistency: "strong" });
  const next = mergeGuestCaptureRejection(existing, { reasons, placement, at });
  await store.set(GUEST_CAPTURE_REJECTIONS_KEY, JSON.stringify(next), {
    contentType: "application/json; charset=utf-8"
  });
  return next;
}

module.exports = {
  GUEST_CAPTURE_REJECTIONS_KEY,
  MAX_RECENT_REJECTIONS,
  mergeGuestCaptureRejection,
  readGuestCaptureRejections,
  recordGuestCaptureRejection
};
