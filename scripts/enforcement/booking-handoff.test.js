const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("module");

const projectRoot = path.resolve(__dirname, "..", "..");

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === "@netlify/blobs") {
    return {
      connectLambda() {},
      getStore() {
        return {
          async get() {
            return null;
          },
          async set() {}
        };
      }
    };
  }

  return originalLoad(request, parent, isMain);
};

const {
  BOOKING_HANDOFF_METRICS_KEY,
  buildBookingHandoffReceipt,
  mergeBookingHandoffMetrics
} = require("../../netlify/functions/_booking-handoff-metrics");
const {
  handleBookingHandoff
} = require("../../netlify/functions/booking-handoff");

test("conversion tracking supports post-guide booking handoff events", () => {
  const trackingScript = fs.readFileSync(
    path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js"),
    "utf8"
  );

  for (const eventName of [
    "catalog_book_direct_click",
    "catalog_collection_click",
    "catalog_view_details_click",
    "stay_view_property_click",
    "property_check_availability_click",
    "property_booking_page_click"
  ]) {
    assert.equal(
      trackingScript.includes(eventName),
      true,
      `tracking script missing ${eventName}`
    );
  }
});

test("conversion tracking carries AI and search source context on funnel events", () => {
  const trackingScript = fs.readFileSync(
    path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js"),
    "utf8"
  );

  for (const marker of [
    "AI_SOURCE_HOSTS",
    "ORGANIC_SEARCH_HOSTS",
    "source_context",
    "ai_platform",
    "referrer_host",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "ref",
    "landing_page_path",
    "getSourceContext"
  ]) {
    assert.equal(trackingScript.includes(marker), true, `tracking script missing ${marker}`);
  }
});

test("conversion tracking preserves booking-engine handoff context instead of dropping AI params on outbound clicks", () => {
  const trackingScript = fs.readFileSync(
    path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js"),
    "utf8"
  );

  for (const marker of [
    "BOOKING_ENGINE_HOST",
    "BOOKING_ENGINE_HANDOFF_KEYS",
    "BOOKING_HANDOFF_ENDPOINT",
    "BOOKING_HANDOFF_SESSION_KEY",
    "sv_handoff_id",
    "sv_session_id",
    "buildBookingEngineHandoffUrl",
    "syncBookingEngineLink",
    "decorateBookingEngineLinks",
    "sendBookingHandoffReceipt"
  ]) {
    assert.equal(trackingScript.includes(marker), true, `tracking script missing ${marker}`);
  }
});

test("booking handoff receipts store only the identity bridge context needed for reservation matching", () => {
  const receipt = buildBookingHandoffReceipt({
    handoffId: "svh_test_123",
    sessionId: "svs_test_456",
    guideDirectClickId: "svg_test_789",
    linkUrl: "https://book.seascape-vacations.com/listings/206016?utm_source=google&utm_medium=organic&utm_campaign=guide_winners&utm_content=best-time&sv_handoff_id=svh_test_123&sv_session_id=svs_test_456&sv_guide_click_id=svg_test_789&email=guest@example.com&payment_intent=pi_123&payment_intent_client_secret=pi_secret_123&setup_intent=seti_123&setup_intent_client_secret=seti_secret_123&client_secret=secret_123&redirect_status=succeeded",
    linkText: "Check availability",
    pagePath: "https://seascape-vacations.com/guides/best-time-visit-anna-maria-island/",
    pageSlug: "best-time-visit-anna-maria-island",
    guideSlug: "best-time-visit-anna-maria-island",
    placement: "guide_booking_panel",
    sourceContext: "organic_search",
    referrerHost: "google.com",
    createdAt: "2026-06-29T12:00:00.000Z"
  });

  assert.equal(BOOKING_HANDOFF_METRICS_KEY, "booking_handoff_metrics_v1.json");
  assert.equal(receipt.handoffId, "svh_test_123");
  assert.equal(receipt.sessionId, "svs_test_456");
  assert.equal(receipt.guideDirectClickId, "svg_test_789");
  assert.equal(receipt.listingId, "206016");
  assert.equal(receipt.pagePath, "/guides/best-time-visit-anna-maria-island/");
  assert.equal(receipt.pageSlug, "best-time-visit-anna-maria-island");
  assert.match(receipt.linkUrl, /sv_handoff_id=svh_test_123/);
  assert.match(receipt.linkUrl, /sv_session_id=svs_test_456/);
  assert.match(receipt.linkUrl, /sv_guide_click_id=svg_test_789/);
  assert.doesNotMatch(receipt.linkUrl, /guest@example\.com|email=|payment_intent|payment_intent_client_secret|setup_intent|setup_intent_client_secret|client_secret|redirect_status/i);
});

