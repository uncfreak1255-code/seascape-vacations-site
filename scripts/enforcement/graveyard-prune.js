const { execFileSync } = require("node:child_process");

const GENERATED_PATH_PATTERNS = [
  /^_site(?:\/|$)/,
  /^\.gstack(?:\/|$)/,
  /^tmp(?:\/|$)/,
  /^dist(?:\/|$)/,
  /^build(?:\/|$)/
];

const PROTECTED_BRANCH_PATTERNS = [
  /^main$/,
  /^master$/,
  /^claude\//,
  /^cowork\//
];

function parseArgs(argv) {
  return {
    apply: argv.includes("--apply"),
    json: argv.includes("--json"),
    help: argv.includes("--help")
  };
}

function runGit(args, cwd = process.cwd()) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function safeRunGit(args, cwd = process.cwd()) {
  try {
    return runGit(args, cwd);
  } catch {
    return "";
  }
}

function safeRunJsonCommand(command, args, cwd = process.cwd()) {
  try {
    const output = execFileSync(command, args, { cwd, encoding: "utf8" }).trim();
    return output ? JSON.parse(output) : [];
  } catch {
    return [];
  }
}

function isAncestorOfOriginMain(head, cwd = process.cwd()) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", head, "origin/main"], {
      cwd,
      stdio: "ignore"
    });
    return true;
  } catch {
    return false;
  }
}

function parseWorktreeList(output) {
  const items = [];
  let current = {};

  for (const line of String(output || "").split("\n")) {
    if (!line.trim()) {
      if (Object.keys(current).length > 0) {
        items.push(current);
        current = {};
      }
      continue;
    }

    const [key, ...rest] = line.split(" ");
    current[key] = rest.join(" ");
  }

  if (Object.keys(current).length > 0) {
    items.push(current);
  }

  return items;
}

function extractStatusPaths(statusLines) {
  const paths = [];

  for (const rawLine of statusLines || []) {
    const line = String(rawLine || "").trimEnd();
    if (!line) continue;

    const match = line.match(/^(..)\s+(.*)$/);
    const payload = (match ? match[2] : line).trim();
    if (!payload) continue;

    const renamed = payload.includes(" -> ")
      ? payload.split(" -> ").pop().trim()
      : payload;

    paths.push(renamed);
  }

  return paths;
}

function classifyWorkspaceDirt(statusLines) {
  const paths = extractStatusPaths(statusLines);
  const result = {
    clean: paths.length === 0,
    generatedOnly: false,
    generatedChanges: [],
    sourceChanges: []
  };

  for (const file of paths) {
    if (GENERATED_PATH_PATTERNS.some((pattern) => pattern.test(file))) {
      result.generatedChanges.push(file);
    } else {
      result.sourceChanges.push(file);
    }
  }

  result.generatedOnly =
    result.generatedChanges.length > 0 && result.sourceChanges.length === 0;

  return result;
}

function isProtectedBranch(branch) {
  return PROTECTED_BRANCH_PATTERNS.some((pattern) => pattern.test(String(branch || "")));
}

function classifyCandidate(candidate) {
  const {
    kind,
    branch,
    isCurrent,
    ancestorOfMain,
    upstreamGone,
    prState,
    dirt,
    containedByBranches = []
  } = candidate;

  if (isCurrent && branch === "main") {
    return {
      decision: "keep",
      reason: "current authoritative checkout"
    };
  }

  if (branch !== "DETACHED" && isProtectedBranch(branch)) {
    return {
      decision: "keep",
      reason: "protected branch prefix"
    };
  }

  if (prState?.state === "OPEN") {
    return {
      decision: "keep",
      reason: `open PR #${prState.number}`
    };
  }

  if (dirt.sourceChanges.length > 0) {
    return {
      decision: "needs_review",
      reason: `source changes present: ${dirt.sourceChanges.slice(0, 3).join(", ")}`
    };
  }

  if (
    prState?.state === "MERGED" &&
    prState.baseRefName === "main" &&
    (dirt.clean || dirt.generatedOnly)
  ) {
    return {
      decision: "safe_to_delete",
      reason: `merged PR #${prState.number}`
    };
  }

  if (
    kind === "worktree" &&
    branch === "DETACHED" &&
    containedByBranches.length > 0 &&
    (dirt.clean || dirt.generatedOnly)
  ) {
    return {
      decision: "safe_to_delete",
      reason: `detached duplicate preserved by local branch: ${containedByBranches.join(", ")}`
    };
  }

  if (
    kind === "worktree" &&
    branch === "DETACHED" &&
    ancestorOfMain &&
    (dirt.clean || dirt.generatedOnly)
  ) {
    return {
      decision: "safe_to_delete",
      reason: "detached duplicate already reachable from origin/main"
    };
  }

  if (ancestorOfMain && upstreamGone && (dirt.clean || dirt.generatedOnly)) {
    return {
      decision: "safe_to_delete",
      reason: "merged into main and upstream is gone"
    };
  }

  if (!ancestorOfMain) {
    return {
      decision: "needs_review",
      reason: "head is not reachable from origin/main"
    };
  }

  if (dirt.generatedOnly) {
    return {
      decision: "needs_review",
      reason: "generated output dirt present but no proven safe delete signal"
    };
  }

  return {
    decision: "keep",
    reason: "still has a live branch/worktree reference"
  };
}

