const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildAudit,
  classifyWorkspaceDirt,
  classifyCandidate,
  extractStatusPaths
} = require("./graveyard-prune");

test("extractStatusPaths normalizes tracked, untracked, and rename status lines", () => {
  const paths = extractStatusPaths([
    " M _site/index.html",
    "?? .gstack/session.log",
    "R  old/path.js -> src/new-path.js",
    "M  .gitignore",
    "A  package.json"
  ]);

  assert.deepEqual(paths, [
    "_site/index.html",
    ".gstack/session.log",
    "src/new-path.js",
    ".gitignore",
    "package.json"
  ]);
});

test("classifyWorkspaceDirt treats generated output as safe churn", () => {
  const dirt = classifyWorkspaceDirt([
    " M _site/index.html",
    "?? .gstack/session.log",
    " D _site/guides/example.html"
  ]);

  assert.equal(dirt.clean, false);
  assert.equal(dirt.generatedOnly, true);
  assert.deepEqual(dirt.generatedChanges, [
    "_site/index.html",
    ".gstack/session.log",
    "_site/guides/example.html"
  ]);
  assert.deepEqual(dirt.sourceChanges, []);
});

test("classifyCandidate keeps the authoritative checkout", () => {
  const result = classifyCandidate({
    kind: "worktree",
    branch: "main",
    path: "/repo",
    isCurrent: true,
    ancestorOfMain: true,
    upstreamGone: false,
    prState: null,
    dirt: classifyWorkspaceDirt([])
  });

  assert.equal(result.decision, "keep");
  assert.match(result.reason, /authoritative checkout/i);
});

test("classifyCandidate marks merged PR branches safe even when squash merge hides ancestry", () => {
  const result = classifyCandidate({
    kind: "branch",
    branch: "codex/nav-header-unification-clean",
    path: "/repo/.worktrees/nav-header-unification-clean",
    isCurrent: false,
    ancestorOfMain: false,
    upstreamGone: true,
    prState: {
      number: 71,
      state: "MERGED",
      baseRefName: "main"
    },
    dirt: classifyWorkspaceDirt([
      " M _site/index.html"
    ])
  });

  assert.equal(result.decision, "safe_to_delete");
  assert.match(result.reason, /merged pr #71/i);
});

test("classifyCandidate marks ancestor branches with gone upstream and generated-only dirt safe", () => {
  const result = classifyCandidate({
    kind: "branch",
    branch: "codex/repo-safety-hardening",
    path: "/repo/.worktrees/repo-safety-hardening",
    isCurrent: false,
    ancestorOfMain: true,
    upstreamGone: true,
    prState: null,
    dirt: classifyWorkspaceDirt([
      " M _site/index.html"
    ])
  });

  assert.equal(result.decision, "safe_to_delete");
  assert.match(result.reason, /merged into main/i);
});

test("classifyCandidate keeps protected collaborator branches out of auto-delete", () => {
  const result = classifyCandidate({
    kind: "branch",
    branch: "claude/jovial-snyder",
    path: "/repo/.claude/worktrees/jovial-snyder",
    isCurrent: false,
    ancestorOfMain: false,
    upstreamGone: false,
    prState: null,
    dirt: classifyWorkspaceDirt([
      " M src/index.njk"
    ])
  });

  assert.equal(result.decision, "keep");
  assert.match(result.reason, /protected branch prefix/i);
});

test("classifyCandidate sends non-main source work to needs_review", () => {
  const result = classifyCandidate({
    kind: "branch",
    branch: "codex/seo-structure-cleanup",
    path: "/repo/.worktrees/codex-seo-structure",
    isCurrent: false,
    ancestorOfMain: false,
    upstreamGone: false,
    prState: null,
    dirt: classifyWorkspaceDirt([
      " M src/guides/index.njk"
    ])
  });

  assert.equal(result.decision, "needs_review");
  assert.match(result.reason, /source changes/i);
});

test("classifyCandidate keeps open PR branches out of the delete bucket", () => {
  const result = classifyCandidate({
    kind: "branch",
    branch: "codex/execution-phase-plans",
    path: "/repo/.worktrees/codex-execution-phase-plans",
    isCurrent: false,
    ancestorOfMain: false,
    upstreamGone: false,
    prState: {
      number: 999,
      state: "OPEN",
      baseRefName: "main"
    },
    dirt: classifyWorkspaceDirt([])
  });

  assert.equal(result.decision, "keep");
  assert.match(result.reason, /open pr/i);
});

test("classifyCandidate deletes clean detached duplicates that are already in main", () => {
  const result = classifyCandidate({
    kind: "worktree",
    branch: "DETACHED",
    path: "/repo/.codex/worktrees/0092",
    isCurrent: false,
    ancestorOfMain: true,
    upstreamGone: false,
    containedByBranches: [],
    prState: null,
    dirt: classifyWorkspaceDirt([])
  });

  assert.equal(result.decision, "safe_to_delete");
  assert.match(result.reason, /detached duplicate/i);
});

test("classifyCandidate deletes detached duplicates that are preserved by another local branch", () => {
  const result = classifyCandidate({
    kind: "worktree",
    branch: "DETACHED",
    path: "/repo/.codex/worktrees/71f7",
    isCurrent: false,
    ancestorOfMain: false,
    upstreamGone: false,
    containedByBranches: ["claude/jovial-snyder"],
    prState: null,
    dirt: classifyWorkspaceDirt([])
  });

  assert.equal(result.decision, "safe_to_delete");
  assert.match(result.reason, /preserved by local branch/i);
});

test("buildAudit reuses git-derived dirt and ancestry reads across worktree and branch passes", () => {
  const calls = {
    status: 0,
    ancestor: 0
  };

  const audit = buildAudit("/repo", {
    getRepoRoot: () => "/repo",
    getCurrentBranchName: () => "main",
    getPrIndexForRoot: () => new Map(),
    getBranchIndexForRoot: () => new Map([
      ["main", {
        branch: "main",
        head: "abc123",
        upstream: "origin/main",
        upstreamGone: false
      }],
      ["codex/cache", {
        branch: "codex/cache",
        head: "def456",
        upstream: "origin/codex/cache",
        upstreamGone: false
      }]
    ]),
    listWorktrees: () => [
      { worktree: "/repo", branch: "refs/heads/main", HEAD: "abc123" },
      { worktree: "/repo/.worktrees/cache", branch: "refs/heads/codex/cache", HEAD: "def456" }
    ],
    getStatusLinesForPath: (worktreePath) => {
      calls.status += 1;
      return worktreePath === "/repo" ? [] : [" M _site/index.html"];
    },
    isAncestorForHead: () => {
      calls.ancestor += 1;
      return true;
    }
  });

  assert.equal(audit.worktrees.length, 2);
  assert.equal(audit.branches.length, 2);
  assert.equal(calls.status, 2);
  assert.equal(calls.ancestor, 2);
  assert.equal(audit.branches[1].dirt.generatedOnly, true);
});
