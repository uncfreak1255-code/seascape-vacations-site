const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const properties = require('../../src/_data/properties-fallback.json');
const { registerStableNetwork, prepareFullPageScreenshot } = require('./test-helpers');
const itinerary = 'arrive=2026-11-07&depart=2026-11-14&guests=8';
async function visit(page, route) {
  await registerStableNetwork(page);
  await page.clock.setFixedTime(new Date('2026-09-04T16:00:00Z'));
  await page.goto(route, { waitUntil:'networkidle' });
}
function quoteParams(href) {
  const u=new URL(href);return {start:u.searchParams.get('start'),end:u.searchParams.get('end'),guests:u.searchParams.get('numberOfGuests')};
}

test('homepage search reaches the matching collection without losing the trip', async ({ page }) => {
  await visit(page,'/');
  await page.getByLabel('Arrival',{exact:true}).fill('2026-11-07');
  await page.getByLabel('Departure',{exact:true}).fill('2026-11-14');
  await page.getByLabel('Guests',{exact:true}).selectOption('14');
  await page.getByRole('button',{name:'Find my home',exact:true}).click();
  await expect(page.locator('.catalog-card:visible')).toHaveCount(1);
  await expect(page.locator('.catalog-card:visible')).toHaveAttribute('data-property','the-oasis');
  await expect(page.locator('#trip-arrive')).toHaveValue('2026-11-07');
  await expect(page.locator('#trip-guests')).toHaveValue('14');
});

for (const p of properties) test(p.name+': identity, sleeping, reviews, real photos, schema and checkout agree', async ({ page, context }) => {
  // Only the destination page is simulated; this test never reserves or pays.
  await context.route('https://book.seascape-vacations.com/**', route=>route.fulfill({status:200,contentType:'text/html',body:'<h1>Simulated checkout navigation only</h1>'}));
  const receipts=[];
  await visit(page,'/properties/'+p.slug+'/?'+itinerary+'&email=private@example.com');
  await page.route('**/.netlify/functions/booking-handoff',async route=>{receipts.push(route.request().postDataJSON());await route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});});
  await expect(page.locator('main h1')).toHaveText(p.name);
  await expect(page.locator('.g-sleeping-list li')).toHaveText(p.guestFacts.sleeping.map((text,i)=>'0'+(i+1)+text));
  const schema=await page.locator('script[type="application/ld+json"]').evaluateAll(nodes=>nodes.flatMap(n=>JSON.parse(n.textContent)));
  const rental=schema.find(n=>n['@type']==='VacationRental');
  expect(rental.name).toBe(p.name);expect(rental.identifier).toBe('seascape-'+new URL(p.guestFacts.sourceUrl).pathname.split('/').pop());
  expect(rental.containsPlace.numberOfBedrooms).toBe(p.bedrooms);
  expect(rental.containsPlace.numberOfBathroomsTotal).toBe(p.bathrooms);
  expect(rental.containsPlace.occupancy.value).toBe(p.guests);
  expect(schema.filter(n=>n['@type']==='Review').length).toBe(p.guestFacts.reviews.length);
  await page.locator('[data-open-gallery]').click();
  const dialog=page.locator('.g-photo-dialog');await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveCount(p.photography.photos.length);
  await page.waitForFunction(()=>[...document.querySelectorAll('.g-photo-dialog img')].every(img=>img.complete&&img.naturalWidth>0));
  expect(await dialog.locator('img').evaluateAll(nodes=>nodes.map(n=>({src:new URL(n.currentSrc).pathname,slug:n.dataset.propertyPhoto})))).toEqual(p.photography.photos.map(photo=>({src:photo.src,slug:p.slug})));
  await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(page.locator('[data-open-gallery]')).toBeFocused();
  await page.getByLabel('Arrival',{exact:true}).fill('2026-12-05');
  await page.getByLabel('Departure',{exact:true}).fill('2026-12-12');
  await page.getByLabel('Guests',{exact:true}).selectOption('6');
  const popupPromise=page.waitForEvent('popup');await page.getByRole('button',{name:'Check dates & total',exact:true}).click();
  const popup=await popupPromise;await popup.waitForLoadState('domcontentloaded');
  expect(new URL(popup.url()).pathname).toBe(new URL(p.guestFacts.sourceUrl).pathname);
  expect(quoteParams(popup.url())).toEqual({start:'2026-12-05',end:'2026-12-12',guests:'6'});
  await expect.poll(()=>receipts.length).toBeGreaterThan(0);
  const receipt=receipts[0];expect(String(receipt.listingId)).toBe(new URL(p.guestFacts.sourceUrl).pathname.split('/').pop());expect(receipt.propertySlug).toBe(p.slug);
  expect(receipt.handoffId).toBeTruthy();expect(receipt.sessionId).toBeTruthy();expect(JSON.stringify(receipts)).not.toContain('private@example.com');await popup.close();
  await page.getByRole('link',{name:'Change trip / compare homes',exact:true}).click();
  await expect(page.locator('#trip-arrive')).toHaveValue('2026-12-05');await expect(page.locator('#trip-guests')).toHaveValue('6');
});

