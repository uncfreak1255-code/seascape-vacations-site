# Current State

*Updated: 2026-03-30*

## Source of Truth

- `/Users/sawbeck/Projects/seascape-vacations-site` is the canonical sync-only `main` checkout
- `_site/` is generated output
- `DEPLOY THIS FOLDER TO NETLIFY/` is archival only

## What Is True Right Now

- the site serves two audiences: guests and property owners
- owner acquisition remains the business bottleneck
- the comparison-guide cluster is the strongest nonbrand organic asset, especially `bradenton-vs-sarasota` and `anna-maria-island-vs-siesta-key`
- Phase 1 canonical cleanup is now source-owned locally: priority legacy `.html` and owner alias routes are redirected, stale source references are removed, and metadata integrity is enforced in the release gate
- Phase 2 owner proof/CTR work is now source-owned locally: the shared owner benchmark asset exists, fee/licensing/VRBO pages cite it, the market-report guide routes into those money pages, and local browser QA plus `verify:release` passed
- owner pages are indexed and ranking, but CTR is far weaker than rankings suggest
- several high-intent stay pages still look like thin category templates instead of real money pages
- the homepage is now the slowest important page because of analytics weight and unsized media
- the Phase 2 changes are not live yet, so crawler acceptance and snippet/canonical response still need a post-deploy GSC read

## What This Repo Should Optimize For

1. owner lead quality and conversion
2. direct-book conversion on existing search traffic
3. keeping canonical convergence intact through enforcement instead of letting old aliases leak back in
4. stronger money-page proof before more content sprawl
