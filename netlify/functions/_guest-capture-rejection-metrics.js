// Private counts of which bot-screen rule rejected a guest capture. The 422
// reply stays a plain "rejected" so a bot cannot learn which rule it tripped;
// this record is read only through the token-protected metrics endpoint.
// It lives under its own key so a rejection write can never overwrite the
// capture metrics. Concurrent writes may drop a count; these are diagnostics.

const GUEST_CAPTURE_REJECTIONS_KEY = "guest_email_capture_rejections_v1.json";
const MAX_RECENT_REJECTIONS = 200;
const MAX_PLACEMENT_KEYS = 50;
const PLACEMENT_PATTERN = /^[a-z0-9_-]{1,40}$/;

function emptyRejections() {
  return { total: 0, byReason: {}, byPlacement: {}, recent: [], updatedAt: null };
}

function countMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const counts = {};
  for (const [key, count] of Object.entries(value)) {
    if (Number.isInteger(count) && count > 0) counts[key] = count;
  }
  return counts;
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
  if (!parsed || typeof parsed !== "object" || !Number.isInteger(parsed.total)) {
    return emptyRejections();
  }
  return {
    total: parsed.total,
    byReason: countMap(parsed.byReason),
    byPlacement: countMap(parsed.byPlacement),
    recent: Array.isArray(parsed.recent) ? parsed.recent.slice(-MAX_RECENT_REJECTIONS) : [],
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null
  };
}

// Placement comes from the request body, so only short slug-shaped values are
// kept, and the number of distinct keys is capped.
function placementKey(placement, byPlacement) {
  const value = typeof placement === "string" ? placement.trim().toLowerCase() : "";
  if (!PLACEMENT_PATTERN.test(value)) return "other";
  if (byPlacement[value] || Object.keys(byPlacement).length < MAX_PLACEMENT_KEYS) return value;
  return "other";
}

function mergeGuestCaptureRejection(existing, { reasons, placement, at }) {
  const next = parseStoredRejections(existing);
  const ruleNames = Array.isArray(reasons) ? reasons.filter((reason) => typeof reason === "string") : [];
  const place = placementKey(placement, next.byPlacement);
  next.total += 1;
  for (const reason of ruleNames) {
    next.byReason[reason] = (next.byReason[reason] || 0) + 1;
  }
  next.byPlacement[place] = (next.byPlacement[place] || 0) + 1;
  next.recent = [...next.recent, { at, placement: place, reasons: ruleNames }].slice(-MAX_RECENT_REJECTIONS);
  next.updatedAt = at;
  return next;
}

async function readGuestCaptureRejections(store) {
  try {
    return parseStoredRejections(await store.get(GUEST_CAPTURE_REJECTIONS_KEY, { type: "json" }));
  } catch (_error) {
    return emptyRejections();
  }
}

// A failed read throws rather than starting from zero, so a transient store
// error cannot overwrite the accumulated counts.
async function recordGuestCaptureRejection(store, { reasons, placement, at = new Date().toISOString() }) {
  const existing = await store.get(GUEST_CAPTURE_REJECTIONS_KEY, { type: "json" });
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
