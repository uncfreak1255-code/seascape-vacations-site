// The disclosure (docs/design/component-patterns.md -> Disclosure): its macro renders a native
// details row from the page's own words, and its stylesheet ships no pattern motion.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const partialEnv = require('../design/design-sync/partial-env');
const assertStateMotionOnly = require('./css-motion');

const root = path.resolve(__dirname, '../..');
const css = fs.readFileSync(path.join(root, 'src/css/disclosure.css'), 'utf8');
const env = partialEnv();
const LABEL = 'More about this beach';
const render = (call, label = LABEL) => env.renderString(`{% import "partials/disclosure.njk" as dsc %}${call}`, { label }).trim();
const row = (body, args = 'label', label = LABEL) => render(`{% call dsc.disclosure(${args}) %}${body}{% endcall %}`, label);

test('the row is a closed native details: the label in its summary, the body under it, no script', () => {
  const html = row('<p>Body.</p>');
  assert.match(html, /^<details class="dsc">\s*<summary><span>More about this beach<\/span><i aria-hidden="true"><\/i><\/summary>\s*<div class="dsc-body"><p>Body\.<\/p><\/div>\s*<\/details>$/);
  assert.doesNotMatch(html, /<script|<details[^>]* open/);
});

test('the partial prints no words of its own', () => {
  assert.equal(row('<p>Body.</p>').replace(/<[^>]+>/g, '').replace(/\s+/g, ''), 'MoreaboutthisbeachBody.');
});

test('a label is escaped; the body is the page\'s own markup, printed as written', () => {
  const html = row('<p>See <a href="/guides/">the guides</a>.</p>', 'label', 'Tides & <times>');
  assert.ok(html.includes('<span>Tides &amp; &lt;times&gt;</span>'));
  assert.ok(html.includes('<div class="dsc-body"><p>See <a href="/guides/">the guides</a>.</p></div>'));
});

test('no label, no body, or no {% call %}: no markup', () => {
  assert.equal(row('<p>Body.</p>', 'label', ''), '');
  assert.equal(row('<p>Body.</p>', 'label', ' \n '), '');
  assert.equal(row('<p>Body.</p>', 'missing'), '');
  assert.equal(row('  \n '), '');
  assert.equal(render('{{ dsc.disclosure(label) }}'), '');
});

test('a row that ends a guide section draws no bottom rule and takes the section\'s bottom padding', () => {
  assert.match(row('<p>Body.</p>', 'label, ends=true'), /^<details class="dsc dsc-ends">/);
  assert.match(css, /\.dsc \{ border-bottom: 1px solid #CAD4CF; \}/);
  assert.match(css, /\.dsc-ends \{ border-bottom: 0; \}/);
  assert.match(css, /\.pg-step:has\(> \.dsc-ends:last-child\) \{ padding-bottom: 0; \}/);
});

test('the whole row is the target, at least 44px tall, with the shared focus ring', () => {
  const summary = css.match(/\.dsc > summary \{([^}]*)\}/)[1];
  assert.ok(Number(summary.match(/min-height: (\d+)px/)[1]) >= 44);
  assert.match(css, /\.dsc > summary:focus-visible \{ outline: 3px solid #A4533E; outline-offset: 4px; \}/);
});

test('the plus is drawn with borders, and the paragraph gap outranks a guide\'s own', () => {
  // Forced colours drop a background, so a bar drawn as one would vanish with the open/closed sign.
  const icon = [...css.matchAll(/\.dsc > summary i::(?:before|after)[^{]*\{([^}]*)\}/g)].map(([, body]) => body).join(' ');
  assert.match(icon, /border-top: 1\.5px solid;[\s\S]*border-left: 1\.5px solid;/);
  assert.doesNotMatch(icon, /background/);
  // planning-guide.css has `.pg-step p + p`, one class; two classes win whichever sheet loads first.
  assert.match(css, /\.dsc > \.dsc-body > p \+ p \{ margin-top: 16px; \}/);
});

// Text check. The study's opening motion (the text growing out of the row, the plus folding
// into a minus) is recorded in the catalog as explored; docs/design/pattern-motion.md lets it
// ship only after Sawyer selects it from a working preview.
test('the stylesheet ships no pattern motion, and its press and hover are switched off under reduced motion', () => {
  assertStateMotionOnly(css, ['.dsc > summary']);
  assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g, ''), /::details-content|interpolate-size/);
});
