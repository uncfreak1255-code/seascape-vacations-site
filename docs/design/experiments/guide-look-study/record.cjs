// Records a short clip of the moving moment in each view that has one, for the pull request.
//
//   node docs/design/experiments/guide-look-study/record.cjs <out_dir> [a|c ...]
//
// Writes <out_dir>/motion-<view>.webm and, when ffmpeg is installed, motion-<view>.gif.
// A recording shows that the motion plays, not how it feels on a real phone.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { start, GUIDE } = require('./serve.cjs');

function need(name) {
  try { return require(name); } catch { return require(path.join(process.cwd(), 'node_modules', name)); }
}
const { chromium } = need('@playwright/test');

const PHONE = { width: 390, height: 844 };
const DESK = { width: 1280, height: 720 };
const pause = (page, ms) => page.waitForTimeout(ms);

// Scroll like a thumb, not like a script: a short eased glide to `top`.
async function glide(page, top, ms = 900) {
  await page.evaluate(([to, time]) => new Promise((done) => {
    const from = window.scrollY;
    const began = performance.now();
    (function step(now) {
      const t = Math.min(1, (now - began) / time);
      window.scrollTo(0, from + (to - from) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step); else done();
    })(began);
  }), [top, ms]);
}
const topOf = (page, selector, gap = 90) => page.evaluate(([sel, pad]) => document.querySelector(sel).getBoundingClientRect().top + window.scrollY - pad, [selector, gap]);

const SCRIPTS = {
  // Map first: the markers arrive in guide order, then each name answers its marker.
  a: [DESK, async (page) => {
    await pause(page, 1100);
    for (const k of [1, 2, 3, 4, 5, 3]) {
      await page.hover(`.a-link[data-k="${k}"]`);
      await pause(page, 520);
    }
    await page.mouse.move(40, 600);
    await pause(page, 500);
  }],
  // Photo cards has no moving moment (see review.md), so it has no clip.
  // Fact strips: the paragraphs grow out of the row that was tapped, and fold back into it.
  c: [PHONE, async (page) => {
    await glide(page, await topOf(page, '#pg-1'), 800);
    await pause(page, 500);
    const row = page.locator('#pg-1 summary');
    await row.tap();
    await pause(page, 1300);
    await row.tap();
    await pause(page, 900);
    await row.tap();
    await pause(page, 900);
  }],
};

(async () => {
  const [out, ...asked] = process.argv.slice(2);
  if (!out) throw new Error('usage: record.cjs <out_dir> [a|c ...]');
  const views = asked.length ? asked : Object.keys(SCRIPTS);
  const unknown = views.filter((view) => !SCRIPTS[view]);
  if (unknown.length) throw new Error(`no moving moment to record for: ${unknown.join(', ')} (views with one: ${Object.keys(SCRIPTS).join(', ')})`);
  fs.mkdirSync(out, { recursive: true });
  const server = await start(0);
  const browser = await chromium.launch();
  let tmp;
  try {
    for (const view of views) {
      const [viewport, play] = SCRIPTS[view];
      tmp = fs.mkdtempSync(path.join(out, 'tmp-'));
      const context = await browser.newContext({ viewport, hasTouch: viewport === PHONE, recordVideo: { dir: tmp, size: viewport } });
      await context.addInitScript(() => { try { localStorage.setItem('seascape_email_popup_shown', 'subscribed'); } catch (error) { /* private mode */ } });
      await context.route('**/*', (route) => (new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort()));
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:${server.address().port}${GUIDE}?view=${view}&chrome=0`);
      await play(page);
      await context.close();
      const webm = path.join(out, `motion-${view}.webm`);
      fs.renameSync(path.join(tmp, fs.readdirSync(tmp)[0]), webm);
      try {
        // Small enough to sit in a pull request: 12 frames a second, 64 colours, phone clips 300px wide.
        const filter = `fps=12,scale=${viewport === PHONE ? 300 : 640}:-1:flags=lanczos,split[x][y];[x]palettegen=max_colors=64[p];[y][p]paletteuse=dither=bayer:bayer_scale=5`;
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', webm, '-vf', filter, path.join(out, `motion-${view}.gif`)]);
      } catch (error) {
        console.log(`no gif for ${view}: ${error.message.split('\n')[0]}`);
      }
      console.log(`recorded ${view}`);
    }
  } finally {
    // Also on a failed run, so no half-written clip folder is left beside the proof files.
    if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
