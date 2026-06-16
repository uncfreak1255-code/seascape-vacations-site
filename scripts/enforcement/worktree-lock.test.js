const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getDefaultLockRootDir,
  getLockPath,
  withWorktreeLock
} = require("./worktree-lock");

test("default lock path stays inside the worktree for linked worktrees", () => {
  const repoRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-worktree-"));
  const linkedGitDir = path.join(
    os.tmpdir(),
    "seascape-parent-git",
    "worktrees",
    "linked-worktree"
  );

  const lockRootDir = getDefaultLockRootDir(repoRootDir);
  const lockPath = getLockPath({ name: "repo-build", repoRootDir });

  assert.equal(lockRootDir, path.join(repoRootDir, ".tmp", "worktree-locks"));
  assert.equal(lockPath, path.join(repoRootDir, ".tmp", "worktree-locks", "repo-build.lock"));
  assert.equal(lockPath.startsWith(linkedGitDir), false);
});

test("withWorktreeLock creates and removes the worktree lock", () => {
  const lockRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-lock-"));
  const lockPath = path.join(lockRootDir, "repo-build.lock");
  let ran = false;

  withWorktreeLock({ name: "repo-build", lockRootDir }, () => {
    ran = true;
    assert.equal(fs.existsSync(lockPath), true);
  });

  assert.equal(ran, true);
  assert.equal(fs.existsSync(lockPath), false);
});

test("withWorktreeLock allows reentrant use inside the same process", () => {
  const lockRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-lock-"));

  assert.doesNotThrow(() => {
    withWorktreeLock({ name: "repo-build", lockRootDir }, () => {
      withWorktreeLock({ name: "repo-build", lockRootDir }, () => {
        assert.equal(true, true);
      });
    });
  });
});

test("withWorktreeLock rejects an active competing lock", () => {
  const lockRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-lock-"));
  const lockPath = path.join(lockRootDir, "repo-build.lock");

  fs.mkdirSync(lockPath);
  fs.writeFileSync(
    path.join(lockPath, "owner.json"),
    JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() })
  );

  assert.throws(
    () => withWorktreeLock({ name: "repo-build", lockRootDir }, () => {}),
    /already running in this worktree/
  );
});

test("withWorktreeLock recovers a stale lock from a dead process", () => {
  const lockRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-lock-"));
  const lockPath = path.join(lockRootDir, "repo-build.lock");
  let ran = false;

  fs.mkdirSync(lockPath);
  fs.writeFileSync(
    path.join(lockPath, "owner.json"),
    JSON.stringify({ pid: 999999, createdAt: new Date().toISOString() })
  );

  withWorktreeLock({ name: "repo-build", lockRootDir }, () => {
    ran = true;
    assert.equal(fs.existsSync(lockPath), true);
  });

  assert.equal(ran, true);
  assert.equal(fs.existsSync(lockPath), false);
});
