const { test, expect } = require('@playwright/test');
const { openTripSheet, registerStableNetwork } = require('./test-helpers');

test('simple controls replace the strip and retain keyboard focus while browsing', async ({ page }) => {
  await registerStableNetwork(page);
  await page.goto('/');
  await expect(page.locator('.g-scene-picker')).toBeHidden();
  let next = page.getByRole('button', { name: 'Next featured home', exact: true });
  await next.focus();
  await next.press('Enter');
  await expect(page.locator('.g-scene:visible h2')).toHaveText('Dockside Dreams');
  next = page.getByRole('button', { name: 'Next featured home', exact: true });
  await expect(next).toBeFocused();
  await expect(page.locator('.g-scene:visible')).toContainText('Home 2 of 8');
  await next.press('Home');
  await expect(page.locator('.g-scene:visible h2')).toHaveText('The Oasis');
  await page.getByRole('button', { name: 'Prev featured home', exact: true }).click();
  await expect(page.locator('.g-scene:visible h2')).toHaveText('Relaxing Oasis');
});

test('the homepage fetches only its matching responsive Oasis hero', async ({ page }, testInfo) => {
  await registerStableNetwork(page);
  const requests=[];
  page.on('request',request=>{if(request.url().includes('/the-oasis/hero-clarity')) requests.push(new URL(request.url()).pathname);});
  await page.goto('/',{waitUntil:'networkidle'});
  const photo=page.locator('#scene-the-oasis img');
  await expect(photo).toHaveJSProperty('complete',true);
  const mobile=testInfo.project.name==='mobile-chromium';
  expect(requests).toEqual(['/images/homes/the-oasis/hero-clarity'+(mobile?'-mobile':'')+'.webp']);
  expect(await photo.evaluate(n=>n.naturalWidth)).toBeGreaterThan(0);
});

test('a slow photo does not take focus back from the trip form', async ({ page }) => {
  await registerStableNetwork(page);
  await page.goto('/');
  let release;
  const waiting=new Promise(resolve=>{release=resolve;});
  await page.route(/\/images\/homes\/river-house\/01(?:-800)?\.webp$/,async route=>{await waiting;await route.continue();});
  const next=page.getByRole('button',{name:'Next featured home',exact:true});
  await next.press('ArrowRight');
  await next.press('ArrowRight');
  await next.focus();
  await next.dispatchEvent('click',{detail:1});
  await openTripSheet(page);
  const arrival=page.getByLabel('Arrival',{exact:true});
  await arrival.focus();
  release();
  await expect(page.locator('#scene-river-house')).toBeVisible();
  await expect(arrival).toBeFocused();
});

test('the phone homepage keeps one reachable date control and the owner review link', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'phone layout only');
  await registerStableNetwork(page);
  await page.goto('/');
  const pill = page.getByRole('button', { name: /Dates and guests/ });
  await expect(pill).toBeVisible();
  await pill.focus();
  await pill.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Dates and guests' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(pill).toBeFocused();

  const owners = page.getByRole('link', { name: /Request a revenue review/ });
  await expect(owners).toBeVisible();
  await owners.scrollIntoViewIfNeeded();
  await expect(pill).toBeInViewport();
  await expect(page.locator('[data-trip-bar]')).toBeHidden();

  await page.getByRole('button', { name: 'Sarasota', exact: true }).click();
  await expect(page.locator('[data-ts-card]:visible')).toHaveCount(1);
  await expect(page.locator('[data-ts-status]')).toHaveText('1 home');
});
