// Compare a saved unchanged family page with built or fetched production HTML.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { collect } = require('./check-preservation.cjs');
const root = path.resolve(__dirname, '../../..');
const route = '/stays/family-vacation-rentals-anna-maria-island/';
const original = fs.readFileSync(process.argv[2], 'utf8');
const updated = fs.readFileSync(process.argv[3] || path.join(root, '_site', route, 'index.html'), 'utf8');
const before = collect(original, route), after = collect(updated, route);
assert.deepEqual(after.head, before.head);
assert.deepEqual(after.meta, before.meta);
for (let i = 0; i < before.jsonLd.length; i++) {
  if (before.jsonLd[i].dateModified !== after.jsonLd[i]?.dateModified) {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', 'src/stays/stays.njk'], { cwd: root, encoding:'utf8' }).trim();
    assert.equal(after.jsonLd[i].dateModified, iso, 'schema freshness must equal source Git history');
    before.jsonLd[i].dateModified = iso;
  }
}
assert.deepEqual(after.jsonLd, before.jsonLd);
const main = original.match(/<main\b[\s\S]*?<\/main>/)[0];
const fragments = [...main.matchAll(/<(p|h[1-3])\b[^>]*>[\s\S]*?<\/\1>/g)].map(m => collect('<body>'+m[0]+'</body>',route).text);
for (const text of fragments) assert.ok(!text || after.text.includes(text), 'Missing original reader copy: '+text);
for (const link of before.anchors) {
  assert.ok(after.anchors.some(a => a.href === link.href && ['data-track-event','data-page-slug','data-placement','data-track-label'].every(key => a[key] === link[key])), 'Missing original link/tracking: '+JSON.stringify(link));
}
const photos = source => [...source.matchAll(/<img\b[^>]*>/g)].map(m => m[0].match(/\bsrc="([^"]+)"/)?.[1]);
for (const src of photos(original)) assert.ok(photos(updated).includes(src), 'Missing original photo: '+src);
console.log(JSON.stringify({originalParagraphsAndHeadings:fragments.length, metadata:'preserved',schema:'preserved with source-derived dates',originalDestinationsAndTracking:'preserved',photoIdentity:'preserved'}));
