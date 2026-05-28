const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const save50PartialPath = path.join(projectRoot, "src", "_includes", "partials", "save50-offer.njk");
const propertiesCatalogPath = path.join(projectRoot, "src", "properties", "index.njk");
const propertyPages = [
  "dockside-dreams",
  "the-oasis",
  "sarasota-luxe",
  "river-house",
  "bradenton-pool-home"
];

test("SAVE50 offer copy matches the welcome email without overstating the booking rule", () => {
  const partial = fs.readFileSync(save50PartialPath, "utf8");

  for (const marker of [
    "SAVE50 welcome credit",
    "$50 off your first direct booking",
    "3 nights or more",
    "data-save50-offer"
  ]) {
    assert.equal(partial.includes(marker), true, `SAVE50 partial missing ${marker}`);
  }
  assert.match(partial, /enter\s+SAVE50\s+on the secure booking page/i);

  assert.equal(partial.includes("free stay"), false);
  assert.equal(partial.includes("no minimum"), false);
});

test("SAVE50 offer only opens from the email campaign query and preserves campaign parameters", () => {
  const partial = fs.readFileSync(save50PartialPath, "utf8");

  assert.match(partial, /campaign\s*===\s*SAVE50_CAMPAIGN/);
  assert.match(partial, /promo\s*===\s*"save50"/);
  assert.equal(partial.includes("PRESERVED_PARAM_KEYS"), true);
  assert.equal(partial.includes('"utm_campaign"'), true);
  assert.equal(partial.includes('"utm_source"'), true);
  assert.equal(partial.includes('"utm_medium"'), true);
  assert.equal(partial.includes("decorateCampaignLinks"), true);
  assert.equal(partial.includes("DOMContentLoaded"), true);
});

test("properties catalog and all email-linked property pages include the SAVE50 landing module", () => {
  const catalog = fs.readFileSync(propertiesCatalogPath, "utf8");
  assert.equal(catalog.includes('partials/save50-offer.njk'), true, "properties catalog missing SAVE50 partial");

  for (const slug of propertyPages) {
    const filePath = path.join(projectRoot, "src", "properties", slug, "index.njk");
    const source = fs.readFileSync(filePath, "utf8");
    assert.equal(source.includes('partials/save50-offer.njk'), true, `${slug} missing SAVE50 partial`);
  }
});
