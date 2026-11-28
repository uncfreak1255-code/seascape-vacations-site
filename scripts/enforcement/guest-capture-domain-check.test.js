const test = require("node:test");
const assert = require("node:assert/strict");
const { checkEmailDomain, emailDomain, setDomainResolver } = require("../../netlify/functions/_guest-capture-domain-check");
const { handleGuestEmailCapture, CAPTURE_STATES } = require("../../netlify/functions/guest-email-capture");
const { createMemoryStore } = require("./fixtures/guest-capture-store");
const { useAcceptAllDomains } = require("./fixtures/accept-all-dns");
const { GUEST_CAPTURE_REJECTIONS_KEY } = require("../../netlify/functions/_guest-capture-rejection-metrics");

function dnsError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

// Each record type maps to records, a DNS error code, or "hang" (never settles).
function resolver({ mx = [], a = [], aaaa = [] } = {}) {
  const answer = (value) => {
    if (value === "hang") return new Promise(() => {});
    if (typeof value === "string") return Promise.reject(dnsError(value));
    return Promise.resolve(value);
  };
  return { resolveMx: () => answer(mx), resolve4: () => answer(a), resolve6: () => answer(aaaa) };
}

const check = (email, records, timeoutMs = 50) => checkEmailDomain(email, { resolver: resolver(records), timeoutMs });

test("emailDomain takes the part after the last @", () => {
  assert.equal(emailDomain(" Guest@Gmail.COM "), "gmail.com");
  assert.equal(emailDomain("no-at-sign"), "");
});

test("a domain with MX records is deliverable", async () => {
  assert.equal((await check("a@gmail.com", { mx: [{ exchange: "gmail-smtp-in.l.google.com", priority: 5 }] })).deliverable, true);
});

test("a domain with no MX and no address record is refused", async () => {
  const result = await check("a@gmial.com", { mx: "ENODATA", a: "ENOTFOUND", aaaa: "ENODATA" });
  assert.deepEqual(result, { deliverable: false, reason: "no_mail_records" });
});

test("a domain that does not exist is refused without address lookups", async () => {
  let addressLookups = 0;
  const result = await checkEmailDomain("a@gmial-nope.com", {
    resolver: { resolveMx: () => Promise.reject(dnsError("ENOTFOUND")), resolve4: async () => { addressLookups++; return []; }, resolve6: async () => { addressLookups++; return []; } },
    timeoutMs: 50
  });
  assert.deepEqual(result, { deliverable: false, reason: "no_such_domain" });
  assert.equal(addressLookups, 0);
});

test("a null MX (RFC 7505) is refused", async () => {
  assert.deepEqual(await check("a@example.com", { mx: [{ exchange: ".", priority: 0 }] }), { deliverable: false, reason: "null_mx" });
  assert.equal((await check("a@example.com", { mx: [{ exchange: "", priority: 0 }] })).deliverable, false);
});

test("no MX but an address record falls back to deliverable (implicit MX)", async () => {
  assert.equal((await check("a@small.biz", { mx: "ENODATA", a: ["192.0.2.1"], aaaa: "ENODATA" })).deliverable, true);
});

test("DNS trouble never refuses a signup", async () => {
  for (const code of ["ETIMEOUT", "ESERVFAIL", "EREFUSED", "ECONNREFUSED"]) {
    assert.equal((await check("a@gmail.com", { mx: code })).deliverable, true, code);
    assert.equal((await check("a@gmail.com", { mx: "ENODATA", a: code, aaaa: "ENODATA" })).deliverable, true, `address ${code}`);
  }
  assert.deepEqual(await check("a@gmail.com", { mx: "hang" }), { deliverable: true, reason: "dns_unavailable" });
});

function captureEvent(email) {
  return {
    httpMethod: "POST",
    headers: { origin: "https://seascape-vacations.com" },
    body: JSON.stringify({
      name: "Maria",
      email,
      pagePath: "/",
      placement: "home_inline",
      formStartedAt: new Date(Date.now() - 10000).toISOString()
    })
  };
}

test("the capture function refuses an undeliverable domain before Mailchimp and counts it", async (t) => {
  setDomainResolver(resolver({ mx: "ENOTFOUND", a: "ENOTFOUND", aaaa: "ENOTFOUND" }));
  t.after(useAcceptAllDomains);
  const store = createMemoryStore();
  let mailchimpCalls = 0;
  const response = await handleGuestEmailCapture(captureEvent("maria@gmial.com"), undefined, store, async () => { mailchimpCalls++; throw new Error("must not call"); });
  assert.equal(response.statusCode, 422);
  assert.equal(JSON.parse(response.body).captureState, CAPTURE_STATES.REJECTED);
  assert.equal(JSON.parse(response.body).reason, "rejected");
  assert.equal(mailchimpCalls, 0);
  const record = JSON.parse(store.values.get(GUEST_CAPTURE_REJECTIONS_KEY));
  assert.deepEqual(record.byReason, { undeliverable_domain: 1 });
  assert.deepEqual(record.byPlacement, { home_inline: 1 });
});
