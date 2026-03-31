const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const { withWorktreeLock } = require("./worktree-lock");

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
