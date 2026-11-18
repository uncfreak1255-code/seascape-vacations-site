const { test, expect } = require('@playwright/test');
const { registerStableNetwork } = require('./test-helpers');

test('pointer presses respond without changing the booking destination or reduced-motion layout', async ({ page }) => {
  await registerStableNetwork(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  // The phone homepage hides the header button; the owner button is the visible linked button there.
  const header = page.locator('.g-header-actions .g-button');
  const button = (await header.isVisible()) ? header : page.locator('.g-home-owners .g-button');
  await button.scrollIntoViewIfNeeded();
  const destination = await button.getAttribute('href');
  const bounds = await button.boundingBox();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await expect.poll(() => button.evaluate(node => new DOMMatrix(getComputedStyle(node).transform).a)).toBeLessThan(1);
  await page.mouse.move(1, 1);
  await page.mouse.up();
  await expect(button).toHaveAttribute('href', destination);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  expect(await button.evaluate(node => new DOMMatrix(getComputedStyle(node).transform).a)).toBe(1);
  await page.mouse.move(1, 1);
  await page.mouse.up();
});

test('keyboard card focus stays visible without lifting or enlarging the card', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop card fan');
  await registerStableNetwork(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const card = page.locator('.g-postcard').first();
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(1, 1);
  const resting = await card.evaluate(node => getComputedStyle(node).transform);
  // Both the photo link and the explicit A CTA must preserve a static focus state.
  for (const link of await card.locator('a').all()) {
    await link.focus();
    await expect.poll(() => card.evaluate(node => getComputedStyle(node).transform)).toBe(resting);
    expect(await link.evaluate(node => getComputedStyle(node).outlineStyle)).not.toBe('none');
  }
  expect(await card.evaluate(node => node.getAnimations().length)).toBe(0);
});


test('touch presses show feedback before release', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Touch viewport');
  await registerStableNetwork(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  // The phone homepage hides the header button; the owner button is the visible linked button there.
  const header = page.locator('.g-header-actions .g-button');
  const button = (await header.isVisible()) ? header : page.locator('.g-home-owners .g-button');
  await button.scrollIntoViewIfNeeded();
  const bounds = await button.boundingBox();
  const input = await context.newCDPSession(page);
  await input.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }] });
  await expect.poll(() => button.evaluate(node => new DOMMatrix(getComputedStyle(node).transform).a)).toBeLessThan(1);
  await input.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 1, y: 1 }] });
  await expect.poll(() => button.evaluate(node => new DOMMatrix(getComputedStyle(node).transform).a)).toBe(1);
  await input.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect.poll(() => button.evaluate(node => new DOMMatrix(getComputedStyle(node).transform).a)).toBe(1);
});
