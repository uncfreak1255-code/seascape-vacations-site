const { test, expect } = require('@playwright/test');
const { registerStableNetwork } = require('./test-helpers');
const homes = require('../../src/_data/properties-fallback.json');
const trip = 'arrive=2026-11-07&depart=2026-11-14&guests=8';
async function visit(page) {
  await registerStableNetwork(page);
  await page.clock.setFixedTime(new Date('2026-09-05T16:00:00Z'));
  await page.goto('/?'+trip, {waitUntil:'networkidle'});
}

test('every manual scene keeps its identity, own photo, facts and trip link', async ({page}) => {
  await visit(page);
  for (const home of homes) {
    const choice=page.getByRole('button',{name:'Preview '+home.name,exact:true});
    await choice.click();
    const panel=page.locator('.g-scene:visible');
    await expect(panel).toHaveAttribute('data-scene',home.slug);
    await expect(choice).toHaveAttribute('aria-pressed','true');
    await expect(panel.locator('h2')).toHaveText(home.name);
    await expect(panel.locator('.g-scene-caption')).toContainText(home.guestFacts.tagline);
    const photo=await panel.locator('img').evaluate(n=>({src:new URL(n.currentSrc).pathname,loaded:n.naturalWidth>0}));
    expect(photo.loaded).toBe(true);expect(photo.src).toContain('/images/homes/'+home.slug+'/');
    const url=new URL(await panel.locator('a').getAttribute('href'),page.url());
    expect(url.pathname).toBe('/properties/'+home.slug+'/');
    expect(url.searchParams.get('arrive')).toBe('2026-11-07');expect(url.searchParams.get('guests')).toBe('8');
  }
  await page.locator('.g-scene:visible a').click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Bradenton Pool Home');
  await expect(page.getByLabel('Arrival',{exact:true})).toHaveValue('2026-11-07');
});

test('keyboard previews and reduced motion keep the scene usable',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await visit(page);
  const first=page.getByRole('button',{name:'Preview The Oasis',exact:true});await first.focus();
  await page.keyboard.press('ArrowRight');await expect(page.locator('.g-scene:visible')).toHaveAttribute('data-scene','dockside-dreams');
  await page.keyboard.press('End');await expect(page.locator('.g-scene:visible')).toHaveAttribute('data-scene','bradenton-pool-home');
  await page.keyboard.press('Home');await expect(first).toBeFocused();await expect(first).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('a failed selected photo never shows another accommodation as its replacement',async({page})=>{
  await registerStableNetwork(page);
  await page.route(/\/images\/homes\/river-house\/01(?:-800)?\.webp$/,r=>r.abort());
  await page.goto('/?'+trip,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Preview River House',exact:true}).click();
  const scene=page.locator('.g-scene:visible');await expect(scene).toHaveAttribute('data-scene','river-house');
  await expect(scene.locator('[data-photo-failed]')).toHaveAttribute('data-property-photo','river-house');
  await expect(scene.locator('a')).toHaveAttribute('href',/properties\/river-house\//);
  await page.getByRole('button',{name:'Preview The Oasis',exact:true}).click();await expect(page.locator('.g-scene:visible img')).toHaveAttribute('data-property-photo','the-oasis');
});

test('a slow earlier image cannot overwrite the most recent home choice',async({page})=>{
  await visit(page);
  let release;const gate=new Promise(resolve=>{release=resolve;});
  await page.route(/\/images\/homes\/river-house\/01(?:-800)?\.webp$/,async route=>{await gate;await route.continue();});
  await page.getByRole('button',{name:'Preview River House',exact:true}).click();
  await page.getByRole('button',{name:'Preview Dockside Dreams',exact:true}).click();
  await expect(page.locator('.g-scene:visible')).toHaveAttribute('data-scene','dockside-dreams');release();
  await expect(page.locator('#scene-river-house img')).toHaveJSProperty('complete',true);
  await expect(page.locator('.g-scene:visible')).toHaveAttribute('data-scene','dockside-dreams');
});

test('motion preference changes stop subsequent preview animation',async({page})=>{
  await visit(page);await page.emulateMedia({reducedMotion:'no-preference'});
  await page.getByRole('button',{name:'Preview Dockside Dreams',exact:true}).click();
  await expect(page.locator('.g-scene:visible')).toHaveAttribute('data-scene','dockside-dreams');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.getByRole('button',{name:'Preview Sarasota Luxe',exact:true}).click();
  await expect(page.locator('.g-scene:visible')).toHaveAttribute('data-scene','sarasota-luxe');
  expect(await page.locator('.g-scene:visible').evaluate(n=>n.getAnimations({subtree:true}).length)).toBe(0);
});

test('without JavaScript all five scene choices are ordinary property links',async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false,baseURL});const page=await context.newPage();
  await registerStableNetwork(page);await page.goto('/');
  await expect(page.locator('.g-scene-picker a')).toHaveCount(5);
  await page.locator('[data-scene-choice="sarasota-luxe"]').click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Sarasota Luxe');await context.close();
});

test('editing the homepage trip carries it into a home even before search is submitted',async({page})=>{
  await visit(page);
  await page.getByLabel('Arrival',{exact:true}).fill('2026-12-05');
  await page.getByLabel('Departure',{exact:true}).fill('2026-12-12');
  await page.getByLabel('Guests',{exact:true}).selectOption('6');
  await page.getByRole('button',{name:'Preview Dockside Dreams',exact:true}).click();
  await page.locator('.g-scene:visible a').click();
  await expect(page.getByLabel('Arrival',{exact:true})).toHaveValue('2026-12-05');
  await expect(page.getByLabel('Departure',{exact:true})).toHaveValue('2026-12-12');
  await expect(page.getByLabel('Guests',{exact:true})).toHaveValue('6');
});
