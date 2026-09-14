"use strict";

const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  assertEnforcedCsp,
  parseCspDirectives,
  parseNetlifyHeaderValues
} = require("./csp-headers");

const projectRoot = path.resolve(__dirname, "..", "..");

const VALID_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
  "img-src 'self' data: https://bookingenginecdn.hostaway.com https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com/recaptcha/",
  "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://stats.g.doubleclick.net https://bookingenginecdn.hostaway.com https://www.google.com/recaptcha/",
  "frame-src 'self' https://book.seascape-vacations.com https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
  "form-action 'self' https://book.seascape-vacations.com",
  "frame-ancestors 'none'"
].join("; ");

function tomlWithPolicy({ policy = VALID_POLICY, reportOnly = null, hsts = "max-age=31536000", extraComment = "" } = {}) {
  const reportOnlyLine = reportOnly
    ? `    Content-Security-Policy-Report-Only = "${reportOnly}"\n`
    : "";

  return `
${extraComment}
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "${hsts}"
    Content-Security-Policy = "${policy}"
${reportOnlyLine}`;
}

test("repo netlify.toml enforces CSP with recaptcha, Hostaway, and GTM origins", () => {
  const toml = fs.readFileSync(path.join(projectRoot, "netlify.toml"), "utf8");
  const result = assertEnforcedCsp(toml);
  const headers = parseNetlifyHeaderValues(toml, "/*");

  assert.equal(result.reportOnly, null);
  assert.ok(result.directives.get("frame-ancestors").includes("'none'"));
  assert.ok(result.directives.get("script-src").includes("https://www.google.com/recaptcha/"));
  assert.ok(result.directives.get("script-src").includes("https://www.gstatic.com/recaptcha/"));
  assert.ok(result.directives.get("frame-src").includes("https://www.google.com/recaptcha/"));
  assert.ok(result.directives.get("connect-src").includes("https://www.google.com/recaptcha/"));
  assert.ok(result.directives.get("connect-src").includes("https://stats.g.doubleclick.net"));
  assert.doesNotMatch(toml, /Content-Security-Policy-Report-Only/);
  assert.doesNotMatch(headers["Strict-Transport-Security"], /preload/);
});

test("CSP guard fails closed on an empty or missing enforced policy", () => {
  assert.throws(() => assertEnforcedCsp(""), /missing or empty/);
  assert.throws(() => assertEnforcedCsp(tomlWithPolicy({ policy: "" })), /missing or empty/);
  assert.throws(
    () => assertEnforcedCsp(`
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy-Report-Only = "${VALID_POLICY}"
`),
    /missing or empty/
  );
});

test("CSP guard rejects report-only unless a documented stricter pairing exists", () => {
  assert.throws(
    () => assertEnforcedCsp(tomlWithPolicy({ reportOnly: "default-src 'none'; frame-ancestors 'none'" })),
    /without a documented stricter pairing/
  );

  assert.throws(
    () => assertEnforcedCsp(tomlWithPolicy({
      reportOnly: VALID_POLICY,
      extraComment: "# report-only pairing kept as a canary"
    })),
    /duplicates the enforced policy/
  );

  assert.doesNotThrow(() => {
    assertEnforcedCsp(tomlWithPolicy({
      reportOnly: "default-src 'none'; frame-ancestors 'none'",
      extraComment: "# report-only pairing is a documented stricter report-only canary"
    }));
  });
});

test("CSP guard requires recaptcha, Hostaway, GTM origins and forbids https: wildcards", () => {
  assert.throws(
    () => assertEnforcedCsp(tomlWithPolicy({
      policy: VALID_POLICY.replace(" https://www.google.com/recaptcha/", "")
    })),
    /missing required reCAPTCHA origins/
  );

  assert.throws(
    () => assertEnforcedCsp(tomlWithPolicy({
      policy: VALID_POLICY.replace(" https://book.seascape-vacations.com", "")
    })),
    /missing required Hostaway origins/
  );

  assert.throws(
    () => assertEnforcedCsp(tomlWithPolicy({
      policy: VALID_POLICY.replace(" https://stats.g.doubleclick.net", "")
    })),
    /missing required GTM\/GA origins/
  );

  assert.throws(
    () => assertEnforcedCsp(tomlWithPolicy({
      policy: VALID_POLICY.replace("frame-ancestors 'none'", "frame-ancestors 'self'")
    })),
    /frame-ancestors 'none'/
  );

  assert.throws(
    () => assertEnforcedCsp(tomlWithPolicy({
      policy: VALID_POLICY.replace(
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
        "script-src 'self' https:"
      )
    })),
    /broad https/
  );

  assert.throws(
    () => assertEnforcedCsp(tomlWithPolicy({ hsts: "max-age=31536000; includeSubDomains; preload" })),
    /HSTS preload/
  );
});

test("CSP parser reads the sitewide netlify.toml header block", () => {
  const headers = parseNetlifyHeaderValues(tomlWithPolicy(), SITEWIDE_ROUTE_PLACEHOLDER());
  assert.equal(headers["Content-Security-Policy"], VALID_POLICY);
  const directives = parseCspDirectives(VALID_POLICY);
  assert.deepEqual(directives.get("frame-ancestors"), ["'none'"]);
});

function SITEWIDE_ROUTE_PLACEHOLDER() {
  return "/*";
}
