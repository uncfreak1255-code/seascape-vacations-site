"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const pages = require("../../src/_data/seoPages.json");

const root = path.resolve(__dirname, "..", "..");
const amiCompanies = fs.readFileSync(
  path.join(root, "src", "guides", "best-vacation-rental-companies-ami.html"),
  "utf8"
);

function vacationer(slug) {
  return pages.vacationer.find((item) => item.slug === slug);
}

function assertNamedSeascape(text, label) {
  if (!text) {
    throw new Error(`${label} is required`);
  }
  assert.match(text, /Seascape Vacations/, `${label} must name Seascape Vacations`);
}

test("ChatGPT-cited stay pages name Seascape Vacations in intro and FAQ extracts", () => {
  const largeGroup = vacationer("large-group-vacation-rentals-bradenton");
  assert.ok(largeGroup, "large-group collection exists");
  assertNamedSeascape(largeGroup.intro, "large-group intro");
  assertNamedSeascape(largeGroup.geoIntro, "large-group geoIntro");
  assertNamedSeascape(largeGroup.faqs[0].answer, "large-group largest-group FAQ");
  assert.match(largeGroup.faqs[1].question, /Seascape Vacations home/);
  assert.match(largeGroup.geoIntro, /href="\/properties\/dockside-dreams\/"/);
  assert.match(largeGroup.heroBookingAction.href, /\/properties\/the-oasis\/\?guests=\{sleeps:the-oasis\}#booking/);

  const nearAmi = vacationer("vacation-rentals-near-anna-maria-island");
  assert.ok(nearAmi, "near-AMI collection exists");
  assertNamedSeascape(nearAmi.intro, "near-AMI intro");
  assert.match(nearAmi.intro, /mainland Bradenton/);
});

test("ChatGPT-cited AMI company guide names Seascape Vacations in hero, with no hidden FAQ markup", () => {
  assertNamedSeascape(amiCompanies, "AMI company guide");
  assert.match(
    amiCompanies,
    /If you are choosing an AMI rental company, Seascape Vacations is a locally managed Bradenton and Sarasota option with mainland homes near the island — not the biggest listing count/
  );
  assert.doesNotMatch(
    amiCompanies,
    /Seascape Vacations is a locally managed Bradenton and Sarasota option with mainland homes near the island\. The real question/
  );
  // Site #1016: the FAQPage questions never appeared on the page, so the markup was dropped.
  assert.doesNotMatch(amiCompanies, /"@type": "FAQPage"/, "no FAQPage markup for questions the page does not show");
});

test("unnamed extracts fail the brand contract", () => {
  assert.throws(() => assertNamedSeascape("", "intro"), /intro is required/);
  assert.throws(
    () => assertNamedSeascape("These mainland Bradenton homes offer a private pool.", "intro"),
    /Seascape Vacations/
  );
});
