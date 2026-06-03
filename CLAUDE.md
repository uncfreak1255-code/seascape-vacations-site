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

## Five Roles

| Role | Write Access | Job |
| --- | --- | --- |
| Search Operator | read-only | Pull GSC, GA4, BigQuery, and weekly operator evidence. Recommend one cluster, not ten. |
| SEO Architect | read-only | Define page roles, canonical families, feeder routing, internal-link direction, and winner/destination logic. |
| Page Builder | writes source | Implement the chosen batch in `src/`, redirects, schema, and supporting docs. This is Codex. Draft from the brief and approved examples, not from role-card or session phrasing. |
| Voice Editor | read-only | Critique copy for tone drift, internal/process wording, instruction-template copy, fake specificity, and AI texture. Run `enterprise-ui-writing` then `humanizer` on visible reader copy. |
| Release Gate | read-only | Verify `npm run lint:content`, build, schema, redirects, metadata, tests, and diff sanity before any push, PR, or merge. |

That is enough. Extra agent personas are overhead unless they own a real surface the five roles do not.

## Local Skills

The active local skill layer is intentionally lean and site-specific:

- `accessibility`
- `design-review`
- `internal-link-targeting`
- `next-batch-gate`
- `owner-proof-integrity`
- `page-cro`
- `property-truth-regeneration`
- `schema-markup`
- `serp-ctr-title-rewrite`
- `site-architecture`
- `web-design-guidelines`

Use those as helpers under the five-role workflow, not as another operating system. Stale deploy, monthly-reset, broad marketing, and generic SEO skills stay out of active discovery unless a new `agent-surface-audit` proves they should return.

For AI discovery, GEO/AEO, and schema work, pair the global `seascape-seo`
skill with the repo-local `schema-markup` skill. `seascape-seo` owns the
proof-lane versus attack-lane framing; `schema-markup` owns JSON-LD and
structured-data implementation rules inside this site repo.

External SEO/GEO packs are donor references only. Do not install or mirror
`geo-optimizer-skill`, `gtm-engineer-skills`, `searchstack-aeo`, `claude-seo`,
`akii-seo-ai-search-optimizer`, or `aeo.js` into this repo unless a fresh
`agent-surface-audit` shows a repeated site-specific need and the tool has a
smoke-tested win. AI citation monitoring and GSC/GA4 proof systems belong in
`seascape-analytics`, not in this website repo.

Global marketing skills in `/Users/sawbeck/.codex/skills/` are allowed as
advisory lenses when the task calls for them, especially `customer-research`,
`marketing-psychology`, `content-strategy`, `copywriting`,
`enterprise-ui-writing`, `copy-editing`, `humanizer`, `seo-audit`, `ai-seo`,
`analytics-tracking`, `ab-test-setup`, and `pricing-strategy`. They help
structure thinking; they do not create new local authority, bypass the five
roles, or replace Seascape Hub as the source of business context.

## Required Batch Workflow

1. Search Operator reads the latest operator evidence.
2. One cluster gets chosen.
3. One brief gets written or updated in `docs/briefs/`.
4. Work starts on `codex/<batch>` in `.worktrees/<batch>`.
5. Page Builder reads the active brief, `docs/process/content-quality-gate.md`, `docs/style/voice.md`, `docs/style/banned-patterns.md`, and `docs/style/approved-examples.md`, then uses `copywriting` when drafting or rewriting reader copy.
6. Page Builder edits source and only the docs needed to support that batch.
7. Page Builder rewrites any sentence that still sounds like a role card, session note, or helper instruction before it lands in source.
8. Voice Editor runs `enterprise-ui-writing` and then `humanizer` on changed reader copy before critiquing it against the same brief and content gate.
9. Release Gate runs `npm run lint:content` and requires a visible-copy voice pass before the rest of verification.
10. Deploy.
11. Reread after the crawl window instead of inventing a new batch too early.

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

- Think before coding: state assumptions explicitly, ask instead of guessing, push back when a simpler approach exists, and stop when confused.
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