test('oversized groups cannot bypass the property form through its checkout link',async({page})=>{
  for(const count of ['16','17']){
    await visit(page,'/properties/dockside-dreams/?guests='+count);
    await expect(page.locator('.g-guests')).toHaveValue(count);
    await expect(page.locator('[data-property-checkout]')).toBeHidden();
    await expect(page.locator('.g-form-status')).toContainText('up to 12 guests');
    await page.getByRole('button',{name:'Check dates & total',exact:true}).click();
    await expect(page).toHaveURL(/properties\/dockside-dreams/);
    await page.getByRole('link',{name:'Change trip / compare homes',exact:true}).click();
    await expect(page.locator('#trip-guests')).toHaveValue(count);
  }
});

test('clearing dates stays cleared and prepared questions omit private URL fields',async({page})=>{
  await visit(page,'/properties/dockside-dreams/?'+itinerary+'&email=guest@example.com&sv_session_id=secret&payment_intent=private');
  await page.getByLabel('Arrival',{exact:true}).fill('');await page.getByLabel('Departure',{exact:true}).fill('');
  await page.getByLabel('What would you like to check?').selectOption('boat and parking space');
  const email=decodeURIComponent(await page.locator('[data-question-email]').getAttribute('href'));
  expect(email).toContain('Dockside Dreams');expect(email).toContain('Flexible dates');expect(email).toContain('8 guests');
  expect(email).not.toMatch(/guest@example|secret|payment_intent|2026-11-07/);
  expect(quoteParams(await page.locator('[data-property-checkout]').getAttribute('href'))).toEqual({start:null,end:null,guests:'8'});
  await page.getByRole('link',{name:'Change trip / compare homes',exact:true}).click();await expect(page.locator('#trip-arrive')).toHaveValue('');
});

test('invalid dates recover and incomplete edits do not open checkout',async({page})=>{
  await visit(page,'/properties/the-oasis/?arrive=2026-11-14&depart=2026-11-07');
  await expect(page.locator('.g-form-status')).toContainText('Choose new dates');
  await page.getByLabel('Arrival',{exact:true}).fill('2026-11-07');
  await page.getByRole('button',{name:'Check dates & total',exact:true}).click();
  expect(await page.locator('.g-depart').evaluate(input=>input.checkValidity())).toBe(false);
});

test('a missing accommodation photo is explicit and cannot pass visual proof',async({page})=>{
  await visit(page,'/');
  await page.route(/\/images\/homes\/the-oasis\/01(?:-800)?\.webp$/,route=>route.abort());
  await page.reload({waitUntil:'networkidle'});
  await expect(page.locator('[data-photo-failed]').first()).toBeVisible();
  expect(await page.locator('img[src*="seascape-og-default"]').count()).toBe(0);
  await expect(prepareFullPageScreenshot(page)).rejects.toThrow(/Refusing visual proof/);
});

