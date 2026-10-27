// Holds the Waterline stylesheets to the scales in DESIGN.md's `waterline:` block.
// guest.css may not grow (property-gallery.test.js), so the sheets keep literal
// values; this test checks each literal belongs to a scale. Off-scale values that
// already existed are counted debt, and each count may only fall.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const wl = yaml.load(read('DESIGN.md').match(/^---\n([\s\S]*?)\n---/)[1]).waterline;

const toMs = (t) => (t.endsWith('ms') ? Number(t.slice(0, -2)) : Number(t.slice(0, -1)) * 1000);
const squash = (v) => String(v).toLowerCase().replace(/\s+/g, '');

const palette = new Set(Object.values(wl.colors).map(squash));
const durations = new Set(Object.values(wl.motion.duration).map(toMs));
const easings = new Set(Object.values(wl.motion.easing).map(squash));
const shadows = new Set(Object.values(wl.shadow).map(squash));
const breakpoints = new Set(Object.values(wl.breakpoints).map((v) => parseInt(v, 10)));

const HEX_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/g;
const MOTION_DECL_RE = /(?:transition|animation)(?:-duration|-delay|-timing-function)?\s*:([^;}]*)/g;
const TIME_RE = /(?<![\w.-])\d*\.?\d+m?s\b/g;
const BEZIER_RE = /cubic-bezier\([^)]*\)/g;
const SHADOW_DECL_RE = /box-shadow\s*:([^;}]*)/g;
const MEDIA_RE = /@media[^{]*/g;
const WIDTH_RE = /(?:max|min)-width:\s*(\d+)px/g;

function offScale(css) {
  const body = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const misses = { color: [], duration: [], easing: [], shadow: [], breakpoint: [] };
  for (const hex of body.match(HEX_RE) || []) {
    // An 8-digit hex is a palette colour plus alpha; judge the colour.
    if (!palette.has(squash(hex.length === 9 ? hex.slice(0, 7) : hex))) misses.color.push(hex);
  }
  for (const [, value] of body.matchAll(MOTION_DECL_RE)) {
    for (const t of value.match(TIME_RE) || []) if (toMs(t) !== 0 && !durations.has(toMs(t))) misses.duration.push(t);
    for (const b of value.match(BEZIER_RE) || []) if (!easings.has(squash(b))) misses.easing.push(b);
  }
  for (const [, value] of body.matchAll(SHADOW_DECL_RE)) {
    const v = squash(value.replace(/!important/, ''));
    if (v !== 'none' && !shadows.has(v)) misses.shadow.push(value.trim());
  }
  for (const media of body.match(MEDIA_RE) || []) {
    for (const [, px] of media.matchAll(WIDTH_RE)) if (!breakpoints.has(Number(px))) misses.breakpoint.push(`${px}px`);
  }
  return misses;
}

test('the DESIGN.md waterline block defines every scale', () => {
  for (const key of ['colors', 'space', 'rounded', 'shadow', 'breakpoints']) {
    assert.ok(wl[key] && Object.keys(wl[key]).length, `waterline.${key} is missing`);
  }
  assert.ok(Object.keys(wl.motion.duration).length && Object.keys(wl.motion.easing).length, 'waterline.motion is missing');
});

// Off-scale literals counted on 2026-10-25. Lower a number when a change removes
// some; never raise one. A new value belongs in DESIGN.md's scales first.
const CEILINGS = {
  'src/css/guest.css': { color: 9, shadow: 1, breakpoint: 5 },
  'src/css/arrival.css': { color: 24, breakpoint: 4 },
  'src/css/catalog.css': { color: 4, duration: 1, shadow: 2, breakpoint: 2 },
  'src/css/catalog-card.css': { breakpoint: 1 },
  'src/css/property-gallery.css': { breakpoint: 1 },
  'src/css/owner.css': { color: 5, shadow: 1 },
  'src/css/about.css': {},
  'src/css/planning-guide.css': { color: 4, shadow: 1, breakpoint: 1 },
  'src/css/comparison-guide.css': {},
};

for (const [file, ceiling] of Object.entries(CEILINGS)) {
  test(`${file} uses no new off-scale colours, motion, shadows or breakpoints`, () => {
    const misses = offScale(read(file));
    for (const [kind, found] of Object.entries(misses)) {
      const allowed = ceiling[kind] || 0;
      assert.ok(found.length <= allowed, `${file}: ${found.length} off-scale ${kind} values (ceiling ${allowed}): ${found.join(', ')}`);
    }
  });
}
