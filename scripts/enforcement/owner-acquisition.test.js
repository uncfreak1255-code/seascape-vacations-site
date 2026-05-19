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
const siteHeader = fs.readFileSync(
  path.join(projectRoot, "src", "_includes", "partials", "site-header.njk"),
  "utf8"
);
const siteHeaderStyles = fs.readFileSync(
  path.join(projectRoot, "src", "_includes", "partials", "site-header-styles.njk"),
  "utf8"
);
const ownerData = require(path.join(projectRoot, "src", "_data", "seoPages.json")).owner;
const ownerProofAssets = require(path.join(projectRoot, "src", "_data", "ownerProofAssets.json"));
const ownerFormPath = path.join(projectRoot, "src", "_includes", "partials", "owner-evaluation-form.njk");

test("owner landing page uses a real owner revenue teardown form instead of generic evaluation copy", () => {
  assert.equal(fs.existsSync(ownerFormPath), true, "owner form partial should exist");

  const ownerFormPartial = fs.readFileSync(ownerFormPath, "utf8");
  assert.equal(ownerLanding.includes("Request Your Revenue Teardown"), true);
  assert.equal(ownerLanding.includes("ownerEvaluationForm({"), true);
  assert.equal(ownerLanding.includes('data-track-event="owner_primary_cta_click"'), true);
  assert.equal(ownerFormPartial.includes("owner-revenue-teardown"), true);
  assert.equal(ownerFormPartial.includes('data-netlify="true"'), true);
});

test("owner landing page keeps the owner revenue teardown close to the sales argument instead of burying it under the library", () => {
  const reviewIndex = ownerLanding.indexOf('id="owner-cta"');
  const faqIndex = ownerLanding.indexOf("Selected FAQ");
  const libraryIndex = ownerLanding.indexOf("Owner Guides");
  const specialSituationsIndex = ownerLanding.indexOf("Specific Situations");

  assert.notEqual(reviewIndex, -1, "owner hub needs the revenue teardown anchor");
  assert.equal(ownerLanding.includes("Benchmark + Teardown"), true);
  assert.equal(
    ownerLanding.includes("Fee drag, OTA dependence, review-risk signals, and uneven owner communication rarely show up clearly in an owner statement."),
    true
  );
  assert.ok(reviewIndex < faqIndex, "owner CTA should land before FAQ filler");
  assert.ok(reviewIndex < libraryIndex, "owner CTA should land before the operational library");
  assert.ok(reviewIndex < specialSituationsIndex, "owner CTA should land before special-situations content");
});

test("owner landing page opts into owner-only nav instead of the guest browse header", () => {
  assert.equal(ownerLanding.includes("ownerNavOnly: true"), true, "owner landing should declare owner-only nav mode");
  assert.equal(ownerLanding.includes('navButtonLabel: "Revenue Review"'), true, "owner landing should use compact owner nav CTA copy");
  assert.equal(siteHeader.includes("{% if resolvedOwnerNavOnly %}"), true, "site header should support owner-only nav mode");
  assert.equal(siteHeader.includes('class="nav-links nav-links--owner"'), true, "owner-only nav should use its own CTA container");
  assert.equal(siteHeader.includes('class="nav-owner-cta"'), true, "owner-only nav should use a lighter bespoke CTA treatment");
  assert.equal(siteHeaderStyles.includes(".nav-links--owner {"), true, "owner-only nav needs CSS that keeps the CTA visible below desktop");
  assert.equal(siteHeaderStyles.includes(".nav-owner-cta {"), true, "owner-only nav CSS should style the compact CTA directly");
  assert.equal(siteHeaderStyles.includes("margin-left: auto;"), true, "owner-only nav should push the CTA to the right without guest links");
  assert.equal(siteHeader.includes("href=\"/properties/\""), true, "shared header still needs guest-nav links for non-owner pages");
  assert.equal(siteHeader.includes("Request Your Revenue Teardown"), false, "shared header should stay page-driven, not hard-code owner CTA copy");
});

test("owner template supports proof-first sections for high-intent owner pages", () => {
  assert.equal(ownerTemplate.includes("seoPage.proofStats"), true);
  assert.equal(ownerTemplate.includes("seoPage.switchReasons"), true);
  assert.equal(ownerTemplate.includes("seoPage.objections"), true);
  assert.equal(ownerTemplate.includes("seoPage.processSteps"), true);
  assert.equal(ownerTemplate.includes('data-track-event="owner_primary_cta_click"'), true);
});

