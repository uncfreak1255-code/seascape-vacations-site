const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const { registerStableNetwork } = require("./test-helpers");

const itinerary = "arrive=2026-11-07&depart=2026-11-14&guests=8";
async function visit(page, query = itinerary) {
  await registerStableNetwork(page);
  await page.clock.setFixedTime(new Date("2026-09-04T16:00:00Z"));
  await page.goto("/properties/?visual-test=1&" + query, { waitUntil:"networkidle" });
}
function trip(href) {
  const params = new URL(href, "http://localhost").searchParams;
  return {start:params.get("start"), end:params.get("end"), guests:params.get("numberOfGuests")};
}

test("a guide detour preserves trip details through a stay collection", async ({ page }) => {
  await registerStableNetwork(page);
  await page.clock.setFixedTime(new Date("2026-09-04T16:00:00Z"));
  await page.goto("/?" + itinerary, {waitUntil:"networkidle"});
  const guide = page.locator('main a[href*="/guides/bradenton-vs-sarasota/"]').first();
  await guide.click();
  await expect(page).toHaveURL(/arrive=2026-11-07/);
  await page.locator('a[href*="/stays/bradenton-vacation-rentals-near-beaches/"]').first().click();
  await expect(page).toHaveURL(/guests=8/);
  await page.locator('a[href*="/properties/dockside-dreams/"]').first().click();
  await expect(page.locator(".g-arrive")).toHaveValue("2026-11-07");
  await expect(page.locator(".g-depart")).toHaveValue("2026-11-14");
  await expect(page.locator(".g-guests")).toHaveValue("8");
  expect(trip(await page.locator('[data-property-checkout]').getAttribute('href')))
    .toEqual({start:"2026-11-07",end:"2026-11-14",guests:"8"});
});

test("area and group matching preserve the selected trip into details and checkout", async ({ page, context }) => {
  await context.route("https://book.seascape-vacations.com/**", route => route.fulfill({status:200,contentType:"text/html",body:"<h1>Checkout navigation intercepted by test</h1>"}));
  await visit(page, itinerary + "&area=anna-maria-island");
  await expect(page.locator(".catalog-card:visible")).toHaveCount(4);
  await expect(page.locator('[data-filter="bradenton"]')).toHaveAttribute("aria-pressed","true");
  await expect(page.locator("#trip-status")).toContainText("Nov 7, 2026");
  const cta = page.locator('[data-property="dockside-dreams"] .catalog-check-dates');
  expect(trip(await cta.getAttribute("href"))).toEqual({ start:"2026-11-07",end:"2026-11-14",guests:"8" });
  const popupPromise = page.waitForEvent("popup");
  await cta.click();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");
  expect(trip(popup.url())).toEqual({start:"2026-11-07",end:"2026-11-14",guests:"8"});
  await popup.close();
  await page.getByRole("link", { name:"View Dockside Dreams details",exact:true }).click();
  await expect(page).toHaveURL(/arrive=2026-11-07/);
  await expect(page.locator(".property-trip-context")).toContainText("8 guests");
  const links = await page.locator('a[href*="book.seascape-vacations.com/listings/206016"]').evaluateAll(nodes => nodes.map(node=>node.href));
  expect(links.length).toBeGreaterThan(0);
  for (const href of links) expect(trip(href)).toEqual({start:"2026-11-07",end:"2026-11-14",guests:"8"});
  await page.getByRole("link", {name:"Change trip / compare homes"}).click();
  await expect(page.locator("#trip-arrive")).toHaveValue("2026-11-07");
});

test("editing fields requires applying the trip; global booking links update too", async ({ page }) => {
  await visit(page);
  await page.getByLabel("Arrival", {exact:true}).fill("2026-12-05");
  await page.getByLabel("Departure", {exact:true}).fill("2026-12-12");
  await page.getByLabel("Guests", {exact:true}).selectOption("14");
  await page.getByRole("button", {name:"Waterfront",exact:true}).click();
  expect(trip(await page.locator(".catalog-check-dates").first().getAttribute("href")).start).toBe("2026-11-07");
  await page.getByRole("button", {name:"Find my home",exact:true}).click();
  await expect(page.locator("#catalog-empty")).toBeVisible();
  await page.getByRole("button", {name:"Show all areas"}).click();
  await expect(page.locator(".catalog-card:visible")).toHaveCount(1);
  await expect(page.locator(".catalog-card:visible")).toHaveAttribute("data-property","the-oasis");
  const hrefs = await page.locator('a[data-booking-base]').evaluateAll(nodes=>nodes.map(node=>node.href));
  for (const href of hrefs) expect(trip(href)).toEqual({start:"2026-12-05",end:"2026-12-12",guests:"14"});
  await page.getByRole("button", {name:"My dates are flexible"}).click();
  expect(trip(await page.locator(".catalog-check-dates").first().getAttribute("href"))).toEqual({start:null,end:null,guests:"14"});
});

