# SEO Action Plan

Date: 2026-04-18
Source audit: [2026-04-18-full-seo-audit.md](/Users/sawbeck/.codex/worktrees/seascape-vacations-site-codex-seo-audit-2026-04-18/docs/reports/2026-04-18-full-seo-audit.md)

## Critical

### 1. Run `winner-guide-consolidation` before another owner rewrite

Why:

- 7-day operator read still shows winner-guide variant leakage on the pages carrying the most nonbrand demand.
- That is still muddying the cleanest read on what Google thinks the winners are.

Do:

- use [2026-04-winner-guide-consolidation-round-2.md](/Users/sawbeck/.codex/worktrees/seascape-vacations-site-codex-seo-audit-2026-04-18/docs/briefs/2026-04-winner-guide-consolidation-round-2.md)
- clean any remaining noncanonical guide links in source
- verify redirects, canonicals, breadcrumb/schema URLs, and feeder links all point at the slash winners
- repair the stale owner-hub live-smoke assertion inside this same branch so the release gate is trustworthy again
- record whether the reread baseline is using the 7-day `5768` operator total or the broader `10,591` winner-guide cluster total before judging results
- request recrawl on the in-scope guide winners after deploy

Do not:

- rewrite owner pages in this branch
- broaden owner-page copy just to satisfy the smoke gate
- change stay page value props in this branch
- create any new guides

### 2. Fix the stale owner-hub live-smoke assertion

Why:

- the current smoke check now fails against the real current page copy
- false gates train people to ignore the gate

Do:

- update `scripts/recovery/assert-live-smoke.js` so the owner-hub expectation matches the live/current owner-hub surface
- keep the smoke test focused on real route ownership and critical page truth

Packaging note:

- this rides with the immediate `winner-guide-consolidation` branch, not as a separate strategic batch

## High

### 3. Prepare `owner-ctr-rewrite-round-2`, but fire it from the next valid joined read

Why:

- 28-day owner-money data already shows the real issue:
  - `3,738` impressions
  - `4` clicks
  - `0.11%` CTR
  - avg position `4.68`
- fees and licensing pages are ranking well enough to matter and still getting ignored

Do:

- rewrite titles and meta descriptions for the fees and licensing pages first
- strengthen the first screen with harder proof and clearer owner economics
- add external citations where the page is making benchmark-style claims
- add visible freshness treatment where it actually helps trust

Do not:

- bloat the pages with more generic prose
- widen into a whole owner-cluster rewrite if the next 7-day read still says demand is too thin

### 4. Treat the stay money pages as gated CRO/template prep, not active expansion work

Why:

- `/stays/anna-maria-island-vacation-rentals/` has `36` GA4 sessions and `0` `stay_view_property_clicks`
- `/stays/anna-maria-island-beachfront-rentals/` has `38` GA4 sessions and `10` `stay_view_property_clicks`
- `38/60` stay pages are under `800` words
- the April 18 review package still leaves stay work behind the current `next-batch` gate until the owner/guide read says it is actually the next best move

Do:

- keep this at brief/audit prep only until the joined read clears the branch
- define the first-screen CTA, image-performance, and booking-handoff checks the later stay branch will need
- limit prep to the AMI winners already named in the plan package

Do not:

- launch a stay CRO source branch before the joined read clears it
- create more stay pages
- reopen Holmes Beach
- treat low-impression stay pages as if they are strategic winners

## Medium

### 5. Add metadata QA where it hurts most

Target first:

- `/property-management/vacation-rental-management-fees-florida/`
- `/property-management/vacation-rental-licensing-florida/`
- `/stays/anna-maria-island-vacation-rentals/`
- `/stays/anna-maria-island-beachfront-rentals/`
- `/guides/bradenton-vs-sarasota/`

Rules:

- get important titles back under `65` chars where possible
- keep important meta descriptions inside the real snippet window
- stop spending metadata effort on low-demand pages before money pages are clean

### 6. Roll out the visible author/freshness pattern from the winners to the laggards

Why:

- the good pattern already exists
- it just is not applied consistently enough to act like doctrine

Do:

- use the `Reviewed by Sawyer Beckett` / updated-date pattern from the strongest guide winners
- prioritize pages that already rank or drive real impressions

### 7. Tighten image-output discipline in the templates

Why:

- the problem is not missing alt text
- it is inconsistent width/height/loading plus too much remote/legacy image dependence

Do:

- emit width/height consistently
- add `loading` where images are not LCP candidates
- focus first on the AMI stay winner and any repeated shared components

## What Not To Do Next

- another site-wide SEO audit
- Phase 4 entity work
- new stay-page sprawl
- broad template redesign
- another owner rewrite branch before the guide-family consolidation / reread gate
- active stay CRO implementation before the existing `next-batch` gate clears
