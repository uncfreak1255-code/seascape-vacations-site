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

const LOCK_MODULE_PATH = path.join(__dirname, "worktree-lock.js");
const OWNER_FILE_PATTERN = /^owner(?:-[A-Za-z0-9-]+)?\.json$/;

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function waitForLockHeld(lockPath, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (
      fs.existsSync(lockPath) &&
      fs.readdirSync(lockPath).some((entry) => OWNER_FILE_PATTERN.test(entry))
    ) {
      return;
    }

    sleepSync(10);
  }

  throw new Error(`holder process never took ${lockPath}`);
}

function waitForFile(filePath, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (fs.existsSync(filePath)) {
      return;
    }

    sleepSync(10);
  }

  throw new Error(`expected ${filePath} to appear`);
}

function waitForChild(child, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    if (child.exitCode !== null) {
      resolve({ code: child.exitCode, signal: child.signalCode });
      return;
    }

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`child process did not exit within ${timeoutMs}ms`));
    }, timeoutMs);

    child.once("exit", (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal });
    });
  });
}

function spawnNodeScript(script) {
  return spawn(process.execPath, ["-e", script], {
    stdio: ["ignore", "ignore", "pipe"]
  });
}

function childPauseSource() {
  return `
    const pause = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
    const waitFor = (filePath) => {
      while (!fs.existsSync(filePath)) pause(5);
    };
  `;
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

// Regression: the build must not release the lock between writing _site and
// inspecting rendered files. A queued build may remove and recreate that
// directory as soon as the first build child exits.
test("withWorktreeLock serializes build and rendered-content inspection", async () => {
  const lockRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-lock-"));
  const lockPath = path.join(lockRootDir, "repo-build.lock");
  const renderedPath = path.join(lockRootDir, "_site", "index.html");
  const inspectionStartedPath = path.join(lockRootDir, "inspection-started");
  const inspectionFinishedPath = path.join(lockRootDir, "inspection-finished");
  const releaseFirstPath = path.join(lockRootDir, "release-first");
  const competingBuildPath = path.join(lockRootDir, "competing-build-started");

  const first = spawnNodeScript(`
    const fs = require("fs");
    ${childPauseSource()}
    const { withWorktreeLock } = require(${JSON.stringify(LOCK_MODULE_PATH)});
    withWorktreeLock(
      { name: "repo-build", lockRootDir: ${JSON.stringify(lockRootDir)}, pollIntervalMs: 10 },
      () => {
        fs.mkdirSync(${JSON.stringify(path.dirname(renderedPath))}, { recursive: true });
        fs.writeFileSync(${JSON.stringify(renderedPath)}, "first-build");
        fs.writeFileSync(${JSON.stringify(inspectionStartedPath)}, "");
        pause(250);
        if (fs.readFileSync(${JSON.stringify(renderedPath)}, "utf8") !== "first-build") {
          process.exitCode = 1;
        }
        fs.writeFileSync(${JSON.stringify(inspectionFinishedPath)}, "");
        waitFor(${JSON.stringify(releaseFirstPath)});
      }
    );
  `);
  let second;

  try {
    waitForFile(inspectionStartedPath);

    second = spawnNodeScript(`
      const fs = require("fs");
      const { withWorktreeLock } = require(${JSON.stringify(LOCK_MODULE_PATH)});
      withWorktreeLock(
        { name: "repo-build", lockRootDir: ${JSON.stringify(lockRootDir)}, pollIntervalMs: 10 },
        () => {
          fs.rmSync(${JSON.stringify(path.join(lockRootDir, "_site"))}, { recursive: true, force: true });
          fs.writeFileSync(${JSON.stringify(competingBuildPath)}, "");
        }
      );
    `);

    waitForFile(inspectionFinishedPath);
    assert.equal(
      fs.existsSync(competingBuildPath),
      false,
      "the queued build must wait until rendered-content inspection finishes"
    );
    fs.writeFileSync(releaseFirstPath, "");

    const results = await Promise.all([waitForChild(first), waitForChild(second)]);
    assert.deepEqual(
      results.map((result) => result.code),
      [0, 0]
    );
    assert.equal(fs.existsSync(competingBuildPath), true);
  } finally {
    for (const child of [first, second]) {
      if (child && child.exitCode === null) {
        child.kill("SIGKILL");
      }
    }
    fs.writeFileSync(releaseFirstPath, "");
    await Promise.all(
      [first, second]
        .filter(Boolean)
        .map(async (child) => {
          try {
            await waitForChild(child, 1000);
          } catch {
            // The assertion above reports the primary failure.
          }
        })
    );
    fs.rmSync(lockRootDir, { recursive: true, force: true });
  }
});

// Regression: several callers may queue behind one holder, but each callback
// must still get an exclusive handoff rather than racing on stale metadata.
test("withWorktreeLock serializes multiple queued waiters", async () => {
  const lockRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-lock-"));
  const lockPath = path.join(lockRootDir, "repo-build.lock");
  const logPath = path.join(lockRootDir, "critical-section.log");
  const ids = ["holder", "waiter-a", "waiter-b", "waiter-c"];
  const children = [];

  const scriptFor = (id, holdMs) => `
    const fs = require("fs");
    ${childPauseSource()}
    const { withWorktreeLock } = require(${JSON.stringify(LOCK_MODULE_PATH)});
    withWorktreeLock(
      { name: "repo-build", lockRootDir: ${JSON.stringify(lockRootDir)}, pollIntervalMs: 10, waitTimeoutMs: 5000 },
      () => {
        fs.appendFileSync(
          ${JSON.stringify(logPath)},
          ${JSON.stringify(`${id}:enter`)} + String.fromCharCode(10)
        );
        pause(${holdMs});
        fs.appendFileSync(
          ${JSON.stringify(logPath)},
          ${JSON.stringify(`${id}:exit`)} + String.fromCharCode(10)
        );
      }
    );
  `;

  try {
    children.push(spawnNodeScript(scriptFor("holder", 150)));
    waitForLockHeld(lockPath);

    for (const id of ids.slice(1)) {
      children.push(spawnNodeScript(scriptFor(id, 70)));
    }

    const results = await Promise.all(children.map((child) => waitForChild(child)));
    assert.deepEqual(
      results.map((result) => result.code),
      [0, 0, 0, 0]
    );

    const lines = fs
      .readFileSync(logPath, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean);
    assert.equal(lines.length, ids.length * 2);

    const observedIds = [];
    for (let index = 0; index < lines.length; index += 2) {
      const enter = lines[index];
      const exit = lines[index + 1];
      const id = enter.replace(/:enter$/, "");
      assert.equal(exit, `${id}:exit`);
      observedIds.push(id);
    }
    assert.deepEqual([...new Set(observedIds)].sort(), [...ids].sort());
  } finally {
    for (const child of children) {
      if (child.exitCode === null) {
        child.kill("SIGKILL");
      }
    }
    await Promise.all(
      children.map(async (child) => {
        try {
          await waitForChild(child, 1000);
        } catch {
          // The assertion above reports the primary failure.
        }
      })
    );
    fs.rmSync(lockRootDir, { recursive: true, force: true });
  }
});

// Regression: pause a claimant after its owner marker is prepared but before
// the claim is published. A second process must be able to claim the still
// absent final path, and the paused process must then queue behind it instead
// of sharing the lock or deleting the second owner's lock during cleanup.
test("withWorktreeLock survives descheduling before owner publication", async () => {
  const lockRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-lock-"));
  const lockPath = path.join(lockRootDir, "repo-build.lock");
  const firstBlockedPath = path.join(lockRootDir, "first-owner-marker-write-blocked");
  const releaseFirstPath = path.join(lockRootDir, "release-first-owner-marker-write");
  const secondRunningPath = path.join(lockRootDir, "second-running");
  const firstRunningPath = path.join(lockRootDir, "first-running");
  const secondLockLostPath = path.join(lockRootDir, "second-lock-lost");

  const first = spawnNodeScript(`
    const fs = require("fs");
    const path = require("path");
    ${childPauseSource()}
    const originalWriteFileSync = fs.writeFileSync.bind(fs);
    let blocked = false;
    fs.writeFileSync = (target, ...args) => {
      if (!blocked && path.basename(String(target)).startsWith("owner")) {
        blocked = true;
        originalWriteFileSync(${JSON.stringify(firstBlockedPath)}, "");
        waitFor(${JSON.stringify(releaseFirstPath)});
      }
      return originalWriteFileSync(target, ...args);
    };
    const { withWorktreeLock } = require(${JSON.stringify(LOCK_MODULE_PATH)});
    withWorktreeLock(
      { name: "repo-build", lockRootDir: ${JSON.stringify(lockRootDir)}, pollIntervalMs: 10, waitTimeoutMs: 5000 },
      () => originalWriteFileSync(${JSON.stringify(firstRunningPath)}, "")
    );
  `);
  let second;

  try {
    waitForFile(firstBlockedPath);

    second = spawnNodeScript(`
      const fs = require("fs");
      ${childPauseSource()}
      const { withWorktreeLock } = require(${JSON.stringify(LOCK_MODULE_PATH)});
      withWorktreeLock(
        { name: "repo-build", lockRootDir: ${JSON.stringify(lockRootDir)}, pollIntervalMs: 10, waitTimeoutMs: 5000 },
        () => {
          fs.writeFileSync(${JSON.stringify(secondRunningPath)}, "");
          waitFor(${JSON.stringify(path.join(lockRootDir, "release-second"))});
          if (!fs.existsSync(${JSON.stringify(lockPath)})) {
            fs.writeFileSync(${JSON.stringify(secondLockLostPath)}, "");
          }
        }
      );
    `);

    waitForFile(secondRunningPath);
    fs.writeFileSync(releaseFirstPath, "");
    sleepSync(200);

    assert.equal(
      fs.existsSync(firstRunningPath),
      false,
      "the paused claimant must wait behind the already-published second owner"
    );
    assert.equal(fs.existsSync(secondLockLostPath), false);

    fs.writeFileSync(path.join(lockRootDir, "release-second"), "");
    const results = await Promise.all([waitForChild(first), waitForChild(second)]);
    assert.deepEqual(
      results.map((result) => result.code),
      [0, 0]
    );
    assert.equal(fs.existsSync(firstRunningPath), true);
    assert.equal(fs.existsSync(secondLockLostPath), false);
  } finally {
    fs.writeFileSync(releaseFirstPath, "");
    fs.writeFileSync(path.join(lockRootDir, "release-second"), "");
    for (const child of [first, second]) {
      if (child && child.exitCode === null) {
        child.kill("SIGKILL");
      }
    }
    await Promise.all(
      [first, second]
        .filter(Boolean)
        .map(async (child) => {
          try {
            await waitForChild(child, 1000);
          } catch {
            // The assertion above reports the primary failure.
          }
        })
    );
    fs.rmSync(lockRootDir, { recursive: true, force: true });
  }
});

// Regression: if a prior owner is descheduled after its path is replaced, its
// finally block must not recursively delete the replacement owner's lock.
test("prior-owner cleanup cannot remove a replacement lock", async () => {
  const lockRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-lock-"));
  const lockPath = path.join(lockRootDir, "repo-build.lock");
  const firstStartedPath = path.join(lockRootDir, "first-started");
  const releaseFirstPath = path.join(lockRootDir, "release-first");
  const replacementOwnerPath = path.join(lockPath, "owner-replacement.json");

  const first = spawnNodeScript(`
    const fs = require("fs");
    ${childPauseSource()}
    const { withWorktreeLock } = require(${JSON.stringify(LOCK_MODULE_PATH)});
    withWorktreeLock(
      { name: "repo-build", lockRootDir: ${JSON.stringify(lockRootDir)}, pollIntervalMs: 10 },
      () => {
        fs.writeFileSync(${JSON.stringify(firstStartedPath)}, "");
        waitFor(${JSON.stringify(releaseFirstPath)});
      }
    );
  `);

  try {
    waitForFile(firstStartedPath);
    waitForLockHeld(lockPath);

    fs.rmSync(lockPath, { recursive: true, force: true });
    fs.mkdirSync(lockPath);
    fs.writeFileSync(
      replacementOwnerPath,
      JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString(), token: "replacement" })
    );
    fs.writeFileSync(releaseFirstPath, "");

    const result = await waitForChild(first);
    assert.equal(result.code, 0);
    assert.equal(fs.existsSync(replacementOwnerPath), true);
    assert.equal(fs.existsSync(lockPath), true);
  } finally {
    fs.writeFileSync(releaseFirstPath, "");
    if (first.exitCode === null) {
      first.kill("SIGKILL");
    }
    try {
      await waitForChild(first, 1000);
    } catch {
      // The assertion above reports the primary failure.
    }
    fs.rmSync(lockRootDir, { recursive: true, force: true });
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
