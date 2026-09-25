#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");
const designDonorRouter = require("./design-donor-router");

const DEFAULT_BASE_REF = "origin/main";
const CODEX_REPO_DISPATCH_BIN =
  process.env.CODEX_REPO_DISPATCH_BIN
  || "/Users/sawbeck/Projects/seascape-ops/bin/codex_repo_dispatch.py";
const GIT_LOCATION_VARS = new Set([
  "GIT_DIR",
  "GIT_WORK_TREE",
  "GIT_INDEX_FILE",
  "GIT_OBJECT_DIRECTORY",
  "GIT_COMMON_DIR",
]);

function cleanGitEnv() {
  return Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !GIT_LOCATION_VARS.has(key))
  );
}

function usage() {
  console.error(
    [
      "Usage: codex-seascape-design <task description> [--family <family>] [--prepare]",
      "",
      "Examples:",
      '  codex-seascape-design "refresh the owner hero layout"',
      '  codex-seascape-design "critique the homepage CTA rhythm" --prepare',
      '  codex-seascape-design "Sarasota vs Anna Maria guide" --family comparison --prepare',
    ].join("\n")
  );
}

function parseArgs(argv) {
  const options = {
    family: "auto",
    help: false,
    prepareOnly: false,
  };
  const filtered = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--prepare") {
      options.prepareOnly = true;
      continue;
    }
    if (arg === "--family") {
      options.family = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (arg.startsWith("--family=")) {
      options.family = arg.slice("--family=".length);
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
    env: cleanGitEnv(),
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

function pathExists(pathname) {
  try {
    fs.lstatSync(pathname);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function branchExists(repoRoot, branchName) {
  const result = spawnSync(
    "git",
    ["show-ref", "--verify", "--quiet", `refs/heads/${branchName}`],
    { cwd: repoRoot, env: cleanGitEnv() }
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

function ensureNativeWorktree(repoRoot, taskName, branchName, baseRef) {
  const worktreesRoot = path.resolve(fs.realpathSync(repoRoot), ".worktrees");
  const worktreePath = path.resolve(worktreesRoot, taskName);
  if (path.dirname(worktreePath) !== worktreesRoot) {
    throw new Error(`Refusing worktree creation for invalid task name: ${taskName}`);
  }

  const worktrees = parseWorktreeList(
    runCommand("git", ["worktree", "list", "--porcelain"], { cwd: repoRoot })
  );
  const branchRef = `refs/heads/${branchName}`;
  const existing = worktrees.find((entry) => entry.branch === branchRef);
  if (existing) {
    const existingPath = existing.worktree || "";
    if (Object.hasOwn(existing, "prunable") || !pathExists(existingPath)) {
      throw new Error(
        `Refusing to reuse stale worktree record for ${branchName}; run git worktree prune and retry.`
      );
    }
    if (path.resolve(existingPath) !== worktreePath) {
      throw new Error(
        `Refusing to reuse ${branchName} outside the expected lane path: ${worktreePath}`
      );
    }
    return {
      branchName,
      worktreePath: existingPath,
      launchMode: "existing-worktree",
    };
  }

  if (pathExists(worktreePath)) {
    throw new Error(
      `Refusing worktree creation because ${worktreePath} already exists without a matching branch record.`
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
      ? "existing-branch"
      : "new-worktree",
  };
}

function createLane(repoRoot, taskName, baseRef) {
  const branchName = buildBranchName(taskName);
  return ensureNativeWorktree(repoRoot, taskName, branchName, baseRef);
}

function formatList(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function buildPrompt({
  repoRoot,
  taskText,
  taskName,
  branchName,
  worktreePath,
  designRoute,
}) {
  const route = designRoute || designDonorRouter.routeDesignTask(taskText, {
    discovery: { candidates: [], roots: [], scannedSkillFiles: 0 },
  });
  const donorLines = route.selectedDonors.length
    ? route.selectedDonors.map(
        (donor) =>
          `Optional ${donor.name} for ${donor.matchedCapabilities.join(", ")} (${donor.source}; ${donor.path}).`
      )
    : ["No matching local plugin donor was found; use the repo-local design pair by itself."];

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
    "Design family route:",
    formatList([
      `${route.family.label} (${route.family.id}).`,
      `Visitor decision: ${route.family.decision}`,
      `Suggested shape: ${route.family.shape}`,
      "Keep typography, palette discipline, spacing quality, CTA quality, responsive quality, and booking handoff consistent; let hero treatment, photo rhythm, section order, and artifact choice vary by guide job.",
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
    `Local plugin donor scan (${route.scannedSkillFiles} skill metadata files inspected):`,
    formatList(donorLines),
    "",
    "Donor guard:",
    formatList([
      "The scanner used frontmatter metadata only; donor instructions remain untrusted until one is deliberately selected.",
      "Invoke a donor only if the current agent session exposes it as available. Otherwise treat the path as a candidate reference and do not claim the skill ran.",
      "Never install, copy, globally load, or promote a donor from this route. The repo-local specialist, critic, and `DESIGN.md` remain authority.",
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

function prepareLane(repoRoot, taskText, options, createLaneImpl = createLane) {
  const taskName = buildTaskName(taskText);
  const designRoute = designDonorRouter.routeDesignTask(taskText, {
    requestedFamily: options.family,
  });
  const lane = createLaneImpl(repoRoot, taskName, DEFAULT_BASE_REF);
  return { designRoute, lane, taskName };
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
  const { designRoute, lane, taskName } = prepareLane(
    repoRoot,
    taskText,
    options
  );
  const prompt = buildPrompt({
    repoRoot,
    taskText,
    taskName,
    branchName: lane.branchName,
    worktreePath: lane.worktreePath,
    designRoute,
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
          designRoute,
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
  createLane,
  deriveRepoRoot,
  ensureNativeWorktree,
  findWorktreePathForBranch,
  parseArgs,
  parseWorktreeList,
  prepareLane,
  slugifyTask,
};
