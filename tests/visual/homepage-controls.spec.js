const { test, expect } = require('@playwright/test');
const { registerStableNetwork } = require('./test-helpers');

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
  await page.getByRole('button', { name: 'Previous featured home', exact: true }).click();
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
