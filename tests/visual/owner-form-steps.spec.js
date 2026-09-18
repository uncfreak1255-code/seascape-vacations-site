const assert = require("node:assert/strict");
const { expect, test } = require("@playwright/test");
const { moneyRoutes } = require("./routes");
const { gotoMarketingRoute } = require("./test-helpers");

const ownerHub = moneyRoutes.find((route) => route.slug === "property-management");
const INK = "rgb(23, 61, 66)";
const WHITE = "rgb(255, 255, 255)";

async function readColors(locator) {
  return locator.evaluate((node) => {
    const styles = getComputedStyle(node);
    return {
      color: styles.color,
      background: styles.backgroundColor,
      transform: styles.transform
    };
  });
}

test("owner form step controls use high-contrast ink and keep the progress line decorative", async ({ page }) => {
  // Pixel baselines for this route live in the macOS visual gate. This spec
  // asserts computed contrast and reduced-motion so Linux CI cannot land
  // Mac-incompatible goldens.
  await gotoMarketingRoute(page, ownerHub);

  const steps = page.locator(".g-owner-steps");
  await steps.scrollIntoViewIfNeeded();
  await expect(steps).toBeVisible();

  const active = page.locator(".g-owner-step-dot.is-active");
  const activeColors = await readColors(active);
  assert.equal(activeColors.color, WHITE);
  assert.equal(activeColors.background, INK);
  assert.equal(activeColors.transform, "none");

  await page.locator("[data-form-next]").first().click();
  await expect(page.locator(".g-owner-step-dot.is-complete")).toHaveCount(1);
  await expect(page.locator(".g-owner-step-dot.is-active")).toHaveAttribute("aria-label", "Go to step 2");

  const completeColors = await readColors(page.locator(".g-owner-step-dot.is-complete"));
  assert.equal(completeColors.color, WHITE);
  assert.equal(completeColors.background, INK);

  const nextActive = await readColors(page.locator(".g-owner-step-dot.is-active"));
  assert.equal(nextActive.color, WHITE);
  assert.equal(nextActive.background, INK);

  const completeLine = page.locator(".g-owner-step-line.is-complete").first();
  const lineColor = await completeLine.evaluate((node) => getComputedStyle(node).backgroundColor);
  assert.notEqual(lineColor, INK);
  assert.notEqual(lineColor, WHITE);
});

test("header Revenue Review stays a same-page hash after guest.js runs", async ({ page }) => {
  await gotoMarketingRoute(page, ownerHub);

  const headerCta = page.locator(".g-header-actions a.g-button");
  await expect(headerCta).toBeVisible();
  await expect(headerCta).toHaveAttribute("href", "#owner-cta");
  await expect(headerCta).not.toHaveAttribute("data-trip-link");

  const elapsedMs = await page.evaluate(() => {
    const header = document.querySelector(".g-header-actions a.g-button");
    return new Promise((resolve) => {
      const start = performance.now();
      const finish = () => {
        window.removeEventListener("hashchange", onHash);
        resolve(performance.now() - start);
      };
      const onHash = () => finish();
      window.addEventListener("hashchange", onHash);
      header.click();
      window.setTimeout(finish, 1200);
    });
  });

  expect(elapsedMs).toBeLessThan(150);
  await expect(page).toHaveURL(/#owner-cta$/);
  await expect(page.locator("#owner-cta")).toBeInViewport();
});
