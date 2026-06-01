const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

function getFirstMatch(source, regex) {
  const match = source.match(regex);
  return match ? match[1] : "";
}

function listMarkupFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMarkupFiles(full);
    return /\.(html|njk)$/.test(entry.name) ? [full] : [];
  });
}

test("stays template can noindex weak template pages and avoids empty inventory schema", () => {
  const staysTemplate = fs.readFileSync(path.join(projectRoot, "src", "stays", "stays.njk"), "utf8");

  assert.equal(staysTemplate.includes("data: staysPages"), true);
  assert.equal(staysTemplate.includes("seoGovernance.staysNoindexSlugs.indexOf(seoPage.slug) === -1"), true);
  assert.equal(staysTemplate.includes("noindex, follow"), true);
  assert.equal(
    staysTemplate.includes("{% elif properties and properties | length and seoPage.matchingProperties and seoPage.matchingProperties.length > 0 %}"),
    true
  );
  assert.equal(staysTemplate.includes("{% elif properties and properties | length %}"), true);
});

test("sitemap is built from rendered pages instead of legacy route assumptions", () => {
  const sitemap = fs.readFileSync(path.join(projectRoot, "src", "sitemap.njk"), "utf8");

  assert.equal(sitemap.includes("collections.all"), true);
  assert.equal(sitemap.includes("entry.data.seoIndexable"), true);
  assert.equal(sitemap.includes("/destinations/"), false);
  assert.equal(sitemap.includes("/rentals/"), false);
  assert.equal(sitemap.includes("excludedUrls"), false);
  assert.equal(sitemap.includes("/guides/bradenton-vs-sarasota-vacation-rental-comparison/"), false);
  assert.equal(sitemap.includes("/guides/anna-maria-island-vacation-cost-guide-2026/"), false);
  assert.equal(sitemap.includes("/guides/best-time-to-visit-anna-maria-island/"), false);
});

test("sitemap explicitly includes paginated stay and owner inventories", () => {
  const sitemap = fs.readFileSync(path.join(projectRoot, "src", "sitemap.njk"), "utf8");
  const staysHub = fs.readFileSync(path.join(projectRoot, "src", "stays", "index.njk"), "utf8");

  assert.equal(sitemap.includes("staysPages"), true);
  assert.equal(sitemap.includes("seoPages.owner"), true);
  assert.equal(sitemap.includes("url == '/stays/'"), true);
  assert.equal(sitemap.includes("url.indexOf('/stays/') === -1"), true);
  assert.equal(sitemap.includes("url == '/property-management/' or url.indexOf('/property-management/') === -1"), true);
  assert.equal(staysHub.includes('permalink: "/stays/"'), true);
  assert.equal(staysHub.includes("staysPages"), true);
  assert.equal(staysHub.includes("seoGovernance.staysNoindexSlugs.indexOf(page.slug) === -1"), true);
});

test("redirects avoid the known missing legacy target pages", () => {
  const redirects = fs.readFileSync(path.join(projectRoot, "src", "_redirects"), "utf8");

  for (const missingTarget of [
    "/stays/waterfront-vacation-rentals-with-kayaks/",
    "/stays/de-soto-national-memorial-vacation-rentals/",
    "/stays/pet-friendly-vacation-rentals-anna-maria-island/",
    "/stays/cortez-village-vacation-rentals/",
    "/stays/palmetto-vacation-rentals-florida/",
    "/stays/paddleboarding-vacation-rentals-florida/",
    "/stays/riverwalk-bradenton-vacation-rentals/",
    "/stays/birdwatching-vacation-rentals-florida/",
    "/stays/sunset-cruise-vacation-rentals-bradenton/",
    "/contact/"
  ]) {
    assert.equal(redirects.includes(missingTarget), false);
  }

  for (const safeTarget of [
    "/stays/gulf-coast-vacation-homes-with-dock/",
    "/stays/kayaking-vacation-rentals-bradenton/",
    "/guides/things-to-do-bradenton-fl/",
    "/stays/pet-friendly-vacation-rentals-bradenton/",
    "/stays/bradenton-vacation-rentals-near-beaches/",
    "/guides/bradenton-area-guide/"
  ]) {
    assert.equal(redirects.includes(safeTarget), true);
  }
});

