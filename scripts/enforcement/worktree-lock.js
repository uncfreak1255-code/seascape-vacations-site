const fs = require("fs");
const path = require("path");
const { execFileSync } = require("node:child_process");

const LOCK_ENV_PREFIX = "SEASCAPE_WORKTREE_LOCK_";

function normalizeOptions(options) {
  if (typeof options === "string") {
    return { name: options };
  }

  return {
    lockRootDir: options && options.lockRootDir ? options.lockRootDir : undefined,
    name: options && options.name ? options.name : "repo-build",
    repoRootDir: options && options.repoRootDir ? options.repoRootDir : undefined
  };
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
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch (error) {
    const stderr = error && error.stderr ? String(error.stderr).trim() : "";
    const detail = stderr || (error && error.message) || "Git root lookup failed.";

    throw new Error(
      `Cannot resolve the repository root from \"${process.cwd()}\"; ` +
        `this command must run inside a checked-out Git worktree.\n${detail}`
    );
  }
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

function ensureLockAvailable(lockPath) {
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });

  try {
    fs.mkdirSync(lockPath);
    return;
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }

  const owner = readLockOwner(lockPath);

  if (!owner || !isProcessAlive(owner.pid)) {
    fs.rmSync(lockPath, { recursive: true, force: true });
    fs.mkdirSync(lockPath);
    return;
  }

  throw new Error(
    `Another repo-wide build or release check is already running in this worktree. Wait for it to finish before starting another.`
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

  ensureLockAvailable(lockPath);
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
