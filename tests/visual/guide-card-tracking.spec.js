const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

// Reproduce the observed tag seam: its callback completes command processing
// before its network batch starts. Navigation destroys the source-page timer.
const tag = `(() => {
  const layer = window.dataLayer;
  function process(entry) {
    if (entry[0] !== 'event') return;
    const payload = entry[2] || {};
    if (typeof payload.event_callback === 'function') payload.event_callback();
    setTimeout(() => navigator.sendBeacon(
      'https://analytics.google.com/g/collect?en=' + encodeURIComponent(entry[1]),
      JSON.stringify(payload)
    ), 50);
  }
  const push = layer.push.bind(layer);
  layer.push = function(...entries) { const result = push(...entries); entries.forEach(process); return result; };
  [...layer].forEach(process);
})();`;

async function interceptGuideTracking(context) {
  const root = path.resolve(__dirname, "../../_site");
  const received = [];
  // Emulate a normal visitor only within a fully intercepted, synthetic origin.
  await context.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  await context.route("**/*", async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.hostname === "analytics.google.com" && url.pathname === "/g/collect") {
      received.push({ event: url.searchParams.get("en"), payload: JSON.parse(request.postData()) });
      return route.fulfill({ status: 204 });
    }
    if (url.hostname === "www.googletagmanager.com" && url.pathname === "/gtag/js") {
      return route.fulfill({ contentType: "text/javascript", body: tag });
    }
    if (url.hostname !== "seascape-vacations.com" || request.method() !== "GET" || url.pathname.startsWith("/.netlify/")) return route.abort();
    const file = path.resolve(root, "." + url.pathname, url.pathname.endsWith("/") ? "index.html" : "");
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return route.abort();
    return route.fulfill({ path: file });
  });
  return received;
}

const guide = "https://seascape-vacations.com/guides/anna-maria-island-vs-siesta-key/";
const guideCard = 'a[data-track-event="guide_property_check_dates_click"][data-placement="guide_stay_here"]';

