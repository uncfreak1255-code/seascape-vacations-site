const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { registerStableNetwork } = require('./test-helpers');

test.beforeEach(async ({ page }) => {
  await registerStableNetwork(page);
  await page.clock.setFixedTime(new Date('2026-10-22T16:00:00Z'));
});

async function expectResults(page) {
  await expect(page.locator('#catalog-heading')).toBeFocused();
  await expect(page.locator('#catalog-count')).toBeInViewport();
  await expect(page.locator('.catalog-card:visible').first()).toBeInViewport();
}

test('explicit homepage and catalog searches reveal results without moving passive edits', async ({ page }, testInfo) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('#home-trip-arrive').fill('2026-12-01');
  await page.locator('#home-trip-depart').fill('2026-12-08');
  await page.locator('#home-trip-guests').selectOption('12');
  await page.getByRole('button', { name: 'Find my home', exact: true }).click();
  await expect(page).toHaveURL(/\/properties\//);
  await expect(page.locator('#catalog-count')).toContainText('homes are open');
  await expectResults(page);
  await page.screenshot({ path: testInfo.outputPath('search-results.png'), scale: 'css' });
  await page.locator('#trip-guests').focus();
  await page.locator('#trip-guests').selectOption('8');
  await expect(page.locator('#trip-guests')).toBeFocused();
  await page.getByRole('button', { name: 'Find my home', exact: true }).click();
  await expectResults(page);
  // Repeating a search at the same fragment must still return to the results.
  await page.locator('#trip-arrive').fill('2026-12-02');
  await page.getByRole('button', { name: 'Find my home', exact: true }).click();
  await expectResults(page);
  await page.goto('/properties/?arrive=2026-12-01&depart=2026-12-08&guests=12', { waitUntil: 'networkidle' });
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.locator('#trip-depart').fill('2026-11-30');
  await page.getByRole('button', { name: 'Find my home', exact: true }).click();
  await expect(page.locator('#trip-depart')).toBeFocused();
});

for (const outcome of ['empty', 'failed']) {
  test(`explicit search reveals the ${outcome} availability result`, async ({ page }) => {
    await page.route('**/.netlify/functions/booking-availability**', route => route.fulfill({
      status: outcome === 'failed' ? 503 : 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, homes: ['dockside-dreams', 'the-oasis', 'sarasota-luxe', 'river-house', 'bradenton-pool-home', 'blue-house', 'coastal-stay'].map(slug => ({ slug, bookable: false, reason: 'booked' })) })
    }));
    await page.goto('/properties/');
    await page.locator('#trip-arrive').fill('2026-12-01');
    await page.locator('#trip-depart').fill('2026-12-08');
    await page.getByRole('button', { name: 'Find my home', exact: true }).click();
    await expect(page.locator('#catalog-heading')).toBeFocused();
    await expect(page.locator('#catalog-count')).toBeInViewport();
    await expect(page.locator('#catalog-count')).toContainText(outcome === 'empty' ? 'No home is open' : 'Availability could not be checked');
    if (outcome === 'empty') await expect(page.locator('#catalog-empty')).toBeInViewport();
  });
}

test('comparison keeps close and home names visible while scrolling both axes', async ({ page }, testInfo) => {
  await page.goto('/properties/?compare=dockside-dreams,the-oasis,sarasota-luxe', { waitUntil: 'networkidle' });
  await page.locator('#open-comparison').click();
  const dialog = page.locator('#catalog-comparison');
  const scroll = page.locator('.catalog-comparison-scroll');
  await scroll.evaluate(node => {
    node.scrollTop = node.scrollHeight; node.scrollLeft = node.scrollWidth;
    if (node.scrollHeight <= node.clientHeight + 1) { const dialog = node.closest("dialog"); dialog.scrollTop = dialog.scrollHeight; }
  });
  await expect(page.locator('#close-comparison')).toBeInViewport({ ratio: 1 });
  const names = page.locator('thead th[data-compare-column]:visible');
  for (const heading of await names.all()) {
    const box = await heading.boundingBox();
    const tableBox = await scroll.boundingBox();
    expect(box.y).toBeGreaterThanOrEqual(tableBox.y - 1);
    expect(box.y + box.height).toBeLessThanOrEqual(tableBox.y + tableBox.height);
  }
  await expect(page.getByRole('link', { name: 'Sarasota Luxe', exact: true })).toBeInViewport();
  const scan = await new AxeBuilder({ page }).include('#catalog-comparison').analyze();
  expect(scan.violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('comparison-scrolled.png'), scale: 'css' });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('#open-comparison')).toBeFocused();
  await page.locator('#open-comparison').click();
  await page.locator('#close-comparison').click();
  await expect(dialog).not.toBeVisible();
});

test('property facts precede photos and booking on desktop and mobile', async ({ page }, testInfo) => {
  for (const slug of ['dockside-dreams', 'the-oasis', 'sarasota-luxe']) {
    await page.goto(`/properties/${slug}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const facts = page.locator('.g-property-specs');
    await expect(facts).toBeInViewport({ ratio: 1 });
    const box = await facts.boundingBox();
    const photo = await page.locator('.g-gallery').boundingBox();
    expect(box.y + box.height).toBeLessThanOrEqual(photo.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (slug === 'dockside-dreams') await page.screenshot({ path: testInfo.outputPath('property-facts.png'), scale: 'css' });
  }
});

test('comparison leaves room for its table on a short landscape screen', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/properties/?compare=dockside-dreams,the-oasis,sarasota-luxe', { waitUntil: 'networkidle' });
  await page.locator('#open-comparison').click();
  const scroll = page.locator('.catalog-comparison-scroll');
  expect((await scroll.boundingBox()).height).toBeGreaterThan(120);
  await scroll.evaluate(node => { node.scrollTop = node.scrollHeight; });
  await expect(page.locator('#close-comparison')).toBeInViewport({ ratio: 1 });
  await expect(page.locator('#share-comparison')).toBeInViewport({ ratio: 1 });
});
