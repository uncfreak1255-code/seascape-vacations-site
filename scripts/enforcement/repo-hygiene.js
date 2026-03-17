const { execFileSync } = require("node:child_process");

const SCRATCH_PATTERNS = [
  /^\.superpowers(?:\/|$)/,
  /^lh-live-baseline\.report\.html$/,
  /^lh-live-baseline\.report\.json$/,
  /^_site\/research(?:\/|$)/
];

const LIKELY_REAL_WORK_PATTERNS = [
  /^docs\/outreach\/journalist-pitch-sequences\.md$/,
  /^scripts\/seo\/gsc-client\.js$/,
  /^scripts\/enforcement\/gsc-client\.test\.js$/,
  /^scripts\/enforcement\/guide-inventory\.test\.js$/,
  /^scripts\/inspect-fields\.js$/,
  /^scripts\/pull-hostaway-data\.js$/,
  /^scripts\/data\/.+\.json$/,
  /^src\/research\/.+\.njk$/
];

function classifyUntrackedFiles(paths) {
  const result = {
    scratch: [],
    likelyRealWork: [],
    unknown: []
  };

  for (const value of paths || []) {
    const file = String(value || "").trim();
    if (!file) continue;

    if (SCRATCH_PATTERNS.some((pattern) => pattern.test(file))) {
      result.scratch.push(file);
      continue;
    }

    if (LIKELY_REAL_WORK_PATTERNS.some((pattern) => pattern.test(file))) {
      result.likelyRealWork.push(file);
      continue;
    }

    result.unknown.push(file);
  }

  return result;
}

function getNextSafeCommand({ currentBranch, rootMainDirty, localMainBehindOrigin }) {
  if (currentBranch === "main" && rootMainDirty) {
    return "git switch -c codex/sort-untracked-files";
  }

  if (currentBranch === "main" && localMainBehindOrigin) {
    return "git pull origin main";
  }

  return "git status --short";
}

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function safeRunGit(args) {
  try {
    return runGit(args);
  } catch {
    return "";
  }
}

function fetchOriginMain() {
  try {
    execFileSync("git", ["fetch", "--quiet", "origin", "main", "--prune"], {
      stdio: "ignore"
    });
  } catch {
    // Read-only report should still run if fetch fails.
  }
}

function getRepoSnapshot() {
  fetchOriginMain();

  const currentBranch = safeRunGit(["rev-parse", "--abbrev-ref", "HEAD"]) || "unknown";
  const statusOutput = safeRunGit(["status", "--porcelain"]);
  const statusLines = statusOutput ? statusOutput.split("\n").filter(Boolean) : [];
  const untrackedFiles = statusLines
    .filter((line) => line.startsWith("?? "))
    .map((line) => line.slice(3).trim());
  const classified = classifyUntrackedFiles(untrackedFiles);
  const behindCount = Number(safeRunGit(["rev-list", "--count", "main..origin/main"]) || "0");
  const rootMainDirty = statusLines.length > 0;

  return {
    currentBranch,
    localMainBehindOrigin: Number.isFinite(behindCount) && behindCount > 0,
    rootMainDirty,
    statusLines,
    trackedChanges: statusLines.filter((line) => !line.startsWith("?? ")),
    untrackedFiles,
    classified,
    nextSafeCommand: getNextSafeCommand({
      currentBranch,
      rootMainDirty,
      localMainBehindOrigin: Number.isFinite(behindCount) && behindCount > 0
    })
  };
}

function printSection(title, lines) {
  console.log(`${title}:`);
  if (!lines || !lines.length) {
    console.log("- none");
    return;
  }

  for (const line of lines) {
    console.log(`- ${line}`);
  }
}

function printReport(snapshot) {
  console.log(`Current branch: ${snapshot.currentBranch}`);
  console.log(`Local main behind origin/main: ${snapshot.localMainBehindOrigin ? "yes" : "no"}`);
  console.log(`Root main dirty: ${snapshot.rootMainDirty ? "yes" : "no"}`);
  console.log(`Hard rule: ${snapshot.rootMainDirty && snapshot.currentBranch === "main" ? "Do not start the next task here." : "Workspace is safe to assess."}`);
  printSection("Tracked changes", snapshot.trackedChanges);
  printSection("Scratch artifacts", snapshot.classified.scratch);
  printSection("Likely real work", snapshot.classified.likelyRealWork);
  printSection("Unknown untracked files", snapshot.classified.unknown);
  console.log(`Next safe command: ${snapshot.nextSafeCommand}`);
}

if (require.main === module) {
  printReport(getRepoSnapshot());
}

module.exports = {
  classifyUntrackedFiles,
  getNextSafeCommand,
  getRepoSnapshot
};
