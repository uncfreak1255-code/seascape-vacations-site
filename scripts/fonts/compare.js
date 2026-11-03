// node scripts/fonts/compare.js BEFORE_ROOT AFTER_ROOT OUTPUT_DIR FROZEN_RESPONSE_DIR
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { chromium } = require('playwright');
const { hash, isolate, probe, startStaticServer, closeServer } = require('./proof-lib');
const routes = ['/__font-proof', '/__font-extended-a', '/guides/best-restaurants-anna-maria-island/', '/property-management/airbnb-management-services-sarasota/', '/', '/properties/', '/properties/coastal-stay/', '/property-management/',
  '/guides/', '/research/owner-fee-revenue-leak-benchmark-2026/',
  '/research/how-seascape-protects-owner-net-2026/', '/guides/siesta-key-vs-anna-maria-island-families/',
  '/guides/anna-maria-island-vacation-cost/', '/guides/rainy-day-activities-bradenton-sarasota/',
  '/guides/bradenton-vs-sarasota-beaches/', '/guides/bradenton-area-guide/',
  '/research/gulf-coast-vacation-rental-chart-pack-2026/'];
async function pixels(before, after, output) {
  const a = await sharp(before).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(after).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (a.info.width !== b.info.width || a.info.height !== b.info.height) return { dimensionsChanged: true };
  let differentPixels = 0, maxChannelDelta = 0, sumChannelDelta = 0;
  const diff = Buffer.alloc(a.data.length, 255);
  for (let i = 0; i < a.data.length; i += 4) {
    let changed = false;
    for (let c = 0; c < 3; c++) {
      const delta = Math.abs(a.data[i+c] - b.data[i+c]);
      if (delta) { changed = true; maxChannelDelta = Math.max(maxChannelDelta, delta); sumChannelDelta += delta; }
      diff[i+c] = delta ? 255 : Math.round(a.data[i+c] * .15);
    }
    if (changed) differentPixels++;
  }
  await sharp(diff, { raw: a.info }).png().toFile(output);
  return { differentPixels, totalPixels: a.info.width * a.info.height, maxChannelDelta, sumChannelDelta };
}
async function main() {
  const [beforeArg, afterArg, outArg, cacheDir] = process.argv.slice(2);
  if (!cacheDir) throw new Error('Usage: compare.js BEFORE_ROOT AFTER_ROOT OUTPUT_DIR FROZEN_RESPONSE_DIR');
  const roots = [beforeArg, afterArg].map(p => path.resolve(p));
  const out = path.resolve(outArg); fs.mkdirSync(out, { recursive: true });
  const servers = await Promise.all(roots.map(root => startStaticServer({ root, port: 0 })));
  const browser = await chromium.launch();
  const results = [];
  const selectedRoutes = process.argv.slice(6);
  const proofRoutes = selectedRoutes.length ? selectedRoutes : routes;
  try {
    for (const width of [1440, 393]) for (const route of proofRoutes) {
      const captures = [], states = [];
      const id = `${width}-${route.replace(/[^a-z0-9]+/gi, '_')}`;
      for (let side = 0; side < 2; side++) {
        const origin = servers[side].url;
        const context = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 1,
          reducedMotion: 'reduce', locale: 'en-US', timezoneId: 'America/New_York' });
        await isolate(context, origin, cacheDir, side === 0);
        const page = await context.newPage();
        await page.clock.setFixedTime(new Date('2026-11-03T20:00:00Z'));
        await page.route(origin + '/__font-proof', r => r.fulfill({ body: probe(roots[side]), contentType: 'text/html' }));
        await page.route(origin + '/__font-extended-a', r => r.fulfill({ body: probe(roots[side], true), contentType: 'text/html' }));
        const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
        if (!response.ok()) throw new Error(`${route}: ${response.status()}`);
        await page.evaluate(() => document.fonts.ready);
        await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 20)); }
          window.scrollTo(0, 0);
          await Promise.race([Promise.all([...document.images].map(i => i.decode().catch(() => {}))), new Promise(r => setTimeout(r, 2000))]);
        });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)))));
        // Full-page capture itself can trigger a reflow; settle it before reading rectangles.
        await page.screenshot({ fullPage: true, animations: 'disabled' });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const state = await page.evaluate(() => {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), boxes = [], labels = [];
          while (walker.nextNode()) {
            const node = walker.currentNode;
            if (!node.textContent.trim() || ['SCRIPT','STYLE','NOSCRIPT'].includes(node.parentElement.tagName)) continue;
            const range = document.createRange(); range.selectNode(node);
            boxes.push([...range.getClientRects()].map(r => [r.x + scrollX, r.y + scrollY, r.width, r.height]));
            labels.push(node.textContent.trim().slice(0, 80));
          }
          return { text: document.body.innerText, boxes, labels };
        });
        states.push({ textHash: hash(state.text), layoutHash: hash(JSON.stringify(state.boxes)), boxes: state.boxes, labels: state.labels });
        const file = path.join(out, `${id}-${side ? 'after' : 'before'}.png`);
        await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
        captures.push(file); await context.close();
      }
      const result = { width, route, sameContent: states[0].textHash === states[1].textHash,
        sameTextLayout: states[0].layoutHash === states[1].layoutHash,
        ...await pixels(...captures, path.join(out, `${id}-diff.png`)) };
      if (!result.sameTextLayout) fs.writeFileSync(path.join(out, `${id}-layout.json`), JSON.stringify(
        states[0].boxes.flatMap((box, i) => JSON.stringify(box) === JSON.stringify(states[1].boxes[i]) ? [] :
          [{ text: states[0].labels[i], before: box, after: states[1].boxes[i] }]).slice(0, 10), null, 2));
      results.push(result); console.log(JSON.stringify(result));
    }
    const context = await browser.newContext();
    const origin = servers[1].url;
    await isolate(context, origin, cacheDir);
    await context.route(origin + '/__font-ascii', r => r.fulfill({ contentType: 'text/html',
      body: probe(roots[1], true).replace(/<script>[\s\S]*?<\/script>/, `<p style="font-family:Poppins">ASCII only</p>
        <p style="font-family:'Instrument Serif'">ASCII only</p><p style="font-family:'Playfair Display'">ASCII only</p>`) }));
    const page = await context.newPage(), extensions = new Set();
    page.on('response', r => { if (r.ok() && /-extended(?:-[a-f0-9]+)?\.woff2$|\/assets\/fonts\/extended\//.test(r.url())) extensions.add(new URL(r.url()).pathname); });
    await page.goto(origin + '/__font-ascii', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    if (extensions.size) throw new Error('ASCII-only probe downloaded extended fonts');
    await page.evaluate(async () => {
      await document.fonts.load('400 30px Poppins', 'Ł');
      await document.fonts.load('400 30px "Playfair Display"', 'Ł');
    });
    const manifest = require('./manifest.json');
    const expected = ['upstream-poppins-400.woff2', 'upstream-playfair-display.woff2'].map(name => '/' + manifest[name].parts.extended.path.replace(/^src\//, ''));
    if (JSON.stringify([...extensions].sort()) !== JSON.stringify(expected.sort())) {
      fs.writeFileSync(path.join(out, 'demand-loading-failed.json'), JSON.stringify({ actual: [...extensions], expected }, null, 2));
      throw new Error('Extended demand-loading mismatch: ' + JSON.stringify([...extensions]));
    }
    const providerRequests = [...extensions].sort();
    await context.close();
    const primary = await browser.newContext();
    await isolate(primary, origin, cacheDir);
    await primary.route(origin + '/__font-ascii', r => r.fulfill({ contentType: 'text/html',
      body: probe(roots[1]).replace(/<script>[\s\S]*?<\/script>/, '<p style="font-family:Instrument Serif">ASCII only</p>') }));
    const primaryPage = await primary.newPage(), primaryExtensions = new Set();
    primaryPage.on('response', r => { if (r.ok() && /-extended(?:-[a-f0-9]+)?\.woff2$/.test(r.url())) primaryExtensions.add(new URL(r.url()).pathname); });
    await primaryPage.goto(origin + '/__font-ascii', { waitUntil: 'networkidle' });
    await primaryPage.evaluate(() => document.fonts.ready);
    if (primaryExtensions.size) throw new Error('ASCII-only primary probe downloaded extended fonts');
    await primaryPage.evaluate(async () => {
      await document.fonts.load('400 30px "Instrument Serif"', '£');
      await document.fonts.load('italic 400 30px "Instrument Serif"', '£');
    });
    const expectedPrimary = ['instrument-serif.woff2', 'instrument-serif-italic.woff2'].map(name => '/' + manifest[name].parts.extended.path.replace(/^src\//, ''));
    if (JSON.stringify([...primaryExtensions].sort()) !== JSON.stringify(expectedPrimary.sort())) throw new Error('Instrument demand-loading mismatch: ' + JSON.stringify([...primaryExtensions]));
    fs.writeFileSync(path.join(out, 'demand-loading.json'), JSON.stringify({ asciiExtendedRequests: 0,
      providerCharacterRequests: providerRequests, instrumentCharacterRequests: [...primaryExtensions].sort() }, null, 2) + '\n');
    await primary.close();
    fs.writeFileSync(path.join(out, 'pixels.json'), JSON.stringify(results, null, 2) + '\n');
    // Exact pixels: no percent tolerance and no baseline updates.
    if (results.some(r => !r.sameContent || !r.sameTextLayout || r.dimensionsChanged || r.differentPixels > 0)) process.exitCode = 1;
  } finally { await browser.close(); await Promise.all(servers.map(s => closeServer(s.server))); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
