const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const ownerLanding = fs.readFileSync(
  path.join(projectRoot, "src", "property-management", "index.njk"),
  "utf8"
);
const ownerTemplate = fs.readFileSync(
  path.join(projectRoot, "src", "property-management", "property-management.njk"),
  "utf8"
);
const ownerData = require(path.join(projectRoot, "src", "_data", "seoPages.json")).owner;
const ownerFormPath = path.join(projectRoot, "src", "_includes", "partials", "owner-evaluation-form.njk");

test("owner landing page uses a real revenue teardown form instead of generic evaluation copy", () => {
  assert.equal(fs.existsSync(ownerFormPath), true, "owner form partial should exist");

  const ownerFormPartial = fs.readFileSync(ownerFormPath, "utf8");
  assert.equal(ownerLanding.includes("Get Your Revenue Teardown"), true);
  assert.equal(ownerLanding.includes("ownerEvaluationForm({"), true);
  assert.equal(ownerLanding.includes('data-track-event="owner_primary_cta_click"'), true);
  assert.equal(ownerFormPartial.includes("owner-revenue-teardown"), true);
  assert.equal(ownerFormPartial.includes('data-netlify="true"'), true);
});

test("owner landing page keeps the revenue teardown close to the sales argument instead of burying it under the library", () => {
  const teardownIndex = ownerLanding.indexOf('id="owner-cta"');
  const faqIndex = ownerLanding.indexOf("Selected FAQ");
  const libraryIndex = ownerLanding.indexOf("Operational Library");
  const specialSituationsIndex = ownerLanding.indexOf("Special Situations");

  assert.notEqual(teardownIndex, -1, "owner hub needs the teardown anchor");
  assert.equal(ownerLanding.includes("What the teardown gives you"), true);
  assert.equal(ownerLanding.includes("Fee drag, OTA leakage, and weak local execution do not show up cleanly in an owner statement."), true);
  assert.ok(teardownIndex < faqIndex, "owner CTA should land before FAQ filler");
  assert.ok(teardownIndex < libraryIndex, "owner CTA should land before the operational library");
  assert.ok(teardownIndex < specialSituationsIndex, "owner CTA should land before special-situations content");
});

test("owner template supports proof-first sections for high-intent owner pages", () => {
  assert.equal(ownerTemplate.includes("seoPage.proofStats"), true);
  assert.equal(ownerTemplate.includes("seoPage.switchReasons"), true);
  assert.equal(ownerTemplate.includes("seoPage.objections"), true);
  assert.equal(ownerTemplate.includes("seoPage.processSteps"), true);
  assert.equal(ownerTemplate.includes('data-track-event="owner_primary_cta_click"'), true);
});

test("top local owner pages expose proof-first fields and non-generic owner copy", () => {
  const expectations = {
    "vacation-rental-management-anna-maria-island": "We handle everything so you can enjoy passive income.",
    "vacation-rental-management-bradenton": "Bradenton's vacation rental market is booming.",
    "vacation-rental-management-sarasota": "Sarasota's vacation rental market offers excellent returns with professional management.",
    "vacation-rental-management-siesta-key": "Professional management maximizes your returns."
  };

  for (const [slug, staleIntroFragment] of Object.entries(expectations)) {
    const page = ownerData.find((entry) => entry.slug === slug);
    assert.ok(page, `Missing owner page ${slug}`);
    assert.ok(Array.isArray(page.proofStats) && page.proofStats.length > 0, `${slug} needs proofStats`);
    assert.ok(Array.isArray(page.switchReasons) && page.switchReasons.length > 0, `${slug} needs switchReasons`);
    assert.ok(Array.isArray(page.objections) && page.objections.length > 0, `${slug} needs objections`);
    assert.ok(Array.isArray(page.processSteps) && page.processSteps.length > 0, `${slug} needs processSteps`);
    assert.ok(page.primaryCta && typeof page.primaryCta === "string", `${slug} needs primaryCta`);
    assert.ok(page.ctaSubcopy && typeof page.ctaSubcopy === "string", `${slug} needs ctaSubcopy`);
    assert.ok(page.ctaNote && typeof page.ctaNote === "string", `${slug} needs ctaNote`);
    assert.ok(/owner|manager|switch|rate|fee|ota|channel|revenue/i.test(page.intro), `${slug} intro should sound like an owner decision page`);
    assert.equal(page.intro.includes(staleIntroFragment), false, `${slug} still reads like stale local SEO filler`);
  }
});

test("owner revenue teardown form lowers friction without losing tracking or intent", () => {
  const ownerFormPartial = fs.readFileSync(ownerFormPath, "utf8");

  assert.equal(ownerFormPartial.includes('name="phone"'), true);
  assert.equal(ownerFormPartial.includes('name="phone" autocomplete="tel" placeholder="(941) 555-1234" required'), false);
  assert.equal(ownerFormPartial.includes(">Property address or listing URL<"), true);
  assert.equal(ownerFormPartial.includes('placeholder="123 Palm Ave or airbnb.com/h/your-listing"'), true);
  assert.equal(ownerFormPartial.includes("Send the address or listing URL. We will show you where fee drag, OTA mix, and operating misses are costing you money."), true);
  assert.equal(ownerFormPartial.includes('data-track-form="owner"'), true);
  assert.equal(ownerFormPartial.includes('data-form-submit-event="owner_form_submit"'), true);
});
