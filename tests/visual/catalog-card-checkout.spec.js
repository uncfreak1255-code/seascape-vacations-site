const { test, expect } = require('@playwright/test');
const { registerStableNetwork } = require('./test-helpers');
const dates = 'arrive=2026-11-07&depart=2026-11-14';
const listingIds = { 'dockside-dreams': '206016', 'the-oasis': '189511', 'sarasota-luxe': '135881', 'river-house': '135880', 'bradenton-pool-home': '487798', 'blue-house': '589288' };
const open = ['dockside-dreams', 'sarasota-luxe', 'bradenton-pool-home'];
const simulatedCheckout = { status: 200, contentType: 'text/html', body: '<h1>Simulated booking page navigation only</h1>' };

// Three homes open, three booked, unless a test supplies its own answer.
const answer = route => route.fulfill({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({ ok: true, homes: Object.keys(listingIds).map(slug => ({ slug, bookable: open.includes(slug), reason: open.includes(slug) ? null : 'booked', minimumStay: 2 })) })
});

async function visit(page, query, stay = answer) {
  await registerStableNetwork(page);
  await page.route('**/.netlify/functions/booking-availability?**', stay);
  await page.clock.setFixedTime(new Date('2026-09-04T16:00:00Z'));
  await page.goto('/properties/' + (query ? '?' + query : ''), { waitUntil: 'networkidle' });
  // Only the destination page is simulated; nothing here reserves or pays.
  await page.route('https://book.seascape-vacations.com/**', route => route.fulfill(simulatedCheckout));
}
const cardButtons = page => page.locator('.catalog-card:not([hidden]) .catalog-check-dates');
const count = page => page.locator('#catalog-count');
const status = page => page.locator('#trip-status');
const links = locator => locator.evaluateAll(nodes => nodes.map(node => ({
  href: node.href, raw: node.getAttribute('href'), target: node.getAttribute('target'), slug: node.dataset.pageSlug,
  label: node.getAttribute('aria-label'), text: node.textContent, event: node.getAttribute('data-track-event')
})));

test('open dates with a group size send every open card to the priced checkout in the same tab', async ({ page, context }) => {
  const events = [];
  await page.exposeFunction('__recordOutbound', event => { events.push(event); });
  await visit(page, dates + '&guests=6&compare=dockside-dreams,sarasota-luxe,the-oasis');
  await expect(count(page)).toHaveText('3 homes are open for these dates. You’ll see the full price before you pay.');
  await expect(cardButtons(page)).toHaveText(['Book these dates', 'Book these dates', 'Book these dates']);

  const cards = await links(cardButtons(page));
  expect(cards.map(link => link.slug).sort()).toEqual([...open].sort());
  for (const link of cards) {
    const url = new URL(link.href);
    expect(url.origin + url.pathname, link.href).toBe('https://book.seascape-vacations.com/checkout/' + listingIds[link.slug]);
    expect(url.searchParams.get('start')).toBe('2026-11-07');
    expect(url.searchParams.get('end')).toBe('2026-11-14');
    expect(url.searchParams.get('numberOfGuests')).toBe('6');
    expect(url.searchParams.get('listing_id')).toBe(listingIds[link.slug]);
    expect(url.searchParams.get('property_slug')).toBe(link.slug);
    expect(url.searchParams.get('sv_handoff_id')).toBeTruthy();
    expect(link.target).toBeNull();
    expect(link.event).toBe('catalog_book_direct_click');
    expect(link.label).toMatch(/^Book these dates for \S/);
  }

  // The comparison keeps only the open homes and its buttons match the cards.
  await page.locator('#open-comparison').click();
  await expect(page.locator('#comparison-trip')).toHaveText('Nov 7, 2026 – Nov 14, 2026 · 6 guests · These dates are open.');
  const compared = await links(page.locator('#catalog-comparison td:not([hidden]) a[data-booking-base]'));
  expect(compared.map(link => link.slug)).toEqual(['dockside-dreams', 'sarasota-luxe']);
  for (const link of compared) {
    expect(new URL(link.href).pathname).toBe('/checkout/' + listingIds[link.slug]);
    expect(link.text).toBe('Book these dates');
    expect(link.target).toBeNull();
  }
  await page.locator('#close-comparison').click();

  await page.evaluate(() => { window.seascapeTrackEvent = (name, payload) => window.__recordOutbound({ name, payload }); });
  const button = page.locator('.catalog-card[data-property="dockside-dreams"] .catalog-check-dates');
  const href = await button.getAttribute('href');
  await button.click();
  await page.waitForURL(/book\.seascape-vacations\.com\/checkout\/206016/);
  // The click handler may reorder the fields; the destination and every value must match the link.
  const fields = address => [...new URL(address).searchParams.entries()].sort().join('&');
  expect(new URL(page.url()).pathname).toBe('/checkout/206016');
  expect(fields(page.url())).toBe(fields(href));
  expect(context.pages()).toHaveLength(1);
  const click = events.find(item => item.name === 'catalog_book_direct_click');
  expect(click.payload.placement).toBe('catalog_card');
  expect(click.payload.page_slug).toBe('dockside-dreams');
  expect(click.payload.booking_handoff_id).toBe(new URL(href).searchParams.get('sv_handoff_id'));
  expect(events.some(item => item.name === 'booking_engine_handoff')).toBe(true);
});

