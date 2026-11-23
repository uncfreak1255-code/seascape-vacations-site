// The island locator (docs/design/component-patterns.md -> Island locator): its two macros
// render complete static markup from data, and its stylesheet ships no entrance animation.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const nunjucks = require('nunjucks');

const root = path.resolve(__dirname, '../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const island = JSON.parse(read('src/_data/islandOutline.json'));
const { places } = JSON.parse(read('scripts/design/design-sync/island-places.fixture.json'));
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(root, 'src/_includes')), { autoescape: true });
const render = (call) => env.renderString(`{% import "partials/island-locator.njk" as isl %}${call}`, { island, places });
const count = (html, re) => (html.match(re) || []).length;

test('the key map is static markup: one numbered link and marker per place, in the order given', () => {
  const html = render('{{ isl.islandMap(island, places) }}');
  assert.equal(count(html, /<script/g), 0, 'the key map must not need a script');
  const links = [...html.matchAll(/<a class="isl-link" href="([^"]+)" style="--fx:([\d.]+);--fy:([\d.]+)">([\s\S]*?)<\/a>/g)];
  assert.deepEqual(links.map((m) => m[1]), places.map((p) => p.href));
  links.forEach(([, , fx, fy, inner], i) => {
    const n = String(i + 1).padStart(2, '0');
    assert.ok(Math.abs(Number(fx) - places[i].x / island.width) < 0.001, `place ${n}: --fx ${fx}`);
    assert.ok(Math.abs(Number(fy) - places[i].y / island.height) < 0.001, `place ${n}: --fy ${fy}`);
    assert.match(inner, new RegExp(`<span class="isl-dot" data-n="${n}" aria-hidden="true"></span>`));
    // The space keeps the link's name "02 Manatee Beach", not "02Manatee Beach", for a screen reader.
    assert.match(inner, new RegExp(`<span class="isl-n">${n}</span> <span class="isl-name">${places[i].name}</span>`));
  });
  assert.match(html, /<div class="isl-stage" aria-hidden="true">/, 'the drawing is hidden from assistive tech; the key carries the names');
  assert.ok(html.includes(`d="${island.path}"`), 'the outline comes from src/_data/islandOutline.json');
});

test('the key map prints the OpenStreetMap credit the outline data requires', () => {
  const html = render('{{ isl.islandMap(island, places) }}');
  assert.match(html, /<div class="isl-credit">Map data © <a href="https:\/\/www\.openstreetmap\.org\/copyright">OpenStreetMap contributors<\/a><\/div>/);
  // A figcaption would make the credit the whole map's accessible name.
  assert.doesNotMatch(html, /<figure|<figcaption/);
  assert.match(island.note, /OpenStreetMap contributors, ODbL/);
});

test('the inset lights one place and mutes the others', () => {
  const html = render('{{ isl.islandInset(island, places, 2) }}');
  assert.equal(count(html, /<script/g), 0);
  assert.match(html, /<svg class="isl-inset"[^>]*aria-hidden="true"/);
  assert.equal(count(html, /class="isl-own"/g), 1);
  assert.equal(count(html, /class="isl-other"/g), places.length - 1);
  assert.match(html, new RegExp(`class="isl-own" cx="${places[1].x}" cy="${places[1].y}"`));
});

test('the inset keeps a lit marker at the island\'s edge inside its own box', () => {
  for (let own = 1; own <= places.length; own += 1) {
    const html = render(`{{ isl.islandInset(island, places, ${own}) }}`);
    const [x0, y0, w, h] = html.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
    const [, cx, cy, r] = html.match(/class="isl-own" cx="([\d.]+)" cy="([\d.]+)" r="(\d+)"/).map(Number);
    assert.ok(cx - r >= x0 && cx + r <= x0 + w && cy - r >= y0 && cy + r <= y0 + h, `place ${own}: the lit marker leaves the box`);
  }
});

// Text check. The marker entrance in the guide look study is recorded in the catalog as explored;
// docs/design/pattern-motion.md lets it ship only after Sawyer selects it from a working preview.
test('the stylesheet ships no entrance animation, and every transition has a reduced-motion answer', () => {
  const css = read('src/css/island-locator.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /@keyframes|animation\s*:/, 'an entrance needs a recorded selection first: docs/design/pattern-motion.md');
  const reduced = (css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?\})\s*\}/) || [])[1] || '';
  const moving = [...css.matchAll(/([^{}]+)\{[^{}]*transition\s*:\s*(?!none)[^{}]*\}/g)].map((m) => m[1].trim());
  assert.ok(moving.length > 0, 'expected the press and hover transitions');
  for (const selector of moving) assert.ok(reduced.includes(selector), `no reduced-motion rule for ${selector}`);
});
