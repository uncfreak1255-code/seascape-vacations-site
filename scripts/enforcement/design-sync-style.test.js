const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');
test('standalone design export carries the canonical style dependencies', () => {
  const out = '.design-sync/style-dependency-test';
  const result = spawnSync(process.execPath, ['scripts/design/design-sync/build.js', '--out', out], {
    cwd: root, encoding: 'utf8', env: process.env
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  for (const name of ['writing-style-guide.md', 'voice.md', 'banned-patterns.md', 'approved-examples.md']) {
    const exported = path.join(root, out, 'waterline', name);
    assert.ok(fs.existsSync(exported), `Export dependency missing: ${name}`);
    assert.equal(fs.readFileSync(exported, 'utf8'), fs.readFileSync(path.join(root, 'docs/style', name), 'utf8'));
  }
});
