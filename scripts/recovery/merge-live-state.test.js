const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");

// A commit hook exports GIT_DIR, GIT_INDEX_FILE and friends; left set, they
// point every git call here at the real repo instead of the temp one.
for (const key of Object.keys(process.env)) if (key.startsWith("GIT_")) delete process.env[key];
// Keep the machine's global hooks (secret scan, autoreview) off fixture pushes.
process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_NOSYSTEM = "1";

const { mergeLiveState } = require("./merge-live-state");

// origin has main = base -> queued and production = base; a clone that fetched
// only production cannot see `queued`, which is the case the script exists for.
function makeFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "site-merge-live."));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const run = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: "pipe" }).trim();
  const origin = path.join(root, "origin.git");
  const work = path.join(root, "work");
  run(root, "init", "-q", "--bare", "-b", "main", origin);
  run(root, "init", "-q", "-b", "main", work);
  run(work, "config", "user.email", "test@example.com");
  run(work, "config", "user.name", "test");
  run(work, "remote", "add", "origin", origin);
  const commit = (message) => {
    run(work, "commit", "-q", "--no-verify", "--allow-empty", "-m", message);
    return run(work, "rev-parse", "HEAD");
  };
  const base = commit("base");
  run(work, "push", "-q", "origin", "main:main", "main:production");
  const queued = commit("queued merge");
  run(work, "push", "-q", "origin", "main:main");
  run(work, "checkout", "-q", "-b", "side", base);
  const side = commit("unmerged side work");
  run(work, "push", "-q", "origin", "side:side");
  const clone = path.join(root, "clone");
  run(root, "clone", "-q", "--single-branch", "-b", "production", origin, clone);
  return { clone, base, queued, side };
}

test("a merge already on production is live-branch", (t) => {
  const { clone, base } = makeFixture(t);
  assert.deepEqual(mergeLiveState({ sha: base, cwd: clone }), { state: "live-branch", exitCode: 0, sha: base });
});

test("a merge only on main is queued, even when the clone started with production alone", (t) => {
  const { clone, queued } = makeFixture(t);
  assert.deepEqual(mergeLiveState({ sha: queued, cwd: clone }), { state: "queued", exitCode: 1, sha: queued });
});

test("a SHA the remote does not have is unknown-commit, not queued", (t) => {
  const { clone } = makeFixture(t);
  const result = mergeLiveState({ sha: "0123456789abcdef0123456789abcdef01234567", cwd: clone });
  assert.equal(result.state, "unknown-commit");
  assert.equal(result.exitCode, 2);
});

test("a commit that never reached main is not-on-main", (t) => {
  const { clone, side } = makeFixture(t);
  execFileSync("git", ["fetch", "-q", "origin", "side"], { cwd: clone, stdio: "pipe" });
  assert.deepEqual(mergeLiveState({ sha: side, cwd: clone }), { state: "not-on-main", exitCode: 2, sha: side });
});

test("a git failure other than not-an-ancestor throws instead of reading as queued", (t) => {
  // Without the fetch, the production-only clone has no origin/main ref.
  const { clone, base } = makeFixture(t);
  assert.throws(() => mergeLiveState({ sha: base, cwd: clone, fetch: false }), /exited 128/);
});

test("a ref name instead of a SHA is refused before any git call", () => {
  assert.throws(() => mergeLiveState({ sha: "HEAD", cwd: os.tmpdir(), fetch: false }), /usage/);
  assert.throws(() => mergeLiveState({ sha: undefined, cwd: os.tmpdir(), fetch: false }), /usage/);
});