test("legacy guide alias redirects point directly at slash canonicals instead of .html hops", () => {
  const redirects = fs.readFileSync(path.join(projectRoot, "src", "_redirects"), "utf8");

  for (const staleTarget of [
    "/guides/anna-maria-island-beaches.html",
    "/guides/bradenton-beach.html",
    "/guides/siesta-key-beach-guide.html",
    "/guides/fishing-guide-anna-maria-sarasota.html",
    "/guides/things-to-do-bradenton-fl.html",
    "/guides/do-you-need-a-car-anna-maria-island.html",
    "/guides/best-restaurants-anna-maria-island.html",
    "/guides/dolphins-manatees-bradenton.html",
    "/guides/shelling-guide-florida.html",
    "/guides/anna-maria-city.html"
  ]) {
    assert.equal(redirects.includes(staleTarget), false, `Expected redirects to stop targeting ${staleTarget}`);
  }

  for (const canonicalTarget of [
    "/guides/anna-maria-island-beaches/",
    "/guides/bradenton-beach/",
    "/guides/siesta-key-beach-guide/",
    "/guides/fishing-guide-anna-maria-sarasota/",
    "/guides/things-to-do-bradenton-fl/",
    "/guides/do-you-need-a-car-anna-maria-island/",
    "/guides/best-restaurants-anna-maria-island/",
    "/guides/dolphins-manatees-bradenton/",
    "/guides/shelling-guide-florida/",
    "/guides/anna-maria-city/"
  ]) {
    assert.equal(redirects.includes(canonicalTarget), true, `Expected redirects to include ${canonicalTarget}`);
  }
});

test("guide redirects enforce a trailing-slash canonical shape for current guides", () => {
  const redirects = fs.readFileSync(path.join(projectRoot, "src", "_redirects"), "utf8");

  for (const redirectRule of [
    "/guides/:slug  /guides/:slug/  301",
    "/guides/:slug.html  /guides/:slug/  301",
    "/guides/:slug/index.html  /guides/:slug/  301"
  ]) {
    assert.equal(redirects.includes(redirectRule), true, `Expected redirects to include ${redirectRule}`);
  }
});

test("public source templates do not link to slashless or .html guide URLs", () => {
  const offenders = [];
  const guideHrefPattern = /href="(\/guides\/[^"/?#]+(?:\.html)?)(?="|[?#])/g;

  for (const file of listMarkupFiles(path.join(projectRoot, "src"))) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(guideHrefPattern)) {
      offenders.push(`${path.relative(projectRoot, file)} -> ${match[1]}`);
    }
  }

  assert.deepEqual(offenders, []);
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
  assert.equal(
    redirects.includes("/stays/holiday-vacation-rentals-anna-maria-island/  /stays/anna-maria-island-vacation-rentals/  301"),
    true
  );
  assert.equal(
    redirects.includes("/stays/birthday-celebration-rentals-florida/  /stays/large-group-vacation-rentals-bradenton/  301"),
    true
  );
  assert.equal(seoPages.includes('"rehomeTo": "/guides/hurricane-preparedness-florida-vacation/"'), true);
  assert.equal(seoPages.includes('"rehomeTo": "/services/concierge-services/"'), true);
  assert.equal(seoPages.includes('"rehomeTo": "/stays/anna-maria-island-vacation-rentals/"'), true);
  assert.equal(seoPages.includes('"rehomeTo": "/stays/large-group-vacation-rentals-bradenton/"'), true);
  assert.equal(staysPages.includes("!page.rehomeTo"), true);
});

test("guides hub is generated from current data and does not hardcode stale rehomed stay URLs", () => {
  const guidesHub = fs.readFileSync(path.join(projectRoot, "src", "guides", "index.njk"), "utf8");

  assert.equal(guidesHub.includes("staysPages"), true);
  assert.equal(guidesHub.includes("/stays/hurricane-preparedness-guide/"), false);
  assert.equal(guidesHub.includes("/stays/luxury-concierge-services/"), false);
});

test("about page exists as a real route and homepage links point to it", () => {
  const homepage = fs.readFileSync(path.join(projectRoot, "src", "index.njk"), "utf8");
  const redirects = fs.readFileSync(path.join(projectRoot, "src", "_redirects"), "utf8");
  const aboutPagePath = path.join(projectRoot, "src", "about-us", "index.njk");

  assert.equal(fs.existsSync(aboutPagePath), true);
  assert.equal(homepage.includes('href="/about-us/"'), true);
  assert.equal(homepage.includes('href="#welcome"'), false);
  assert.equal(redirects.includes("/about-us   /about-us/   301"), true);
});

test("property owners page leads with premium proof instead of explainer-hub copy", () => {
  const ownerPage = fs.readFileSync(path.join(projectRoot, "src", "property-management", "index.njk"), "utf8");

  assert.equal(ownerPage.includes("Before you renew,"), true);
  assert.equal(ownerPage.includes("actually keep?"), true);
  assert.equal(ownerPage.includes("$119,923"), true);
  assert.equal(ownerPage.includes("13.4% → 2.9%"), true);
  assert.equal(ownerPage.includes("What to look at before you change managers"), true);
  assert.equal(ownerPage.includes("What Is Vacation Rental Property Management?"), false);
  assert.equal(ownerPage.includes("Request a property evaluation"), false);
});

