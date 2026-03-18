const test = require("node:test");
const assert = require("node:assert/strict");
const { generateKeyPairSync } = require("crypto");

const {
  buildJwtAssertion,
  buildTokenRequestBody,
  buildSearchAnalyticsUrl,
  decodeBase64Url,
  normalizeSearchAnalyticsRows
} = require("../seo/gsc-client");

const { privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: {
    type: "pkcs1",
    format: "pem"
  },
  publicKeyEncoding: {
    type: "pkcs1",
    format: "pem"
  }
});

test("buildJwtAssertion includes RS256 header and expected claim payload", () => {
  const serviceAccount = {
    client_email: "test@project.iam.gserviceaccount.com",
    private_key: privateKey
  };
  const issuedAt = 1710000000;

  const assertion = buildJwtAssertion(serviceAccount, { issuedAt });
  const [headerB64, payloadB64, signature] = assertion.split(".");

  assert.equal(headerB64.length > 0, true);
  assert.equal(payloadB64.length > 0, true);
  assert.equal(signature.length > 0, true);

  const header = JSON.parse(decodeBase64Url(headerB64));
  const payload = JSON.parse(decodeBase64Url(payloadB64));

  assert.equal(header.alg, "RS256");
  assert.equal(header.typ, "JWT");
  assert.equal(payload.iss, serviceAccount.client_email);
  assert.equal(
    payload.scope,
    "https://www.googleapis.com/auth/webmasters.readonly"
  );
  assert.equal(payload.aud, "https://oauth2.googleapis.com/token");
  assert.equal(payload.iat, issuedAt);
  assert.equal(payload.exp, issuedAt + 3600);
});

test("buildTokenRequestBody shapes OAuth token POST body", () => {
  const assertion = "abc.def.ghi";
  const body = buildTokenRequestBody(assertion);

  assert.equal(body.get("grant_type"), "urn:ietf:params:oauth:grant-type:jwt-bearer");
  assert.equal(body.get("assertion"), assertion);
  assert.equal(
    body.toString(),
    "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=abc.def.ghi"
  );
});

test("buildSearchAnalyticsUrl URL-encodes site URL path segment", () => {
  const siteUrl = "https://www.example.com/beach-villas?room=2#overview";
  const url = buildSearchAnalyticsUrl(siteUrl);

  assert.equal(
    url,
    "https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fwww.example.com%2Fbeach-villas%3Froom%3D2%23overview/searchAnalytics/query"
  );
});

test("normalizeSearchAnalyticsRows maps keys to dimension names", () => {
  const response = {
    rows: [
      {
        keys: ["florida", "https://www.example.com/page-1"],
        clicks: 12,
        impressions: 140,
        ctr: 0.0857,
        position: 4.2
      },
      {
        keys: ["sarasota", "https://www.example.com/page-2"],
        clicks: 4,
        impressions: 24,
        ctr: 0.1667,
        position: 2.6
      }
    ]
  };

  const normalized = normalizeSearchAnalyticsRows(response, {
    dimensions: ["query", "page"]
  });

  assert.deepEqual(normalized, [
    {
      query: "florida",
      page: "https://www.example.com/page-1",
      clicks: 12,
      impressions: 140,
      ctr: 0.0857,
      position: 4.2
    },
    {
      query: "sarasota",
      page: "https://www.example.com/page-2",
      clicks: 4,
      impressions: 24,
      ctr: 0.1667,
      position: 2.6
    }
  ]);
});
