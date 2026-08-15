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
const conversionTracking = fs.readFileSync(
  path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js"),
  "utf8"
);
const ownerData = require(path.join(projectRoot, "src", "_data", "seoPages.json")).owner;
const ownerProofAssets = require(path.join(projectRoot, "src", "_data", "ownerProofAssets.json"));
const ownerOperatorProofAssets = require(path.join(projectRoot, "src", "_data", "ownerOperatorProofAssets.json"));
const ownerFormPath = path.join(projectRoot, "src", "_includes", "partials", "owner-evaluation-form.njk");
const ownerReviewRequestedPath = path.join(projectRoot, "src", "property-management", "revenue-review-requested.njk");
const ownerRouteCanaryPath = path.join(projectRoot, "scripts", "recovery", "assert-owner-funnel-routes.js");
const {
  assertFreshOwnerOperatorProof
} = require("./owner-proof-freshness");
const {
  assertOwnerRouteResponse
} = require("../recovery/assert-owner-funnel-routes");

test("owner landing page uses a real owner revenue review form instead of generic evaluation copy", () => {
  assert.equal(fs.existsSync(ownerFormPath), true, "owner form partial should exist");

  const ownerFormPartial = fs.readFileSync(ownerFormPath, "utf8");
  assert.equal(ownerLanding.includes("Request Your Revenue Review"), true);
  assert.equal(ownerLanding.includes("ownerEvaluationForm({"), true);
  assert.equal(ownerLanding.includes('data-track-event="owner_primary_cta_click"'), true);
  assert.equal(ownerFormPartial.includes("owner-revenue-teardown"), true);
  assert.equal(ownerFormPartial.includes('data-netlify="true"'), true);
  assert.equal(ownerFormPartial.includes('data-netlify-recaptcha="true"'), true);
  assert.equal(ownerFormPartial.includes('name="proof_label"'), true);
  assert.equal(ownerLanding.includes('name="proof_label"'), true);
});