test("bad incoming dates recover visibly; oversized groups are never silently made smaller", async ({ page }) => {
  for (const query of [
    "arrive=2026-11-07", "arrive=2026-11-14&depart=2026-11-07",
    "arrive=2026-02-30&depart=2026-03-02", "arrive=2025-11-07&depart=2025-11-14"
  ]) {
    await visit(page, query);
    await expect(page.locator("#trip-status")).toContainText("Choose new dates");
    await expect(page.locator("#trip-arrive")).toHaveValue("");
    expect(trip(await page.locator(".catalog-check-dates").first().getAttribute("href")).start).toBeNull();
  }
  await visit(page, itinerary.replace("guests=8", "guests=24"));
  await expect(page.locator("#trip-guests")).toHaveValue("17");
  await expect(page.locator(".catalog-card:visible")).toHaveCount(0);
  await expect(page.locator("#catalog-empty")).toContainText("largest home sleeps 16");
});

test("comparison is capped, keyboard dismissible and shareable without campaign or session IDs", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read","clipboard-write"]);
  await visit(page, itinerary + "&utm_source=private&sv_session_id=secret&email=guest@example.com");
  for (const name of ["Dockside Dreams","The Oasis","Sarasota Luxe"]) await page.getByRole("button", {name:"Compare "+name,exact:true}).click();
  await page.getByRole("button", {name:"Compare River House",exact:true}).click();
  await expect(page.locator("#trip-status")).toContainText("three homes");
  await expect(page.locator("#shortlist-count")).toHaveText("3 homes selected");
  await page.locator("#open-comparison").click();
  await expect(page.locator("dialog")).toBeVisible();
  await expect(page.locator('thead [data-compare-column]:visible')).toHaveCount(3);
  await page.locator("#share-comparison").click();
  const shared = await page.evaluate(()=>navigator.clipboard.readText());
  const sharedUrl = new URL(shared);
  expect([...sharedUrl.searchParams.keys()].sort()).toEqual(["arrive","compare","depart","guests"]);
  expect(sharedUrl.hash).toBe("#compare");
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await expect(page.locator("#open-comparison")).toBeFocused();
  await page.goto(shared, {waitUntil:"networkidle"});
  await expect(page.locator("dialog")).toBeVisible();
  await expect(page.locator("#comparison-trip")).toContainText("8 guests");
  await expect(page.locator('thead [data-compare-column]:visible')).toHaveCount(3);
});

test("clipboard denial gives a usable manual copy link", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator,"clipboard",{value:{writeText:async()=>{throw new Error("denied");}}}));
  await visit(page,itinerary+"&compare=dockside-dreams,the-oasis#compare");
  await page.locator("#share-comparison").click();
  await expect(page.locator("#share-fallback")).toBeVisible();
  await expect(page.locator("#share-fallback")).toHaveValue(/compare=dockside-dreams%2Cthe-oasis#compare/);
  await expect(page.locator("#share-fallback")).toBeFocused();
});

test("trip controls fit the viewport and the comparison meets automated accessibility checks", async ({ page }, testInfo) => {
  await visit(page);
  const button = await page.getByRole("button",{name:"Find my home",exact:true}).boundingBox();
  expect(button.y + button.height).toBeLessThanOrEqual(page.viewportSize().height);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath("catalog-first-screen.png")});
  await page.getByRole("button", {name:"Compare Dockside Dreams",exact:true}).click();
  await page.getByRole("button", {name:"Compare The Oasis",exact:true}).click();
  const tray = await page.locator("#catalog-shortlist").boundingBox();
  expect(tray.y).toBeGreaterThan(0);
  expect(tray.y+tray.height).toBeLessThanOrEqual(page.viewportSize().height);
  await page.locator("#open-comparison").click();
  const twoColumnsFit = await page.locator(".catalog-comparison-scroll").evaluate(node => node.scrollWidth <= node.clientWidth + 1);
  expect(twoColumnsFit).toBe(true);
  const scan = await new AxeBuilder({page}).include("#catalog-comparison").analyze();
  expect(scan.violations).toEqual([]);
  await page.screenshot({path:testInfo.outputPath("comparison-first-screen.png")});
});

test("without JavaScript, every home still has real details and a checkout path", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled:false,baseURL });
  const page = await context.newPage();
  await registerStableNetwork(page);
  await page.goto("/properties/?visual-test=1");
  await expect(page.locator(".catalog-card")).toHaveCount(5);
  await expect(page.locator(".catalog-check-dates")).toHaveCount(5);
  await expect(page.locator(".catalog-compare-toggle:visible")).toHaveCount(0);
  await expect(page.locator(".catalog-opening:visible")).toHaveCount(0);
  const response = await page.goto(await page.getByRole("link",{name:"View Dockside Dreams details",exact:true}).getAttribute("href"));
  expect(response.status()).toBe(200);
  await context.close();
});
