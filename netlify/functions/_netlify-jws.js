const crypto = require("node:crypto");

const OWNER_LEAD_FORM_WEBHOOK_SECRET_ENV = "OWNER_LEAD_FORM_WEBHOOK_SECRET";

function normalizeSecret(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function getOwnerLeadFormWebhookSecret(env = process.env) {
  return normalizeSecret(env && env[OWNER_LEAD_FORM_WEBHOOK_SECRET_ENV]);
}

function base64UrlToBuffer(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + "=".repeat(padLength), "base64");
}

function decodeJwtPart(value) {
  try {
    return JSON.parse(base64UrlToBuffer(value).toString("utf8"));
  } catch (_error) {
    return null;
  }
}

function timingSafeEqualStrings(left, right) {
  const leftBuffer = Buffer.from(String(left || ""), "utf8");
  const rightBuffer = Buffer.from(String(right || ""), "utf8");
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function readRawBody(event) {
  if (!event || typeof event.body !== "string") return "";
  if (event.isBase64Encoded) {
    try {
      return Buffer.from(event.body, "base64").toString("utf8");
    } catch (_error) {
      return "";
    }
  }
  return event.body;
}

/**
 * Verify Netlify outgoing-webhook JWS (HS256).
 * Claims required: iss === "netlify", sha256 === hex SHA-256 of raw body.
 * Fail closed: missing secret, missing/invalid token, bad issuer, or body mismatch.
 */
function verifyNetlifyWebhookJws(signatureHeader, rawBody, secret) {
  const token = typeof signatureHeader === "string" ? signatureHeader.trim() : "";
  const sharedSecret = normalizeSecret(secret);
  if (!sharedSecret) {
    return { ok: false, reason: "missing_webhook_secret" };
  }
  if (!token) {
    return { ok: false, reason: "missing_signature" };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { ok: false, reason: "invalid_signature_format" };
  }

  const [headerPart, payloadPart, signaturePart] = parts;
  const header = decodeJwtPart(headerPart);
  const payload = decodeJwtPart(payloadPart);
  if (!header || !payload) {
    return { ok: false, reason: "invalid_signature_payload" };
  }
  if (String(header.alg || "").toUpperCase() !== "HS256") {
    return { ok: false, reason: "invalid_signature_alg" };
  }
  if (String(payload.iss || "") !== "netlify") {
    return { ok: false, reason: "invalid_signature_issuer" };
  }

  const signingInput = `${headerPart}.${payloadPart}`;
  const expectedSignature = crypto
    .createHmac("sha256", sharedSecret)
    .update(signingInput, "utf8")
    .digest("base64url");

  if (!timingSafeEqualStrings(expectedSignature, signaturePart)) {
    return { ok: false, reason: "invalid_signature" };
  }

  const claimedHash = String(payload.sha256 || "").toLowerCase();
  const bodyHash = crypto.createHash("sha256").update(rawBody || "", "utf8").digest("hex");
  if (!claimedHash || !timingSafeEqualStrings(claimedHash, bodyHash)) {
    return { ok: false, reason: "body_hash_mismatch" };
  }

  return { ok: true, reason: "verified" };
}

function signNetlifyWebhookJws(rawBody, secret) {
  const sharedSecret = normalizeSecret(secret);
  if (!sharedSecret) {
    throw new Error("missing_webhook_secret");
  }
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const sha256 = crypto.createHash("sha256").update(rawBody || "", "utf8").digest("hex");
  const payload = Buffer.from(JSON.stringify({ iss: "netlify", sha256 })).toString("base64url");
  const signingInput = `${header}.${payload}`;
  const signature = crypto
    .createHmac("sha256", sharedSecret)
    .update(signingInput, "utf8")
    .digest("base64url");
  return `${signingInput}.${signature}`;
}

module.exports = {
  OWNER_LEAD_FORM_WEBHOOK_SECRET_ENV,
  getOwnerLeadFormWebhookSecret,
  readRawBody,
  verifyNetlifyWebhookJws,
  signNetlifyWebhookJws
};
