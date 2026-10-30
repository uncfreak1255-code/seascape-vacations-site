const { test, expect } = require('@playwright/test');

test('Dockside defers story media until needed and plays the matching format', async ({ page }, testInfo) => {
  const media = [];
  page.on('request', request => {
    if (request.url().includes('/assets/media/dockside/')) media.push(request.url());
  });
  await page.goto('/properties/dockside-dreams/');
  await page.waitForLoadState('networkidle');
  const mobile = testInfo.project.name.includes('mobile');
  if (mobile) expect(media).toEqual([]);
  expect(media.filter(url => url.endsWith('.mp4'))).toEqual([]);
  const film = page.locator('#stay-story-film');
  await film.scrollIntoViewIfNeeded();
  await expect(film).toHaveAttribute('poster', new RegExp(mobile ? '/portrait-poster.jpg$' : '/cinema-poster.jpg$'));
  expect(media.filter(url => url.endsWith('.mp4'))).toEqual([]);
  await page.getByRole('button', { name: 'Play stay story', exact: true }).click();
  await expect.poll(() => film.evaluate(video => !video.paused && video.currentTime > 0)).toBe(true);
  await expect(film).toHaveAttribute('src', new RegExp(mobile ? 'portrait-mobile.mp4$' : 'cinema-web.mp4$'));
});

test('Dockside reviews preserve content and navigate both directions', async ({ page }) => {
  await page.goto('/properties/dockside-dreams/#reviews');
  await expect(page.locator('#review-track figure')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Previous review', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Next review', exact: true }).click();
  await expect(page.locator('.review-count')).toHaveText('02 / 03');
  await page.locator('#review-track').press('End');
  await expect(page.locator('.review-count')).toHaveText('03 / 03');
  await expect(page.getByRole('button', { name: 'Next review', exact: true })).toBeDisabled();
  await page.locator('#review-track').press('Home');
  await expect(page.locator('.review-count')).toHaveText('01 / 03');
});

test('other property pages do not load Dockside story assets', async ({ page }) => {
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/properties/the-oasis/');
  await page.waitForLoadState('networkidle');
  expect(requests.filter(url => /dockside-story|assets\/media\/dockside/.test(url))).toEqual([]);
});