test("booking handoff metrics dedupe repeated handoff ids and keep small aggregates", () => {
  const receipt = buildBookingHandoffReceipt({
    handoffId: "svh_dedupe_1",
    sessionId: "svs_dedupe_1",
    linkUrl: "https://book.seascape-vacations.com/listings/189511?sv_handoff_id=svh_dedupe_1&sv_session_id=svs_dedupe_1",
    pagePath: "/properties/the-oasis/",
    placement: "property_cta",
    createdAt: "2026-06-29T12:00:00.000Z"
  });

  const firstMetrics = mergeBookingHandoffMetrics(null, receipt);
  const dedupedMetrics = mergeBookingHandoffMetrics(firstMetrics, receipt);

  assert.equal(dedupedMetrics.totalHandoffs, 1);
  assert.equal(dedupedMetrics.byPagePath["/properties/the-oasis/"], 1);
  assert.equal(dedupedMetrics.byListingId["189511"], 1);
  assert.equal(dedupedMetrics.byPlacement.property_cta, 1);
});

test("booking handoff function writes a receipt through the injected store", async () => {
  let storedMetrics = null;
  const injectedStore = {
    async get() {
      return storedMetrics;
    },
    async set(_key, value) {
      storedMetrics = JSON.parse(value);
    }
  };

  const response = await handleBookingHandoff(
    {
      httpMethod: "POST",
      body: JSON.stringify({
        handoffId: "svh_function_1",
        sessionId: "svs_function_1",
        linkUrl: "https://book.seascape-vacations.com/listings/206016?sv_handoff_id=svh_function_1&sv_session_id=svs_function_1",
        pagePath: "/guides/best-time-visit-anna-maria-island/",
        placement: "guide_booking_panel",
        createdAt: "2026-06-29T12:00:00.000Z"
      })
    },
    {},
    injectedStore
  );
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 200);
  assert.equal(body.stored, true);
  assert.equal(body.handoffId, "svh_function_1");
  assert.equal(body.listingId, "206016");
  assert.equal(storedMetrics.totalHandoffs, 1);
  assert.equal(storedMetrics.receipts[0].handoffId, "svh_function_1");
});

test("properties catalog behaves like a buyer handoff surface, not a generic directory", () => {
  const propertiesTemplate = fs.readFileSync(
    path.join(projectRoot, "src", "properties", "index.njk"),
    "utf8"
  );

  assert.equal(propertiesTemplate.includes('data-track-event="catalog_book_direct_click"'), true);
  assert.equal(propertiesTemplate.includes('data-track-event="catalog_view_details_click"'), true);
  assert.equal(propertiesTemplate.includes("Explore Owner Services"), false);
});

test("properties catalog honors homepage area handoff params instead of always resetting to all stays", () => {
  const propertiesTemplate = fs.readFileSync(
    path.join(projectRoot, "src", "properties", "index.njk"),
    "utf8"
  );

  assert.equal(propertiesTemplate.includes("new URLSearchParams(window.location.search)"), true);
  assert.equal(propertiesTemplate.includes('"anna-maria-island": "bradenton"'), true);
  assert.equal(propertiesTemplate.includes("history.replaceState"), true);
});

test("stay pages push into tracked property actions instead of generic browse escapes", () => {
  const staysTemplate = fs.readFileSync(path.join(projectRoot, "src", "stays", "stays.njk"), "utf8");

  assert.equal(staysTemplate.includes('data-track-event="stay_view_property_click"'), true);
  assert.equal(staysTemplate.includes("seoPage.decisionHighlights"), true);
  assert.equal(staysTemplate.includes("seoPage.relatedStaySlugs"), true);
  assert.equal(staysTemplate.includes('href="#featured-homes"'), true);
  assert.equal(staysTemplate.includes("View All Properties"), false);
  assert.equal(staysTemplate.includes("Browse All Properties"), false);
  assert.equal(staysTemplate.includes("Ready to Book Your Getaway?"), false);
});

test("properties catalog routes into direct-booking stay collections instead of only raw property cards", () => {
  const propertiesTemplate = fs.readFileSync(
    path.join(projectRoot, "src", "properties", "index.njk"),
    "utf8"
  );

  assert.equal(propertiesTemplate.includes("Looking for something specific?"), true);
  assert.equal(propertiesTemplate.includes('data-track-event="catalog_collection_click"'), true);

  for (const href of [
    '/stays/book-direct-anna-maria-island/',
    '/stays/anna-maria-island-vacation-rentals/',
    '/stays/bradenton-vacation-rentals-near-beaches/',
    '/stays/sarasota-vacation-rentals-with-pool/',
    '/stays/last-minute-vacation-rentals-florida/'
  ]) {
    assert.equal(
      propertiesTemplate.includes(`href="${href}"`),
      true,
      `properties catalog missing ${href}`
    );
  }
});

