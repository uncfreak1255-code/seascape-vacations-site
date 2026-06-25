#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");

const DEFAULT_BASE_REF = "origin/main";
const AGENT_START_BIN =
  process.env.SEASCAPE_AGENT_START_BIN || "/Users/sawbeck/bin/agent-start";
const CODEX_REPO_DISPATCH_BIN =
  process.env.CODEX_REPO_DISPATCH_BIN
  || "/Users/sawbeck/Projects/seascape-ops/bin/codex_repo_dispatch.py";

function usage() {
  console.error(
    [
      "Usage: codex-seascape-design <task description> [--prepare] [--allow-fallback]",
      "",
      "Examples:",
      '  codex-seascape-design "refresh the owner hero layout"',
      '  codex-seascape-design "critique the homepage CTA rhythm" --prepare',
      '  codex-seascape-design "critique the homepage CTA rhythm" --allow-fallback',
    ].join("\n")
  );
}

function parseArgs(argv) {
  const options = {
    allowFallback: false,
    help: false,
    prepareOnly: false,
  };
  const filtered = [];

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--prepare") {
      options.prepareOnly = true;
      continue;
    }
    if (arg === "--allow-fallback") {
      options.allowFallback = true;
      continue;
    }
    filtered.push(arg);
  }

  return {
    taskText: filtered.join(" ").trim(),
    options,
  };
}

function slugifyTask(taskText) {
  const slug = taskText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  return slug || "task";
}

function buildTaskName(taskText) {
  const raw = `design-${slugifyTask(taskText)}`;
  return raw.slice(0, 64).replace(/-+$/g, "") || "design-task";
}

function buildBranchName(taskName) {
  return `codex/${taskName}`;
}

function deriveRepoRoot(checkoutRoot, gitCommonDir) {
  const commonDir = path.resolve(checkoutRoot, gitCommonDir);
  return path.basename(commonDir) === ".git"
    ? path.dirname(commonDir)
    : checkoutRoot;
}

function getRepoRoot() {
  const checkoutRoot = path.resolve(__dirname, "..", "..");
  const gitCommonDir = runCommand(
    "git",
    ["rev-parse", "--git-common-dir"],
    { cwd: checkoutRoot }
  ).trim();
  return deriveRepoRoot(checkoutRoot, gitCommonDir);
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    stdio: options.stdio || "pipe",
  });

  if (result.status !== 0) {
    const output = (result.stderr || result.stdout || "").trim();
    const error = new Error(`${command} ${args.join(" ")} failed: ${output}`);
    error.output = output;
    throw error;
  }

  return result.stdout || "";
}

function parseWorktreeList(text) {
  const entries = [];
  let current = null;

  for (const line of [...text.split(/\r?\n/), ""]) {
    if (!line) {
      if (current) {
        entries.push(current);
        current = null;
      }
      continue;
    }

    if (!current) current = {};

    const spaceIndex = line.indexOf(" ");
    const key = spaceIndex === -1 ? line : line.slice(0, spaceIndex);
    const value = spaceIndex === -1 ? "" : line.slice(spaceIndex + 1);
    current[key] = value;
  }

  return entries;
}

function findWorktreePathForBranch(entries, branchName) {
  const branchRef = `refs/heads/${branchName}`;
  const match = entries.find((entry) => entry.branch === branchRef);
  return match ? match.worktree || "" : "";
}

function branchExists(repoRoot, branchName) {
  const result = spawnSync(
    "git",
    ["show-ref", "--verify", "--quiet", `refs/heads/${branchName}`],
    { cwd: repoRoot }
  );
  return result.status === 0;
}

function fetchBaseRef(repoRoot, baseRef) {
  const parts = baseRef.split("/");
  if (parts.length < 2) return;
  const remote = parts.shift();
  const ref = parts.join("/");
  runCommand("git", ["fetch", remote, ref], { cwd: repoRoot });
}

function isDirtyReviewWorktreeLimitError(message) {
  return /dirty\/detached review worktrees exceed limit/i.test(message);
}

function runAgentStart(repoRoot, taskName, baseRef) {
  const result = spawnSync(
    AGENT_START_BIN,
    [taskName, "--base", baseRef, "--json"],
    {
      cwd: repoRoot,
      encoding: "utf8",
    }
  );

  if (result.status !== 0) {
    const output = (result.stderr || result.stdout || "").trim();
    const error = new Error(`agent-start failed: ${output}`);
    error.output = output;
    throw error;
  }

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`agent-start returned non-JSON output: ${result.stdout}`);
  }
}

function ensureFallbackWorktree(repoRoot, taskName, branchName, baseRef) {
  const worktrees = parseWorktreeList(
    runCommand("git", ["worktree", "list", "--porcelain"], { cwd: repoRoot })
  );
  const existingPath = findWorktreePathForBranch(worktrees, branchName);
  if (existingPath) {
    return {
      branchName,
      worktreePath: existingPath,
      launchMode: "fallback-existing-worktree",
    };
  }

  const worktreePath = path.join(repoRoot, ".worktrees", taskName);
  if (fs.existsSync(worktreePath)) {
    throw new Error(
      `Refusing fallback worktree creation because ${worktreePath} already exists without a matching branch record.`
    );
  }

  fs.mkdirSync(path.dirname(worktreePath), { recursive: true });
  fetchBaseRef(repoRoot, baseRef);

  const alreadyHasBranch = branchExists(repoRoot, branchName);
  const args = alreadyHasBranch
    ? ["worktree", "add", worktreePath, branchName]
    : ["worktree", "add", "-b", branchName, worktreePath, baseRef];
  runCommand("git", args, { cwd: repoRoot });

  return {
    branchName,
    worktreePath,
    launchMode: alreadyHasBranch
      ? "fallback-existing-branch"
      : "fallback-new-worktree",
  };
}

