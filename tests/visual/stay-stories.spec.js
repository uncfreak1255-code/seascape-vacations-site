const { test, expect } = require('@playwright/test');
const path = require('node:path');
const fs = require('node:fs');
const proof = path.resolve(__dirname, '../../experiments/hyperframes/collection/proof');
fs.mkdirSync(proof, { recursive: true });
const stories = require('../../src/_data/stayStories.json');

for (const [slug, story] of Object.entries(stories)) {
  test(`${slug} defers its own film and plays the appropriate format`, async ({ page }, testInfo) => {
    const requests = [];
    page.on('request', r => { if (r.url().includes('/assets/media/')) requests.push(r.url()); });
    await page.goto(`/properties/${slug}/`);
    await page.waitForLoadState('networkidle');
    const mobile = testInfo.project.name.includes('mobile');
    expect(requests.filter(url => url.endsWith('.mp4'))).toEqual([]);
    if (mobile) expect(requests).toEqual([]);
    await expect(page.locator('#stay-story-title')).toHaveText(story.heading);
    const film = page.locator('#stay-story-film');
    await film.scrollIntoViewIfNeeded();
    await expect(film).toHaveAttribute('poster', `/assets/media/${story.mediaDir}/${mobile ? 'portrait' : 'cinema'}-poster.jpg`);
    expect(requests.filter(url => url.endsWith('.mp4'))).toEqual([]);
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
