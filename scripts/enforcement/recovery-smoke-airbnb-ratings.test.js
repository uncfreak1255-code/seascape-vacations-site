const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const homes = require("../../src/_data/properties-fallback.json");
const { airbnbRatingLabel } = require("./airbnb-rating");
const { targets, validateTargetResponse } = require("../recovery/assert-live-smoke");

const routes = [
  ["/", "index.html"],
  ["/properties/", "properties/index.html"]
];

for (const [route, file] of routes) {
  test(`${route} smoke rejects stale Airbnb labels on individual home cards`, () => {
    const target = targets.find((entry) => entry.path === route);
    const body = fs.readFileSync(path.join(__dirname, "../../_site", file), "utf8");
    assert.doesNotThrow(() => validateTargetResponse(target, { statusCode: 200, body }));

    const wrongLabels = [
      ["coastal-stay", (label) => label.isNew ? "5.0 (4)" : "New"],
      ["dockside-dreams", (label) => label.isNew ? "5.0 (4)" : `${label.rating} (${label.reviews + 1})`]
    ];
    for (const [slug, wrongLabel] of wrongLabels) {
      const home = homes.find((entry) => entry.slug === slug);
      const label = airbnbRatingLabel(home.listingId);
      const href = `href="/properties/${slug}/"`;
      const card = body.match(/<article\b[^>]*>[\s\S]*?<\/article>/g).find((entry) => entry.includes(href));
      assert.ok(card, `expected ${slug} card on ${route}`);
      const staleCard = card.replace(`★ ${label.short}</span>`, `★ ${wrongLabel(label)}</span>`);
      assert.notEqual(staleCard, card, `expected to replace ${slug}'s visible rating on ${route}`);
      assert.throws(
        () => validateTargetResponse(target, { statusCode: 200, body: body.replace(card, staleCard) }),
        new RegExp(`${slug} Airbnb rating`)
      );

      const staleSpokenCard = card.replace(
        `<span class="g-sr-only">${label.spoken}</span>`,
        '<span class="g-sr-only">Airbnb rating unavailable</span>'
      );
      assert.notEqual(staleSpokenCard, card);
      assert.throws(
        () => validateTargetResponse(target, { statusCode: 200, body: body.replace(card, staleSpokenCard) }),
        new RegExp(`${slug} Airbnb rating is missing its current screen reader label`)
      );
    }
  });
}
