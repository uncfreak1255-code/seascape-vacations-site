#!/usr/bin/env node

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const MIME_TYPES = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

function parseArgs(argv) {
  const options = {
    port: 4173,
    root: "_site",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--port") {
      options.port = Number(argv[index + 1]) || options.port;
      index += 1;
      continue;
    }

    if (value === "--root") {
      options.root = argv[index + 1] || options.root;
      index += 1;
    }
  }

  return options;
}

function safeJoin(root, pathname) {
  const candidate = path.resolve(root, `.${pathname}`);
  if (!candidate.startsWith(root)) {
    return null;
  }
  return candidate;
}

function resolveFile(root, pathname) {
  const direct = safeJoin(root, pathname);
  if (!direct) return null;

  const candidates = [];
  if (pathname.endsWith("/")) {
    candidates.push(path.join(direct, "index.html"));
  } else {
    candidates.push(direct);
    if (!path.extname(pathname)) {
      candidates.push(`${direct}.html`);
      candidates.push(path.join(direct, "index.html"));
    }
  }

  for (const candidate of candidates) {
    if (!candidate.startsWith(root)) continue;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

const options = parseArgs(process.argv.slice(2));
const root = path.resolve(process.cwd(), options.root);

if (!fs.existsSync(root)) {
  console.error(`Static root does not exist: ${root}`);
  process.exit(1);
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
  const pathname = decodeURIComponent(requestUrl.pathname);
  const filePath = resolveFile(root, pathname);

  if (!filePath) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension] || "application/octet-stream";
  const stream = fs.createReadStream(filePath);

  response.writeHead(200, {
    "cache-control": "no-store",
    "content-type": contentType,
  });

  stream.pipe(response);
  stream.on("error", () => {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end("Failed to read file");
  });
});

server.listen(options.port, "127.0.0.1", () => {
  console.log(`Serving ${root} at http://127.0.0.1:${options.port}`);
});