test("normal same-tab guide card delivers once after navigation with the source guide context", async ({ page, context }) => {
  const received = await interceptGuideTracking(context);
  await page.goto(guide);
  const card = page.locator(guideCard);
  await expect(card).toHaveAttribute("href", "/properties/river-house/#check-availability");
  expect(await card.getAttribute("target")).toBeNull();
  await card.click();
  await expect(page).toHaveURL(/\/properties\/river-house\/.*#check-availability$/);
  await expect.poll(() => received.length).toBe(1);
  expect(received[0].event).toBe("guide_property_check_dates_click");
  expect(received[0].payload).toMatchObject({
    placement: "guide_stay_here", guide_slug: "anna-maria-island-vs-siesta-key", property_slug: "river-house", page_location: guide
  });
  const destination = new URL(received[0].payload.link_url);
  expect(destination.pathname).toBe("/properties/river-house/");
  expect(destination.hash).toBe("#check-availability");
  expect(destination.searchParams.get("sv_guide_click_id")).toMatch(/^svg_/);
  expect(received[0].payload.guide_direct_click_id).toBe(destination.searchParams.get("sv_guide_click_id"));
  await page.reload();
  await expect(page).toHaveURL(/\/properties\/river-house\//);
  expect(received).toHaveLength(1);
});

test("middle-click opens the property in a new tab and tracks the same guide click ID once", async ({ page, context }) => {
  const received = await interceptGuideTracking(context);
  await page.goto(guide);

  const newTab = context.waitForEvent("page");
  await page.locator(guideCard).click({ button: "middle" });
  const property = await newTab;

  await expect(page).toHaveURL(guide);
  await expect(property).toHaveURL(/\/properties\/river-house\/.*#check-availability$/);
  const clickId = new URL(property.url()).searchParams.get("sv_guide_click_id");
  expect(clickId).toMatch(/^svg_/);

  const guideEvents = () => received.filter(({ event }) => event === "guide_property_check_dates_click");
  await expect.poll(guideEvents).toHaveLength(1);
  expect(guideEvents()[0].payload).toMatchObject({
    placement: "guide_stay_here", guide_slug: "anna-maria-island-vs-siesta-key", property_slug: "river-house"
  });
  expect(new URL(guideEvents()[0].payload.link_url).searchParams.get("sv_guide_click_id")).toBe(clickId);
  expect(guideEvents()[0].payload.guide_direct_click_id).toBe(clickId);

  // Direct dispatch belongs to the guide. The new tab must not replay it.
  const guideEventCount = (tab) => tab.evaluate(() => window.dataLayer.filter(
    entry => entry[0] === "event" && entry[1] === "guide_property_check_dates_click"
  ).length);
  expect(await guideEventCount(page)).toBe(1);
  expect(await guideEventCount(property)).toBe(0);
  await property.reload();
  expect(await guideEventCount(property)).toBe(0);
  expect(guideEvents()).toHaveLength(1);
});

const timingGuide = "https://seascape-vacations.com/guides/best-time-visit-anna-maria-island/";
for (const [label, destinationPath] of [
  ["See homes closer to AMI", "/stays/anna-maria-island-vacation-rentals/"],
  ["Compare the space tradeoff", "/stays/anna-maria-island-beachfront-rentals/"],
]) {
  test(`timing guide records one same-tab click for ${label}`, async ({ page, context }) => {
    const received = await interceptGuideTracking(context);
    await page.goto(timingGuide);
    const link = page.getByRole("link", { name: label, exact: true });
    await link.click();
    await expect(page).toHaveURL(url => url.pathname === destinationPath);

    const clicks = () => received.filter(({ event }) => event === "guide_book_direct_click");
    await expect.poll(clicks).toHaveLength(1);
    const { payload } = clicks()[0];
    expect(payload).toMatchObject({
      placement: "best_time_season_choice",
      guide_slug: "best-time-visit-anna-maria-island",
      page_location: timingGuide,
      page_path: "/guides/best-time-visit-anna-maria-island/",
    });
    const destination = new URL(payload.link_url);
    expect(destination.pathname).toBe(destinationPath);
    expect(destination.searchParams.get("sv_guide_click_id")).toMatch(/^svg_/);
    expect(new URL(page.url()).searchParams.get("sv_guide_click_id")).toBe(destination.searchParams.get("sv_guide_click_id"));

    await page.reload();
    expect(await page.evaluate(() => window.dataLayer.some(
      entry => entry[0] === "event" && entry[1] === "guide_book_direct_click"
    ))).toBe(false);
    expect(clicks()).toHaveLength(1);
  });
}

const areaGuide = 'https://seascape-vacations.com/guides/anna-maria-island-area-guide/';
test('AMI area native card delivers one event and preserves guide lineage', async ({ page, context }) => {
  const received = await interceptGuideTracking(context);
  await page.goto(areaGuide + '?utm_source=google&utm_medium=organic');
  const card = page.locator('a.property-card[data-property-slug="dockside-dreams"]');
  await expect(card).toHaveAttribute('href', '/properties/dockside-dreams/#check-availability');
  await card.click();
  await expect(page).toHaveURL(/\/properties\/dockside-dreams\/.*#check-availability$/);
  const events = () => received.filter(e => e.event === 'guide_property_check_dates_click');
  await expect.poll(events).toHaveLength(1);
  expect(events()[0].payload).toMatchObject({ guide_slug: 'anna-maria-island-area-guide', property_slug: 'dockside-dreams', placement: 'area_guide_property_card' });
  const destination = new URL(page.url());
  expect(destination.searchParams.get('sv_guide_click_id')).toMatch(/^svg_/);
  expect(destination.searchParams.get('utm_source')).toBe('google');
  expect(new URL(events()[0].payload.link_url).searchParams.get('sv_guide_click_id')).toBe(destination.searchParams.get('sv_guide_click_id'));
  await page.reload();
  expect(events()).toHaveLength(1);
});

test("AMI area sticky booking link reaches the curated collection and tracks once", async ({ page, context }) => {
  const received = await interceptGuideTracking(context);
  const collection = "/stays/vacation-rentals-near-anna-maria-island/";
  await page.goto(areaGuide);

  const isMobile = page.viewportSize().width <= 768;
  if (isMobile) {
    await page.getByRole("heading", { name: "Featured Vacation Rentals" }).scrollIntoViewIfNeeded();
  }
  const link = isMobile
    ? page.locator('.mobile-cta-bar a[data-placement="mobile_cta_bar"]')
    : page.locator("#sticky-book-bar a");
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", collection);
  await link.click();
  await expect(page).toHaveURL(url => url.pathname === collection);
  await expect(page.getByRole("heading", { level: 1, name: "Vacation Rentals Near Anna Maria Island" })).toBeVisible();

  const guideClicks = () => received.filter(({ event }) => event === "guide_book_direct_click");
  await expect.poll(guideClicks).toHaveLength(1);
  const { payload } = guideClicks()[0];
  expect(payload).toMatchObject({
    guide_slug: "anna-maria-island-area-guide",
    placement: isMobile ? "mobile_cta_bar" : "sticky_book_bar",
  });

  const landing = new URL(page.url());
  const clickId = landing.searchParams.get("sv_guide_click_id");
  expect(clickId).toMatch(/^svg_/);
  const trackedLink = new URL(payload.link_url);
  expect(trackedLink.pathname).toBe(collection);
  expect(trackedLink.searchParams.get("sv_guide_click_id")).toBe(clickId);

  await page.reload();
  expect(await page.evaluate(() => window.dataLayer.some(
    entry => entry[0] === "event" && entry[1] === "guide_book_direct_click"
  ))).toBe(false);
  expect(guideClicks()).toHaveLength(1);
});

test.describe('AMI area native navigation', () => {
  test.use({ javaScriptEnabled: false });
  test('AMI area property cards navigate to dates without JavaScript', async ({ page, context }) => {
  await interceptGuideTracking(context);
  await page.goto(areaGuide);
  for (const slug of ['dockside-dreams', 'the-oasis', 'river-house']) {
    const card = page.locator(`a.property-card[href="/properties/${slug}/#check-availability"]`);
    await expect(card).toHaveCount(1);
    await card.click();
    await expect(page).toHaveURL(`https://seascape-vacations.com/properties/${slug}/#check-availability`);
    await page.goto(areaGuide);
  }
  });
});


test("Best-time AMI Oasis card and Hostaway handoff dispatch the same guide click ID", async ({ page, context }) => {
  const received = await interceptGuideTracking(context);
  await page.goto(timingGuide);
  await page.locator(guideCard + '[data-property-slug="the-oasis"]').click();
  await expect(page).toHaveURL(/\/properties\/the-oasis\//);
  const clickId = new URL(page.url()).searchParams.get("sv_guide_click_id");
  expect(clickId).toMatch(/^svg_/);
  const cardEvents = () => received.filter(({ event }) => event === "guide_property_check_dates_click");
  await expect.poll(cardEvents).toHaveLength(1);
  expect(cardEvents()[0].payload).toMatchObject({
    guide_direct_click_id: clickId,
    guide_slug: "best-time-visit-anna-maria-island",
    property_slug: "the-oasis",
    placement: "guide_stay_here",
    page_location: timingGuide
  });
  // Hold navigation only while observing the real booking-click handler and tag.
  await page.evaluate(() => document.querySelectorAll('[data-track-event="property_booking_page_click"]').forEach(link => {
    link.addEventListener("click", event => event.preventDefault());
  }));
  await page.locator('[data-track-event="property_booking_page_click"]').first().click();
  const handoffs = () => received.filter(({ event }) => event === "property_booking_page_click");
  await expect.poll(handoffs).toHaveLength(1);
  expect(handoffs()[0].payload.guide_direct_click_id).toBe(clickId);
  const destination = new URL(handoffs()[0].payload.link_url);
  expect(destination.hostname).toBe("book.seascape-vacations.com");
  expect(destination.pathname).toBe("/listings/189511");
  expect(destination.searchParams.get("sv_guide_click_id")).toBe(clickId);
});
