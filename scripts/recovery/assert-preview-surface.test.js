const http = require("node:http");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  BOOKING_HANDOFF_MARKER,
  requireBaseUrl,
  assertSurfaceBody,
  assertPreviewSurface
} = require("./assert-preview-surface");

function html(body) {
  return `<!doctype html><html><body>${body}</body></html>`;
}

function startFixtureServer(routes) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const page = routes[req.url];
      if (!page) {
        res.writeHead(404, { "content-type": "text/plain" });
        res.end("missing");
        return;
      }
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(page);
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((done) => server.close(done))
      });
    });
  });
}

test("empty preview URL fails", () => {
  assert.throws(() => requireBaseUrl(""), /base-url/);
  assert.throws(() => requireBaseUrl("   "), /base-url/);
  assert.throws(() => requireBaseUrl(), /base-url/);
});

test("planted missing booking handoff fails", () => {
  assert.throws(
    () =>
      assertSurfaceBody(
        {
          path: "/properties/river-house/",
          mustInclude: ["River House", BOOKING_HANDOFF_MARKER]
        },
        {
          statusCode: 200,
          body: html("<h1>River House</h1><a href=\"#booking\">Check dates</a>")
        }
      ),
    /book\.seascape-vacations\.com\/listings\//
  );
});

test("planted missing homepage fails", () => {
  assert.throws(
    () =>
      assertSurfaceBody(
        { path: "/", mustInclude: ["Seascape", "/properties/"] },
        { statusCode: 200, body: html("<h1>Wrong site</h1>") }
      ),
    /missing Seascape/
  );
});

test("preview surface fails closed on a planted broken property page", async () => {
  const fixture = await startFixtureServer({
    "/": html('<h1>Seascape</h1><a href="/properties/">Homes</a>'),
    "/properties/river-house/": html("<h1>River House</h1>")
  });

  await assert.rejects(
    () => assertPreviewSurface(fixture.url),
    /book\.seascape-vacations\.com\/listings\//
  );
  await fixture.close();
});

test("preview surface passes homepage, property page, and booking handoff", async () => {
  const fixture = await startFixtureServer({
    "/": html('<h1>Seascape</h1><a href="/properties/">Homes</a>'),
    "/properties/river-house/": html(
      `<h1>River House</h1><form data-booking-url="https://${BOOKING_HANDOFF_MARKER}135880"></form>`
    )
  });

  await assertPreviewSurface(fixture.url);
  await fixture.close();
});
