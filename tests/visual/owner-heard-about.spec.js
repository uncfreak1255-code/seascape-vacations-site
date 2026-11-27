const { expect, test } = require("@playwright/test");
const { moneyRoutes } = require("./routes");
const { gotoMarketingRoute } = require("./test-helpers");

const ownerHub = moneyRoutes.find((route) => route.slug === "property-management");

test("owner hub shows the AI prompt only after an AI source is selected", async ({ page }) => {
  await gotoMarketingRoute(page, ownerHub);
  const form = page.locator('form[name="owner-revenue-teardown"]');
  await form.getByRole("button", { name: "Get my review", exact: true }).click();
  await form.getByRole("button", { name: "Continue", exact: true }).click();

  const source = form.getByLabel("How did you hear about us? (optional)");
  const prompt = form.getByLabel("What did you ask it? (optional)");
  await expect(source).toBeVisible();
  await expect(source).not.toHaveAttribute("required", "");
  await expect(prompt).toBeHidden();

  await source.selectOption("google");
  await expect(prompt).toBeHidden();

  await source.selectOption("chatgpt");
  await expect(prompt).toBeVisible();
  await expect(prompt).toHaveAttribute(
    "placeholder",
    "e.g. best vacation rental manager in Bradenton"
  );
  await prompt.fill("best vacation rental manager in Bradenton");
});
