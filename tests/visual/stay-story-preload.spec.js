const { test, expect } = require('@playwright/test');

const filmRequest = url => url.includes('/assets/media/river-house/') && url.endsWith('.mp4');

async function openOffscreen(page) {
  const viewport = page.viewportSize();
  await page.setViewportSize({ width: viewport.width, height: 600 });
  await page.goto('/properties/river-house/');
  await page.waitForLoadState('networkidle');
}

test('prepares the visible film without starting playback', async ({ page }, testInfo) => {
  const requests = [];
  page.on('request', request => { if (filmRequest(request.url())) requests.push(request.url()); });
  await openOffscreen(page);
  const film = page.locator('#stay-story-film');
  expect(requests).toEqual([]);

  await film.scrollIntoViewIfNeeded();
  await expect.poll(() => requests.length).toBeGreaterThan(0);
  await expect(film).toHaveAttribute('src', new RegExp(testInfo.project.name.includes('mobile') ? 'portrait-mobile.mp4$' : 'cinema-web.mp4$'));
  expect(await film.evaluate(v => v.paused)).toBe(true);
  await page.getByRole('button', { name: 'Play stay story', exact: true }).click();
  await expect.poll(() => film.evaluate(v => !v.paused && v.currentTime > 0)).toBe(true);
});

test('does not prepare for a data-saving visitor but still plays on request', async ({ page }) => {
  await page.addInitScript(() => {
    const connection = new EventTarget();
    Object.defineProperty(connection, 'saveData', { value: true });
    Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
  });
  const requests = [];
  page.on('request', request => { if (filmRequest(request.url())) requests.push(request.url()); });
  await openOffscreen(page);
  const film = page.locator('#stay-story-film');
  await film.scrollIntoViewIfNeeded();
  await expect(film).toHaveAttribute('poster', /river-house\/.*-poster\.jpg$/);
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);
  await page.getByRole('button', { name: 'Play stay story', exact: true }).click();
  await expect.poll(() => film.evaluate(v => !v.paused && v.currentTime > 0)).toBe(true);
});

test('honors a reduced-data media preference while allowing explicit play', async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.matchMedia.bind(window);
    window.matchMedia = query => {
      if (query !== '(prefers-reduced-data: reduce)') return original(query);
      const preference = new EventTarget();
      Object.defineProperty(preference, 'matches', { value: true });
      return preference;
    };
  });
  const requests = [];
  page.on('request', request => { if (filmRequest(request.url())) requests.push(request.url()); });
  await openOffscreen(page);
  const film = page.locator('#stay-story-film');
  await film.scrollIntoViewIfNeeded();
  await expect(film).toHaveAttribute('poster', /river-house\/.*-poster\.jpg$/);
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);
  await page.getByRole('button', { name: 'Play stay story', exact: true }).click();
  await expect.poll(() => film.evaluate(v => !v.paused && v.currentTime > 0)).toBe(true);
});

test('stops preparing if data-saving mode is enabled before play', async ({ page }) => {
  await page.addInitScript(() => {
    const connection = new EventTarget();
    let saving = false;
    Object.defineProperty(connection, 'saveData', { get: () => saving });
    Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
    window.enableDataSaving = () => { saving = true; connection.dispatchEvent(new Event('change')); };
  });
  let release;
  let first = true;
  await page.route('**/assets/media/river-house/*.mp4', async route => {
    if (!first) return route.continue();
    first = false;
    await new Promise(resolve => { release = resolve; });
    await route.abort().catch(() => {});
  });
  try {
    await openOffscreen(page);
    const film = page.locator('#stay-story-film');
    const requested = page.waitForRequest(request => filmRequest(request.url()));
    await film.scrollIntoViewIfNeeded();
    await requested;
    await page.evaluate(() => window.enableDataSaving());
    await expect(film).not.toHaveAttribute('src');
    await expect(page.getByRole('button', { name: 'Play stay story', exact: true })).toBeVisible();
    release();
    await page.getByRole('button', { name: 'Play stay story', exact: true }).click();
    await expect.poll(() => film.evaluate(v => !v.paused && v.currentTime > 0)).toBe(true);
  } finally {
    if (release) release();
  }
});

test('a failed preparation leaves Play available and retries on tap', async ({ page }) => {
  let first = true;
  await page.route('**/assets/media/river-house/*.mp4', async route => {
    if (first) { first = false; return route.abort('failed'); }
    return route.continue();
  });
  await openOffscreen(page);
  const film = page.locator('#stay-story-film');
  await film.scrollIntoViewIfNeeded();
  await expect.poll(() => first).toBe(false);
  await expect(film).not.toHaveAttribute('src');
  await expect(page.locator('.story-player-status')).toBeEmpty();
  await page.getByRole('button', { name: 'Play stay story', exact: true }).click();
  await expect.poll(() => film.evaluate(v => !v.paused && v.currentTime > 0)).toBe(true);
});
