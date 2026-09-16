# CLAUDE.md — Seascape SEO OS (Claude delta)

@AGENTS.md

Read `AGENTS.md` first. It is canonical for this repo: scope ownership,
non-negotiable rules, repo truth, business priorities, the workflow/skill layer
with every `.claude/skills/*/SKILL.md` path, environment, commands, testing,
deploy, the SEO reading order, the content gate, and the design lanes. This file
holds only Claude-specific surfaces plus the two blocks the repo's own gates
require to stay here.

- Skills: Claude loads `.claude/skills/<name>`, a relative link to the
  maintained source in `.agents/skills/<name>`; both resolve to one procedure
  (`AGENTS.md` -> Agent Skills lists the per-skill routing lines).
- The five SEO OS role cards live in `.claude/agents/`; `.claude/settings.json`
  holds this repo's Claude permissions.
- For UI/visual work, dispatch subagents with `model: "sonnet"`.

## Required Batch Workflow

Kept here because `scripts/enforcement/content-voice.test.js` asserts this
section in `CLAUDE.md`; `AGENTS.md` carries the same rule. Full order of
operations: `docs/process/batch-workflow.md`. The visible-copy order is
non-negotiable: **Draft the copy**, then **Remove internal wording**, then
**Check voice and specificity** using the active brief and `docs/style/`.
Complete these steps and `docs/process/content-quality-gate.md` before the
content gate and `npm run lint:content`.

## GBrain Search Guidance (local, optional)
<!-- gstack-gbrain-search-guidance:start -->

**Applies only if GBrain is set up on the machine you're running on.** The pin
and the local corpora below are **machine-local, not committed**. Before
relying on any `gbrain` command, confirm it is wired here:

```
test -f .gbrain-source && gbrain --version >/dev/null 2>&1 \
  && echo "gbrain wired" || echo "gbrain NOT set up here — use Grep/Glob"
```

If that prints "NOT set up," ignore this whole section and use Grep/Glob. Do
not trust worktree pinning that is not present.

When GBrain *is* set up, prefer it over Grep for semantic questions or when you
don't know the exact identifier yet.

**This worktree is pinned to a worktree-scoped code source** via the
`.gbrain-source` file in the repo root (kubectl-style context).
`gbrain code-def`, `code-refs`, `code-callers`, `code-callees`, `search`, and
`query` from anywhere under this worktree route to that source by default —
no `--source` flag needed (gbrain >= 0.41.38.0; on older gbrain the call-graph
commands need `--source "$(cat .gbrain-source)"`). Conductor sibling worktrees
of the same repo each have their own pin and their own indexed pages, so
semantic results match the code on disk here.

Call-graph queries (`code-callers`/`code-callees`) also need the graph to be
built first. If they return `count: 0`, use the approved local GBrain graph
build/sync flow for this machine before trusting the result. This only works if
this source's gbrain schema pack extracts code symbols; on a non-code-aware
pack the graph can stay empty and report a WARN. `code-def`/`code-refs` need
the same extraction.

Two indexed corpora available via the `gbrain` CLI:
- This worktree's code (auto-pinned via `.gbrain-source`).
- `~/.gstack/` curated memory (registered as `gstack-brain-<user>` source via
  the existing federation pipeline).

Prefer gbrain when:
- "Where is X handled?" / semantic intent, no exact string yet:
    `gbrain search "<terms>"` or `gbrain query "<question>"`
- "Where is symbol Y defined?" / symbol-based code questions:
    `gbrain code-def <symbol>` or `gbrain code-refs <symbol>`
- "What calls Y?" / "What does Y depend on?":
    `gbrain code-callers <symbol>` / `gbrain code-callees <symbol>`
- "What did we decide last time?" / past plans, retros, learnings:
    `gbrain search "<terms>" --source gstack-brain-<user>`

Grep is still right for known exact strings, regex, multiline patterns, and
file globs. Refresh the local GBrain source after meaningful code changes only
through the approved local setup/sync flow for this machine. For ongoing
auto-sync across all worktrees, use the repo-approved autopilot setup rather
than starting ad hoc sync/remediation commands.

Safety: don't run local GBrain source sync or graph-build commands while
`gbrain autopilot` is active. Prefer registering user repos with `gbrain
sources add --path <dir>` (no `--url`): URL-managed sources can auto-reclone,
and the sync code walk for them requires an explicit `--allow-reclone` opt-in.

<!-- gstack-gbrain-search-guidance:end -->
