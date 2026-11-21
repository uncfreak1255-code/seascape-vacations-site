"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.resolve(__dirname, "..", "..");
const fallback = require("../../src/_data/properties-fallback.json");
const site = require("../../src/_data/site.json");
const ledger = require("../../docs/status/page-ledger.json");

function read(...segments) {
  return fs.readFileSync(path.join(projectRoot, ...segments), "utf8");
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((match) => {
    const parsed = JSON.parse(match[1]);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed["@graph"])) return parsed["@graph"];
    return [parsed];
  });
}

function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

const QUOTED_SLUGS = new Set(["dockside-dreams", "the-oasis", "sarasota-luxe", "river-house"]);
const UNQUOTED_SLUGS = new Set(["bradenton-pool-home", "blue-house", "coastal-stay", "relaxing-oasis"]);

test("reviews page source is a guest-layout indexable /reviews/ route", () => {
  const source = read("src", "reviews", "index.njk");
  assert.match(source, /permalink:\s*"\/reviews\/"/);
  assert.match(source, /layout:\s*layouts\/guest\.njk/);
  assert.match(source, /pageTitle:\s*"Seascape Vacations Reviews \| Bradenton & Sarasota, Florida"/);
  assert.match(
    source,
    /pageDescription:\s*"Guest reviews of Seascape Vacations, the local vacation rental manager in Bradenton and Sarasota, Florida\. Read verified stay reviews and book a home direct\."/
  );
  assert.match(source, /<h1>Seascape Vacations reviews<\/h1>/);
  assert.match(
    source,
    /g-reviews-identity">Seascape Vacations is the locally owned vacation rental manager in Bradenton and Sarasota, Florida\./
  );
  assert.equal(source.includes("aggregateRating"), false);
  assert.equal(/\bPatrick\b/.test(source), false);
  assert.equal(source.includes("6103 Riverview"), false);
  assert.equal(source.includes("42 Google"), false);
  assert.equal(source.includes("streetAddress"), false);
});

test("reviews page quotes only the first-party fallback reviews for four homes", () => {
  const source = read("src", "reviews", "index.njk");
  assert.match(source, /for review in quotes/);
  assert.match(source, /home\.guestFacts\.reviews/);

  const quoted = fallback.filter((home) => QUOTED_SLUGS.has(home.slug));
  const unquoted = fallback.filter((home) => UNQUOTED_SLUGS.has(home.slug));
  assert.equal(quoted.length, 4);
  assert.equal(unquoted.length, 4);
  assert.equal(fallback.length, 8);

  for (const home of quoted) {
    assert.ok(home.guestFacts.reviews.length >= 2, `${home.slug} should keep first-party quotes`);
    for (const review of home.guestFacts.reviews) {
      assert.ok(review.author && review.date && review.text && review.rating);
    }
  }
  for (const home of unquoted) {
    assert.equal(home.guestFacts.reviews.length, 0, `${home.slug} must stay unquoted`);
  }
  assert.match(source, /We do not quote guest reviews for this home here yet/);
  assert.match(source, /Read reviews on the booking page/);
});

test("inbound reviews links land on homepage intro, footer, and About Us", () => {
  const home = read("src", "index.njk");
  const footer = read("src", "_includes", "partials", "guest-footer.njk");
  const about = read("src", "about-us", "index.njk");
  const redirects = read("scripts", "redirects", "reviews-canonical");

  assert.match(home, /id="home-reviews-heading"/);
  assert.match(home, /href="\/reviews\/">See all reviews<\/a>/);
  assert.match(home, /data-home-deck/);
  assert.doesNotMatch(home, /Swipe to explore the collection/);

  assert.match(footer, /href="\/reviews\/">Reviews<\/a>/);
  assert.match(footer, /href="\/guest-support\/">Guest Support<\/a><a href="\/reviews\/">Reviews<\/a>/);

  assert.match(about, /href="\/reviews\/">Read guest reviews<\/a>/);
  assert.match(about, /locally owned vacation rental manager in Bradenton and Sarasota, Florida/);

  assert.match(redirects, /\/reviews\s+\/reviews\/\s+301/);
});

