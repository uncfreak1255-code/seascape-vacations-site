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
