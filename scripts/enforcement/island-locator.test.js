// The island locator (docs/design/component-patterns.md -> Island locator): its macros
// render complete static markup from data, and its stylesheet ships no pattern motion.
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
const render = (call, data = places) => env.renderString(`{% import "partials/island-locator.njk" as isl %}${call}`, { island, places: data });
const count = (html, re) => (html.match(re) || []).length;
const CREDIT = '<div class="isl-credit">Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a></div>';

test('the key map is static markup: one numbered link and marker per place, in the order given', () => {
  const html = render('{{ isl.islandMap(island, places) }}');
  assert.equal(count(html, /<script/g), 0, 'the key map must not need a script');
  const links = [...html.matchAll(/<a class="isl-link" href="([^"]+)" style="--fx:([\d.]+);--fy:([\d.]+)">([\s\S]*?)<\/a>/g)];
  assert.deepEqual(links.map((m) => m[1]), places.map((p) => p.href));
  links.forEach(([, , fx, fy, inner], i) => {
    const n = String(i + 1).padStart(2, '0');
    assert.ok(Math.abs(Number(fx) - places[i].x / island.width) < 0.001, `place ${n}: --fx ${fx}`);
    assert.ok(Math.abs(Number(fy) - places[i].y / island.height) < 0.001, `place ${n}: --fy ${fy}`);
    assert.ok(inner.includes(`<span class="isl-dot" data-n="${n}" aria-hidden="true"></span>`), `place ${n}: marker`);
    // The space keeps the link's name "02 Manatee Beach", not "02Manatee Beach", for a screen reader.
    assert.ok(inner.includes(`<span class="isl-n">${n}</span> <span class="isl-name">${nunjucks.lib.escape(places[i].name)}</span>`), `place ${n}: name`);
  });
  assert.match(html, /<div class="isl-stage" aria-hidden="true">/, 'the drawing is hidden from assistive tech; the key carries the names');
  assert.ok(html.includes(`d="${island.path}"`), 'the outline comes from src/_data/islandOutline.json');
});

test('a place name with markup characters is escaped, not printed raw', () => {
  const html = render('{{ isl.islandMap(island, places) }}', [{ name: 'Bridge St. & <Gulf Dr>', href: '#a', x: 10, y: 10 }]);
  assert.ok(html.includes('<span class="isl-name">Bridge St. &amp; &lt;Gulf Dr&gt;</span>'));
});

test('the OpenStreetMap credit the outline data requires has one source, printed by the key map', () => {
  assert.equal(render('{{ isl.islandCredit() }}').trim(), CREDIT);
  const html = render('{{ isl.islandMap(island, places) }}');
  assert.equal(count(html, /class="isl-credit"/g), 1);
  assert.ok(html.includes(CREDIT));
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
  assert.ok(html.includes(`class="isl-own" cx="${places[1].x}" cy="${places[1].y}"`));
});

test('the inset keeps a lit marker at the island\'s edge inside its own box', () => {
  for (let own = 1; own <= places.length; own += 1) {
    const html = render(`{{ isl.islandInset(island, places, ${own}) }}`);
    const [x0, y0, w, h] = html.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
    const [, cx, cy, r] = html.match(/class="isl-own" cx="([\d.]+)" cy="([\d.]+)" r="(\d+)"/).map(Number);
    assert.ok(cx - r >= x0 && cx + r <= x0 + w && cy - r >= y0 && cy + r <= y0 + h, `place ${own}: the lit marker leaves the box`);
  }
});

test('an inset asked for a place outside the list lights nothing', () => {
  for (const own of [0, places.length + 1, 'undefinedName']) {
    const html = render(`{{ isl.islandInset(island, places, ${own}) }}`);
    assert.equal(count(html, /class="isl-own"/g), 0, `own=${own}`);
    assert.doesNotMatch(html, /c[xy]=""/, `own=${own}`);
  }
});

test('the stylesheet\'s fixed sizes match the outline data', () => {
  // island-locator.css writes 560 / 1000, 313.6px and 503.6px for this outline. Change both together.
  assert.deepEqual([island.width, island.height], [560, 1000]);
  assert.match(read('src/css/island-locator.css'), /aspect-ratio: 560 \/ 1000/);
});

// Text check. The study's marker entrance and hover growth are recorded in the catalog as
// explored; docs/design/pattern-motion.md lets them ship only after Sawyer selects them from a
// working preview. What remains is DESIGN.md's standard press and hover colour.
test('the stylesheet ships no pattern motion, and every transition is switched off under reduced motion', () => {
  const css = read('src/css/island-locator.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /@keyframes|animation(-[a-z-]+)?\s*:/, 'an entrance needs a recorded selection first: docs/design/pattern-motion.md');

  const rules = (text) => [...text.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
    selectors: selector.split(',').map((s) => s.trim()),
    transition: ((body.match(/(?:^|;)\s*transition\s*:\s*([^;]+)/) || [])[1] || '').trim(),
  }));
  const reducedRe = /@media \(prefers-reduced-motion: reduce\) \{((?:[^{}]*\{[^{}]*\})*)\s*\}/;
  const off = rules((css.match(reducedRe) || [])[1] || '').filter((r) => r.transition === 'none').flatMap((r) => r.selectors);
  const moving = rules(css.replace(reducedRe, '')).filter((r) => r.transition && r.transition !== 'none');

  assert.deepEqual(moving.flatMap((r) => r.selectors).sort(), ['.isl-link::after', '.isl-txt'], 'expected only the press and the hover colour');
  for (const { selectors, transition } of moving) {
    assert.doesNotMatch(transition, /\b(all|width|height|top|left|margin|padding)\b/, `${selectors}: animate transform or colour only`);
    for (const selector of selectors) assert.ok(off.includes(selector), `no "transition: none" under reduced motion for ${selector}`);
  }
});
