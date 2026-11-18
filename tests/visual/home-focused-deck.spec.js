const { test, expect } = require('@playwright/test');
const { registerStableNetwork } = require('./test-helpers');

test('focused A wraps, supports immediate keyboard and restores the collection', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop deck controls');
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

test('phone opens a vertical list with usable photo strips and filters', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone layout');
  await registerStableNetwork(page);
  await page.goto('/');
  const root = page.locator('[data-home-deck]');
  const cards = root.locator('.g-postcard[aria-hidden="false"]');
  await expect(root.locator('[data-deck-controls]')).toBeHidden();
  await expect(root.locator('[data-deck-back]')).toBeHidden();
  await expect(cards).toHaveCount(8);
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  expect(second.x).toBeCloseTo(first.x, 0);
  expect(second.y).toBeGreaterThan(first.y + first.height);
  await expect(cards.last().locator('[data-deck-explore]')).toHaveAttribute('tabindex', '0');
  const strip = cards.first().locator('[data-ts-strip]');
  await strip.evaluate(el => el.scrollTo({ left: el.clientWidth, behavior: 'instant' }));
  await expect(cards.first().locator('[data-ts-count]')).toHaveAttribute('data-n', '2');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Sarasota', exact: true }).click();
  await expect(cards.locator('h3')).toHaveText('Sarasota Luxe');
  await page.getByRole('button', { name: 'All stays', exact: true }).click();
  await expect(cards).toHaveCount(8);
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
    if (width <= 700) {
      await expect(next).toBeHidden();
      await expect(root.locator('.g-postcard[aria-hidden="false"]')).toHaveCount(8);
    } else {
      await next.press('End');
      await next.press('Home');
      await expect(root.locator('[data-deck-position]')).toHaveText('1 / 8');
      await expect(root.locator('.g-postcard[data-active="true"] [data-deck-explore]')).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('keyboard selection from the active home never strands focus on hidden content', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop deck controls');
  await registerStableNetwork(page); await page.goto('/');
  const root = page.locator('[data-home-deck]');
  await root.locator('.g-postcard[data-active="true"] [data-deck-explore]').press('ArrowRight');
  await expect(root.locator('.g-postcard[data-active="true"] [data-deck-explore]')).toBeFocused();
  await expect(root.locator('[data-deck-position]')).toHaveText('2 / 8');
});

test('home card keeps its CTA arrow aligned', async ({ page }) => {
  await registerStableNetwork(page); await page.goto('/');
  const root = page.locator('[data-home-deck]');
  const link = root.locator('.g-postcard[data-active="true"] [data-deck-explore]');
  await expect(link).toHaveCSS('display', 'flex');
  const box = await link.boundingBox();
  const arrow = await link.locator(':scope > span').boundingBox();
  expect(Math.abs(box.x + box.width - arrow.x - arrow.width)).toBeLessThanOrEqual(2);
});
