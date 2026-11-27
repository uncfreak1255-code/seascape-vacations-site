const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");

const ownerData = require(path.join(__dirname, "..", "..", "src", "_data", "seoPages.json")).owner;

test("Bradenton owner page names verified homes and omits unproven claims", () => {
  const bradentonPage = ownerData.find((entry) => entry.slug === "vacation-rental-management-bradenton");
  const pageText = JSON.stringify(bradentonPage);

  assert.ok(bradentonPage, "Bradenton owner page should exist");
  assert.match(bradentonPage.intro, /The Oasis/);
  assert.match(bradentonPage.intro, /Dockside Dreams/);
  assert.match(bradentonPage.intro, /owner/i);
  assert.equal(bradentonPage.title, "Bradenton Vacation Rental Property Management");
  assert.equal(bradentonPage.h1, "Bradenton Vacation Rental Management");
  assert.equal(bradentonPage.benefitsTitle, "What we do for a Bradenton home");
  assert.equal(bradentonPage.marketReality.title, "How a management quote is built");
  assert.equal(bradentonPage.reviewDeliverable.title, "How to compare Bradenton vacation rental managers");
  assert.equal(bradentonPage.contentTitle, "Airbnb management in Bradenton");
  assert.match(bradentonPage.geoIntro, /Areas we serve/);
  assert.match(bradentonPage.geoIntro, /\/properties\/the-oasis\//);
  assert.match(bradentonPage.geoIntro, /\/properties\/dockside-dreams\//);
  assert.equal(pageText.includes("90-day takeover"), false, "Bradenton page should drop unconfirmed 90-day takeover wording");
  assert.equal(/\bPalmetto\b/.test(pageText), false, "Bradenton page should not name unverified Palmetto inventory");
  assert.equal(/\bParrish\b/.test(pageText), false, "Bradenton page should not name unverified Parrish inventory");
  assert.equal(/\bPatrick\b/.test(pageText), false, "Bradenton page should not name the business partner");
  assert.equal(/\[NEEDS PROOF\]/.test(pageText), false, "Bradenton live copy should not ship NEEDS PROOF markers");
  assert.equal(
    bradentonPage.faqs.some((faq) => /Anna Maria Island/i.test(faq.q) && /Not yet/i.test(faq.a)),
    true,
    "Bradenton FAQ should say we do not manage Anna Maria Island homes yet"
  );
  assert.equal(
    bradentonPage.faqs.some((faq) => /know what my home earned/i.test(faq.q)),
    true,
    "Bradenton FAQ should answer how owners see earnings"
  );
  assert.equal(
    bradentonPage.faqs.some((faq) => /cleaning fees/i.test(faq.q) && /guest/i.test(faq.a)),
    true,
    "Bradenton FAQ should say cleaning fees are guest-paid"
  );
});
