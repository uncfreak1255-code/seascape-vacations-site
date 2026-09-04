const { test, expect } = require("@playwright/test");
const { registerStableNetwork } = require("./test-helpers");

test("expired build snapshots stay hidden without replacing a guest's dates", async ({ page }) => {
  await registerStableNetwork(page);
  await page.clock.setFixedTime(new Date("2027-07-17T16:00:00Z"));
  await page.goto("/properties/?visual-test=1&arrive=2027-11-07&depart=2027-11-14&guests=8", {waitUntil:"networkidle"});
  await expect(page.locator(".catalog-card")).toHaveCount(5);
  await expect(page.locator(".catalog-opening:visible")).toHaveCount(0);
  for (const href of await page.locator(".catalog-check-dates").evaluateAll(nodes=>nodes.map(node=>node.href))) {
    const params = new URL(href).searchParams;
    expect(params.get("start")).toBe("2027-11-07");
    expect(params.get("end")).toBe("2027-11-14");
    expect(params.has("startingDate")).toBe(false);
  }
  await page.getByRole("button",{name:"My dates are flexible"}).click();
  await expect(page.locator(".catalog-opening:visible")).toHaveCount(0);
});

test("recent openings are optional dated suggestions and disappear once a trip is chosen", async ({ page }) => {
  await registerStableNetwork(page);
  await page.clock.setFixedTime(new Date("2026-05-17T16:00:00Z"));
  await page.goto("/properties/?visual-test=1", {waitUntil:"networkidle"});
  await expect(page.locator(".catalog-opening:visible")).toHaveCount(5);
  await expect(page.locator(".catalog-check-dates").first()).not.toHaveAttribute("href",/start=/);
  await page.getByLabel("Arrival",{exact:true}).fill("2026-11-07");
  await page.getByLabel("Departure",{exact:true}).fill("2026-11-14");
  await page.getByRole("button",{name:"Find my home",exact:true}).click();
  await expect(page.locator(".catalog-opening:visible")).toHaveCount(0);
  await expect(page.locator(".catalog-check-dates").first()).toHaveAttribute("href",/start=2026-11-07/);
});
