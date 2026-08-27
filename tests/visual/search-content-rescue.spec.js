const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { gotoMarketingRoute, prepareFullPageScreenshot } = require("./test-helpers");

const routes = [
  {
    slug: "anna-maria-island-weather",
    path: "/guides/anna-maria-island-weather/",
    canonical: "https://seascape-vacations.com/guides/anna-maria-island-weather/",
    title: "Anna Maria Island Weather by Month: Rain and Water Temps",
    heading: "Anna Maria Island Weather by Month",
    ctaSelector: '[data-track-event="guide_book_direct_click"][href="/stays/anna-maria-island-vacation-rentals/"]',
  },
  {
    slug: "florida-gulf-coast-vacation-rental-market-report-2026",
    path: "/guides/florida-gulf-coast-vacation-rental-market-report-2026/",
    canonical: "https://seascape-vacations.com/guides/florida-gulf-coast-vacation-rental-market-report-2026/",
    title: "Bradenton-Sarasota Vacation Rental Benchmark 2026",
    heading: "Bradenton-Sarasota Vacation Rental Benchmark 2026",
    ctaSelector: '[data-track-event="owner_primary_cta_click"][href="/property-management/#owner-cta"]',
  },
  {
    slug: "best-time-visit-anna-maria-island",
    path: "/guides/best-time-visit-anna-maria-island/",
    canonical: "https://seascape-vacations.com/guides/best-time-visit-anna-maria-island/",
    title: "Best Time to Visit Anna Maria Island: May and November",
    description: "Compare all 12 months for typical weather, Gulf water, crowds, and storm season. See why May and November often balance comfort and trip timing.",
    heading: "Best Time to Visit Anna Maria Island: A Month-by-Month Guide",
    ctaSelector: '[data-track-event="guide_book_direct_click"][href="/stays/anna-maria-island-vacation-rentals/"]',
  },
  {
    slug: "srq-airport-to-anna-maria-island",
    path: "/guides/srq-airport-to-anna-maria-island/",
    canonical: "https://seascape-vacations.com/guides/srq-airport-to-anna-maria-island/",
    title: "SRQ Airport to Anna Maria Island: Drive Time, Cost & Options",
    description: "Compare rental car, rideshare, taxi, shuttle, and bus options from SRQ to Anna Maria Island, with drive times and the best bridge route for each town.",
    heading: "SRQ Airport to Anna Maria Island: Drive Time, Cost & Options",
    ctaSelector: '[data-track-event="guide_book_direct_click"][href="/stays/anna-maria-island-vacation-rentals/"]',
  },
];

for (const routeConfig of routes) {
  test(`${routeConfig.slug} renders the approved rescue contract`, async ({ page }, testInfo) => {
    await gotoMarketingRoute(page, routeConfig);

    await expect(page).toHaveTitle(routeConfig.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", routeConfig.canonical);
    await expect(page.locator("main h1").first()).toHaveText(routeConfig.heading);
    await expect(page.locator(routeConfig.ctaSelector).first()).toBeVisible();

    if (routeConfig.description) {
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", routeConfig.description);
    }

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    );
    expect(hasHorizontalOverflow).toBe(false);

    await prepareFullPageScreenshot(page);
    const outputDir = path.join(
      process.cwd(),
      "artifacts",
      "visual-proof",
      "search-content-rescue",
      testInfo.project.name
    );
    fs.mkdirSync(outputDir, { recursive: true });
    await page.screenshot({
      fullPage: true,
      path: path.join(outputDir, `${routeConfig.slug}.png`),
    });
  });
}
