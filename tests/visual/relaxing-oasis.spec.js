const { test, expect } = require('@playwright/test');

test('Relaxing Oasis uses verified facts, exact photos and its own booking identity', async ({ page }) => {
  await page.goto('/properties/relaxing-oasis/');
  await expect(page.getByRole('heading', { name: 'Relaxing Oasis', exact: true })).toBeVisible();
  await expect(page.locator('.g-property-heading')).toContainText('11');
  await expect(page.locator('.g-property-specs')).toContainText('5 bedrooms');
  await expect(page.locator('.g-property-specs')).toContainText('4 bathrooms');
  await expect(page.locator('#overview')).toContainText('private heated above-ground pool');
  await expect(page.locator('#sleeping')).not.toContainText('Confirm the sleeping arrangements');
  const rooms = page.locator('#sleeping .g-sleeping-list li');
  await expect(rooms).toHaveCount(5);
  await expect(rooms.nth(0)).toContainText('King bed');
  await expect(rooms.nth(1)).toContainText('King bed');
  await expect(rooms.nth(2)).toContainText('shares a bathroom with the bunk room');
  await expect(rooms.nth(3)).toContainText('Two twin-over-twin bunk beds');
  await expect(rooms.nth(3)).toContainText('shares a bathroom with the queen room');
  await expect(rooms.nth(4)).toContainText('Detached suite');
  await expect(rooms.nth(4)).toContainText('Twin daybed');
  for (const i of [0, 1, 4]) await expect(rooms.nth(i)).toContainText('private bathroom');
  await expect(page.locator('#reviews')).toHaveCount(0);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /5 bedrooms/);
  expect(await page.locator('script[type="application/ld+json"]').allTextContents()).not.toEqual(expect.arrayContaining([expect.stringMatching(/numberOfBedrooms|numberOfBathroomsTotal/)]));
  await expect(page.locator('.g-gallery img').first()).toHaveAttribute('src', /\/images\/homes\/relaxing-oasis\//);
  await expect.poll(() => page.locator('.g-gallery img').first().evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
  const form = page.locator('[data-guest-trip-form]');
  await expect(form).toHaveAttribute('data-booking-url', 'https://book.seascape-vacations.com/listings/607228');
  await expect(form).toHaveAttribute('data-max-guests', '11');
  await page.getByRole('button', { name: /View all \d+ photos/ }).click();
  await expect(page.getByRole('dialog', { name: 'Relaxing Oasis photo gallery' })).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  for (const width of [360, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('Relaxing Oasis booking handoff preserves trip without submitting a reservation', async ({ page }) => {
  await page.route('**/.netlify/functions/booking-availability?*', route => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('/properties/relaxing-oasis/?arrive=2027-06-08&depart=2027-06-12&guests=6');
  const link = page.locator('[data-property-checkout]');
  await expect(link).toHaveAttribute('href', /\/listings\/607228\?/);
  await expect(async () => {
    const url = new URL(await link.getAttribute('href'));
    expect(url.searchParams.get('start')).toBe('2027-06-08');
    expect(url.searchParams.get('end')).toBe('2027-06-12');
    expect(url.searchParams.get('numberOfGuests')).toBe('6');
  }).toPass();
});

test('Relaxing Oasis can be discovered on the homepage and filtered and compared in the catalog', async ({ page }) => {
  await page.route('**/.netlify/functions/booking-availability?*', route => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('/');
  const postcard = page.locator('.g-postcard').filter({ hasText: 'Relaxing Oasis' });
  await expect(postcard).toHaveCount(1);
  await expect(postcard.locator('a')).toHaveAttribute('href', '/properties/relaxing-oasis/');
  await expect(postcard.locator('img')).toHaveAttribute('src', '/images/homes/relaxing-oasis/01.webp');
  await page.getByRole('button', { name: 'Preview Relaxing Oasis', exact: true }).click();
  await expect(page.locator('#scene-relaxing-oasis')).toBeVisible();
  await expect.poll(() => page.locator('#scene-relaxing-oasis img').evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/properties/');
  const card = page.locator('.catalog-card[data-property="relaxing-oasis"]');
  await expect(card).toContainText('5 bedrooms');
  await expect(card).toContainText('4 baths');
  await expect(card).toContainText('Up to 11 guests');
  await expect(card.locator('img')).toHaveAttribute('src', '/images/homes/relaxing-oasis/01.webp');
  await card.scrollIntoViewIfNeeded();
  await expect.poll(() => card.locator('img').evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
  await expect(card.getByRole('link', { name: 'Check dates for Relaxing Oasis', exact: true })).toHaveAttribute('href', /\/listings\/607228(?:\?|$)/);
  for (const filter of ['waterfront', 'pet-friendly', 'sarasota']) {
    await page.locator(`[data-filter="${filter}"]`).click();
    await expect(card).toBeHidden();
  }
  await page.locator('[data-filter="bradenton"]').click();
  await expect(card).toBeVisible();
  await page.getByRole('button', { name: 'Compare Relaxing Oasis', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Compare Relaxing Oasis', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/properties/?compare=relaxing-oasis,the-oasis');
  await page.locator('#open-comparison').click();
  await expect(page.locator('td[data-compare-column="relaxing-oasis"]').filter({ hasText: /^5 \/ 4$/ })).toBeVisible();
  await page.goto('/properties/?guests=12');
  await expect(card).toBeHidden();
  await page.goto('/properties/?guests=11');
  await expect(card).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
