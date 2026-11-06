const { test, expect } = require('@playwright/test');
const { registerStableNetwork } = require('./test-helpers');
test('property input edits revoke the old checkout before change commits', async ({ page }) => {
  await registerStableNetwork(page);
  await page.clock.setFixedTime(new Date('2026-09-04T16:00:00Z'));
  await page.goto('/properties/dockside-dreams/?arrive=2026-11-07&depart=2026-11-14&guests=6');
  const action = page.locator('.g-property-actions a[data-booking-action]');
  await expect(action).toHaveAttribute('href', /\/checkout\//);
  // Native date editing can emit input before blur/change. Exercise that interval.
  await page.locator('.g-depart').evaluate(el => { el.value = '2026-11-16'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await expect(action).toHaveAttribute('href', '#booking');
});
test('menu close invalidates queued opening animation frames', async ({ page }) => {
  await registerStableNetwork(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => {
    const frames = [];
    const native = window.requestAnimationFrame;
    window.requestAnimationFrame = fn => { frames.push(fn); return frames.length; };
    document.querySelector('.g-menu-button').click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    while (frames.length) frames.shift()();
    window.requestAnimationFrame = native;
  });
  await expect(page.locator('#guest-menu')).not.toHaveClass(/is-open/);
  await expect(page.locator('#guest-menu')).toBeHidden();
  await expect(page.locator('.g-menu-button')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('.g-menu-button').click();
  await expect(page.locator('#guest-menu')).toBeVisible();
  await expect(page.locator('#guest-menu')).toHaveClass(/is-open/);
  await expect(page.locator('.g-menu-button')).toHaveAttribute('aria-expanded', 'true');
});

test('reverting an uncommitted date edit permits an explicit check again', async ({ page }) => {
  await registerStableNetwork(page);
  await page.clock.setFixedTime(new Date('2026-09-04T16:00:00Z'));
  await page.goto('/properties/dockside-dreams/?arrive=2026-11-07&depart=2026-11-14&guests=6');
  const action = page.locator('.g-property-actions a[data-booking-action]');
  await expect(action).toHaveAttribute('href', /\/checkout\//);
  await page.locator('.g-depart').evaluate(el => {
    for (const value of ['2026-11-16', '2026-11-14']) { el.value=value; el.dispatchEvent(new Event('input', { bubbles:true })); }
  });
  await page.locator('button[data-booking-action]').click();
  await expect(action).toHaveAttribute('href', /\/checkout\//);
});

test('an in-flight old date response cannot restore checkout after input changes', async ({ page }) => {
  await registerStableNetwork(page);
  let held;
  await page.route('**/.netlify/functions/booking-availability?**', route => { held = route; });
  await page.clock.setFixedTime(new Date('2026-09-04T16:00:00Z'));
  await page.goto('/properties/dockside-dreams/?arrive=2026-11-07&depart=2026-11-14&guests=6', { waitUntil: 'domcontentloaded' });
  await expect.poll(() => Boolean(held)).toBe(true);
  await page.locator('.g-depart').evaluate(el => { el.value = '2026-11-16'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  const response = page.waitForResponse(/booking-availability/);
  await held.fulfill({ json: { ok: true, homes: [{ slug: 'dockside-dreams', bookable: true }] } });
  await response;
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 50)));
  await expect(page.locator('.g-property-actions a[data-booking-action]')).toHaveAttribute('href', '#booking');
  await expect(page.locator('[data-property-checkout]')).not.toHaveAttribute('href');
});
