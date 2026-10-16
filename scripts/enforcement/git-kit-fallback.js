const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const COMMANDS = {
  preflight: "guardrail-preflight",
  "safe-commit": "guardrail-safe-commit",
  "merge-check": "guardrail-merge-check"
};

function resolveMacKitPath(command, kitDir = process.env.SEASCAPE_GIT_KIT_DIR || "/Users/sawbeck/bin") {
  const binaryName = COMMANDS[command];
  if (!binaryName) {
    throw new Error(
      `git-kit-fallback.js: unknown command "${command || ""}"; expected preflight, safe-commit, or merge-check`
    );
  }

  return path.join(kitDir, binaryName);
}

function runGitKitFallback(command, args = [], options = {}) {
  const kitDir = options.kitDir || process.env.SEASCAPE_GIT_KIT_DIR || "/Users/sawbeck/bin";
  const macBin = resolveMacKitPath(command, kitDir);
  const spawnOptions = {
    stdio: "inherit",
    ...options.spawn
  };

  if (fs.existsSync(macBin)) {
    const result = spawnSync(macBin, args, spawnOptions);
    return result.status == null ? 1 : result.status;
  }

  const preCommit = path.join(__dirname, "pre-commit.js");
  const result = spawnSync(process.execPath, [preCommit, ...args], spawnOptions);
  return result.status == null ? 1 : result.status;
}

function main(argv = process.argv.slice(2)) {
  const [command, ...args] = argv;
  if (!command || !String(command).trim()) {
    throw new Error(
      "git-kit-fallback.js: command required; expected preflight, safe-commit, or merge-check"
    );
  }

  const status = runGitKitFallback(command, args);
  if (status !== 0) {
    process.exit(status);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  COMMANDS,
  main,
  resolveMacKitPath,
  runGitKitFallback
};
