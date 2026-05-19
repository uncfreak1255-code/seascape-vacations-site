const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { closeServer, parseArgs, startStaticServer } = require("./serve-static");

test("startStaticServer serves files and a health endpoint from an ephemeral port", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-serve-static-"));

  try {
    fs.mkdirSync(path.join(root, "guides", "sample"), { recursive: true });
    fs.writeFileSync(path.join(root, "index.html"), "<h1>Home</h1>");
    fs.writeFileSync(path.join(root, "guides", "sample", "index.html"), "<p>Guide</p>");

    const started = await startStaticServer({ port: 0, root });

    try {
      const healthResponse = await fetch(`${started.url}/__health`);
      assert.equal(healthResponse.status, 200);
      assert.deepEqual(await healthResponse.json(), {
        ok: true,
        root: path.resolve(root),
      });

      const homeResponse = await fetch(`${started.url}/`);
      assert.equal(homeResponse.status, 200);
      assert.match(await homeResponse.text(), /Home/);

      const guideResponse = await fetch(`${started.url}/guides/sample/`);
      assert.equal(guideResponse.status, 200);
      assert.match(await guideResponse.text(), /Guide/);

      const missingResponse = await fetch(`${started.url}/missing`);
      assert.equal(missingResponse.status, 404);
    } finally {
      await closeServer(started.server);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("startStaticServer fails clearly when the static root is missing", async () => {
  const missingRoot = path.join(os.tmpdir(), "seascape-missing-static-root");

  assert.throws(
    () => startStaticServer({ port: 0, root: missingRoot }),
    /Static root does not exist:/
  );
});

test("parseArgs accepts host, port, and root overrides", () => {
  assert.deepEqual(parseArgs(["--host", "0.0.0.0", "--port", "9001", "--root", "dist"]), {
    host: "0.0.0.0",
    port: 9001,
    root: "dist",
  });
});
