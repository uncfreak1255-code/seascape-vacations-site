const { test, expect } = require('@playwright/test');
const { registerStableNetwork } = require('./test-helpers');
const { applyStayFacts } = require('../../src/_data/stayFacts');
const source = applyStayFacts(require('../../src/_data/seoPages.json').vacationer.find(p => p.slug === 'family-vacation-rentals-anna-maria-island'), require('../../src/_data/properties-fallback.json'));
const route = '/stays/' + source.slug + '/';
const homes = ['bradenton-pool-home', 'the-oasis', 'dockside-dreams', 'river-house'];

test('family guide keeps its answer before trip controls and full article after the four homes', async ({ page }) => {
  await registerStableNetwork(page);
  await page.goto(route);
  await expect(page.locator('#catalog-trip-form')).toBeVisible();
  await expect(page.locator('.flow-guide-answer')).toHaveText(source.intro);
  expect(await page.locator('.catalog-card').evaluateAll(nodes => nodes.map(n => n.dataset.property))).toEqual(homes);
  expect(await page.evaluate(() => {
    const before = (a,b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    return before(document.querySelector('.flow-guide-answer'), document.querySelector('#catalog-trip-form')) && before(document.querySelector('#catalog-grid'), document.querySelector('.intro-copy'));
  })).toBe(true);
  const expected = await page.evaluate(html => [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('p')].map(p => p.textContent), source.geoIntro);
  await expect(page.locator('.intro-copy p')).toHaveText(expected);
  await expect(page.locator('.faq-item')).toHaveCount(source.faqs.length);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://seascape-vacations.com' + route);
  await expect(page.locator('.flow-guide-answer')).toHaveCount(1);
});

test('family guide carries the trip to Dockside and compares only its four homes', async ({ page }) => {
  await registerStableNetwork(page);
  await page.clock.setFixedTime(new Date('2026-11-02T17:00:00Z'));
  await page.goto(route);
  await page.locator('#trip-arrive').fill('2026-11-30');
  await page.locator('#trip-depart').fill('2026-12-05');
  await page.locator('#trip-guests').selectOption('4');
  await page.locator('#catalog-trip-form button[type=submit]').click();
  const dockside = page.locator('[data-property="dockside-dreams"] .catalog-check-dates');
  await expect(dockside).toHaveText('Book these dates');
  await page.locator('[data-compare="dockside-dreams"]').click();
  await page.locator('[data-compare="the-oasis"]').click();
  await page.locator('#open-comparison').click();
  await expect(page.locator('#catalog-comparison')).toBeVisible();
  await expect(page.locator('#catalog-comparison thead [data-compare-column]')).toHaveCount(4);
  await page.locator('#close-comparison').click();
  await page.route('https://book.seascape-vacations.com/**', r => r.fulfill({ contentType:'text/html', body:'<h1>Intercepted checkout</h1>' }));
  await dockside.click();
  await page.waitForURL(/book\.seascape-vacations\.com\/checkout\/206016/);
  const target = new URL(page.url());
  expect(target.searchParams.get('start')).toBe('2026-11-30');
  expect(target.searchParams.get('end')).toBe('2026-12-05');
  expect(target.searchParams.get('numberOfGuests')).toBe('4');
});

test('family guide keeps failed availability honest and rejects an oversized group', async ({ page }) => {
  await registerStableNetwork(page);
  await page.route('**/.netlify/functions/booking-availability?**', r => r.fulfill({status:503,body:'Unavailable'}));
  await page.clock.setFixedTime(new Date('2026-11-02T17:00:00Z'));
  await page.goto(route + '?arrive=2026-11-30&depart=2026-12-05&guests=4');
  await expect(page.locator('#catalog-count')).toContainText('Availability could not be checked');
  await expect(page.locator('.catalog-check-dates')).toHaveText(homes.map(() => 'Check dates'));
  for (const link of await page.locator('.catalog-check-dates').all()) expect(new URL(await link.getAttribute('href')).pathname).toMatch(/^\/listings\/\d+$/);
  await page.locator('#trip-guests').selectOption('17');
  await page.locator('#catalog-trip-form button[type=submit]').click();
  await expect(page.locator('#catalog-empty')).toBeVisible();
  await expect(page.locator('.catalog-card:visible')).toHaveCount(0);
});

test('family guide retains article and named booking destinations without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  await page.goto(test.info().project.use.baseURL + route);
  await expect(page.locator('.flow-guide-answer')).toHaveText(source.intro);
  await expect(page.locator('.catalog-card')).toHaveCount(4);
  for (const slug of homes) {
    const card = page.locator('[data-property="'+slug+'"]');
    await expect(card.locator('.catalog-check-dates')).toHaveAttribute('href', /book\.seascape-vacations\.com\/listings\/\d+/);
    await expect(card.locator('[data-placement="stay_property_card"]')).toHaveAttribute('href', '/properties/'+slug+'/');
  }
  await context.close();
});
