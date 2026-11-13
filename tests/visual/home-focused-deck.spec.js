const { test, expect } = require('@playwright/test');
const { registerStableNetwork } = require('./test-helpers');

test('focused A wraps, supports immediate keyboard and restores the collection', async ({ page }) => {
  await registerStableNetwork(page);
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/?guests=6');
  const root = page.locator('[data-home-deck]');
  await expect(root).toHaveClass(/hd-ready/);
  const next = root.getByRole('button', { name: 'Next home', exact: true });
  await expect(root.locator('[data-deck-position]')).toHaveText('1 / 8');
  await next.press('End');
  await expect(root.locator('[data-deck-position]')).toHaveText('8 / 8');
  await next.press('Enter');
  await expect(root.locator('[data-deck-position]')).toHaveText('1 / 8');
  await expect(next).toBeFocused();
  for (let i = 0; i < 8; i++) {
    await next.press('ArrowRight');
    await expect(root.locator('.g-postcard[data-active="true"] [data-deck-explore]')).toBeVisible();
  }
  await root.getByRole('button', { name: 'See all homes', exact: true }).click();
  await expect(root).toHaveClass(/hd-open/);
  await expect(root.locator('.g-postcard[aria-hidden="false"]')).toHaveCount(8);
  await expect(root.getByRole('button', { name: 'Back to focused deck' })).toBeFocused();
  await root.getByRole('button', { name: 'Back to focused deck' }).click();
  await expect(root.getByRole('button', { name: 'See all homes', exact: true })).toBeFocused();
  expect(errors).toEqual([]);
});

test('phone filtering and native snap keep active home and count aligned', async ({ page, isMobile }) => {
  test.skip(!isMobile);
  await registerStableNetwork(page); await page.goto('/');
  const root = page.locator('[data-home-deck]');
  await page.getByRole('button', { name: 'Sarasota', exact: true }).click();
  await expect(root.locator('[data-deck-position]')).toHaveText('1 / 1');
  await expect(root.locator('.g-postcard[data-active="true"] h3')).toHaveText('Sarasota Luxe');
  await page.getByRole('button', { name: 'All stays', exact: true }).click();
  await root.locator('.g-postcards').evaluate(el => el.scrollTo({ left: el.children[1].offsetLeft, behavior: 'instant' }));
  await expect(root.locator('[data-deck-position]')).toHaveText('2 / 8');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('without JavaScript every homepage property remains linked', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage(); await page.goto(baseURL + '/');
  await expect(page.locator('[data-deck-controls]')).toBeHidden();
  await expect(page.locator('[data-deck-explore]')).toHaveCount(8);
  expect(await page.locator('[data-deck-explore]').evaluateAll(nodes => nodes.every(n => n.getAttribute('href').startsWith('/properties/')))).toBe(true);
  await context.close();
});

test('deck survives narrow resize, broken photos and rapid selection without page overflow', async ({ page, isMobile }) => {
  test.skip(isMobile, 'explicit width matrix');
  await registerStableNetwork(page);
  await page.route('**/images/homes/dockside-dreams/01*.webp', r => r.abort());
  await page.goto('/');
  const root = page.locator('[data-home-deck]');
  for (const width of [375, 390, 700, 701, 768, 1051, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const next = root.getByRole('button', { name: 'Next home', exact: true });
    await next.press('End'); await next.press('Home');
    await expect(root.locator('[data-deck-position]')).toHaveText('1 / 8');
    await expect(root.locator('.g-postcard[data-active="true"] [data-deck-explore]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('keyboard selection from the active home never strands focus on hidden content', async ({ page }) => {
  await registerStableNetwork(page); await page.goto('/');
  const root = page.locator('[data-home-deck]');
  await root.locator('.g-postcard[data-active="true"] [data-deck-explore]').press('ArrowRight');
  await expect(root.locator('.g-postcard[data-active="true"] [data-deck-explore]')).toBeFocused();
  await expect(root.locator('[data-deck-position]')).toHaveText('2 / 8');
});

// Approved A fidelity: keep the CTA arrow aligned and native phone snap flush.
test('focused deck keeps its approved CTA and phone swipe cue aligned', async ({ page, isMobile }) => {
  await registerStableNetwork(page); await page.goto('/');
  const root = page.locator('[data-home-deck]');
  const link = root.locator('.g-postcard[data-active="true"] [data-deck-explore]');
  await expect(link).toHaveCSS('display', 'flex');
  const box = await link.boundingBox();
  const arrow = await link.locator(':scope > span').boundingBox();
  expect(Math.abs(box.x + box.width - arrow.x - arrow.width)).toBeLessThanOrEqual(2);
  if (isMobile) {
    await expect(root.locator('.hd-hint')).toHaveText('Swipe to explore the collection.');
    await expect(root.locator('.hd-hint')).toBeVisible();
    await root.getByRole('button', { name: 'Next home', exact: true }).click();
    const stage = await root.locator('.g-postcards').boundingBox();
    await expect.poll(async () => (await root.locator('.g-postcard[data-active="true"]').boundingBox()).x).toBeCloseTo(stage.x, 0);
  }
});
