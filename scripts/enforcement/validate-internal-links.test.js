const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("child_process");

function runValidator(cwd) {
  try {
    const out = execFileSync("node", [
      path.resolve(__dirname, "validate-internal-links.js")
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

test("validate-internal-links normalizes same-site absolute URLs and validates them", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "links-abs-"));
  makeSite(tmp, {
    "index.html": '<html><body><a href="https://seascape-vacations.com/nonexistent/">Bad</a></body></html>'
  });
  const result = runValidator(tmp);
  assert.notEqual(result.status, 0, "should fail for broken same-site absolute URL");
  assert.ok(result.output.includes("/nonexistent/"));
});

test("validate-internal-links passes for valid same-site absolute URL", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "links-abs-ok-"));
  makeSite(tmp, {
    "index.html": '<html><body><a href="https://seascape-vacations.com/about/">Link</a></body></html>',
    "about/index.html": "<html><body>About</body></html>"
  });
  const result = runValidator(tmp);
  assert.equal(result.status, 0, "should pass for valid same-site absolute URL");
});

test("validate-internal-links catches broken fragment-only links", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "links-frag-"));
  makeSite(tmp, {
    "index.html": '<html><body><a href="#nonexistent">Jump</a></body></html>'
  });
  const result = runValidator(tmp);
  assert.notEqual(result.status, 0, "should fail for broken fragment link");
  assert.ok(result.output.includes("#nonexistent"));
  assert.ok(result.output.includes('no element with id="nonexistent"'));
});

test("validate-internal-links passes for valid fragment-only links", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "links-frag-ok-"));
  makeSite(tmp, {
    "index.html": '<html><body><a href="#contact">Jump</a><footer id="contact">Hi</footer></body></html>'
  });
  const result = runValidator(tmp);
  assert.equal(result.status, 0, "should pass for valid fragment link");
});

test("validate-internal-links validates fragments on cross-page links", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "links-cross-frag-"));
  makeSite(tmp, {
    "guides/test/index.html": '<html><body><a href="/#missing">Home section</a></body></html>',
    "index.html": "<html><body><p>No such id</p></body></html>"
  });
  const result = runValidator(tmp);
  assert.notEqual(result.status, 0, "should fail for broken cross-page fragment");
  assert.ok(result.output.includes("/#missing"));
});

test("validate-internal-links passes for valid cross-page fragments", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "links-cross-frag-ok-"));
  makeSite(tmp, {
    "guides/test/index.html": '<html><body><a href="/#contact">Contact</a></body></html>',
    "index.html": '<html><body><footer id="contact">Hi</footer></body></html>'
  });
  const result = runValidator(tmp);
  assert.equal(result.status, 0, "should pass for valid cross-page fragment");
});

test("validate-internal-links still catches regular broken internal links", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "links-broken-"));
  makeSite(tmp, {
    "index.html": '<html><body><a href="/nonexistent-page/">Bad</a></body></html>'
  });
  const result = runValidator(tmp);
  assert.notEqual(result.status, 0, "should fail for broken internal link");
  assert.ok(result.output.includes("/nonexistent-page/"));
});
