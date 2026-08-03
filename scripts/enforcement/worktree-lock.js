const fs = require("fs");
const path = require("path");
const { randomUUID } = require("node:crypto");
const { execFileSync } = require("node:child_process");

const LOCK_ENV_PREFIX = "SEASCAPE_WORKTREE_LOCK_";
const OWNER_FILE_PATTERN = /^owner(?:-[A-Za-z0-9-]+)?\.json$/;
const RECLAIMABLE_RENAME_ERRORS = new Set(["EEXIST", "ENOTEMPTY", "EISDIR"]);

// A competing build is normally seconds away from finishing, so waiting beats
// failing the caller. Only a genuinely stuck holder should reach the timeout.
const DEFAULT_WAIT_TIMEOUT_MS = 120000;
const DEFAULT_POLL_INTERVAL_MS = 250;

function pickTiming(value, fallback) {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function normalizeOptions(options) {
  if (typeof options === "string") {
    return {
      name: options,
      pollIntervalMs: DEFAULT_POLL_INTERVAL_MS,
      waitTimeoutMs: DEFAULT_WAIT_TIMEOUT_MS
    };
  }

  return {
    lockRootDir: options && options.lockRootDir ? options.lockRootDir : undefined,
    name: options && options.name ? options.name : "repo-build",
    repoRootDir: options && options.repoRootDir ? options.repoRootDir : undefined,
    pollIntervalMs: pickTiming(options && options.pollIntervalMs, DEFAULT_POLL_INTERVAL_MS),
    waitTimeoutMs: pickTiming(options && options.waitTimeoutMs, DEFAULT_WAIT_TIMEOUT_MS)
  };
}

function sleepSync(ms) {
  if (ms <= 0) {
    return;
  }

  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function getLockEnvVar(name) {
  return `${LOCK_ENV_PREFIX}${String(name || "repo-build")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")}`;
}

function getGitDir() {
  return execFileSync("git", ["rev-parse", "--git-dir"], {
    encoding: "utf8"
  }).trim();
}

function getRepoRootDir() {
  return execFileSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8"
  }).trim();
}

function getDefaultLockRootDir(repoRootDir) {
  return path.join(repoRootDir || getRepoRootDir(), ".tmp", "worktree-locks");
}

function getLockPath(options) {
  const { lockRootDir, name, repoRootDir } = normalizeOptions(options);
  return path.join(lockRootDir || getDefaultLockRootDir(repoRootDir), `${name}.lock`);
}

function getOwnerMetadataPath(lockPath, token) {
  return path.join(lockPath, token ? `owner-${token}.json` : "owner.json");
}

function readLockOwnerRecord(lockPath) {
  let ownerFileNames;

  try {
    ownerFileNames = fs
      .readdirSync(lockPath)
      .filter((entry) => OWNER_FILE_PATTERN.test(entry))
      .sort();
  } catch {
    return null;
  }

  for (const ownerFileName of ownerFileNames) {
    const ownerPath = path.join(lockPath, ownerFileName);

    try {
      return {
        owner: JSON.parse(fs.readFileSync(ownerPath, "utf8")),
        ownerPath
      };
    } catch {
      // A partially written legacy marker is not a valid owner. The caller
      // will only reclaim it if the directory can be removed safely.
    }
  }

  return null;
}

function readLockOwner(lockPath) {
  const record = readLockOwnerRecord(lockPath);

  return record ? record.owner : null;
}

function isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code !== "ESRCH";
  }
}

function createLockOwner() {
  return {
    pid: process.pid,
    createdAt: new Date().toISOString(),
    token: randomUUID()
  };
}

function tryClaimLock(lockPath, owner) {
  const stagingPath = fs.mkdtempSync(
    path.join(path.dirname(lockPath), `.${path.basename(lockPath)}-${process.pid}-`)
  );

  try {
    // The owner marker is complete before the directory becomes visible at
    // lockPath. A queued caller can therefore never observe a live lock with
    // no owner metadata and mistake it for a dead holder.
    fs.writeFileSync(
      getOwnerMetadataPath(stagingPath, owner.token),
      JSON.stringify(owner, null, 2)
    );

    try {
      fs.renameSync(stagingPath, lockPath);
      return true;
    } catch (error) {
      if (!RECLAIMABLE_RENAME_ERRORS.has(error.code)) {
        throw error;
      }

      return false;
    }
  } finally {
    if (fs.existsSync(stagingPath)) {
      fs.rmSync(stagingPath, { recursive: true, force: true });
    }
  }
}

