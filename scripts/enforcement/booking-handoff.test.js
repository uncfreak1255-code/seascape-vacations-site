const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const projectRoot = path.resolve(__dirname, "..", "..");

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
    "BOOKING_HANDOFF_SESSION_KEY",
    "sv_handoff_id",
    "sv_session_id",
    "buildBookingEngineHandoffUrl",
    "syncBookingEngineLink",
    "decorateBookingEngineLinks"
  ]) {
    assert.equal(trackingScript.includes(marker), true, `tracking script missing ${marker}`);
  }
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

test("all five rendered homes carry the matching tracked booking decision", () => {
  for (const property of require("../../src/_data/properties-fallback.json")) {
    const source = fs.readFileSync(path.join(projectRoot, "src/properties", property.slug, "index.njk"), "utf8");
    assert.ok(source.includes("layout: layouts/property.njk"));
    assert.ok(source.includes("propertySlug: " + property.slug));
    const html = fs.readFileSync(path.join(projectRoot, "_site/properties", property.slug, "index.html"), "utf8");
    for (const event of ["property_check_availability_click", "property_booking_page_click"]) assert.ok(html.includes('data-track-event="' + event + '"'));
    assert.ok(html.includes('src="/assets/js/conversion-tracking.js"'));
    assert.ok(html.includes('data-booking-url="' + property.guestFacts.sourceUrl + '"'));
    assert.ok(html.includes('data-property-page="' + property.slug + '"'));
    for (const placement of ["property_heading", "property_booking_panel", "property_mobile_booking"]) assert.ok(html.includes('data-placement="' + placement + '"'));
  }
});

test("each gallery has only its own canonical local photos with valid dimensions", () => {
  for (const property of require("../../src/_data/properties-fallback.json")) {
    const html = fs.readFileSync(path.join(projectRoot, "_site/properties", property.slug, "index.html"), "utf8");
    const images = [...html.matchAll(/<img[^>]+data-property-photo="([^"]+)"[^>]+(?:src|data-gallery-src)="([^"]+)"/g)];
    assert.ok(images.length >= 10);
    for (const [,slug,src] of images) {
      assert.equal(slug, property.slug);
      const photo=property.photography.photos.find(p=>p.src===src);
      assert.ok(photo);assert.ok(photo.width>0 && photo.height>0);
      assert.ok(fs.existsSync(path.join(projectRoot,src.slice(1))));
    }
    assert.doesNotMatch(html,/seascape-og-default/);
  }
});

test("property headings are semantic and stay pages explain fit in guest language", () => {
  for (const property of require("../../src/_data/properties-fallback.json")) {
    const html = fs.readFileSync(path.join(projectRoot, "_site/properties", property.slug, "index.html"), "utf8");
    assert.ok(html.includes('<h1>'+property.name+'</h1>'));
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
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
