// Owner pages must not promise legal, HOA or regulatory compliance:
// seascape-hub context/owner-offer.md has no such service claim, and Sawyer
// replaced the Longboat Key and Siesta Key answers that did (agent-issues #102,
// 2026-11-25). The association or agency has the final word; owner copy says so.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const SEO_PAGES = path.join(__dirname, "..", "..", "src", "_data", "seoPages.json");

const COMPLIANCE_PROMISE_PATTERNS = [
  /\b(?:full|complete|total)\s+(?:legal\s+)?compliance\b/i,
  /\bensur\w*\b[^.]{0,60}?\bcomplian\w*/i,
  /\bcomply\s+fully\b/i,
  /\bhandles?\s+all\s+(?:licens|regulat|permit)\w*/i
];

// Live promises still waiting on Sawyer's wording ruling (agent-issues #105).
// Each entry exempts one occurrence of one exact match on one page; the guard
// fails if an entry no longer matches, so remove it when that page is fixed.
const PENDING_RULING = new Set([
  "new-vacation-rental-owner-guide-florida::handles all licensing",
  "new-vacation-rental-owner-guide-florida::ensuring your property operates in full legal compliance",
  "new-vacation-rental-owner-guide-florida::full legal compliance",
  "condo-rental-management-florida::comply fully"
]);

// Same reader-visible walk as content-voice.test.js: skip URL-like fields.
const NON_READER_FIELDS = new Set(["slug", "canonical", "image", "ogImage", "url", "ctaPath", "benchmarkUrl", "sourceUrl"]);
function readerVisibleText(entry) {
  const parts = [];
  const walk = (key, value) => {
    if (typeof value === "string") {
      if (NON_READER_FIELDS.has(key) || /^(https?:)?\/\//i.test(value.trim())) return;
      parts.push(value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => walk(key, item));
    } else if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) walk(k, v);
    }
  };
  walk("", entry);
  return parts.join("\n");
}

function scanCompliance(ownerEntries) {
  const violations = [];
  const exempted = new Map();
  for (const entry of ownerEntries) {
    const text = readerVisibleText(entry);
    for (const pattern of COMPLIANCE_PROMISE_PATTERNS) {
      const re = new RegExp(pattern.source, "gi");
      for (const match of text.matchAll(re)) {
        const key = `${entry.slug}::${match[0]}`;
        const seen = exempted.get(key) || 0;
        if (PENDING_RULING.has(key) && seen === 0) exempted.set(key, 1);
        else violations.push(key);
      }
    }
  }
  return { violations, exempted };
}
const complianceViolations = (entries) => scanCompliance(entries).violations;

test("owner pages make no legal or HOA compliance promise", () => {
  const { owner } = JSON.parse(fs.readFileSync(SEO_PAGES, "utf8"));
  assert.ok(owner.length > 0, "seoPages.json has no owner entries");
  const { violations, exempted } = scanCompliance(owner);
  assert.deepEqual(violations, []);
  const stale = [...PENDING_RULING].filter((key) => !exempted.has(key));
  assert.deepEqual(stale, [], "stale PENDING_RULING entry: that page was fixed, remove its exemption");
});

test("compliance guard catches the wording Sawyer replaced", () => {
  const replaced = [
    { slug: "x-longboat", faqs: [{ a: "We review all HOA regulations thoroughly and ensure your property operates in full compliance with community requirements." }] },
    { slug: "x-siesta", faqs: [{ a: "Seascape Vacations ensures full compliance with all applicable regulations and manages any HOA coordination required." }] },
    { slug: "x-condo", faqs: [{ a: "We position your rental to comply fully while maximizing revenue." }] },
    { slug: "x-guide", faqs: [{ a: "Seascape Vacations handles all licensing and regulatory requirements." }] }
  ];
  const found = complianceViolations(replaced).map((v) => v.split("::")[0]);
  assert.deepEqual([...new Set(found)].sort(), ["x-condo", "x-guide", "x-longboat", "x-siesta"]);
});

test("compliance guard leaves the approved answers alone", () => {
  const approved = [
    { slug: "x-longboat", faqs: [{ a: "On Longboat Key, your association's rules shape a rental as much as demand does. Condo and community rules can set a minimum stay, cap how many times a year your home can rent, require board approval first, or rule out short stays altogether, and two buildings side by side can answer differently. So we start with your documents, not a rate estimate. Send your association's rental rules with your listing, and the one-page review we send back, usually within 48 hours, will cover what looks right, what deserves a second look, and the questions we would put to your board or association manager. Their answer is the one that counts, and we plan the calendar and rates around it." }] },
    { slug: "x-siesta", faqs: [{ a: "Siesta Key rentals can involve several separate checks: whether your home needs a Florida vacation rental license, state and county tourist-tax registration, the rules Sarasota County has adopted for your address, and any association or condo restrictions on top. Each one is confirmed with the agency or association that sets it, and a tax account or platform listing does not settle the others. Send us your listing or your association's rental rules, and the one-page review we send back, usually within 48 hours, will cover what looks right, what deserves a second look, and what to confirm with each of them." }] }
  ];
  assert.deepEqual(complianceViolations(approved), []);
});

test("an exemption covers one occurrence on its page, not repeats", () => {
  const repeated = [{
    slug: "condo-rental-management-florida",
    faqs: [{ a: "We position your rental to comply fully." }, { a: "Owners comply fully too." }]
  }];
  assert.deepEqual(complianceViolations(repeated), ["condo-rental-management-florida::comply fully"]);
});
