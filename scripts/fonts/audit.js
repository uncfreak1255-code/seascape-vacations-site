// node scripts/fonts/audit.js BUILT_ROOT OUTPUT.json FROZEN_RESPONSE_DIR
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { files, hash, isolate, startStaticServer, closeServer } = require('./proof-lib');
async function main() {
  const [rootArg, output, cacheDir] = process.argv.slice(2);
  if (!cacheDir) throw new Error('Usage: audit.js BUILT_ROOT OUTPUT.json FROZEN_RESPONSE_DIR');
  const root = path.resolve(rootArg);
  const server = await startStaticServer({ root, port: 0 });
  const browser = await chromium.launch();
  const results = [];
  try {
    const queue = files(root).filter(p => p.endsWith('.html'));
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (queue.length) {
        const file = queue.shift();
        const route = '/' + path.relative(root, file).replace(/index.html$/, '');
        const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
        await isolate(context, server.url, cacheDir, true);
        const page = await context.newPage();
        await page.clock.setFixedTime(new Date('2026-11-03T20:00:00Z'));
        const requests = new Set();
        page.on('response', r => {
          if (r.ok() && /\.(woff2?|ttf)(\?|$)/.test(r.url())) requests.add(
            r.url().startsWith(server.url) ? new URL(r.url()).pathname : r.url());
        });
        const response = await page.goto(server.url + route, { waitUntil: 'networkidle' });
        if (!response.ok()) throw new Error(`${route}: ${response.status()}`);
        await page.evaluate(() => document.fonts.ready);
        const data = await page.evaluate(() => {
          const uses = {};
          const chars = new Set();
          function record(el, text) {
            if (!text.trim()) return;
            const c = getComputedStyle(el);
            const key = JSON.stringify({ family: c.fontFamily, weight: c.fontWeight, style: c.fontStyle,
              variation: c.fontVariationSettings, features: c.fontFeatureSettings, variant: c.fontVariant,
              kerning: c.fontKerning, optical: c.fontOpticalSizing, hyphens: c.hyphens });
            uses[key] = (uses[key] || '') + text;
            for (const ch of text) chars.add(ch.codePointAt(0));
          }
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const node = walker.currentNode;
            if (!['SCRIPT','STYLE','NOSCRIPT'].includes(node.parentElement.tagName)) record(node.parentElement, node.textContent);
          }
          for (const el of document.querySelectorAll('input,textarea,select,button')) record(el, (el.placeholder || '') + (el.value || ''));
          for (const el of document.querySelectorAll('body *')) for (const pseudo of ['::before','::after']) {
            const c = getComputedStyle(el, pseudo).content;
            if (c && !['none','normal','""'].includes(c)) for (const ch of c) chars.add(ch.codePointAt(0));
          }
          return { text: document.body.innerText, uses: Object.entries(uses).map(([key, text]) => ({ ...JSON.parse(key),
            characters: [...new Set([...text].map(c => c.codePointAt(0)))].sort((a,b) => a-b) })),
          characters: [...chars].sort((a,b) => a-b),
          preloads: [...document.querySelectorAll('link[rel=preload][as=font]')].map(e => new URL(e.href).pathname) };
        });
        const remote = JSON.parse(fs.readFileSync(path.join(cacheDir, 'map.json')));
        data.textHash = hash(data.text); delete data.text;
        data.route = route; data.requests = [...requests].sort();
        data.bytes = data.requests.reduce((n, url) => n + (remote[url]?.bytes ?? fs.statSync(path.join(root, url)).size), 0);
        results.push(data);
        await context.close();
      }
    }));
    fs.writeFileSync(output, JSON.stringify(results.sort((a,b) => a.route.localeCompare(b.route)), null, 2) + '\n');
    console.log(`Audited ${results.length} routes; ${Math.min(...results.map(p => p.bytes))}–${Math.max(...results.map(p => p.bytes))} font bytes per cold page.`);
  } finally { await browser.close(); await closeServer(server.server); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
