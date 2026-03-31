const { execFileSync } = require("node:child_process");

const PROTECTED_LOCAL_BRANCHES = new Set(["main", "master"]);

function shouldBlockProtectedBranchCommit(branchName) {
  return PROTECTED_LOCAL_BRANCHES.has(String(branchName || "").trim());
}

function getCurrentBranch() {
  return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    encoding: "utf8"
  }).trim();
}

function main() {
  const currentBranch = getCurrentBranch();

  if (!shouldBlockProtectedBranchCommit(currentBranch)) {
    return;
  }

  throw new Error(
    `pre-commit: ${currentBranch} is sync-only in this repo. Start a codex/<task> worktree before committing real work.`
  );
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
  getCurrentBranch,
  shouldBlockProtectedBranchCommit
};
