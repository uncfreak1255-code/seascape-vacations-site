const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const http = require('node:http');
const { launch } = require('../design/review-preview');

function freePort() {
  return new Promise((resolve, reject) => {
    const s = http.createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
  });
}

test('private design preview serves only declared HTML on isolated local origins', async t => {
  const temp = await fs.mkdtemp(join(tmpdir(), 'review-preview-'));
  t.after(() => fs.rm(temp, { recursive: true, force: true }));
  const allocated = new Set();
  while (allocated.size < 4) allocated.add(await freePort());
  const [port, ...variantPorts] = [...allocated];
  const config = { port, title: 'Pick </script> safely', routes: ['/review/'], variants: [] };
  for (const [i, id] of ['current', 'a', 'b'].entries()) {
    const root = join(temp, id);
    await fs.mkdir(join(root, 'review'), { recursive: true });
    await fs.writeFile(join(root, 'review', 'index.html'), `<!doctype html><html><head><title>${id}</title></head><body>${id}</body></html>`);
    await fs.writeFile(join(root, 'index.html'), '<html><head></head></html>');
    await fs.symlink(join(root, '..', 'private.json'), join(root, 'leak.json'));
    config.variants.push({ id, root, label: id, revision: `${id}-initial`, port: variantPorts[i] });
  }
  const manifest = join(temp, 'private.json');
  await fs.writeFile(manifest, JSON.stringify(config));
  const { url, close } = await launch(manifest);
  t.after(close);
  const wrapper = await fetch(url);
  assert.equal(wrapper.status, 200);
  const wrapperHTML = await wrapper.text();
  assert.match(wrapperHTML, /sandbox="allow-scripts allow-same-origin"/);
  assert.match(wrapperHTML, /Pick \\u003c\/script>/);
  assert.match(wrapper.headers.get('content-security-policy'), /frame-src http:\/\/127\.0\.0\.1:/);
  for (const item of config.variants) {
    const host = `http://127.0.0.1:${item.port}`;
    const page = await fetch(`${host}/review/`);
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-security-policy'), /form-action 'none'/);
    assert.match(page.headers.get('x-robots-tag'), /noindex/);
    const body = await page.text();
    assert.ok(body.includes(`<body>${item.id}</body>`));
    assert.match(body, /stopImmediatePropagation/);
    assert.equal((await fetch(`${host}/`)).status, 404);
    assert.equal((await fetch(`${host}/leak.json`)).status, 404);
    assert.equal((await fetch(`${host}/review/`, { method: 'POST' })).status, 403);
  }
  config.variants[2].revision = 'b-revision-after-rebuild';
  await fs.writeFile(manifest, JSON.stringify(config));
  assert.match(await (await fetch(url)).text(), /b-revision-after-rebuild/);
});