test("site, llms, and AI summary disambiguate the Whidbey Island rental", () => {
  assert.match(site.disambiguatingDescription, /Whidbey Island, Washington/);
  assert.match(site.disambiguatingDescription, /Seascape Resort in Miramar Beach/);
  assert.equal(site.legalName, "B&T Rental Group LLC");
  assert.equal(site.address.addressLocality, "Bradenton");
  assert.equal(site.address.streetAddress, undefined);

  const llms = read("src", "llms.txt");
  assert.match(llms, /https:\/\/seascape-vacations\.com\/reviews\//);
  assert.match(llms, /Whidbey Island, Washington/);

  const summary = read("src", "ai", "summary.json.njk");
  assert.match(summary, /reviews_url/);
  assert.match(summary, /\/reviews\//);
  assert.match(summary, /Whidbey Island/);

  const organization = read("src", "_includes", "partials", "organization-schema.njk");
  assert.match(organization, /legalName/);
  assert.match(organization, /"address": \{\{ site\.address \| dump \| safe \}\}/);
  assert.equal(organization.includes("aggregateRating"), false);
  assert.equal(organization.includes("streetAddress"), false);
});

test("page ledger records the new reviews route without freezing the homepage", () => {
  const entry = ledger.pages.find((page) => page.route === "/reviews/");
  assert.ok(entry, "page-ledger.json must include /reviews/");
  assert.deepEqual(entry.sources, ["src/reviews/index.njk"]);
  assert.equal(entry.brief, "docs/briefs/2026-11-21-seascape-vacations-reviews.md");
  assert.equal(entry.kind, "new-page");
  assert.equal(entry.shipped, null);
});

test("built reviews page is indexable, quotes first-party reviews, and omits aggregateRating", () => {
  const builtPath = path.join(projectRoot, "_site", "reviews", "index.html");
  assert.equal(fs.existsSync(builtPath), true, "run npm run build before this test");
  const html = read("_site", "reviews", "index.html");
  const pageCopy = visibleText(html);

  assert.match(html, /<link rel="canonical" href="https:\/\/seascape-vacations\.com\/reviews\/">/);
  assert.match(html, /content="index, follow"/);
  assert.match(pageCopy, /<h1>Seascape Vacations reviews<\/h1>/);
  assert.match(
    pageCopy,
    /Seascape Vacations is the locally owned vacation rental manager in Bradenton and Sarasota, Florida\./
  );
  assert.match(pageCopy, /Tracy Bunce/);
  assert.match(pageCopy, /David Kohley/);
  assert.match(pageCopy, /Stanley Shake/);
  assert.match(pageCopy, /well equiped/);
  assert.match(pageCopy, /href="\/properties\/the-oasis\/#reviews"/);
  assert.match(pageCopy, /href="\/properties\/"/);
  assert.match(pageCopy, /href="\/about-us\/"/);
  assert.match(pageCopy, /href="\/property-management\/"/);
  assert.match(pageCopy, /href="\/guides\/booking-direct-vacation-rentals\/"/);
  assert.match(pageCopy, /href="https:\/\/book\.seascape-vacations\.com"/);
  assert.match(pageCopy, /href="\/properties\/blue-house\/"/);
  assert.match(pageCopy, /Pickleball Pool Home Retreat/);
  assert.equal(pageCopy.includes("Patrick"), false);
  assert.equal(html.includes("aggregateRating"), false);
  assert.equal(html.includes("6103 Riverview"), false);

  const sitemap = read("_site", "sitemap.xml");
  assert.match(sitemap, /https:\/\/seascape-vacations\.com\/reviews\//);
  assert.match(read("_site", "_redirects"), /\/reviews\s+\/reviews\/\s+301/);

  const blocks = jsonLdBlocks(html);
  const types = blocks.flatMap((block) => [].concat(block["@type"] || []));
  assert.ok(types.includes("CollectionPage"));
  assert.ok(types.includes("LocalBusiness"));
  assert.ok(types.includes("FAQPage"));
  assert.ok(types.includes("BreadcrumbList"));
  assert.ok(types.includes("Review"));
  assert.equal(types.includes("aggregateRating"), false);

  const faq = blocks.find((block) => block["@type"] === "FAQPage");
  assert.equal(faq.mainEntity.length, 4);
  for (const question of faq.mainEntity) {
    assert.ok(pageCopy.includes(question.name), `visible FAQ missing ${question.name}`);
    assert.ok(pageCopy.includes(question.acceptedAnswer.text), `visible FAQ answer missing for ${question.name}`);
  }

  const reviews = blocks.filter((block) => block["@type"] === "Review");
  assert.equal(reviews.length, 12);
  assert.ok(reviews.every((review) => review.reviewBody && review.author && review.reviewRating));
  assert.ok(reviews.every((review) => !review.aggregateRating));

  const local = blocks.find((block) => [].concat(block["@type"] || []).includes("LocalBusiness"));
  assert.equal(local.legalName, "B&T Rental Group LLC");
  assert.equal(local.address.addressLocality, "Bradenton");
  assert.equal(local.address.streetAddress, undefined);
  assert.equal(local.aggregateRating, undefined);

  const home = read("_site", "index.html");
  assert.match(home, /href="\/reviews\/">See all reviews<\/a>/);
  assert.match(home, /data-home-deck/);
});

test("an empty reviews corpus would fail the built-page quote floor", () => {
  const quotedHomes = fallback.filter((home) => (home.guestFacts.reviews || []).length > 0);
  assert.ok(quotedHomes.length > 0, "fixture must include first-party quotes");
  const empty = fallback.map((home) => ({ ...home, guestFacts: { ...home.guestFacts, reviews: [] } }));
  const quoted = empty.flatMap((home) => home.guestFacts.reviews);
  assert.equal(quoted.length, 0);
  assert.throws(() => {
    assert.equal(quoted.length, 12);
  }, /12/);
});
