# CLAUDE.md — Seascape SEO OS (Claude delta)

@AGENTS.md

Read `AGENTS.md` first. It is canonical for this repo; use its "Load context
for the task" routes after checking source currency. This file holds only the
Claude harness delta.

- Skills: shared `.claude/skills/<name>` entries link to the maintained
  `.agents/skills/<name>` source. The three Claude-only UI craft skills are
  real directories declared in `.agents/skills-divergence.json`; they remain
  optional under the Site design rules. Respect each skill's invocation policy
  and applicable user skill overrides. A displayed or installed skill is not
  proof that its body loaded or its procedure ran.
- `.claude/settings.json` holds this repo's Claude permissions.
- For UI/visual work, dispatch subagents with `model: "sonnet"`.
- Worktrees: when the harness pins the session to `.claude/worktrees/<name>`,
  that is the isolated worktree `AGENTS.md` asks for. Work there on the
  branch the harness created, run `npm ci` once (a fresh worktree has no
  `node_modules`), and do not create a `.worktrees/<task>` checkout as well.
  The harness rejects edits outside the pinned worktree, so a "permission
  denied" on a root-checkout path is the rule working, not a bug.

## Content Work

Follow the canonical [Required Batch Workflow](AGENTS.md#required-batch-workflow)
and Content Gate in `AGENTS.md` before public-copy work.

## GBrain Search Guidance (local, optional)
<!-- gstack-gbrain-search-guidance:start -->

GBrain is machine-local and optional. The decisions lane below works whenever
the `gbrain` MCP tool or `gbrain` CLI is available; repo code search also needs
a `.gbrain-source` file here. Without them, use Grep/Glob. Two things live in
the brain, reached two ways:

- **Decisions and dated context** (the `session-briefs` facts lane). Before
  answering "what did we decide" or "what do we know about X", or asserting a
  non-trivial detail about a person, project, or past change, read it first:
  - Claude: the `gbrain` MCP tool `recall` with `source_id: "session-briefs"`
    plus `entity: projects/<name>` or `grep: "<text>"`. A repo-scoped
    connection keeps its own facts; if it refuses that source, use the CLI.
  - Codex or shell: `GBRAIN_SOURCE=session-briefs gbrain recall "<topic>" --json`
    or `gbrain recall <entity-slug> --source session-briefs --json`.
  Save a durable decision the same way (`remember` with `source_id:
  "session-briefs"`, date, and provenance).
- **This repo's code and docs** (the source pinned by `.gbrain-source`).
  `gbrain search "<terms>"` or `gbrain query "<question>"` for semantic
  questions with no exact identifier; `gbrain code-def`, `code-refs`,
  `code-callers` for symbols. Grep is still right for exact strings and globs.

Zero results are not proof of absence: an unsynced source or unbuilt graph
returns nothing. Do not run `gbrain sync` or graph builds from a task session;
the machine's approved sync lane owns that.

<!-- gstack-gbrain-search-guidance:end -->
