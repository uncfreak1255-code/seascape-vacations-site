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

test("owner template supports proof-first sections for high-intent owner pages", () => {
  assert.equal(ownerTemplate.includes("seoPage.proofStats"), true);
  assert.equal(ownerTemplate.includes("seoPage.switchReasons"), true);
  assert.equal(ownerTemplate.includes("seoPage.objections"), true);
  assert.equal(ownerTemplate.includes("seoPage.processSteps"), true);
  assert.equal(ownerTemplate.includes('data-track-event="owner_primary_cta_click"'), true);
});

test("priority owner pages expose proof-first fields", () => {
  for (const slug of [
    "vacation-rental-management-anna-maria-island",
    "vacation-rental-management-bradenton",
    "vacation-rental-management-sarasota",
    "maximize-vacation-rental-income-florida",
    "switch-vacation-rental-management-company"
  ]) {
    const page = ownerData.find((entry) => entry.slug === slug);
    assert.ok(page, `Missing owner page ${slug}`);
    assert.ok(Array.isArray(page.proofStats) && page.proofStats.length > 0, `${slug} needs proofStats`);
    assert.ok(Array.isArray(page.switchReasons) && page.switchReasons.length > 0, `${slug} needs switchReasons`);
    assert.ok(Array.isArray(page.objections) && page.objections.length > 0, `${slug} needs objections`);
    assert.ok(Array.isArray(page.processSteps) && page.processSteps.length > 0, `${slug} needs processSteps`);
    assert.ok(page.primaryCta && typeof page.primaryCta === "string", `${slug} needs primaryCta`);
  }
});
