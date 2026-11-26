const {test,expect}=require('@playwright/test');
const homes=require('../../src/_data/properties-fallback.json');
const { registerStableNetwork } = require('./test-helpers');
for(const home of homes)test(`${home.slug}: desktop booklet preserves mobile gallery and photo identity`,async({page})=>{
 const requests=[];page.on('request',r=>requests.push(r.url()));
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:844});
 await page.goto(`/properties/${home.slug}/`);
 await expect(page.locator('.g-gallery')).toBeVisible();
 await expect(page.locator('.inpage-book')).toHaveCount(0);
 expect(requests.some(u=>u.includes('/property-booklet.js')||u.includes('/property-booklet.css')||u.includes('-160.webp'))).toBe(false);
 await expect(page.locator('.g-gallery-photo')).toHaveCount(home.photography.photos.length);
 await page.setViewportSize({width:1440,height:1100});
 const book=page.locator('.inpage-book');await expect(book).toBeVisible();
 await expect(book.locator('.spread > .page img')).toHaveCount(2);
 await expect(book.locator('[role=status]')).toHaveText(`1–2 / ${home.photography.photos.length}`);
 expect(await book.locator('.spread > .page img').evaluateAll(imgs=>imgs.map(i=>i.alt))).toEqual(home.photography.photos.slice(0,2).map(i=>i.alt));
 await book.locator('[data-next]').click();await expect(book.locator('[role=status]')).toHaveText(`3–4 / ${home.photography.photos.length}`);
 await book.locator('[data-previous]').click();await expect(book.locator('[role=status]')).toHaveText(`1–2 / ${home.photography.photos.length}`);
 await page.emulateMedia({reducedMotion:'reduce'});await book.locator('[data-next]').click();await expect(book.locator('.turn-leaf')).toHaveCount(0);
 await book.locator('.thumbnails button').last().click();await expect(book.locator('[data-next]')).toBeDisabled();
 const dialog=page.locator('.g-photo-dialog'),tiles=dialog.locator('.contact-tile'),opener=page.locator('[data-open-gallery]');
 await expect(tiles).toHaveCount(0);
 const direct=book.locator('.spread > .page .photo-button').first();
 const directAlt=await direct.locator('img').getAttribute('alt');
 await direct.click();await expect(dialog).toBeVisible();
 await expect(dialog.locator('.contact-detail')).toBeVisible();
 await expect(dialog.locator('.contact-photo img')).toHaveAttribute('alt',directAlt);
 await expect(dialog.locator('.g-photo-grid img[src]')).toHaveCount(0);
 await page.keyboard.press('Escape');await expect(direct).toBeFocused();
 await opener.click();await expect(tiles).toHaveCount(home.photography.photos.length);
 expect(await tiles.locator('img').evaluateAll(imgs=>imgs.map(i=>i.alt))).toEqual(home.photography.photos.map(i=>i.alt));
 expect(await tiles.locator('img').evaluateAll(imgs=>imgs.map(i=>i.getAttribute('src')))).toEqual(home.photography.photos.map(i=>i.src.replace('.webp','-800.webp')));
 expect(await dialog.locator('.contact-sheet').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(4);
 await tiles.nth(1).click();await expect(dialog.locator('[data-photo-count]')).toHaveText('02 / '+home.photography.photos.length);
 await page.keyboard.press('ArrowRight');await expect(dialog.locator('.contact-photo img')).toHaveAttribute('alt',home.photography.photos[2].alt);
 await dialog.getByRole('button',{name:'Previous photo',exact:true}).click();
 await dialog.getByRole('button',{name:'All photos',exact:false}).click();await expect(tiles.nth(1)).toBeFocused();
 await page.keyboard.press('Escape');await expect(opener).toBeFocused();await expect(dialog).not.toBeVisible();
 await page.setViewportSize({width:899,height:844});await opener.click();await expect(dialog.locator('.contact-pane')).not.toBeVisible();await expect(dialog.locator('.g-photo-grid img:visible')).toHaveCount(home.photography.photos.length);await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});await expect(book).not.toBeVisible();await expect(page.locator('.g-gallery')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});

test('complete photos remain reachable without JavaScript or when booklet import fails',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:1100}});const page=await context.newPage();await page.goto('/properties/dockside-dreams/');
 const hrefs=await page.locator('#all-photos a').evaluateAll(a=>a.map(n=>n.getAttribute('href')));
 for(const photo of homes.find(h=>h.slug==='dockside-dreams').photography.photos)expect(hrefs).toContain(photo.src);
 await context.close();
 const fallback=await browser.newPage({viewport:{width:1440,height:1100}});await fallback.route('**/property-booklet.js',r=>r.abort());await fallback.goto('/properties/dockside-dreams/');await fallback.locator('[data-open-gallery]').click();await expect(fallback.locator('.g-photo-dialog')).toBeVisible();await expect(fallback.locator('.g-photo-dialog img')).toHaveCount(13);await fallback.close();
});

