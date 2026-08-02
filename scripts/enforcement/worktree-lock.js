const fs = require("fs");
const path = require("path");
const { execFileSync } = require("node:child_process");

const LOCK_ENV_PREFIX = "SEASCAPE_WORKTREE_LOCK_";

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

function getOwnerMetadataPath(lockPath) {
  return path.join(lockPath, "owner.json");
}

function readLockOwner(lockPath) {
  const ownerPath = getOwnerMetadataPath(lockPath);

  if (!fs.existsSync(ownerPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(ownerPath, "utf8"));
  } catch {
    return null;
  }
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

function tryClaimLock(lockPath) {
  try {
    fs.mkdirSync(lockPath);
    return true;
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }

    return false;
  }
}

function ensureLockAvailable(lockPath, options = {}) {
  const pollIntervalMs = pickTiming(options.pollIntervalMs, DEFAULT_POLL_INTERVAL_MS);
  const waitTimeoutMs = pickTiming(options.waitTimeoutMs, DEFAULT_WAIT_TIMEOUT_MS);

  fs.mkdirSync(path.dirname(lockPath), { recursive: true });

  const startedAt = Date.now();
  let holder = null;
  let waitedMs = 0;

  for (;;) {
    if (tryClaimLock(lockPath)) {
      return;
    }

    const owner = readLockOwner(lockPath);

    if (!owner || !isProcessAlive(owner.pid)) {
      // The holder died without cleaning up. Reclaim and retry rather than
      // trusting a single mkdir that could race another waiter.
      fs.rmSync(lockPath, { recursive: true, force: true });
      continue;
    }

    holder = owner;
    waitedMs = Date.now() - startedAt;

    if (waitedMs >= waitTimeoutMs) {
      break;
    }

    sleepSync(Math.min(pollIntervalMs, waitTimeoutMs - waitedMs));
  }

  throw new Error(
    `Another repo-wide build or release check is already running in this worktree ` +
      `(pid ${holder.pid}, holding ${lockPath}). Waited ${waitedMs}ms before giving up. ` +
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

  ensureLockAvailable(lockPath, {
    pollIntervalMs: normalized.pollIntervalMs,
    waitTimeoutMs: normalized.waitTimeoutMs
  });
  fs.writeFileSync(
    getOwnerMetadataPath(lockPath),
    JSON.stringify(
      {
        pid: process.pid,
        createdAt: new Date().toISOString()
      },
      null,
      2
    )
  );

  process.env[lockEnvVar] = lockPath;

  try {
    return fn();
  } finally {
    if (previousLockValue === undefined) {
      delete process.env[lockEnvVar];
    } else {
      process.env[lockEnvVar] = previousLockValue;
    }

    fs.rmSync(lockPath, { recursive: true, force: true });
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
