"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { decide, parseSyncedAt, MAX_SNAPSHOT_AGE_MS } = require("./netlify-ignore-build");

const now = Date.parse("2026-10-04T20:00:00Z");
const base = {
  context: "production",
  cachedRef: "aaa",
  commitRef: "bbb",
  changedFiles: ["docs/process/before-merge-checklist.md", "AGENTS.md", ".github/workflows/ci.yml"],
  syncedAt: now - 60 * 60 * 1000,
  now,
};

test("skips a production docs-only merge when live availability is fresh", () => {
  assert.equal(decide(base).build, false);
});

test("builds when any site-affecting file changed", () => {
  for (const file of ["src/index.njk", "netlify.toml", "package.json", "scripts/enforcement/build-site.js", "netlify/functions/x.js", "logo.png", "src/docs/a.md"]) {
    assert.equal(decide({ ...base, changedFiles: [...base.changedFiles, file] }).build, true, file);
  }
});

test("builds when live availability is stale, missing or from the future", () => {
  assert.equal(decide({ ...base, syncedAt: now - MAX_SNAPSHOT_AGE_MS - 1 }).build, true);
  assert.equal(decide({ ...base, syncedAt: null }).build, true);
  assert.equal(decide({ ...base, syncedAt: now + 60 * 60 * 1000 }).build, true);
});

test("builds outside production and when the diff cannot be trusted", () => {
  assert.equal(decide({ ...base, context: "deploy-preview" }).build, true);
  assert.equal(decide({ ...base, context: undefined }).build, true);
  assert.equal(decide({ ...base, cachedRef: "" }).build, true);
  assert.equal(decide({ ...base, cachedRef: "bbb" }).build, true);
  assert.equal(decide({ ...base, changedFiles: null }).build, true);
  assert.equal(decide({ ...base, changedFiles: [] }).build, true);
});

test("reads the live availability marker", () => {
  assert.equal(parseSyncedAt('<div data-opening-synced="2026-10-04T20:48:27.189Z">'), Date.parse("2026-10-04T20:48:27.189Z"));
  assert.equal(parseSyncedAt("<div>"), null);
  assert.equal(parseSyncedAt('<div data-opening-synced="soon">'), null);
});
