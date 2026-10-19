# CLAUDE.md — Seascape SEO OS (Claude delta)

@AGENTS.md

Read `AGENTS.md` first. It is canonical for this repo: scope ownership,
non-negotiable rules, repo truth, business priorities, the workflow/skill layer
with every `.claude/skills/*/SKILL.md` path, environment, commands, testing,
deploy, the SEO reading order, the content gate, and the design lanes. This file
holds Claude-specific guidance and a pointer to the shared content workflow.

Use its "Load context for the task" routes after checking source currency.
Load the matching branches before their actions; the Claude delta does not
require reading unrelated SEO, design or measurement documents at startup.

- Skills: Claude loads `.claude/skills/<name>`, a relative link to the
  maintained source in `.agents/skills/<name>`; both resolve to one procedure
  (`AGENTS.md` -> Agent Skills lists the per-skill routing lines).
- SEO role cards live in `.claude/agents/`. Select the task route in
  `docs/process/batch-workflow.md`; source-backed existing-guide repairs use
  one lead plus one targeted reviewer. `.claude/settings.json` holds this
  repo's Claude permissions.
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
  - Claude: the `gbrain` MCP tool `recall` with `entity: projects/<name>` or
    `grep: "<text>"`.
  - Codex or shell: `GBRAIN_SOURCE=session-briefs gbrain recall "<topic>" --json`
    or `gbrain recall <entity-slug> --source session-briefs --json`.
  Save a durable decision the same way (`remember`, with date and provenance).
- **This repo's code and docs** (the source pinned by `.gbrain-source`).
  `gbrain search "<terms>"` or `gbrain query "<question>"` for semantic
  questions with no exact identifier; `gbrain code-def`, `code-refs`,
  `code-callers` for symbols. Grep is still right for exact strings and globs.

Zero results are not proof of absence: an unsynced source or unbuilt graph
returns nothing. Do not run `gbrain sync` or graph builds from a task session;
the machine's approved sync lane owns that.

<!-- gstack-gbrain-search-guidance:end -->
