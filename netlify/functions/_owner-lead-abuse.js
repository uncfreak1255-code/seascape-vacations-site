// Abuse controls for owner confirmation mail.
// The rate bucket is one conditional Blobs record so email, global, and
// submission reservations are claimed atomically as one operation.

const crypto = require("node:crypto");

const OWNER_LEAD_RATE_KEY_PREFIX = "owner_lead_mail_rate/";
const OWNER_LEAD_RATE_BUCKET_KEY_PREFIX = OWNER_LEAD_RATE_KEY_PREFIX + "bucket/";
const MAX_RATE_WRITE_ATTEMPTS = 5;
const DEFAULT_MAX_PER_EMAIL_PER_HOUR = 3;
const DEFAULT_MAX_GLOBAL_PER_HOUR = 40;

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function hourBucket(now = new Date()) {
  return now.toISOString().slice(0, 13);
}

function hashEmail(email) {
  return crypto.createHash("sha256").update(normalizeText(email).toLowerCase()).digest("hex").slice(0, 32);
}

function buildEmailRateKey(email, bucket = hourBucket()) {
  return OWNER_LEAD_RATE_KEY_PREFIX + "email/" + hashEmail(email) + "/" + bucket;
}

function buildGlobalRateKey(bucket = hourBucket()) {
  return OWNER_LEAD_RATE_KEY_PREFIX + "global/" + bucket;
}

function buildRateBucketKey(bucket = hourBucket()) {
  return OWNER_LEAD_RATE_BUCKET_KEY_PREFIX + bucket + ".json";
}

function getOwnerLeadMailRateLimits(env = process.env) {
  const perEmail = Number.parseInt(String(env.OWNER_LEAD_MAIL_RATE_LIMIT_PER_EMAIL_HOUR || ""), 10);
  const global = Number.parseInt(String(env.OWNER_LEAD_MAIL_RATE_LIMIT_GLOBAL_HOUR || ""), 10);
  return {
    maxPerEmailPerHour: Number.isFinite(perEmail) && perEmail > 0 ? perEmail : DEFAULT_MAX_PER_EMAIL_PER_HOUR,
    maxGlobalPerHour: Number.isFinite(global) && global > 0 ? global : DEFAULT_MAX_GLOBAL_PER_HOUR
  };
}

function emptyRateBucket() {
  return { globalCount: 0, emailCounts: {}, submissions: {} };
}

function normalizeRateBucket(value) {
  if (!value || typeof value !== "object") return emptyRateBucket();
  const globalCount = Number(value.globalCount);
  return {
    globalCount: Number.isFinite(globalCount) && globalCount > 0 ? globalCount : 0,
    emailCounts: value.emailCounts && typeof value.emailCounts === "object" ? { ...value.emailCounts } : {},
    submissions: value.submissions && typeof value.submissions === "object" ? { ...value.submissions } : {}
  };
}

async function readRateBucket(store, key) {
  if (!store || typeof store.get !== "function") return { available: false, reason: "rate_store_unavailable" };
  if (typeof store.getWithMetadata === "function") {
    try {
      const result = await store.getWithMetadata(key, { type: "json" });
      return { available: true, value: normalizeRateBucket(result && result.data), etag: result && result.etag, exists: Boolean(result) };
    } catch (_error) {
      return { available: false, reason: "rate_store_unavailable" };
    }
  }
  try {
    const raw = await store.get(key, { type: "json" });
    return { available: true, value: normalizeRateBucket(raw), etag: undefined, exists: raw != null };
  } catch (_error) {
    return { available: false, reason: "rate_store_unavailable" };
  }
}

async function writeRateBucket(store, key, record, value) {
  const options = { contentType: "application/json; charset=utf-8" };
  if (record.etag) options.onlyIfMatch = record.etag;
  else if (!record.exists && typeof store.getWithMetadata === "function") options.onlyIfNew = true;
  return store.set(key, JSON.stringify(value), options);
}

async function assertOwnerLeadMailAllowed(store, email, env = process.env, options = {}) {
  const normalizedEmail = normalizeText(email).toLowerCase();
  if (!normalizedEmail) return { allowed: false, reason: "missing_email" };
  if (!store || typeof store.get !== "function" || typeof store.set !== "function") return { allowed: false, reason: "rate_store_unavailable" };
  const limits = getOwnerLeadMailRateLimits(env);
  const bucket = hourBucket();
  const key = buildRateBucketKey(bucket);
  const emailHash = hashEmail(normalizedEmail);
  const submissionId = normalizeText(options.submissionId);
  const encodedSubmissionId = submissionId ? encodeURIComponent(submissionId) : "";

  for (let attempt = 0; attempt < MAX_RATE_WRITE_ATTEMPTS; attempt += 1) {
    const record = await readRateBucket(store, key);
    if (!record.available) return { allowed: false, reason: record.reason };
    const current = record.value;
    if (encodedSubmissionId && current.submissions[encodedSubmissionId]) return { allowed: true, reserved: true, submissionId };
    const emailCount = Number(current.emailCounts[emailHash] || 0);
    if (emailCount >= limits.maxPerEmailPerHour) return { allowed: false, reason: "rate_limited", scope: "email", count: emailCount, limit: limits.maxPerEmailPerHour };
    if (current.globalCount >= limits.maxGlobalPerHour) return { allowed: false, reason: "rate_limited", scope: "global", count: current.globalCount, limit: limits.maxGlobalPerHour };
    const next = {
      globalCount: current.globalCount + 1,
      emailCounts: { ...current.emailCounts, [emailHash]: emailCount + 1 },
      submissions: encodedSubmissionId ? { ...current.submissions, [encodedSubmissionId]: true } : current.submissions
    };
    try {
      const result = await writeRateBucket(store, key, record, next);
      if (result && result.modified === false) continue;
      return { allowed: true, emailCount: emailCount + 1, globalCount: next.globalCount, bucket };
    } catch (_error) {
      if (attempt + 1 < MAX_RATE_WRITE_ATTEMPTS) continue;
      return { allowed: false, reason: "rate_store_conflict" };
    }
  }
  return { allowed: false, reason: "rate_store_conflict" };
}

module.exports = {
  OWNER_LEAD_RATE_KEY_PREFIX,
  OWNER_LEAD_RATE_BUCKET_KEY_PREFIX,
  DEFAULT_MAX_PER_EMAIL_PER_HOUR,
  DEFAULT_MAX_GLOBAL_PER_HOUR,
  hourBucket,
  hashEmail,
  buildEmailRateKey,
  buildGlobalRateKey,
  buildRateBucketKey,
  getOwnerLeadMailRateLimits,
  emptyRateBucket,
  normalizeRateBucket,
  assertOwnerLeadMailAllowed
}
