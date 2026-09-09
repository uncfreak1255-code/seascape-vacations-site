const { test, expect } = require('@playwright/test');
const { registerStableNetwork } = require('./test-helpers');

test('family guide keeps its real hero and readable illustrated packing section', async ({ page }, testInfo) => {
  await registerStableNetwork(page);
  await page.goto('/guides/family-vacation-anna-maria-island/?visual-test=1');
  const section = page.locator('.guide-packing');
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole('heading')).toHaveText('Pack for the first beach morning.');
  await expect(section.getByRole('listitem')).toHaveCount(4);
  const illustration = section.getByRole('img');
  await expect(illustration).toHaveAttribute('alt', /Painted illustration/);
  await expect.poll(() => illustration.evaluate(image => image.naturalWidth)).toBe(1536);
  await expect(section.locator('figcaption')).toContainText('Editorial illustration');
  await expect(page.locator('.guide-hero-img')).toHaveAttribute('src', '/images/anna-maria-island-og.jpg');
  await expect(page.getByRole('link', { name: 'View Family-Friendly Properties' })).toHaveAttribute('href', '/properties/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const imageBox = await illustration.boundingBox();
  const copyBox = await section.locator('.packing-copy').boundingBox();
  if (page.viewportSize().width <= 600) expect(imageBox.y).toBeLessThan(copyBox.y);
  else expect(imageBox.x).toBeGreaterThan(copyBox.x);
  await testInfo.attach('packing-section', { body: await section.screenshot(), contentType: 'image/png' });
});
