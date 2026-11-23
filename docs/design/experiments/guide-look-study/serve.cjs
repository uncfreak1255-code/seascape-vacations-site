// Loopback-only study server. It serves the built beaches guide from `_site` and applies one
// of five views to it. Nothing here is part of the Eleventy input, so nothing here can publish.
//
//   node docs/design/experiments/guide-look-study/serve.cjs
//   open http://127.0.0.1:8794/            (arrow keys or the bar switch views)
//
// PORT            port to listen on (default 8794)
// STUDY_SITE_ROOT built site to serve (default: this worktree's `_site`; run `npm run build` first)
// ?view=          control | a | b | c | d
// ?chrome=0       leave the switcher bar out (used by verify.cjs and for proof screenshots)
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const STUDY_ROOT = __dirname;
const SITE_ROOT = path.resolve(process.env.STUDY_SITE_ROOT || path.join(STUDY_ROOT, '..', '..', '..', '..', '_site'));
const GUIDE = '/guides/anna-maria-island-beaches/';
const VIEWS = ['control', 'a', 'b', 'c', 'd'];
const BASE = { d: 'a' }; // view d is view a plus the toggle: it loads a's files as well as its own
const TOGGLE = ['c', 'd']; // views that use views/toggle.css and views/toggle.js
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, body, type) {
  res.writeHead(status, { 'Content-Type': type || 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

// Resolve a URL path under a root and refuse anything that climbs out of it.
function resolveUnder(root, urlPath) {
  const file = path.resolve(root, '.' + path.posix.normalize('/' + urlPath));
  return file === root || file.startsWith(root + path.sep) ? file : null;
}

function sendFile(res, file) {
  if (!file) return send(res, 403, 'Forbidden');
  fs.stat(file, (statError, stat) => {
    if (statError) return send(res, 404, 'Not found');
    const target = stat.isDirectory() ? path.join(file, 'index.html') : file;
    fs.readFile(target, (readError, body) => {
      if (readError) return send(res, 404, 'Not found');
      send(res, 200, body, TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream');
    });
  });
}

// The files a view loads, in order. Styles: the shared toggle, the base view, then the view's
// own, so each can restyle what came before. Scripts: the view's own before its base, because
// the base calls the hook the view defines.
function viewFiles(view) {
  const toggle = TOGGLE.includes(view) ? ['toggle'] : [];
  const base = BASE[view] ? [`${BASE[view]}/view`] : [];
  return { css: [...toggle, ...base, `${view}/view`], js: [...toggle, `${view}/view`, ...base] };
}

// One string list from several. Entries that name the same text or link are added up, so a
// view that lists a string its base also lists is allowed both and no more.
function mergeStrings(lists) {
  const merged = {};
  for (const list of lists) {
    for (const [key, entries] of Object.entries(list)) {
      merged[key] = merged[key] || [];
      for (const entry of entries) {
        const seen = merged[key].find((item) => (item.text || item.href) === (entry.text || entry.href));
        if (seen) seen.count = (seen.count || 1) + (entry.count || 1);
        else merged[key].push({ ...entry });
      }
    }
  }
  return merged;
}

// The list of added text a view is held to: its own strings.json, plus its base view's.
function viewStrings(view) {
  const read = (name) => JSON.parse(fs.readFileSync(path.join(STUDY_ROOT, 'views', name, 'strings.json'), 'utf8'));
  return BASE[view] ? mergeStrings([read(BASE[view]), read(view)]) : read(view);
}

// The page is the built guide, untouched, plus: classes on <body>, the view's stylesheets and
// scripts, and (unless chrome=0) the switcher. The control gets no view files.
function guidePage(view, chrome) {
  let html = fs.readFileSync(path.join(SITE_ROOT, GUIDE, 'index.html'), 'utf8');
  const head = [];
  const tail = [];
  if (view !== 'control') {
    const files = viewFiles(view);
    for (const file of files.css) head.push(`<link rel="stylesheet" href="/__study/views/${file}.css">`);
    for (const file of files.js) tail.push(`<script src="/__study/views/${file}.js"></script>`);
  } else {
    tail.push('<script>document.documentElement.dataset.studyReady = "1";</script>');
  }
  if (chrome) {
    head.push('<link rel="stylesheet" href="/__study/switcher.css">');
    tail.push('<script src="/__study/switcher.js"></script>');
  }
  const bodyOpen = /<body class="([^"]*)"/;
  if (!bodyOpen.test(html) || !html.includes('</head>') || !html.includes('</body>')) {
    throw new Error('The built guide no longer has the markup this study expects.');
  }
  const names = [BASE[view], view].filter(Boolean).map((name) => `study-${name}`).join(' ');
  html = html.replace(bodyOpen, (_, classes) => `<body data-study-view="${view}" class="${classes} study-view ${names}"`);
  html = html.replace('</head>', head.join('\n') + '\n</head>');
  return html.replace('</body>', tail.join('\n') + '\n</body>');
}

function handle(req, res) {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
  if (url.pathname === '/') {
    res.writeHead(302, { Location: GUIDE + '?view=control', 'Cache-Control': 'no-store' });
    return res.end();
  }
  if (url.pathname === GUIDE || url.pathname === GUIDE + 'index.html') {
    const view = VIEWS.includes(url.searchParams.get('view')) ? url.searchParams.get('view') : 'control';
    try {
      return send(res, 200, guidePage(view, url.searchParams.get('chrome') !== '0'), TYPES['.html']);
    } catch (error) {
      return send(res, 500, `${error.message}\nSite root: ${SITE_ROOT}\n`);
    }
  }
  if (url.pathname.startsWith('/__study/')) {
    return sendFile(res, resolveUnder(STUDY_ROOT, decodeURIComponent(url.pathname.slice('/__study'.length))));
  }
  return sendFile(res, resolveUnder(SITE_ROOT, decodeURIComponent(url.pathname)));
}

// Port 0 asks the system for a free port; the promise resolves with the server once it listens.
function start(port) {
  return new Promise((resolve, reject) => {
    // A path that cannot be decoded, or that holds a NUL byte, throws inside handle(): answer it
    // and keep serving.
    const server = http.createServer((req, res) => {
      try { handle(req, res); } catch (error) { if (!res.headersSent) send(res, 400, 'Bad request'); }
    });
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

module.exports = { start, viewStrings, mergeStrings, GUIDE, VIEWS, STUDY_ROOT, SITE_ROOT };

if (require.main === module) {
  start(Number(process.env.PORT || 8794)).then((server) => {
    console.log(`Guide look study: http://127.0.0.1:${server.address().port}/`);
    console.log(`Serving the built site from ${SITE_ROOT}`);
  });
}
