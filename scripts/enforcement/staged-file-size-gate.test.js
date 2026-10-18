const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync, spawnSync } = require("node:child_process");

// A commit hook exports GIT_DIR, GIT_INDEX_FILE and friends; left set, they
// point every git call here at the real repo instead of the temp one.
for (const key of Object.keys(process.env)) if (key.startsWith("GIT_")) delete process.env[key];

const script = path.join(__dirname, "check-staged-file-size.js");
const { MAX_BYTES: LIMIT, findViolations } = require("./check-staged-file-size");

function makeRepo(t) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "site-file-size-gate."));
  t.after(() => fs.rmSync(repo, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", args, { cwd: repo, stdio: "pipe" });
  const stage = (rel, bytes, char = "a") => {
    fs.mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true });
    fs.writeFileSync(path.join(repo, rel), typeof bytes === "number" ? char.repeat(bytes) : bytes);
    git("add", "--", rel);
  };
  const blocked = () => findViolations(repo).map((v) => v.path);
  git("init", "-q", "-b", "main");
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "test");
  stage("legacy.njk", LIMIT + 5000);
  stage("small.js", 100);
  git("commit", "-q", "--no-verify", "-m", "baseline");
  return { repo, git, stage, blocked };
}

test("a file at the limit passes", (t) => {
  const { stage, blocked } = makeRepo(t);
  stage("at-limit.js", LIMIT);
  assert.deepEqual(blocked(), []);
});

test("a new oversized file blocks the commit with split instructions", (t) => {
  const { repo, stage } = makeRepo(t);
  stage("big.js", LIMIT + 1);
  const result = spawnSync(process.execPath, [script], { cwd: repo, encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /big\.js: ~5,001 tokens/);
  assert.match(result.stderr, /split, do not compress/);
});

test("a small file crossing the limit blocks", (t) => {
  const { stage, blocked } = makeRepo(t);
  stage("small.js", LIMIT + 1);
  assert.deepEqual(blocked(), ["small.js"]);
});

test("a legacy oversized file may shrink or stay the same size, but not grow", (t) => {
  const { stage, blocked } = makeRepo(t);
  stage("legacy.njk", LIMIT + 5000, "b");
  assert.deepEqual(blocked(), []);
  stage("legacy.njk", LIMIT + 10);
  assert.deepEqual(blocked(), []);
  stage("legacy.njk", LIMIT + 5001);
  assert.deepEqual(blocked(), ["legacy.njk"]);
});

test("a renamed legacy file keeps its baseline", (t) => {
  const { git, blocked } = makeRepo(t);
  git("mv", "legacy.njk", "renamed.njk");
  assert.deepEqual(blocked(), []);
});

test("guide pages, mockups, data, lockfiles and binaries are exempt", (t) => {
  const { stage, blocked } = makeRepo(t);
  stage("src/guides/new-guide/index.njk", LIMIT * 2);
  stage("docs/mockups/2026-10-18-board/index.html", LIMIT * 2);
  stage("src/_data/seoPages.json", LIMIT * 2);
  stage("config/perf-ratchet.json", LIMIT * 2);
  stage("package-lock.json", LIMIT * 2);
  stage("photo.png", Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0]), Buffer.alloc(LIMIT * 2, 1)]));
  assert.deepEqual(blocked(), []);
});

test("non-guide pages and scripts are still checked", (t) => {
  const { stage, blocked } = makeRepo(t);
  stage("src/stays/new.njk", LIMIT + 1);
  stage("src/_data/notes.md", LIMIT + 1);
  assert.deepEqual(blocked().sort(), ["src/_data/notes.md", "src/stays/new.njk"]);
});

test("an unreadable staged blob blocks instead of passing", (t) => {
  const { git, repo } = makeRepo(t);
  git("update-index", "--add", "--cacheinfo", `100644,${"1".repeat(40)},ghost.js`);
  assert.throws(() => findViolations(repo));
});

test("a merge commit that brings in upstream growth passes", (t) => {
  const { git, stage, blocked } = makeRepo(t);
  git("checkout", "-q", "-b", "upstream");
  stage("legacy.njk", LIMIT + 9000);
  git("commit", "-q", "--no-verify", "-m", "upstream growth");
  git("checkout", "-q", "main");
  stage("small.js", 200);
  git("commit", "-q", "--no-verify", "-m", "branch work");
  git("merge", "-q", "--no-commit", "--no-ff", "upstream");
  assert.deepEqual(blocked(), []);
});
