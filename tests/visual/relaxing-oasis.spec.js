const { test, expect } = require('@playwright/test');

test('Relaxing Oasis uses verified facts, exact photos and its own booking identity', async ({ page }) => {
  await page.goto('/properties/relaxing-oasis/');
  await expect(page.getByRole('heading', { name: 'Relaxing Oasis', exact: true })).toBeVisible();
  await expect(page.locator('.g-property-heading')).toContainText('11');
  await expect(page.locator('.g-property-specs')).not.toContainText(/bedrooms|bathrooms/);
  await expect(page.locator('#overview')).toContainText('private heated above-ground pool');
  await expect(page.locator('#sleeping')).toContainText('Confirm the sleeping arrangements');
  await expect(page.locator('#reviews')).toHaveCount(0);
  await expect(page.locator('meta[name="description"]')).not.toHaveAttribute('content', /\d+ bedrooms|\d+ bathrooms/);
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
