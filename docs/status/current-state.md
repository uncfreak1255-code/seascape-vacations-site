# Current State

*Updated: 2026-05-06*

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
- latest joined operator read on 2026-05-06 kept the next branch at `hold-and-reread`; the requested 2026-04-29 to 2026-05-05 window was blocked because BigQuery GSC data was current only through 2026-05-03
- the latest GSC-covered 7-day fallback window, 2026-04-27 to 2026-05-03, was readable but still below action thresholds: owner-money had 342 impressions, stay-money had 2 impressions, and guide-variant demand did not clear the 5000-impression consolidation trigger
- the weekly operator report in `seascape-analytics` is the read that should decide the next batch, not another site-wide audit
- the repo now has a lean SEO OS: five roles only, one brief per serious batch, and dedicated style and portfolio docs instead of stale root markdown acting like live truth

## What This Repo Should Optimize For

1. owner lead quality and conversion
2. direct-book conversion on existing search traffic
3. canonical and page-family integrity through enforcement
4. proof and truth consistency across copy, schema, and supporting docs
5. measured batching instead of content sprawl
