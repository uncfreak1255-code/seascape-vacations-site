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

test("normal same-tab guide card delivers once after navigation with the source guide context", async ({ page, context }) => {
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
  const guide = "https://seascape-vacations.com/guides/anna-maria-island-vs-siesta-key/";
  await page.goto(guide);
  const card = page.locator('a[data-track-event="guide_property_check_dates_click"][data-placement="guide_stay_here"]');
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
