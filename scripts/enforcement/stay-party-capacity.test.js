"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const catalog = require("../../src/_data/properties-fallback.json");
const { vacationer } = require("../../src/_data/seoPages.json");
const { applyStayFacts } = require("../../src/_data/stayFacts");

const page = vacationer.find((entry) => entry.slug === "bachelor-bachelorette-rentals-florida");

function capacityAnswer(properties) {
  return applyStayFacts(page, properties).faqs.find((faq) =>
    faq.question === "How many people can your homes accommodate for parties?"
  ).answer;
}

function assertNamedCapacities(properties) {
  const oasis = properties.find((property) => property.slug === "the-oasis");
  const sarasota = properties.find((property) => property.slug === "sarasota-luxe");
  const answer = capacityAnswer(properties);
  assert.ok(answer.startsWith(
    `The Oasis sleeps ${oasis.guests} guests overnight. Sarasota Luxe sleeps ${sarasota.guests} guests overnight.`
  ), `each recommended home's overnight capacity must be explicit: ${answer}`);
  assert.doesNotMatch(answer, /Our homes sleep/i);
}

test("party FAQ names both recommended homes without broadening the property-card list", () => {
  assert.ok(page, "party stay page must exist");
  assert.deepEqual(page.matchingProperties, ["the-oasis"]);
  const recommendation = page.faqs.find((faq) =>
    faq.question === "Which property is best for a bachelor/bachelorette party?"
  ).answer;
  assert.match(recommendation, /The Oasis/);
  assert.match(recommendation, /Sarasota Luxe/);
  assertNamedCapacities(catalog);
});

test("party FAQ follows each recommended home's own catalog capacity independently", () => {
  for (const slug of ["the-oasis", "sarasota-luxe"]) {
    const changed = structuredClone(catalog);
    changed.find((property) => property.slug === slug).guests += 1;
    assertNamedCapacities(changed);
    assert.notEqual(capacityAnswer(changed), capacityAnswer(catalog));
  }
});
