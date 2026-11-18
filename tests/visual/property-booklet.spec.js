const {test,expect}=require('@playwright/test');
const homes=require('../../src/_data/properties-fallback.json');
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
 await book.locator('.spread > .page .photo-button').first().click();await expect(page.locator('.g-photo-dialog')).toBeVisible();await expect(page.locator('.g-photo-dialog img:visible')).toHaveCount(1);await page.keyboard.press('Escape');await page.locator('[data-open-gallery]').click();await expect(page.locator('.g-photo-dialog img:visible')).toHaveCount(home.photography.photos.length);await page.keyboard.press('Escape');await expect(page.locator('.g-photo-dialog')).not.toBeVisible();
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
