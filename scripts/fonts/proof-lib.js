// Manual font proof only. Reuses the site's static server; never part of a build.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { startStaticServer, closeServer } = require('../enforcement/serve-static');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
function files(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? files(path.join(root, e.name)) : [path.join(root, e.name)]);
}
async function isolate(context, origin, cacheDir, capture = false) {
  fs.mkdirSync(cacheDir, { recursive: true });
  const mapFile = path.join(cacheDir, 'map.json');
  const map = fs.existsSync(mapFile) ? JSON.parse(fs.readFileSync(mapFile)) : {};
  if (!fs.existsSync(mapFile)) fs.writeFileSync(mapFile, '{}');
  await context.route('**/*', async route => {
    const url = route.request().url();
    if (url.startsWith(origin + '/')) return route.continue();
    if (!/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)) return route.abort();
    if (!map[url]) {
      if (!capture) throw new Error(`Unfrozen font response: ${url}; run the baseline audit first`);
      const response = await route.fetch();
      if (!response.ok()) throw new Error(`${url}: ${response.status()}`);
      const body = await response.body();
      const file = hash(url) + (url.includes('gstatic') ? '.woff2' : '.css');
      fs.writeFileSync(path.join(cacheDir, file), body);
      map[url] = { file, bytes: body.length, contentType: response.headers()['content-type'] };
      // Merge additions made by other concurrent audit contexts.
      const current = fs.existsSync(mapFile) ? JSON.parse(fs.readFileSync(mapFile)) : {};
      fs.writeFileSync(mapFile, JSON.stringify({ ...current, ...map }, null, 2));
    }
    return route.fulfill({ body: fs.readFileSync(path.join(cacheDir, map[url].file)),
      contentType: map[url].contentType, headers: { 'access-control-allow-origin': '*', 'timing-allow-origin': '*' } });
  });
  return map;
}
function probe(root, upstream = false) {
  const headPath = upstream ? 'guides/anna-maria-island-vacation-cost/index.html' : 'index.html';
  const home = fs.readFileSync(path.join(root, headPath), 'utf8');
  const faces = [...home.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map(m => m[1]).filter(s => s.includes('@font-face')).join('\n');
  let extra = '';
  if (upstream) {
    const guide = fs.readFileSync(path.join(root, 'guides/anna-maria-island-vacation-cost/index.html'), 'utf8');
    const url = guide.match(/https:\/\/fonts\.googleapis\.com\/css2[^"'<>\s]+|\/css\/fonts\/[^"'<>\s]+/)[0];
    extra = `<link rel="stylesheet" href="${url}">`;
  }
  return fs.readFileSync(path.join(__dirname, 'probe.html'), 'utf8')
    .replace('<!-- FONT_FACES -->', `<style>${faces}</style>${extra}`)
    .replace('<!-- ALPHABET -->', Array.from({ length: 224 }, (_, i) => String.fromCodePoint(160 + i)).join(' '));
}
module.exports = { files, hash, isolate, probe, startStaticServer, closeServer };
