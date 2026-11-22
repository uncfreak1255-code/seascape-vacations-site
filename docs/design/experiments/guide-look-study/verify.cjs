// Checks the views of the guide look study against today's page. Exit code 0 means every
// requested view keeps the copy contract (contract.cjs), fits the screen, and adds no new
// accessibility, type-size or tap-target problem.
//
//   node docs/design/experiments/guide-look-study/verify.cjs            all three views
//   node docs/design/experiments/guide-look-study/verify.cjs a          one view
//   node docs/design/experiments/guide-look-study/verify.cjs control    today's page and the self-test only
//   PROOF_DIR=<dir> node .../verify.cjs                                 also write screenshots there
//
// It starts its own server on a free port, so nothing else needs to be running. It needs a
// built site (`npm run build`, or STUDY_SITE_ROOT) and the repo's node_modules (or NODE_PATH).
const fs = require('node:fs');
const path = require('node:path');
const { start, GUIDE, STUDY_ROOT } = require('./serve.cjs');
const contract = require('./contract.cjs');

function need(name) {
  try { return require(name); } catch { return require(path.join(process.cwd(), 'node_modules', name)); }
}
const { chromium } = need('@playwright/test');
const AxeBuilder = need('@axe-core/playwright').default;

const SIZES = [[1440, 900], [393, 852], [375, 812], [360, 740]];
const DEEP = new Set([1440, 393]); // widths that also get the floor and axe checks
const LABELS = { control: 'Today', a: 'A · Map first', b: 'B · Photo cards', c: 'C · Fact strips' };

async function open(browser, origin, view, viewport, scale) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: scale || 1 });
  // The email popup opens on a timer; it is not part of the question, so it stays shut.
  await context.addInitScript(() => { try { localStorage.setItem('seascape_email_popup_shown', 'subscribed'); } catch (error) { /* private mode */ } });
  const seen = { errors: [], outside: [], failed: [] };
  await context.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname;
    if (host === '127.0.0.1') return route.continue();
    seen.outside.push(host);
    return route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => seen.errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) seen.failed.push(new URL(response.url()).pathname); });
  await page.goto(`${origin}${GUIDE}?view=${view}&chrome=0`);
  seen.ready = await page.waitForFunction(() => document.documentElement.dataset.studyReady === '1', null, { timeout: 8000 }).then(() => true, () => false);
  await page.evaluate(() => document.fonts.ready);
  return { context, page, seen };
}

async function measure(browser, origin, view, [width, height], mutate) {
  const { context, page, seen } = await open(browser, origin, view, { width, height });
  if (mutate) await page.evaluate(mutate);
  const out = { ...seen, width };
  out.overflowClosed = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  out.snap = await page.evaluate(contract.snapshot); // opens every toggle, so the checks below see all of the page
  if (DEEP.has(width) && !mutate) {
    out.smallText = await page.evaluate(contract.smallText);
    out.smallTargets = width === 393 ? await page.evaluate(contract.smallTargets) : [];
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    out.axe = axe.violations.map((violation) => [violation.id, violation.nodes.length, violation.nodes[0].html.replace(/\s+/g, ' ').slice(0, 110)]);
  }
  await context.close();
  return out;
}

// Everything a view does that today's page does not is a failure.
function judge(control, view, strings) {
  const fails = [];
  if (!view.ready) fails.push('the view script never set the ready flag');
  const fresh = (key) => [...new Set(view[key])].filter((item) => !control[key].includes(item));
  for (const item of fresh('errors')) fails.push(`script error: ${item}`);
  for (const item of fresh('outside')) fails.push(`request to an outside host: ${item}`);
  for (const item of fresh('failed')) fails.push(`request failed: ${item}`);
  if (view.overflowClosed > 0) fails.push(`page is ${view.overflowClosed}px wider than the screen`);
  const result = contract.compare(control.snap, view.snap, strings);
  fails.push(...result.fails);
  if (view.axe) {
    for (const item of fresh('smallText')) fails.push(`text under 12px: ${item}`);
    for (const item of fresh('smallTargets')) fails.push(`tap target under 44px: ${item}`);
    for (const [id, count, html] of view.axe) {
      const before = (control.axe.find((row) => row[0] === id) || [id, 0])[1];
      if (count > before) fails.push(`axe ${id}: ${count} (today's page: ${before}), for example ${html}`);
    }
  }
  return { fails, result };
}

