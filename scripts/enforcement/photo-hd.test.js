"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const sharp = require("sharp");

const root = path.join(__dirname, "..", "..");
const manifest = require("../../src/_data/photoHd.json");
const properties = require("../../src/_data/properties-fallback.json");

test("every sharp rendition belongs to a reviewed photo of the same home", () => {
  const reviewed = new Set(properties.flatMap((p) => p.photography.photos.map((photo) => photo.src)));
  const seen = new Set();
  for (const entry of manifest) {
    assert.ok(reviewed.has(entry.src), `${entry.src} is not a reviewed property photo`);
    assert.ok(!seen.has(entry.src), `${entry.src} is listed twice`);
    seen.add(entry.src);
    assert.ok(entry.original && !path.isAbsolute(entry.original), `${entry.src} needs a relative original path`);
  }
});

test("sharp renditions exist, stay within 2560px and keep the site photo's framing", async () => {
  for (const entry of manifest) {
    const hd = path.join(root, entry.src.replace(/\.webp$/, "-hd.webp"));
    assert.ok(fs.existsSync(hd), `missing ${hd}`);
    const [hdMeta, siteMeta] = await Promise.all([sharp(hd).metadata(), sharp(path.join(root, entry.src)).metadata()]);
    assert.equal(hdMeta.width, entry.width, `${entry.src} width does not match the manifest`);
    assert.ok(hdMeta.width <= 2560 && hdMeta.width > siteMeta.width, `${entry.src} must be sharper than the site copy and at most 2560px`);
    const aspect = (m) => m.width / m.height;
    assert.ok(Math.abs(aspect(hdMeta) - aspect(siteMeta)) / aspect(siteMeta) < 0.01, `${entry.src} framing differs`);
  }
});
