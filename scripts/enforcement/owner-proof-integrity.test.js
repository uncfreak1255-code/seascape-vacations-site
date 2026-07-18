const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const ownerProofAssets = require("../../src/_data/ownerProofAssets.json");
const seoPages = require("../../src/_data/seoPages.json");
const { assertOwnerBenchmarkProof } = require("./owner-proof-freshness");
const {
  assertRequiredHeadTags,
  readBuiltRoute
} = require("./rendered-route-contract");

const projectRoot = path.resolve(__dirname, "..", "..");
const benchmarkKey = "gulf-coast-owner-benchmark-2026";
const benchmarkRoute = "/research/owner-fee-revenue-leak-benchmark-2026/";
const benchmarkCanonical = `https://seascape-vacations.com${benchmarkRoute}`;
const benchmarkAsset = ownerProofAssets[benchmarkKey];
const expectedTitle = "Airbnb Host Fees vs Card Processing | Seascape";
const expectedSocialTitle = "Airbnb Host Fees vs Card Processing";
const expectedDescription = "Compare Airbnb's published host fee with Stripe's card-processing price, see why they are not all-in equivalents, and learn how Seascape quotes each home.";

const expiredMarkers = [
  "$1.4M",
  "$119,923",
  "13.4%",
  "32.8%",
  "5.7%",
  "16.4%",
  "about $730",
  "about $450",
  "saved ~$450",
  "10.5 pts",
  "Patrick portfolio",
  "Patrick's portfolio"
];

const internalReaderPatterns = [
  /\bintake route\b/i,
  /\bmarked unknown\b/i,
  /\bthis page sends\b/i,
  /\bsource of truth\b/i,
  /\bfrozen\b/i,
  /\bunfrozen\b/i,
  /\bcanonical\b/i,
  /\brouting\b/i,
  /\bguardrail\b/i,
  /\breview intake\b/i,
  /\bbenchmark inputs\b/i,
  /\bMay-reviewed\b/i,
  /\blabelled separately\b/i,
  /\blabeled separately\b/i,
  /\bleak(?:age)?\b/i,
  /\bseascape-hub\b/i,
  /\/Users\//
];

function ownerRoutes() {
  return [
    benchmarkRoute,
    "/research/",
    "/research/how-seascape-protects-owner-net-2026/",
    "/guides/vacation-rental-income-anna-maria/",
    "/property-management/",
    ...seoPages.owner.map((page) => `/property-management/${page.slug}/`)
  ];
}

function articleObjects(contract) {
  return contract.jsonLdObjects.filter((object) => object["@type"] === "Article");
}

test("retired owner benchmark proof has a complete blocking contract", () => {
  assert.doesNotThrow(() =>
    assertOwnerBenchmarkProof(benchmarkAsset, new Date("2026-07-17T00:00:00Z"))
  );
  assert.equal(benchmarkAsset.stats.length, 0);
  assert.equal(benchmarkAsset.examples.length, 0);
  assert.ok(benchmarkAsset.proofLabels.includes("Definitions, not a payout forecast"));
  assert.equal(benchmarkAsset.proofLabels.includes("Scenario example, not a forecast"), false);
  assert.throws(
    () => assertOwnerBenchmarkProof(benchmarkAsset, new Date("2026-08-17T00:00:00Z")),
    /published pricing is stale after 2026-08-16/
  );
});

test("owner acquisition routes do not expose internal workflow language or retired proof", () => {
  for (const route of ownerRoutes()) {
    const contract = readBuiltRoute(projectRoot, route);

    for (const pattern of internalReaderPatterns) {
      assert.doesNotMatch(contract.visibleBodyText, pattern, `${route} exposes ${pattern}`);
    }

    for (const marker of expiredMarkers) {
      assert.equal(contract.visibleBodyText.includes(marker), false, `${route} exposes retired marker ${marker}`);
    }
  }
});

