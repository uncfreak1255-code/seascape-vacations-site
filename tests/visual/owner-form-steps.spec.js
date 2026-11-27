const assert = require("node:assert/strict");
const { expect, test } = require("@playwright/test");
const { moneyRoutes } = require("./routes");
const { gotoMarketingRoute } = require("./test-helpers");

const ownerHub = moneyRoutes.find((route) => route.slug === "property-management");
const FORM_INK = "rgb(34, 34, 34)";
const FORM_RULE = "rgb(221, 221, 221)";

async function readSegment(locator) {
  return locator.evaluate((node) => {
    const bar = getComputedStyle(node, "::after");
    return {
      background: bar.backgroundColor,
      height: bar.height,
      transform: getComputedStyle(node).transform
    };
  });
}

test("owner form step controls use a thin four-segment bar and keep hit area unscaled", async ({ page }) => {
  // Pixel baselines for this route live in the macOS visual gate. This spec
  // asserts computed contrast and reduced-motion so Linux CI cannot land
  // Mac-incompatible goldens.
  await gotoMarketingRoute(page, ownerHub);

  const steps = page.locator(".g-owner-steps");
  await steps.scrollIntoViewIfNeeded();
  await expect(steps).toBeVisible();
  await expect(page.locator(".g-owner-step-dot")).toHaveCount(4);

  const active = page.locator(".g-owner-step-dot.is-active");
  const activeColors = await readSegment(active);
  assert.equal(activeColors.background, FORM_INK);
  assert.equal(activeColors.height, "4px");
  assert.equal(activeColors.transform, "none");

  await page.locator("[data-form-next]").first().click();
  await expect(page.locator(".g-owner-step-dot.is-complete")).toHaveCount(1);
  await expect(page.locator(".g-owner-step-dot.is-active")).toHaveAttribute("aria-label", "Go to step 2");

  const completeColors = await readSegment(page.locator(".g-owner-step-dot.is-complete"));
  assert.equal(completeColors.background, FORM_INK);

  const nextActive = await readSegment(page.locator(".g-owner-step-dot.is-active"));
  assert.equal(nextActive.background, FORM_INK);

  const idle = page.locator(".g-owner-step-dot").nth(2);
  const idleColors = await readSegment(idle);
  assert.equal(idleColors.background, FORM_RULE);
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
