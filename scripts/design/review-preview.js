'use strict';

const { createServer } = require('node:http');
const { readFile, realpath, stat } = require('node:fs/promises');
const { dirname, extname, relative, resolve, sep } = require('node:path');
const { reviewPage, protectPage } = require('./review-preview-page');

const loopback = '127.0.0.1';
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.ico': 'image/x-icon' };
const previewPolicy = "default-src 'none'; img-src 'self' data:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; media-src 'self' blob:; connect-src 'self'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
const safeRoute = value => typeof value === 'string' && /^\/(?!\/)[A-Za-z0-9/_-]*(?:\.[A-Za-z0-9_-]+)?$/.test(value);

function portNumber(value, fallback) {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || value < 1024 || value > 65535) throw new Error('Choose unused ports between 1024 and 65535.');
  return value;
}

async function readConfig(file) {
  const config = JSON.parse(await readFile(file, 'utf8'));
  if (!config.title || !Array.isArray(config.routes) || !config.routes.length || !config.routes.every(safeRoute)) throw new Error('Provide a title and at least one local page path.');
  if (!Array.isArray(config.variants) || config.variants.map(v => v.id).join(',') !== 'current,a,b') throw new Error('Use the three variant IDs current, a and b, in that order.');
  const variants = await Promise.all(config.variants.map(async (v, i) => {
    if (![v.label, v.root, v.revision].every(x => typeof x === 'string' && x.trim())) throw new Error('Each variant needs a label, built root and revision.');
    const root = await realpath(resolve(dirname(file), v.root));
    if (!(await stat(root)).isDirectory()) throw new Error(`Variant ${v.id} needs a directory.`);
    return { id: v.id, label: v.label, revision: v.revision, root, port: portNumber(v.port, 43261 + i) };
  }));
  const port = portNumber(config.port, 43260);
  if (new Set([port, ...variants.map(v => v.port)]).size !== 4) throw new Error('Each preview origin needs a distinct port.');
  return { title: String(config.title), routes: config.routes, variants, port };
}

function frameOrigin(port) { return `http://${loopback}:${port}`; }
function send(res, code, type, body, csp = previewPolicy) {
  res.writeHead(code, { 'Content-Type': type, 'Content-Security-Policy': csp, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow' });
  res.end(body);
}

function listen(port, handler) {
  const server = createServer(async (req, res) => {
    if (req.headers.host !== `${loopback}:${port}` || (req.method !== 'GET' && req.method !== 'HEAD')) return send(res, 403, 'text/plain', 'Local preview only.');
    try { await handler(req, res); }
    catch { send(res, 404, 'text/plain', 'Preview file unavailable. Check the build and reload this version.'); }
  });
  return new Promise((res, rej) => { server.once('error', rej); server.listen(port, loopback, () => res(server)); });
}

async function serveVariant(req, res, config, variant) {
  const url = new URL(req.url, frameOrigin(variant.port));
  const pathname = decodeURIComponent(url.pathname);
  const requested = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
  const type = mime[extname(requested)];
  if (!type) throw new Error('Unsupported file');
  const file = await realpath(resolve(variant.root, `.${requested}`));
  const ref = relative(variant.root, file);
  if (!ref || ref.startsWith(`..${sep}`) || ref === '..') throw new Error('Outside built site');
  if (extname(requested) === '.html' && !config.routes.includes(pathname)) throw new Error('Page not listed for review');
  const body = req.method === 'HEAD' ? undefined : await readFile(file);
  send(res, 200, type, extname(requested) === '.html' && body ? protectPage(body.toString()) : body, `${previewPolicy}; frame-src 'none'; frame-ancestors ${frameOrigin(config.port)}`);
}

async function launch(file) {
  const config = await readConfig(file);
  const servers = [];
  try {
    for (const variant of config.variants) servers.push(await listen(variant.port, (req, res) => serveVariant(req, res, config, variant)));
    const frameOrigins = config.variants.map(v => frameOrigin(v.port));
    servers.push(await listen(config.port, async (req, res) => {
      if (new URL(req.url, frameOrigin(config.port)).pathname !== '/') return send(res, 404, 'text/plain', 'Open the preview root.');
      const manifest = JSON.parse(await readFile(file, 'utf8'));
      const variants = config.variants.map(variant => {
        const revision = manifest.variants?.find(entry => entry.id === variant.id)?.revision;
        return { ...variant, revision: typeof revision === 'string' && revision.trim() ? revision : variant.revision };
      });
      send(res, 200, mime['.html'], req.method === 'HEAD' ? undefined : reviewPage({ ...config, variants }, frameOrigins), `${previewPolicy}; frame-src ${frameOrigins.join(' ')}; frame-ancestors 'none'`);
    }));
    return { url: frameOrigin(config.port), close: () => servers.forEach(s => s.close()) };
  } catch (e) { servers.forEach(s => s.close()); throw e; }
}

if (require.main === module) {
  if (process.argv.length !== 3) { console.error('Usage: npm run design:preview -- /absolute/path/to/private-preview.json'); process.exitCode = 1; }
  else launch(resolve(process.argv[2])).then(({ url }) => console.log(`Private design preview: ${url}`)).catch(e => { console.error(e.message); process.exitCode = 1; });
}
module.exports = { launch };
