#!/usr/bin/env node
"use strict";

/*
 * design-sync render check — prove every generated preview card renders.
 *
 * For each preview/*.html in the bundle: open it at its declared @dsCard viewport,
 * wait for fonts and images, screenshot to _render/, and fail on any of:
 *   - Instrument Serif or Poppins not loaded (relative font path broke)
 *   - a broken image (naturalWidth 0)
 *   - horizontal overflow wider than the declared viewport
 *   - a body with no visible text
 * Writes _render/render-check.json and exits 1 on any failure.
 *
 * USAGE: node scripts/design/design-sync/render-check.js [--out .design-sync/out]
 */

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "../../..");
const args = process.argv.slice(2);
const i = args.indexOf("--out");
const OUT = path.resolve(ROOT, i >= 0 && args[i + 1] ? args[i + 1] : ".design-sync/out");
const RENDER = path.join(OUT, "_render");

(async () => {
  const cards = fs.readdirSync(path.join(OUT, "preview")).filter((f) => f.endsWith(".html")).sort();
  if (!cards.length) throw new Error(`No preview cards in ${OUT}; run build.js first.`);
  fs.mkdirSync(RENDER, { recursive: true });
  const browser = await chromium.launch();
  const results = [];
  for (const file of cards) {
    const html = fs.readFileSync(path.join(OUT, "preview", file), "utf8");
    const m = html.match(/@dsCard[^>]*viewport="(\d+)x(\d+)"/);
    const width = m ? Number(m[1]) : 760;
    const height = m ? Number(m[2]) : 400;
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    await page.goto(`file://${path.join(OUT, "preview", file)}`, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      await document.fonts.load("16px 'Instrument Serif'");
      await document.fonts.load("16px Poppins");
      await document.fonts.ready;
    });
    const probe = await page.evaluate(() => ({
      serif: document.fonts.check("16px 'Instrument Serif'"),
      poppins: document.fonts.check("16px Poppins"),
      // Lazy scene photos (data-scene-src, no src) are swapped in by guest.js on the site; skip them.
      brokenImages: [...document.images].filter((im) => im.getAttribute("src") && im.complete && im.naturalWidth === 0).map((im) => im.getAttribute("src")),
      scrollWidth: document.documentElement.scrollWidth,
      text: (document.body.innerText || "").trim().length,
    }));
    if (!probe.serif) errors.push("Instrument Serif did not load");
    if (!probe.poppins) errors.push("Poppins did not load");
    if (probe.brokenImages.length) errors.push(`broken images: ${probe.brokenImages.join(", ")}`);
    if (probe.scrollWidth > width) errors.push(`horizontal overflow ${probe.scrollWidth}px > ${width}px`);
    if (probe.text < 10) errors.push("no visible text");
    await page.screenshot({ path: path.join(RENDER, file.replace(/\.html$/, ".png")), fullPage: false });
    await page.close();
    results.push({ file, width, height, ok: errors.length === 0, errors });
    console.log(`${errors.length ? "FAIL" : "ok  "} ${file} ${errors.join("; ")}`);
  }
  await browser.close();
  const bad = results.filter((r) => !r.ok).length;
  fs.writeFileSync(path.join(RENDER, "render-check.json"), JSON.stringify({ total: results.length, bad, results }, null, 2));
  console.log(`\n${results.length - bad}/${results.length} cards render clean -> ${RENDER}`);
  process.exit(bad ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
