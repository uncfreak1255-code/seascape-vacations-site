const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { withWorktreeLock } = require("./worktree-lock");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const DEFAULT_COMMANDS = Object.freeze([
  { command: "npm", args: ["run", "lint:content"] },
  // lint:content has just built under this chain's lock; avoid npm pretest's second build.
  { command: "npm", args: ["run", "test:unit"] },
  { command: "npm", args: ["run", "verify:links"] }
]);

// A pre-commit hook in a linked worktree exports GIT_DIR without a work tree, so
// every git call the suite makes fails with "must be run in a work tree". Drop
// the repo-locating variables so git finds the repo from cwd. GIT_INDEX_FILE
// decides which staged files get verified: drop it only when it is the repo's
// normal index; for an alternate index (commit -a, commit <paths>) leave the
// hook environment exactly as git set it.
const HOOK_GIT_ENV_KEYS = Object.freeze([
  "GIT_DIR",
  "GIT_WORK_TREE",
  "GIT_PREFIX",
  "GIT_COMMON_DIR"
]);

function defaultIndexPath(cwd, env) {
  const lookupEnv = { ...env };
  delete lookupEnv.GIT_INDEX_FILE;
  const result = spawnSync(
    "git",
    ["rev-parse", "--path-format=absolute", "--git-path", "index"],
    { cwd, env: lookupEnv, encoding: "utf8" }
  );
  return result.status === 0 ? result.stdout.trim() : "";
}

function samePath(left, right) {
  try {
    return fs.realpathSync(left) === fs.realpathSync(right);
  } catch {
    return false;
  }
}

function childEnv(env = process.env, { cwd = PROJECT_ROOT, defaultIndex } = {}) {
  if (!env.GIT_DIR && !env.GIT_INDEX_FILE) {
    return env;
  }
  const indexFile = env.GIT_INDEX_FILE ? path.resolve(cwd, env.GIT_INDEX_FILE) : "";
  const normalIndex = defaultIndex ?? defaultIndexPath(cwd, env);
  if (indexFile && !samePath(indexFile, normalIndex)) {
    return env;
  }
  const next = { ...env };
  for (const key of [...HOOK_GIT_ENV_KEYS, "GIT_INDEX_FILE"]) {
    delete next[key];
  }
  return next;
}

function runCommand(command, args, { cwd = PROJECT_ROOT } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: childEnv(process.env, { cwd }),
    stdio: "inherit"
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const error = new Error(
      `${command} ${args.join(" ")} exited with code ${result.status ?? 1}`
    );
    error.exitCode = result.status || 1;
    throw error;
  }
}

function runProofChain({
  projectRootDir = PROJECT_ROOT,
  commands = DEFAULT_COMMANDS,
  lockOptions = {},
  runner = runCommand
} = {}) {
  return withWorktreeLock(
    {
      name: "repo-build",
      repoRootDir: projectRootDir,
      ...lockOptions
    },
    () => {
      for (const step of commands) {
        runner(step.command, step.args, { cwd: projectRootDir });
      }
    }
  );
}

if (require.main === module) {
  try {
    runProofChain();
  } catch (error) {
    console.error(error.message);
    process.exit(error.exitCode || 1);
  }
}

module.exports = {
  DEFAULT_COMMANDS,
  childEnv,
  runCommand,
  runProofChain
};
