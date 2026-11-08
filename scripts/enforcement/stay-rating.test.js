const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const nunjucks = require("nunjucks");

const { airbnbRatingLabel } = require("./airbnb-rating");

// Stay-card stars use the Airbnb snapshot, like the home cards (Sawyer, 2026-11-07).
const ratings = {
  minimumReviews: 3,
  homes: { 1: { rating: 5, reviews: 40 }, 2: { rating: 4.5, reviews: 12 }, 3: { rating: 5, reviews: 1 } }
};

function renderRating(listingId) {
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.resolve(__dirname, "../../src/_includes")), { autoescape: true });
  env.addFilter("imgProxy", (url) => url);
  env.addFilter("airbnbRating", (id) => airbnbRatingLabel(id, ratings));
  return env.renderString('{% from "partials/ui-icon.njk" import uiIcon %}{% include "partials/stay-property-photo.njk" %}', {
    property: { name: "Rating fixture", image: "/images/fixture.jpg", listingId, rating: 5 },
    loop: { index: 1 },
  });
}

test("stay stars carry the rounded Airbnb score, including fractional ratings", () => {
  for (const [id, score, percent, reviews] of [["1", "5.0", 100, 40], ["2", "4.5", 90, 12]]) {
    const html = renderRating(id);
    assert.ok(html.includes(`aria-label="Rated ${score} out of 5 from ${reviews} Airbnb reviews"`));
    assert.ok(html.includes(`--stay-rating: ${percent}%`));
    assert.equal((html.match(/class="ui-icon"/g) || []).length, 10, "five outlines plus five clipped fills");
  }
});

test("homes with no Airbnb rating, or still New, get no star badge even if Hostaway rates them", () => {
  for (const id of ["3", "999", null]) {
    const html = renderRating(id);
    assert.ok(!html.includes('role="img"'));
    assert.ok(!html.includes('class="property-badge"'));
  }
});
