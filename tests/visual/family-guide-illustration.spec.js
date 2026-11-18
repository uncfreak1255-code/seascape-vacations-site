const { test, expect } = require('@playwright/test');
const { registerStableNetwork } = require('./test-helpers');

test('family guide keeps one image style: the illustrated packing section, no opening photograph', async ({ page }, testInfo) => {
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
  await expect(page.locator('main img')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'View Family-Friendly Properties' })).toHaveAttribute('href', '/properties/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const imageBox = await illustration.boundingBox();
  const copyBox = await section.locator('.packing-copy').boundingBox();
  if (page.viewportSize().width < 900) expect(imageBox.y).toBeLessThan(copyBox.y);
  else expect(imageBox.x).toBeGreaterThan(copyBox.x);
  await testInfo.attach('packing-section', { body: await section.screenshot(), contentType: 'image/png' });
});
