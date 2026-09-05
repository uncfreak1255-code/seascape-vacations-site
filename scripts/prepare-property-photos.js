"use strict";

// Make smaller web renditions from the reviewed, property-specific originals.
// Run after changing photography in properties-fallback.json; no network or API keys.
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const properties = require("../src/_data/properties-fallback.json");

async function main() {
  for (const property of properties) {
    for (const photo of property.photography.photos) {
      const prefix = `/images/homes/${property.slug}/`;
      if (!photo.src.startsWith(prefix) || !photo.src.endsWith(".webp")) {
        throw new Error(`Photo must belong to ${property.slug}: ${photo.src}`);
      }
      const input = path.join(__dirname, "..", photo.src);
      const output = input.replace(/\.webp$/, "-800.webp");
      const bytes = await sharp(input).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      await fs.writeFile(output, bytes);
    }
    console.log(`${property.slug}: ${property.photography.photos.length} smaller photo renditions`);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
