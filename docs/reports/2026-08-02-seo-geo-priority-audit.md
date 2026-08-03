# SEO/GEO Priority Audit — 2026-08-02

## Verdict

The site-owned technical and answer-readiness gate is clear for the current 13-query priority set:

- `0` critical crawl, canonical, robots, title, description, H1, structured-data, or internal-link failures
- `13/13` priority queries map to a rendered, indexable, answer-ready page
- `163/163` rendered pages pass the internal-link crawl
- `693` JSON-LD blocks across `163` rendered pages validate
- `422` redirect rules validate
- live recovery smoke, entity schema coverage, direct-booking events, and owner-funnel routes pass

The external discovery gate is not clear. The representative owner-fee query is indexed and competitive in traditional search, but source selection varies by answer engine. That is an authority and citation-selection gap, not a confirmed site defect.

## Acceptance boundary

This audit separates three claims:

1. **Source/build readiness:** proved by the production build and local crawl.
2. **Current live behavior:** proved by the live smoke and browser readbacks below.
3. **Ranking, CTR, and AI citation improvement:** not claimed. No source change was deployed, and the current analytics window is too thin to support a rescue edit.

`docs/status/next-batch.md` remains `fresh but below threshold`. The owner-money family has only seven impressions in its current comparison window, below the page-level threshold for a measured rewrite. A live search observation is not a substitute for a ranking-regression receipt.

## Fixed priority-query crawl

| Query | Answer-ready route | Technical result |
| --- | --- | --- |
| vacation rental management fees Florida | `/property-management/vacation-rental-management-fees-florida/` | pass |
| vacation rental license Florida | `/property-management/vacation-rental-licensing-florida/` | pass |
| VRBO management services Florida | `/property-management/vrbo-management-services-florida/` | pass |
| vacation rental management Sarasota | `/property-management/vacation-rental-management-sarasota/` | pass |
| vacation rental management Bradenton | `/property-management/vacation-rental-management-bradenton/` | pass |
| Anna Maria Island property management | `/property-management/vacation-rental-management-anna-maria-island/` | pass |
| maximize vacation rental income Florida | `/property-management/maximize-vacation-rental-income-florida/` | pass |
| Anna Maria Island vacation rentals | `/stays/anna-maria-island-vacation-rentals/` | pass |
| Anna Maria Island beachfront rentals | `/stays/anna-maria-island-beachfront-rentals/` | pass |
| book direct Anna Maria Island rentals | `/stays/book-direct-anna-maria-island/` | pass |
| book direct vacation rentals | `/guides/booking-direct-vacation-rentals/` | pass |
| Bradenton vs Sarasota | `/guides/bradenton-vs-sarasota/` | pass |
| Anna Maria Island vs Siesta Key | `/guides/anna-maria-island-vs-siesta-key/` | pass |

The crawl checks rendered existence, title, description, one H1, exact canonical, robots indexability, structured-data presence, internal-link count, guide/research source links, and an answer-first surface. The same fixed route/query set returned `0` critical findings and `0` high findings on both runs.

## Current search and answer-engine benchmark

Representative prompt/query, run on 2026-08-02 EDT:

> What do vacation rental management fees in Florida typically cost? Cite the best sources.

| Surface | Current readback | Seascape selected? |
| --- | --- | --- |
| Google organic | Seascape appeared as the second organic result in the observed signed-in browser session; Google rewrote the visible title to `Florida Vacation Rental Management Fees` | yes |
| Google AI Overview | cites FunStay Florida, Live the Gulf Coast, SkyRun, Vacasa, Evolve, and others | no |
| Bing answer | cites Seascape for the hidden-cost/net-income explanation | yes |
| Perplexity | cites FunStay Florida, TIDY, and Live the Gulf Coast/30A sources | no |
| Gemini | cites SkyRun, TIDY, LuxeHaus, Lodgify, and others | no |

The comparison query `Anna Maria Island vs Siesta Key` also surfaces Seascape prominently in current web search. The inventory query `Anna Maria Island vacation rentals` is dominated by businesses with materially larger on-island inventory. That is a business/inventory authority gap; source text cannot honestly manufacture inventory breadth.

## Ranked gaps

1. **High impact, off-site authority:** Seascape is not consistently selected by Google AI Overview, Perplexity, or Gemini for the owner-fee answer even though it appeared second organically in the observed Google session and Bing cites it. The next proof must come from a fresh analytics-owned citation/mention receipt and repeated fixed-prompt checks; a title-only edit has no demonstrated causal path.
2. **High impact, business/inventory:** broad Anna Maria Island rental results favor operators with much deeper on-island inventory. This is not a crawl, schema, copy, or internal-link defect.
3. **Medium, evidence freshness:** the content-decay patrol now flags the historical Q1 2026 five-home market report twice because its truthful May 2026 review/dateModified crossed the 90-day threshold. Refreshing the date without new source proof would be false freshness. Hold for a real source-window refresh.
4. **Low, hypothesis only:** several owner and stay titles are long in rendered HTML. Google already rewrites the fee-page title cleanly and ranks it second, so length alone is not a confirmed regression.
5. **Low, planning input:** owner-family pages average fewer inbound links than guides, but all audited priority routes exceed the crawl's internal-routing floor and the canonical internal-link analyzer found no required link fix.

## Fix decision

No public source mutation was justified.

The initially considered fee-page title edit was rejected after adversarial plan review and the full live benchmark. It would change a page that is already indexed, appeared second organically in the observed Google session, and is cited by Bing, without evidence that the title causes the missing citations in other answer engines. The safe highest-leverage action is to preserve the working page and wait for the next fresh analytics-owned citation/mention and query-performance receipt before opening a measured rescue brief.

The generated content-decay patrol was refreshed to 2026-08-02 so the next review has a current, truthfully gated queue. Its two high rows are review prompts, not permission to cosmetically refresh the historical report.

## Verification receipts

- `npm run build:prod` — pass, 169 Eleventy files written
- fixed 13-route crawl — pass twice, 13 answer-ready, 0 critical, 0 high
- `npm run verify:redirects` — pass, 422 rules
- `npm run verify:links` — pass, 163 pages
- `npm run verify:jsonld` — pass, 163 pages and 693 JSON-LD blocks
- `npm run verify:recovery:live` — pass
- `npm run verify:recovery:entity-live` — pass, 20 routes
- `npm run verify:direct-booking-events` — pass
- `npm run verify:owner-funnel-routes` — pass, 8 routes
- DataForSEO benchmark — unavailable because the local MCP has no configured login credential; no API request was made

## Next gate

Do not edit the fee page or historical market report from this receipt alone. Reopen the lane only when a current `seascape-analytics` citation/mention receipt or page-level search window confirms a measurable regression or a repeatable answer-engine miss worth testing. Any eventual change still needs a keeper branch, deployment, post-deploy recrawl, and a later external readback before claiming impact.