test("owner landing page keeps the owner revenue review close to the sales argument instead of burying it under the library", () => {
  const reviewIndex = ownerLanding.indexOf('id="owner-cta"');
  const faqIndex = ownerLanding.indexOf("Selected FAQ");
  const libraryIndex = ownerLanding.indexOf("Owner Guides");
  const specialSituationsIndex = ownerLanding.indexOf("Specific Situations");

  assert.notEqual(reviewIndex, -1, "owner hub needs the revenue review anchor");
  assert.equal(ownerLanding.includes("Fee Guide + Revenue Review"), true);
  assert.equal(ownerLanding.includes("<strong>Fee Guide + Revenue Review</strong> Airbnb's host service fee"), true);
  assert.equal(
    ownerLanding.includes("We will compare the charges on your statement with the services in your agreement and send back a one-page revenue review"),
    true
  );
  assert.equal(
    ownerLanding.includes("Airbnb's host service fee, Stripe's card price, and a management agreement pay for different things."),
    true
  );
  assert.equal(
    ownerLanding.includes("A lower card-processing rate does not by itself mean a higher owner payout."),
    true
  );
  assert.equal(ownerLanding.includes("proven cost, likely cost, and missing information"), false);
  assert.equal(ownerLanding.includes("Published platform pricing"), true);
  assert.equal(ownerLanding.includes("Property-specific management quote"), true);
  assert.equal(ownerLanding.includes('href="/research/owner-fee-revenue-leak-benchmark-2026/"'), true);
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
  assert.equal(siteHeader.includes("Request Your Revenue Review"), false, "shared header should stay page-driven, not hard-code owner CTA copy");
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

test("owner revenue review form lowers friction without losing tracking or intent", () => {
  const ownerFormPartial = fs.readFileSync(ownerFormPath, "utf8");

  assert.equal(ownerFormPartial.includes('name="phone"'), true);
  assert.equal(ownerFormPartial.includes('name="phone" autocomplete="tel" placeholder="(941) 555-1234" required'), false);
  assert.equal(ownerFormPartial.includes('placeholder="Best email for your review"'), true);
  assert.equal(ownerFormPartial.includes('placeholder="Best number for text updates"'), true);
  assert.equal(ownerFormPartial.includes('options.propertyFieldLabel or "Listing URL or property address"'), true);
  assert.equal(ownerFormPartial.includes("options.propertyFieldPlaceholder or 'airbnb.com/h/your-listing, vrbo.com/..., or 123 Palm Ave'"), true);
  assert.equal(ownerFormPartial.includes('data-owner-context-required="true"'), true);
  assert.equal(ownerFormPartial.includes('name="property_address" autocomplete="street-address"'), true);
  assert.equal(ownerFormPartial.includes('name="property_address" autocomplete="street-address" placeholder="{{ options.propertyFieldPlaceholder or'), true);
  assert.equal(ownerFormPartial.includes('name="property_address" autocomplete="street-address" placeholder="{{ options.propertyFieldPlaceholder or \'airbnb.com/h/your-listing, vrbo.com/..., or 123 Palm Ave\' }}" data-owner-context-field'), true);
  assert.equal(ownerFormPartial.includes('name="property_address" autocomplete="street-address" placeholder="{{ options.propertyFieldPlaceholder or \'airbnb.com/h/your-listing, vrbo.com/..., or 123 Palm Ave\' }}" required'), false);
  assert.equal(ownerFormPartial.includes('enctype="multipart/form-data"'), true);
  assert.equal(ownerFormPartial.includes('name="listing_url"'), true);
  assert.equal(ownerFormPartial.includes('name="listing_url" inputmode="url" placeholder="Paste the Airbnb or Vrbo listing URL" data-owner-context-field'), true);
  assert.equal(ownerFormPartial.includes('name="current_manager"'), true);
  assert.equal(ownerFormPartial.includes('name="current_fee_quote"'), true);
  assert.equal(ownerFormPartial.includes('name="what_feels_off"'), true);
  assert.equal(ownerFormPartial.includes('name="what_feels_off" rows="3"'), true);
  assert.equal(ownerFormPartial.includes('data-owner-context-field></textarea>'), true);
  assert.equal(ownerFormPartial.includes('name="owner_statement"'), true);
  assert.equal(ownerLanding.includes('name="what_feels_off" rows="4"'), true);
  assert.equal(ownerLanding.includes("Add one line in your own words"), true);
  assert.equal(ownerLanding.includes("Sarasota condo is staying booked, but the payout still feels light and the owner statements are hard to trust."), true);
  assert.equal(
    ownerFormPartial.includes("The fastest first pass comes from two things: the listing URL or address, and one line on what feels off. An owner statement or fee quote makes the review sharper."),
    true
  );
  assert.equal(
    ownerFormPartial.includes("Source note: Send what you have. We will tell you if a statement, booking calendar, guest review, or fee quote would make the review more useful."),
    true
  );
  assert.equal(ownerFormPartial.includes("The private revenue review shows what we can verify, what looks expensive, and what still needs a document"), true);
  assert.equal(
    ownerFormPartial.includes("If you do not know the street address yet, paste the Airbnb or Vrbo link and tell us what feels off."),
    true
  );
  assert.equal(ownerFormPartial.includes("What feels off right now?"), true);
  assert.equal(
    ownerFormPartial.includes("owner payout feels light, booking-site fees look high, reporting is hard to trust, or the current manager setup feels off"),
    true
  );
  assert.equal(ownerFormPartial.includes("Send My Review Request"), true);
  assert.equal(ownerFormPartial.includes('data-track-form="owner"'), true);
  assert.equal(ownerFormPartial.includes('data-form-submit-event="owner_form_submit"'), true);
  assert.equal(ownerFormPartial.includes('data-source-page-slug="{{ options.sourcePageSlug or options.pageSlug or \'property-management\' }}"'), true);
  assert.equal(ownerFormPartial.includes('name="source_page_slug" value="{{ options.sourcePageSlug or options.pageSlug or \'property-management\' }}"'), true);
  assert.equal(ownerLanding.includes("showBenchmarkFields: true"), true);
  assert.equal(ownerTemplate.includes("showBenchmarkFields: true"), true);
  assert.equal(ownerLanding.includes('propertyFieldLabel: "Listing URL or property address"'), true);
  assert.equal(ownerTemplate.includes('propertyFieldLabel: "Listing URL or property address"'), true);
  assert.equal(ownerLanding.includes("Send My Review Request"), true);
  assert.equal(ownerLanding.includes("Request My Review"), false);
  assert.equal(ownerLanding.includes("Sentence or two is enough"), true);
  assert.equal(ownerLanding.includes("If anything is missing, we will tell you what we still need instead of filling in the blanks."), true);
  assert.equal(ownerLanding.includes("We will read the listing or address, look at what feels off, and send back what we would check next."), true);
  assert.equal(ownerLanding.includes("No sales call"), false);
  assert.equal(conversionTracking.includes("function validateOwnerFormContext(form)"), true);
  assert.equal(conversionTracking.includes('form.dataset.ownerContextRequired !== "true"'), true);
  assert.equal(conversionTracking.includes('form.querySelectorAll("[data-owner-context-field]")'), true);
  assert.equal(conversionTracking.includes("Send the listing or address, or tell us what feels off."), true);
  assert.equal(conversionTracking.includes("if (!validateOwnerFormContext(form))"), true);
});

test("Pat-like Sarasota leads are prompted for the property context and the reason for inquiry before manual follow-up", () => {
  const sarasotaPage = ownerData.find((entry) => entry.slug === "vacation-rental-management-sarasota");

  assert.ok(sarasotaPage, "Sarasota owner page should exist");
  assert.equal(ownerTemplate.includes("Send the listing link or property address, plus a sentence or two about what feels off."), true);
  assert.equal(ownerLanding.includes("Send the listing URL or property address. If the address is easier, use that. If the Airbnb or Vrbo link is easier, paste it here."), true);
  assert.equal(ownerLanding.includes("Revenue feels low for the market"), true);
  assert.equal(ownerLanding.includes("Booking-site fees feel heavy"), true);
  assert.equal(ownerLanding.includes("Current manager concerns"), true);
  assert.equal(ownerLanding.includes("Add one line in your own words"), true);
  assert.equal(ownerLanding.includes("If you would rather say it plainly"), true);
  assert.equal(ownerLanding.includes("function validateOwnerContext()"), true);
  assert.equal(ownerLanding.includes("var hasListing = listingField && listingField.value.trim();"), true);
  assert.equal(ownerLanding.includes("var hasConcern = concerns.length > 0 || (concernsInput && concernsInput.value.trim()) || (concernsMirror && concernsMirror.value.trim());"), true);
  assert.equal(ownerLanding.includes("if (hasListing || hasConcern) return true;"), true);
  assert.equal(ownerLanding.includes("Send the listing or address, or choose what feels off."), true);
  assert.equal(sarasotaPage.ctaSubcopy.includes("listing link or address plus what feels off"), true);
  assert.equal(sarasotaPage.ctaNote.includes("one thing that feels off"), true);
});

test("owner field report email payload avoids duplicate listing fields and submit tracking stays single-source", () => {
  assert.equal(ownerLanding.includes('data-skip-global-submit-track="true"'), true);
  assert.equal(ownerLanding.includes('name="listing_url" data-owner-listing-mirror'), false);
  assert.equal(ownerLanding.includes('name="what_feels_off" data-owner-concerns-mirror'), false);
  assert.equal(ownerLanding.includes('textarea class="owner-field-textarea" name="what_feels_off"'), true);
  assert.equal(ownerLanding.includes("function getSubmitPayload(extra) {"), true);
  assert.equal(ownerLanding.includes("conversionTracking.getSourceContext"), true);
  assert.equal(ownerLanding.includes('placement: form.dataset.formPlacement || ""'), true);
  assert.equal(ownerLanding.includes('track("owner_form_submit", getSubmitPayload({'), true);
  assert.equal(ownerLanding.includes('concern_note_present: concernsMirror && concernsMirror.value.trim() ? "true" : "false"'), true);
  assert.equal(conversionTracking.includes('if (form.dataset.skipGlobalSubmitTrack !== "true") {'), true);
});

test("owner review submit path lands on a qualified-owner confirmation route", () => {
  const ownerFormPartial = fs.readFileSync(ownerFormPath, "utf8");
  const ownerReviewRequested = fs.readFileSync(ownerReviewRequestedPath, "utf8");

  assert.equal(ownerLanding.includes('action="/property-management/revenue-review-requested/"'), true);
  assert.equal(ownerFormPartial.includes('action="{{ options.action or \'/property-management/revenue-review-requested/\' }}"'), true);
  assert.equal(ownerReviewRequested.includes('permalink: "/property-management/revenue-review-requested/"'), true);
  assert.equal(ownerReviewRequested.includes("Your 48-hour review request is in."), true);
  assert.equal(
    ownerReviewRequested.includes("A real Seascape person will follow up within 48 hours. If the listing or address and what feels off are there, we can take a more useful first look right away."),
    true
  );
  assert.equal(ownerReviewRequested.includes("listing link or property address"), true);
  assert.equal(ownerReviewRequested.includes("one sentence on what feels off"), true);
  assert.equal(ownerReviewRequested.includes("If you skipped either one, reply to the confirmation email"), true);
  assert.equal(ownerReviewRequested.includes("talk about a transition"), false);
  assert.equal(ownerReviewRequested.includes("No sales call gets booked from this form."), false);
  assert.equal(ownerReviewRequested.includes("listing link or address and a sentence or two about what feels off"), true);
  assert.equal(ownerReviewRequested.includes("does not prove booked review demand"), false);
  assert.equal(ownerReviewRequested.includes("guaranteed revenue lift"), false);
});

test("owner funnel uses one explicit source precedence contract across both owner form UIs", () => {
  const ownerFormPartial = fs.readFileSync(ownerFormPath, "utf8");

  assert.equal(conversionTracking.includes("function resolveOwnerSourcePage(node)"), true);
  assert.ok(
    /getOwnerSourceFromLocation\(\)[\s\S]*getHiddenInputValue\(node, "source_page_slug"\)[\s\S]*node\.dataset\.sourcePageSlug[\s\S]*node\.dataset\.pageSlug/.test(conversionTracking),
    "source precedence should be owner_source query, hidden source_page_slug, dataset source slug, dataset page slug"
  );
  assert.equal(ownerLanding.includes('data-track-form="owner"'), true);
  assert.equal(ownerLanding.includes('data-form-start-event="owner_form_start"'), true);
  assert.equal(ownerLanding.includes('data-form-submit-event="owner_form_submit"'), true);
  assert.equal(ownerLanding.includes('name="source_page_slug" value="property-management"'), true);
  assert.equal(ownerFormPartial.includes('data-track-form="owner"'), true);
  assert.equal(ownerFormPartial.includes('data-form-start-event="owner_form_start"'), true);
  assert.equal(ownerFormPartial.includes('data-form-submit-event="owner_form_submit"'), true);
  assert.equal(ownerFormPartial.includes('name="source_page_slug" value="{{ options.sourcePageSlug or options.pageSlug or \'property-management\' }}"'), true);
});

test("owner funnel route canary protects canonical and alternate public hosts from lander shells", () => {
  assert.equal(fs.existsSync(ownerRouteCanaryPath), true, "owner funnel route canary should exist");
  const canary = fs.readFileSync(ownerRouteCanaryPath, "utf8");

  for (const route of [
    "/property-management/",
    "/property-management/revenue-review-requested/",
    "/research/owner-fee-revenue-leak-benchmark-2026/",
    "/research/how-seascape-protects-owner-net-2026/"
  ]) {
    assert.equal(canary.includes(route), true, `${route} should be in the owner funnel canary`);
  }

  assert.equal(canary.includes("https://seascape-vacations.com"), true);
  assert.equal(canary.includes("https://www.seascape-vacations.com"), true);
  assert.equal(canary.includes("/lander"), true, "canary should fail loudly on the known lander shell symptom");
});

test("owner funnel route canary rejects the complete retired proof set", () => {
  for (const marker of [
    "$1.4M",
    "$119,923",
    "13.4%",
    "32.8%",
    "5.7%",
    "16.4%",
    "$730",
    "$450",
    "10.5 pts",
    "Patrick portfolio",
    "marked unknown",
    "intake route",
    "seascape-hub"
  ]) {
    assert.throws(
      () =>
        assertOwnerRouteResponse({
          url: "https://seascape-vacations.com/property-management/",
          statusCode: 200,
          body: `<main>Property management owner fee guide ${marker}</main>`
        }),
      /retired proof or internal workflow language/,
      `live owner canary should reject ${marker}`
    );
  }
});

test("owner benchmark CTA carries source attribution into the revenue review form path", () => {
  const ownerBenchmark = fs.readFileSync(
    path.join(projectRoot, "src", "research", "owner-fee-revenue-leak-benchmark-2026.njk"),
    "utf8"
  );
  const sharedBenchmark = ownerProofAssets["gulf-coast-owner-benchmark-2026"];

  assert.equal(sharedBenchmark.ctaPath, "/property-management/?owner_source=owner-fee-revenue-leak-benchmark-2026#owner-cta");
  assert.equal(ownerBenchmark.includes("{% set ctaPath = benchmark.ctaPath %}"), true);
  assert.equal(ownerBenchmark.includes("{% set proofLabels = benchmark.proofLabels %}"), true);
  assert.equal((ownerBenchmark.match(/href="\{\{ ctaPath \}\}"/g) || []).length >= 2, true);
  assert.equal(ownerBenchmark.includes('data-track-event="owner_primary_cta_click"'), true);
  assert.equal(ownerBenchmark.includes('data-page-slug="owner-fee-revenue-leak-benchmark-2026"'), true);
  assert.equal(ownerBenchmark.includes("ownerEvaluationForm({"), false);
  assert.equal(ownerBenchmark.includes('formPlacement: "benchmark-teardown"'), false);
  assert.equal(ownerBenchmark.includes('sourcePageSlug: "owner-fee-revenue-leak-benchmark-2026"'), false);
  assert.equal(ownerBenchmark.includes('showBenchmarkFields: true'), false);
});

test("owner fee guide stays in the fee-comparison lane with visible sources and boundaries", () => {
  const ownerBenchmark = fs.readFileSync(
    path.join(projectRoot, "src", "research", "owner-fee-revenue-leak-benchmark-2026.njk"),
    "utf8"
  );
  const sharedBenchmark = ownerProofAssets["gulf-coast-owner-benchmark-2026"];

  assert.equal(ownerBenchmark.includes("What Do Vacation Rental Fees Actually Cost?"), true);
  assert.equal(sharedBenchmark.scopeLabel, "Published fee comparison");
  assert.equal(ownerBenchmark.includes("{{ benchmark.scopeLabel }}"), true);
  assert.equal(ownerBenchmark.includes("Published platform pricing"), true);
  assert.equal(ownerBenchmark.includes("Property-specific management pricing"), true);
  assert.equal(sharedBenchmark.sources.some((source) => source.label === "Airbnb service fees for home hosts"), true);
  assert.equal(sharedBenchmark.sources.some((source) => source.label === "Stripe pricing"), true);
  assert.equal(ownerBenchmark.includes("Want the same comparison for your home?"), true);
  assert.deepEqual(sharedBenchmark.examples, []);
  assert.deepEqual(sharedBenchmark.stats, []);
  assert.equal(ownerBenchmark.includes("Patrick"), false);
  assert.equal(ownerBenchmark.includes("intake route"), false);
  assert.match(sharedBenchmark.sourceNote, /not all-in equivalents/);
  assert.equal(ownerBenchmark.includes("This checklist does not estimate revenue or promise a payout."), true);
  assert.equal(ownerBenchmark.includes("passive income"), false);
  assert.equal(ownerBenchmark.includes("sit back while we manage"), false);
  assert.equal(ownerBenchmark.includes("full service"), false);
});

test("retired owner-report page removes expired modules, private names, and internal evidence paths", () => {
  const proofPack = fs.readFileSync(
    path.join(projectRoot, "src", "research", "how-seascape-protects-owner-net-2026.njk"),
    "utf8"
  );

  assert.equal(ownerOperatorProofAssets.proofPackUrl, "/research/how-seascape-protects-owner-net-2026/");
  assert.equal(ownerOperatorProofAssets.reuseStatus, "retired-stale");
  assert.equal(ownerOperatorProofAssets.freshnessPolicy, "retired-no-public-reuse");
  assert.deepEqual(ownerOperatorProofAssets.modules, []);
  assert.equal(proofPack.includes("The April 2026 owner-report examples have been removed."), true);
  assert.equal(proofPack.includes('meta name="robots" content="noindex, follow"'), true);
  assert.equal(proofPack.includes("/research/owner-fee-revenue-leak-benchmark-2026/"), true);
  assert.equal(proofPack.includes("Patrick"), false);
  assert.equal(proofPack.includes("seascape-hub"), false);
  assert.equal(proofPack.includes("evidencePath"), false);
  assert.equal(proofPack.includes("sourcePath"), false);
  assert.equal(proofPack.includes("/property-management/?owner_source=how-seascape-protects-owner-net-2026#owner-cta"), false);
  assert.equal(proofPack.includes('sourcePageSlug: "how-seascape-protects-owner-net-2026"'), false);
  assert.equal(proofPack.includes('formPlacement: "operator-proof-pack-teardown"'), false);
  assert.equal(proofPack.includes("we always outperform"), false);
  assert.equal(proofPack.includes("passive income"), false);
  assert.equal(proofPack.includes("full service"), false);
});

test("owner operator proof pack retirement preserves the stale date instead of extending freshness", () => {
  assert.equal(ownerOperatorProofAssets.staleAfter, "2026-05-26");
  assert.equal(ownerOperatorProofAssets.retiredAfter, "2026-05-26");
  assert.equal(ownerOperatorProofAssets.freshnessPolicy, "retired-no-public-reuse");
  assert.match(ownerOperatorProofAssets.retirementReason, /no longer current enough to publish/i);
  assert.equal(conversionTracking.includes("owner_source"), true);
  assert.deepEqual(ownerOperatorProofAssets.modules, []);
  assert.doesNotThrow(() => assertFreshOwnerOperatorProof(ownerOperatorProofAssets, new Date("2026-05-27T00:00:00Z")));
});

test("owner hub removes the retired operator proof pack while the benchmark stands on its own review path", () => {
  const ownerBenchmark = fs.readFileSync(
    path.join(projectRoot, "src", "research", "owner-fee-revenue-leak-benchmark-2026.njk"),
    "utf8"
  );

  assert.equal(ownerLanding.includes("/research/how-seascape-protects-owner-net-2026/"), false);
  assert.equal(ownerLanding.includes("How Seascape Protects Owner Revenue"), false);
  assert.equal(ownerLanding.includes("/property-management/vacation-rental-management-fees-florida/"), true);
  assert.equal(ownerBenchmark.includes("/research/how-seascape-protects-owner-net-2026/"), false);
  assert.equal(ownerBenchmark.includes("A manager should be able to show exactly how a rate move is tested."), false);
  assert.equal(
    ownerProofAssets["gulf-coast-owner-benchmark-2026"].ctaPath,
    "/property-management/?owner_source=owner-fee-revenue-leak-benchmark-2026#owner-cta"
  );
  assert.equal(ownerBenchmark.includes('href="{{ ctaPath }}"'), true);
  assert.equal(ownerLanding.includes("Request Your Revenue Review"), true);
  assert.equal(ownerBenchmark.includes("Request Your Revenue Review"), true);
});

test("owner pages keep phone as a lower-trust fallback instead of a competing hero CTA", () => {
  const landingHeroMatch = ownerLanding.match(/<section class="[^"]*\bowner-hero\b[^"]*">/);
  const landingHeroStart = landingHeroMatch ? landingHeroMatch.index : -1;
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
    ownerLanding.includes("Seascape management pricing is set by the services and fee basis in the signed agreement."),
    true,
    "owner landing should explain the property-specific pricing model"
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
    feePage.benefits.includes("Clear breakdown of management fee, marketplace booking costs, and direct-booking savings"),
    false,
    "fee page should not promise owner savings from direct booking"
  );
  assert.equal(
    feePage.benefits.includes("Clear breakdown of management fees, booking-platform costs, card processing, and included services"),
    true,
    "fee page should separate unlike charges and services"
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
  assert.match(sharedBenchmark.title, /fee comparison guide/i);
  assert.ok(sharedBenchmark.reviewedBy, "shared benchmark should name a reviewer");
  assert.ok(sharedBenchmark.reviewedDate, "shared benchmark should include a reviewed date");
  assert.ok(Array.isArray(sharedBenchmark.sources), "shared fee guide should include source links");
  assert.deepEqual(
    sharedBenchmark.sources.map((source) => source.url),
    ["https://www.airbnb.com/help/article/1857", "https://stripe.com/pricing"]
  );

  for (const [slug, page] of Object.entries({
    "vacation-rental-management-fees-florida": feePage,
    "vacation-rental-licensing-florida": licensingPage,
    "vrbo-management-services-florida": vrboPage
  })) {
    assert.ok(page, `${slug} should exist`);
    assert.equal(page.proofAssetKey, "gulf-coast-owner-benchmark-2026", `${slug} should cite the shared benchmark`);
    assert.ok(page.reviewDeliverable, `${slug} should define a 48-hour review deliverable`);
    assert.equal(page.reviewDeliverable.tag, "48-Hour Review", `${slug} should label the deliverable section clearly`);
    assert.ok(Array.isArray(page.reviewDeliverable.items) && page.reviewDeliverable.items.length >= 3, `${slug} should show at least three review deliverable items`);
    assert.ok(page.visibilityLayer, `${slug} should define an owner visibility layer`);
    assert.equal(page.visibilityLayer.tag, "Owner Visibility", `${slug} should label the visibility section clearly`);
    assert.ok(Array.isArray(page.visibilityLayer.items) && page.visibilityLayer.items.length >= 4, `${slug} should show the owner visibility items`);
    assert.ok(Array.isArray(page.processSteps) && page.processSteps.length >= 3, `${slug} should expose a real process`);
    assert.ok(Array.isArray(page.objections) && page.objections.length >= 3, `${slug} should answer owner objections`);
    assert.equal(page.primaryCta, "Request Your Revenue Review", `${slug} should keep the review CTA`);
    assert.ok(/teardown|review|fee|channel|owner/i.test(page.ctaSubcopy), `${slug} CTA subcopy should reinforce owner-economics intent`);

    const visibilityText = page.visibilityLayer.items.map((item) => `${item.title} ${item.body}`).join(" ");
    assert.match(visibilityText, /report/i, `${slug} visibility layer should mention reporting`);
    assert.match(visibilityText, /maintenance|readiness|turnover/i, `${slug} visibility layer should mention local follow-through`);
    assert.match(visibilityText, /screen/i, `${slug} visibility layer should mention screening or guest-rule setup`);
    assert.match(visibilityText, /local|response/i, `${slug} visibility layer should mention local response ownership`);
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

  assert.equal(selfManagePage.primaryCta, "Request Your Revenue Review", "self-manage page should use the review CTA");
  assert.ok(Array.isArray(selfManagePage.proofStats) && selfManagePage.proofStats.length >= 4, "self-manage page should expose owner proof stats");
  assert.ok(selfManagePage.marketReality && /fee|self-manag/i.test(JSON.stringify(selfManagePage.marketReality)), "self-manage page should frame the cost of staying self-managed");
  assert.ok(Array.isArray(selfManagePage.revenueLevers) && selfManagePage.revenueLevers.length >= 3, "self-manage page should explain what actually changes owner income");
  assert.equal(selfManagePage.intro.includes("Self-management saves fees but often costs more in lost revenue and time."), false, "self-manage page should not keep the old generic intro");
  assert.equal(JSON.stringify(selfManagePage).includes("Professional property management from Seascape Vacations handles the operational complexity"), false, "self-manage page should not keep generic brochure GEO copy");

  assert.equal(JSON.stringify(amiPage).includes("dynamic pricing algorithms, professional photography, and multi-channel distribution"), false, "AMI page should not use generic operator filler");
  assert.equal(JSON.stringify(amiPage).includes("24/7 guest support"), false, "AMI page should not lead with commodity management bullet points");
  assert.equal(JSON.stringify(bradentonPage).includes("Airbnb, VRBO, and direct booking integration"), false, "Bradenton page should not use generic channel-stack bullets");
  assert.equal(JSON.stringify(bradentonPage).includes("Property managers like Seascape Vacations typically increase occupancy by 15-25%"), false, "Bradenton page should not make canned occupancy claims");
  assert.equal(amiPage.primaryCta, "Request Your Revenue Review", "AMI page should keep the review CTA");
  assert.equal(bradentonPage.primaryCta, "Request Your Revenue Review", "Bradenton page should keep the review CTA");
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
      revenueTitle: "What actually moves Bradenton owner income"
    },
    "vacation-rental-management-sarasota": {
      proofTitle: "Premium homes lose money when the operation gets flattened",
      switchTitle: "Why premium Sarasota owners start shopping for a new manager",
      revenueTitle: "What protects premium Sarasota rates"
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
      page.proofStats.some((stat) => stat.label === "Published Airbnb host fee" && stat.value === "15.5%"),
      true,
      `${slug} should use Airbnb's published host-fee figure`
    );
    assert.equal(
      page.proofStats.some((stat) => stat.label === "Published Stripe card price" && stat.value === "2.9% + 30¢"),
      true,
      `${slug} should label Stripe card processing as a published transaction price`
    );
    assert.equal(
      page.proofStats.some((stat) => stat.label === "Management pricing" && stat.value === "Tailored"),
      true,
      `${slug} should keep management pricing property-specific`
    );
  }
});
