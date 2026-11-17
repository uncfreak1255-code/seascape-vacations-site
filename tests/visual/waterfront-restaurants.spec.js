const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

// Restaurant photographs must decode, retain their credit, and fit the guide
// column. This also produces review captures without locking incidental pixels.
test("waterfront restaurant photograph loads with its credit on desktop and phone", async ({ page, context }, testInfo) => {
  await context.route(/googletagmanager|google-analytics|connect\.facebook\.net/, route => route.abort());
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const response = await page.goto("/guides/best-waterfront-restaurants-with-boat-dock/");
  expect(response.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Best Waterfront Restaurants with Boat Dock Access");
  const section = page.locator("#pg-3");
  await section.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  await testInfo.attach("longboat-key-section", { body: await section.screenshot({ animations: "disabled" }), contentType: "image/png" });
  const photos = page.locator(".pick-photo img");
  expect(await photos.count()).toBeGreaterThan(0);
  for (const photo of await photos.all()) {
    await photo.scrollIntoViewIfNeeded();
    await expect.poll(() => photo.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(await photo.getAttribute("alt")).toBeTruthy();
    const credit = photo.locator("xpath=..").locator("figcaption");
    await expect(credit).toBeVisible();
    await expect(credit.getByRole("link", { name: /CC BY-SA 3.0/ })).toHaveAttribute("href", "https://creativecommons.org/licenses/by-sa/3.0/");
    expect(await credit.evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(12);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const scan = await new AxeBuilder({ page }).include(".pick-photo").analyze();
  expect(scan.violations.filter(item => ["serious", "critical"].includes(item.impact))).toEqual([]);
  expect(errors).toEqual([]);
  await page.locator(".pick-card:has(.pick-photo)").evaluate(card => card.scrollIntoView({ block: "center", behavior: "instant" }));
  // Isolated component capture: the normal full-section capture above retains the fixed booking bar.
  await testInfo.attach("mar-vista-card", { body: await page.locator(".pick-card:has(.pick-photo)").screenshot({ animations: "disabled", style: "#sticky-book-bar { visibility: hidden !important; }" }), contentType: "image/png" });
});
