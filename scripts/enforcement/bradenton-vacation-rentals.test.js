"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const fallback = require("../../src/_data/properties-fallback.json");
const pages = require("../../src/_data/seoPages.json");
const ledger = require("../../docs/status/page-ledger.json");
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
  assert.match(heatFaq.answer, /late-day requests or mid-stay requests on an approved long-stay rate/);
});

test("stay ItemList schema omits empty coordinates instead of emitting invalid JSON", () => {
  const template = fs.readFileSync(
    path.join(__dirname, "..", "..", "src", "_includes", "partials", "stay-itemlist-jsonld.njk"),
    "utf8"
  );
  assert.match(
    template,
    /\{% if property\.latitude and property\.longitude %\}\s*"latitude": \{\{ property\.latitude \}\}/
  );
});

test("Bradenton head-term Article schema uses the November 2026 publication date", () => {
  const page = pages.vacationer.find((item) => item.slug === SLUG);
  assert.equal(page.datePublished, "2026-11-17");
  const template = fs.readFileSync(
    path.join(__dirname, "..", "..", "src/_includes/partials/stay-article-jsonld.njk"),
    "utf8"
  );
  assert.match(template, /seoPage\.datePublished \| default\('2025-01-22'\)/);
  assert.match(template, /"dateModified": "{{ pageUpdatedIso or pageUpdatedDate }}"/);
  const sibling = pages.vacationer.find((item) => item.slug === "bradenton-vacation-rentals-near-beaches");
  assert.equal(sibling.datePublished, undefined);
});

test("Bradenton head-term page is on the settle ledger before publication", () => {
  const entry = ledger.pages.find((page) => page.route === "/stays/bradenton-vacation-rentals/");
  assert.ok(entry, "page-ledger.json must include the new head-term route");
  assert.deepEqual(entry.sources, ["src/_data/seoPages.json"]);
  assert.equal(entry.targetQuery, "bradenton vacation rentals");
  assert.equal(entry.brief, "docs/briefs/2026-11-bradenton-vacation-rentals.md");
  assert.equal(entry.shipped, null);
  assert.equal(entry.pr, 1002);
});

test("Bradenton donor guides keep the brief's required stay destinations", () => {
  const brief = fs.readFileSync(
    path.join(__dirname, "..", "..", "docs/briefs/2026-11-bradenton-vacation-rentals.md"),
    "utf8"
  );
  const mapStart = brief.indexOf("## Required Internal Link Map");
  const mapBody = brief.slice(mapStart, brief.indexOf("\n## ", mapStart + 1));
  const donors = [];
  for (const line of mapBody.split("\n")) {
    const match = line.match(/^- (src\/\S+):\s*(.+)$/);
    if (!match) continue;
    donors.push([
      match[1],
      match[2].split(",").map((value) => value.trim()).filter((value) => value.startsWith("/"))
    ]);
  }
  assert.ok(donors.length > 0, "brief must list donor pages in the Required Internal Link Map");
  for (const [relative, hrefs] of donors) {
    const source = fs.readFileSync(path.join(__dirname, "..", "..", relative), "utf8");
    for (const href of hrefs) {
      assert.ok(
        source.includes(`href="${href}"`),
        `${relative} must keep ${href}`
      );
    }
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