test("owner template supports shared proof citations and curated owner-resource routing", () => {
  assert.equal(ownerTemplate.includes("ownerProofAssets[seoPage.proofAssetKey]"), true);
  assert.equal(ownerTemplate.includes("proofAsset.reviewedBy"), true);
  assert.equal(ownerTemplate.includes("proofAsset.reviewedDate"), true);
  assert.equal(ownerTemplate.includes("proofAsset.sourceLabel"), true);
  assert.equal(ownerTemplate.includes("proofAsset.sourceUrl"), true);
  assert.equal(ownerTemplate.includes("seoPage.relatedOwnerResources"), true);
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
  assert.equal(ownerFormPartial.includes('options.propertyFieldLabel or "Property address or listing URL"'), true);
  assert.equal(ownerFormPartial.includes("options.propertyFieldPlaceholder or '123 Palm Ave or airbnb.com/h/your-listing'"), true);
  assert.equal(ownerFormPartial.includes('enctype="multipart/form-data"'), true);
  assert.equal(ownerFormPartial.includes('name="listing_url"'), true);
  assert.equal(ownerFormPartial.includes('name="current_manager"'), true);
  assert.equal(ownerFormPartial.includes('name="current_fee_quote"'), true);
  assert.equal(ownerFormPartial.includes('name="what_feels_off"'), true);
  assert.equal(ownerFormPartial.includes('name="owner_statement"'), true);
  assert.equal(ownerFormPartial.includes("Share whichever source is easiest. A listing URL is enough to start; an owner statement or fee quote makes the teardown sharper."), true);
  assert.equal(
    ownerFormPartial.includes("The teardown is a review of available evidence. Missing statements, calendars, reviews, or fee terms will be marked unknown."),
    true
  );
  assert.equal(ownerFormPartial.includes("The private teardown separates proven leak, likely leak, and unknown"), true);
  assert.equal(ownerFormPartial.includes("Send My Teardown Request"), true);
  assert.equal(ownerFormPartial.includes('data-track-form="owner"'), true);
  assert.equal(ownerFormPartial.includes('data-form-submit-event="owner_form_submit"'), true);
  assert.equal(ownerFormPartial.includes('data-source-page-slug="{{ options.sourcePageSlug or options.pageSlug or \'property-management\' }}"'), true);
  assert.equal(ownerFormPartial.includes('name="source_page_slug" value="{{ options.sourcePageSlug or options.pageSlug or \'property-management\' }}"'), true);
  assert.equal(ownerLanding.includes("showBenchmarkFields: true"), true);
  assert.equal(ownerTemplate.includes("showBenchmarkFields: true"), true);
  assert.equal(ownerLanding.includes('propertyFieldLabel: "Property address or market"'), true);
  assert.equal(ownerTemplate.includes('propertyFieldLabel: "Property address or market"'), true);
});

test("owner benchmark CTA carries source attribution into the revenue review form path", () => {
  const ownerBenchmark = fs.readFileSync(
    path.join(projectRoot, "src", "research", "owner-fee-revenue-leak-benchmark-2026.njk"),
    "utf8"
  );

  const teardownHref = '/property-management/?owner_source=owner-fee-revenue-leak-benchmark-2026#owner-cta';

  assert.equal(ownerBenchmark.includes(teardownHref), true);
  assert.equal(ownerBenchmark.includes('href="#owner-cta"'), false);
  assert.equal(ownerBenchmark.includes('sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026"'), false);
  assert.equal(ownerBenchmark.includes('formPlacement: "benchmark-teardown"'), false);

  const mobileScopeIndex = ownerBenchmark.indexOf('<div class="hero-mobile-scope mobile-only">');
  const mobileActionsIndex = ownerBenchmark.indexOf('<div class="hero-mobile-actions mobile-only">');
  const wrongComparisonIndex = ownerBenchmark.indexOf('<span class="eyebrow">The wrong comparison</span>');

  assert.equal(
    mobileScopeIndex < mobileActionsIndex && mobileActionsIndex < wrongComparisonIndex,
    true,
    "mobile teardown CTA should sit directly under the hero before the wrong-comparison section"
  );
  assert.equal(
    /<div class="hero-mobile-actions mobile-only">\s*<a class="btn btn-gold" href="\{\{ teardownHref \}\}".*?See the benchmark math/s.test(ownerBenchmark),
    true,
    "mobile hero actions should point to the shared owner intake route and keep the benchmark-math link"
  );
});

