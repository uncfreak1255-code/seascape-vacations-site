const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

test("stays template can noindex weak template pages and avoids empty inventory schema", () => {
  const staysTemplate = fs.readFileSync(path.join(projectRoot, "src", "stays", "stays.njk"), "utf8");

  assert.equal(staysTemplate.includes("data: staysPages"), true);
  assert.equal(staysTemplate.includes("seoGovernance.staysNoindexSlugs.indexOf(seoPage.slug) === -1"), true);
  assert.equal(staysTemplate.includes("noindex, follow"), true);
  assert.equal(staysTemplate.includes("{% if properties and properties | length %}"), true);
});

test("sitemap is built from rendered pages instead of legacy route assumptions", () => {
  const sitemap = fs.readFileSync(path.join(projectRoot, "src", "sitemap.njk"), "utf8");

  assert.equal(sitemap.includes("collections.all"), true);
  assert.equal(sitemap.includes("entry.data.seoIndexable"), true);
  assert.equal(sitemap.includes("/destinations/"), false);
  assert.equal(sitemap.includes("/rentals/"), false);
});

test("redirects avoid the known missing legacy target pages", () => {
  const redirects = fs.readFileSync(path.join(projectRoot, "src", "_redirects"), "utf8");

  for (const missingTarget of [
    "/stays/waterfront-vacation-rentals-with-kayaks/",
    "/stays/de-soto-national-memorial-vacation-rentals/",
    "/stays/pet-friendly-vacation-rentals-anna-maria-island/",
    "/stays/cortez-village-vacation-rentals/",
    "/stays/palmetto-vacation-rentals-florida/"
  ]) {
    assert.equal(redirects.includes(missingTarget), false);
  }

  for (const safeTarget of [
    "/stays/gulf-coast-vacation-homes-with-dock/",
    "/stays/kayaking-vacation-rentals-bradenton/",
    "/guides/things-to-do-bradenton-fl.html",
    "/stays/pet-friendly-vacation-rentals-bradenton/",
    "/stays/bradenton-vacation-rentals-near-beaches/",
    "/guides/bradenton-area-guide/"
  ]) {
    assert.equal(redirects.includes(safeTarget), true);
  }
});
