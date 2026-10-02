const { test, expect } = require('@playwright/test');
const { registerStableNetwork } = require('./test-helpers');
const home = '/properties/dockside-dreams/';
const dates = 'arrive=2026-11-07&depart=2026-11-14';
const simulatedCheckout = { status: 200, contentType: 'text/html', body: '<h1>Simulated booking page navigation only</h1>' };

async function visit(page, query, stay) {
  await registerStableNetwork(page);
  if (stay) await page.route('**/.netlify/functions/booking-availability?**', stay);
  await page.clock.setFixedTime(new Date('2026-09-04T16:00:00Z'));
  await page.goto(home + (query ? '?' + query : ''), { waitUntil: 'networkidle' });
  // Only the destination page is simulated; nothing here reserves or pays.
  await page.route('https://book.seascape-vacations.com/**', route => route.fulfill(simulatedCheckout));
}
function answer(stay) {
  return route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, homes: [{ slug: 'dockside-dreams', ...stay }] }) });
}
const controls = page => page.locator('[data-booking-action]');
const anchors = page => page.locator('a[data-booking-action]');
const status = page => page.locator('.g-form-status');
const hrefs = locator => locator.evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));

test('with no dates every booking button asks for dates', async ({ page }) => {
  await visit(page, '');
  await expect(controls(page)).toHaveText(['Check dates', 'Check dates', 'Check dates']);
  expect(await hrefs(anchors(page))).toEqual(['#booking', '#booking']);
  await expect(page.locator('.g-booking-direct')).toHaveCount(0);
  await page.getByRole('button', { name: 'Check dates', exact: true }).click();
  await expect(status(page)).toHaveText('Choose your arrival and departure dates.');
  await expect(page.getByLabel('Arrival', { exact: true })).toBeFocused();
  await expect(page).toHaveURL(/properties\/dockside-dreams/);
});

test('open dates turn every booking button into the priced checkout in the same tab', async ({ page, context }, testInfo) => {
  const events = [];
  const checks = [];
  await page.exposeFunction('__recordOutbound', event => { events.push(event); });
  page.on('request', request => { if (request.url().includes('/booking-availability')) checks.push(request.url()); });
  await visit(page, dates + '&guests=6');
  await expect(controls(page)).toHaveText(['Book these dates', 'Book these dates', 'Book these dates']);
  await expect(status(page)).toHaveText('These dates are open. You’ll see the full price on the next screen, before you pay.');
  await page.getByLabel('Guests', { exact: true }).selectOption('8');
  await expect(page.locator('[data-property-checkout]')).toHaveAttribute('href', /numberOfGuests=8/);
  // A changed group size reuses the answer already given for the same dates.
  expect(checks).toHaveLength(1);

  const links = await page.locator('a[data-booking-action], [data-property-checkout]').evaluateAll(nodes => nodes.map(node => ({ href: node.href, target: node.getAttribute('target'), event: node.dataset.trackEvent })));
  expect(links).toHaveLength(3);
  for (const link of links) {
    const url = new URL(link.href);
    expect(url.origin + url.pathname, link.href).toBe('https://book.seascape-vacations.com/checkout/206016');
    expect(url.searchParams.get('start')).toBe('2026-11-07');
    expect(url.searchParams.get('end')).toBe('2026-11-14');
    expect(url.searchParams.get('numberOfGuests')).toBe('8');
    expect(url.searchParams.get('listing_id')).toBe('206016');
    expect(url.searchParams.get('property_slug')).toBe('dockside-dreams');
    expect(link.target).toBeNull();
    expect(link.event).toBe('property_booking_page_click');
  }
  // Each control reports its own handoff, so a click can be told apart by placement.
  expect(new Set(links.map(link => new URL(link.href).searchParams.get('sv_handoff_id'))).size).toBe(3);
  // The panel button hands off through the checkout link, so it reports no click of its own.
  await expect(page.locator('button[data-booking-action]')).not.toHaveAttribute('data-track-event', /./);

  // A phone shows the booking button in the bottom bar only; a desktop shows it beside the heading.
  const phone = testInfo.project.name.includes('mobile');
  const heading = page.locator('.g-property-actions a[data-booking-action]');
  const bar = page.locator('.g-mobile-booking a[data-booking-action]');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(phone ? bar : heading).toBeVisible();
  await expect(phone ? heading : bar).toBeHidden();

  await page.evaluate(() => { window.seascapeTrackEvent = (name, payload) => window.__recordOutbound({ name, payload }); });
  const shown = phone ? bar : heading;
  const href = await shown.getAttribute('href');
  await shown.click();
  await page.waitForURL(/book\.seascape-vacations\.com\/checkout\/206016/);
  // The click handler may reorder the fields; the destination and every value must match the link.
  const fields = address => [...new URL(address).searchParams.entries()].sort().join('&');
  expect(new URL(page.url()).pathname).toBe('/checkout/206016');
  expect(fields(page.url())).toBe(fields(href));
  expect(context.pages()).toHaveLength(1);
  const event = events.find(item => item.name === 'property_booking_page_click');
  expect(event.payload.placement).toBe(phone ? 'property_mobile_booking' : 'property_heading');
  expect(event.payload.page_slug).toBe('dockside-dreams');
  expect(event.payload.booking_handoff_id).toBe(new URL(href).searchParams.get('sv_handoff_id'));
});

