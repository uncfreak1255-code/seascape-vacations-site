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

test("city comparison reaches each real home's dates and retains the trip through checkout", async ({ page }) => {
  const homes = [
    { slug: "bradenton-pool-home", name: "Bradenton Pool Home", listing: "487798" },
    { slug: "sarasota-luxe", name: "Sarasota Luxe", listing: "135881" }
  ];
  for (const home of homes) {
    await gotoMarketingRoute(page, { slug: "city-comparison", path: "/guides/bradenton-vs-sarasota/?sv_developer=1&arrive=2027-02-10&depart=2027-02-17&guests=6&utm_source=qa&utm_medium=email&utm_campaign=save50_welcome" });
    await expect(page.locator("[data-city-home-bridge] .city-home-action")).toHaveCount(2, { timeout: 1500 });
    await page.waitForFunction(() => Boolean(window.SeascapeConversionTracking));
    const action = page.locator(`[data-city-home-bridge] a[data-property-slug="${home.slug}"]`);
    await expect(action).toContainText(home.name);
    await action.click();
    await expect(page).toHaveURL(new RegExp(`/properties/${home.slug}/\\?.*#booking$`));
    await expect(page.locator("main h1")).toContainText(home.name);
    await expect(page.locator("#booking")).toBeVisible();
    const propertyUrl = new URL(page.url());
    const guideClick = propertyUrl.searchParams.get("sv_guide_click_id");
    expect(guideClick).toMatch(/^svg_/);
    await expect(page.locator('a[data-track-event="property_booking_page_click"]').first()).toHaveAttribute("href", /numberOfGuests=6/);
    const checkout = new URL(await page.locator('a[data-track-event="property_booking_page_click"]').first().getAttribute("href"));
    expect(checkout.hostname).toBe("book.seascape-vacations.com");
    expect(checkout.pathname).toBe(`/checkout/${home.listing}`);
    expect(checkout.searchParams.get("start")).toBe("2027-02-10");
    expect(checkout.searchParams.get("end")).toBe("2027-02-17");
    expect(checkout.searchParams.get("numberOfGuests")).toBe("6");
    expect(checkout.searchParams.get("utm_campaign")).toBe("save50_welcome");
    expect(checkout.searchParams.get("sv_guide_click_id")).toBe(guideClick);
    expect(checkout.searchParams.get("sv_handoff_id")).toBeTruthy();
  }
});
