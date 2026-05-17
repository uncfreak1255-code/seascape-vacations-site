# Current State

*Updated: 2026-05-17*

## Source of Truth

- `/Users/sawbeck/Projects/seascape-vacations-site` is the canonical sync-only `main` checkout
- `_site/` is generated output
- `DEPLOY THIS FOLDER TO NETLIFY/` is archival only
- the operating system for SEO work now lives across `docs/status/`, `docs/briefs/`, `docs/style/`, and `docs/portfolio/`

## What Is True Right Now

- the site serves two real audiences: guests and property owners
- owner acquisition remains the business bottleneck
- direct-book conversion on existing search demand remains the second bottleneck
- the comparison-guide cluster is still the strongest nonbrand organic asset, especially `/guides/bradenton-vs-sarasota/` and `/guides/anna-maria-island-vs-siesta-key/`
- the truth-normalization pass is live on `main`; false shared trust claims and stale homepage schema drift were removed before more expansion work
- the winner-guide consolidation pass is live on `main` as merge `edf6e791`; guide-family aliases now have explicit redirect ownership and stronger enforcement coverage
- Phase 2 owner proof pages are live and indexed, but owner CTR is still weaker than rankings suggest
- Phase 3 stay money pages are live and self-canonical, but click yield is still not strong enough to justify fresh stay sprawl
- `docs/status/next-batch.md` is the canonical operator-read status surface; it must carry exactly one reread status and one concrete next move after every reread
- no measured owner, stay, or guide expansion branch has cleared the repo's branch-opening thresholds yet; use `docs/status/next-batch.md` for the latest reread status, evidence, thresholds, and next move
- the weekly operator report in `seascape-analytics` is the read that should decide the next batch, not another site-wide audit
- the repo now has a lean SEO OS: five roles only, one brief per serious batch, and dedicated style and portfolio docs instead of stale root markdown acting like live truth
- the deployed owner metrics endpoint can now be turned into a bounded hub receipt with `node scripts/enforcement/emit-hub-verification-receipt.js owner-lead-metrics`; that receipt still proves measurement surface truth, not booked teardowns or validated owner demand by itself
- source-truth drift surfaced on 2026-05-11 SEO audit: amenity and BR/BA claims diverged across `src/_data/properties-fallback.json`, the per-property templates, and `src/llms.txt` — reconciliation belongs on its own short worktree before any new owner or stay batch opens

## What This Repo Should Optimize For

1. owner lead quality and conversion
2. direct-book conversion on existing search traffic
3. canonical and page-family integrity through enforcement
4. proof and truth consistency across copy, schema, and supporting docs
5. measured batching instead of content sprawl
