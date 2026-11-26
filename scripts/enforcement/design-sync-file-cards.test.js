const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  CARD_MAP, NOT_FILED, publishedPath, fileCard, headerForNewCard, differsOnlyBySyncStamp, planFiling, main
} = require('../design/design-sync/file-cards');

const root = path.resolve(__dirname, '../..');
const header = '<!-- @dsCard group="Homes" height=480 width=1100 subtitle="Real photo" -->';
const bundleCard = (body = '<p>card</p>', stamp = '2026-11-15T00:00:00.000Z') => [
  '<!DOCTYPE html>',
  '<!-- @dsCard group="Homes" name="Property card" subtitle="x" viewport="1100x480" -->',
  '<html lang="en">',
  "<style>@font-face{src:url('../waterline/fonts/poppins-400.woff2')}</style>",
  `<details data-opening-synced="${stamp}"></details>`,
  body,
  '</html>',
].join('\n');

test('fileCard puts the published header on line 1, drops the bundle @dsCard line and rewrites font paths', () => {
  const filed = fileCard(bundleCard(), header);
  const lines = filed.split('\n');
  assert.equal(lines[0], header);
  assert.equal(lines[1], '<!DOCTYPE html>');
  assert.equal(filed.match(/@dsCard/g).length, 1);
  assert.match(filed, /url\('\.\.\/\.\.\/waterline\/fonts\/poppins-400\.woff2'\)/);
  assert.doesNotMatch(filed, /'\.\.\/waterline\//);
});

test('fileCard refuses a bad header or a bundle card without exactly one @dsCard line', () => {
  assert.throws(() => fileCard(bundleCard(), '<!DOCTYPE html>'), /not an @dsCard line/);
  assert.throws(() => fileCard('<!DOCTYPE html>\n<html></html>', header), /exactly one @dsCard/);
});

test('fileCard keeps body text that mentions @dsCard and never double-prefixes an already nested path', () => {
  const filed = fileCard(bundleCard('<p>Each card starts with @dsCard.</p>\n<img src="../../waterline/a.png">'), header);
  assert.match(filed, /<p>Each card starts with @dsCard\.<\/p>/);
  assert.match(filed, /src="\.\.\/\.\.\/waterline\/a\.png"/);
  assert.doesNotMatch(filed, /\.\.\/\.\.\/\.\.\/waterline/);
});

test('publishedPath follows the component layout and covers every mapped card', () => {
  assert.equal(publishedPath('property-card'), 'components/CatalogCard/preview.html');
  assert.equal(publishedPath('buttons'), 'components/Button/preview.html');
  assert.equal(publishedPath('nav-mobile'), 'components/GuestHeaderMobile/preview.html');
  assert.throws(() => publishedPath('colors-brand'), /No published component/);
  const names = Object.values(CARD_MAP);
  assert.equal(new Set(names).size, names.length, 'two bundle cards map to one component');
});

test('a card whose only change is the opening-synced stamp is not republished', () => {
  const live = fileCard(bundleCard('<p>card</p>', '2026-11-12T01:44:10.111Z'), header);
  const plan = planFiling(
    { 'property-card': bundleCard('<p>card</p>', '2026-11-15T00:30:09.502Z') },
    { 'components/CatalogCard/preview.html': live }
  );
  assert.deepEqual(plan.unchanged, ['components/CatalogCard/preview.html']);
  assert.equal(plan.changed.length, 0);
  assert.ok(differsOnlyBySyncStamp(fileCard(bundleCard('<p>card</p>', 'a'), header), live));
});

test('a real change is filed, archived cards are listed, and unknown cards or missing live copies fail', () => {
  const live = { 'components/CatalogCard/preview.html': fileCard(bundleCard('<p>old</p>'), header) };
  const plan = planFiling({ 'property-card': bundleCard('<p>new</p>'), radii: bundleCard() }, live);
  assert.deepEqual(plan.changed.map((c) => c.path), ['components/CatalogCard/preview.html']);
  assert.equal(plan.changed[0].html, fileCard(bundleCard('<p>new</p>'), header));
  assert.deepEqual(plan.notFiled, ['radii']);
  assert.throws(() => planFiling({ 'new-card': bundleCard() }, live), /neither CARD_MAP nor NOT_FILED/);
  assert.throws(() => planFiling({ buttons: bundleCard() }, live), /Live copy of components\/Button/);
});

test('headerForNewCard turns the bundle viewport into the published width and height', () => {
  assert.equal(
    headerForNewCard(bundleCard()),
    '<!-- @dsCard group="Homes" height=480 width=1100 subtitle="x" -->'
  );
  assert.throws(() => headerForNewCard('<!DOCTYPE html>'), /no @dsCard line/);
  assert.throws(() => headerForNewCard('<!-- @dsCard group="Homes" -->'), /no WxH viewport/);
});

test('a mapped card with no live copy is created only when allowNew is set', () => {
  const bundle = { disclosure: bundleCard('<p>new pattern</p>') };
  assert.throws(() => planFiling(bundle, {}), /Live copy of components\/Disclosure.*--new/);
  const plan = planFiling(bundle, {}, { allowNew: true });
  assert.deepEqual(plan.changed, []);
  assert.deepEqual(plan.created.map((c) => c.path), ['components/Disclosure/preview.html']);
  assert.equal(plan.created[0].html, fileCard(bundle.disclosure, headerForNewCard(bundle.disclosure)));
});

test('every card build.js writes is either mapped or listed as not filed', () => {
  const out = '.design-sync/file-cards-test';
  const result = spawnSync(process.execPath, ['scripts/design/design-sync/build.js', '--out', out], {
    cwd: root, encoding: 'utf8', env: process.env
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const stems = fs.readdirSync(path.join(root, out, 'preview'))
    .filter((f) => f.endsWith('.html')).map((f) => f.replace(/\.html$/, ''));
  const unknown = stems.filter((s) => !CARD_MAP[s] && !NOT_FILED.includes(s));
  assert.deepEqual(unknown, [], 'add these cards to CARD_MAP or NOT_FILED in file-cards.js');
  const gone = [...Object.keys(CARD_MAP), ...NOT_FILED].filter((s) => !stems.includes(s));
  assert.deepEqual(gone, [], 'file-cards.js lists cards build.js no longer writes');
});

test('main writes only changed cards under --dest', (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'file-cards-'));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const out = path.join(tmp, 'out');
  const liveDir = path.join(tmp, 'live');
  const dest = path.join(tmp, 'dest');
  fs.mkdirSync(path.join(out, 'preview'), { recursive: true });
  fs.writeFileSync(path.join(out, 'preview', 'buttons.html'), bundleCard('<p>new</p>'));
  fs.writeFileSync(path.join(out, 'preview', 'logo.html'), bundleCard());
  for (const [name, body] of [['Button', '<p>old</p>'], ['Wordmark', '<p>card</p>']]) {
    fs.mkdirSync(path.join(liveDir, 'components', name), { recursive: true });
    fs.writeFileSync(path.join(liveDir, 'components', name, 'preview.html'), fileCard(bundleCard(body), header));
  }
  const log = console.log;
  console.log = () => {};
  try {
    main(['--out', out, '--live', liveDir, '--dest', dest]);
  } finally {
    console.log = log;
  }
  assert.ok(fs.existsSync(path.join(dest, 'components/Button/preview.html')));
  assert.ok(!fs.existsSync(path.join(dest, 'components/Wordmark')));
  assert.throws(() => main(['--out', out, '--live', liveDir, '--dest', dest]), /is not empty/);
});

test('main --new writes a new card with the bundle header and refuses an empty --live', (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'file-cards-new-'));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const out = path.join(tmp, 'out');
  const liveDir = path.join(tmp, 'live');
  fs.mkdirSync(path.join(out, 'preview'), { recursive: true });
  fs.writeFileSync(path.join(out, 'preview', 'buttons.html'), bundleCard());
  fs.writeFileSync(path.join(out, 'preview', 'disclosure.html'), bundleCard('<p>new pattern</p>'));
  const log = console.log;
  console.log = () => {};
  try {
    assert.throws(
      () => main(['--out', out, '--live', path.join(tmp, 'missing'), '--dest', path.join(tmp, 'd0'), '--new']),
      /holds no components/
    );
    fs.mkdirSync(path.join(liveDir, 'components', 'Button'), { recursive: true });
    fs.writeFileSync(path.join(liveDir, 'components', 'Button', 'preview.html'), fileCard(bundleCard(), header));
    main(['--out', out, '--live', liveDir, '--dest', path.join(tmp, 'd1'), '--new']);
  } finally {
    console.log = log;
  }
  const created = fs.readFileSync(path.join(tmp, 'd1', 'components/Disclosure/preview.html'), 'utf8');
  assert.equal(created.split('\n')[0], '<!-- @dsCard group="Homes" height=480 width=1100 subtitle="x" -->');
  assert.ok(!fs.existsSync(path.join(tmp, 'd1', 'components/Button')));
});
