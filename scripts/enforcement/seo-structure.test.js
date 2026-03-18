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

test("rehomed stay outliers point at their new guide and service homes", () => {
  const redirects = fs.readFileSync(path.join(projectRoot, "src", "_redirects"), "utf8");
  const seoPages = fs.readFileSync(path.join(projectRoot, "src", "_data", "seoPages.json"), "utf8");
  const staysPages = fs.readFileSync(path.join(projectRoot, "src", "_data", "staysPages.js"), "utf8");

  assert.equal(
    redirects.includes("/stays/hurricane-preparedness-guide/   /guides/hurricane-preparedness-florida-vacation/   301"),
    true
  );
  assert.equal(
    redirects.includes("/stays/luxury-concierge-services/   /services/concierge-services/   301"),
    true
  );
  assert.equal(
    redirects.includes("/stays/concierge-luxury-services/  /services/concierge-services/  301"),
    true
  );
  assert.equal(
    redirects.includes("/stays/travel-insurance-florida-vacation/  /guides/hurricane-preparedness-florida-vacation/  301"),
    true
  );
  assert.equal(seoPages.includes('"rehomeTo": "/guides/hurricane-preparedness-florida-vacation/"'), true);
  assert.equal(seoPages.includes('"rehomeTo": "/services/concierge-services/"'), true);
  assert.equal(staysPages.includes("!page.rehomeTo"), true);
});

test("guides hub is generated from current data and does not hardcode stale rehomed stay URLs", () => {
  const guidesHub = fs.readFileSync(path.join(projectRoot, "src", "guides", "index.njk"), "utf8");

  assert.equal(guidesHub.includes("staysPages"), true);
  assert.equal(guidesHub.includes("/stays/hurricane-preparedness-guide/"), false);
  assert.equal(guidesHub.includes("/stays/luxury-concierge-services/"), false);
});

test("new rehomed guide and service pages exist", () => {
  for (const pagePath of [
    path.join(projectRoot, "src", "guides", "hurricane-preparedness-florida-vacation.html"),
    path.join(projectRoot, "src", "services", "concierge-services", "index.njk")
  ]) {
    assert.equal(fs.existsSync(pagePath), true);
  }
});

test("retired duplicate guides are excluded and redirect to canonical guide paths", () => {
  const redirects = fs.readFileSync(path.join(projectRoot, "src", "_redirects"), "utf8");
  const eleventyConfig = fs.readFileSync(path.join(projectRoot, "eleventy.config.js"), "utf8");

  for (const retiredGuidePath of [
    path.join(projectRoot, "src", "guides", "anna-maria-island-vacation-cost-guide-2026", "index.html"),
    path.join(projectRoot, "src", "guides", "best-time-to-visit-anna-maria-island", "index.html"),
    path.join(projectRoot, "src", "guides", "bradenton-vs-sarasota-vacation-rental-comparison", "index.html")
  ]) {
    const retiredGuide = fs.readFileSync(retiredGuidePath, "utf8");
    assert.equal(retiredGuide.includes("permalink: false"), true);
    assert.equal(retiredGuide.includes("eleventyExcludeFromCollections: true"), true);
  }

  for (const redirectRule of [
    "/guides/anna-maria-island-vacation-cost-guide-2026/  /guides/anna-maria-island-vacation-cost/  301",
    "/guides/best-time-to-visit-anna-maria-island/  /guides/best-time-visit-anna-maria-island/  301",
    "/guides/bradenton-vs-sarasota-vacation-rental-comparison/  /guides/bradenton-vs-sarasota/  301"
  ]) {
    assert.equal(redirects.includes(redirectRule), true);
  }

  for (const ignoredGuideDir of [
    'src/guides/anna-maria-island-vacation-cost-guide-2026/**',
    'src/guides/best-time-to-visit-anna-maria-island/**',
    'src/guides/bradenton-vs-sarasota-vacation-rental-comparison/**'
  ]) {
    assert.equal(eleventyConfig.includes(ignoredGuideDir), true);
  }

  assert.equal(
    eleventyConfig.includes('addPassthroughCopy({ "src/guides": "guides" });'),
    false
  );
});

test("live sources no longer promote retired duplicate guide paths", () => {
  const sourceFiles = [
    path.join(projectRoot, "src", "llms.txt"),
    path.join(projectRoot, "src", "properties", "sarasota-luxe", "index.njk"),
    path.join(projectRoot, "src", "guides", "anna-maria-island-area-guide", "index.html"),
    path.join(projectRoot, "src", "guides", "flights-to-anna-maria-island", "index.html"),
    path.join(projectRoot, "src", "guides", "bradenton-vs-sarasota-beaches", "index.html"),
    path.join(projectRoot, "src", "guides", "bradenton-vs-sarasota-cost-of-living", "index.html"),
    path.join(projectRoot, "src", "guides", "bradenton-vs-sarasota-for-families", "index.html"),
    path.join(projectRoot, "src", "guides", "bradenton-vs-sarasota-restaurants", "index.html"),
    path.join(projectRoot, "src", "guides", "bradenton-vs-sarasota-retirement", "index.html")
  ];

  const staleGuidePaths = [
    "/guides/anna-maria-island-vacation-cost-guide-2026/",
    "/guides/best-time-to-visit-anna-maria-island/",
    "/guides/bradenton-vs-sarasota-vacation-rental-comparison/"
  ];

  for (const sourceFile of sourceFiles) {
    const source = fs.readFileSync(sourceFile, "utf8");
    for (const staleGuidePath of staleGuidePaths) {
      assert.equal(
        source.includes(staleGuidePath),
        false,
        `${path.relative(projectRoot, sourceFile)} should not include ${staleGuidePath}`
      );
    }
  }
});
