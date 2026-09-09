const { test, expect } = require('@playwright/test');
const { registerStableNetwork } = require('./test-helpers');
const trip = 'arrive=2026-12-05&depart=2026-12-12&guests=8';

async function visit(page, route) {
  await registerStableNetwork(page);
  await page.clock.setFixedTime(new Date('2026-09-07T16:00:00Z'));
  await page.goto(route + (route.includes('?') ? '&' : '?') + 'visual-test=1', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(window.SeascapeConversionTracking));
}
function expectTrip(href, booking = false) {
  const url = new URL(href, 'https://seascape-vacations.com');
  expect(url.searchParams.get(booking ? 'start' : 'arrive')).toBe('2026-12-05');
  expect(url.searchParams.get(booking ? 'end' : 'depart')).toBe('2026-12-12');
  expect(url.searchParams.get(booking ? 'numberOfGuests' : 'guests')).toBe('8');
}

test('returning home restores dates and a non-default group before searching again', async ({ page }) => {
  await visit(page, '/properties/?' + trip.replace('guests=8', 'guests=6'));
  // Use an existing homepage link, as a guest returning through site navigation does.
  const href = await page.locator('a[href]').evaluateAll(nodes => nodes.map(n => n.href).find(href => new URL(href).pathname === '/'));
  expect(href).toBeTruthy();
  await page.goto(href);
  const fields = page.locator('.hero-booking-field');
  await expect(fields.nth(1)).toContainText('Dec 5');
  await expect(fields.nth(2)).toContainText('Dec 12');
  await expect(fields.nth(3)).toContainText('6 guests');
  await page.locator('.hero-booking-cta').click();
  await expect(page).toHaveURL(/\/properties\//);
  const url = new URL(page.url());
  expect(url.searchParams.get('arrive')).toBe('2026-12-05');
  expect(url.searchParams.get('depart')).toBe('2026-12-12');
  expect(url.searchParams.get('guests')).toBe('6');
});

test('existing homepage search carries the trip through catalog and property checkout', async ({ page }) => {
  await visit(page, '/');
  const fields = page.locator('.hero-booking-field');
  await fields.nth(1).click();
  await page.locator('.hero-booking-popover input[type=date]').fill('2026-12-05');
  await fields.nth(2).click();
  await page.locator('.hero-booking-popover input[type=date]').fill('2026-12-12');
  await page.locator('.hero-booking-cta').click();
  await expect(page).toHaveURL(/\/properties\//);
  expectTrip(page.url());
  const detail = page.locator('a[aria-label="View Dockside Dreams details"]').first();
  expectTrip(await detail.getAttribute('href'));
  await detail.click();
  await expect(page).toHaveURL(/\/properties\/dockside-dreams\//);
  const checkout = page.locator('a[data-track-event="property_booking_page_click"]:visible').first();
  await expect(checkout).toHaveAttribute('href', /numberOfGuests=8/);
  expectTrip(await checkout.getAttribute('href'), true);
  await page.goBack();
  expectTrip(page.url());
});

test('guide to stay to property retains the trip and GA4 outbound lineage agrees with checkout', async ({ page }) => {
  await visit(page, '/guides/bradenton-vs-sarasota/?' + trip);
  const stay = page.locator('a[data-track-event="guide_stay_click"]').first();
  expectTrip(await stay.getAttribute('href'));
  await stay.click();
  await expect(page).toHaveURL(/\/stays\//);
  expectTrip(page.url());
  const detail = page.locator('a[data-track-event="stay_view_property_click"]').first();
  expectTrip(await detail.getAttribute('href'));
  await detail.click();
  await expect(page).toHaveURL(/\/properties\/[^/]+\//);
  expectTrip(page.url());
  const checkout = page.locator('a[data-track-event="property_booking_page_click"]:visible').first();
  const href = await checkout.getAttribute('href');
  expectTrip(href, true);
  const outbound = new URL(href);
  // Observe the real outbound click/GA4 path without submitting anything to Hostaway.
  await page.evaluate(() => {
    window.__tripContinuityEvents = [];
    window.seascapeTrackEvent = (name, payload) => window.__tripContinuityEvents.push({ name, payload });
  });
  await checkout.evaluate(node => node.addEventListener('click', event => event.preventDefault()));
  await checkout.click();
  const event = await page.evaluate(() => window.__tripContinuityEvents.find(item => item.name === 'property_booking_page_click'));
  expect(event.payload.booking_handoff_id).toBe(outbound.searchParams.get('sv_handoff_id'));
  expect(event.payload.booking_session_id).toBe(outbound.searchParams.get('sv_session_id'));
});

test('catalog direct links retain requested dates and capacity filtering', async ({ page }) => {
  await visit(page, '/properties/?' + trip);
  const links = page.locator('.catalog-card:visible a[data-track-event="catalog_book_direct_click"]');
  for (const href of await links.evaluateAll(nodes => nodes.map(n => n.href))) expectTrip(href, true);
  await page.goto('/properties/?' + trip.replace('guests=8', 'guests=17') + '&visual-test=1');
  await expect(page.locator('.catalog-card:visible')).toHaveCount(0);
  await expect(page.locator('#catalog-empty')).toBeVisible();
});

test('invalid date and guest queries do not reach the booking page', async ({ page }) => {
  await visit(page, '/properties/?arrive=2026-12-12&depart=2026-12-05&guests=8oops');
  const urls = await page.locator('a[data-track-event="catalog_book_direct_click"]').evaluateAll(nodes => nodes.map(n => n.href));
  for (const href of urls) {
    const url = new URL(href);
    expect(url.searchParams.has('numberOfGuests')).toBe(false);
    expect(url.searchParams.get('start')).not.toBe('2026-12-12');
    expect(url.searchParams.get('end')).not.toBe('2026-12-05');
  }
});
