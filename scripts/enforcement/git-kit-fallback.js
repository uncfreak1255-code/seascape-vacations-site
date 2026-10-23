const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { refuseSkip } = require("./fail-closed");

const COMMANDS = {
  preflight: "guardrail-preflight",
  "safe-commit": "guardrail-safe-commit",
  "merge-check": "guardrail-merge-check"
};

const DEFAULT_GENERATED_PATHS = [
  "_site/",
  "_site_verify",
  "_site_verify_fresh",
  "tmp/",
  "dist/",
  "build/"
];

function resolveMacKitPath(command, kitDir = process.env.SEASCAPE_GIT_KIT_DIR || "/Users/sawbeck/bin") {
  const binaryName = COMMANDS[command];
  if (!binaryName) {
    throw new Error(
      `git-kit-fallback.js: unknown command "${command || ""}"; expected preflight, safe-commit, or merge-check`
    );
  }

  return path.join(kitDir, binaryName);
}

function runPreCommit(args, spawnOptions) {
  const preCommit = path.join(__dirname, "pre-commit.js");
  const result = spawnSync(process.execPath, [preCommit, ...args], spawnOptions);
  return result.status == null ? 1 : result.status;
}

function parseSafeCommitArgs(args) {
  let stageSource = false;
  let message = "";

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--stage-source") {
      stageSource = true;
      continue;
    }
    if (arg === "-m" || arg === "--message") {
      message = args[index + 1] || "";
      index += 1;
    }
  }

  return { stageSource, message: String(message).trim() };
}

function loadGeneratedPaths(cwd) {
  const guardrailsPath = path.join(cwd, ".guardrails.json");
  if (!fs.existsSync(guardrailsPath)) {
    return DEFAULT_GENERATED_PATHS;
  }

  const config = JSON.parse(fs.readFileSync(guardrailsPath, "utf8"));
  return Array.isArray(config.generatedPaths) ? config.generatedPaths : DEFAULT_GENERATED_PATHS;
}

function isGeneratedPath(file, generatedPaths) {
  const normalized = String(file || "").replace(/^\.\//, "");
  return generatedPaths.some((generated) => {
    const prefix = String(generated).replace(/\/$/, "");
    return normalized === prefix || normalized.startsWith(`${prefix}/`);
  });
}

function porcelainPath(line) {
  return String(line || "")
    .slice(3)
    .replace(/^.* -> /, "")
    .replace(/^"|"$/g, "");
}

function runGit(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    throw new Error(detail || `git-kit-fallback.js: git ${args.join(" ")} failed`);
  }

  return (result.stdout || "").trim();
}

function listChangedFiles(cwd) {
  const output = spawnSync("git", ["status", "--porcelain", "-uall"], {
    cwd,
    encoding: "utf8"
  });
  if (output.status !== 0) {
    throw new Error((output.stderr || "").trim() || "git-kit-fallback.js: git status failed");
  }

  return String(output.stdout || "")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map(porcelainPath)
    .filter(Boolean);
}

function runPortableSafeCommit(args, spawnOptions) {
  const cwd = spawnOptions.cwd || process.cwd();
  const preCommitStatus = runPreCommit([], spawnOptions);
  if (preCommitStatus !== 0) {
    return preCommitStatus;
  }

  const { stageSource, message } = parseSafeCommitArgs(args);
  if (!message) {
    refuseSkip("git-kit-fallback.js", "safe-commit requires -m <message>");
  }

  const generatedPaths = loadGeneratedPaths(cwd);
  if (stageSource) {
    const sourceFiles = listChangedFiles(cwd).filter((file) => !isGeneratedPath(file, generatedPaths));
    if (sourceFiles.length === 0) {
      refuseSkip("git-kit-fallback.js", "safe-commit --stage-source found no source files to commit");
    }
    runGit(["add", "--", ...sourceFiles], cwd);
  }

  const stagedFiles = runGit(["diff", "--cached", "--name-only"], cwd)
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean);
  const generatedStaged = stagedFiles.filter((file) => isGeneratedPath(file, generatedPaths));
  if (generatedStaged.length > 0) {
    runGit(["reset", "-q", "HEAD", "--", ...generatedStaged], cwd);
  }

  const staged = runGit(["diff", "--cached", "--name-only"], cwd);
  if (!staged) {
    refuseSkip("git-kit-fallback.js", "safe-commit has nothing staged");
  }

  runGit(["-c", "commit.gpgsign=false", "commit", "--no-gpg-sign", "-m", message], cwd);
  return 0;
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

  if (command === "preflight") {
    return runPreCommit(args, spawnOptions);
  }

  if (command === "safe-commit") {
    return runPortableSafeCommit(args, spawnOptions);
  }

  if (command === "merge-check") {
    refuseSkip(
      "git-kit-fallback.js",
      "merge-check cannot skip-as-pass without the Mac git kit; install /Users/sawbeck/bin/guardrail-merge-check or run verify:release"
    );
  }

  throw new Error(`git-kit-fallback.js: no portable fallback for ${command}`);
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
  parseSafeCommitArgs,
  resolveMacKitPath,
  runGitKitFallback
};
