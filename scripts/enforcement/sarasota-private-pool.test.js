"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fallback = require("../../src/_data/properties-fallback.json");
const pages = require("../../src/_data/seoPages.json");
const { applyStayFacts } = require("../../src/_data/stayFacts");

function datePanelParagraph(intro, slug) {
  return intro.split(/<p>/).find((part) => part.includes(`href="/properties/${slug}/#booking"`));
}

test("private-pool collection connects the verified Sarasota home to its date panel", () => {
  const page = pages.vacationer.find((item) => item.slug === "sarasota-vacation-rentals-with-pool");
  assert.ok(page, "sarasota-vacation-rentals-with-pool exists");
  const slug = "sarasota-luxe";
  const home = fallback.find((item) => item.slug === slug);
  assert.equal(home.city, "Sarasota");
  assert.ok(home.amenities.includes("pool"));
  assert.ok(home.amenities.includes("downtown"));
  assert.match(`${home.guestFacts.tagline} ${home.guestFacts.summary}`, /private pool/i);

  const changed = fallback.map((item) => (item.slug === slug ? { ...item, guests: 97 } : item));
  const intro = applyStayFacts(page, changed).geoIntro;
  const paragraph = datePanelParagraph(intro, slug);
  assert.ok(paragraph, `provide a date-panel link for ${slug}`);
  assert.match(paragraph, /data-track-event="stay_view_property_click"/);
  assert.ok(paragraph.includes(`data-page-slug="${slug}"`));
  assert.match(paragraph, /data-placement="stay_intro"/);
  assert.match(paragraph, /sleeps 97\b/, `${slug} capacity must follow property truth`);
  assert.match(intro, /private pool/i);
  assert.match(intro, /require a drive/i);
});

test("the previous Sarasota pool intro without a date-panel link fails the contract", () => {
  const oldIntro =
    '<p>Sarasota Luxe is a downtown Sarasota home with a private pool and screened lanai. Downtown restaurants, shops, galleries, beach visits, and St. Armands Circle require a drive. Confirm current travel times and property details before booking.</p>';
  assert.equal(datePanelParagraph(oldIntro, "sarasota-luxe"), undefined);
  assert.throws(() => {
    const paragraph = datePanelParagraph(oldIntro, "sarasota-luxe");
    assert.ok(paragraph, "provide a date-panel link for sarasota-luxe");
  }, /date-panel link/);
});
