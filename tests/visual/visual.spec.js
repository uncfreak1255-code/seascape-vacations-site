const { test, expect } = require("@playwright/test");
const { moneyRoutes } = require("./routes");
const { gotoMarketingRoute, prepareFullPageScreenshot } = require("./test-helpers");

for (const routeConfig of moneyRoutes) {
  test(`${routeConfig.slug} matches the approved marketing baseline`, async ({ page }) => {
    await gotoMarketingRoute(page, routeConfig);
    await prepareFullPageScreenshot(page);

    await expect(page).toHaveScreenshot(`${routeConfig.slug}.png`, {
      fullPage: true,
    });
  });
}
