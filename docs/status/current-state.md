# Current State

*Updated: 2026-04-02*

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
- the Phase 3 AMI pages are live and indexed, but they still need the April 3-7 GSC reread to confirm fresh crawl pickup and impression/click movement after the March 31 deploy
- homepage performance cleanup is live: the hero animation and asset cleanup shipped, production Lighthouse materially improved, and homepage crawl state now reflects the faster build rather than the old LCP path
- a fresh external audit on April 3 surfaced a real gap the roadmap had underweighted: shared trust and truth drift across homepage, about page, property pages, reused guide schema, and stay FAQs
- the live site still shows contradictory review counts (`500+`, `650+`, `420+`) and stale price-range schema (`$400-$800/night`) across shared surfaces
- the AMI vacation rentals stay page still ships equipment claims that conflict with the verified property truth in `CLAUDE.md`
- the root repo still contains a stale hand-maintained `sitemap.xml`, but the live sitemap being served is the Eleventy-generated one

## What This Repo Should Optimize For

1. owner lead quality and conversion
2. direct-book conversion on existing search traffic
3. keeping canonical convergence intact through enforcement instead of letting old aliases leak back in
4. stronger money-page proof before more content sprawl
5. shared truth consistency across schema, trust signals, and reused page data