test("owner benchmark page stays in the leak-stack lane and keeps visible proof labels", () => {
  const ownerBenchmark = fs.readFileSync(
    path.join(projectRoot, "src", "research", "owner-fee-revenue-leak-benchmark-2026.njk"),
    "utf8"
  );

  assert.equal(ownerBenchmark.includes("Your management fee is not the whole revenue leak."), true);
  assert.equal(ownerBenchmark.includes("5-property Gulf Coast scope"), true);
  assert.equal(ownerBenchmark.includes("Observed Seascape portfolio data"), true);
  assert.equal(ownerBenchmark.includes("Observed property example"), true);
  assert.equal(ownerBenchmark.includes("Scenario math, not a forecast"), true);
  assert.equal(ownerBenchmark.includes("Request Your Revenue Teardown"), true);
  assert.equal(ownerBenchmark.includes("Patrick portfolio"), true);
  assert.equal(ownerBenchmark.includes("This benchmark is a decision aid, not a revenue forecast or market-wide fee survey."), true);
  assert.equal(ownerBenchmark.includes("passive income"), false);
  assert.equal(ownerBenchmark.includes("sit back while we manage"), false);
  assert.equal(ownerBenchmark.includes("full service"), false);
});

test("owner pages keep phone as a lower-trust fallback instead of a competing hero CTA", () => {
  const landingHeroStart = ownerLanding.indexOf('<section class="section owner-hero">');
  const landingHeroEnd = ownerLanding.indexOf("</section>", landingHeroStart);
  const landingHero = ownerLanding.slice(landingHeroStart, landingHeroEnd);

  const templateHeroStart = ownerTemplate.indexOf('<section class="section" style="background: linear-gradient(135deg, var(--brand-dark) 0%, #1a3a3c 100%); color: white;">');
  const templateHeroEnd = ownerTemplate.indexOf("</section>", templateHeroStart);
  const templateHero = ownerTemplate.slice(templateHeroStart, templateHeroEnd);

  assert.notEqual(landingHeroStart, -1, "owner landing hero should exist");
  assert.notEqual(templateHeroStart, -1, "owner template hero should exist");
  assert.equal(landingHero.includes('data-track-event="owner_phone_click"'), false, "landing hero should not compete with the review CTA");
  assert.equal(templateHero.includes('data-track-event="owner_phone_click"'), false, "owner page hero should not compete with the review CTA");
  assert.equal((ownerLanding.match(/data-track-event="owner_phone_click"/g) || []).length, 1, "landing page should keep one lower-trust phone fallback");
  assert.equal((ownerTemplate.match(/data-track-event="owner_phone_click"/g) || []).length, 1, "owner template should keep one lower-trust phone fallback");
  assert.equal(ownerLanding.includes("Prefer to talk first?"), true, "landing page should frame phone as a fallback");
  assert.equal(ownerTemplate.includes("Prefer to talk first?"), true, "owner template should frame phone as a fallback");
});

test("week 3 owner pages do not collapse back into fake flat-fee messaging", () => {
  const switchPage = ownerData.find((entry) => entry.slug === "switch-vacation-rental-management-company");
  const sarasotaPage = ownerData.find((entry) => entry.slug === "vacation-rental-management-sarasota");

  assert.ok(switchPage, "switch-manager page should exist");
  assert.ok(sarasotaPage, "Sarasota owner page should exist");
  assert.equal(ownerLanding.includes("10-15% management fees"), false, "owner landing should not hard-code a flat fee band");
  assert.equal(
    ownerLanding.includes("We do not quote one flat management fee for every home."),
    true,
    "owner landing should explain the tailored pricing model"
  );
  assert.equal(switchPage.benefits.includes("10-15% management fees instead of paying more for the same misses"), false, "switch page should not claim a flat fee band");
  assert.equal(switchPage.geoIntro.includes("10-15%"), false, "switch page GEO intro should not hard-code a flat fee");
  assert.ok(switchPage.marketReality && switchPage.marketReality.title.includes("risk-free option"), "switch page should frame the cost of staying put");
  assert.equal(sarasotaPage.proofStats.some((stat) => stat.label === "Management pricing" && stat.value === "Tailored"), true, "Sarasota page should describe pricing as tailored");
  assert.ok(Array.isArray(sarasotaPage.revenueLevers) && sarasotaPage.revenueLevers.length >= 3, "Sarasota page should expose revenue levers");
  assert.equal(sarasotaPage.geoIntro.includes("one flat management fee"), true, "Sarasota GEO intro should explain variable pricing");
});

