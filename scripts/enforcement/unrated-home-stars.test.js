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

function renderStayPhoto(property) {
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(projectRoot, "src/_includes")), { autoescape: true });
  env.addFilter("imgProxy", (url) => url);
  env.addFilter("airbnbRating", (listingId) => airbnbRatingLabel(listingId));
  return env.renderString('{% from "partials/ui-icon.njk" import uiIcon %}{% include "partials/stay-property-photo.njk" %}', {
    property,
    loop: { index: 1 },
  });
}

// Stay cards take their stars from the Airbnb snapshot, like the home cards.
// A home still "New" on Airbnb (under the minimum review count) shows none.
const unratedSlugs = fallbackProperties
  .filter((property) => { const label = airbnbRatingLabel(property.listingId); return !label || label.isNew; })
  .map((property) => property.slug);

test("the snapshot still holds a home that is New on Airbnb, so this test guards something", () => {
  assert.ok(unratedSlugs.length > 0, "expected at least one home under the Airbnb review minimum");
});

test("an unrated home keeps a null rating through property normalization", () => {
  for (const rating of [0, null, undefined, "", "0", -1, 6, "n/a"]) {
    const [home] = normalizeProperties([{ ...fallbackProperties[0], rating }]);
    assert.equal(home.rating, null, `rating ${JSON.stringify(rating)} must normalize to null, not a default`);
  }
  const [rated] = normalizeProperties([{ ...fallbackProperties[0], rating: 4.86 }]);
  assert.equal(rated.rating, 4.86);
});

test("homes New on Airbnb render no stars on stay cards; rated homes show their Airbnb rating", () => {
  for (const home of normalizeProperties(fallbackProperties)) {
    const html = renderStayPhoto(home);
    if (unratedSlugs.includes(home.slug)) {
      assert.ok(!html.includes("stay-star-rating"), `${home.slug} is New on Airbnb and must not show stars`);
    } else {
      const label = airbnbRatingLabel(home.listingId);
      assert.ok(html.includes(`aria-label="${label.spoken}"`), `${home.slug} should show its Airbnb rating`);
      assert.ok(html.includes(`--stay-rating: ${label.rating * 20}%`), `${home.slug} star fill should match ${label.rating}`);
    }
  }
});

test("Hostaway averageReviewRating is a 10-point score converted to 5 stars", () => {
  assert.equal(hostawayStarRating({ averageReviewRating: 10 }), 5);
  assert.equal(hostawayStarRating({ averageReviewRating: 9.72 }), 4.86);
  for (const listing of [{}, { averageReviewRating: null }, { averageReviewRating: 0 }, { averageReviewRating: 11 }, { reviewAverageRating: 10 }]) {
    assert.equal(hostawayStarRating(listing), null, `${JSON.stringify(listing)} is not a usable rating`);
  }
});

test("built stays page shows no stars on unrated homes' cards", { skip: !fs.existsSync(path.join(projectRoot, "_site/stays/vacation-rentals-with-pool-and-hot-tub/index.html")) && "run npm run build first" }, () => {
  const html = fs.readFileSync(path.join(projectRoot, "_site/stays/vacation-rentals-with-pool-and-hot-tub/index.html"), "utf8");
  const unrated = fallbackProperties.filter((property) => unratedSlugs.includes(property.slug));
  let checked = 0;
  for (const property of unrated) {
    const href = `/properties/${property.slug}/`;
    const at = html.indexOf(`href="${href}"`);
    if (at === -1) continue;
    const cardStart = html.lastIndexOf("<article", at);
    const cardEnd = html.indexOf("</article>", at);
    assert.ok(cardStart !== -1 && cardEnd !== -1, `${property.slug} card markup not found`);
    assert.ok(!html.slice(cardStart, cardEnd).includes("stay-star-rating"), `${property.slug} card must not show stars`);
    checked += 1;
  }
  assert.ok(checked > 0, "expected at least one unrated home on the pool and hot tub stays page");
});