test('open dates without a group size ask for the group before the checkout', async ({ page }) => {
  await visit(page, dates);
  await expect(controls(page)).toHaveText(['Book these dates', 'Book these dates', 'Book these dates']);
  await expect(status(page)).toHaveText('These dates are open. Choose your group size to book them.');
  expect(await hrefs(anchors(page))).toEqual(['#booking', '#booking']);
  await page.getByRole('button', { name: 'Book these dates', exact: true }).click();
  await expect(page.getByLabel('Guests', { exact: true })).toBeFocused();
  await expect(page).toHaveURL(/properties\/dockside-dreams/);
});

test('booked dates send every booking button to the other homes with the trip kept', async ({ page }) => {
  await visit(page, dates + '&guests=6', answer({ bookable: false, reason: 'booked', minimumStay: 2 }));
  await expect(controls(page)).toHaveText(['See open homes', 'See open homes', 'See open homes']);
  await expect(status(page)).toHaveText('These dates are booked. Choose different dates or compare the other homes.');
  const openHomes = '/properties/?arrive=2026-11-07&depart=2026-11-14&guests=6';
  expect(await hrefs(anchors(page))).toEqual([openHomes, openHomes]);
  // Leaving for our own catalog is not a booking click and not a new dates check.
  await expect(page.locator('[data-booking-action][data-track-event]')).toHaveCount(0);
  await page.getByRole('button', { name: 'See open homes', exact: true }).click();
  await page.waitForURL(/\/properties\/\?/);
  const url = new URL(page.url());
  expect(url.pathname + url.search).toBe(openHomes);
});

test('a stay rule keeps the guest choosing dates on this home', async ({ page }) => {
  await visit(page, dates + '&guests=6', answer({ bookable: false, reason: 'minimum-stay', minimumStay: 9 }));
  await expect(status(page)).toHaveText('This home needs 9 nights. Choose a longer stay or compare the other homes.');
  await expect(controls(page)).toHaveText(['Check dates', 'Check dates', 'Check dates']);
  expect(await hrefs(anchors(page))).toEqual(['#booking', '#booking']);
  await page.getByRole('button', { name: 'Check dates', exact: true }).click();
  await expect(page.getByLabel('Arrival', { exact: true })).toBeFocused();
  await expect(page).toHaveURL(/properties\/dockside-dreams/);
});

for (const [name, stay] of [
  ['a failed dates check', route => route.abort()],
  ['a calendar that could not be read', answer({ bookable: false, reason: 'no-calendar', minimumStay: null })]
]) test(name + ' falls back to the listing page in the same tab', async ({ page, context }) => {
  await visit(page, dates + '&guests=6', stay);
  await expect(status(page)).toHaveText('Availability could not be checked. Confirm it on the booking page.');
  await expect(controls(page)).toHaveText(['Check dates', 'Check dates', 'Check dates']);
  const links = await page.locator('a[data-booking-action], [data-property-checkout]').evaluateAll(nodes => nodes.map(node => ({ href: node.href, target: node.getAttribute('target') })));
  expect(links).toHaveLength(3);
  for (const link of links) {
    const url = new URL(link.href);
    expect(url.origin + url.pathname, link.href).toBe('https://book.seascape-vacations.com/listings/206016');
    expect(url.searchParams.get('start')).toBe('2026-11-07');
    expect(url.searchParams.get('end')).toBe('2026-11-14');
    expect(url.searchParams.get('numberOfGuests')).toBe('6');
    expect(link.target).toBeNull();
  }
  await page.getByRole('button', { name: 'Check dates', exact: true }).click();
  await page.waitForURL(/book\.seascape-vacations\.com\/listings\/206016/);
  expect(context.pages()).toHaveLength(1);
});
