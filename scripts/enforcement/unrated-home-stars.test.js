const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const nunjucks = require("nunjucks");

const { normalizeProperties } = require("../../src/_data/properties");
const { hostawayStarRating } = require("../../scripts/cache/normalize-hostaway");
const fallbackProperties = require("../../src/_data/properties-fallback.json");
const { airbnbRatingLabel } = require("./airbnb-rating");

const projectRoot = path.resolve(__dirname, "../..");

function renderStayPhoto(property, snapshot) {
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(projectRoot, "src/_includes")), { autoescape: true });
  env.addFilter("imgProxy", (url) => url);
  env.addFilter("airbnbRating", (listingId) => airbnbRatingLabel(listingId, snapshot));
  return env.renderString('{% from "partials/ui-icon.njk" import uiIcon %}{% include "partials/stay-property-photo.njk" %}', {
    property,
    loop: { index: 1 },
  });
}

test("an unrated home keeps a null rating through property normalization", () => {
  for (const rating of [0, null, undefined, "", "0", -1, 6, "n/a"]) {
    const [home] = normalizeProperties([{ ...fallbackProperties[0], rating }]);
    assert.equal(home.rating, null, `rating ${JSON.stringify(rating)} must normalize to null, not a default`);
  }
  const [rated] = normalizeProperties([{ ...fallbackProperties[0], rating: 4.86 }]);
  assert.equal(rated.rating, 4.86);
});

test("stay cards show Airbnb stars only when the home reaches the review minimum", () => {
  const [home] = normalizeProperties([{ ...fallbackProperties[0], rating: 5 }]);
  const row = { rating: 4.8, reviews: 2 };
  const snapshot = { minimumReviews: 3, homes: { [home.listingId]: row } };

  assert.doesNotMatch(renderStayPhoto(home, snapshot), /class="stay-star-rating"/);
  row.reviews = 3;
  const rated = renderStayPhoto(home, snapshot);
  assert.match(rated, /class="stay-star-rating"/);
  assert.match(rated, /aria-label="Rated 4\.8 out of 5 from 3 Airbnb reviews"/);
  assert.match(rated, /--stay-rating: 96%/);
});

test("Hostaway averageReviewRating is a 10-point score converted to 5 stars", () => {
  assert.equal(hostawayStarRating({ averageReviewRating: 10 }), 5);
  assert.equal(hostawayStarRating({ averageReviewRating: 9.72 }), 4.86);
  for (const listing of [{}, { averageReviewRating: null }, { averageReviewRating: 0 }, { averageReviewRating: 11 }, { reviewAverageRating: 10 }]) {
    assert.equal(hostawayStarRating(listing), null, `${JSON.stringify(listing)} is not a usable rating`);
  }
});

test("built stays cards show the Airbnb snapshot's rating state for each home", { skip: !fs.existsSync(path.join(projectRoot, "_site/stays/vacation-rentals-with-pool-and-hot-tub/index.html")) && "run npm run build first" }, () => {
  const html = fs.readFileSync(path.join(projectRoot, "_site/stays/vacation-rentals-with-pool-and-hot-tub/index.html"), "utf8");
  const cards = [...html.matchAll(/<article class="property-card">[\s\S]*?<\/article>/g)];
  assert.ok(cards.length > 0, "expected home cards on the pool and hot tub stays page");

  for (const [card] of cards) {
    const slug = card.match(/href="\/properties\/([^"/]+)\/"/)?.[1];
    const home = fallbackProperties.find((property) => property.slug === slug);
    assert.ok(home, `could not identify the home for stays card ${slug}`);
    const label = airbnbRatingLabel(home.listingId);

    if (!label || label.isNew) {
      assert.doesNotMatch(card, /class="stay-star-rating"/, `${slug} must not show stars`);
    } else {
      assert.match(card, /class="stay-star-rating"/, `${slug} must show stars`);
      assert.ok(card.includes(`aria-label="${label.spoken}"`), `${slug} must show its Airbnb rating and review count`);
      assert.ok(card.includes(`--stay-rating: ${label.rating * 20}%`), `${slug} must show its Airbnb star fill`);
    }
  }
});
