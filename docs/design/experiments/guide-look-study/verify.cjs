// Checks the views of the guide look study against today's page. Exit code 0 means every
// requested view keeps the copy contract (contract.cjs), fits the screen, and adds no new
// accessibility, type-size or tap-target problem. Each view is judged at rest with motion on,
// with reduced motion, and with motion switched off (see MODES).
//
//   node docs/design/experiments/guide-look-study/verify.cjs            all four views
//   node docs/design/experiments/guide-look-study/verify.cjs a          one view
//   node docs/design/experiments/guide-look-study/verify.cjs control    today's page and the self-test only
//   PROOF_DIR=<dir> node .../verify.cjs                                 also write screenshots there
//
// It starts its own server on a free port, so nothing else needs to be running. It needs a
// built site (`npm run build`, or STUDY_SITE_ROOT) and the repo's node_modules (or NODE_PATH).
const fs = require('node:fs');
const path = require('node:path');
const { start, viewStrings, GUIDE, STUDY_ROOT } = require('./serve.cjs');
const contract = require('./contract.cjs');

function need(name) {
  try { return require(name); } catch { return require(path.join(process.cwd(), 'node_modules', name)); }
}
const { chromium } = need('@playwright/test');
const AxeBuilder = need('@axe-core/playwright').default;

const SIZES = [[1440, 900], [393, 852], [375, 812], [360, 740]];
const DEEP = new Set([1440, 393]); // widths that also get the floor and axe checks
const LABELS = { control: 'Today', a: 'A · Map first', b: 'B · Photo cards', c: 'C · Fact strips', d: 'D · Map with toggle' };
// Every view is judged three ways. motion: as most readers get it. reduced: with the reader's
// "reduce motion" setting on. still: with every animation and transition switched off, so copy
// that needs one to become visible is caught.
const MODES = ['motion', 'reduced', 'still'];
const STILL = '*,*::before,*::after{animation:none!important;transition:none!important}';

// Runs in the browser. Opens every toggle when asked, then jumps each running animation and
// transition to its end, so a view is judged at rest and not at the instant the check looked.
// Nothing is scrolled or clicked, so copy that waits for either stays hidden and fails.
// Returns the animations that never end.
async function rest(openToggles) {
  const toggles = [...document.querySelectorAll('details')];
  if (openToggles) for (const details of toggles) details.open = true;
  const frame = () => new Promise((done) => requestAnimationFrame(done));
  await frame();
  await frame();
  const endless = [];
  for (const animation of document.getAnimations()) {
    const timing = animation.effect && animation.effect.getComputedTiming();
    if (timing && timing.endTime === Infinity) endless.push(animation.animationName || animation.transitionProperty || 'script animation');
    else try { animation.finish(); } catch (error) { /* not finishable, so it is not hiding anything at rest */ }
  }
  // Chromium does not list a transition on a toggle's own content box (::details-content), so
  // also wait until the page has stopped changing shape.
  const shape = () => document.documentElement.scrollHeight + ':' + toggles.map((details) => details.offsetHeight).join();
  for (let last = '', tries = 0; tries < 30 && last !== shape(); tries += 1) {
    last = shape();
    await new Promise((done) => setTimeout(done, 100));
  }
  return endless;
}

// Runs in the browser. Asks for every image now (card photos load lazily and sit far down the
// page, so a check that never scrolls would not request them) and returns the ones that failed.
async function unloadedImages() {
  const images = [...document.images];
  await Promise.all(images.map((img) => {
    img.loading = 'eager';
    if (img.complete) return null;
    return new Promise((done) => {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
      setTimeout(done, 5000);
    });
  }));
  return images.filter((img) => !img.naturalWidth).map((img) => new URL(img.currentSrc || img.src, location.href).pathname);
}

async function open(browser, origin, view, viewport, scale, mode) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: scale || 1, reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' });
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
  if (mode === 'still') await page.addStyleTag({ content: STILL });
  seen.ready = await page.waitForFunction(() => document.documentElement.dataset.studyReady === '1', null, { timeout: 8000 }).then(() => true, () => false);
  await page.evaluate(() => document.fonts.ready);
  return { context, page, seen };
}

