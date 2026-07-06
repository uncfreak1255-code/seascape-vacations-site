# CLAUDE.md — Seascape SEO OS (Claude delta)

Read `AGENTS.md` first. It is canonical for this repo: scope ownership, the
non-negotiable rules, repo truth, the business bottleneck, the workflow/skill
layer, the content gate, the design-review workflow, and the reading order.
This file only carries the Claude-operational specifics that are not already
in `AGENTS.md`.

## Environment

- Node: `24.14.0` (`.nvmrc`)
- `npm run build` runs `scripts/enforcement/build-site.js`, a custom
  enforcement wrapper (worktree lock, Hostaway build-cache sync, Eleventy,
  property-availability output validation) — NOT raw Eleventy.

## Commands

- Dev: `npm run start`
- Build: `npm run build`
- Full tests: `npm test`
- Content gate: `npm run lint:content`
- Release verify: `npm run verify:release`
- Visual regression: `npm run test:visual`
- Visual proof capture: `npm run proof:visual`
- Safe commit: `npm run git:safe-commit`
- Merge check: `npm run git:merge-check`

## Testing

- Fast gate for copy-only work: `npm run lint:content`
- Fast gate for structural source work: `npm run build`
- Full pre-PR gate: `npm run lint:content && npm test && npm run verify:release`
- Visual changes also require: `npm run test:visual` and fresh desktop/mobile screenshot proof
- Live post-merge smoke when the release surface matters: `npm run verify:recovery:live && npm run verify:direct-booking-events && npm run verify:owner-funnel-routes`
- The same smoke trio also runs daily via `.github/workflows/live-smoke.yml` (dispatchable manually); a red scheduled run means production drift or stale smoke assertions, not necessarily an outage

## Deploy Configuration

- Deployable: `yes`
- Deploy surface: `Netlify`
- Production URL: `https://seascape-vacations.com`
- Build command: `npm run build`
- Publish directory: `_site`
- Post-deploy proof: `npm run verify:recovery:live && npm run verify:direct-booking-events && npm run verify:owner-funnel-routes`
- "Shipped" means: merged to `main`, Netlify built successfully, and the relevant live smoke checks passed

## Reading Order For SEO Work

1. `docs/status/current-state.md`
2. the active brief in `docs/briefs/`
3. `docs/process/content-quality-gate.md`
4. the relevant page-family file in `docs/portfolio/`
5. `docs/style/voice.md`
6. `docs/style/banned-patterns.md`
7. `docs/style/approved-examples.md`
8. the source file you are about to touch

If any of those are stale, fix the doc layer before you scale the batch.

## Required Batch Workflow

Full order of operations: `docs/process/batch-workflow.md`. The visible-copy
voice order is non-negotiable: draft and rewrite reader copy with `copywriting`,
then run `enterprise-ui-writing` and `humanizer` on changed copy before the
content gate and `npm run lint:content`.

## Design Specifics

See `AGENTS.md` ("Design System", "Design Review Workflow") for the design law.
Two Claude-operational specifics that are easy to miss:

- The visual regression gate diffs committed desktop and mobile baselines in
  `tests/visual/__screenshots__/` (with an axe accessibility spec). Run
  `npm run test:visual` for visual changes, and still attach desktop and mobile
  screenshots for subjective changes.
- For UI/visual work, dispatch subagents with `model: "sonnet"`.

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
