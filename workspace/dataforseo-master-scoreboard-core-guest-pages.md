# DataForSEO Master Scoreboard - Core Guest Pages

This is the single operator surface for the six queue-1 pages.

Use this after or alongside:
- `workspace/dataforseo-run-sheet-first-5-calls.md`
- `workspace/dataforseo-results-capture-sheet-first-5-calls.md`
- `workspace/dataforseo-phase-2-run-sheet-ai-mode-llm-mentions-maps-local-finder.md`
- `workspace/dataforseo-phase-2-results-capture-sheet.md`
- `workspace/ai-readiness-audit-worksheet-core-guest-pages.md`

## How To Use This

1. Run phase 1 and fill the `P1` columns.
2. Run phase 2 and fill the `P2` columns.
3. Use the final columns to make one decision per page:
- `leave alone`
- `tighten angle`
- `rewrite intro/CTA`
- `shift to local/entity work`

Do not make page changes until the `Final decision` column is filled.

## Global Gates

- [ ] `npm run verify:jsonld`
- [ ] `npm run verify:links`
- [ ] `npm run lint:content`
- [ ] `npm run test`

## Master Scoreboard

| Page | Core job | P1 run complete | P1 page angle fits | P1 AI/local pressure high | P1 OTA-heavy | P2 AI Mode supports current angle | P2 LLM Mentions shows Seascape cited | P2 Maps/Local Finder matter a lot | Truthful near-island or city framing still wins | Final decision | Priority | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Brand and direct route into guest browsing | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | `leave alone` / `tighten angle` / `rewrite intro/CTA` / `shift to local/entity work` | `high` / `medium` / `low` | |
| `/properties/` | Narrow broad browsing into the right collection or home | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | `leave alone` / `tighten angle` / `rewrite intro/CTA` / `shift to local/entity work` | `high` / `medium` / `low` | |
| `/stays/book-direct-anna-maria-island/` | Win book-direct intent without OTA fees | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | `leave alone` / `tighten angle` / `rewrite intro/CTA` / `shift to local/entity work` | `high` / `medium` / `low` | |
| `/stays/anna-maria-island-vacation-rentals/` | Match AMI stay intent with honest near-island value | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | `leave alone` / `tighten angle` / `rewrite intro/CTA` / `shift to local/entity work` | `high` / `medium` / `low` | |
| `/stays/bradenton-vacation-rentals-near-beaches/` | Sell Bradenton as the easier beach-access base | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | `leave alone` / `tighten angle` / `rewrite intro/CTA` / `shift to local/entity work` | `high` / `medium` / `low` | |
| `/stays/sarasota-vacation-rentals-with-pool/` | Match Sarasota pool-home intent clearly | [ ] | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | `leave alone` / `tighten angle` / `rewrite intro/CTA` / `shift to local/entity work` | `high` / `medium` / `low` | |

## What Each Column Means

### `P1 page angle fits`
- The first five classic SERP calls say the page is aimed at the right query and job.

### `P1 AI/local pressure high`
- AI Overview, local pack, PAA, or other non-organic features dominate enough that ranking alone is not the whole problem.

### `P1 OTA-heavy`
- OTAs or large directories dominate the result set, which means generic copy expansion is probably not the first fix.

### `P2 AI Mode supports current angle`
- Google AI Mode frames the answer in a way that matches the page's current promise and angle.

### `P2 LLM Mentions shows Seascape cited`
- `seascape-vacations.com` or Seascape appears in AI-search-style source lists for the query.

### `P2 Maps/Local Finder matter a lot`
- Local surfaces are strong enough that GBP/entity/local visibility may matter as much as page copy.

### `Truthful near-island or city framing still wins`
- The evidence keeps rewarding honest geographic framing like `near Anna Maria Island`, `Bradenton`, or `Sarasota` instead of pretending homes are directly on-island or on-beach.

## Final Decision Rules

- Choose `leave alone` when both phase 1 and phase 2 support the current angle and Seascape is reasonably visible.
- Choose `tighten angle` when the page is directionally right but needs sharper promise, clearer tradeoff framing, or stronger fit language.
- Choose `rewrite intro/CTA` when the page's core opportunity is still valid but the opening answer and next step are weak.
- Choose `shift to local/entity work` when Maps, Local Finder, branded visibility, or AI citations are the bigger bottleneck than page copy.

## Priority Rules

- `high`: page has weak fit, weak AI visibility, or weak entity/local visibility and is a core commercial page.
- `medium`: page is mostly right but has one meaningful gap.
- `low`: page is aligned and no immediate content or GEO change is justified.

## Fast Rollup

When all six rows are filled, answer these three questions:

1. Which pages should stay unchanged?
2. Which pages need copy-angle work?
3. Which pages should push effort toward local/entity/AI-citation work instead?

## Final Output Template

Use this once the sheet is filled:

```text
Page:
Decision:
Why:
Evidence:
Next move:
```
