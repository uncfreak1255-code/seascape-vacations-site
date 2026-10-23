"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");
const assert = require("node:assert/strict");
const { sentenceHash } = require("../../src/_data/stayFacts");

const projectRoot = path.resolve(__dirname, "..", "..");
const baseline = JSON.parse(fs.readFileSync(path.join(projectRoot, "src/_data/stayNumberBaseline.json"), "utf8"));
const exception = baseline.sentences.find((row) => row.tag === "suspected-claim" && /hot tub/i.test(row.sentence));

// Exercise the real Eleventy data entry point in a fresh process. Only the
// public catalog/page inputs and baseline read are replaced; no files change.
function runStayGate(page, sentences = baseline.sentences) {
  return spawnSync(process.execPath, ["-e", `
    const fs = require("node:fs");
    const path = require("node:path");
    const input = JSON.parse(fs.readFileSync(0, "utf8"));
    const read = fs.readFileSync;
    const baselineFile = path.resolve("src/_data/stayNumberBaseline.json");
    fs.readFileSync = function(file, ...args) {
      return String(file) === baselineFile
        ? JSON.stringify({ sentences: input.sentences })
        : read.call(this, file, ...args);
    };
    require.cache[require.resolve("./src/_data/properties")] = {
      exports: async () => require("./src/_data/properties-fallback.json")
    };
    require.cache[require.resolve("./src/_data/seoPages.json")] = {
      exports: { vacationer: [input.page] }
    };
    require("./src/_data/staysPages")().catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
  `], {
    cwd: projectRoot,
    input: JSON.stringify({ page, sentences }),
    encoding: "utf8"
  });
}

test("the stay build gate rejects a valid new baseline exception", () => {
  const sentence = "room for a dozen";
  const row = { slug: "new-page", sentence, hash: sentenceHash(sentence), tag: "non-claim", reason: "planted exception" };
  const result = runStayGate({ slug: row.slug, geoIntro: sentence }, [...baseline.sentences, row]);
  assert.equal(result.status, 1, result.stderr || "new baseline exception passed the build gate");
  assert.match(result.stderr, /stayNumberBaseline\.json can only shrink/);
});

test("the stay build gate rejects a baseline sentence copied to another page", () => {
  assert.ok(exception, "a grandfathered heat claim must exist");
  const result = runStayGate({ slug: "new-page", geoIntro: exception.sentence });
  assert.equal(result.status, 1, result.stderr || "copied exception passed the build gate");
  assert.match(result.stderr, /hand-typed/);
});

test("the stay build gate rejects moving an existing baseline hash to a new slug", () => {
  const moved = { ...exception, slug: "new-page" };
  const result = runStayGate({ slug: moved.slug, geoIntro: moved.sentence }, [moved]);
  assert.equal(result.status, 1, result.stderr || "moved exception passed the build gate");
  assert.match(result.stderr, /stayNumberBaseline\.json can only shrink/);
});

test("the stay build gate preserves original-page exceptions, removals, and retagging", () => {
  const page = { slug: exception.slug, geoIntro: exception.sentence };
  const unchanged = runStayGate(page);
  assert.equal(unchanged.status, 0, unchanged.stderr);
  const retagged = { ...exception, tag: "non-claim", reason: "reviewed tag change" };
  const reduced = runStayGate(page, [retagged]);
  assert.equal(reduced.status, 0, reduced.stderr);
});
