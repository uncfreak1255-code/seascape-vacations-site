const assert = require("node:assert/strict");
const { test, expect } = require("@playwright/test");
const { moneyRoutes } = require("./routes");
const { gotoMarketingRoute } = require("./test-helpers");

test("stay-family-pool — Waterline type and surfaces cannot fall back to the legacy body", async ({ page }) => {
  const route = moneyRoutes.find((item) => item.slug === "stay-family-pool");
  await gotoMarketingRoute(page, route);
  const styles = await page.evaluate(() => ({
    heading: getComputedStyle(document.querySelector("main h1")).fontFamily,
    paper: getComputedStyle(document.body).backgroundColor,
    faqRadius: getComputedStyle(document.querySelector(".faq-item")).borderRadius,
  }));
  // Existing DESIGN.md's Waterline type, paper and open FAQ treatment.
  assert.match(styles.heading, /Instrument Serif/);
  assert.equal(styles.paper, "rgb(246, 243, 235)");
  assert.equal(styles.faqRadius, "0px");
});

test("stay-family-pool — each dates action identifies its own home", async ({ page }) => {
  await gotoMarketingRoute(page, moneyRoutes.find((route) => route.slug === "stay-family-pool"));
  await expect(page.locator('.catalog-card')).toHaveCount(4);
  for (const card of await page.locator(".catalog-card").all()) {
    const name = (await card.locator("h3").innerText()).trim();
    const action = card.locator('.catalog-check-dates');
    await expect(action).toHaveAccessibleName(`Check dates for ${name}`);
  }
});

