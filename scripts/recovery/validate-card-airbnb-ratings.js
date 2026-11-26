const homes = require("../../src/_data/properties-fallback.json");
const { airbnbRatingLabel } = require("../enforcement/airbnb-rating");

module.exports = function validateCardAirbnbRatings(route, body) {
  const cards = body.match(/<article class="(?:g-postcard|catalog-card)"[^>]*>[\s\S]*?<\/article>/g) || [];

  for (const { slug, listingId } of homes) {
    const href = `href="/properties/${slug}/"`;
    const card = cards.find((entry) => entry.includes(href));
    if (!card) throw new Error(`${route} is missing the ${slug} home card`);

    const label = airbnbRatingLabel(listingId);
    const visible = card.match(/<span class="g-card-rating" aria-hidden="true">★ ([^<]+)<\/span>/)?.[1];
    if (visible !== label?.short) {
      throw new Error(`${route} ${slug} Airbnb rating expected ${label?.short ?? "no rating"}, got ${visible ?? "no rating"}`);
    }
    if (label && !card.includes(`<span class="g-sr-only">${label.spoken}</span>`)) {
      throw new Error(`${route} ${slug} Airbnb rating is missing its current screen reader label`);
    }
  }
};