test('mobile menu and booking shortcut are usable, with no critical automated accessibility violations',async({page},testInfo)=>{
  for(const route of ['/','/properties/dockside-dreams/?'+itinerary]){
    await visit(page,route);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const results=await new AxeBuilder({page}).analyze();expect(results.violations).toEqual([]);
  }
  if(testInfo.project.name.includes('mobile')){
    await page.getByRole('button',{name:'Open menu',exact:true}).click();await expect(page.locator('#guest-menu')).toBeVisible();
    await page.keyboard.press('Escape');await expect(page.locator('#guest-menu')).toBeHidden();
    await page.locator('#booking').scrollIntoViewIfNeeded();await expect(page.locator('.g-mobile-booking')).toBeHidden();
  }
});

test('without JavaScript the home form, interior photos, rules and matching booking destination remain',async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false,baseURL});const page=await context.newPage();
  await registerStableNetwork(page);await page.goto('/');await expect(page.locator('form[action="/properties/"]')).toBeVisible();
  await page.goto('/properties/bradenton-pool-home/');await expect(page.locator('#sleeping')).toContainText('Bedroom');
  await page.getByText('Can I bring a dog?',{exact:true}).click();await expect(page.locator('#before-booking')).toContainText(properties.find(p=>p.slug==='bradenton-pool-home').guestFacts.pets.text);
  expect(await page.locator('.g-guests option').evaluateAll(options=>Math.max(...options.map(o=>Number(o.value))))).toBe(10);
  await expect(page.locator('.g-photo-grid figure')).toHaveCount(6);await expect(page.locator('[data-property-checkout]')).toHaveAttribute('href',/listings\/487798/);await context.close();
});

test('the six email landing routes contain exactly one offer module',async({page})=>{
  for(const route of ['/properties/',...properties.map(p=>'/properties/'+p.slug+'/')]) {
    await visit(page,route+'?promo=save50');
    await expect(page.locator('aside[data-save50-offer]')).toHaveCount(1);
    await expect(page.locator('aside[data-save50-offer]')).toBeVisible();
  }
});


test('questions keep email contents out of analytics and contact URL schemes are omitted',async({page})=>{
  await visit(page,'/properties/dockside-dreams/?'+itinerary);
  await page.evaluate(()=>document.querySelector('[data-question-email]').addEventListener('click',event=>event.preventDefault()));
  await page.locator('[data-question-email]').click();
  const events=await page.evaluate(()=>window.dataLayer.filter(e=>e.event==='property_question_prepare'));
  expect(events).toHaveLength(1);
  expect(events[0].payload.topic).toBe('sleeping arrangements');
  expect(JSON.stringify(events)).not.toMatch(/mailto:|subject=|body=|Hi Seascape|2026-11-07/);
  const safe=await page.evaluate(()=>window.seascapeSanitizeAnalyticsPayload({link_url:'mailto:info@seascape-vacations.com?subject=Stay&body=private%20question',contact_url:'tel:9417048545',booking_url:'https://book.seascape-vacations.com/listings/206016'}));
  expect(safe).toEqual({booking_url:'https://book.seascape-vacations.com/listings/206016'});
});

test('an incomplete edited trip cannot use the secondary checkout shortcut',async({page})=>{
  await visit(page,'/properties/dockside-dreams/?'+itinerary);
  await page.getByLabel('Departure',{exact:true}).fill('');
  await page.getByLabel('Guests',{exact:true}).focus();
  await expect(page.locator('[data-property-checkout]')).toBeHidden();
  await expect(page.locator('.g-form-status')).toContainText('Choose a departure');
  await page.getByLabel('Departure',{exact:true}).fill('2026-11-15');
  await page.getByLabel('Guests',{exact:true}).focus();
  await expect(page.locator('[data-property-checkout]')).toBeVisible();
  expect(quoteParams(await page.locator('[data-property-checkout]').getAttribute('href'))).toEqual({start:'2026-11-07',end:'2026-11-15',guests:'8'});
});
