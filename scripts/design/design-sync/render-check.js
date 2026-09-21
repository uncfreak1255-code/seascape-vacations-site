#!/usr/bin/env node
"use strict";

/*
 * design-sync render check — prove every generated preview card renders.
 *
 * For each preview/*.html in the bundle: open it at its declared @dsCard viewport,
 * wait for fonts and images, screenshot to _render/, and fail on any of:
 *   - Instrument Serif or Poppins not declared AND loaded (a missing @font-face
 *     declaration is a failure too; document.fonts.check() alone says true for a
 *     font nobody declared)
 *   - a broken <img> (naturalWidth 0), skipping lazy scene photos with no src
 *   - a CSS background-image url() that does not load (the header-over-photo card
 *     paints its scene as a background, which document.images never sees)
 *   - horizontal overflow wider than the declared viewport
 *   - a body with no visible text
 *   - any probe that throws (a crash is a failure, not a skip)
 * The previous receipt is deleted before the run so a crash cannot leave a stale
 * passing _render/render-check.json on disk. Exits 1 on any failure.
 *
 * USAGE: node scripts/design/design-sync/render-check.js [--out .design-sync/out]
 */

const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");
const { clearRenderReceipt, listPreviewCards } = require("./lib");

const ROOT = path.resolve(__dirname, "../../..");
const args = process.argv.slice(2);
const i = args.indexOf("--out");
const OUT = path.resolve(ROOT, i >= 0 && args[i + 1] ? args[i + 1] : ".design-sync/out");
const RENDER = path.join(OUT, "_render");
const RECEIPT = path.join(RENDER, "render-check.json");
const FAMILIES = ["Instrument Serif", "Poppins"];

async function probeCard(page, width) {
  return page.evaluate(
    async ({ families, width }) => {
      const errors = [];
      // Fonts: declared, loadable and loaded. fonts.check() is true for an undeclared
      // family, so require a FontFace entry for each family and force it to load.
      for (const family of families) {
        const faces = [...document.fonts].filter((f) => f.family.replace(/["']/g, "") === family);
        if (!faces.length) {
          errors.push(`${family}: no @font-face declared`);
          continue;
        }
        try {
          await Promise.all(faces.map((f) => f.load()));
        } catch (e) {
          errors.push(`${family}: font file failed to load (${e && e.message})`);
          continue;
        }
        if (!faces.some((f) => f.status === "loaded")) errors.push(`${family}: declared but not loaded`);
      }
      await document.fonts.ready;

      // <img>: lazy scene photos (data-scene-src, no src) are swapped in by guest.js on the site.
      const brokenImages = [...document.images]
        .filter((im) => im.getAttribute("src") && im.complete && im.naturalWidth === 0)
        .map((im) => im.getAttribute("src"));
      if (brokenImages.length) errors.push(`broken images: ${brokenImages.join(", ")}`);

      // CSS background images.
      const urls = new Set();
      for (const el of document.querySelectorAll("*")) {
        const bg = getComputedStyle(el).backgroundImage;
        if (!bg || bg === "none") continue;
        for (const m of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(m[1]);
      }
      for (const url of urls) {
        const ok = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img.naturalWidth > 0);
          img.onerror = () => resolve(false);
          img.src = url;
        });
        if (!ok) errors.push(`background image failed to load: ${url}`);
      }

      const scrollWidth = document.documentElement.scrollWidth;
      if (scrollWidth > width) errors.push(`horizontal overflow ${scrollWidth}px > ${width}px`);
      const text = (document.body.innerText || "").trim().length;
      if (text < 10) errors.push("no visible text");
      return errors;
    },
    { families: FAMILIES, width }
  );
}

(async () => {
  const cards = listPreviewCards(OUT);
  fs.mkdirSync(RENDER, { recursive: true });
  clearRenderReceipt(OUT);
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
    try {
      await page.goto(`file://${path.join(OUT, "preview", file)}`, { waitUntil: "networkidle" });
      errors.push(...(await probeCard(page, width)));
      await page.screenshot({ path: path.join(RENDER, file.replace(/\.html$/, ".png")), fullPage: false });
    } catch (e) {
      errors.push(`probe crashed: ${e && e.message}`);
    }
    await page.close();
    results.push({ file, width, height, ok: errors.length === 0, errors });
    console.log(`${errors.length ? "FAIL" : "ok  "} ${file} ${errors.join("; ")}`);
  }
  await browser.close();
  const bad = results.filter((r) => !r.ok).length;
  fs.writeFileSync(RECEIPT, JSON.stringify({ total: results.length, bad, results }, null, 2));
  console.log(`\n${results.length - bad}/${results.length} cards render clean -> ${RENDER}`);
  process.exit(bad ? 1 : 0);
})().catch((e) => {
  console.error(e);
  clearRenderReceipt(OUT);
  process.exit(1);
});
