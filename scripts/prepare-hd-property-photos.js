"use strict";

// Make sharp large renditions (<name>-hd.webp, up to 2560px wide) for home photos
// from the photographers' originals, which live outside the repo.
//
//   node scripts/prepare-hd-property-photos.js "<originals root>"
//
// src/_data/photoHd.json lists each site photo, the original it was matched to
// (path relative to the originals root) and the rendition size. The script
// refuses an original whose framing differs from the site photo, so swapping
// sizes in the browser never changes what the guest sees. It never enlarges.
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const MAX_WIDTH = 2560;
const manifestPath = path.join(__dirname, "..", "src", "_data", "photoHd.json");

async function main() {
  const root = process.argv[2];
  if (!root) throw new Error("Pass the originals root folder as the first argument.");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  for (const entry of manifest) {
    const site = path.join(__dirname, "..", entry.src);
    const siteMeta = await sharp(site).metadata();
    const { data, info } = await sharp(path.join(root, entry.original)).rotate().toBuffer({ resolveWithObject: true });
    const siteAspect = siteMeta.width / siteMeta.height;
    if (Math.abs(info.width / info.height - siteAspect) / siteAspect > 0.01) {
      throw new Error(`Framing differs from the site photo: ${entry.src}`);
    }
    const width = Math.min(MAX_WIDTH, info.width);
    const height = Math.round(width / siteAspect);
    const output = site.replace(/\.webp$/, "-hd.webp");
    await sharp(data).resize(width, height, { fit: "cover" }).webp({ quality: 80, effort: 5 }).toFile(output);
    entry.width = width;
    entry.height = height;
  }
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`${manifest.length} sharp photo renditions`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
