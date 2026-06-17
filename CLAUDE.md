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
