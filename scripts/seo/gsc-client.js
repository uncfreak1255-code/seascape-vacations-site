const crypto = require("crypto");

const OAUTH2_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GSC_API_BASE_URL = "https://www.googleapis.com/webmasters/v3";
const DEFAULT_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const DEFAULT_GRANT_TYPE =
  "urn:ietf:params:oauth:grant-type:jwt-bearer";

function base64UrlEncode(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(String(value), "utf8");
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/u, "");
}

function decodeBase64Url(value) {
  const padded = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`;
  const normalized = padded.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function normalizeServiceAccountKey(privateKey) {
  return String(privateKey).replace(/\\n/g, "\n");
}

function normalizeScope(scope) {
  if (Array.isArray(scope)) {
    return scope.filter(Boolean).join(" ");
  }
  if (typeof scope === "string" && scope.trim().length > 0) {
    return scope.trim();
  }
  return DEFAULT_SCOPE;
}

function buildJwtAssertion(
  serviceAccount,
  options = {}
) {
  if (!serviceAccount || typeof serviceAccount !== "object") {
    throw new TypeError("serviceAccount is required");
  }

  const clientEmail = serviceAccount.client_email;
  const privateKey = normalizeServiceAccountKey(serviceAccount.private_key);

  if (!clientEmail || typeof clientEmail !== "string") {
    throw new TypeError("serviceAccount.client_email is required");
  }
  if (!privateKey || typeof privateKey !== "string") {
    throw new TypeError("serviceAccount.private_key is required");
  }

  const iat = Number.isFinite(options.issuedAt)
    ? Math.floor(options.issuedAt)
    : Math.floor(Date.now() / 1000);
  const expiresIn = Number.isFinite(options.expiresInSeconds)
    ? Math.floor(options.expiresInSeconds)
    : 3600;

  const header = {
    alg: "RS256",
    typ: "JWT"
  };
  const payload = {
    iss: clientEmail,
    scope: normalizeScope(options.scope),
    aud: OAUTH2_TOKEN_URL,
    iat,
    exp: iat + expiresIn
  };

  if (options.subject) {
    payload.sub = options.subject;
  }

  if (serviceAccount.private_key_id) {
    header.kid = serviceAccount.private_key_id;
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(privateKey);
  const encodedSignature = base64UrlEncode(signature);

  return `${signingInput}.${encodedSignature}`;
}

function buildTokenRequestBody(assertion) {
  const params = new URLSearchParams();
  params.set("grant_type", DEFAULT_GRANT_TYPE);
  params.set("assertion", assertion);
  return params;
}

function buildSearchAnalyticsUrl(siteUrl) {
  return `${GSC_API_BASE_URL}/sites/${encodeURIComponent(String(siteUrl))}/searchAnalytics/query`;
}

function normalizeSearchAnalyticsRows(response, options = {}) {
  const rows = Array.isArray(response && response.rows) ? response.rows : [];
  const dimensions = Array.isArray(options.dimensions)
    ? options.dimensions
    : options.dimensions
      ? [options.dimensions]
      : [];

  const dimensionHeaders =
    dimensions.length > 0
      ? dimensions
      : Array.isArray(response && response.dimensionHeaders)
        ? response.dimensionHeaders
        : [];

  const normalizedRows = rows.map((row) => {
    const keys = Array.isArray(row && row.keys) ? row.keys : [];
    const normalized = Object.assign({}, row);

    dimensionHeaders.forEach((name, index) => {
      normalized[name] = keys[index];
    });

    if (dimensionHeaders.length === 0) {
      keys.forEach((value, index) => {
        normalized[`key${index + 1}`] = value;
      });
    }

    if (normalized.keys) {
      delete normalized.keys;
    }

    return normalized;
  });

  return normalizedRows;
}

async function requestAccessToken(serviceAccount, fetchImpl = fetch) {
  const assertion = buildJwtAssertion(serviceAccount);
  const tokenResponse = await fetchImpl(OAUTH2_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: buildTokenRequestBody(assertion).toString()
  });

  const payload = await tokenResponse.json();
  if (!tokenResponse.ok) {
    const error = new Error(
      `Failed to fetch OAuth token: ${tokenResponse.status}`
    );
    error.status = tokenResponse.status;
    error.body = payload;
    throw error;
  }

  if (!payload || typeof payload.access_token !== "string") {
    throw new Error("Token response did not include access_token");
  }

  return payload.access_token;
}

async function querySearchAnalytics(serviceAccount, siteUrl, body, fetchImpl = fetch) {
  const accessToken = await requestAccessToken(serviceAccount, fetchImpl);
  const response = await fetchImpl(buildSearchAnalyticsUrl(siteUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(body || {})
  });
  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(
      `Search Console query failed: ${response.status}`
    );
    error.status = response.status;
    error.body = payload;
    throw error;
  }

  return {
    ...payload,
    rows: normalizeSearchAnalyticsRows(payload, {
      dimensions: body && body.dimensions
    })
  };
}

module.exports = {
  buildJwtAssertion,
  buildTokenRequestBody,
  buildSearchAnalyticsUrl,
  decodeBase64Url,
  normalizeSearchAnalyticsRows,
  requestAccessToken,
  querySearchAnalytics
};
