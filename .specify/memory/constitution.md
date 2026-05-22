# Seascape Vacations Site Spec Constitution

## Core Principles

### I. Source Truth Over Rendered Output
All implementation work must modify editable source files only. In this repo,
that means `src/`, data/config, and supporting docs. Never hand-edit `_site/`
or `DEPLOY THIS FOLDER TO NETLIFY/`. Public claims about amenities, owner
results, or proof must trace to current source truth, approved proof assets, or
the active brief.

### II. Worktree-Only Change Isolation
Non-trivial work must happen on `codex/<task>` branches in
`.worktrees/<task>`. Root `main` is sync-only. Spec artifacts must be created in
the active task worktree and kept scoped to one real unit of work. If the next
push target is unclear, stop and fix workflow before writing or implementing a
spec.

### III. Brief-Bound Public Content
Any spec that changes visible copy in `src/` must name exactly one active brief
in `docs/briefs/` and inherit its `persona`, keyword targets, proof source,
required internal links, CTA target, and anti-claims. No public-copy plan is
valid unless it also reads `docs/process/content-quality-gate.md`,
`docs/style/voice.md`, `docs/style/banned-patterns.md`, and
`docs/style/approved-examples.md`.

### IV. Repo Boundaries And Batch Discipline
This repo owns website execution, not Seascape-wide memory, analytics pipeline
logic, or runtime mutations. Specs must keep work inside the site boundary and
optimize for the repo's current priorities: owner lead quality first, direct
book conversion second, canonical integrity third. One serious batch at a time;
if a change needs multiple unrelated briefs or crosses into analytics, hub, or
ops ownership, split it.

### V. Verification Before Release
Every implementation plan must name the exact verification path before code
changes begin. The default release gate is `npm run verify:release`, with
`npm test`, `npm run build`, and `npm run lint:content` required when relevant.
Add route-specific smoke checks, schema checks, redirect checks, property truth
checks, or visual review when the change touches those surfaces. Unverified
specs do not advance to implementation.

## Additional Constraints

- Use Spec Kit for substantial, ambiguous, or multi-file work where a written
  contract will reduce drift. Skip it for tiny fixes, one-line copy cleanups,
  or obvious source-truth repairs.
- Visual or layout specs must read `DESIGN.md` and
  `docs/process/design-review-workflow.md` before planning implementation.
- Specs must cite the exact source files, routes, docs, and verification
  commands they depend on; generic "update site" language is invalid.
- Generated output, local build artifacts, and bulky dev directories stay out of
  commits and out of spec acceptance criteria.

## Spec Workflow

1. Read repo entry docs first: `AGENTS.md`, `CLAUDE.md`,
   `docs/process/agent-safety-standard.md`, `docs/process/git-session-rules.md`,
   and `docs/status/current-state.md`.
2. For content work, bind the spec to one active brief before writing
   requirements.
3. For design work, bind the spec to `DESIGN.md` and the rendered QA loop.
4. Keep the plan small enough to land as one reviewable branch with one clear
   verification story.
5. Before implementation, confirm the spec does not weaken any stricter repo
   rule already enforced by docs, hooks, or release checks.

## Governance

This constitution governs how Spec Kit is used in this repo. It supplements the
existing repo workflow and may not relax or override stricter rules in
`AGENTS.md`, `CLAUDE.md`, repo process docs, or `DESIGN.md`. When conflicts
appear, the stricter repo rule wins. Amendments require a documented reason,
updated repo references when needed, and adoption on a clean worktree branch.

**Version**: 1.0.0 | **Ratified**: 2026-05-22 | **Last Amended**: 2026-05-22
