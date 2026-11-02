const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const nunjucks = require("nunjucks");

function renderRating(rating) {
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.resolve(__dirname, "../../src/_includes")), { autoescape: true });
  env.addFilter("imgProxy", (url) => url);
  return env.renderString('{% from "partials/ui-icon.njk" import uiIcon %}{% include "partials/stay-property-photo.njk" %}', {
    property: { name: "Rating fixture", image: "/images/fixture.jpg", rating },
    loop: { index: 1 },
  });
}

test("stay stars retain the actual score, including fractional ratings", () => {
  for (const [score, percent] of [[5, 100], [4.5, 90]]) {
    const html = renderRating(score);
    assert.ok(html.includes(`aria-label="${score} out of 5 stars"`));
    assert.ok(html.includes(`--stay-rating: ${percent}%`));
    assert.equal((html.match(/class="ui-icon"/g) || []).length, 10, "five outlines plus five clipped fills");
    assert.ok(!html.includes("Rated "));
  }
});

test("unrated homes do not receive a five-star badge", () => {
  for (const rating of [0, null, undefined]) {
    const html = renderRating(rating);
    assert.ok(!html.includes('role="img"'));
    assert.ok(!html.includes('class="property-badge"'));
  }
});
