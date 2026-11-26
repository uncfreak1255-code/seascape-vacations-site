// Owner pages must not promise legal, HOA or regulatory compliance:
// seascape-hub context/owner-offer.md has no such service claim, and Sawyer
// replaced the answers that did: Longboat Key and Siesta Key (agent-issues #102,
// 2026-11-25), the Florida new-owner guide and the condo page (#105,
// 2026-11-26). The association or agency has the final word; owner copy says so.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const SEO_PAGES = path.join(__dirname, "..", "..", "src", "_data", "seoPages.json");

const COMPLIANCE_PROMISE_PATTERNS = [
  /\b(?:full|complete|total)\s+(?:legal\s+)?compliance\b/i,
  /\bensur\w*\b[^.]{0,60}?\bcomplian\w*/i,
  /\bcomply\s+fully\b/i,
  /\bhandles?\s+all\s+(?:licens|regulat|permit)\w*/i,
  /\bHOA\s+(?:rules?\s+)?compliance\b/i
];

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

function complianceViolations(ownerEntries) {
  const violations = [];
  for (const entry of ownerEntries) {
    const text = readerVisibleText(entry);
    for (const pattern of COMPLIANCE_PROMISE_PATTERNS) {
      const re = new RegExp(pattern.source, "gi");
      for (const match of text.matchAll(re)) violations.push(`${entry.slug}::${match[0]}`);
    }
  }
  return violations;
}

test("owner pages make no legal or HOA compliance promise", () => {
  const { owner } = JSON.parse(fs.readFileSync(SEO_PAGES, "utf8"));
  assert.ok(owner.length > 0, "seoPages.json has no owner entries");
  assert.deepEqual(complianceViolations(owner), []);
});

test("compliance guard catches the wording Sawyer replaced", () => {
  const replaced = [
    { slug: "x-longboat", faqs: [{ a: "We review all HOA regulations thoroughly and ensure your property operates in full compliance with community requirements." }] },
    { slug: "x-siesta", faqs: [{ a: "Seascape Vacations ensures full compliance with all applicable regulations and manages any HOA coordination required." }] },
    { slug: "x-condo", faqs: [{ a: "We position your rental to comply fully while maximizing revenue." }] },
    { slug: "x-guide", faqs: [{ a: "Seascape Vacations handles all licensing and regulatory requirements." }] },
    { slug: "x-condo-service", description: "Vacation rental management for Florida condos. HOA compliance, marketing, guest services.", benefits: ["HOA rules compliance"] }
  ];
  const found = complianceViolations(replaced).map((v) => v.split("::")[0]);
  assert.deepEqual([...new Set(found)].sort(), ["x-condo", "x-condo-service", "x-guide", "x-longboat", "x-siesta"]);
});

test("compliance guard leaves the approved answers alone", () => {
  const approved = [
    { slug: "x-longboat", faqs: [{ a: "On Longboat Key, your association's rules shape a rental as much as demand does. Condo and community rules can set a minimum stay, cap how many times a year your home can rent, require board approval first, or rule out short stays altogether, and two buildings side by side can answer differently. So we start with your documents, not a rate estimate. Send your association's rental rules with your listing, and the one-page review we send back, usually within 48 hours, will cover what looks right, what deserves a second look, and the questions we would put to your board or association manager. Their answer is the one that counts, and we plan the calendar and rates around it." }] },
    { slug: "x-siesta", faqs: [{ a: "Siesta Key rentals can involve several separate checks: whether your home needs a Florida vacation rental license, state and county tourist-tax registration, the rules Sarasota County has adopted for your address, and any association or condo restrictions on top. Each one is confirmed with the agency or association that sets it, and a tax account or platform listing does not settle the others. Send us your listing or your association's rental rules, and the one-page review we send back, usually within 48 hours, will cover what looks right, what deserves a second look, and what to confirm with each of them." }] }
  ];
  assert.deepEqual(complianceViolations(approved), []);
});
