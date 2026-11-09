const { test, expect } = require('@playwright/test');
const path = require('node:path');
const fs = require('node:fs');
const proof = path.resolve(__dirname, '../../experiments/hyperframes/collection/proof');
fs.mkdirSync(proof, { recursive: true });
const stories = require('../../src/_data/stayStories.json');

for (const [slug, story] of Object.entries(stories)) {
  test(`${slug} prepares its own visible film and plays the appropriate format`, async ({ page }, testInfo) => {
    const requests = [];
    page.on('request', r => { if (r.url().includes('/assets/media/')) requests.push(r.url()); });
    await page.goto(`/properties/${slug}/`);
    await page.waitForLoadState('networkidle');
    const mobile = testInfo.project.name.includes('mobile');
    if (mobile) expect(requests).toEqual([]);
    await expect(page.locator('#stay-story-title')).toHaveText(story.heading);
    const film = page.locator('#stay-story-film');
    await film.scrollIntoViewIfNeeded();
    await expect(film).toHaveAttribute('poster', `/assets/media/${story.mediaDir}/${mobile ? 'portrait' : 'cinema'}-poster.jpg`);
    await expect.poll(() => requests.some(url => url.endsWith('.mp4'))).toBe(true);
    await page.screenshot({ path: path.join(proof, `${slug}-${testInfo.project.name}.png`) });
    await page.getByRole('button', { name: 'Play stay story', exact: true }).click();
    await expect.poll(() => film.evaluate(v => !v.paused && v.currentTime > 0)).toBe(true);
    await expect(film).toHaveAttribute('src', `/assets/media/${story.mediaDir}/stay-story-${mobile ? 'portrait-mobile' : 'cinema-web'}.mp4`);
    expect(requests.every(url => url.includes(`/assets/media/${story.mediaDir}/`))).toBe(true);
    // Observe the real end event; the test server does not support byte-range seeking.
    await expect(page.getByRole('button', { name: 'Replay stay story', exact: true })).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: 'Replay stay story', exact: true }).click();
    await expect.poll(() => film.evaluate(v => !v.paused && v.currentTime < 5)).toBe(true);
  });
}

test('a stalled film offers a retry that can play', async ({ page }, testInfo) => {
  test.setTimeout(35_000);
  const mobile = testInfo.project.name.includes('mobile');
  const filmUrl = `**/assets/media/river-house/stay-story-${mobile ? 'portrait-mobile' : 'cinema-web'}.mp4`;
  let releaseStalledRequest;
  let firstRequest = true;
  await page.route(filmUrl, async route => {
    if (!firstRequest) return route.continue();
    firstRequest = false;
    await new Promise(resolve => { releaseStalledRequest = resolve; });
    await route.abort().catch(() => {});
  });

  await page.goto('/properties/river-house/');
  await page.getByRole('button', { name: 'Play stay story', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Retry stay story', exact: true })).toBeVisible({ timeout: 16_000 });
  await expect(page.locator('.story-player-status')).toContainText('Tap to retry');

  releaseStalledRequest();
  await page.getByRole('button', { name: 'Retry stay story', exact: true }).click();
  await expect.poll(() => page.locator('#stay-story-film').evaluate(v => !v.paused && v.currentTime > 0)).toBe(true);
});

test('a film that stops buffering after it starts offers a retry', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Exercises the reported phone format');
  test.setTimeout(35_000);
  const videoBytes = fs.readFileSync(path.resolve(__dirname, '../../src/assets/media/river-house/stay-story-portrait-mobile.mp4'));
  let firstRequest = true;
  let releaseStalledRequest;
  await page.route('**/assets/media/river-house/stay-story-portrait-mobile.mp4', async route => {
    if (firstRequest) {
      firstRequest = false;
      const end = 300_000;
      return route.fulfill({
        status: 206,
        contentType: 'video/mp4',
        headers: { 'accept-ranges': 'bytes', 'content-range': `bytes 0-${end - 1}/${videoBytes.length}` },
        body: videoBytes.subarray(0, end),
      });
    }
    await new Promise(resolve => { releaseStalledRequest = resolve; });
    await route.abort().catch(() => {});
  });

  try {
    await page.goto('/properties/river-house/?sv_developer=1');
    await page.getByRole('button', { name: 'Play stay story', exact: true }).click();
    await expect.poll(() => page.locator('#stay-story-film').evaluate(v => v.currentTime)).toBeGreaterThan(0.4);
    await expect(page.getByRole('button', { name: 'Retry stay story', exact: true })).toBeVisible({ timeout: 18_000 });
  } finally {
    if (releaseStalledRequest) releaseStalledRequest();
  }
});

test('a slow film keeps loading while its buffer grows', async ({ page }, testInfo) => {
  const mobile = testInfo.project.name.includes('mobile');
  const filmUrl = `**/assets/media/river-house/stay-story-${mobile ? 'portrait-mobile' : 'cinema-web'}.mp4`;
  let releaseStalledRequest;
  await page.clock.install();
  await page.route(filmUrl, async route => {
    await new Promise(resolve => { releaseStalledRequest = resolve; });
    await route.abort().catch(() => {});
  });

  try {
    await page.goto('/properties/river-house/?sv_developer=1');
    const requested = page.waitForRequest(filmUrl);
    await page.getByRole('button', { name: 'Play stay story', exact: true }).click();
    await requested;
    await page.clock.fastForward(11_000);
    await page.locator('#stay-story-film').evaluate(v => {
      Object.defineProperty(v, 'buffered', { configurable: true, get: () => ({ length: 1, end: () => 1 }) });
      v.dispatchEvent(new Event('progress'));
    });
    await page.clock.fastForward(2_000);
    await expect(page.getByRole('button', { name: 'Loading stay story', exact: true })).toBeVisible();
    await page.clock.fastForward(10_100);
    await expect(page.getByRole('button', { name: 'Retry stay story', exact: true })).toBeVisible();
  } finally {
    if (releaseStalledRequest) releaseStalledRequest();
  }
});
