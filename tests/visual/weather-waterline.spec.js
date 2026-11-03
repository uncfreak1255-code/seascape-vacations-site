const {test,expect}=require('@playwright/test');
const {registerStableNetwork}=require('./test-helpers');
const original=require('../../scripts/enforcement/fixtures/weather-original-values.json');
const route='/guides/anna-maria-island-weather/';
test('weather B keeps all original values in two static readable plots and the full table',async({page})=>{
 await registerStableNetwork(page);await page.goto(route);
 await expect(page.locator('body')).toHaveClass(/planning-guide/);
 await expect(page.locator('.climate-plot')).toHaveCount(2);
 await expect(page.locator('.climate-plot.high .bar span')).toHaveText(original.map(r=>r[1]+'°'));
 await expect(page.locator('.climate-plot.rain .bar span')).toHaveText(original.map(r=>r[4]));
 expect(await page.locator('.weather-table tbody tr').evaluateAll(rows=>rows.map(r=>[...r.cells].map(c=>c.textContent)))).toEqual(original);
 await expect(page.locator('.plot-head > span')).toHaveText(['0–100°F','0–20 days']);
 for(const kind of ['high','rain'])expect(await page.locator('.'+kind+' .plot-month').allTextContents()).toEqual(original.map(r=>r[0].slice(0,3)));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://seascape-vacations.com'+route);
});
test('weather keeps the correct Dockside trip and booking destination',async({page})=>{
 await registerStableNetwork(page);await page.clock.setFixedTime(new Date('2026-11-03T20:00:00Z'));
 await page.goto(route+'?arrive=2026-11-30&depart=2026-12-05&guests=4');
 const details=page.locator('.guide-stay-here__btn');await expect(details).toContainText('Dockside Dreams');await details.click();
 await page.waitForURL(/properties\/dockside-dreams/);expect(page.url()).toContain('arrive=2026-11-30');expect(page.url()).toContain('depart=2026-12-05');expect(page.url()).toContain('guests=4');
 const booking=page.locator('[data-property-checkout]');
 await expect(booking).toHaveAttribute('href',/book\.seascape-vacations\.com\/checkout\/206016/);
 await page.route('https://book.seascape-vacations.com/**',r=>r.fulfill({contentType:'text/html',body:'<h1>Intercepted checkout</h1>'}));await page.getByRole('button',{name:'Book these dates',exact:true}).click();await page.waitForURL(/book\.seascape-vacations\.com\/checkout\/206016/);const target=new URL(page.url());expect(target.searchParams.get('start')).toBe('2026-11-30');expect(target.searchParams.get('end')).toBe('2026-12-05');expect(target.searchParams.get('numberOfGuests')).toBe('4');
});
test('weather B retains every monthly value without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:test.info().project.use.viewport});try{const p=await context.newPage();await p.goto(test.info().project.use.baseURL+route);await expect(p.locator('.plot-months li')).toHaveCount(24);await expect(p.locator('.weather-table tbody tr')).toHaveCount(12);await expect(p.locator('.guide-stay-here__btn')).toHaveAttribute('href','/properties/dockside-dreams/#check-availability');}finally{await context.close()}
});