test("owner fee messaging stays tailored instead of reviving stale flat-fee claims", () => {
  const amiPage = ownerData.find((entry) => entry.slug === "vacation-rental-management-anna-maria-island");
  const bradentonPage = ownerData.find((entry) => entry.slug === "vacation-rental-management-bradenton");
  const siestaPage = ownerData.find((entry) => entry.slug === "vacation-rental-management-siesta-key");
  const selfManagePage = ownerData.find((entry) => entry.slug === "self-manage-vs-property-management-florida");
  const switchFromSelfManagePage = ownerData.find((entry) => entry.slug === "switch-from-airbnb-self-manage");

  for (const [slug, page] of Object.entries({
    "vacation-rental-management-anna-maria-island": amiPage,
    "vacation-rental-management-bradenton": bradentonPage,
    "vacation-rental-management-siesta-key": siestaPage,
    "self-manage-vs-property-management-florida": selfManagePage,
    "switch-from-airbnb-self-manage": switchFromSelfManagePage
  })) {
    assert.ok(page, `${slug} should exist`);
  }

  assert.equal(ownerTemplate.includes(">10-15%</div>"), false, "fallback owner proof block should not hard-code a flat percentage");
  assert.equal(ownerTemplate.includes("Tailored"), true, "fallback owner proof block should explain tailored pricing");

  for (const page of [amiPage, bradentonPage, siestaPage]) {
    assert.equal(page.proofStats.some((stat) => stat.label === "Seascape management fee"), false, `${page.slug} should not use a flat management-fee proof stat`);
    assert.equal(page.proofStats.some((stat) => stat.label === "Management pricing" && stat.value === "Tailored"), true, `${page.slug} should describe pricing as tailored`);
  }

  assert.equal(JSON.stringify(amiPage).includes("10-15% structure"), false, "AMI page should not describe pricing as a 10-15% structure");
  assert.equal(JSON.stringify(amiPage).includes("28-32%"), false, "AMI page should not quote stale 28-32% management fees");
  assert.equal(JSON.stringify(selfManagePage).includes("28-32%"), false, "self-manage comparison page should not quote stale 28-32% management fees");
  assert.equal(JSON.stringify(switchFromSelfManagePage).includes("28-32%"), false, "switch-from-self-manage page should not quote stale 28-32% management fees");
});

test("owner hub restores the fee page and keeps pricing framed as tailored", () => {
  const feePage = ownerData.find((entry) => entry.slug === "vacation-rental-management-fees-florida");

  assert.ok(feePage, "owner fee page should exist");
  assert.equal(
    ownerLanding.includes('/property-management/vacation-rental-management-fees-florida/'),
    true,
    "owner hub should link to the fee page"
  );
  assert.ok(Array.isArray(feePage.proofStats) && feePage.proofStats.length >= 3, "fee page should expose proof stats");
  assert.equal(
    feePage.proofStats.some((stat) => stat.label === "Management pricing" && stat.value === "Tailored"),
    true,
    "fee page should explain pricing as tailored"
  );
  assert.equal(
    feePage.geoIntro.includes("We do not use one flat management fee for every home."),
    true,
    "fee page GEO intro should explain the tailored pricing model"
  );
  assert.equal(
    feePage.faqs.some((faq) => /fee|charge/i.test(faq.q)),
    true,
    "fee page should answer fee-comparison questions directly"
  );
});

