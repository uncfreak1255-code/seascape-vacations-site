---
name: serp-ctr-title-rewrite
description: Use when preparing title rewrites from live SERP patterns to improve CTR while preserving page intent.
---

# SERP CTR Title Rewrite

Use this skill to prepare title rewrite packs from live SERP patterns.

## Seascape Gate

Before editing production titles or metadata in this repo, check `docs/status/next-batch.md`.

- If `Reread status` is `blocked by freshness`, do not ship title/meta edits.
- In blocked state, return recommendation-only output and wait for gate clearance.

Build keyword-to-page pairs from the active brief and latest measurement inputs.
Use live SERP snippets to identify competitor patterns, then use
[the scoring rubric](references/title-pattern-checklist.md) to recommend a
primary title and fallback from three options per page.

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