function getPrIndex(cwd = process.cwd()) {
  const rows = safeRunJsonCommand(
    "gh",
    [
      "pr",
      "list",
      "--state",
      "all",
      "--limit",
      "200",
      "--json",
      "headRefName,state,mergedAt,number,baseRefName"
    ],
    cwd
  );

  const map = new Map();
  for (const row of rows) {
    if (!row?.headRefName) continue;
    const existing = map.get(row.headRefName);
    if (!existing) {
      map.set(row.headRefName, row);
      continue;
    }

    if (existing.state !== "OPEN" && row.state === "OPEN") {
      map.set(row.headRefName, row);
      continue;
    }

    if (
      existing.state === row.state &&
      String(row.mergedAt || row.number || "") > String(existing.mergedAt || existing.number || "")
    ) {
      map.set(row.headRefName, row);
    }
  }

  return map;
}

function getBranchIndex(cwd = process.cwd()) {
  const output = safeRunGit(
    [
      "for-each-ref",
      "--format=%(refname:short)\t%(objectname)\t%(upstream:short)\t%(upstream:track)",
      "refs/heads"
    ],
    cwd
  );

  const map = new Map();
  for (const line of output.split("\n").filter(Boolean)) {
    const [branch, head, upstream, track] = line.split("\t");
    map.set(branch, {
      branch,
      head,
      upstream,
      upstreamGone: /\[gone\]/.test(track || "")
    });
  }

  return map;
}

function getContainingBranches(head, cwd = process.cwd()) {
  return safeRunGit(["branch", "--contains", head], cwd)
    .split("\n")
    .map((line) => line.replace(/^[*+ ]+/, "").trim())
    .filter(Boolean);
}

function getStatusLines(worktreePath, cwd = process.cwd()) {
  const output = safeRunGit(["-C", worktreePath, "status", "--porcelain"], cwd);
  return output ? output.split("\n").filter(Boolean) : [];
}

function createAuditReaders(cwd = process.cwd(), options = {}) {
  const {
    getStatusLinesForPath = getStatusLines,
    isAncestorForHead = isAncestorOfOriginMain
  } = options;

  const dirtByWorktree = new Map();
  const ancestorByHead = new Map();

  return {
    getWorkspaceDirt(worktreePath) {
      if (!dirtByWorktree.has(worktreePath)) {
        dirtByWorktree.set(
          worktreePath,
          classifyWorkspaceDirt(getStatusLinesForPath(worktreePath, cwd))
        );
      }

      return dirtByWorktree.get(worktreePath);
    },
    getAncestorState(head) {
      if (!ancestorByHead.has(head)) {
        ancestorByHead.set(head, isAncestorForHead(head, cwd));
      }

      return ancestorByHead.get(head);
    }
  };
}