test("priority owner proof-cluster pages cite the shared benchmark asset and avoid generic brochure copy", () => {
  const sharedBenchmark = ownerProofAssets["gulf-coast-owner-benchmark-2026"];
  const feePage = ownerData.find((entry) => entry.slug === "vacation-rental-management-fees-florida");
  const licensingPage = ownerData.find((entry) => entry.slug === "vacation-rental-licensing-florida");
  const vrboPage = ownerData.find((entry) => entry.slug === "vrbo-management-services-florida");

  assert.ok(sharedBenchmark, "shared owner benchmark asset should exist");
  assert.match(sharedBenchmark.title, /benchmark/i);
  assert.ok(sharedBenchmark.reviewedBy, "shared benchmark should name a reviewer");
  assert.ok(sharedBenchmark.reviewedDate, "shared benchmark should include a reviewed date");
  assert.ok(sharedBenchmark.sourceLabel, "shared benchmark should include a source label");
  assert.equal(
    sharedBenchmark.sourceUrl,
    "/guides/florida-gulf-coast-vacation-rental-market-report-2026/",
    "shared benchmark should point at the published market report"
  );

  for (const [slug, page] of Object.entries({
    "vacation-rental-management-fees-florida": feePage,
    "vacation-rental-licensing-florida": licensingPage,
    "vrbo-management-services-florida": vrboPage
  })) {
    assert.ok(page, `${slug} should exist`);
    assert.equal(page.proofAssetKey, "gulf-coast-owner-benchmark-2026", `${slug} should cite the shared benchmark`);
    assert.ok(Array.isArray(page.processSteps) && page.processSteps.length >= 3, `${slug} should expose a real process`);
    assert.ok(Array.isArray(page.objections) && page.objections.length >= 3, `${slug} should answer owner objections`);
    assert.equal(page.primaryCta, "Request Your Revenue Teardown", `${slug} should keep the teardown CTA`);
    assert.ok(/teardown|review|fee|channel|owner/i.test(page.ctaSubcopy), `${slug} CTA subcopy should reinforce owner-economics intent`);
  }

  assert.equal(licensingPage.intro.includes("We ensure compliance."), false, "licensing page should not keep the old generic intro");
  assert.equal(vrboPage.intro.includes("We optimize your listing for both."), false, "VRBO page should not keep the old generic intro");
  assert.equal(
    licensingPage.geoIntro.includes("Seascape Vacations handles all licensing and regulatory requirements, ensuring your property operates in full legal compliance from launch."),
    false,
    "licensing page should not keep generic launch-copy filler"
  );
  assert.equal(
    vrboPage.geoIntro.includes("VRBO management requires specialized expertise in platform optimization"),
    false,
    "VRBO page should not keep the old generic platform-ops intro"
  );
});

test("market-report and operator-education pages route owners into the Phase 2 money pages", () => {
  const marketReport = fs.readFileSync(
    path.join(projectRoot, "src", "guides", "florida-gulf-coast-vacation-rental-market-report-2026.html"),
    "utf8"
  );
  const maximizeRevenuePage = ownerData.find((entry) => entry.slug === "maximize-vacation-rental-income-florida");
  const newOwnerGuidePage = ownerData.find((entry) => entry.slug === "new-vacation-rental-owner-guide-florida");
  const bookingsPage = ownerData.find((entry) => entry.slug === "increase-vacation-rental-bookings");

  assert.equal(marketReport.includes("/property-management/vacation-rental-management-fees-florida/"), true);
  assert.equal(marketReport.includes("/property-management/vacation-rental-licensing-florida/"), true);
  assert.equal(marketReport.includes("/property-management/vrbo-management-services-florida/"), true);

  for (const [slug, page] of Object.entries({
    "maximize-vacation-rental-income-florida": maximizeRevenuePage,
    "new-vacation-rental-owner-guide-florida": newOwnerGuidePage,
    "increase-vacation-rental-bookings": bookingsPage
  })) {
    assert.ok(page, `${slug} should exist`);
    assert.deepEqual(
      page.relatedOwnerResources,
      [
        "vacation-rental-management-fees-florida",
        "vacation-rental-licensing-florida",
        "vrbo-management-services-florida"
      ],
      `${slug} should route owners into the fee, licensing, and VRBO money pages`
    );
  }
});

