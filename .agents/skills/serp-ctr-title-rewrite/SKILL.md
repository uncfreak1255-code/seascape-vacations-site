---
name: serp-ctr-title-rewrite
description: Pull live SERP snippets for target keywords, extract competitor title/snippet patterns, and draft CTR-focused title rewrites tied to page intent. Use when pages rank but CTR is weak, title framing is the likely bottleneck, or competitor snippet patterns need translating into tested title options.
---

# SERP CTR Title Rewrite

Use this skill to prepare title rewrite packs from live SERP patterns.

## Seascape Gate

Before editing production titles or metadata in this repo, check `docs/status/next-batch.md`.

- If `Reread status` is `blocked by freshness`, do not ship title/meta edits.
- In blocked state, return recommendation-only output and wait for gate clearance.

## Workflow

1. Build keyword-to-page pairs from the active brief and latest measurement inputs.
2. Pull live SERP snippets for each keyword.
3. Extract recurring competitor patterns.
4. Draft three title options per page.
5. Score and recommend one primary plus one fallback.

## Pattern Rules

- Prefer concrete specificity (location, scope, year, count) over generic superlatives.
- Keep claim language supportable by on-page evidence.
- Do not copy competitor strings verbatim.
- Keep intent-match first; CTR lift without intent-match is invalid.

## Output Contract

For each target page, return:

1. Current title.
2. Competitor patterns observed.
3. Three rewrite options.
4. Recommended option with rationale.
5. Gate state (`blocked by freshness`, `fresh but below threshold`, or `open next batch`) and whether edits are allowed now.

## Reference

- Scoring rubric: `references/title-pattern-checklist.md`
