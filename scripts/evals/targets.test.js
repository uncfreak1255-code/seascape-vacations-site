const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { spawnSync } = require("node:child_process");
const { filterByLane, resolveTargets } = require(path.resolve(__dirname, "lib/targets.js"));

// filterByLane(files, globs) -> files matching any glob

test("filterByLane: matches simple glob with **", () => {
  const files = [
    "src/property-management/index.njk",
    "src/property-management/deep/nested.njk",
    "src/other/page.njk",
  ];
  const globs = ["src/property-management/**/*.njk"];
  const result = filterByLane(files, globs);
  assert.deepEqual(result, [
    "src/property-management/index.njk",
    "src/property-management/deep/nested.njk",
  ]);
});

test("filterByLane: matches brace sets like {njk,html,md}", () => {
  const files = [
    "src/guides/lake-norman.njk",
    "src/guides/charlotte.html",
    "src/guides/davidson.md",
    "src/guides/note.txt",
    "src/other/page.njk",
  ];
  const globs = ["src/guides/**/*.{njk,html,md}"];
  const result = filterByLane(files, globs);
  assert.deepEqual(result, [
    "src/guides/lake-norman.njk",
    "src/guides/charlotte.html",
    "src/guides/davidson.md",
  ]);
});

test("filterByLane: matches single * in filename", () => {
  const files = [
    "src/pages/about.njk",
    "src/pages/contact.njk",
    "src/other/about.njk",
  ];
  const globs = ["src/pages/*.njk"];
  const result = filterByLane(files, globs);
  assert.deepEqual(result, ["src/pages/about.njk", "src/pages/contact.njk"]);
});

test("filterByLane: returns empty array when no files match", () => {
  const files = ["src/other/page.html"];
  const globs = ["src/guides/**/*.njk"];
  const result = filterByLane(files, globs);
  assert.deepEqual(result, []);
});

test("filterByLane: handles empty files array", () => {
  const result = filterByLane([], ["src/**/*.njk"]);
  assert.deepEqual(result, []);
});

test("filterByLane: handles empty globs array", () => {
  const result = filterByLane(["src/page.njk"], []);
  assert.deepEqual(result, []);
});

test("filterByLane: matches multiple globs (union)", () => {
  const files = [
    "src/guides/page.njk",
    "src/property-management/index.njk",
    "src/other/random.njk",
  ];
  const globs = [
    "src/guides/**/*.njk",
    "src/property-management/**/*.njk",
  ];
  const result = filterByLane(files, globs);
  assert.deepEqual(result, [
    "src/guides/page.njk",
    "src/property-management/index.njk",
  ]);
});

test("filterByLane: owner lane includes data-backed seoPages copy", () => {
  const files = [
    "src/_data/seoPages.json",
    "src/property-management/property-management.njk",
    "src/research/owner-fee-revenue-leak-benchmark-2026.njk",
    "src/stays/stays.njk",
  ];
  const globs = [
    "src/property-management/**/*.njk",
    "src/research/owner-fee-revenue-leak-benchmark-2026.njk",
    "src/_data/seoPages.json"
  ];
  const result = filterByLane(files, globs);
  assert.deepEqual(result, [
    "src/_data/seoPages.json",
    "src/property-management/property-management.njk",
    "src/research/owner-fee-revenue-leak-benchmark-2026.njk",
  ]);
});

test("filterByLane: does not double-count a file matching multiple globs", () => {
  const files = ["src/guides/page.njk"];
  const globs = ["src/guides/**/*.njk", "src/guides/**/*.{njk,html}"];
  const result = filterByLane(files, globs);
  assert.equal(result.length, 1);
});

test("filterByLane: brace set with single extension", () => {
  const files = ["src/guides/lake.njk", "src/guides/lake.html"];
  const globs = ["src/guides/**/*.{njk}"];
  const result = filterByLane(files, globs);
  assert.deepEqual(result, ["src/guides/lake.njk"]);
});

test("filterByLane: ** matches zero path segments", () => {
  const files = ["src/guides/page.njk"];
  const globs = ["src/guides/**/*.njk"];
  const result = filterByLane(files, globs);
  assert.deepEqual(result, ["src/guides/page.njk"]);
});

// Fix 8: resolveTargets warns on stderr instead of silently returning [] when git fails
test("resolveTargets: with explicit files, returns filtered matches without git", () => {
  const lane = { targets: ["src/guides/**/*.njk"] };
  const files = ["src/guides/page.njk", "src/other/page.html"];
  const result = resolveTargets(lane, files);
  assert.deepEqual(result, ["src/guides/page.njk"]);
});

test("resolveTargets: with explicit files, returns empty array (no warning needed)", () => {
  const lane = { targets: ["src/guides/**/*.njk"] };
  const files = ["src/other/page.html"];
  const result = resolveTargets(lane, files);
  assert.deepEqual(result, []);
});

test("resolveTargets: warns on stderr when git target resolution fails", () => {
  const lane = { targets: ["src/guides/**/*.njk"] };
  let warning = "";
  const result = resolveTargets(lane, [], {
    execSync: () => {
      throw new Error("git unavailable");
    },
    stderr: {
      write(chunk) {
        warning += chunk;
      },
    },
  });

  assert.deepEqual(result, []);
  assert.match(warning, /could not resolve changed files/);
});
