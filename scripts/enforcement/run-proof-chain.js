const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { withWorktreeLock } = require("./worktree-lock");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const DEFAULT_COMMANDS = Object.freeze([
  { command: "npm", args: ["run", "lint:content"] },
  { command: "npm", args: ["test"] },
  { command: "npm", args: ["run", "verify:links"] }
]);

function runCommand(command, args, { cwd = PROJECT_ROOT } = {}) {
  const result = spawnSync(command, args, {
    cwd,
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
  runCommand,
  runProofChain
};