function createLane(repoRoot, taskName, baseRef, options = {}) {
  try {
    return {
      ...runAgentStart(repoRoot, taskName, baseRef),
      launchMode: "agent-start",
    };
  } catch (error) {
    if (!isDirtyReviewWorktreeLimitError(error.output || error.message)) {
      throw error;
    }
    if (!options.allowFallback) {
      throw new Error(
        [
          "agent-start refused to create a new lane because dirty/detached review worktrees exceed the allowed limit.",
          "Clean up existing review worktrees or rerun with --allow-fallback if you intentionally want a plain git worktree lane.",
        ].join(" ")
      );
    }
  }

  const branchName = buildBranchName(taskName);
  return ensureFallbackWorktree(repoRoot, taskName, branchName, baseRef);
}

function formatList(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function buildPrompt({ repoRoot, taskText, taskName, branchName, worktreePath }) {
  return [
    "You are opening the Seascape design lane.",
    "",
    `Task id: ${taskName}`,
    `Task: ${taskText}`,
    `Owning repo: ${repoRoot}`,
    `Branch: ${branchName}`,
    `Worktree: ${worktreePath}`,
    "",
    "Use these repo-local skills in this order:",
    formatList([
      "`seascape-design-specialist` for the concept pass, direction set, and implementation brief.",
      "`seascape-design-critic` as the mandatory taste gate before blessing any direction or implementation.",
    ]),
    "",
    "Read order:",
    formatList([
      "AGENTS.md",
      "CLAUDE.md",
      "DESIGN.md",
      "docs/process/design-review-workflow.md",
      "docs/process/seascape-design-studio.md",
      "one task-relevant route, source file, screenshot, mockup, or brief",
    ]),
    "",
    "Design bar:",
    formatList([
      "warm editorial Gulf Coast energy, not generic SaaS polish",
      "strong first-screen thesis and one memorable visual or interaction moment",
      "disciplined whitespace, section rhythm, and premium imagery direction",
      "owner proof or direct-booking math made visible when the route needs it",
      "mobile layouts that still feel designed, not merely stacked",
    ]),
    "",
    "Optional donor lenses when they materially raise the bar:",
    formatList([
      "global `claude-design`",
      "`product-design:ideate`",
      "`product-design:audit`",
      "`creative-production:moodboard-explorer`",
      "`creative-production:scene-explorer`",
      "`creative-production:shot-explorer`",
    ]),
    "",
    "Execution rules:",
    formatList([
      "Start by stating what decision the page must help the visitor make.",
      "Run the critic on the current or proposed direction before approving anything.",
      "If the critic says `Reject` or `Needs another pass`, generate 2-3 stronger directions before coding.",
      "Do not bless bland work just because it is clean or easier to build.",
      "If implementation is requested, work only in source from this worktree and then run `npm run build` plus the rendered `design-review` gate.",
      "For meaningful visual changes, run `npm run test:visual` and capture fresh desktop/mobile proof with `npm run proof:visual` when review receipts matter.",
      "Figma is optional and donor-only unless Sawyer explicitly asks for it.",
    ]),
  ].join("\n");
}

function launchCodex(worktreePath, prompt) {
  const child = spawn(
    CODEX_REPO_DISPATCH_BIN,
    ["-C", worktreePath, "-s", "workspace-write", "-a", "on-request", prompt],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        CODEX_HOME:
          process.env.CODEX_HOME
          || path.join(process.env.HOME || "/Users/sawbeck", ".codex"),
      },
    }
  );

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code == null ? 1 : code);
  });
}

function main() {
  const { taskText, options } = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    process.exit(0);
  }
  if (!taskText) {
    usage();
    process.exit(1);
  }

  const repoRoot = getRepoRoot();
  const taskName = buildTaskName(taskText);
  const lane = createLane(repoRoot, taskName, DEFAULT_BASE_REF, options);
  const prompt = buildPrompt({
    repoRoot,
    taskText,
    taskName,
    branchName: lane.branchName,
    worktreePath: lane.worktreePath,
  });

  if (options.prepareOnly) {
    process.stdout.write(
      JSON.stringify(
        {
          repoRoot,
          task: taskText,
          taskName,
          branchName: lane.branchName,
          worktreePath: lane.worktreePath,
          launchMode: lane.launchMode,
          prompt,
        },
        null,
        2
      )
    );
    process.stdout.write("\n");
    return;
  }

  launchCodex(lane.worktreePath, prompt);
}

if (require.main === module) {
  main();
}

module.exports = {
  buildPrompt,
  buildTaskName,
  deriveRepoRoot,
  findWorktreePathForBranch,
  isDirtyReviewWorktreeLimitError,
  parseArgs,
  parseWorktreeList,
  slugifyTask,
};
