# Content Quality Gate

This file turns Seascape content quality from a style preference into a shipping rule.

## Copy Layers

- `reader copy`: visible headings, paragraphs, bullets, CTA copy, and table labels that speak to a guest or switching owner.
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

## Visible Copy Lane

Any PR that changes `reader copy` in `src/` must run this order before review or merge:

1. `copywriting` for the argument, decision, and CTA draft
2. `enterprise-ui-writing` to strip repo notes, internal labels, and process-heavy wording out of visible copy
3. `humanizer` for the final anti-slop pass on rhythm, fake specificity, and obvious AI texture

If the copy still sounds like a review template or repo note after step 3, rewrite it before you ask lint or a human to bless it.

## Reader Copy Rules

- Answer the real decision in the first paragraph.
- Speak to `you/your` on owner pages instead of narrating from a distance.
- Keep proof language below the hook. Dataset limits, scenario labels, and methodology notes belong in proof copy, not the first paragraph.
- Prefer concrete operating moves over adjectives. Name channel mix, price protection, review follow-up, turnover scheduling, and maintenance follow-through.
- Do not ship internal workflow language like `approved inputs`, `accepted formulas`, or review-facing caveats in public body copy.
- Do not ship classification labels like `proven cost`, `likely cost`, or `missing information` in public body copy.

## SEO, GEO, And AEO Checks

- The first paragraph should answer the searcher's question fast enough to stand alone in search, AI answers, or snippets.
- Public pages should carry the internal links named in the active brief, not generic footer-only routing.
- Schema, source notes, and proof assets should support the page instead of replacing the reader-facing answer.
- Each citable stat should be able to stand alone in one sentence without extra internal explanation.
- New pages should make the entity and destination clear: who Seascape is, what page family the route belongs to, and what conversion step comes next.

## Enforced Now

`npm run lint:content` currently blocks:

- banned generic phrasing called out in `docs/style/banned-patterns.md`
- donor-mined AI rhythm patterns like `here's the thing`, `this matters because`, `at the end of the day`, and mechanical `not just X but also Y` contrasts
- internal-process phrases like `approved benchmark` or `approved inputs` in public copy
- gray internal phrases like `planning math`, `marketplace-fee exposure`, `source-bounded`, `accepted formulas`, `proof boundaries`, `proven cost`, `likely cost`, or `missing information` in public copy
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
