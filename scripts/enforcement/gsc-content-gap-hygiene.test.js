"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseRedirects } = require("./validate-redirect-targets");

const root = path.resolve(__dirname, "../..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const headings = (html, tag) =>
  [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "gi"))].map((m) =>
    m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  );

function requireNonEmpty(value, label) {
  if (!value) {
    throw new Error(`${label} is required`);
  }
}

test("empty heading text fails the H1 contract", () => {
  assert.throws(() => requireNonEmpty("", "H1"), /H1 is required/);
});

test("things-to-do Bradenton H1 no longer concatenates to Doin", () => {
  const html = read("src/guides/things-to-do-bradenton-fl.html");
  const h1 = headings(html, "h1")[0] || "";
  requireNonEmpty(h1, "H1");
  assert.match(h1, /35 Best Things to Do in Bradenton, Florida/);
  assert.doesNotMatch(h1, /Doin/i);
  assert.match(html, /item": "https:\/\/seascape-vacations\.com\/guides\/things-to-do-bradenton-fl\/"/);
});

test("Bradenton vs Sarasota does not target things to do in Bradenton in title or headings", () => {
  const html = read("src/guides/bradenton-vs-sarasota.html");
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  requireNonEmpty(title, "title");
  const phrase = /things to do in Bradenton/i;
  assert.doesNotMatch(title, phrase);
  for (const text of [...headings(html, "h1"), ...headings(html, "h2")]) {
    assert.doesNotMatch(text, phrase, `heading should not target the phrase: ${text}`);
  }
  assert.match(
    html,
    /<a href="\/guides\/things-to-do-bradenton-fl\/">things to do in Bradenton<\/a>/
  );
  assert.match(html, /rel="canonical" href="https:\/\/seascape-vacations\.com\/guides\/bradenton-vs-sarasota\/"/);
  assert.match(html, /permalink: "\/guides\/bradenton-vs-sarasota\/"/);
});

test("pet guide answers Is Anna Maria Island dog friendly from existing claims", () => {
  const html = read("src/guides/pet-friendly-anna-maria-island.html");
  assert.match(html, /<h2>Is Anna Maria Island dog friendly\?<\/h2>/);
  const after = html.split("<h2>Is Anna Maria Island dog friendly?</h2>")[1] || "";
  const first = (after.match(/<p>([\s\S]*?)<\/p>/) || [])[1] || "";
  requireNonEmpty(first, "first-sentence answer");
  assert.match(first, /^No\./);
  assert.match(first, /not a dog-beach destination/);
  assert.match(first, /do not allow pets/);
  assert.match(first, /do not permit ordinary pets/);
  assert.doesNotMatch(first, /\d+\s*%|crime|license/i);
});

test("book-direct guide defines a vacation rental direct booking", () => {
  const html = read("src/guides/booking-direct-vacation-rentals.html");
  assert.match(html, /<h2>What is a vacation rental direct booking\?<\/h2>/);
  const after = html.split("<h2>What is a vacation rental direct booking?</h2>")[1] || "";
  const first = (after.match(/<p>([\s\S]*?)<\/p>/) || [])[1] || "";
  requireNonEmpty(first, "direct-booking answer");
  assert.match(first, /manager on their own site/);
  assert.match(first, /not through Airbnb or Vrbo/);
  assert.doesNotMatch(first, /\d+\s*%/);
});

test("AMI area guide and near-island collection say homes are near the island, not on it", () => {
  const guide = read("src/guides/anna-maria-island-area-guide/index.html");
  assert.match(guide, /Stay near Anna Maria Island, not on it/);
  assert.match(
    guide,
    /href="\/stays\/vacation-rentals-near-anna-maria-island\/"[^>]*data-placement="area_guide_near_island_block"/
  );
  assert.match(guide, /Those homes sit near Anna Maria Island, not on it/);
  const pages = JSON.parse(read("src/_data/seoPages.json")).vacationer;
  const near = pages.find((p) => p.slug === "vacation-rentals-near-anna-maria-island");
  const beaches = pages.find((p) => p.slug === "bradenton-vacation-rentals-near-beaches");
  assert.ok(near && beaches, "stay collections exist");
  assert.match(near.intro, /These homes are near Anna Maria Island, not on it/);
  assert.match(beaches.intro, /Bradenton Beach is a town on Anna Maria Island/);
  assert.match(beaches.intro, /mainland Bradenton, not in that island town/);
});

test("Siesta Key comparison hands off to the area guide, and the area guide names Siesta Key", () => {
  const comparison = read("src/guides/anna-maria-island-vs-siesta-key.html");
  assert.match(
    comparison,
    /<a href="\/guides\/siesta-key-area-guide\/">Siesta Key area guide<\/a>/
  );
  const area = read("src/guides/siesta-key-area-guide/index.html");
  const title = (area.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  requireNonEmpty(title, "Siesta Key title");
  assert.match(title, /Siesta Key/);
  const h1 = headings(area, "h1")[0] || "";
  requireNonEmpty(h1, "Siesta Key H1");
  assert.match(h1, /^Siesta Key\s+Vacation Rentals$/);
  assert.doesNotMatch(h1, /KeyVacation/);
});

test("dead Bradenton Beach owner URL and BvS index.html redirect to live trailing-slash winners", () => {
  const rules = parseRedirects(path.join(root, "src/_redirects"));
  const find = (from) => rules.find((rule) => rule.from === from);
  const amiOwner = "/property-management/vacation-rental-management-anna-maria-island/";
  for (const from of [
    "/property-management/vacation-rental-management-bradenton-beach",
    "/property-management/vacation-rental-management-bradenton-beach/"
  ]) {
    const rule = find(from);
    assert.ok(rule, `missing redirect for ${from}`);
    assert.equal(rule.to, amiOwner);
    assert.match(String(rule.code), /^301!?$/);
  }
  const indexRule = find("/guides/bradenton-vs-sarasota/index.html");
  assert.ok(indexRule, "missing BvS index.html redirect");
  assert.equal(indexRule.to, "/guides/bradenton-vs-sarasota/");
  assert.equal(indexRule.code, "301!");
  assert.equal(
    rules.some((rule) => rule.from === "/guides/:slug/index.html"),
    false,
    "do not restore the forced index.html catch-all"
  );
});