function removeOwnerMarker(lockPath, ownerPath) {
  try {
    // This path is unique to the owner that is releasing. Never recursively
    // remove lockPath: a queued caller may already have replaced it.
    fs.unlinkSync(ownerPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }

    throw error;
  }

  try {
    // Only the now-empty directory may be removed. If another owner replaced
    // lockPath, rmdir fails without touching that owner's live lock.
    fs.rmdirSync(lockPath);
    return true;
  } catch (error) {
    if (["ENOENT", "ENOTEMPTY", "EEXIST"].includes(error.code)) {
      return false;
    }

    throw error;
  }
}

function removeOwnerlessLock(lockPath) {
  try {
    // Ownerless directories can be the handoff window of an older process or
    // a crashed reclaim. Remove them only if empty; never recursively delete a
    // path that may now contain a newly published owner.
    fs.rmdirSync(lockPath);
    return true;
  } catch (error) {
    if (["ENOENT", "ENOTEMPTY", "EEXIST"].includes(error.code)) {
      return false;
    }

    throw error;
  }
}

function ensureLockAvailable(lockPath, options = {}) {
  const pollIntervalMs = pickTiming(options.pollIntervalMs, DEFAULT_POLL_INTERVAL_MS);
  const waitTimeoutMs = pickTiming(options.waitTimeoutMs, DEFAULT_WAIT_TIMEOUT_MS);
  const owner = options.owner || createLockOwner();

  fs.mkdirSync(path.dirname(lockPath), { recursive: true });

  const startedAt = Date.now();
  let holder = null;
  let waitedMs = 0;

  for (;;) {
    if (tryClaimLock(lockPath, owner)) {
      return owner;
    }

    const lockOwnerRecord = readLockOwnerRecord(lockPath);
    const lockOwner = lockOwnerRecord ? lockOwnerRecord.owner : null;

    if (!lockOwner) {
      const removed = removeOwnerlessLock(lockPath);
      if (!removed && fs.existsSync(lockPath)) {
        waitedMs = Date.now() - startedAt;

        if (waitedMs >= waitTimeoutMs) {
          break;
        }

        sleepSync(Math.min(pollIntervalMs, waitTimeoutMs - waitedMs));
      }

      continue;
    }

    if (!isProcessAlive(lockOwner.pid)) {
      // Reclaim only this dead owner's marker. Competing waiters can remove the
      // same marker at most once, and the non-recursive rmdir cannot delete a
      // replacement owner.
      const removed = removeOwnerMarker(lockPath, lockOwnerRecord.ownerPath);
      if (!removed && fs.existsSync(lockPath)) {
        waitedMs = Date.now() - startedAt;

        if (waitedMs >= waitTimeoutMs) {
          break;
        }

        sleepSync(Math.min(pollIntervalMs, waitTimeoutMs - waitedMs));
      }

      continue;
    }

    holder = lockOwner;
    waitedMs = Date.now() - startedAt;

    if (waitedMs >= waitTimeoutMs) {
      break;
    }

    sleepSync(Math.min(pollIntervalMs, waitTimeoutMs - waitedMs));
  }

  throw new Error(
    `Another repo-wide build or release check is already running in this worktree ` +
      `(${holder ? `pid ${holder.pid}` : "an ownerless lock"}, holding ${lockPath}). ` +
      `Waited ${waitedMs}ms before giving up. ` +
      `Wait for it to finish before starting another.`
  );
}

function withWorktreeLock(options, fn) {
  const normalized = normalizeOptions(options);
  const lockPath = getLockPath(normalized);
  const lockEnvVar = getLockEnvVar(normalized.name);
  const previousLockValue = process.env[lockEnvVar];

  if (previousLockValue === lockPath) {
    return fn();
  }

  const owner = ensureLockAvailable(lockPath, {
    pollIntervalMs: normalized.pollIntervalMs,
    waitTimeoutMs: normalized.waitTimeoutMs,
    owner: createLockOwner()
  });

  process.env[lockEnvVar] = lockPath;

  try {
    return fn();
  } finally {
    if (previousLockValue === undefined) {
      delete process.env[lockEnvVar];
    } else {
      process.env[lockEnvVar] = previousLockValue;
    }

    removeOwnerMarker(lockPath, getOwnerMetadataPath(lockPath, owner.token));
  }
}

module.exports = {
  getDefaultLockRootDir,
  getGitDir,
  getRepoRootDir,
  getLockEnvVar,
  getLockPath,
  withWorktreeLock
};
