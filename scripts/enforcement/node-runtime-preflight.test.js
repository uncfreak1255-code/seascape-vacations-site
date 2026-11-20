const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  ELEVENTY_CLI,
  checkNodeRuntime,
  assertNodeRuntime
} = require("./node-runtime-preflight");

function fixtureRepo({ nvmrc = "24.22.2", withEleventy = true } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "node-preflight-"));
  if (nvmrc !== null) {
    fs.writeFileSync(path.join(dir, ".nvmrc"), `${nvmrc}\n`);
  }
  if (withEleventy) {
    fs.mkdirSync(path.join(dir, "node_modules", "@11ty", "eleventy"), { recursive: true });
    fs.writeFileSync(path.join(dir, ELEVENTY_CLI), "");
  }
  return dir;
}

test("matching Node major with installed dependencies passes", () => {
  const dir = fixtureRepo();
  const result = checkNodeRuntime({ projectRootDir: dir, nodeVersion: "24.14.0", env: {} });
  assert.deepEqual(result, { errors: [], warnings: [] });
});

test("a different Node major fails locally and names the pinned version", () => {
  const dir = fixtureRepo();
  const result = checkNodeRuntime({ projectRootDir: dir, nodeVersion: "22.22.0", env: {} });
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /Node 22\.22\.0/);
  assert.match(result.errors[0], /24\.22\.2/);
});

test("a different Node major only warns in CI or on Netlify", () => {
  const dir = fixtureRepo();
  for (const env of [{ CI: "true" }, { NETLIFY: "true" }]) {
    const result = checkNodeRuntime({ projectRootDir: dir, nodeVersion: "22.22.0", env });
    assert.equal(result.errors.length, 0);
    assert.equal(result.warnings.length, 1);
  }
  for (const env of [{ CI: "false" }, { CI: "0" }]) {
    const result = checkNodeRuntime({ projectRootDir: dir, nodeVersion: "22.22.0", env });
    assert.equal(result.errors.length, 1, `CI=${env.CI} is not CI`);
  }
});

test("missing node_modules fails everywhere instead of letting npx fetch eleventy", () => {
  const dir = fixtureRepo({ withEleventy: false });
  for (const env of [{}, { CI: "true" }]) {
    const result = checkNodeRuntime({ projectRootDir: dir, nodeVersion: "24.22.2", env });
    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0], /npm ci/);
  }
});

test("a missing .nvmrc skips the version check", () => {
  const dir = fixtureRepo({ nvmrc: null });
  const result = checkNodeRuntime({ projectRootDir: dir, nodeVersion: "22.22.0", env: {} });
  assert.deepEqual(result, { errors: [], warnings: [] });
});

test("assertNodeRuntime throws one message listing every error", () => {
  const dir = fixtureRepo({ withEleventy: false });
  assert.throws(
    () => assertNodeRuntime({ projectRootDir: dir, nodeVersion: "22.22.0", env: {}, log: () => {} }),
    (error) => /Node 22\.22\.0/.test(error.message) && /npm ci/.test(error.message)
  );
});

test("this repo's build and proof chain run the preflight before any work", () => {
  const root = path.resolve(__dirname, "..", "..");
  for (const file of ["scripts/enforcement/build-site.js", "scripts/enforcement/run-proof-chain.js"]) {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    assert.match(source, /assertNodeRuntime\(/, `${file} must call assertNodeRuntime`);
  }
});

test("the build runs the locked local eleventy, never npx", () => {
  const { eleventyArgs } = require("./build-site");
  assert.equal(eleventyArgs()[0], ELEVENTY_CLI);
  assert.equal(eleventyArgs({ serve: true })[0], ELEVENTY_CLI);
  const source = fs.readFileSync(path.join(__dirname, "build-site.js"), "utf8");
  assert.doesNotMatch(source, /run\("npx"/);
});