test("benchmark asset and rendered HTML do not hide retired or private proof", () => {
  const serializedAsset = JSON.stringify(benchmarkAsset);
  const benchmark = readBuiltRoute(projectRoot, benchmarkRoute);

  for (const marker of expiredMarkers) {
    assert.equal(serializedAsset.includes(marker), false, `benchmark asset contains ${marker}`);
    assert.equal(benchmark.visibleBodyText.includes(marker), false, `benchmark body contains ${marker}`);
  }
  assert.doesNotMatch(benchmark.visibleBodyText, /\bPatrick\b|seascape-hub|\/Users\//i);
});

test("research hub promotes the rescued fee guide instead of the retired benchmark", () => {
  const researchHub = readBuiltRoute(projectRoot, "/research/");

  assert.match(researchHub.visibleBodyText, /Airbnb Host Fees vs Card Processing/);
  assert.match(researchHub.visibleBodyText, /not all-in equivalents/);
  assert.match(researchHub.visibleBodyText, /Booking-trend reports use confirmed Seascape reservations/);
  assert.match(researchHub.visibleBodyText, /fee guides name their published or local sources/);
  assert.match(researchHub.head.description, /source-checked fee guides/);
  assert.doesNotMatch(
    researchHub.visibleBodyText,
    /our data comes from actual guest bookings and local cost verification/i
  );
  assert.doesNotMatch(researchHub.visibleBodyText, /management fee benchmark|leak(?:age)?/i);
});

test("retired owner research routes remove unsupported estimates and named testimonials", () => {
  const retiredRoutes = [
    "/research/how-seascape-protects-owner-net-2026/",
    "/guides/vacation-rental-income-anna-maria/"
  ];
  const removedClaims = [
    "Mike R.",
    "$45,000",
    "$95K",
    "30%+",
    "passive income",
    "private revenue teardown",
    "public proof surface"
  ];

  for (const route of retiredRoutes) {
    const contract = readBuiltRoute(projectRoot, route);
    assert.equal(contract.head.robots, "noindex, follow");
    for (const claim of removedClaims) {
      assert.equal(contract.visibleBodyText.includes(claim), false, `${route} exposes ${claim}`);
    }
  }
});

test("benchmark metadata, schema, byline, sources, and CTA stay synchronized", () => {
  const benchmark = readBuiltRoute(projectRoot, benchmarkRoute);
  assertRequiredHeadTags(benchmark, [
    "title",
    "description",
    "author",
    "canonical",
    "robots",
    "ogTitle",
    "ogDescription",
    "twitterTitle",
    "twitterDescription"
  ]);

  assert.ok(benchmark.head.title.length <= 60, `title is ${benchmark.head.title.length} characters`);
  assert.ok(benchmark.head.description.length <= 160, `description is ${benchmark.head.description.length} characters`);
  assert.equal(benchmark.head.title, expectedTitle);
  assert.equal(benchmark.head.description, expectedDescription);
  assert.equal(benchmark.head.canonical, benchmarkCanonical);
  assert.equal(benchmark.head.ogUrl, benchmarkCanonical);
  assert.equal(benchmark.head.robots, "index, follow");
  assert.equal(benchmark.head.ogTitle, expectedSocialTitle);
  assert.equal(benchmark.head.ogTitle, benchmark.head.twitterTitle);
  assert.equal(benchmark.head.ogDescription, benchmark.head.description);
  assert.equal(benchmark.head.twitterDescription, benchmark.head.description);
  assert.equal(benchmark.head.author, `${benchmarkAsset.reviewedBy}, Seascape Vacations`);

  const articles = articleObjects(benchmark);
  assert.equal(articles.length, 1);
  assert.equal(articles[0].headline, expectedSocialTitle);
  assert.equal(articles[0].description, benchmark.head.description);
  assert.equal(articles[0].mainEntityOfPage, benchmarkCanonical);
  assert.equal(articles[0].author.name, benchmarkAsset.reviewedBy);
  assert.equal(articles[0].author.worksFor.name, "Seascape Vacations");
  assert.ok(benchmark.jsonLdObjects.some((object) => object["@type"] === "BreadcrumbList"));
  assert.equal(
    benchmark.jsonLdObjects.some((object) => object["@type"] === "FAQPage"),
    false,
    "benchmark should not publish FAQ schema without a visible FAQ section"
  );

  for (const visibleProof of [
    benchmarkAsset.reviewedBy,
    benchmarkAsset.reviewerRole,
    benchmarkAsset.basis,
    benchmarkAsset.sourceNote,
    "Airbnb",
    "Stripe",
    "Anna Maria Island"
  ]) {
    assert.match(
      benchmark.visibleBodyText,
      new RegExp(visibleProof.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    );
  }

  const html = fs.readFileSync(
    path.join(projectRoot, "_site", "research", "owner-fee-revenue-leak-benchmark-2026", "index.html"),
    "utf8"
  );
  assert.match(html, /href="https:\/\/www\.airbnb\.com\/help\/article\/1857"/);
  assert.match(html, /href="https:\/\/stripe\.com\/pricing"/);
  assert.match(
    html,
    /href="\/property-management\/\?owner_source=owner-fee-revenue-leak-benchmark-2026#owner-cta"/
  );
  assert.match(html, /<picture>\s*<source srcset="\/images\/owner-field-hero\.webp" type="image\/webp">\s*<img src="\/images\/owner-field-hero\.webp"/);
  assert.match(html, /alt="Gulf Coast rental homes near the Anna Maria Island and Bradenton market"/);
  assert.match(
    html,
    /<div class="scenario-cards scenario-cards--fees" data-mobile-fee-comparison>/
  );
  assert.equal(
    (html.match(/data-mobile-fee-row/g) || []).length,
    3,
    "mobile readers should receive every published fee row"
  );
  for (const mobileFieldLabel of [
    "Published rate or quote",
    "What it covers",
    "What to ask",
    "Why it matters"
  ]) {
    assert.match(html, new RegExp(`scenario-card-field">${mobileFieldLabel}<`));
  }
  for (const tableRegionLabel of [
    "Published fee comparison",
    "Questions to compare fee quotes"
  ]) {
    assert.match(
      html,
      new RegExp(`class="scenario-table-wrap" role="region" aria-label="${tableRegionLabel}" tabindex="0"`)
    );
  }
  assert.doesNotMatch(html, /seascape-og-default\.jpg/);
});

test("linked public guides do not restore unsupported management uplift or retired fee-guide naming", () => {
  const bradentonAnalysis = readBuiltRoute(
    projectRoot,
    "/guides/2026-bradenton-vacation-rental-market-analysis/"
  );
  const companyGuide = readBuiltRoute(projectRoot, "/guides/best-vacation-rental-companies-ami/");
  const bookingTrends = readBuiltRoute(
    projectRoot,
    "/research/gulf-coast-vacation-booking-trends-2026/"
  );

  assert.doesNotMatch(
    bradentonAnalysis.visibleBodyText,
    /leave 15-20% on the table|12% higher occupancy|8% higher nightly rates/i
  );
  assert.doesNotMatch(companyGuide.visibleBodyText, /\bfee leakage\b/i);
  assert.match(bookingTrends.visibleBodyText, /Owner Fee Comparison Guide/);
  assert.doesNotMatch(bookingTrends.visibleBodyText, /Owner Fee Benchmark/);
});

test("benchmark is in the sitemap and its CTA target drops attribution parameters from the canonical", () => {
  const sitemap = fs.readFileSync(path.join(projectRoot, "_site", "sitemap.xml"), "utf8");
  assert.match(sitemap, /^\s*<\?xml version="1\.0" encoding="utf-8"\?>/i);
  assert.match(
    sitemap,
    new RegExp(`<loc>${benchmarkCanonical.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\\/loc>`)
  );

  const ownerHub = readBuiltRoute(projectRoot, "/property-management/");
  assert.equal(ownerHub.head.canonical, "https://seascape-vacations.com/property-management/");
  assert.equal(ownerHub.head.ogUrl, "https://seascape-vacations.com/property-management/");
  assert.doesNotMatch(ownerHub.head.canonical, /owner_source|#owner-cta/);
});

test("legacy gap alias keeps redirecting to the indexed canonical route", () => {
  const redirects = fs.readFileSync(path.join(projectRoot, "src", "_redirects"), "utf8");
  assert.match(
    redirects,
    /^\/research\/owner-fee-revenue-gap-benchmark-2026\/\s+\/research\/owner-fee-revenue-leak-benchmark-2026\/\s+301$/m
  );
});
