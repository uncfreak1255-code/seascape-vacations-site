"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fallback = require("../../src/_data/properties-fallback.json");
const pages = require("../../src/_data/seoPages.json");
const { applyStayFacts } = require("../../src/_data/stayFacts");

test("private-pool collection connects verified Bradenton homes to their date panels", () => {
  const page = pages.vacationer.find((item) => item.slug === "anna-maria-island-homes-with-pool");
  for (const slug of ["the-oasis", "dockside-dreams", "river-house"]) {
    const home = fallback.find((item) => item.slug === slug);
    assert.equal(home.city, "Bradenton");
    assert.ok(home.amenities.includes("pool"));
    assert.match(`${home.guestFacts.tagline} ${home.guestFacts.summary}`, /private pool/i);
    const changed = fallback.map((item) => item.slug === slug ? { ...item, guests: 97 } : item);
    const intro = applyStayFacts(page, changed).geoIntro;
    const paragraph = intro.split(/<p>/).find((part) => part.includes(`href="/properties/${slug}/#booking"`));
    assert.ok(paragraph, `provide a date-panel link for ${slug}`);
    assert.match(paragraph, /data-track-event="stay_view_property_click"/);
    assert.ok(paragraph.includes(`data-page-slug="${slug}"`));
    assert.match(paragraph, /sleeps 97\b/, `${slug} capacity must follow property truth`);
  }
});
