const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");

const {
  getDefaultLockRootDir,
  getLockPath,
  withWorktreeLock
} = require("./worktree-lock");

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function waitForLockHeld(lockPath, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (fs.existsSync(path.join(lockPath, "owner.json"))) {
      return;
    }

    sleepSync(10);
  }

  throw new Error(`holder process never took ${lockPath}`);
}

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

test("withWorktreeLock rejects an active competing lock once the wait budget is spent", () => {
  const lockRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-lock-"));
  const lockPath = path.join(lockRootDir, "repo-build.lock");

  fs.mkdirSync(lockPath);
  fs.writeFileSync(
    path.join(lockPath, "owner.json"),
    JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() })
  );

  assert.throws(
    () => withWorktreeLock({ name: "repo-build", lockRootDir, waitTimeoutMs: 0 }, () => {}),
    /already running in this worktree/
  );
});

// Regression: a competing build used to fail the caller on first contact, so
// two overlapping proof-gate runs turned a normal queue into a failed turn.
// The holder has to be a real second process - the waiter blocks its own
// thread while polling, so a same-process timer would never get to release.
test("withWorktreeLock waits for a busy lock instead of failing immediately", () => {
  const lockRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-lock-"));
  const lockPath = path.join(lockRootDir, "repo-build.lock");
  const holdMs = 400;
  let ran = false;

  const holder = spawn(
    process.execPath,
    [
      "-e",
      `const fs = require("fs");
       const lockPath = ${JSON.stringify(lockPath)};
       fs.mkdirSync(lockPath, { recursive: true });
       fs.writeFileSync(
         require("path").join(lockPath, "owner.json"),
         JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() })
       );
       setTimeout(() => {
         fs.rmSync(lockPath, { recursive: true, force: true });
       }, ${holdMs});`
    ],
    { stdio: "ignore" }
  );

  try {
    waitForLockHeld(lockPath);

    const startedAt = Date.now();
    withWorktreeLock(
      { name: "repo-build", lockRootDir, pollIntervalMs: 25, waitTimeoutMs: 10000 },
      () => {
        ran = true;
      }
    );
    const waitedMs = Date.now() - startedAt;

    assert.equal(ran, true, "should have acquired the lock after the holder released");
    assert.ok(waitedMs >= 100, `should have waited for the holder, waited ${waitedMs}ms`);
    assert.equal(fs.existsSync(lockPath), false);
  } finally {
    holder.kill();
  }
});

test("withWorktreeLock timeout names the holding pid and how long it waited", () => {
  const lockRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-lock-"));
  const lockPath = path.join(lockRootDir, "repo-build.lock");

  fs.mkdirSync(lockPath);
  fs.writeFileSync(
    path.join(lockPath, "owner.json"),
    JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() })
  );

  assert.throws(
    () =>
      withWorktreeLock(
        { name: "repo-build", lockRootDir, pollIntervalMs: 10, waitTimeoutMs: 60 },
        () => {}
      ),
    (error) => {
      assert.match(error.message, new RegExp(`pid ${process.pid}`));
      assert.match(error.message, /Waited \d+ms/);
      return true;
    }
  );

  fs.rmSync(lockPath, { recursive: true, force: true });
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
