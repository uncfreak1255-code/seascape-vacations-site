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
    host: "127.0.0.1",
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

    if (value === "--host") {
      options.host = argv[index + 1] || options.host;
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

function validateRoot(root) {
  if (!fs.existsSync(root)) {
    throw new Error(`Static root does not exist: ${root}`);
  }

  return root;
}

function createRequestHandler(root) {
  return (request, response) => {
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
    const pathname = decodeURIComponent(requestUrl.pathname);

    if (pathname === "/__health") {
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8",
      });
      response.end(JSON.stringify({ ok: true, root }));
      return;
    }

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

    stream.on("error", () => {
      if (response.headersSent) {
        response.destroy();
        return;
      }

      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      response.end("Failed to read file");
    });

    stream.pipe(response);
  };
}

function startStaticServer(options = {}) {
  const host = options.host || "127.0.0.1";
  const port = Number.isInteger(options.port) ? options.port : Number(options.port) || 4173;
  const root = validateRoot(path.resolve(process.cwd(), options.root || "_site"));
  const server = http.createServer(createRequestHandler(root));

  server.keepAliveTimeout = 5_000;
  server.headersTimeout = 6_000;
  server.on("clientError", (_error, socket) => {
    if (socket.writable) {
      socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
      return;
    }

    socket.destroy();
  });

  return new Promise((resolve, reject) => {
    const handleError = (error) => {
      reject(error);
    };

    server.once("error", handleError);
    server.listen(port, host, () => {
      server.off("error", handleError);

      const address = server.address();
      const actualPort = typeof address === "object" && address ? address.port : port;
      resolve({
        host,
        port: actualPort,
        root,
        server,
        url: `http://${host}:${actualPort}`,
      });
    });
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function main() {
  let closing = false;
  let started;

  const shutdown = async (exitCode, reason) => {
    if (closing) {
      return;
    }

    closing = true;

    if (reason) {
      console.log(`Stopping static server after ${reason}`);
    }

    if (started) {
      await closeServer(started.server).catch(() => {});
    }

    process.exit(exitCode);
  };

  process.once("SIGINT", () => {
    void shutdown(0, "SIGINT");
  });
  process.once("SIGTERM", () => {
    void shutdown(0, "SIGTERM");
  });
  process.once("uncaughtException", (error) => {
    console.error(error);
    void shutdown(1, "uncaughtException");
  });
  process.once("unhandledRejection", (error) => {
    console.error(error);
    void shutdown(1, "unhandledRejection");
  });

  try {
    const options = parseArgs(process.argv.slice(2));
    started = await startStaticServer(options);
    started.server.on("error", (error) => {
      console.error(`Static server error: ${error.message}`);
    });
    console.log(`Serving ${started.root} at ${started.url}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  void main();
}

module.exports = {
  closeServer,
  parseArgs,
  resolveFile,
  safeJoin,
  startStaticServer,
};
