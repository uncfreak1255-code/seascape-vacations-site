const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const { parseBuildArgs, eleventyArgs } = require("./build-site");

test("npm start uses the build-site wrapper, not raw Eleventy", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf8"));
  assert.match(pkg.scripts.start, /scripts\/enforcement\/build-site\.js/);
  assert.match(pkg.scripts.start, /--serve/);
  assert.doesNotMatch(pkg.scripts.start, /npx @11ty\/eleventy --serve/);
  assert.equal(pkg.scripts.build, "node scripts/enforcement/build-site.js");
});

test("parseBuildArgs and eleventyArgs share the same serve path as npm start", () => {
  assert.deepEqual(parseBuildArgs([]), { serve: false });
  assert.deepEqual(parseBuildArgs(["--serve"]), { serve: true });
  assert.deepEqual(eleventyArgs({ serve: false }), ["@11ty/eleventy"]);
  assert.deepEqual(eleventyArgs({ serve: true }), ["@11ty/eleventy", "--serve"]);
});
