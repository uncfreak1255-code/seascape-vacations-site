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

test('every stylesheet in stylesheets.js is exported verbatim (guest.css minus @font-face)', () => {
  assert.equal(result.status, 0, result.stderr || result.stdout);
  for (const name of require('../design/design-sync/stylesheets')) {
    let expected = source(`src/css/${name}.css`);
    if (name === 'guest') {
      // Same strip build.js applies; fonts.css carries the faces.
      expected = `/* Verbatim src/css/guest.css minus @font-face (see fonts.css). */\n${expected.replace(/@font-face\s*\{[^}]*\}\n?/g, '')}`;
      assert.ok(!/@font-face\s*\{/.test(expected), 'guest.css export must not carry an @font-face rule');
    }
    assert.equal(exported(`${name}.css`), expected, `waterline/${name}.css drifted from src/css/${name}.css`);
  }
});

test('DESIGN.md pointer docs, including direction-changes.md, ship verbatim', () => {
  assert.equal(result.status, 0, result.stderr || result.stdout);
  for (const name of ['legacy-gold-ctas.md', 'scales-states-forms.md', 'guide-figures.md', 'direction-changes.md']) {
    assert.equal(exported(name), source(`docs/design/${name}`), `waterline/${name} drifted from docs/design/${name}`);
  }
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
