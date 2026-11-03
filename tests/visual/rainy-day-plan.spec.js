const { test, expect } = require('@playwright/test');
const route = '/guides/rainy-day-activities-bradenton-sarasota/';

test('Rainy Day plans select one result by mouse and keyboard', async ({page}) => {
  await page.goto(route);
  const choices = page.getByRole('group', {name:'Choose a rainy-day plan'});
  await expect(choices).toBeVisible();
  for (const [name, key] of [['A short shower','short'],['A rainy afternoon','afternoon'],['An afternoon in','home']]) {
    const button = choices.getByRole('button', {name, exact:true});
    await button.focus();
    await page.keyboard.press('Space');
    await expect(button).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('[data-plan-panel]:visible')).toHaveCount(1);
    await expect(page.locator(`[data-plan-panel="${key}"]`)).toBeVisible();
  }
  const dates=page.locator('.guide-stay-here__btn');
  await dates.scrollIntoViewIfNeeded();
  await expect(page.locator('#sticky-book-bar')).toBeHidden();
  await expect(dates).toHaveAttribute('href','/properties/coastal-stay/#check-availability');
  const photo=page.locator('.guide-stay-here__media img');
  await expect(photo).toHaveAttribute('src','/images/homes/coastal-stay/08.webp');
  await expect(photo).toHaveJSProperty('naturalWidth',1400);
});

test('Rainy Day keeps suggestions and the complete comparison without JavaScript', async ({browser,baseURL}) => {
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto(baseURL+route);
  await expect(page.locator('.fx-choices')).toBeHidden();
  await expect(page.locator('[data-plan-panel]:visible')).toHaveCount(3);
  await page.locator('.fx-full-comparison summary').click();
  await expect(page.locator('.ag-table tbody tr')).toHaveCount(6);
  await expect(page.locator('.ag-table')).toBeVisible();
  await expect(page.locator('.guide-stay-here__btn')).toHaveAttribute('href','/properties/coastal-stay/#check-availability');
  await context.close();
});
