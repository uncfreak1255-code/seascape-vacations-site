const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..", "..");
const GUIDE_PATH = path.join(
  root,
  "src",
  "guides",
  "bradenton-vs-sarasota-for-families",
  "index.html"
);

function requireNonEmptySource(source, label) {
  assert.ok(String(source || "").trim(), `${label} must not be empty`);
  return source;
}

function readFamilyGuide() {
  return requireNonEmptySource(
    fs.readFileSync(GUIDE_PATH, "utf8"),
    "family comparison guide source"
  );
}

function rentalFaqAnswer(source) {
  const match = source.match(
    /How much does a family vacation rental cost in Bradenton vs Sarasota\?<\/h3>\s*<p>([\s\S]*?)<\/p>/
  );
  assert.ok(match, "visible rental-cost FAQ is missing");
  return match[1].replace(/\s+/g, " ").trim();
}

function rentalJsonLdAnswer(source) {
  const scripts = [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const parsed = scripts.map((match) => JSON.parse(match[1]));
  const faq = parsed.find((block) => block["@type"] === "FAQPage");
  assert.ok(faq, "FAQPage JSON-LD is missing");
  const question = faq.mainEntity.find(
    (entity) => entity.name === "How much does a family vacation rental cost in Bradenton vs Sarasota?"
  );
  assert.ok(question, "rental-cost FAQPage question is missing");
  return String(question.acceptedAnswer.text).replace(/\s+/g, " ").trim();
}

test("empty or missing visitor-fact source fails closed", () => {
  assert.throws(
    () => requireNonEmptySource("", "family comparison guide source"),
    /must not be empty/
  );
  assert.throws(
    () => requireNonEmptySource("   ", "family comparison guide source"),
    /must not be empty/
  );
});

test("family comparison guide source is present and dated 2026-09-12", () => {
  const source = readFamilyGuide();

  assert.match(source, /"dateModified": "2026-09-12"/);
  assert.match(source, />Updated September 12, 2026</);
  assert.doesNotMatch(source, /"dateModified": "2026-03-08"/);
  assert.doesNotMatch(source, />Updated March 2026</);
});

test("family comparison guide keeps sourced ticket dollars and official links", () => {
  const source = readFamilyGuide();

  for (const required of [
    "Bishop Museum ($25/adult)",
    "($25/adult, ages 4 and under free)",
    'href="https://bishopscience.org/"',
    "Ringling Museum ($30/adult)",
    "($30/adult, under 6 free)",
    'href="https://www.ringling.org/tickets-admission/"',
    "Mote SEA (prices vary by date)",
    'href="https://mote.org/aquarium/sea-visitor-information/"',
    'href="https://bigcathabitat.org/"',
    'href="https://www.floridastateparks.org/parks-and-trails/myakka-river-state-park"',
    'href="https://www.mlb.com/pirates/tickets/spring-training"',
    "From $550/night",
    "From $450/night"
  ]) {
    assert.match(source, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("family comparison guide drops stale and unsourced dollars", () => {
  const source = readFamilyGuide();

  for (const stale of [
    "$22/adult",
    "$24/adult",
    "$20/adult",
    "$6/car",
    "Tickets start around $15",
    "$275",
    "$875",
    "$1,225",
    "$1,050",
    "Flippers",
    "Mote Marine Laboratory",
    "under 5 free",
    "kids under 3 free",
    "family of five eats for $80"
  ]) {
    assert.doesNotMatch(source, new RegExp(stale.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("family comparison rental FAQ matches JSON-LD and names no invented average", () => {
  const source = readFamilyGuide();
  const visible = rentalFaqAnswer(source);
  const jsonLd = rentalJsonLdAnswer(source);

  assert.equal(visible, jsonLd);
  assert.match(visible, /Compare live totals on the property pages rather than a published average\./);
  assert.doesNotMatch(visible, /\$\d/);
});
