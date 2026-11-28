const dns = require("dns");

// Rejects only an email domain that DNS says definitively cannot take mail:
// the name does not exist, it publishes a null MX (RFC 7505), or it has no MX
// and no address record to fall back on (RFC 5321 implicit MX). Any other DNS
// outcome (timeout, SERVFAIL, refused, resolver down) lets the signup through,
// so a slow or broken resolver never costs a real guest's signup.
const DOMAIN_CHECK_TIMEOUT_MS = 1500;
const NO_SUCH_RECORD = new Set(["ENOTFOUND", "ENODATA"]);

// One try per query with its own timeout, so an abandoned query stops retrying.
function boundedResolver() {
  return new dns.promises.Resolver({ timeout: DOMAIN_CHECK_TIMEOUT_MS, tries: 1 });
}

const state = { resolver: boundedResolver() };

function emailDomain(email) {
  const value = String(email || "").trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at < 1 || at === value.length - 1) return "";
  return value.slice(at + 1).replace(/\.$/, "");
}

function withTimeout(promise, timeoutMs) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error("dns lookup timed out");
      error.code = "ETIMEOUT";
      reject(error);
    }, timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Resolves to records (array), "nxdomain" (the name does not exist), "none"
// (the name exists without this record) or "unknown" (any other failure).
async function lookup(fn, domain, timeoutMs) {
  try {
    const records = await withTimeout(fn(domain), timeoutMs);
    return Array.isArray(records) && records.length ? records : "none";
  } catch (error) {
    if (error && error.code === "ENOTFOUND") return "nxdomain";
    return error && NO_SUCH_RECORD.has(error.code) ? "none" : "unknown";
  }
}

async function checkEmailDomain(email, { resolver = state.resolver, timeoutMs = DOMAIN_CHECK_TIMEOUT_MS } = {}) {
  const domain = emailDomain(email);
  if (!domain) return { deliverable: true, reason: "no_domain_parsed" };

  const mx = await lookup((name) => resolver.resolveMx(name), domain, timeoutMs);
  if (mx === "unknown") return { deliverable: true, reason: "dns_unavailable" };
  if (mx === "nxdomain") return { deliverable: false, reason: "no_such_domain" };
  if (Array.isArray(mx)) {
    const nullMx = mx.every((record) => !record || record.exchange === "" || record.exchange === ".");
    return nullMx
      ? { deliverable: false, reason: "null_mx" }
      : { deliverable: true, reason: "mx" };
  }

  const [a, aaaa] = await Promise.all([
    lookup((name) => resolver.resolve4(name), domain, timeoutMs),
    lookup((name) => resolver.resolve6(name), domain, timeoutMs)
  ]);
  if (Array.isArray(a) || Array.isArray(aaaa)) return { deliverable: true, reason: "address_fallback" };
  if (a === "unknown" || aaaa === "unknown") return { deliverable: true, reason: "dns_unavailable" };
  return { deliverable: false, reason: "no_mail_records" };
}

// Tests swap the resolver here so they never reach real DNS.
function setDomainResolver(resolver) {
  state.resolver = resolver || boundedResolver();
}

module.exports = {
  DOMAIN_CHECK_TIMEOUT_MS,
  checkEmailDomain,
  emailDomain,
  setDomainResolver
};
