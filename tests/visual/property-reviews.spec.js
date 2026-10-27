const { test, expect } = require('@playwright/test');
const properties = require('../../src/_data/properties-fallback.json');
const eligible = properties.filter(p => p.guestFacts?.reviews.length >= 2 && p.guestFacts.sourceUrl && p.guestFacts.verifiedAt);

for (const property of eligible) {
  test(`${property.slug} sourced reviews retain their content and support carousel navigation`, async ({ page }, testInfo) => {
    await page.goto(`/properties/${property.slug}/#reviews`);
    const track = page.locator('#review-track');
    await expect(track).toBeVisible();
    const reviews = property.guestFacts.reviews;
    await expect(track.locator('figure')).toHaveCount(reviews.length);
    for (const review of reviews) {
      await expect(track).toContainText(review.text);
      await expect(track).toContainText(`${review.author} · ${review.date} · ${review.rating}/5`);
    }
    await page.getByRole('button', { name: 'Next review', exact: true }).click();
    await expect(page.locator('.review-count')).toHaveText(`02 / ${String(reviews.length).padStart(2, '0')}`);
    await track.press('End');
    await expect(page.getByRole('button', { name: 'Next review', exact: true })).toBeDisabled();
    await track.press('Home');
    await expect(page.getByRole('button', { name: 'Previous review', exact: true })).toBeDisabled();
    if (testInfo.project.name.includes('mobile')) {
      const box = await track.boundingBox();
      const cdp = await page.context().newCDPSession(page);
      const y = Math.max(100, box.y + Math.min(150, box.height / 2));
      const start = box.x + box.width * 0.85;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start, y }] });
      for (let step = 1; step <= 8; step++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start - box.width * 0.7 * step / 8, y }] });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await expect(page.locator('.review-count')).not.toHaveText(`01 / ${String(reviews.length).padStart(2, '0')}`);
      await cdp.detach();
    }
    if (property.slug !== 'dockside-dreams') await expect(page.locator('#stay-story')).toHaveCount(0);
  });
}

test('homes without sourced reviews do not load a carousel or Dockside media', async ({ page }) => {
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  for (const p of properties.filter(p => !p.guestFacts?.reviews.length)) {
    await page.goto(`/properties/${p.slug}/`);
    await expect(page.locator('#review-track')).toHaveCount(0);
    await expect(page.locator('#stay-story')).toHaveCount(0);
  }
  expect(requests.filter(url => /property-reviews\.(js|css)|dockside-story|assets\/media\/dockside/.test(url))).toEqual([]);
});
