// Abuse controls for owner confirmation mail.
// Netlify managed reCAPTCHA gates the public forms; this rate limit is the
// in-function backstop so a captcha-passing relay cannot exhaust Graph quota.

const crypto = require("node:crypto");

const OWNER_LEAD_RATE_KEY_PREFIX = "owner_lead_mail_rate/";
const DEFAULT_MAX_PER_EMAIL_PER_HOUR = 3;
const DEFAULT_MAX_GLOBAL_PER_HOUR = 40;

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function hourBucket(now = new Date()) {
  return now.toISOString().slice(0, 13); // YYYY-MM-DDTHH UTC
}

function hashEmail(email) {
  return crypto
    .createHash("sha256")
    .update(normalizeText(email).toLowerCase())
    .digest("hex")
    .slice(0, 32);
}

function buildEmailRateKey(email, bucket = hourBucket()) {
  return `${OWNER_LEAD_RATE_KEY_PREFIX}email/${hashEmail(email)}/${bucket}`;
}

function buildGlobalRateKey(bucket = hourBucket()) {
  return `${OWNER_LEAD_RATE_KEY_PREFIX}global/${bucket}`;
}

function getOwnerLeadMailRateLimits(env = process.env) {
  const perEmail = Number.parseInt(
    String(env.OWNER_LEAD_MAIL_RATE_LIMIT_PER_EMAIL_HOUR || ""),
    10
  );
  const global = Number.parseInt(
    String(env.OWNER_LEAD_MAIL_RATE_LIMIT_GLOBAL_HOUR || ""),
    10
  );

  return {
    maxPerEmailPerHour:
      Number.isFinite(perEmail) && perEmail > 0 ? perEmail : DEFAULT_MAX_PER_EMAIL_PER_HOUR,
    maxGlobalPerHour:
      Number.isFinite(global) && global > 0 ? global : DEFAULT_MAX_GLOBAL_PER_HOUR
  };
}

async function readCounter(store, key) {
  if (!store || typeof store.get !== "function") {
    return 0;
  }

  try {
    const value = await store.get(key, { type: "json" });
    if (value && typeof value === "object") {
      const count = Number(value.count);
      return Number.isFinite(count) && count > 0 ? count : 0;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  } catch (_error) {
    try {
      const text = await store.get(key, { type: "text" });
      const parsed = Number.parseInt(String(text || ""), 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    } catch (_textError) {
      return 0;
    }
  }

  return 0;
}

async function writeCounter(store, key, count) {
  await store.set(
    key,
    JSON.stringify({ count, updatedAt: new Date().toISOString() }),
    { contentType: "application/json; charset=utf-8" }
  );
}

async function assertOwnerLeadMailAllowed(store, email, env = process.env, options = {}) {
  const normalizedEmail = normalizeText(email).toLowerCase();
  if (!normalizedEmail) {
    return { allowed: false, reason: "missing_email" };
  }

  if (!store || typeof store.get !== "function" || typeof store.set !== "function") {
    // Fail closed for mail when the rate store is unavailable. Contact capture
    // still happens before this check; a human notify remains the backstop.
    return { allowed: false, reason: "rate_store_unavailable" };
  }

  const submissionId = normalizeText(options.submissionId);
  if (submissionId) {
    const reservationKey = `${OWNER_LEAD_RATE_KEY_PREFIX}submission/${encodeURIComponent(submissionId)}`;
    const existingReservation = await readCounter(store, reservationKey);
    if (existingReservation > 0) {
      return {
        allowed: true,
        reserved: true,
        submissionId
      };
    }
  }

  const limits = getOwnerLeadMailRateLimits(env);
  const bucket = hourBucket();
  const emailKey = buildEmailRateKey(normalizedEmail, bucket);
  const globalKey = buildGlobalRateKey(bucket);

  const emailCount = await readCounter(store, emailKey);
  if (emailCount >= limits.maxPerEmailPerHour) {
    return {
      allowed: false,
      reason: "rate_limited",
      scope: "email",
      count: emailCount,
      limit: limits.maxPerEmailPerHour
    };
  }

  const globalCount = await readCounter(store, globalKey);
  if (globalCount >= limits.maxGlobalPerHour) {
    return {
      allowed: false,
      reason: "rate_limited",
      scope: "global",
      count: globalCount,
      limit: limits.maxGlobalPerHour
    };
  }

  await writeCounter(store, emailKey, emailCount + 1);
  await writeCounter(store, globalKey, globalCount + 1);
  if (submissionId) {
    await writeCounter(
      store,
      `${OWNER_LEAD_RATE_KEY_PREFIX}submission/${encodeURIComponent(submissionId)}`,
      1
    );
  }

  return {
    allowed: true,
    emailCount: emailCount + 1,
    globalCount: globalCount + 1,
    bucket
  };
}

module.exports = {
  OWNER_LEAD_RATE_KEY_PREFIX,
  DEFAULT_MAX_PER_EMAIL_PER_HOUR,
  DEFAULT_MAX_GLOBAL_PER_HOUR,
  hourBucket,
  hashEmail,
  buildEmailRateKey,
  buildGlobalRateKey,
  getOwnerLeadMailRateLimits,
  assertOwnerLeadMailAllowed
};
