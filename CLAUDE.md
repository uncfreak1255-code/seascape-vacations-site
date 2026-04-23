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
- Voice and copy rules: `docs/style/voice.md`, `docs/style/approved-examples.md`, `docs/style/banned-patterns.md`
- Batch briefs: `docs/briefs/`
- Page-family routing and canonical ownership: `docs/portfolio/`

## Five Roles

| Role | Write Access | Job |
| --- | --- | --- |
| Search Operator | read-only | Pull GSC, GA4, BigQuery, and weekly operator evidence. Recommend one cluster, not ten. |
| SEO Architect | read-only | Define page roles, canonical families, feeder routing, internal-link direction, and winner/destination logic. |
| Page Builder | writes source | Implement the chosen batch in `src/`, redirects, schema, and supporting docs. This is Codex. |
| Voice Editor | read-only | Critique copy for tone drift, fake specificity, mechanical structure, and claim risk. This is where Claude is useful. |
| Release Gate | read-only | Verify build, schema, redirects, metadata, tests, and diff sanity before any push, PR, or merge. |

That is enough. Extra agent personas are overhead unless they own a real surface the five roles do not.

## Required Batch Workflow

1. Search Operator reads the latest operator evidence.
2. One cluster gets chosen.
3. One brief gets written or updated in `docs/briefs/`.
4. Work starts on `codex/<batch>` in `.worktrees/<batch>`.
5. Page Builder edits source and only the docs needed to support that batch.
6. Voice Editor critiques the changed copy.
7. Release Gate runs verification.
8. Deploy.
9. Reread after the crawl window instead of inventing a new batch too early.

## Hard Rules

- Root `main` is sync-only.
- Non-trivial work belongs in `.worktrees/<task>` on `codex/<task>`.
- Edit source, not `_site/`.
- Do not use `DEPLOY THIS FOLDER TO NETLIFY/` as source truth.
- Do not import seomachine code, publishing assumptions, or folder structure directly into this repo.
- Use seomachine only as reference for context rules, brief shape, rewrite workflow, and prioritization concepts.
- One serious SEO batch at a time. If the batch cannot fit in one brief, it is too wide.
- Claims about amenities must trace to property truth. No invented equipment, no fake waterfront spread, no padded sleeping-capacity claims.
- Owner proof claims must trace to approved proof assets or current source truth. Do not reuse old sitewide review-count theater.
- If a workflow doc conflicts with repo safety docs, the stricter repo rule wins.

## Reading Order For SEO Work

1. `docs/status/current-state.md`
2. the active brief in `docs/briefs/`
3. the relevant page-family file in `docs/portfolio/`
4. `docs/style/voice.md`
5. `docs/style/banned-patterns.md`
6. the source file you are about to touch

If any of those are stale, fix the doc layer before you scale the batch.

## Design System
Always read `DESIGN.md` before touching any CSS, template, or layout file.
Treat `DESIGN.md` as the visual source of truth.
Do not invent new colors, fonts, spacing, border radius, shadows, or component styles without explicit user approval.
If Claude Design, Stitch, designmd.directory, or another design tool produces a new direction, propose it as a `DESIGN.md` change first.
Use Stitch/designmd.directory only as inspiration, not source truth.
Subjective visual changes need desktop and mobile screenshots until an automated visual regression gate exists.
For UI/visual work, dispatch subagents with `model: "sonnet"`.
