const assert = require("node:assert/strict");
const { test } = require("@playwright/test");
const { moneyRoutes } = require("./routes");
const { gotoMarketingRoute } = require("./test-helpers");

// F3 on desktop: design-floors.spec.js checks overflow only at the project
// viewport (1440), which hid a homepage postcard-fan overflow that appeared
// only between 1051 and 1352 (measured 2026-11-11). Sweep the whole desktop
// layout range instead of trusting one width.
const floorRoutes = moneyRoutes.concat(require("./extra-property-routes"));

function measureOverflow() {
  // clientWidth, not innerWidth: see measureOverflow in design-floors.spec.js.
  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: document.documentElement.clientWidth,
  };
}

for (const routeConfig of floorRoutes) {
  test(`${routeConfig.slug} — F3 no horizontal overflow from 1024 to 1440`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "desktop widths only; phones are covered in design-floors.spec.js");
    await gotoMarketingRoute(page, routeConfig);
    const original = page.viewportSize();
    const failures = [];
    // 1050 and 1051 straddle the fan breakpoint in src/css/arrival.css; the
    // 16px steps cover the rest of the desktop range.
    const widths = [1050, 1051];
    for (let width = 1024; width <= 1440; width += 16) widths.push(width);
    for (const width of widths) {
      await page.setViewportSize({ width, height: original.height });
      const measurement = await page.evaluate(measureOverflow);
      if (measurement.scrollWidth > measurement.innerWidth) {
        failures.push(`  @${width}: scrollWidth ${measurement.scrollWidth} > innerWidth ${measurement.innerWidth}`);
      }
    }
    await page.setViewportSize(original);
    assert.deepEqual(failures, [], `F3 desktop overflow on ${routeConfig.slug}:\n${failures.join("\n")}`);
  });
}
