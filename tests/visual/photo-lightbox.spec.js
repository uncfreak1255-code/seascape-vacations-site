// The photo lightbox in a real browser (docs/design/photo-lightbox.md). No page uses the piece yet,
// so the test serves one: the real partial, rendered with the sample rooms, under a home page's
// body class, with the built site's own stylesheets, script and photos.
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const partialEnv = require('../../scripts/design/design-sync/partial-env');
const photoLightboxSample = require('../../scripts/design/design-sync/photo-lightbox-sample');

const root = path.resolve(__dirname, '../..');
const sample = photoLightboxSample((file) => fs.readFileSync(path.join(root, file), 'utf8'));
const dialogHtml = partialEnv().renderString('{% import "partials/photo-lightbox.njk" as plb %}{{ plb.photoLightbox(id, title, rooms, eyebrow) }}', sample);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Photo lightbox</title>
<link rel="stylesheet" href="/css/base.css"><link rel="stylesheet" href="/css/guest.css"><link rel="stylesheet" href="/css/motion.css"><link rel="stylesheet" href="/css/photo-lightbox.css">
<script src="/assets/js/photo-lightbox.js" defer></script></head>
<body class="guest-site"><main style="min-height:300vh;padding:24px"><h1>A home page</h1>
<button type="button" class="g-button" data-plb-open="${sample.id}" hidden>All photos</button></main>
${dialogHtml}</body></html>`;
const first = sample.rooms[0].photos[0];
const count = sample.rooms.reduce((sum, room) => sum + room.photos.length, 0);

async function openPage(page, viewport) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize(viewport);
  await page.route('**/__photo-lightbox/', (route) => route.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
  await page.goto('/__photo-lightbox/');
  return errors;
}
const opener = (page) => page.locator('[data-plb-open]');
const dialog = (page) => page.locator('dialog.plb');
const pressed = (page) => dialog(page).locator('.plb-room[aria-pressed="true"]');

test('the page\'s own button opens the lightbox as a modal; Escape and Close hand focus back', async ({ page }) => {
  const errors = await openPage(page, { width: 1280, height: 800 });
  await expect(dialog(page)).toBeHidden();
  // Closed, with the script running, it has fetched no photo: every image is lazy.
  await page.waitForLoadState('networkidle');
  expect(await dialog(page).locator('img').evaluateAll((images) => images.filter((image) => image.currentSrc).length)).toBe(0);
  await opener(page).click();
  await expect(dialog(page)).toBeVisible();
  expect(await dialog(page).evaluate((node) => node.matches(':modal'))).toBe(true);
  await expect(dialog(page).getByRole('button', { name: 'Close' })).toBeFocused();
  await expect(dialog(page)).toHaveAccessibleName(sample.title);
  // The page behind is out of reach and does not scroll under the dialog.
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
  await expect(opener(page)).toBeFocused();
  await opener(page).click();
  await dialog(page).getByRole('button', { name: 'Close' }).click();
  await expect(dialog(page)).toBeHidden();
  await expect(opener(page)).toBeFocused();
  expect(errors).toEqual([]);
});

test('a short window, where the dialog itself scrolls, still opens with Close focused', async ({ page }) => {
  const errors = await openPage(page, { width: 1280, height: 420 });
  for (const viewport of [{ width: 1280, height: 420 }, { width: 852, height: 393 }, { width: 640, height: 300 }]) {
    await page.setViewportSize(viewport);
    await opener(page).click();
    await expect(dialog(page).getByRole('button', { name: 'Close' }), `at ${viewport.width}x${viewport.height}`).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(opener(page)).toBeFocused();
  }
  // A phone on its side fits without the frame scrolling: only the feed scrolls.
  await page.setViewportSize({ width: 852, height: 393 });
  await opener(page).click();
  expect(await dialog(page).locator('.plb-frame').evaluate((node) => node.scrollHeight - node.clientHeight)).toBe(0);
  expect(errors).toEqual([]);
});

test('wide: rooms in a rail, one large photo, and the arrows walk every photo', async ({ page }) => {
  const errors = await openPage(page, { width: 1280, height: 800 });
  await opener(page).click();
  const stage = dialog(page).locator('.plb-stage');
  await expect(stage).toBeVisible();
  await expect(dialog(page).locator('.plb-next')).toBeHidden();
  await expect(stage.locator('img')).toHaveAttribute('alt', first.alt);
  await expect(stage.locator('[data-plb-stage-position]')).toHaveText(`1 of 4 in Outside · photo 1 of ${count}`);
  // The whole photo shows: a 3:2 box that fits the window with the caption row under it.
  const box = await stage.locator('.plb-stage-photo').boundingBox();
  expect(Math.abs(box.width / box.height - 1.5)).toBeLessThan(0.01);
  expect(box.y + box.height).toBeLessThan(800 - 56);
  expect(await stage.locator('img').evaluate((image) => getComputedStyle(image).objectFit)).toBe('contain');

  await dialog(page).locator('.plb-photo').nth(2).click();
  await expect(page).toHaveURL(/__photo-lightbox\/$/);
  await expect(stage.locator('[data-plb-stage-label]')).toHaveText('Dock seating');
  await expect(dialog(page).locator('.plb-photo[aria-current="true"]')).toHaveCount(1);
  await expect(stage.locator('a')).toHaveAttribute('href', sample.rooms[0].photos[2].src);
  expect(await stage.locator('img').evaluate((image) => image.decode().then(() => image.naturalWidth > 0))).toBe(true);

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(pressed(page)).toContainText('Living');
  await expect(stage.locator('[data-plb-stage-position]')).toHaveText(`1 of 4 in Living · photo 5 of ${count}`);
  await dialog(page).getByRole('button', { name: 'Previous photo' }).click();
  await expect(pressed(page)).toContainText('Outside');
  await dialog(page).getByRole('button', { name: /Bath/ }).click();
  await expect(stage.locator('[data-plb-stage-position]')).toHaveText(`1 of 1 in Bath · photo ${count} of ${count}`);
  await page.keyboard.press('ArrowRight');
  await expect(stage.locator('[data-plb-stage-position]')).toHaveText(`1 of 4 in Outside · photo 1 of ${count}`);

  // Keyboard. Focus on a small photo goes with the pick, so the arrows still reach the dialog once
  // that photo's room is hidden: the fifth press proves it.
  const photos = dialog(page).locator('.plb-photo');
  await photos.first().focus();
  for (let press = 0; press < 4; press += 1) await page.keyboard.press('ArrowRight');
  await expect(pressed(page)).toContainText('Living');
  await expect(photos.nth(4)).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(photos.nth(5)).toBeFocused();
  // One live region reads the photo's name with its place.
  await expect(stage.locator('[aria-live="polite"][aria-atomic="true"]')).toHaveText(`${sample.rooms[1].photos[1].label} 2 of 4 in Living · photo 6 of ${count}`);
  // The focused photo wears the 3px focus ring, not the 2px picked ring. On this guest page it is
  // guest.css's `.guest-site a:focus-visible` that draws it; photo-lightbox.test.js checks the sheet's own.
  expect(await photos.nth(5).evaluate((node) => getComputedStyle(node).outlineWidth)).toBe('3px');

  // Focus on a control stays there, and the picked photo is still brought inside the feed's box.
  await page.setViewportSize({ width: 1280, height: 600 });
  const feed = dialog(page).locator('.plb-feed');
  expect(await feed.evaluate((node) => node.scrollHeight - node.clientHeight), 'the second row starts out of view').toBeGreaterThan(40);
  await dialog(page).getByRole('button', { name: 'Next photo' }).focus();
  for (let press = 0; press < 2; press += 1) await page.keyboard.press('ArrowRight');
  await expect(dialog(page).getByRole('button', { name: 'Next photo' })).toBeFocused();
  expect(await feed.evaluate((node) => {
    const box = node.getBoundingClientRect();
    const picked = node.querySelector('[aria-current="true"]').getBoundingClientRect();
    return picked.top >= box.top && picked.bottom <= box.bottom;
  })).toBe(true);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  expect(errors).toEqual([]);
});

test('phone: one room\'s photos as a feed on white, each a link to its full-size file', async ({ page }) => {
  const errors = await openPage(page, { width: 393, height: 852 });
  await opener(page).click();
  await expect(dialog(page).locator('.plb-stage')).toBeHidden();
  expect(await dialog(page).evaluate((node) => getComputedStyle(node).backgroundColor)).toBe('rgb(255, 255, 255)');
  await expect(dialog(page).locator('.plb-photo:visible')).toHaveCount(4);
  // The large photo is never laid out here, so it is never fetched.
  expect(await dialog(page).locator('.plb-stage img').evaluate((image) => image.currentSrc)).toBe('');
  await expect(dialog(page).getByRole('button', { name: 'Living 4 photos' })).toBeVisible();

  const feed = dialog(page).locator('.plb-feed');
  await feed.evaluate((node) => { node.scrollTop = 300; });
  await dialog(page).getByRole('button', { name: 'Next: Living' }).click();
  await expect(pressed(page)).toContainText('Living');
  await expect(dialog(page).getByRole('button', { name: 'Next: Bedrooms' })).toBeFocused();
  expect(await feed.evaluate((node) => node.scrollTop)).toBe(0);
  await expect(dialog(page).locator('.plb-photo:visible')).toHaveCount(4);
  await dialog(page).getByRole('button', { name: /Bath/ }).click();
  await expect(dialog(page).locator('.plb-photo:visible')).toHaveCount(1);
  await expect(dialog(page).getByRole('button', { name: 'Next: Outside' })).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(pressed(page)).toContainText('Bath');
  await dialog(page).locator('.plb-photo:visible').click();
  await expect(page).toHaveURL(new RegExp(`${sample.rooms[3].photos[0].src.replace(/\./g, '\\.')}$`));
  expect(errors).toEqual([]);
});

test('nothing runs off the side at any width, and the three layouts change at 700 and 900px', async ({ page }) => {
  const errors = await openPage(page, { width: 320, height: 640 });
  await opener(page).click();
  await dialog(page).getByRole('button', { name: /Bedrooms/ }).click();
  for (const width of [320, 393, 700, 701, 899, 900, 1050, 1440, 800]) {
    await page.setViewportSize({ width, height: width < 900 ? 800 : 900 });
    // A window that crosses 900px with the dialog open is redrawn: the room on show takes the stage.
    await expect(dialog(page).locator('.plb-photo[aria-current="true"]')).toHaveCount(width >= 900 ? 1 : 0);
    if (width >= 900) await expect(dialog(page).locator('[data-plb-stage-position]')).toHaveText(`1 of 4 in Bedrooms · photo 9 of ${count}`);
    const facts = await dialog(page).evaluate((node) => ({
      over: Math.max(document.documentElement.scrollWidth, node.querySelector('.plb-frame').scrollWidth) - innerWidth,
      canvas: getComputedStyle(node).backgroundColor,
      stage: node.querySelector('.plb-stage').getClientRects().length > 0,
      rooms: [...node.querySelectorAll('.plb-room')].every((room) => room.scrollWidth <= room.clientWidth && room.getBoundingClientRect().height >= 44),
    }));
    expect(facts, `at ${width}px`).toEqual({ over: 0, canvas: width <= 700 ? 'rgb(255, 255, 255)' : 'rgb(246, 243, 235)', stage: width >= 900, rooms: true });
  }
  expect(errors).toEqual([]);
});

test('without the script the opener stays hidden and the dialog stays closed', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.route('**/__photo-lightbox/', (route) => route.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
  await page.goto('/__photo-lightbox/');
  await expect(opener(page)).toBeHidden();
  await expect(dialog(page)).toBeHidden();
  await context.close();
});
