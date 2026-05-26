# Content Quality Gate

This file turns Seascape content quality from a style preference into a shipping rule.

## Copy Layers

- `reader copy`: visible headings, paragraphs, bullets, CTA copy, and table labels that speak to a guest or an owner making a live decision.
- `proof copy`: source notes, proof chips, mini-notes, chart captions, FAQ source notes, schema, and clearly labeled methodology boxes.
- `agent copy`: internal process language for Sawyer, Codex, Claude, or review workflow. It never ships in visible page copy.

## No Brief, No Writing

Any PR that changes public page copy in `src/` must also change exactly one active brief in `docs/briefs/`.

If the page cannot point to one active brief, stop before writing.

## Required Brief Inputs

Every active content brief must include these flat bullets with real values:

- `persona:`
- `primary keyword:`
- `secondary keywords:`
- `audience pattern:`
- `proof source:`
- `required internal links:`
- `CTA target:`
- `anti-claims:`

These fields exist so the page builder, voice editor, and release gate are reading the same contract.

## Reader Copy Rules

- Answer the real decision in the first paragraph.
- Speak to `you/your` on owner pages instead of narrating from a distance.
- Keep proof language below the hook. Dataset limits, scenario labels, and methodology notes belong in proof copy, not the first paragraph.
- Prefer concrete operating moves over adjectives. Name channel mix, price protection, review follow-up, turnover scheduling, and maintenance follow-through.
- Do not ship internal workflow language like `approved inputs`, `accepted formulas`, or review-facing caveats in public body copy.
- Do not call the reader a `switcher` or call the owner review a `teardown` in public copy.

## Default-Fail Review Posture

- Public copy starts in `not ready` status until evidence shows the page answers the decision, uses approved proof, and keeps its link and CTA contract intact.
- Launch review starts in `not ready` status until build, lint, route smoke, and tracking checks are attached.
- Use `docs/process/evidence-first-review.md` when a copy or launch review needs an explicit receipt instead of vibes.

## SEO, GEO, And AEO Checks

- The first paragraph should answer the searcher's question fast enough to stand alone in search, AI answers, or snippets.
- Public pages should carry the internal links named in the active brief, not generic footer-only routing.
- Schema, source notes, and proof assets should support the page instead of replacing the reader-facing answer.
- Each citable stat should be able to stand alone in one sentence without extra internal explanation.
- New pages should make the entity and destination clear: who Seascape is, what page family the route belongs to, and what conversion step comes next.

## Enforced Now

`npm run lint:content` currently blocks:

- banned generic phrasing called out in `docs/style/banned-patterns.md`
- internal-process phrases like `approved benchmark` or `approved inputs` in public copy
- `observed`, `scenario`, or `methodology` in the first visible paragraph
- detached owner voice where `the owner` outnumbers `you/your`
- vague owner claims like `attentive local operations`, `clearer owner communication`, or `quiet misses`
- public content PRs that skip the active brief or omit the brief's required internal links

## Required Read Before A Content PR

Before writing or reviewing content, read:

- the active brief in `docs/briefs/`
- `docs/style/voice.md`
- `docs/style/banned-patterns.md`
- `docs/style/approved-examples.md`
- this file

## Adjacent Review Lanes

- Before SEO rewrites, run `docs/process/seo-cannibalization-checklist.md`.
- For AI-answer and citation work, use `docs/process/ai-citation-audit.md`.
- For owner lead forms and key booking or contact flows, use `docs/process/agent-task-completion-audit.md`.
- For public-copy and launch closeout, use `docs/process/evidence-first-review.md`.
