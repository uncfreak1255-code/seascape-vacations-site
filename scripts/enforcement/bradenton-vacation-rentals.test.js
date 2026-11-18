"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const fallback = require("../../src/_data/properties-fallback.json");
const pages = require("../../src/_data/seoPages.json");
const { applyStayFacts } = require("../../src/_data/stayFacts");

const SLUG = "bradenton-vacation-rentals";
const BRADENTON_SLUGS = [
  "dockside-dreams",
  "the-oasis",
  "river-house",
  "bradenton-pool-home",
  "blue-house",
  "coastal-stay",
  "relaxing-oasis"
];

test("Bradenton head-term collection lists only catalog Bradenton homes", () => {
  const page = pages.vacationer.find((item) => item.slug === SLUG);
  assert.ok(page, "missing bradenton-vacation-rentals stay page");
  assert.deepEqual(page.matchingProperties, BRADENTON_SLUGS);
  assert.equal(page.matchingProperties.includes("sarasota-luxe"), false);

  const bradentonHomes = fallback.filter((home) => home.destination === "bradenton");
  assert.deepEqual(
    [...page.matchingProperties].sort(),
    bradentonHomes.map((home) => home.slug).sort()
  );

  for (const slug of page.matchingProperties) {
    const home = fallback.find((item) => item.slug === slug);
    assert.equal(home.city, "Bradenton");
    assert.equal(home.destination, "bradenton");
  }
});

test("Bradenton head-term intro names Seascape and stays on the mainland", () => {
  const page = pages.vacationer.find((item) => item.slug === SLUG);
  const resolved = applyStayFacts(page, fallback);
  assert.match(resolved.intro, /Seascape Vacations/);
  assert.match(resolved.intro, /mainland Bradenton/);
  assert.match(resolved.intro, /not on Anna Maria Island/);
  assert.doesNotMatch(`${resolved.intro} ${resolved.geoIntro}`, /\b(?:are|is) on Anna Maria Island\b/);
  assert.doesNotMatch(`${resolved.intro} ${resolved.geoIntro}`, /\d+\s*%/);
  assert.doesNotMatch(`${resolved.intro} ${resolved.geoIntro}`, /management fee/i);
  assert.doesNotMatch(`${resolved.intro} ${resolved.geoIntro}`, /verified/i);
  assert.equal(page.introHeading, "Stay in mainland Bradenton");
});

test("Bradenton head-term geoIntro links every listed home to its date panel", () => {
  const page = pages.vacationer.find((item) => item.slug === SLUG);
  for (const slug of BRADENTON_SLUGS) {
    const home = fallback.find((item) => item.slug === slug);
    const changed = fallback.map((item) => (item.slug === slug ? { ...item, guests: 97 } : item));
    const intro = applyStayFacts(page, changed).geoIntro;
    const paragraph = intro.split(/<p>/).find((part) => part.includes(`href="/properties/${slug}/#booking"`));
    assert.ok(paragraph, `provide a date-panel link for ${slug}`);
    assert.match(paragraph, /data-track-event="stay_view_property_click"/);
    assert.ok(paragraph.includes(`data-page-slug="${slug}"`));
    assert.match(paragraph, /data-placement="stay_intro"/);
    assert.match(paragraph, /sleeps 97\b/, `${slug} capacity must follow property truth`);
    assert.match(paragraph, new RegExp(home.name.replace(/^The\s+/i, "")), `${slug} should keep its catalog name`);
  }
});

test("Bradenton head-term copy keeps The Coastal pool-heat exception", () => {
  const page = pages.vacationer.find((item) => item.slug === SLUG);
  const resolved = applyStayFacts(page, fallback);
  assert.match(resolved.geoIntro, /There is no charge for pool heat at The Coastal/);
  const heatFaq = resolved.faqs.find((item) => /what does pool heat cost/i.test(item.question));
  assert.ok(heatFaq);
  assert.match(heatFaq.answer, /There is no charge for pool heat at The Coastal/);
});

test("Bradenton donor guides and related stay pages point at the head-term URL", () => {
  const donors = [
    ["src/guides/bradenton-area-guide/index.html", 'href="/stays/bradenton-vacation-rentals/"'],
    ["src/guides/things-to-do-bradenton-fl.html", 'href="/stays/bradenton-vacation-rentals/"'],
    ["src/guides/bradenton-vs-sarasota.html", 'href="/stays/bradenton-vacation-rentals/"']
  ];
  for (const [relative, needle] of donors) {
    const source = fs.readFileSync(path.join(__dirname, "..", "..", relative), "utf8");
    assert.ok(source.includes(needle), `${relative} must link to the head-term stay page`);
  }

  for (const slug of [
    "bradenton-vacation-rentals-near-beaches",
    "bradenton-waterfront-vacation-rentals",
    "bradenton-vacation-rentals-with-hot-tub",
    "large-group-vacation-rentals-bradenton",
    "fishing-vacation-rentals-bradenton"
  ]) {
    const related = pages.vacationer.find((item) => item.slug === slug);
    assert.ok(related.relatedStaySlugs.includes(SLUG), `${slug} must related-link the head-term page`);
  }
});
