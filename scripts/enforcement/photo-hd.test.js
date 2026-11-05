"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const sharp = require("sharp");

const root = path.join(__dirname, "..", "..");
const manifest = require("../../src/_data/photoHd.json");
const properties = require("../../src/_data/properties-fallback.json");

// Each home's originals live in one folder of the photographers' archive.
const originalsFolder = {
  "blue-house": "1009-71st-St-NW[800x600]",
  "the-oasis": "75th Listing Photos",
  "sarasota-luxe": "Sarasota Luxe Photos",
  "relaxing-oasis": "813 38th St W Listing Photos",
  "bradenton-pool-home": "Bradenton Pool Home Listing Photos",
};

// 16x16 difference hash: two renditions of one photo differ in a few bits,
// different rooms or homes in roughly half of the 256.
async function dHash(file) {
  const px = await sharp(file).greyscale().resize(17, 16, { fit: "fill" }).raw().toBuffer();
  const bits = [];
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) bits.push(px[y * 17 + x] > px[y * 17 + x + 1]);
  return bits;
}

test("every sharp rendition belongs to a reviewed photo, from that home's originals", () => {
  const reviewed = new Set(properties.flatMap((p) => p.photography.photos.map((photo) => photo.src)));
  const seen = new Set();
  for (const entry of manifest) {
    assert.ok(reviewed.has(entry.src), `${entry.src} is not a reviewed property photo`);
    assert.ok(!seen.has(entry.src), `${entry.src} is listed twice`);
    seen.add(entry.src);
    assert.ok(entry.original && !path.isAbsolute(entry.original), `${entry.src} needs a relative original path`);
    const slug = entry.src.split("/")[3];
    assert.equal(entry.original.split("/")[0], originalsFolder[slug], `${entry.src} original is not from ${slug}'s folder`);
  }
});

test("sharp renditions exist, stay within 2560px and show the same picture as the site photo", async () => {
  for (const entry of manifest) {
    const hd = path.join(root, entry.src.replace(/\.webp$/, "-hd.webp"));
    const site = path.join(root, entry.src);
    assert.ok(fs.existsSync(hd), `missing ${hd}`);
    const [hdMeta, siteMeta] = await Promise.all([sharp(hd).metadata(), sharp(site).metadata()]);
    assert.equal(hdMeta.width, entry.width, `${entry.src} width does not match the manifest`);
    assert.equal(hdMeta.height, entry.height, `${entry.src} height does not match the manifest`);
    assert.ok(hdMeta.width <= 2560 && hdMeta.width > siteMeta.width, `${entry.src} must be sharper than the site copy and at most 2560px`);
    const aspect = (m) => m.width / m.height;
    assert.ok(Math.abs(aspect(hdMeta) - aspect(siteMeta)) / aspect(siteMeta) < 0.01, `${entry.src} framing differs`);
    const [a, b] = await Promise.all([dHash(hd), dHash(site)]);
    const distance = a.filter((bit, i) => bit !== b[i]).length;
    assert.ok(distance <= 40, `${entry.src} sharp rendition shows a different picture (hash distance ${distance})`);
  }
});

test("property and home templates add the sharp rendition to their srcsets", () => {
  for (const file of ["src/_includes/layouts/property.njk", "src/index.njk"]) {
    assert.match(fs.readFileSync(path.join(root, file), "utf8"), /\| hdSrcset/, `${file} no longer appends sharp renditions`);
  }
});
