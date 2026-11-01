// Local-only A/B review using the existing static server; no generated-file edits.
const fs = require('node:fs');
const path = require('node:path');
const { startStaticServer, resolveFile } = require('../../../scripts/enforcement/serve-static');
const root = path.resolve(__dirname, '../../../_site');
const port = Number(process.env.STAY_PREVIEW_PORT || 4212);

(async () => {
  const started = await startStaticServer({ root, port, host: '127.0.0.1' });
  const serve = started.server.listeners('request')[0];
  started.server.removeListener('request', serve);
  started.server.on('request', (req, res) => {
    const url = new URL(req.url, started.url);
    if (url.pathname === '/__stay-flow-preview.css') {
      res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(fs.readFileSync(path.join(__dirname, 'flow-preview.css')));
    }
    if (['browse', 'dockside'].includes(url.searchParams.get('flow')) && url.pathname === '/stays/family-vacation-rentals-anna-maria-island/') {
      const file = path.join(process.env.STAY_FLOW_PREVIEW_DIR || '/private/tmp/stay-flow-previews', `${url.searchParams.get('flow')}.html`);
      if (!fs.existsSync(file)) { res.writeHead(503); return res.end('Run build-flows.cjs to prepare this local preview.'); }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(fs.readFileSync(file));
    }
    if (url.pathname === '/__stay-photographic-preview.css') {
      res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(fs.readFileSync(path.join(__dirname, 'photographic-preview.css')));
    }
    if (url.searchParams.get('variant') === 'photo' && url.pathname.startsWith('/stays/')) {
      const file = resolveFile(root, url.pathname);
      if (file && file.endsWith('.html')) {
        const html = fs.readFileSync(file, 'utf8').replace('</head>', '<link rel="stylesheet" href="/__stay-photographic-preview.css"></head>');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        return res.end(html);
      }
    }
    serve(req, res);
  });
  console.log(`Stay preview A: ${started.url}/stays/family-vacation-rentals-anna-maria-island/`);
  console.log(`Stay preview B: ${started.url}/stays/family-vacation-rentals-anna-maria-island/?variant=photo`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
