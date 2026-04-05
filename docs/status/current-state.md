# Current State

*Updated: 2026-04-05*

## Source of Truth

- `/Users/sawbeck/Projects/seascape-vacations-site` is the canonical sync-only `main` checkout
- `_site/` is generated output
- `DEPLOY THIS FOLDER TO NETLIFY/` is archival only

## What Is True Right Now

- the site serves two audiences: guests and property owners
- owner acquisition remains the business bottleneck
- the comparison-guide cluster is the strongest nonbrand organic asset, especially `bradenton-vs-sarasota` and `anna-maria-island-vs-siesta-key`
- Phase 1 canonical cleanup is now source-owned locally: priority legacy `.html` and owner alias routes are redirected, stale source references are removed, and metadata integrity is enforced in the release gate
- Phase 2 owner proof/CTR work is live: the shared owner benchmark asset exists, fee/licensing/VRBO pages cite it, the market-report guide routes into those money pages, and post-deploy GSC showed the URLs indexed without canonical or crawl issues
- owner pages are indexed and ranking, but CTR is far weaker than rankings suggest
- Phase 3 stay money-page work is live: the two AMI priority pages have trip-match modules, tradeoff comparisons, guide-routing blocks, stronger commercial copy, and enforcement coverage; touched guides now route into those money pages instead of weaker seasonal fallbacks
- DataForSEO reinforced the stay priority order instead of changing it: Anna Maria Island demand is strongest, Holmes Beach is next, and Bradenton Beach trails
- the April 4 GSC reread kept Phase 4 premature: all 8 tracked URLs are indexed and self-canonical, but AMI stay pages and owner pages are still not converting visibility into clicks strongly enough to justify entity expansion
- homepage performance cleanup is live: the hero animation and asset cleanup shipped, production Lighthouse materially improved, and homepage crawl state now reflects the faster build rather than the old LCP path
- a fresh external audit on April 3 surfaced a real gap the roadmap had underweighted: shared trust and truth drift across homepage, about page, property pages, reused guide schema, and stay FAQs
- the truth-normalization pass is now complete locally: contradictory homepage/about/property review-count claims are removed from source, stale homepage price-range schema is removed, false AMI equipment claims are replaced with truthful FAQ copy, stale guide destination schema is trimmed, and the stale root `sitemap.xml` artifact is deleted
- the trust-normalization enforcement layer is stronger locally: metadata, stay money-page, AI-discovery schema, technical cleanup, recovery, redirects, links, and JSON-LD checks all pass in `verify:release`
- those trust fixes are not live yet; they exist on the current implementation branch and still need merge/deploy before the production site stops contradicting itself

## What This Repo Should Optimize For

1. owner lead quality and conversion
2. direct-book conversion on existing search traffic
3. keeping canonical convergence intact through enforcement instead of letting old aliases leak back in
4. shared truth consistency across schema, trust signals, and reused page data
5. stronger money-page proof before more content sprawl
