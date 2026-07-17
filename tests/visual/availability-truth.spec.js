const { test, expect } = require("@playwright/test");
const { registerStableNetwork } = require("./test-helpers");

test("properties catalog downgrades availability that expires after a static build", async ({ page }) => {
  await registerStableNetwork(page);
  await page.clock.setFixedTime(new Date("2027-07-17T16:00:00.000Z"));
  await page.goto("/properties/?visual-test=1", { waitUntil: "networkidle" });

  const cards = page.locator(".catalog-card");
  await expect(cards).toHaveCount(5);
  await expect(cards.locator(".catalog-live-pill")).toHaveText(
    Array(5).fill("Calendar · secure")
  );
  await expect(cards.locator(".catalog-next-lbl")).toHaveText(Array(5).fill("Live calendar"));
  await expect(cards.locator(".catalog-next-dates")).toHaveText(
    Array(5).fill("Check available dates")
  );

  for (const chipGroup of await cards.locator(".catalog-chips").all()) {
    await expect(chipGroup).toBeHidden();
  }

  const bookingLinks = await cards
    .locator('a[data-track-event="catalog_book_direct_click"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  for (const href of bookingLinks) {
    expect(href).not.toContain("startingDate=");
    expect(href).not.toContain("endingDate=");
  }
});