function buildAudit(cwd = process.cwd(), options = {}) {
  const {
    getRepoRoot = (targetCwd) => runGit(["rev-parse", "--show-toplevel"], targetCwd),
    getCurrentBranchName = (targetCwd) =>
      safeRunGit(["rev-parse", "--abbrev-ref", "HEAD"], targetCwd) || "unknown",
    getPrIndexForRoot = getPrIndex,
    getBranchIndexForRoot = getBranchIndex,
    listWorktrees = (rootPath) =>
      parseWorktreeList(runGit(["worktree", "list", "--porcelain"], rootPath))
  } = options;

  const root = getRepoRoot(cwd);
  const currentBranch = getCurrentBranchName(cwd);
  const prIndex = getPrIndexForRoot(root);
  const branchIndex = getBranchIndexForRoot(root);
  const worktrees = listWorktrees(root);
  const readers = createAuditReaders(root, options);
  const worktreeByBranch = new Map();
  const worktreeReports = [];

  for (const item of worktrees) {
    const branch = item.branch ? item.branch.replace(/^refs\/heads\//, "") : "DETACHED";
    const head = item.HEAD;
    const worktreePath = item.worktree;
    const dirt = readers.getWorkspaceDirt(worktreePath);
    const ancestorOfMain = readers.getAncestorState(head);

    const containedByBranches =
      branch === "DETACHED" ? getContainingBranches(head, root) : [];
    const report = {
      kind: "worktree",
      path: worktreePath,
      branch,
      head,
      isCurrent: worktreePath === root,
      ancestorOfMain,
      upstreamGone: branchIndex.get(branch)?.upstreamGone || false,
      prState: prIndex.get(branch) || null,
      containedByBranches,
      dirt
    };

    report.classification = classifyCandidate(report);
    worktreeReports.push(report);

    if (branch !== "DETACHED") {
      worktreeByBranch.set(branch, worktreePath);
    }
  }

  const branchReports = [];
  for (const branchData of branchIndex.values()) {
    const dirt = worktreeByBranch.has(branchData.branch)
      ? readers.getWorkspaceDirt(worktreeByBranch.get(branchData.branch))
      : classifyWorkspaceDirt([]);

    const ancestorOfMain = readers.getAncestorState(branchData.head);

    const report = {
      kind: "branch",
      branch: branchData.branch,
      path: worktreeByBranch.get(branchData.branch) || "",
      head: branchData.head,
      isCurrent: branchData.branch === currentBranch,
      ancestorOfMain,
      upstreamGone: branchData.upstreamGone,
      prState: prIndex.get(branchData.branch) || null,
      containedByBranches: [branchData.branch],
      dirt
    };

    report.classification = classifyCandidate(report);
    branchReports.push(report);
  }

  return {
    root,
    currentBranch,
    worktrees: worktreeReports,
    branches: branchReports
  };
}

function bucketReports(reports) {
  return {
    safeToDelete: reports.filter((report) => report.classification.decision === "safe_to_delete"),
    needsReview: reports.filter((report) => report.classification.decision === "needs_review"),
    keep: reports.filter((report) => report.classification.decision === "keep")
  };
}

function printBucket(title, reports, formatter) {
  console.log(`${title}:`);
  if (!reports.length) {
    console.log("- none");
    return;
  }

  for (const report of reports) {
    console.log(`- ${formatter(report)} — ${report.classification.reason}`);
  }
}

function printAudit(audit) {
  const worktreeBuckets = bucketReports(audit.worktrees);
  const branchBuckets = bucketReports(audit.branches);

  console.log(`Repo root: ${audit.root}`);
  console.log(`Current branch: ${audit.currentBranch}`);
  console.log(`Mode: audit (dry-run)`);
  printBucket("Safe worktrees", worktreeBuckets.safeToDelete, (item) => item.path);
  printBucket("Safe branches", branchBuckets.safeToDelete, (item) => item.branch);
  printBucket("Worktrees needing review", worktreeBuckets.needsReview, (item) => item.path);
  printBucket("Branches needing review", branchBuckets.needsReview, (item) => item.branch);
  printBucket("Kept worktrees", worktreeBuckets.keep, (item) => item.path);
  printBucket("Kept branches", branchBuckets.keep, (item) => item.branch);
}

function applyAudit(audit) {
  const worktreeBuckets = bucketReports(audit.worktrees);
  const branchBuckets = bucketReports(audit.branches);

  for (const report of worktreeBuckets.safeToDelete) {
    execFileSync(
      "git",
      ["worktree", "remove", report.dirt.clean ? report.path : "--force", report.dirt.clean ? undefined : report.path].filter(Boolean),
      { cwd: audit.root, stdio: "ignore" }
    );
  }

  execFileSync("git", ["worktree", "prune"], { cwd: audit.root, stdio: "ignore" });

  const attachedBranches = new Set(
    parseWorktreeList(runGit(["worktree", "list", "--porcelain"], audit.root))
      .map((item) => item.branch ? item.branch.replace(/^refs\/heads\//, "") : "")
      .filter(Boolean)
  );

  for (const report of branchBuckets.safeToDelete) {
    if (attachedBranches.has(report.branch)) continue;
    execFileSync("git", ["branch", "-D", report.branch], {
      cwd: audit.root,
      stdio: "ignore"
    });
  }

  return {
    removedWorktrees: worktreeBuckets.safeToDelete.length,
    removedBranches: branchBuckets.safeToDelete.filter((report) => !attachedBranches.has(report.branch)).length
  };
}

function printHelp() {
  console.log("Usage: node scripts/enforcement/graveyard-prune.js [--apply] [--json]");
  console.log("--apply  delete only the items classified safe_to_delete");
  console.log("--json   print the audit as JSON");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const audit = buildAudit(process.cwd());

  if (args.apply) {
    const applied = applyAudit(audit);
    const refreshed = buildAudit(process.cwd());
    if (args.json) {
      console.log(JSON.stringify({ applied, audit: refreshed }, null, 2));
    } else {
      console.log(`Applied cleanup: removed ${applied.removedWorktrees} worktrees and ${applied.removedBranches} branches.`);
      printAudit(refreshed);
    }
  } else if (args.json) {
    console.log(JSON.stringify(audit, null, 2));
  } else {
    printAudit(audit);
  }
}

module.exports = {
  buildAudit,
  classifyCandidate,
  classifyWorkspaceDirt,
  extractStatusPaths,
  isAncestorOfOriginMain,
  parseArgs,
  parseWorktreeList
};
