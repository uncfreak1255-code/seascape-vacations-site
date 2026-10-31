const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const { gotoMarketingRoute } = require("./test-helpers");

test.use({ serviceWorkers: "block" });

test.beforeEach(async ({ context }) => {
  await context.route("**/.netlify/functions/**", async route => {
    if (route.request().method() === "GET") return route.continue();
    return route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
});

test("wildlife advice leads to the exact mainland home with guide lineage", async ({ page }) => {
  await gotoMarketingRoute(page, { slug: "dolphins", path: "/guides/dolphins-manatees-bradenton/?sv_developer=1" });
  const stay = page.locator("[data-wildlife-stay]");
  await expect(stay).toContainText("mainland Bradenton");
  await expect(stay).toContainText("never guaranteed");
  expect(await stay.evaluate(n => !!(n.compareDocumentPosition(document.querySelector(".cw-article")) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await expect(stay.locator('[data-track-event="guide_stay_click"]')).toHaveAttribute("href", "/stays/bradenton-waterfront-vacation-rentals/");
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.filter(v => ["serious", "critical"].includes(v.impact))).toEqual([]);
  await stay.getByRole("link", { name: "Check Dockside dates" }).click();
  await expect(page).toHaveURL(/\/properties\/dockside-dreams\/\?.*sv_guide_click_id=svg_/);
  await expect(page.locator("main h1")).toContainText("Dockside Dreams");
  const booking = page.locator('a[data-property-booking-link]').first();
  await expect(booking).toHaveAttribute("href", /206016/);
});

test("owner local alternative has matching readable schema and a real review action", async ({ page }) => {
  await gotoMarketingRoute(page, { slug: "property-management", path: "/property-management/?sv_developer=1" });
  const faq = page.locator("#local-management-alternative");
  await faq.locator("summary").click();
  await expect(faq).toHaveAttribute("open", "");
  await expect(faq.locator("p").first()).toBeVisible();
  const parity = await page.evaluate(() => {
    const schema = [...document.querySelectorAll('script[type="application/ld+json"]')].map(n => JSON.parse(n.textContent)).find(n => n["@type"] === "FAQPage");
    return schema.mainEntity.every((q, i) => {
      const n = document.querySelectorAll(".g-owner-faq details")[i];
      const title = n.querySelector("summary").cloneNode(true);
      title.querySelectorAll("[aria-hidden]").forEach(x => x.remove());
      return q.name === title.textContent.trim() && q.acceptedAnswer.text === n.querySelector("p").textContent.trim();
    });
  });
  expect(parity).toBe(true);
  await faq.getByRole("link", { name: "Request your 48-hour revenue review" }).click();
  await expect(page).toHaveURL(/#owner-cta$/);
  await expect(page.locator('#owner-cta form[name="owner-revenue-teardown"]')).toBeVisible();
});


test("family collection names the verified mainland home and opens its booking page", async ({ page }) => {
  await gotoMarketingRoute(page, { slug: "family-pool", path: "/stays/family-vacation-rentals-anna-maria-island/?sv_developer=1" });
  const main = page.locator("main");
  await expect(main).toContainText("mainland Bradenton");
  await expect(main).not.toContainText("all our pools have proper safety fencing");
  await expect(main).not.toContainText("at no additional charge");
  await expect(main).not.toContainText("10-15 minutes to beaches");
  const card = page.locator(".property-card").filter({ has: page.getByRole("heading", { name: "Bradenton Pool Home", exact: true }) });
  await expect(card).toHaveCount(1);
  await expect(card).toContainText("3 BR");
  await expect(card).toContainText("Sleeps 10");
  await expect(card.locator("img")).toHaveAttribute("src", /bradenton-pool-home/);
  await card.getByRole("link", { name: "Check direct dates" }).click();
  await expect(page).toHaveURL(/\/properties\/bradenton-pool-home\//);
  await expect(page.locator("main h1")).toContainText("Bradenton Pool Home");
  await expect(page.locator('a[data-property-booking-link]').first()).toHaveAttribute("href", /487798/);
});