test("guides hub behaves like an editorial blog front door with hierarchy", () => {
  const guidesHub = fs.readFileSync(path.join(projectRoot, "src", "guides", "index.njk"), "utf8");

  assert.equal(guidesHub.includes("Featured Story"), true);
  assert.equal(guidesHub.includes("Start Here"), true);
  assert.equal(guidesHub.includes("Comparisons"), true);
  assert.equal(guidesHub.includes("Area Guides"), true);
  assert.equal(guidesHub.includes("Trip Planning"), true);
  assert.equal(guidesHub.includes("Owner Insights"), true);
  assert.equal(guidesHub.includes("staysPages"), true);
  assert.equal(guidesHub.includes("seoPages.owner"), true);
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
    path.join(projectRoot, "src", "guides", "best-time-to-visit-anna-maria-island", "index.html")
  ]) {
    const retiredGuide = fs.readFileSync(retiredGuidePath, "utf8");
    assert.equal(retiredGuide.includes("permalink: false"), true);
    assert.equal(retiredGuide.includes("eleventyExcludeFromCollections: true"), true);
  }

  assert.equal(
    fs.existsSync(path.join(projectRoot, "src", "guides", "bradenton-vs-sarasota-vacation-rental-comparison", "index.html")),
    false,
    "Expected the retired duplicate comparison source route to be removed entirely"
  );

  for (const redirectRule of [
    "/guides/anna-maria-island-vacation-cost-guide-2026/  /guides/anna-maria-island-vacation-cost/  301",
    "/guides/best-time-to-visit-anna-maria-island/  /guides/best-time-visit-anna-maria-island/  301",
    "/guides/bradenton-vs-sarasota-vacation-rental-comparison/  /guides/bradenton-vs-sarasota/  301"
  ]) {
    assert.equal(redirects.includes(redirectRule), true);
  }

  for (const ignoredGuideDir of [
    'src/guides/anna-maria-island-vacation-cost-guide-2026/**',
    'src/guides/best-time-to-visit-anna-maria-island/**'
  ]) {
    assert.equal(eleventyConfig.includes(ignoredGuideDir), true);
  }

  assert.equal(
    eleventyConfig.includes('src/guides/bradenton-vs-sarasota-vacation-rental-comparison/**'),
    false,
    "Expected Eleventy to stop carrying an ignore for a deleted duplicate comparison guide"
  );

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

test("priority guides ship complete metadata instead of truncated titles or broken descriptions", () => {
  const guideExpectations = [
    {
      relativePath: ["src", "guides", "2026-bradenton-vacation-rental-market-analysis.html"],
      expectedTitle: "2026 Bradenton Beach Vacation Rental Market: Pricing, Occupancy & Top Areas"
    },
    {
      relativePath: ["src", "guides", "anna-maria-island-vs-longboat-key.html"],
      expectedTitle: "Anna Maria Island vs Longboat Key — Which Beach Is Right for You?"
    },
    {
      relativePath: ["src", "guides", "best-waterfront-restaurants-with-boat-dock.html"],
      expectedTitle: "Best Waterfront Restaurants with Boat Dock Access Near AMI | 2026",
      expectedDescription:
        "The best waterfront restaurants near Bradenton and Anna Maria Island where you can pull up by boat. Dockside dining with Gulf views and fresh seafood."
    },
    {
      relativePath: ["src", "guides", "fishing-guide-anna-maria-sarasota.html"],
      expectedTitle: "Complete Fishing Guide: Anna Maria Island, Bradenton & Sarasota",
      expectedDescription:
        "Complete fishing guide for Anna Maria Island, Bradenton, and Sarasota. Inshore, offshore, pier fishing, best charters, seasonal species, and license tips."
    },
    {
      relativePath: ["src", "guides", "florida-gulf-coast-vacation-rental-market-report-2026.html"],
      expectedTitle: "2026 Gulf Coast Vacation Rental Market Report — Pricing & Trends"
    }
  ];

  for (const expectation of guideExpectations) {
    const source = fs.readFileSync(path.join(projectRoot, ...expectation.relativePath), "utf8");
    const title = getFirstMatch(source, /<title>([\s\S]*?)<\/title>/i);
    const description = getFirstMatch(source, /<meta name="description" content="([\s\S]*?)"/i);

    assert.equal(title, expectation.expectedTitle);

    if (expectation.expectedDescription) {
      assert.equal(description, expectation.expectedDescription);
    }
  }
});

test("guide metadata no longer ships stale 2025 date tags on current travel pages", () => {
  const freshnessGuidePaths = [
    path.join(projectRoot, "src", "guides", "anna-maria-island-beaches.html"),
    path.join(projectRoot, "src", "guides", "best-restaurants-anna-maria-island.html"),
    path.join(projectRoot, "src", "guides", "dolphins-manatees-bradenton.html"),
    path.join(projectRoot, "src", "guides", "siesta-key-beach-guide.html")
  ];

  for (const guidePath of freshnessGuidePaths) {
    const source = fs.readFileSync(guidePath, "utf8");
    assert.equal(
      source.includes("(2025)"),
      false,
      `${path.relative(projectRoot, guidePath)} should not still ship 2025 tags`
    );
  }
});
