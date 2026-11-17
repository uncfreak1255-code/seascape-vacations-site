const { test, expect } = require('@playwright/test');
const { registerStableNetwork } = require('./test-helpers');
const route = '/stays/week-long-vacation-rentals-florida/';
async function visit(page, query = '') {
  await registerStableNetwork(page);
  await page.clock.setFixedTime(new Date('2026-11-17T18:00:00Z'));
  await page.goto(route + query, { waitUntil: 'networkidle' });
}

test('weekly photo opens a keyboard-dismissable trip selector with actual incoming party', async ({ page }) => {
  await visit(page, '?guests=10');
  const opener = page.locator('[data-weekly-open]');
  await opener.click();
  const dialog = page.locator('[data-weekly-dialog]');
  await expect(dialog).toBeVisible();
  await expect(page.locator('#weekly-guests')).toHaveValue('10');
  await expect(opener).toHaveCSS('color', 'rgb(23, 61, 66)');
  await page.getByLabel('Arrival', { exact: true }).fill('2026-12-01');
  await page.getByRole('button', { name: 'Make it a week · 7 nights' }).click();
  await expect(page.getByLabel('Departure', { exact: true })).toHaveValue('2026-12-08');
  await expect(page.locator('[data-weekly-status]')).toContainText('7 nights · 10 guests');
  const href = new URL(await page.locator('[data-weekly-handoff]').getAttribute('href'));
  expect(href.hostname).toBe('book.seascape-vacations.com');
  expect(href.pathname).toBe('/listings/206016');
  expect(href.searchParams.get('start')).toBe('2026-12-01');
  expect(href.searchParams.get('end')).toBe('2026-12-08');
  expect(href.searchParams.get('numberOfGuests')).toBe('10');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test('weekly selector rejects oversized parties and reversed dates without navigating', async ({ page }) => {
  await visit(page, '?guests=16');
  await page.locator('[data-weekly-open]').click();
  await expect(page.locator('#weekly-guests')).toHaveValue('16');
  await expect(page.locator('[data-weekly-status]')).toContainText('up to 12');
  await expect(page.locator('[data-weekly-alternatives]')).toHaveAttribute('href', /guests=16/);
  await page.locator('#weekly-guests').selectOption('8');
  await page.locator('#weekly-arrive').fill('2026-12-08');
  await page.locator('#weekly-depart').fill('2026-12-01');
  await expect(page.locator('[data-weekly-status]')).toContainText('after arrival');
  await page.getByRole('button', { name: 'Continue to direct booking', exact: true }).click();
  await expect(page).toHaveURL(/week-long-vacation-rentals-florida/);
});

test('weekly no-JS fallback and FAQ preserve useful content', async ({ page, context }) => {
  await context.route('**/assets/js/stay-weekly.js', route => route.abort());
  await visit(page);
  await expect(page.locator('[data-weekly-open]')).toHaveAttribute('href', /https:\/\/book\.seascape-vacations\.com\/listings\/206016/);
  await expect(page.locator('#faq details')).toHaveCount(6);
  await page.locator('#faq summary').nth(1).click();
  await expect(page.locator('#faq details').nth(1)).toHaveAttribute('open', '');
});

test('weekly submit reaches only the intercepted listing with dates, party and lineage', async ({ page }) => {
  await visit(page, '?guests=10&utm_source=guide-test&utm_campaign=weekly-demo');
  await page.route('https://book.seascape-vacations.com/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Fixture listing only</h1>' }));
  await page.locator('[data-weekly-open]').click();
  await page.locator('#weekly-arrive').fill('2026-12-01');
  await page.getByRole('button', { name: 'Make it a week · 7 nights' }).click();
  const guideClick = new URL(await page.locator('[data-weekly-handoff]').getAttribute('href')).searchParams.get('sv_guide_click_id');
  expect(guideClick).toMatch(/^svg_[a-zA-Z_-]+$/);
  await page.getByRole('button', { name: 'Continue to direct booking', exact: true }).click();
  await expect(page).toHaveURL(/book\.seascape-vacations\.com\/listings\/206016/);
  const url = new URL(page.url());
  expect(url.searchParams.get('start')).toBe('2026-12-01');
  expect(url.searchParams.get('end')).toBe('2026-12-08');
  expect(url.searchParams.get('numberOfGuests')).toBe('10');
  expect(url.searchParams.get('utm_source')).toBe('guide-test');
  expect(url.searchParams.get('property_slug')).toBe('dockside-dreams');
  expect(url.searchParams.get('sv_guide_click_id')).toBe(guideClick);
});

test('weekly phone/tablet reflow and reduced motion stay bounded', async ({ page }) => {
  await visit(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.sv-photo')).toHaveCSS('transform', 'none');
  }
});

test('weekly booking preserves an incoming guide ID across edits and reopening', async ({ page }) => {
  await visit(page, '?guests=8&sv_guide_click_id=svg_incoming-safe');
  await page.locator('[data-weekly-open]').click();
  await page.locator('#weekly-arrive').fill('2026-12-01');
  await page.getByRole('button', { name: 'Make it a week · 7 nights' }).click();
  await page.locator('#weekly-guests').selectOption('9');
  expect(new URL(await page.locator('[data-weekly-handoff]').getAttribute('href')).searchParams.get('sv_guide_click_id')).toBe('svg_incoming-safe');
  await page.keyboard.press('Escape');
  await page.locator('[data-weekly-open]').click();
  expect(new URL(await page.locator('[data-weekly-handoff]').getAttribute('href')).searchParams.get('sv_guide_click_id')).toBe('svg_incoming-safe');
});

test('weekly photo and open booking sheet have no serious or critical axe violations', async ({ page }) => {
  const AxeBuilder = require('@axe-core/playwright').default;
  await visit(page, '?guests=10');
  for (const open of [false, true]) {
    if (open) await page.locator('[data-weekly-open]').click();
    const scan = await new AxeBuilder({ page }).analyze();
    expect(scan.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  }
  await expect(page.locator('[data-weekly-seven]')).toHaveCSS('min-height', '44px');
});

test('weekly no-JavaScript page still has a real listing link and native FAQ', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await registerStableNetwork(page);
  await page.goto(route, { waitUntil: 'networkidle' });
  await expect(page.locator('[data-weekly-open]')).toHaveAttribute('href', 'https://book.seascape-vacations.com/listings/206016');
  await page.locator('#faq summary').nth(1).click();
  await expect(page.locator('#faq details').nth(1)).toHaveAttribute('open', '');
  await context.close();
});
