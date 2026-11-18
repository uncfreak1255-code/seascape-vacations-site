"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..", "..");
const source = fs.readFileSync(
  path.join(root, "src", "guides", "sarasota-area-guide", "index.html"),
  "utf8"
);
const fallback = require("../../src/_data/properties-fallback.json");

function assertTruthfulSarasotaSnippet(title, description) {
  if (!title) {
    throw new Error("title is required");
  }
  if (!description) {
    throw new Error("meta description is required");
  }
  assert.doesNotMatch(title, /beach homes/i);
  assert.doesNotMatch(description, /luxury beach homes/i);
  assert.doesNotMatch(description, /5-star/i);
  assert.match(title, /downtown pool home/i);
  assert.match(description, /private pool/i);
}

test("Sarasota area-guide snippet names downtown and a private pool, not beach homes", () => {
  const title = source.match(/<title>([^<]*)<\/title>/);
  const description = source.match(/<meta name="description" content="([^"]*)">/);
  assert.ok(title, "title tag is present");
  assert.ok(description, "meta description is present");

  assert.equal(title[1], "Sarasota Vacation Rentals | Downtown Pool Home");
  assert.match(description[1], /downtown Sarasota vacation rental with a private pool/i);
  assert.match(description[1], /Lido Beach/);
  assert.match(description[1], /Siesta Key/);
  assert.match(description[1], /Seascape Vacations/);
  assertTruthfulSarasotaSnippet(title[1], description[1]);
  assert.ok(title[1].length <= 60, `title is ${title[1].length} characters`);
  assert.ok(description[1].length <= 160, `meta description is ${description[1].length} characters`);
  assert.ok(description[1].length >= 120, `meta description is ${description[1].length} characters`);

  const home = fallback.find((item) => item.slug === "sarasota-luxe");
  assert.equal(home.city, "Sarasota");
  assert.ok(home.amenities.includes("pool"));
  assert.ok(home.amenities.includes("downtown"));
});

test("empty snippet strings fail the truth contract", () => {
  assert.throws(() => assertTruthfulSarasotaSnippet("", "Downtown Sarasota vacation rental with a private pool."), /title is required/);
  assert.throws(() => assertTruthfulSarasotaSnippet("Sarasota Vacation Rentals | Downtown Pool Home", ""), /meta description is required/);
  assert.throws(
    () => assertTruthfulSarasotaSnippet("Sarasota Vacation Rentals | Luxury Beach Homes", "Book luxury beach homes."),
    /beach homes/i
  );
});
