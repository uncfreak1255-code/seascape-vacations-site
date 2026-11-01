// Local prototype proof. Availability is intercepted; no live booking request.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const { collect } = require('./check-preservation.cjs');
const base = process.env.STAY_PREVIEW_URL || 'http://127.0.0.1:4212';
const route = '/stays/family-vacation-rentals-anna-maria-island/';
const original = fs.readFileSync(path.resolve(__dirname, '../../../_site' + route + 'index.html'), 'utf8');
const slugs = ['bradenton-pool-home', 'the-oasis', 'dockside-dreams', 'river-house'];

(async () => {
  const browser = await chromium.launch();
  const receipts = [];
  try {
    const source = await browser.newPage();
    await source.goto(base + '/properties/');
    const expected = await source.locator('[data-property="dockside-dreams"] .catalog-check-dates').getAttribute('data-booking-base');
    const fragments = await source.evaluate((html) => [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('main p,main h1,main h2,main h3')].map((node) => node.outerHTML), original);
    const copy = fragments.map((html) => collect('<html><body>' + html + '</body></html>', route).text);
    await source.close();
    for (const flow of ['browse', 'dockside']) {
      const context = await browser.newContext({ viewport: { width: 1261, height: 903 } });
      const page = await context.newPage();
      const errors = []; page.on('pageerror', (error) => errors.push(error.message));
      let release;
      const gate = new Promise((resolve) => { release = resolve; });
      await page.route('**/.netlify/functions/booking-availability?**', async (request) => {
        await gate;
        await request.fulfill({ json: { ok: true, homes: slugs.map((slug) => ({ slug, bookable: true, reason: null, minimumStay: 2 })) } });
      });
      await page.goto(base + route + '?flow=' + flow);
      const html = await page.content();
      const before = collect(original, route), after = collect(html, route);
      assert.deepEqual(after.head, before.head, `${flow}: metadata`);
      assert.deepEqual(after.jsonLd, before.jsonLd, `${flow}: JSON-LD`);
      const body = after.text;
      for (const text of copy) assert.ok(!text || body.includes(text), `${flow}: missing original copy: ${text}`);
      const form = page.locator(flow === 'browse' ? '#catalog-trip-form' : 'form[data-booking-url]');
      const status = page.locator(flow === 'browse' ? '#trip-status' : '.g-booking .g-form-status');
      await form.locator('input[type=date]').nth(0).fill('2026-11-30');
      await form.locator('input[type=date]').nth(1).fill('2026-12-05');
      await form.locator('select').selectOption('4');
      if (flow === 'browse') await form.locator('button[type=submit]').click();
      await status.filter({ hasText: /Checking these dates/ }).waitFor();
      release();
      await status.filter({ hasText: flow === 'browse' ? /Open homes/ : /These dates are open/ }).waitFor();
      const link = page.locator(flow === 'browse' ? '.catalog-card[data-property="dockside-dreams"] .catalog-check-dates' : '[data-property-checkout]');
      const target = new URL(await link.getAttribute('href'));
      assert.equal(target.origin, new URL(expected).origin);
      assert.equal(target.pathname.split('/').at(-1), new URL(expected).pathname.split('/').at(-1));
      for (const [key, value] of [['start', '2026-11-30'], ['end', '2026-12-05'], ['numberOfGuests', '4']]) assert.equal(target.searchParams.get(key), value);
      for (const width of [1261, 768, 393, 360]) {
        await page.setViewportSize({ width, height: 903 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${flow}: overflow at ${width}`);
      }
      const a11y = (await new AxeBuilder({ page }).analyze()).violations.filter((item) => ['serious', 'critical'].includes(item.impact)).map((item) => item.id);
      assert.deepEqual(a11y, [], `${flow}: accessibility`);
      assert.deepEqual(errors, [], `${flow}: runtime errors`);
      let handoff;
      const clicked = new Promise((resolve) => { handoff = resolve; });
      await context.route(new URL(expected).origin + '/**', async (request) => {
        handoff(request.request().url());
        await request.fulfill({ contentType: 'text/html', body: '<title>Intercepted booking handoff</title>' });
      });
      await page.setViewportSize({ width: 1261, height: 903 });
      if (flow === 'browse') await link.click();
      else await form.locator('button[type=submit]').click();
      const destination = new URL(await clicked);
      assert.equal(destination.pathname, target.pathname);
      for (const key of ['start', 'end', 'numberOfGuests']) assert.equal(destination.searchParams.get(key), target.searchParams.get(key));
      receipts.push({ flow, originalParagraphsAndHeadings: copy.length, seo: 'unchanged', pendingState: true, bookingIdentity: 'dockside-dreams', datesAndGuests: true, widths: 4, a11y });
      await context.close();
    }
    console.log(JSON.stringify(receipts));
    if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(receipts, null, 2));
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
