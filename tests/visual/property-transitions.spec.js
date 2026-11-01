const { test, expect } = require('@playwright/test');

for (const motion of [null, 'no-preference', 'reduce']) {
  test.describe(`property navigation with ${motion || 'system'} motion preference`, () => {
    test.use({ reducedMotion: motion });

    test('keeps native transitions available without navigation errors', async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => {
        window.addEventListener('pagereveal', event => {
          window.navigationTransitionProof = {
            offered: Boolean(event.viewTransition),
            reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
            finished: !event.viewTransition,
          };
          // Do not catch ready: a rejected transition must still fail the error check.
          event.viewTransition?.finished.then(() => {
            window.navigationTransitionProof.finished = true;
          });
        });
      });

      for (const slug of ['dockside-dreams', 'relaxing-oasis']) {
        await page.goto('/?sv_developer=1');
        const link = page.locator(`.g-postcard a[href="/properties/${slug}/"]`);
        await link.scrollIntoViewIfNeeded();
        await link.click();
        await expect(page).toHaveURL(new RegExp(`/properties/${slug}/`));
        await expect(page.locator('h1')).toBeVisible();
        await expect.poll(() => page.evaluate(() => window.navigationTransitionProof?.finished)).toBe(true);
        const transition = await page.evaluate(() => window.navigationTransitionProof);
        expect(transition.offered).toBe(!transition.reduced);
        await page.waitForLoadState('networkidle');
        expect(errors).toEqual([]);
      }
    });
  });
}

test.describe('static navigation', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  test('property links remain usable without JavaScript', async ({ page }) => {
    await page.goto('/');
    await page.locator('.g-postcard a[href="/properties/relaxing-oasis/"]').click();
    await expect(page.locator('h1')).toHaveText('Relaxing Oasis');
    await expect(page.locator('[data-property-checkout]')).toHaveAttribute('href', /listings\/607228/);
  });
});
