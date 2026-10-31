const assert = require("node:assert/strict");
const { test } = require("@playwright/test");
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

