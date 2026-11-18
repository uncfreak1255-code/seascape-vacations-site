const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const out = '.design-sync/style-dependency-test';
const exported = (name) => fs.readFileSync(path.join(root, out, 'waterline', name), 'utf8');
const source = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const result = spawnSync(process.execPath, ['scripts/design/design-sync/build.js', '--out', out], {
  cwd: root, encoding: 'utf8', env: process.env
});

test('standalone design export carries the canonical style dependencies', () => {
  assert.equal(result.status, 0, result.stderr || result.stdout);
  for (const name of ['writing-style-guide.md', 'voice.md', 'banned-patterns.md', 'approved-examples.md']) {
    assert.ok(fs.existsSync(path.join(root, out, 'waterline', name)), `Export dependency missing: ${name}`);
    assert.equal(exported(name), source(`docs/style/${name}`));
  }
});

test('every stylesheet in stylesheets.js is exported verbatim (guest.css minus @font-face, trip-sheet.css plus its cards file)', () => {
  assert.equal(result.status, 0, result.stderr || result.stdout);
  for (const name of require('../design/design-sync/stylesheets')) {
    let expected = source(`src/css/${name}.css`);
    if (name === 'guest') {
      // Same strip build.js applies; fonts.css carries the faces.
      expected = `/* Verbatim src/css/guest.css minus @font-face (see fonts.css). */\n${expected.replace(/@font-face\s*\{[^}]*\}\n?/g, '')}`;
      assert.ok(!/@font-face\s*\{/.test(expected), 'guest.css export must not carry an @font-face rule');
    }
    // Same join eleventy.config.js applies to the built _site/css/trip-sheet.css.
    if (name === 'trip-sheet') expected = `${expected}\n${source('src/css/trip-sheet-cards.css')}`;
    assert.equal(exported(`${name}.css`), expected, `waterline/${name}.css drifted from src/css/${name}.css`);
  }
});

test('every docs/design doc DESIGN.md links, including the phone rules, ships verbatim', () => {
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const linked = [...new Set([...source('DESIGN.md').matchAll(/docs\/design\/([a-z0-9-]+\.md)/g)].map((m) => m[1]))];
  for (const name of ['cards-and-phone-surfaces.md', 'legacy-gold-ctas.md', 'direction-changes.md']) assert.ok(linked.includes(name), `DESIGN.md no longer links ${name}`);
  for (const name of linked) {
    assert.equal(exported(name), source(`docs/design/${name}`), `waterline/${name} drifted from docs/design/${name}`);
  }
  assert.equal(exported('design-rules.md'), source('docs/agents/rules/design.md'), 'waterline/design-rules.md drifted from docs/agents/rules/design.md');
});

test('the phone surfaces card carries the live phone CSS', () => {
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const card = fs.readFileSync(path.join(root, out, 'preview', 'phone-surfaces.html'), 'utf8');
  assert.match(card, /viewport="393x\d+"/);
  assert.ok(card.includes(source('src/css/trip-sheet-cards.css').trim()), 'phone card must inline trip-sheet-cards.css');
  assert.ok(card.includes('--r-field:12px'), 'phone card must inline the trip-sheet.css phone block');
});

test('_sync-push.json holds DesignSync-ready arguments matching the manifest', () => {
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const read = (name) => JSON.parse(fs.readFileSync(path.join(root, out, name), 'utf8'));
  const manifest = read('_sync-manifest.json');
  const push = read('_sync-push.json');
  assert.equal(push.localDir, path.join(root, out));
  assert.deepEqual(push.finalizePlan, { writes: manifest.writes, deletes: manifest.deletes });
  assert.deepEqual(push.writeFiles.files.map((f) => f.path), manifest.writes);
  for (const f of push.writeFiles.files) {
    assert.ok(!path.isAbsolute(f.localPath), `localPath must be relative to localDir: ${f.localPath}`);
    assert.ok(fs.existsSync(path.join(push.localDir, f.localPath)), `localPath missing: ${f.localPath}`);
  }
  assert.ok(push.writeFiles.files.length <= 256 && push.finalizePlan.deletes.length <= 256);
  assert.match(result.stdout, /list_projects[\s\S]*finalize_plan[\s\S]*write_files/);
});
