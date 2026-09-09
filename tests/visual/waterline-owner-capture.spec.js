const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { registerStableNetwork } = require('./test-helpers');

async function visit(page) {
  await registerStableNetwork(page);
  await page.clock.setFixedTime(new Date('2026-09-09T16:00:00Z'));
  await page.goto('/?utm_source=mailchimp&utm_medium=email&utm_campaign=guest_social_proof', { waitUntil: 'networkidle' });
}
async function fillSignup(page) {
  await page.getByLabel('First name', { exact: true }).fill('Test Guest');
  await page.getByLabel('Email address', { exact: true }).fill('waterline-test@example.com');
}

test('owners have a navigation path and a homepage path to the existing review form', async ({ page, isMobile }) => {
  await visit(page);
  if (isMobile) {
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await expect(page.locator('#guest-menu a[href="/property-management/"]')).toBeVisible();
  } else {
    await expect(page.locator('.g-nav a[href="/property-management/"]')).toBeVisible();
  }
  const owner = page.locator('.g-home-owners');
  await expect(owner.getByRole('link', { name: 'Request a revenue review' })).toHaveAttribute('href', '/property-management/#owner-cta');
  await owner.getByRole('link', { name: 'Request a revenue review' }).click();
  await expect(page).toHaveURL(/\/property-management\/#owner-cta$/);
  const form = page.locator('form[name="owner-revenue-teardown"]');
  await expect(form).toBeVisible();
  await expect(form).toHaveAttribute('method', /post/i);
  await expect(form).toHaveAttribute('action', '/property-management/revenue-review-requested/');
  for (const name of ['property_address', 'owner_statement', 'what_feels_off', 'name', 'email', 'phone']) {
    await expect(form.locator('[name="' + name + '"]')).toHaveCount(1);
  }
  // The existing first step is optional; retain the flow into the owner context step.
  await form.getByRole('button', { name: 'Continue', exact: true }).first().click();
  await expect(form.locator('[name="what_feels_off"]')).toBeVisible();
});

test('signup posts once, carries consent context, and reveals SAVE50 only after completion', async ({ page }) => {
  await visit(page);
  const submitted = [];
  let finish;
  await page.route('**/.netlify/functions/guest-email-capture', async route => {
    submitted.push(route.request().postDataJSON());
    await new Promise(resolve => { finish = resolve; });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tagged: true, captureState: 'guest_capture_tag_applied' }) });
  });
  await fillSignup(page);
  const button = page.getByRole('button', { name: 'Get my $50 code', exact: true });
  await button.click();
  await expect.poll(() => submitted.length).toBe(1);
  await button.click();
  await expect(page.locator('[data-email-capture-success]')).toBeHidden();
  expect(submitted).toHaveLength(1);
  expect(submitted[0]).toMatchObject({ name: 'Test Guest', email: 'waterline-test@example.com', formName: 'email_capture', pagePath: '/', pageSlug: 'home', placement: 'home_inline', deliveryChannel: 'email', consentBasis: 'guest_requested_email_followup' });
  expect(submitted[0].submissionId).toBeTruthy();
  finish();
  const success = page.locator('[data-email-capture-success]');
  await expect(success).toBeVisible();
  await expect(success).toContainText('SAVE50');
  await expect(page.locator('[data-guest-email-form]')).toBeHidden();
  await success.getByRole('link', { name: 'Find your home' }).click();
  await expect(page).toHaveURL(/\/properties\/\?.*promo=save50/);
  await expect(page.locator('[data-save50-offer]')).toBeVisible();
  const analytics = await page.evaluate(() => JSON.stringify(window.dataLayer || []));
  expect(analytics).not.toContain('waterline-test@example.com');
  expect(analytics).not.toContain('Test Guest');
});

test('pending capture never claims a completed signup or reveals the success offer', async ({ page }) => {
  await visit(page);
  await page.route('**/.netlify/functions/guest-email-capture', route => route.fulfill({ status: 202, contentType: 'application/json', body: '{"captureState":"retry_queued"}' }));
  await fillSignup(page);
  await page.getByRole('button', { name: 'Get my $50 code', exact: true }).click();
  await expect(page.locator('[data-email-capture-pending]')).toBeVisible();
  await expect(page.locator('[data-email-capture-success]')).toBeHidden();
  await expect(page.locator('[data-guest-email-form]')).toBeHidden();
});

test('failed capture preserves entered fields and retries with the same submission identity', async ({ page }) => {
  await visit(page);
  const submitted = [];
  await page.route('**/.netlify/functions/guest-email-capture', async route => {
    submitted.push(route.request().postDataJSON());
    await route.fulfill({ status: submitted.length === 1 ? 503 : 200, contentType: 'application/json', body: submitted.length === 1 ? '{"reason":"temporarily_unavailable"}' : '{"tagged":true}' });
  });
  await fillSignup(page);
  await page.getByRole('button', { name: 'Get my $50 code', exact: true }).click();
  await expect(page.locator('[data-email-capture-error]')).toBeVisible();
  await expect(page.getByLabel('Email address', { exact: true })).toHaveValue('waterline-test@example.com');
  await expect(page.locator('[data-email-capture-success]')).toBeHidden();
  await page.getByRole('button', { name: 'Get my $50 code', exact: true }).click();
  await expect(page.locator('[data-email-capture-success]')).toBeVisible();
  expect(submitted).toHaveLength(2);
  expect(submitted[1].submissionId).toBe(submitted[0].submissionId);
});

test('signup requires valid fields and remains accessible without overflowing', async ({ page }) => {
  await visit(page);
  let requests = 0;
  await page.route('**/.netlify/functions/guest-email-capture', route => { requests++; return route.abort(); });
  await page.getByRole('button', { name: 'Get my $50 code', exact: true }).click();
  expect(requests).toBe(0);
  await expect(page.locator('#home-signup-name:invalid')).toHaveCount(1);
  const result = await new AxeBuilder({ page }).include('.g-home-signup').include('.g-home-owners').analyze();
  expect(result.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('no-JavaScript visitors retain owner access without an unsafe signup submission', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await registerStableNetwork(page);
  await page.goto(baseURL + '/', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-guest-email-form]')).toBeHidden();
  await expect(page.locator('[data-email-capture-unavailable]')).toBeVisible();
  await expect(page.locator('.g-home-owners a[href="/property-management/#owner-cta"]')).toBeVisible();
  await context.close();
});
