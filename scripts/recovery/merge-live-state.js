#!/usr/bin/env node
// Step 1 of the post-merge live proof: is a merge on origin/production yet?
// `git merge-base --is-ancestor` exits 1 for "not an ancestor" but 128 when
// the commit is unknown locally (for example only production was fetched), so
// a bare exit-code check reads a missing commit as "queued". This script
// fetches both branches and names each state.
//
// Exit codes: 0 live-branch (production contains the merge; next confirm the
// Netlify deploy), 1 queued (on main, not yet published), 2 unknown commit or
// not on origin/main, 3 usage or git/fetch error (no verdict).
const { execFileSync, spawnSync } = require("node:child_process");

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function isAncestor(cwd, sha, ref) {
  const result = spawnSync("git", ["merge-base", "--is-ancestor", sha, ref], { cwd, encoding: "utf8" });
  if (result.status === 0) return true;
  if (result.status === 1) return false;
  throw new Error(`git merge-base --is-ancestor ${sha} ${ref} exited ${result.status}: ${(result.stderr || "").trim()}`);
}

function mergeLiveState({ sha, cwd = process.cwd(), fetch = true }) {
  // A hex SHA only: a branch name or HEAD would get a confident verdict about
  // whatever it happens to resolve to.
  if (!/^[0-9a-f]{7,40}$/i.test(sha || "")) throw new Error("usage: merge-live-state <merge-sha> (hex SHA of the commit on main)");
  // Explicit refspecs: a clone whose fetch config covers one branch would
  // otherwise leave origin/main stale or missing.
  if (fetch) {
    git(cwd, ["fetch", "--quiet", "origin",
      "+refs/heads/main:refs/remotes/origin/main",
      "+refs/heads/production:refs/remotes/origin/production"]);
  }
  const exists = spawnSync("git", ["cat-file", "-e", `${sha}^{commit}`], { cwd }).status === 0;
  if (!exists) {
    const shallow = git(cwd, ["rev-parse", "--is-shallow-repository"]) === "true";
    return { state: shallow ? "unknown-commit-shallow" : "unknown-commit", exitCode: 2, sha };
  }
  const full = git(cwd, ["rev-parse", `${sha}^{commit}`]);
  if (!isAncestor(cwd, full, "origin/main")) return { state: "not-on-main", exitCode: 2, sha: full };
  if (isAncestor(cwd, full, "origin/production")) return { state: "live-branch", exitCode: 0, sha: full };
  return { state: "queued", exitCode: 1, sha: full };
}

const MESSAGES = {
  "live-branch": "origin/production contains the merge; next confirm Netlify's production deploy commit_ref (step 2)",
  queued: "merged to origin/main, queued for the next publish; not live",
  "unknown-commit": "commit not found after fetching origin main and production; check the SHA",
  "unknown-commit-shallow": "commit not found in this shallow clone; run `git fetch --unshallow origin` and retry",
  "not-on-main": "commit is not on origin/main; pass the merge (squash) commit from main, not a PR head SHA"
};

if (require.main === module) {
  try {
    const result = mergeLiveState({ sha: process.argv[2] });
    console.log(`${result.state} ${result.sha}: ${MESSAGES[result.state]}`);
    process.exit(result.exitCode);
  } catch (error) {
    console.error(`merge-live-state: ${error.message}`);
    process.exit(3);
  }
}

module.exports = { mergeLiveState };