// The contract is only worth having if it fails when the page is damaged. Each break is applied
// to today's page and must be reported; a break that slips through fails the whole run.
const para = 'document.querySelectorAll("#pg-1 p")[1]';
const BREAKS = [
  ['a deleted paragraph', /copy removed/, `${para}.remove()`],
  ['a retyped word', /copy removed/, `${para}.firstChild.nodeValue = "Changed. " + ${para}.firstChild.nodeValue`],
  ['a paragraph hidden with display:none', /no longer rendered/, `${para}.style.display = "none"`],
  ['a paragraph hidden with opacity', /no longer rendered/, `${para}.parentElement.style.opacity = "0"`],
  ['a paragraph clipped in a zero-height box', /no longer rendered/, `(() => { const p = ${para}; const box = document.createElement("div"); box.style.cssText = "height:0;overflow:hidden"; p.replaceWith(box); box.append(p); })()`],
  ['a paragraph pushed off the page', /no longer rendered/, `${para}.style.cssText = "position:absolute;left:-9999px"`],
  ['an unlisted sentence', /text added without being listed/, `${para}.append(" One more sentence.")`],
  ['a heading retagged', /heading changed/, '(() => { const h = document.querySelector("#pg-1 h2"); const n = document.createElement("h3"); n.textContent = h.textContent; h.replaceWith(n); })()'],
  ['a dropped link', /link removed/, '(() => { const a = document.querySelector("main a[href]"); a.replaceWith(...a.childNodes); })()'],
  ['a duplicated section id', /id used 2 times/, 'document.querySelector("#pg-2").id = "pg-1"'],
  ['a changed meta description', /metadata changed/, 'document.querySelector("meta[name=description]").content = "x"'],
  ['a changed JSON-LD block', /metadata changed/, 'document.querySelector("script[type=\\"application/ld+json\\"]").textContent = "{}"'],
];

async function selfTest(browser, origin, control) {
  const missed = [];
  const untouched = judge(control, await measure(browser, origin, 'control', SIZES[0], 'void 0'), {}).fails;
  if (untouched.length) missed.push(`that an untouched page is fine (false alarm: ${untouched[0]})`);
  for (const [name, expected, script] of BREAKS) {
    const broken = await measure(browser, origin, 'control', SIZES[0], script);
    if (!judge(control, broken, {}).fails.some((line) => expected.test(line))) missed.push(name);
  }
  return missed;
}

async function settle(page) {
  // Walk the page once so lazy images load, then go back to the top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((done) => setTimeout(done, 50));
    }
    window.scrollTo(0, 0);
    await new Promise((done) => setTimeout(done, 250));
  });
}

