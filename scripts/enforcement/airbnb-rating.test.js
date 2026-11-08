const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const nunjucks = require("nunjucks");

const { airbnbRatingLabel } = require("./airbnb-rating");
const snapshot = require("../../src/_data/airbnbRatings.json");
const fallbackProperties = require("../../src/_data/properties-fallback.json");

const projectRoot = path.resolve(__dirname, "../..");
const data = (homes) => ({ minimumReviews: 3, homes });

function renderCardRating(listingId, ratings = snapshot) {
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(projectRoot, "src/_includes")), { autoescape: true });
  const rating = airbnbRatingLabel(listingId, ratings);
  return env.renderString('{% set ratingPart = "badge" %}{% include "partials/card-rating.njk" %}|{% set ratingPart = "spoken" %}{% include "partials/card-rating.njk" %}', { rating });
}

test("ratings round to one decimal with no floor", () => {
  assert.equal(airbnbRatingLabel("1", data({ 1: { rating: 4.96, reviews: 193 } })).text, "5.0 · 193 Airbnb reviews");
  assert.equal(airbnbRatingLabel("1", data({ 1: { rating: 4.88, reviews: 42 } })).text, "4.9 · 42 Airbnb reviews");
  assert.equal(airbnbRatingLabel("1", data({ 1: { rating: 4.84, reviews: 42 } })).text, "4.8 · 42 Airbnb reviews");
  assert.equal(airbnbRatingLabel("1", data({ 1: { rating: 4.2, reviews: 10 } })).text, "4.2 · 10 Airbnb reviews");
});

test("a home below the minimum review count shows New; at the minimum it shows the rating", () => {
  assert.equal(airbnbRatingLabel("1", data({ 1: { rating: 5, reviews: 2 } })).text, "New");
  assert.equal(airbnbRatingLabel("1", data({ 1: { rating: 5, reviews: 0 } })).text, "New");
  assert.equal(airbnbRatingLabel("1", data({ 1: { rating: 5, reviews: 3 } })).text, "5.0 · 3 Airbnb reviews");
});

test("a New home renders only the star and the word New", () => {
  const html = renderCardRating("1", data({ 1: { rating: 5, reviews: 1 } }));
  assert.equal(html.split("|")[0].replace(/<[^>]+>/g, ""), "★ New");
});

test("a home missing from the snapshot, or with a bad rating, renders nothing", () => {
  assert.equal(airbnbRatingLabel("999", data({})), null);
  assert.equal(airbnbRatingLabel("1", data({ 1: { rating: 0, reviews: 20 } })), null);
  assert.equal(airbnbRatingLabel("1", data({ 1: { rating: 6, reviews: 20 } })), null);
  assert.equal(renderCardRating("999", data({})).trim(), "|");
});

test("the card shows the star line and a screen reader hears a sentence", () => {
  const html = renderCardRating("1", data({ 1: { rating: 4.97, reviews: 112 } }));
  const [badge, spoken] = html.split("|");
  assert.match(badge, /^<div class="g-card-rating" aria-hidden="true">/);
  const shown = badge.replace(/<[^>]+>/g, "");
  assert.equal(shown, "★ 5.0 · 112 Airbnb reviews");
  assert.match(spoken, /^<span class="g-sr-only">Rated 5\.0 out of 5 from 112 Airbnb reviews<\/span>/);
  assert.doesNotMatch(html, /4\.97/, "only the rounded value may reach the page");
});

test("every home on the site has an Airbnb rating entry", () => {
  for (const property of fallbackProperties) {
    assert.ok(snapshot.homes[String(property.listingId)], `${property.slug} (${property.listingId}) is missing from src/_data/airbnbRatings.json`);
  }
});

test("both home card lists put the badge on the photo and the spoken rating after the name", () => {
  for (const file of ["src/index.njk", "src/properties/index.njk"]) {
    const source = fs.readFileSync(path.join(projectRoot, file), "utf8");
    assert.match(source, /\| airbnbRating %\}\{% set ratingPart = "badge" %\}\{% include "partials\/card-rating\.njk" %\}/, file);
    assert.match(source, /<\/h3>\s*\{% set ratingPart = "spoken" %\}\{% include "partials\/card-rating\.njk" %\}/, file);
  }
});
