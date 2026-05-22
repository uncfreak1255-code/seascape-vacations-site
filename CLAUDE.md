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
| Page Builder | writes source | Implement the chosen batch in `src/`, redirects, schema, and supporting docs. This is Codex. |
| Voice Editor | read-only | Critique copy for tone drift, fake specificity, mechanical structure, and claim risk. This is where Claude is useful. |
| Release Gate | read-only | Verify build, schema, redirects, metadata, tests, and diff sanity before any push, PR, or merge. |

That is enough. Extra agent personas are overhead unless they own a real surface the five roles do not.

## Local Skills

The active local skill layer is intentionally lean and site-specific:

- `accessibility`
- `claude-design`
- `design-review`
- `next-batch-gate`
- `owner-proof-integrity`
- `page-cro`
- `property-truth-regeneration`
- `schema-markup`
- `site-architecture`
- `web-design-guidelines`

Use those as helpers under the five-role workflow, not as another operating system. Stale deploy, monthly-reset, broad marketing, and generic SEO skills stay out of active discovery unless a new `agent-surface-audit` proves they should return.

Global marketing skills in `/Users/sawbeck/.codex/skills/` are allowed as
advisory lenses when the task calls for them, especially `customer-research`,
`marketing-psychology`, `content-strategy`, `copywriting`, `copy-editing`,
`seo-audit`, `ai-seo`, `analytics-tracking`, `ab-test-setup`, and
`pricing-strategy`. They help structure thinking; they do not create new local
authority, bypass the five roles, or replace Seascape Hub as the source of
business context.

## Required Batch Workflow

1. Search Operator reads the latest operator evidence.
2. One cluster gets chosen.
3. One brief gets written or updated in `docs/briefs/`.
4. Work starts on `codex/<batch>` in `.worktrees/<batch>`.
5. Page Builder reads the active brief, `docs/process/content-quality-gate.md`, `docs/style/voice.md`, `docs/style/banned-patterns.md`, and `docs/style/approved-examples.md` before source edits.
6. Page Builder edits source and only the docs needed to support that batch.
7. Voice Editor critiques the changed copy against the same brief and content gate.
8. Release Gate runs `npm run lint:content` plus the rest of verification.
9. Deploy.
10. Reread after the crawl window instead of inventing a new batch too early.

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
If Claude Design, Stitch, designmd.directory, or another design tool produces a new direction, propose it as a `DESIGN.md` change first.
Use Stitch/designmd.directory only as inspiration, not source truth.
Meaningful visual changes also need the repo flow in `docs/process/design-review-workflow.md`.
Run the repo-local `design-review` skill against the affected routes after implementation and before asking for human review.
Subjective visual changes need desktop and mobile screenshots until an automated visual regression gate exists.
For UI/visual work, dispatch subagents with `model: "sonnet"`.
