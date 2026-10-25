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

// A pre-commit hook exports these, pinned to the hook's own repository. Child
// tests that run git in a temp repo, or from a linked worktree, then fail with
// "must be run in a work tree"; drop them so git finds the repo from cwd.
const HOOK_GIT_ENV_KEYS = Object.freeze([
  "GIT_DIR",
  "GIT_WORK_TREE",
  "GIT_INDEX_FILE",
  "GIT_PREFIX",
  "GIT_COMMON_DIR",
  "GIT_OBJECT_DIRECTORY",
  "GIT_ALTERNATE_OBJECT_DIRECTORIES"
]);

function childEnv(env = process.env) {
  const next = { ...env };
  for (const key of HOOK_GIT_ENV_KEYS) {
    delete next[key];
  }
  return next;
}

function runCommand(command, args, { cwd = PROJECT_ROOT } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: childEnv(),
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
