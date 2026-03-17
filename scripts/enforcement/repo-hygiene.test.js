const test = require("node:test");
const assert = require("node:assert/strict");

const {
  classifyUntrackedFiles,
  getNextSafeCommand
} = require("./repo-hygiene");

test("classifyUntrackedFiles separates scratch artifacts from likely real work", () => {
  const result = classifyUntrackedFiles([
    ".superpowers/",
    "_site/research/index.html",
    "lh-live-baseline.report.html",
    "docs/outreach/journalist-pitch-sequences.md",
    "scripts/seo/gsc-client.js",
    "scripts/enforcement/gsc-client.test.js",
    "scripts/data/analysis.json",
    "src/research/index.njk",
    "notes/todo.txt"
  ]);

  assert.deepEqual(result.scratch, [
    ".superpowers/",
    "_site/research/index.html",
    "lh-live-baseline.report.html"
  ]);
  assert.deepEqual(result.likelyRealWork, [
    "docs/outreach/journalist-pitch-sequences.md",
    "scripts/seo/gsc-client.js",
    "scripts/enforcement/gsc-client.test.js",
    "scripts/data/analysis.json",
    "src/research/index.njk"
  ]);
  assert.deepEqual(result.unknown, ["notes/todo.txt"]);
});

test("getNextSafeCommand recommends branching off dirty main instead of working there", () => {
  assert.equal(
    getNextSafeCommand({
      currentBranch: "main",
      rootMainDirty: true,
      localMainBehindOrigin: false
    }),
    "git switch -c codex/sort-untracked-files"
  );
});

test("getNextSafeCommand recommends pulling when main is clean but behind origin", () => {
  assert.equal(
    getNextSafeCommand({
      currentBranch: "main",
      rootMainDirty: false,
      localMainBehindOrigin: true
    }),
    "git pull origin main"
  );
});

test("getNextSafeCommand falls back to git status for non-main workspaces", () => {
  assert.equal(
    getNextSafeCommand({
      currentBranch: "codex/repo-hygiene",
      rootMainDirty: true,
      localMainBehindOrigin: false
    }),
    "git status --short"
  );
});
