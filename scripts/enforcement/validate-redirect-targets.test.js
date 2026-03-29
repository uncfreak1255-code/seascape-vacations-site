const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("child_process");

function runValidator(cwd) {
  try {
    const out = execFileSync("node", [
      path.resolve(__dirname, "validate-redirect-targets.js")
    ], {
      encoding: "utf8",
      cwd,
      env: { ...process.env }
    });
    return { status: 0, output: out };
  } catch (err) {
    return { status: err.status, output: (err.stderr || "") + (err.stdout || "") };
  }
}

function makeSite(tmpDir, files) {
  const siteDir = path.join(tmpDir, "_site");
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(siteDir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return tmpDir;
}

test("validate-redirect-targets fails when a redirect target does not resolve to a built page", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "redirect-target-missing-"));
  makeSite(tmp, {
    "_redirects": "/from /missing-page/ 301\n",
    "index.html": "<html><body>home</body></html>"
  });
  const result = runValidator(tmp);
  assert.notEqual(result.status, 0, "should fail when redirect target does not exist");
  assert.ok(result.output.includes("/missing-page/"));
});

test("validate-redirect-targets fails when a redirect target points at another redirect", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "redirect-target-hop-"));
  makeSite(tmp, {
    "_redirects": "/from /guides/example.html 301\n/guides/example.html /guides/example/ 301\n",
    "guides/example/index.html": "<html><body>guide</body></html>"
  });
  const result = runValidator(tmp);
  assert.notEqual(result.status, 0, "should fail when redirect target creates an avoidable hop");
  assert.ok(result.output.includes("/guides/example.html"));
  assert.ok(result.output.includes("/guides/example/"));
});

test("validate-redirect-targets passes when redirects point directly at built canonical pages", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "redirect-target-ok-"));
  makeSite(tmp, {
    "_redirects": "/from /guides/example/ 301\n",
    "guides/example/index.html": "<html><body>guide</body></html>"
  });
  const result = runValidator(tmp);
  assert.equal(result.status, 0, "should pass when redirect target resolves directly to a canonical page");
});
