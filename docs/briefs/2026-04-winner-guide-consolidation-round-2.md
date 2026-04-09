# Brief: winner-guide consolidation round 2

## Why This Batch

- the live weekly operator report chose `winner-guide-consolidation` after the money-page thresholds failed to clear
- the comparison-guide cluster is still the strongest nonbrand organic asset, but multiple guide families still leak demand across slash, `.html`, and retired comparison aliases
- owner rewrite, stay-money CRO, Holmes Beach, and Phase 4 stay frozen until `/seo-os` clears those branches later

## Search Operator Read

- source reads used:
  - `./scripts/weekly-search-operator-report.sh`
  - Search Console MCP inspection for the five tracked money pages
  - `docs/status/current-state.md`
  - `docs/portfolio/winner-guides.md`
- main evidence:
  - guide winners produced `5768` GSC impressions in the last 7 complete days
  - `/guides/bradenton-vs-sarasota/` showed `3633` impressions with `2` URL variants
  - `/guides/anna-maria-island-vs-siesta-key/` showed `1566` impressions with `2` URL variants
  - `/guides/siesta-key-vs-anna-maria-island-families/` showed `471` impressions with `2` URL variants
  - `/guides/best-time-visit-anna-maria-island/` showed `98` impressions with `3` URL variants

## Cluster In Scope

- canonical winners:
  - `/guides/bradenton-vs-sarasota/`
  - `/guides/anna-maria-island-vs-siesta-key/`
- supporting guide-family cleanup:
  - `/guides/siesta-key-vs-anna-maria-island-families/`
  - `/guides/best-time-visit-anna-maria-island/`
- feeder pages:
  - `/guides/bradenton-vs-sarasota-beaches/`
  - `/guides/bradenton-vs-sarasota-cost-of-living/`
  - `/guides/bradenton-vs-sarasota-for-families/`
  - `/guides/bradenton-vs-sarasota-restaurants/`
  - `/guides/bradenton-vs-sarasota-retirement/`
- aliases / retired routes:
  - `/guides/bradenton-vs-sarasota`
  - `/guides/bradenton-vs-sarasota.html`
  - `/guides/bradenton-vs-sarasota-vacation-rental-comparison`
  - `/guides/bradenton-vs-sarasota-vacation-rental-comparison/`
  - `/guides/anna-maria-island-vs-siesta-key`
  - `/guides/anna-maria-island-vs-siesta-key.html`
  - any live internal link still pointing at those aliases instead of the slash canonical
- money destinations:
  - `/stays/bradenton-vacation-rentals-near-beaches/`
  - `/stays/siesta-key-area-vacation-rentals/`
  - `/stays/anna-maria-island-vacation-rentals/`
  - `/stays/anna-maria-island-beachfront-rentals/`

## Source And Proof Constraints

- do not create new guide pages in this batch
- do not rewrite the whole guide templates just because a few families still leak authority
- do not change owner-page copy or stay-page value props in this branch
- do not invent new aliases; remove or reroute the ones that already exist
- keep guide-to-stay handoff language tied to real money destinations already defined in `docs/portfolio/winner-guides.md`

## Page Builder Tasks

- audit and clean internal links still reinforcing noncanonical guide variants
- tighten redirects in `src/_redirects` where guide-family aliases still hop or drift
- verify canonical tags, breadcrumb/schema URLs, and guide-hub links on the in-scope guide families
- add or tighten enforcement coverage where the current tests do not block this leakage from returning
- only touch source files needed for winner-guide routing, linking, or instrumentation sanity

## Voice Editor Checklist

- no fresh marketing fluff in the name of “optimization”
- no generic “explore the area” CTA language when the page should route to a specific stay winner
- no fake precision about rankings, traffic, or citations unless it comes from the operator read
- keep comparison pages sounding like local decision guides, not AI listicles

## Release Gate Checklist

- smoke-test:
  - `/guides/bradenton-vs-sarasota/`
  - `/guides/anna-maria-island-vs-siesta-key/`
  - `/guides/siesta-key-vs-anna-maria-island-families/`
  - `/guides/best-time-visit-anna-maria-island/`
- run:
  - `npm test`
  - `npm run build`
  - `npm run verify:release`
  - `npm run git:merge-check`
- confirm:
  - aliases 301 directly to canonicals
  - no live source files emit retired guide-family aliases
  - tracked guide CTA events still exist

## Done When

- the in-scope winner-guide families route all known aliases directly to one canonical slash URL
- live source no longer links to the alias URLs owned by this batch
- schema, breadcrumb, and visible guide links all agree on the canonical route
- enforcement tests would catch the leakage if it reappears

## Post-Reread Outcome

- reread window used: 7 complete days after recrawl
- crawl freshness result: <fill after deploy>
- actual guide-winner impressions, CTR, variant counts, and `guide_book_direct_click` counts: <fill after reread>
- decision taken: hold, expand feeder cleanup, or reopen guide-family rewrite
- next branch slug or explicit wait state: <fill after reread>

## Not In Scope

- owner money-page rewrites
- stay money-page CRO
- Holmes Beach expansion
- Phase 4 entity work
- net-new guides
- broad template redesign
