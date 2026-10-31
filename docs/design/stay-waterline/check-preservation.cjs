// Compare an unchanged build snapshot with a migration build. Never edits output.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { buildRouteContract } = require('../../../scripts/enforcement/rendered-route-contract');
const root = path.resolve(__dirname, '../../..');

function collect(html, route) {
  const c = buildRouteContract({ html, routePath: route });
  const anchors = [...html.matchAll(/<a\b[^>]*>/gi)].map((match) => {
    const attrs = {};
    for (const attr of match[0].matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)) {
      if (!['class', 'style'].includes(attr[1])) attrs[attr[1]] = attr[3];
    }
    return attrs;
  });
  return {
    text: c.visibleBodyText,
    head: c.head,
    meta: [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]),
    jsonLd: c.jsonLdObjects,
    anchors,
    images: [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]),
  };
}

if (require.main === module) {
  const file = process.argv[2];
  if (!file) throw new Error('Pass the unchanged-build baseline JSON path.');
  const baseline = JSON.parse(fs.readFileSync(file, 'utf8'));
  const mismatches = [];
  for (const [slug, before] of Object.entries(baseline)) {
    const route = slug === '__index' ? '/stays/' : `/stays/${slug}/`;
    const html = fs.readFileSync(path.join(root, '_site', route, 'index.html'), 'utf8');
    const after = collect(html, route);
    for (const key of Object.keys(before)) {
      try { assert.deepEqual(after[key], before[key]); }
      catch { mismatches.push(`${route}: ${key}`); }
    }
  }
  console.log(JSON.stringify({ routes: Object.keys(baseline).length, mismatches }));
  if (mismatches.length) process.exitCode = 1;
}

module.exports = { collect };