test("owner fee cluster pages stay in review mode instead of reverting to brochure copy", () => {
  const feePage = ownerData.find((entry) => entry.slug === "vacation-rental-management-fees-florida");
  const selfManagePage = ownerData.find((entry) => entry.slug === "self-manage-vs-property-management-florida");
  const amiPage = ownerData.find((entry) => entry.slug === "vacation-rental-management-anna-maria-island");
  const bradentonPage = ownerData.find((entry) => entry.slug === "vacation-rental-management-bradenton");

  for (const [slug, page] of Object.entries({
    "vacation-rental-management-fees-florida": feePage,
    "self-manage-vs-property-management-florida": selfManagePage,
    "vacation-rental-management-anna-maria-island": amiPage,
    "vacation-rental-management-bradenton": bradentonPage
  })) {
    assert.ok(page, `${slug} should exist`);
  }

  assert.equal(selfManagePage.primaryCta, "Request Your Revenue Teardown", "self-manage page should use the teardown CTA");
  assert.ok(Array.isArray(selfManagePage.proofStats) && selfManagePage.proofStats.length >= 4, "self-manage page should expose owner proof stats");
  assert.ok(selfManagePage.marketReality && /fee|self-manag/i.test(JSON.stringify(selfManagePage.marketReality)), "self-manage page should frame the cost of staying self-managed");
  assert.ok(Array.isArray(selfManagePage.revenueLevers) && selfManagePage.revenueLevers.length >= 3, "self-manage page should explain what actually changes owner income");
  assert.equal(selfManagePage.intro.includes("Self-management saves fees but often costs more in lost revenue and time."), false, "self-manage page should not keep the old generic intro");
  assert.equal(JSON.stringify(selfManagePage).includes("Professional property management from Seascape Vacations handles the operational complexity"), false, "self-manage page should not keep generic brochure GEO copy");

  assert.equal(JSON.stringify(amiPage).includes("dynamic pricing algorithms, professional photography, and multi-channel distribution"), false, "AMI page should not use generic operator filler");
  assert.equal(JSON.stringify(amiPage).includes("24/7 guest support"), false, "AMI page should not lead with commodity management bullet points");
  assert.equal(JSON.stringify(bradentonPage).includes("Airbnb, VRBO, and direct booking integration"), false, "Bradenton page should not use generic channel-stack bullets");
  assert.equal(JSON.stringify(bradentonPage).includes("Property managers like Seascape Vacations typically increase occupancy by 15-25%"), false, "Bradenton page should not make canned occupancy claims");
  assert.equal(amiPage.primaryCta, "Request Your Revenue Teardown", "AMI page should keep the teardown CTA");
  assert.equal(bradentonPage.primaryCta, "Request Your Revenue Teardown", "Bradenton page should keep the teardown CTA");
  assert.ok(/ota|fee|rate|owner|revenue|direct/i.test(amiPage.geoIntro), "AMI GEO intro should sound like an owner economics page");
  assert.ok(/ota|fee|rate|owner|revenue|direct/i.test(bradentonPage.geoIntro), "Bradenton GEO intro should sound like an owner economics page");
});

test("remaining local owner pages keep custom owner-math framing instead of falling back to generic section copy", () => {
  const expectations = {
    "vacation-rental-management-anna-maria-island": {
      proofTitle: "Island demand is strong enough to hide weak owner economics",
      switchTitle: "Why AMI owners stop trusting the current setup",
      revenueTitle: "The three levers that decide what an AMI owner actually keeps"
    },
    "vacation-rental-management-bradenton": {
      proofTitle: "Broad demand does not guarantee strong owner income",
      switchTitle: "Why Bradenton owners start looking elsewhere",
      revenueTitle: "What actually moves Bradenton owner net"
    },
    "vacation-rental-management-sarasota": {
      proofTitle: "Premium homes lose money when the operation gets flattened",
      switchTitle: "Why premium Sarasota owners start shopping for a new manager",
      revenueTitle: "What preserves Sarasota rate power"
    }
  };

  for (const [slug, expected] of Object.entries(expectations)) {
    const page = ownerData.find((entry) => entry.slug === slug);

    assert.ok(page, `${slug} should exist`);
    assert.equal(page.proofTitle, expected.proofTitle, `${slug} should keep its custom proof title`);
    assert.equal(page.switchTitle, expected.switchTitle, `${slug} should keep its custom switch title`);
    assert.equal(page.revenueTitle, expected.revenueTitle, `${slug} should keep its custom revenue title`);
    assert.ok(page.benefitsTitle && page.benefitsTitle.length > 20, `${slug} should keep a custom benefits title`);
    assert.ok(page.processTitle && page.processTitle.length > 15, `${slug} should keep a custom process title`);
    assert.ok(page.objectionsTitle && page.objectionsTitle.length > 15, `${slug} should keep a custom objections title`);
    assert.equal(
      page.proofStats.some((stat) => stat.label === "Observed Airbnb host fee" && stat.value === "13.4%"),
      true,
      `${slug} should keep owner fee-drag proof up front`
    );
    assert.equal(
      page.proofStats.some((stat) => stat.label === "Direct payment cost" && stat.value === "2.9%"),
      true,
      `${slug} should keep direct-payment economics up front`
    );
  }
});