async function proof(browser, origin, views, dir) {
  fs.mkdirSync(dir, { recursive: true });
  for (const view of views) {
    for (const [name, viewport, scale] of [['1440', { width: 1440, height: 900 }, 1], ['390', { width: 390, height: 844 }, 2]]) {
      const { context, page } = await open(browser, origin, view, viewport, scale);
      await settle(page);
      await page.screenshot({ path: path.join(dir, `${view}-${name}-top.jpg`), type: 'jpeg', quality: 82 });
      // Close-ups of the parts the versions change most, for looking at detail.
      for (const part of ['.pg-open', '#pg-1', '#pg-2', '#pg-5', '#pg-6', '#pg-10']) {
        const file = path.join(dir, 'parts', `${view}-${name}-${part.replace(/[^a-z0-9]+/g, '')}.jpg`);
        await page.locator(part).first().screenshot({ path: file, type: 'jpeg', quality: 80 }).catch(() => {});
      }
      await context.close();
      // The whole page is captured at 1x: a 2x capture of a page this long is taller than the browser can draw.
      const whole = await open(browser, origin, view, viewport, 1);
      await settle(whole.page);
      await whole.page.screenshot({ path: path.join(dir, `${view}-${name}-full.jpg`), type: 'jpeg', quality: 72, fullPage: true });
      if (await whole.page.locator('main details').count()) {
        await whole.page.evaluate(() => { for (const details of document.querySelectorAll('main details')) details.open = true; });
        await whole.page.screenshot({ path: path.join(dir, `${view}-${name}-open-full.jpg`), type: 'jpeg', quality: 72, fullPage: true });
      }
      await whole.context.close();
    }
  }
  // One picture for a phone: the four views side by side, top of page and first beach.
  const frames = views.map((view) => `<figure><figcaption>${LABELS[view]}</figcaption><iframe src="${origin}${GUIDE}?view=${view}&chrome=0"></iframe></figure>`).join('');
  const html = `<style>body{margin:0;padding:24px;display:flex;gap:24px;background:#1c1c1e;font:600 22px -apple-system,sans-serif;color:#fff}
    figure{margin:0}figcaption{margin:0 0 14px}iframe{display:block;width:390px;height:1900px;border:0;background:#fff}</style>${frames}`;
  const context = await browser.newContext({ viewport: { width: 24 + views.length * 414, height: 1990 }, deviceScaleFactor: 1.5 });
  await context.addInitScript(() => { try { localStorage.setItem('seascape_email_popup_shown', 'subscribed'); } catch (error) { /* private mode */ } });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  for (const frame of page.frames().slice(1)) {
    await frame.waitForFunction(() => document.documentElement.dataset.studyReady === '1', null, { timeout: 8000 }).catch(() => {});
    await frame.evaluate(() => document.fonts.ready);
  }
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(dir, 'board-phone.jpg'), type: 'jpeg', quality: 80 });
  await context.close();
}

(async () => {
  const asked = process.argv.slice(2);
  const views = asked.length ? asked.filter((view) => view !== 'control') : ['a', 'b', 'c'];
  const server = await start(0);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  let failed = 0;
  try {
    const control = {};
    for (const size of SIZES) control[size[0]] = await measure(browser, origin, 'control', size);
    const base = control[1440];
    console.log(`today's page: ${base.snap.text.length} text nodes, ${base.snap.headings.length} headings, ${base.snap.hrefs.length} links`);
    for (const width of DEEP) {
      const row = control[width];
      console.log(`today's page at ${width}: axe [${row.axe.map((item) => `${item[0]} x${item[1]}`).join(', ') || 'clean'}], text under 12px ${row.smallText.length}, tap targets under 44px ${row.smallTargets.length}, overflow ${Math.max(0, row.overflowClosed)}px`);
    }
    const missed = await selfTest(browser, origin, base);
    console.log(missed.length ? `FAIL self-test: the contract did not notice ${missed.join('; ')}` : `PASS self-test: the contract caught all ${BREAKS.length} deliberate breaks`);
    failed += missed.length;

    for (const view of views) {
      const file = path.join(STUDY_ROOT, 'views', view, 'strings.json');
      if (!fs.existsSync(file)) {
        console.log(`FAIL ${view}: views/${view}/strings.json is missing (view not built)`);
        failed += 1;
        continue;
      }
      const strings = JSON.parse(fs.readFileSync(file, 'utf8'));
      const results = [];
      const lines = new Map();
      for (const size of SIZES) {
        const { fails, result } = judge(control[size[0]], await measure(browser, origin, view, size), strings);
        results.push(result);
        for (const line of fails) lines.set(line, [...(lines.get(line) || []), size[0]]);
      }
      for (const line of contract.staleEntries(strings, results)) lines.set(line, ['list']);
      console.log(`${lines.size ? 'FAIL' : 'PASS'} ${view} (${LABELS[view]}) at ${SIZES.map((size) => size[0]).join(', ')}`);
      for (const [line, where] of lines) console.log(`  - [${where.join(',')}] ${line}`);
      failed += lines.size;
    }
    if (process.env.PROOF_DIR) {
      await proof(browser, origin, ['control', ...views], process.env.PROOF_DIR);
      console.log(`proof written to ${process.env.PROOF_DIR}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
  console.log(failed ? `FAILED: ${failed} problem(s)` : 'PASSED');
  process.exit(failed ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
