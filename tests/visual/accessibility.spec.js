const assert = require("node:assert/strict");
const AxeBuilder = require("@axe-core/playwright").default;
const { test } = require("@playwright/test");
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