async function measure(browser, origin, view, [width, height], mutate, mode = 'motion') {
  const { context, page, seen } = await open(browser, origin, view, { width, height }, 1, mode);
  if (mutate) await page.evaluate(mutate);
  const out = { ...seen, width };
  out.overflowClosed = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  out.endless = await page.evaluate(rest, true); // every toggle open and all motion finished, so the checks below see all of the page
  out.snap = await page.evaluate(contract.snapshot);
  if (DEEP.has(width) && !mutate && mode === 'motion') {
    out.smallText = await page.evaluate(contract.smallText);
    out.smallTargets = width === 393 ? await page.evaluate(contract.smallTargets) : [];
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    out.axe = axe.violations.map((violation) => [violation.id, violation.nodes.length, violation.nodes[0].html.replace(/\s+/g, ' ').slice(0, 110)]);
  }
  out.unloaded = await page.evaluate(unloadedImages); // last, so loading them cannot move what was measured above
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
  for (const item of fresh('endless')) fails.push(`animation never ends: ${item}`);
  for (const item of fresh('unloaded')) fails.push(`image did not load: ${item}`);
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
// to today's page and must be reported; a break that slips through fails the whole run. A break
// with a fourth item is judged in that mode.
const para = 'document.querySelectorAll("#pg-1 p")[1]';
const late = 'document.querySelector("#pg-9 p")';
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
  ['copy that waits for a scroll to appear', /no longer rendered/, `(() => { const p = ${late}; p.style.cssText = "opacity:0;transition:opacity 300ms"; new IntersectionObserver((seen) => { if (seen[0].isIntersecting) p.style.opacity = 1; }).observe(p); })()`],
  ['copy that only an animation reveals', /no longer rendered/, '(() => { const s = document.createElement("style"); s.textContent = "@keyframes shown{to{opacity:1}}#pg-1 p{opacity:0;animation:shown 300ms forwards}"; document.head.append(s); })()', 'still'],
  ['an animation that never ends', /never ends/, 'void document.querySelector("#pg-1 h2").animate([{ opacity: 1 }, { opacity: .6 }], { duration: 900, iterations: Infinity })'],
  ['a lazy photo far down the page that cannot load', /image did not load/, '(() => { const i = new Image(); i.loading = "lazy"; i.alt = ""; i.src = "/__study/photos/missing.jpg"; document.querySelector("#pg-9").append(i); })()'],
];

async function selfTest(browser, origin, control) {
  const missed = [];
  for (const mode of MODES) {
    const untouched = judge(control[mode][1440], await measure(browser, origin, 'control', SIZES[0], 'void 0', mode), {}).fails;
    if (untouched.length) missed.push(`that an untouched page is fine with ${mode} (false alarm: ${untouched[0]})`);
  }
  for (const [name, expected, script, mode = 'motion'] of BREAKS) {
    const broken = await measure(browser, origin, 'control', SIZES[0], script, mode);
    if (!judge(control[mode][1440], broken, {}).fails.some((line) => expected.test(line))) missed.push(name);
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
      await page.evaluate(rest, false);
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
      await whole.page.evaluate(rest, false);
      await whole.page.screenshot({ path: path.join(dir, `${view}-${name}-full.jpg`), type: 'jpeg', quality: 72, fullPage: true });
      if (await whole.page.locator('main details').count()) {
        await whole.page.evaluate(rest, true);
        await whole.page.screenshot({ path: path.join(dir, `${view}-${name}-open-full.jpg`), type: 'jpeg', quality: 72, fullPage: true });
      }
      await whole.context.close();
    }
  }
  // One picture for a phone: the views side by side, top of page and first beach.
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
  const views = asked.length ? asked.filter((view) => view !== 'control') : ['a', 'b', 'c', 'd'];
  const server = await start(0);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  let failed = 0;
  try {
    const control = {};
    for (const mode of MODES) {
      control[mode] = {};
      for (const size of SIZES) control[mode][size[0]] = await measure(browser, origin, 'control', size, null, mode);
    }
    const base = control.motion[1440];
    console.log(`today's page: ${base.snap.text.length} text nodes, ${base.snap.headings.length} headings, ${base.snap.hrefs.length} links`);
    for (const width of DEEP) {
      const row = control.motion[width];
      console.log(`today's page at ${width}: axe [${row.axe.map((item) => `${item[0]} x${item[1]}`).join(', ') || 'clean'}], text under 12px ${row.smallText.length}, tap targets under 44px ${row.smallTargets.length}, overflow ${Math.max(0, row.overflowClosed)}px`);
    }
    const missed = await selfTest(browser, origin, control);
    console.log(missed.length ? `FAIL self-test: the contract did not notice ${missed.join('; ')}` : `PASS self-test: the contract caught all ${BREAKS.length} deliberate breaks`);
    failed += missed.length;

    for (const view of views) {
      let strings; // its own strings.json plus, for a view built on another, that view's
      try { strings = viewStrings(view); } catch (error) {
        console.log(`FAIL ${view}: its string list cannot be read, so the view is not built or is broken (${error.message})`);
        failed += 1;
        continue;
      }
      const results = [];
      const lines = new Map();
      for (const mode of MODES) {
        for (const size of SIZES) {
          const { fails, result } = judge(control[mode][size[0]], await measure(browser, origin, view, size, null, mode), strings);
          results.push(result);
          const where = mode === 'motion' ? size[0] : `${size[0]} ${mode}`;
          for (const line of fails) lines.set(line, [...(lines.get(line) || []), where]);
        }
      }
      for (const line of contract.staleEntries(strings, results)) lines.set(line, ['list']);
      console.log(`${lines.size ? 'FAIL' : 'PASS'} ${view} (${LABELS[view]}) at ${SIZES.map((size) => size[0]).join(', ')}, each with motion on, reduced and off`);
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
