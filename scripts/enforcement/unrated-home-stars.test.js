const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const nunjucks = require("nunjucks");

const { normalizeProperties } = require("../../src/_data/properties");
const { hostawayStarRating } = require("../../scripts/cache/normalize-hostaway");
const fallbackProperties = require("../../src/_data/properties-fallback.json");

const projectRoot = path.resolve(__dirname, "../..");

function renderStayPhoto(property) {
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(projectRoot, "src/_includes")), { autoescape: true });
  env.addFilter("imgProxy", (url) => url);
  return env.renderString('{% from "partials/ui-icon.njk" import uiIcon %}{% include "partials/stay-property-photo.njk" %}', {
    property,
    loop: { index: 1 },
  });
}

const unratedSlugs = fallbackProperties
  .filter((property) => !(Number(property.rating) > 0))
  .map((property) => property.slug);

test("the fallback still holds unrated homes, so this test guards something", () => {
  assert.ok(unratedSlugs.length > 0, "expected at least one unrated home in properties-fallback.json");
});

test("an unrated home keeps a null rating through property normalization", () => {
  for (const rating of [0, null, undefined, "", "0", -1, 6, "n/a"]) {
    const [home] = normalizeProperties([{ ...fallbackProperties[0], rating }]);
    assert.equal(home.rating, null, `rating ${JSON.stringify(rating)} must normalize to null, not a default`);
  }
  const [rated] = normalizeProperties([{ ...fallbackProperties[0], rating: 4.86 }]);
  assert.equal(rated.rating, 4.86);
});

test("unrated homes render no stars on stay cards, rated homes keep theirs", () => {
  for (const home of normalizeProperties(fallbackProperties)) {
    const html = renderStayPhoto(home);
    if (unratedSlugs.includes(home.slug)) {
      assert.equal(home.rating, null, `${home.slug} is unrated and must not get a default rating`);
      assert.ok(!html.includes("stay-star-rating"), `${home.slug} is unrated and must not show stars`);
    } else {
      assert.ok(html.includes(`aria-label="${home.rating} out of 5 stars"`), `${home.slug} should keep its rating`);
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
