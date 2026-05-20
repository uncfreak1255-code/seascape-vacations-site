const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getEnvFileCandidates,
  readEnvFileValue,
  resolveGitCommonRoot
} = require("./repo-env");

test("resolveGitCommonRoot returns the canonical repo root from a worktree", () => {
  const worktreeRoot = "/tmp/repo/.worktrees/example";
  const gitCommonDir = "/tmp/repo/.git";
  const root = resolveGitCommonRoot({
    cwd: worktreeRoot,
    spawnSyncImpl() {
      return {
        status: 0,
        stdout: `${gitCommonDir}\n`
      };
    }
  });

  assert.equal(root, "/tmp/repo");
});

test("getEnvFileCandidates searches worktree files first and then the shared repo root", () => {
  const worktreeRoot = "/tmp/repo/.worktrees/example";
  const candidates = getEnvFileCandidates({
    projectRoot: worktreeRoot,
    cwd: worktreeRoot,
    spawnSyncImpl() {
      return {
        status: 0,
        stdout: "/tmp/repo/.git\n"
      };
    }
  });

  assert.deepEqual(candidates, [
    "/tmp/repo/.worktrees/example/.secrets.env",
    "/tmp/repo/.worktrees/example/.env",
    "/tmp/repo/.secrets.env",
    "/tmp/repo/.env"
  ]);
});

test("readEnvFileValue falls back to the shared repo root when the worktree has no env file", () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "repo-env-root-"));
  const worktreeRoot = path.join(repoRoot, ".worktrees", "example");
  fs.mkdirSync(worktreeRoot, { recursive: true });
  fs.writeFileSync(path.join(repoRoot, ".secrets.env"), "OWNER_LEAD_METRICS_TOKEN=shared-secret\n");

  const value = readEnvFileValue("OWNER_LEAD_METRICS_TOKEN", {
    projectRoot: worktreeRoot,
    cwd: worktreeRoot,
    spawnSyncImpl() {
      return {
        status: 0,
        stdout: `${path.join(repoRoot, ".git")}\n`
      };
    }
  });

  assert.equal(value, "shared-secret");
});

test("readEnvFileValue prefers the worktree env file when both roots define the key", () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "repo-env-pref-"));
  const worktreeRoot = path.join(repoRoot, ".worktrees", "example");
  fs.mkdirSync(worktreeRoot, { recursive: true });
  fs.writeFileSync(path.join(repoRoot, ".secrets.env"), "OWNER_LEAD_METRICS_TOKEN=shared-secret\n");
  fs.writeFileSync(path.join(worktreeRoot, ".secrets.env"), "OWNER_LEAD_METRICS_TOKEN=worktree-secret\n");

  const value = readEnvFileValue("OWNER_LEAD_METRICS_TOKEN", {
    projectRoot: worktreeRoot,
    cwd: worktreeRoot,
    spawnSyncImpl() {
      return {
        status: 0,
        stdout: `${path.join(repoRoot, ".git")}\n`
      };
    }
  });

  assert.equal(value, "worktree-secret");
});