test('open dates without a group size ask for the group, then book', async ({ page }) => {
  const events = [];
  await page.exposeFunction('__recordOutbound', event => { events.push(event); });
  await visit(page, dates);
  await expect(count(page)).toHaveText('3 homes are open for these dates. Choose your group size to book.');
  await expect(cardButtons(page)).toHaveText(['Book these dates', 'Book these dates', 'Book these dates']);
  for (const link of await links(cardButtons(page))) {
    expect(link.raw).toBe('#trip-guests');
    expect(link.event).toBeNull();
  }

  await page.evaluate(() => { window.seascapeTrackEvent = (name, payload) => window.__recordOutbound({ name, payload }); });
  await cardButtons(page).first().click();
  await expect(page.locator('#trip-guests')).toBeFocused();
  await expect(status(page)).toHaveText('These dates are open. Choose your group size to book them.');
  await expect(page).toHaveURL(/\/properties\/\?/);
  // Asking for the group size is not a booking click.
  expect(events.filter(item => /book_direct|booking_engine/.test(item.name))).toEqual([]);

  // The group size just asked for applies at once.
  await page.locator('#trip-guests').selectOption('6');
  await expect(count(page)).toHaveText('3 homes are open for these dates. You’ll see the full price before you pay.');
  for (const link of await links(cardButtons(page))) {
    const url = new URL(link.href);
    expect(url.pathname).toBe('/checkout/' + listingIds[link.slug]);
    expect(url.searchParams.get('numberOfGuests')).toBe('6');
    expect(link.event).toBe('catalog_book_direct_click');
  }
});

test('a group size chosen while dates are open applies at once, every time it changes', async ({ page }) => {
  await visit(page, dates);
  await expect(cardButtons(page)).toHaveText(['Book these dates', 'Book these dates', 'Book these dates']);
  for (const size of ['6', '4']) {
    await page.locator('#trip-guests').selectOption(size);
    await expect(count(page)).toHaveText('3 homes are open for these dates. You’ll see the full price before you pay.');
    for (const link of await links(cardButtons(page))) {
      expect(new URL(link.href).pathname).toBe('/checkout/' + listingIds[link.slug]);
      expect(new URL(link.href).searchParams.get('numberOfGuests')).toBe(size);
    }
  }
});

test('dates edited but not searched again take the booking buttons back to "Check dates"', async ({ page }) => {
  await visit(page, dates + '&guests=6&compare=dockside-dreams,sarasota-luxe');
  await expect(cardButtons(page)).toHaveText(['Book these dates', 'Book these dates', 'Book these dates']);
  await page.locator('#trip-depart').fill('2026-11-16');
  // No card may open checkout for the earlier dates while the form shows different ones.
  for (const link of await links(cardButtons(page))) {
    expect(new URL(link.href).pathname).toBe('/listings/' + listingIds[link.slug]);
    expect(link.text).toBe('Check dates');
    expect(link.target).toBe('_blank');
  }
  await page.locator('#open-comparison').click();
  await expect(page.locator('#comparison-trip')).toContainText('Dates and prices need confirmation.');
  for (const link of await links(page.locator('#catalog-comparison td:not([hidden]) a[data-booking-base]'))) {
    expect(new URL(link.href).pathname).toBe('/listings/' + listingIds[link.slug]);
    expect(link.text).toBe('Check dates');
  }
  await page.locator('#close-comparison').click();

  // Searching again with the new dates books the new dates.
  await page.locator('#catalog-trip-form [type="submit"]').click();
  await expect(cardButtons(page)).toHaveText(['Book these dates', 'Book these dates', 'Book these dates']);
  for (const link of await links(cardButtons(page))) {
    expect(new URL(link.href).pathname).toBe('/checkout/' + listingIds[link.slug]);
    expect(new URL(link.href).searchParams.get('end')).toBe('2026-11-16');
  }
});

test('with no group size, an unsearched date edit does not ask for the group size', async ({ page }) => {
  await visit(page, dates);
  await page.locator('#trip-depart').fill('2026-11-16');
  expect((await links(cardButtons(page))).map(link => link.raw.includes('/listings/'))).toEqual([true, true, true]);
});

test('a failed dates check keeps every card on its listing page in a new tab', async ({ page }) => {
  await visit(page, dates + '&guests=6', route => route.abort());
  await expect(count(page)).toContainText('Availability could not be checked.');
  const cards = await links(cardButtons(page));
  expect(cards).toHaveLength(6);
  for (const link of cards) {
    const url = new URL(link.href);
    expect(url.origin + url.pathname, link.href).toBe('https://book.seascape-vacations.com/listings/' + listingIds[link.slug]);
    expect(url.searchParams.get('start')).toBe('2026-11-07');
    expect(url.searchParams.get('numberOfGuests')).toBe('6');
    expect(link.text).toBe('Check dates');
    expect(link.target).toBe('_blank');
    expect(link.label).toMatch(/^Check dates for \S/);
  }
});

test('flexible dates keep "Check dates", and clearing open dates puts it back', async ({ page }) => {
  await visit(page, 'guests=6');
  const flexible = await links(cardButtons(page));
  expect(flexible.length).toBeGreaterThan(0);
  for (const link of flexible) {
    expect(new URL(link.href).pathname).toBe('/listings/' + listingIds[link.slug]);
    expect(link.text).toBe('Check dates');
    expect(link.target).toBe('_blank');
  }

  await page.goto('/properties/?' + dates + '&guests=6', { waitUntil: 'networkidle' });
  await expect(cardButtons(page)).toHaveText(['Book these dates', 'Book these dates', 'Book these dates']);
  await page.locator('#clear-dates').click();
  const cleared = await links(cardButtons(page));
  expect(cleared.length).toBeGreaterThan(3);
  for (const link of cleared) {
    expect(new URL(link.href).pathname).toBe('/listings/' + listingIds[link.slug]);
    expect(link.text).toBe('Check dates');
    expect(link.target).toBe('_blank');
    expect(link.event).toBe('catalog_book_direct_click');
  }
});