test("priority stay pages carry page-specific trip math and fallback routing metadata", () => {
  const stayPages = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "src", "_data", "seoPages.json"), "utf8")
  ).vacationer;

  for (const slug of [
    "book-direct-anna-maria-island",
    "anna-maria-island-vacation-rentals",
    "bradenton-vacation-rentals-near-beaches",
    "sarasota-vacation-rentals-with-pool",
    "last-minute-vacation-rentals-florida"
  ]) {
    const page = stayPages.find((entry) => entry.slug === slug);

    assert.ok(page, `missing stay page ${slug}`);
    assert.equal(Array.isArray(page.decisionHighlights), true, `${slug} missing decisionHighlights`);
    assert.equal(page.decisionHighlights.length, 3, `${slug} should carry 3 decisionHighlights`);
    assert.equal(typeof page.collectionCtaHref, "string", `${slug} missing collectionCtaHref`);
    assert.equal(typeof page.collectionCtaLabel, "string", `${slug} missing collectionCtaLabel`);
    assert.equal(typeof page.collectionCtaTitle, "string", `${slug} missing collectionCtaTitle`);
    assert.equal(Array.isArray(page.relatedStaySlugs), true, `${slug} missing relatedStaySlugs`);
    assert.equal(page.relatedStaySlugs.length >= 3, true, `${slug} needs at least 3 relatedStaySlugs`);
  }
});

test("top property pages instrument both availability and booking-page handoff CTAs", () => {
  const propertyPages = [
    path.join(projectRoot, "src", "properties", "dockside-dreams", "index.njk"),
    path.join(projectRoot, "src", "properties", "the-oasis", "index.njk"),
    path.join(projectRoot, "src", "properties", "sarasota-luxe", "index.njk"),
    path.join(projectRoot, "src", "properties", "river-house", "index.njk"),
    path.join(projectRoot, "src", "properties", "bradenton-pool-home", "index.njk")
  ];

  for (const file of propertyPages) {
    const source = fs.readFileSync(file, "utf8");
    assert.equal(
      source.includes('data-track-event="property_check_availability_click"'),
      true,
      `${path.basename(path.dirname(file))} missing tracked availability CTA`
    );
    assert.equal(
      source.includes('data-track-event="property_booking_page_click"'),
      true,
      `${path.basename(path.dirname(file))} missing tracked booking-page CTA`
    );
    assert.equal(
      source.includes('src="/assets/js/conversion-tracking.js"'),
      true,
      `${path.basename(path.dirname(file))} missing shared conversion tracking runtime`
    );
    for (const placement of [
      'data-placement="property_nav"',
      'data-placement="property_mobile_menu"',
      'data-placement="property_intro"',
      'data-placement="property_intro_booking_panel"',
      'data-placement="property_reviews"'
    ]) {
      assert.equal(
        source.includes(placement),
        true,
        `${path.basename(path.dirname(file))} missing ${placement}`
      );
    }
  }
});

test("Bradenton Pool Home keeps responsive hero candidates in sync after thumbnail changes", () => {
  const source = fs.readFileSync(
    path.join(projectRoot, "src", "properties", "bradenton-pool-home", "index.njk"),
    "utf8"
  );

  assert.match(source, /id="heroMain"[^>]+srcset="[^"]+ 768w, [^"]+ 1200w"/);
  assert.match(
    source,
    /function switchHero\(i\)\{[^}]+hero\.srcset=url\.replace\("width=1200","width=768"\)\+" 768w, "\+url\+" 1200w";hero\.src=url;/
  );
});

test("top property pages use semantic hero headings and stay pages explain fit in guest language", () => {
  const propertyPages = [
    path.join(projectRoot, "src", "properties", "dockside-dreams", "index.njk"),
    path.join(projectRoot, "src", "properties", "the-oasis", "index.njk"),
    path.join(projectRoot, "src", "properties", "sarasota-luxe", "index.njk"),
    path.join(projectRoot, "src", "properties", "river-house", "index.njk"),
    path.join(projectRoot, "src", "properties", "bradenton-pool-home", "index.njk")
  ];

  for (const file of propertyPages) {
    const source = fs.readFileSync(file, "utf8");

    assert.equal(
      /<div class="hero-cinema-content">\s*<h1>/m.test(source),
      true,
      `${path.basename(path.dirname(file))} should expose an h1 inside the hero`
    );
    assert.equal(
      /<div class="hero-cinema-content">\s*<h2>/m.test(source),
      false,
      `${path.basename(path.dirname(file))} should not hide the main title inside an h2`
    );
  }

  const staysTemplate = fs.readFileSync(path.join(projectRoot, "src", "stays", "stays.njk"), "utf8");

  assert.equal(staysTemplate.includes("Why these homes fit this trip"), true);
  assert.equal(
    staysTemplate.includes(
      "Use these highlights to decide whether this trip, location, and home style line up before you start comparing listings."
    ),
    true
  );
  assert.equal(staysTemplate.includes("Why this booking path works"), false);
  assert.equal(
    staysTemplate.includes("This page should help you narrow the trip fast, not send you back into generic inventory scrolling."),
    false
  );
  assert.equal(
    staysTemplate.includes("This page is meant to narrow the right options fast, not send you back into generic browsing."),
    false
  );
});
