const { test, expect } = require('@playwright/test');
const { gotoMarketingRoute } = require('./test-helpers');

test('Waterline facts and navigation remain readable and usable', async ({ page }) => {
  await gotoMarketingRoute(page, { slug: 'home', path: '/', readySelector: '#home-heading' });
  const measurements = await page.locator('.g-header-actions .g-button, .g-menu-button, .g-scene:not([hidden]) .g-scene-explore, .g-footer-grid > div > a, .g-footer-bottom a').evaluateAll(nodes => nodes
    .filter(node => node.getClientRects().length)
    .map(node => ({ text: node.textContent.trim(), height: node.getBoundingClientRect().height })));
  for (const item of measurements) expect(item.height, item.text).toBeGreaterThanOrEqual(44);
  for (const selector of ['.g-scene-picker small', '.g-postcard .g-label', '.g-trip-form label']) {
    const sizes = await page.locator(selector).evaluateAll(nodes => nodes.map(node => parseFloat(getComputedStyle(node).fontSize)));
    for (const size of sizes) expect(size, selector).toBeGreaterThanOrEqual(12);
  }
  await expect(page.locator('.g-footer a[href="/guest-support/"]')).toBeVisible();
  await expect(page.locator('.g-footer a[href="/terms/#booking-and-confirmation"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Waterline comparison icons, badges and row labels fit their controls', async ({ page }) => {
  await gotoMarketingRoute(page, { slug: 'properties-catalog', path: '/properties/?promo=save50' });
  const first = page.locator('[data-compare]').first();
  await expect(first.locator('.catalog-compare-add')).toBeVisible();
  await expect(first.locator('.catalog-compare-selected')).toBeHidden();
  await first.click();
  await expect(first.locator('.catalog-compare-add')).toBeHidden();
  await expect(first.locator('.catalog-compare-selected')).toBeVisible();
  const badgesFit = await page.locator('.catalog-photo-number').evaluateAll(nodes => nodes.every(node => {
    const range = document.createRange(); range.selectNodeContents(node);
    const text = range.getBoundingClientRect(); const box = node.getBoundingClientRect();
    return text.left >= box.left && text.right <= box.right && text.top >= box.top && text.bottom <= box.bottom;
  }));
  expect(badgesFit).toBe(true);
  await page.locator('[data-compare]').nth(1).click();
  await page.getByRole('button', { name: 'Compare homes', exact: true }).click();
  const labelsFit = await page.locator('.catalog-comparison-table tbody th').evaluateAll(nodes => nodes.every(node => {
    const range = document.createRange(); range.selectNodeContents(node);
    const box = node.getBoundingClientRect();
    return Array.from(range.getClientRects()).every(rect => rect.left >= box.left && rect.right <= box.right);
  }));
  expect(labelsFit).toBe(true);
  await page.getByRole('button', { name: 'Close comparison', exact: true }).click();
  await first.click();
  await expect(first.locator('.catalog-compare-add')).toBeVisible();
  await expect(page.locator('.save50-offer-card')).toHaveCSS('background-image', 'none');
});

test('Every homepage scene keeps copy clear of the property caption', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Explicit viewport matrix covers both device sizes.');
  await gotoMarketingRoute(page, { slug: 'home', path: '/', readySelector: '#home-heading' });
  for (const width of [375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const slug of ['the-oasis', 'dockside-dreams', 'sarasota-luxe', 'river-house', 'bradenton-pool-home']) {
      await page.locator(`[data-scene-choice="${slug}"]`).click();
      await expect(page.locator(`[data-scene="${slug}"]`)).toBeVisible();
      const metrics = await page.evaluate(() => {
        const copy = document.querySelector('.g-arrival-copy').getBoundingClientRect();
        const caption = document.querySelector('.g-scene:not([hidden]) .g-scene-caption').getBoundingClientRect();
        return { gap: caption.top - copy.bottom, overflow: document.documentElement.scrollWidth > innerWidth };
      });
      expect(metrics.gap, `${slug} at ${width}px`).toBeGreaterThanOrEqual(16);
      expect(metrics.overflow, `${slug} at ${width}px`).toBe(false);
    }
  }
});