for(const asset of ['property-booklet.css','property-contact-sheet.js'])test(`old desktop paths survive ${asset} failure`,async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.route('**/'+asset,route=>route.abort());
 await page.goto('/properties/dockside-dreams/');
 await expect(page.locator('.g-gallery')).toBeVisible();
 await page.locator('[data-open-gallery]').click();
 await expect(page.locator('.g-photo-dialog .g-photo-grid img:visible')).toHaveCount(13);
 await expect(page.locator('.contact-tile')).toHaveCount(0);
 await page.keyboard.press('Escape');
 await expect(page.locator('[data-open-gallery]')).toBeFocused();
});

test('open viewer crosses the desktop boundary without trapping hidden focus',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/properties/dockside-dreams/');
 await expect(page.locator('.inpage-book')).toBeVisible();await page.locator('[data-open-gallery]').click();
 await page.locator('.contact-tile').nth(2).click();
 await page.setViewportSize({width:899,height:900});
 await expect(page.locator('.contact-pane')).not.toBeVisible();
 await expect(page.locator('.g-photo-dialog .g-photo-grid img:visible')).toHaveCount(13);
 await expect(page.locator('[data-close-gallery]')).toBeFocused();
 await page.setViewportSize({width:900,height:900});
 await expect(page.locator('.contact-overview')).toBeVisible();
 await expect(page.locator('.g-photo-dialog .g-photo-grid')).not.toBeVisible();
 await page.keyboard.press('Escape');await expect(page.locator('[data-open-gallery]')).toBeFocused();
});

test('an open phone grid becomes the contact sheet when desktop first loads', async ({ page }) => {
  await registerStableNetwork(page);
  await page.setViewportSize({ width: 899, height: 900 });
  await page.goto('/properties/dockside-dreams/');
  const opener = page.locator('[data-open-gallery]');
  const dialog = page.locator('.g-photo-dialog');
  await opener.click();
  await expect(dialog.locator('.g-photo-grid')).toBeVisible();
  await expect(page.locator('.inpage-book')).toHaveCount(0);
  await page.setViewportSize({ width: 900, height: 900 });
  await expect(page.locator('.inpage-book')).toBeVisible();
  await expect(dialog.locator('.contact-sheet')).toBeVisible({ timeout: 1500 });
  await expect(dialog.locator('.g-photo-grid')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
});

test('an unavailable thumbnail keeps its tile and exact full-size photo', async ({ page }) => {
  const photo = homes.find(home => home.slug === 'dockside-dreams').photography.photos.at(-1);
  const thumbnail = photo.src.replace(/\.webp$/, '-800.webp');
  await registerStableNetwork(page);
  await page.route(url => url.pathname === thumbnail, route => route.abort());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/properties/dockside-dreams/');
  await expect(page.locator('.inpage-book')).toBeVisible();
  await page.locator('[data-open-gallery]').click();
  const tile = page.locator('.contact-tile').last();
  await tile.scrollIntoViewIfNeeded();
  await expect(tile.getByText('Thumbnail unavailable')).toBeVisible({ timeout: 1500 });
  await expect(tile).toHaveAccessibleName(/thumbnail unavailable/i);
  const detail = page.locator('.contact-photo img');
  await expect(detail).not.toHaveAttribute('src', /.+/);
  await tile.click();
  await expect(detail).toHaveAttribute('alt', photo.alt);
  await expect(detail).toBeVisible();
  expect(await detail.evaluate(img => new URL(img.currentSrc).pathname)).toBe(photo.src);
});

 test('direct booklet opener falls back to View all photos if resize replaces it',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/properties/dockside-dreams/');
 await page.locator('.inpage-book .spread > .page .photo-button').first().click();
 await page.setViewportSize({width:899,height:900});await page.keyboard.press('Escape');
 await expect(page.locator('[data-open-gallery]')).toBeFocused();
});

test('contact detail hides the previous photo until the selected image decodes', async ({ page }) => {
  const photos = homes.find(home => home.slug === 'dockside-dreams').photography.photos;
  const [previousPhoto, lastPhoto] = photos.slice(-2);
  await registerStableNetwork(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/properties/dockside-dreams/');
  await expect(page.locator('.inpage-book')).toBeVisible();
  await page.locator('[data-open-gallery]').click();
  await page.locator('.contact-tile').nth(photos.length - 2).click();
  const detail = page.locator('.contact-detail');
  const photo = detail.locator('.contact-photo img');
  await expect(photo).toHaveAttribute('src', previousPhoto.src);
  await expect(photo).toBeVisible();
  await photo.evaluate(img => img.decode());

  const requested = Promise.withResolvers();
  const release = Promise.withResolvers();
  await page.route(url => url.pathname === lastPhoto.src, async route => {
    requested.resolve();
    await release.promise;
    await route.continue();
  });
  try {
    await detail.getByRole('button', { name: 'Next photo' }).click();
    await requested.promise;
    await expect(detail.locator('[data-photo-count]')).toHaveText(`${photos.length} / ${photos.length}`);
    await expect(photo).toBeHidden({ timeout: 1000 });
  } finally {
    release.resolve();
  }
  await expect(photo).toBeVisible();
  await expect(photo).toHaveAttribute('alt', lastPhoto.alt);
  expect(await photo.evaluate(img => new URL(img.currentSrc).pathname)).toBe(lastPhoto.src);
});
