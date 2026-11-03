const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const manifest = require('../fonts/manifest.json');
const inventory = require('../fonts/original-inventory.json');
const crypto = require('node:crypto');

function files(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? files(path.join(root, e.name)) : [path.join(root, e.name)]);
}

function checkPartitions(root) {
  const parts = new Map(Object.values(manifest).flatMap(font =>
    Object.values(font.parts).map(part => ['/' + part.path.replace(/^src\//, ''), part])));
  for (const name of Object.keys(manifest).filter(n => !n.startsWith('upstream-'))) {
    const folder = name.startsWith('instrument') ? 'guest' : 'homepage';
    const original = fs.readFileSync(path.join(root, 'assets/fonts', folder, name));
    assert.equal(crypto.createHash('sha256').update(original).digest('hex'), inventory[name].source_sha256, `${name}: immutable legacy URL changed`);
  }
  for (const [url, part] of parts) {
    assert.equal(fs.statSync(path.join(root, url)).size, part.bytes, `${url}: regenerate fonts and manifest together`);
  }
  for (const file of files(root).filter(f => /\.(html|css)$/.test(f))) {
    const source = fs.readFileSync(file, 'utf8');
    for (const face of source.match(/@font-face\s*\{[^}]*\}/g) || []) {
      const url = face.match(/url\(['"]?(\/assets\/fonts\/[^'")]+)['"]?\)/)?.[1];
      if (!parts.has(url)) continue;
      const range = face.match(/unicode-range\s*:\s*([^;}]+)/)?.[1].replace(/\s/g, '');
      const legacyOwner = path.relative(root, file).startsWith('property-management/') && /font-display:\s*block/.test(face) && !range && /\/homepage\//.test(url);
      if (legacyOwner) continue; // Existing unsplit owner faces; keep their source timestamps and matching.
      const part = parts.get(url);
      const allowed = [part.legacy_unrestricted ? undefined : part.unicode_range,
        ...(part.provider_unicode_ranges || [])].map(r => r?.replace(/\s/g, ''));
      assert.ok(allowed.includes(range), `${file}: ${url} must preserve reviewed coverage`);
    }
    for (const link of source.match(/<link\b[^>]*>/g) || []) {
      if (/\brel=["']preload["']/.test(link) && /\bas=["']font["']/.test(link)) {
        assert.ok(!/-extended(?:-[a-f0-9]+)?\.woff2|\/assets\/fonts\/extended\//.test(link), `${file}: extended fonts must stay demand-loaded`);
      }
    }
  }
}

test('committed font partitions match declarations and extended files are never preloaded', () => {
  checkPartitions(process.env.FONT_SUBSET_PROOF_ROOT || path.resolve('_site'));
});
