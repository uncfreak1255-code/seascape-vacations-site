# CLAUDE.md — Seascape SEO OS

This file is the thin operating contract for SEO work in this repo.

It is not:
- a monthly task log
- a stale marketing brain dump
- a place to park old deploy assumptions

If a detail ages fast, it belongs in `docs/status/`, `docs/briefs/`, or `docs/portfolio/`, not here.

## What Is True

- This repo owns live website execution for Seascape Vacations.
- Owner acquisition is still the main business bottleneck.
- Direct-book conversion on existing demand is the second bottleneck.
- New page volume is not the default answer when owner CTR and current money-page yield are still weak.
- Phase 4 or other entity-expansion work stays frozen until the measured gates in `docs/status/next-batch.md` are cleared.

## Source Of Truth

- Editable source: `src/`
- Generated output: `_site/`
- Redirect source: `src/_redirects`
- Property truth: `src/_data/properties.js` and `src/_data/properties-fallback.json`
- Owner proof assets: `src/_data/ownerProofAssets.json`
- Execution state: `docs/status/current-state.md`, `docs/status/next-batch.md`, `docs/status/open-risks.md`
- Content gate: `docs/process/content-quality-gate.md`
- Voice and copy rules: `docs/style/voice.md`, `docs/style/approved-examples.md`, `docs/style/banned-patterns.md`
- Batch briefs: `docs/briefs/`
- Page-family routing and canonical ownership: `docs/portfolio/`

## Reread Status Contract

- `docs/status/next-batch.md` is the only canonical operator-read status surface.
- Every reread update must write exactly one `Reread status` and exactly one `Concrete next move`.
- Allowed reread statuses are only:
  - `blocked by freshness`
  - `fresh but below threshold`
  - `open next batch`
- `docs/status/current-state.md` should summarize durable repo truth and point back to `docs/status/next-batch.md`; it should not duplicate volatile reread windows, `data_date` values, or stale blocked-window narration.

## Five Roles, Batch Workflow, Skill Policy

These three operate only while a batch is running, so they live in `docs/` and
load on demand instead of every session:

- Five-role model (who owns what): `docs/process/five-roles.md`
- Required batch workflow (order of operations): `docs/process/batch-workflow.md`
- Local skill layer + external-pack policy: `docs/process/skill-policy.md`
  (the active skill set is self-describing in `.claude/skills/`)

## Hard Rules

- Root `main` is sync-only.
- Non-trivial work belongs in `.worktrees/<task>` on `codex/<task>`.
- Edit source, not `_site/`.
- Do not use `DEPLOY THIS FOLDER TO NETLIFY/` as source truth.
- No public content PR without exactly one active brief and a passing `npm run lint:content`.
- Do not import seomachine code, publishing assumptions, or folder structure directly into this repo.
- Use seomachine only as reference for context rules, brief shape, rewrite workflow, and prioritization concepts.
- One serious SEO batch at a time. If the batch cannot fit in one brief, it is too wide.
- Claims about amenities must trace to property truth. No invented equipment, no fake waterfront spread, no padded sleeping-capacity claims.
- Owner proof claims must trace to approved proof assets or current source truth. Do not reuse old sitewide review-count theater.
- If a workflow doc conflicts with repo safety docs, the stricter repo rule wins.

## Execution Defaults

- Think before coding: state assumptions explicitly, ask when the missing fact matters, push back when a simpler approach exists, and stop to clarify before editing when the path is unclear.
- Simplicity first: make the minimum change that solves the problem. Nothing speculative. No abstractions for single-use code.
- Surgical changes: touch only what you must, match existing style, and do not refactor adjacent code that is not broken unless the task requires it.
- Goal-driven execution: define success criteria early, then loop until the right proof gate verifies the work.

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

## Design System
Always read `DESIGN.md` before touching any CSS, template, or layout file.
Treat `DESIGN.md` as the visual source of truth.
Do not invent new colors, fonts, spacing, border radius, shadows, or component styles without explicit user approval.
For meaningful visual work, Codex should prepare a Claude Design handoff before implementation: repo/source truth, page goal, audience, `DESIGN.md` constraints, existing patterns, proof/copy boundaries, URLs or screenshots, implementation risks, and responsive requirements.
If Claude Design, Stitch, designmd.directory, or another design tool produces a new direction, propose it as a `DESIGN.md` change first.
Use Stitch/designmd.directory only as inspiration, not source truth.
Meaningful visual changes also need the repo flow in `docs/process/design-review-workflow.md`.
Run the global `design-review` skill against the affected routes after implementation and before asking for human review.
The automated visual regression gate already exists: `npm run test:visual` diffs committed desktop and mobile baselines in `tests/visual/__screenshots__/` (with an axe accessibility spec). Run it for visual changes, and still attach desktop and mobile screenshots to the review or PR for subjective changes.
For UI/visual work, dispatch subagents with `model: "sonnet"`.

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

## Deploy Configuration

- Deployable: `yes`
- Deploy surface: `Netlify`
- Production URL: `https://seascape-vacations.com`
- Build command: `npm run build`
- Publish directory: `_site`
- Post-deploy proof: `npm run verify:recovery:live && npm run verify:direct-booking-events && npm run verify:owner-funnel-routes`
- "Shipped" means: merged to `main`, Netlify built successfully, and the relevant live smoke checks passed

## Skill routing

- Batch planning and scope: `plan-ceo-review` plus one active brief in `docs/briefs/`
- Internal-link family routing: `internal-link-targeting`
- Schema, GEO, and AEO implementation: `seascape-seo` plus `schema-markup`
- Owner-page CRO: `page-cro`
- Visual planning and review: `claude-design` before implementation, then `design-review`
- Accessibility: `accessibility`
- Code review and diff check: `review`
- Ship, deploy, and PR flow: `ship`
