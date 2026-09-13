const assert = require("node:assert/strict");
const AxeBuilder = require("@axe-core/playwright").default;
const { expect, test } = require("@playwright/test");
const { moneyRoutes } = require("./routes");
const { gotoMarketingRoute } = require("./test-helpers");

function formatViolations(routeSlug, violations) {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .flatMap((node) => node.target)
        .slice(0, 5)
        .join(", ");
      return `${routeSlug}: [${violation.impact}] ${violation.id} -> ${targets}`;
    })
    .join("\n");
}

const ownerHub = moneyRoutes.find((route) => route.slug === "property-management");
const catalogRoute = moneyRoutes.find((route) => route.slug === "properties-catalog");
const propertyRoute = moneyRoutes.find((route) => route.slug === "dockside-dreams");

for (const routeConfig of moneyRoutes) {
  test(`${routeConfig.slug} has no serious or critical accessibility violations`, async ({ page }) => {
    await gotoMarketingRoute(page, routeConfig);

    const scan = await new AxeBuilder({ page }).analyze();
    const blockingViolations = scan.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact)
    );

    assert.equal(
      blockingViolations.length,
      0,
      formatViolations(routeConfig.slug, blockingViolations)
    );
  });
}

test("property-management keeps a single unique main landmark", async ({ page }) => {
  await gotoMarketingRoute(page, ownerHub);

  const mains = page.locator("main");
  await expect(mains).toHaveCount(1);
  await expect(mains).toHaveClass(/main-content/);
  await expect(page.locator(".owner-field")).toHaveCount(1);
  assert.equal(await page.locator(".owner-field").evaluate((node) => node.tagName), "DIV");

  const scan = await new AxeBuilder({ page })
    .withRules(["landmark-main-is-top-level", "landmark-no-duplicate-main", "landmark-unique"])
    .analyze();
  assert.equal(scan.violations.length, 0, formatViolations(ownerHub.slug, scan.violations));
});

test("named catalog, gallery, and owner regions are not role-less aria-label hosts", async ({ page }) => {
  await gotoMarketingRoute(page, catalogRoute);
  await expect(page.locator(".catalog-filters")).toHaveRole("group");
  await expect(page.locator(".catalog-filters")).toHaveAccessibleName("Property filters");

  await gotoMarketingRoute(page, propertyRoute);
  await expect(page.locator(".g-gallery")).toHaveAccessibleName("Dockside Dreams photos");
  assert.equal(await page.locator(".g-gallery").evaluate((node) => node.tagName), "SECTION");
  await expect(page.locator(".property-trip-context")).toHaveRole("group");
  await expect(page.locator(".property-trip-context")).toHaveAccessibleName("Your trip");

  await gotoMarketingRoute(page, ownerHub);
  await expect(page.locator(".owner-field-ticker-dots")).toHaveRole("group");
  await expect(page.locator(".owner-field-ticker-dots")).toHaveAccessibleName("Fee guide fact selector");
  await expect(page.locator(".owner-field-proof-strip")).toHaveRole("group");
  await expect(page.locator(".owner-field-proof-strip")).toHaveAccessibleName("Fee comparison sources");
  await expect(page.locator(".owner-field-map")).toHaveRole("region");
  await expect(page.locator(".owner-field-map")).toHaveAccessibleName("Bradenton Sarasota corridor portfolio map");
  await expect(page.locator(".owner-field-mega")).toHaveRole("img");
  await expect(page.locator(".owner-field-mega")).toHaveAccessibleName("Three fees are not one comparison");
  await expect(page.locator(".owner-field-steps")).toHaveRole("navigation");
  await expect(page.locator(".owner-field-steps")).toHaveAccessibleName("Form progress");
  await expect(page.locator(".owner-field-form-proof")).toHaveRole("group");
  await expect(page.locator(".owner-field-form-proof")).toHaveAccessibleName("Owner review proof points");
  await expect(page.locator(".owner-field-phrase")).not.toHaveAttribute("aria-label");

  const scan = await new AxeBuilder({ page })
    .withRules(["aria-allowed-attr", "aria-prohibited-attr", "aria-roles"])
    .analyze();
  assert.equal(scan.violations.length, 0, formatViolations(ownerHub.slug, scan.violations));
});
