// Compare an unchanged build snapshot with a migration build. Never edits output.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { buildRouteContract } = require('../../../scripts/enforcement/rendered-route-contract');
const root = path.resolve(__dirname, '../../..');

function collect(html, route, { propertyActions = false } = {}) {
  if (propertyActions) {
    // The one copy change authorized in Sawyer's October 31 browser feedback.
    // Accept only the exact existing home name inside its own tracked action.
    html = html.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, (anchor) => {
      if (!anchor.includes('data-placement="stay_property_card"')) return anchor;
      const name = anchor.match(/data-track-label="([^"]+)"/)[1];
      const span = anchor.match(/<span class="property-action-home">([^<]+)<\/span>/);
      assert.ok(span, `Missing property identity in action for ${name}`);
      assert.equal(span[1], name, `Wrong property identity in action for ${name}`);
      return anchor.replace(span[0], '');
    });
  }
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
    const after = collect(html, route, { propertyActions: process.argv.includes('--property-actions') });
    if (process.argv.includes('--history-dates')) {
      // A source commit legitimately advances Eleventy's Git-backed freshness.
      // Validate the exact Git date; never discard other schema or reader copy.
      const source = slug === '__index' ? 'src/stays/index.njk' : 'src/stays/stays.njk';
      const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', source], { cwd: root, encoding: 'utf8' }).trim();
      for (let i = 0; i < before.jsonLd.length; i++) {
        if (before.jsonLd[i].dateModified && before.jsonLd[i].dateModified !== after.jsonLd[i]?.dateModified) {
          assert.equal(after.jsonLd[i].dateModified, iso, `Unexpected schema freshness on ${route}`);
          before.jsonLd[i].dateModified = iso;
        }
      }
      if (slug === '__index') {
        const label = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' }).format(new Date(iso));
        const oldLabel = before.text.match(/Updated [A-Z][a-z]+ \d{1,2}, \d{4}/)?.[0];
        assert.ok(oldLabel, 'Missing original hub freshness label');
        assert.ok(after.text.includes(`Updated ${label}`), 'Hub freshness does not match source history');
        before.text = before.text.replace(oldLabel, `Updated ${label}`);
      }
    }
    for (const key of Object.keys(before)) {
      try { assert.deepEqual(after[key], before[key]); }
      catch { mismatches.push(`${route}: ${key}`); }
    }
  }
  console.log(JSON.stringify({ routes: Object.keys(baseline).length, mismatches }));
  if (mismatches.length) process.exitCode = 1;
}

module.exports = { collect };
