// The fact strip (docs/design/component-patterns.md -> Fact strip): its macros render
// complete static markup from data, print the page's words unchanged, and its stylesheet
// ships no motion.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const partialEnv = require('../design/design-sync/partial-env');

const root = path.resolve(__dirname, '../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const sample = JSON.parse(read('scripts/design/design-sync/fact-strip.fixture.json'));
const env = partialEnv();
const render = (call, facts) => env.renderString(`{% import "partials/fact-strip.njk" as fs %}${call}`, { facts }).trim();
const strip = (facts) => render('{{ fs.factStrip(facts) }}', facts);
const panel = (facts, figure = '<svg class="fig"></svg>') => render(`{% call fs.factPanel(facts) %}${figure}{% endcall %}`, facts);
const count = (html, re) => (html.match(re) || []).length;
const pairs = (html) => [...html.matchAll(/<div class="fs-fact"><dt>([\s\S]*?)<\/dt> <dd>([\s\S]*?)<\/dd><\/div>/g)].map((m) => [m[1], m[2]]);

test('the strip is static markup: one labelled pair per fact, in the order given, words unchanged', () => {
  const html = strip(sample.three);
  assert.equal(count(html, /<script/g), 0, 'the strip must not need a script');
  assert.match(html, /^<div class="fs-strip fs-cols-3"><dl class="fs-list">/);
  // The label prints as the page wrote it. A guide's same-words check depends on "Best for:" surviving.
  assert.deepEqual(pairs(html), sample.three.map((f) => [f.label, f.text]));
  assert.equal(count(html, /<dt>/g), 3);
  assert.deepEqual(pairs(strip([{ label: 'Hours', text: '6am' }])), [['Hours', '6am']], 'no colon is added either');
});

test('label and text are escaped; `html` is the only unescaped path', () => {
  const html = strip([
    { label: 'A & <b>', text: 'See <a href="/x/">this</a> & that' },
    { label: 'Parking:', html: 'By <a href="/properties/">a rental</a>.' },
  ]);
  assert.deepEqual(pairs(html), [
    ['A &amp; &lt;b&gt;', 'See &lt;a href=&quot;/x/&quot;&gt;this&lt;/a&gt; &amp; that'],
    ['Parking:', 'By <a href="/properties/">a rental</a>.'],
  ]);
});

test('a value that holds a link stays one run under its label: the whole value is one dd', () => {
  for (const html of [strip(sample.linked), panel(sample.linked)]) {
    const [, value] = pairs(html)[1];
    assert.equal(value, sample.linked[1].html);
    assert.equal(count(html, /<dd>/g), sample.linked.length);
  }
});

test('two or three facts get the column class; one, or four and more, stay rows', () => {
  const four = [...sample.three, sample.one[0]];
  assert.match(strip(sample.two), /^<div class="fs-strip fs-cols-2">/);
  assert.match(strip(sample.three), /^<div class="fs-strip fs-cols-3">/);
  assert.match(strip(sample.one), /^<div class="fs-strip"><dl/);
  assert.match(strip(four), /^<div class="fs-strip"><dl/);
  assert.equal(pairs(strip(four)).length, 4);
  // Every column class the partial can print has a rule, and the sheet has no other.
  const css = read('src/css/fact-strip.css');
  assert.deepEqual([...new Set(css.match(/\.fs-cols-\d+/g))].sort(), ['.fs-cols-2', '.fs-cols-3']);
});

// The catalog states the two widths the layout switches at. Change both together.
test('the catalog entry names the widths the stylesheet switches at', () => {
  const widths = [...read('src/css/fact-strip.css').matchAll(/@container \(min-width: (\d+)px\)/g)].map((m) => m[1]);
  assert.deepEqual(widths, ['720', '480']);
  const entry = read('docs/design/component-patterns.md').split('### Fact strip')[1].split('\n### ')[0];
  for (const w of widths) assert.ok(entry.includes(`${w}px`), `component-patterns.md -> Fact strip names ${w}px`);
});

test('no facts, no markup', () => {
  for (const facts of [[], undefined, null]) {
    assert.equal(strip(facts), '', `strip, facts=${JSON.stringify(facts)}`);
    assert.equal(panel(facts, ''), '', `panel without a figure, facts=${JSON.stringify(facts)}`);
  }
});

test('the panel puts the figure passed with {% call %} before the rows, unescaped', () => {
  const html = panel(sample.three);
  assert.match(html, /^<div class="fs-panel">\s*<div class="fs-figure"><svg class="fig"><\/svg><\/div>\s*<div class="fs-rows"><dl class="fs-list">/);
  assert.deepEqual(pairs(html), sample.three.map((f) => [f.label, f.text]));
  assert.equal(count(html, /<script/g), 0);
});

test('a panel called without {% call %} renders its rows and no empty figure box', () => {
  const html = render('{{ fs.factPanel(facts) }}', sample.two);
  assert.equal(count(html, /fs-figure/g), 0);
  assert.equal(pairs(html).length, 2);
  assert.equal(count(panel(sample.two, '  '), /fs-figure/g), 0, 'a blank figure is no figure');
});

test('a panel with a figure and no facts is the figure alone', () => {
  const html = panel([]);
  assert.match(html, /^<div class="fs-panel">\s*<div class="fs-figure"><svg class="fig"><\/svg><\/div>\s*<\/div>$/);
  assert.equal(count(html, /fs-rows|<dl/g), 0);
});

// A lone fact beside a tall figure would leave an empty band; fact-strip.css centres it.
test('a one-fact panel carries the class its stylesheet centres', () => {
  assert.match(panel(sample.one), /^<div class="fs-panel fs-lone">/);
  assert.match(read('src/css/fact-strip.css'), /\.fs-lone > \.fs-rows \{[^}]*align-self: center/);
});

// Text check. Nothing in the piece is pressable, so it has no state feedback to animate, and
// docs/design/pattern-motion.md lets pattern motion ship only after Sawyer selects it.
test('the stylesheet ships no motion', () => {
  const css = read('src/css/fact-strip.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /@keyframes|animation(-[a-z-]+)?\s*:|transition(-[a-z-]+)?\s*:/);
});
