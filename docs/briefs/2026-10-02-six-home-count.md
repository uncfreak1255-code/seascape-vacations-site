# Brief: Current portfolio count is six

## Content Gate Inputs

- persona: guest or owner whose agent quotes a Seascape page as the current inventory
- primary keyword: none (truth correction, not a search play)
- secondary keywords: none
- audience pattern: an assistant repeats the first inventory sentence it finds, including a present-tense home count
- proof source: live catalog at https://seascape-vacations.com/properties/ on 2026-10-02, which says "6 homes" and lists Dockside Dreams, The Oasis, Sarasota Luxe, River House, Bradenton Pool Home, and Pickleball Pool Home Retreat; the same page says all have private pools and only Dockside Dreams is drawn as waterfront with a dock
- offer claim: n/a (guest-lane count correction; owner pages already say six)
- required internal links: /properties/, /guides/
- CTA target: unchanged
- anti-claims: do not change historical study denominators that correctly say five homes for June 2022 through March 2026; do not say every home is waterfront or has a dock; do not say two homes have docks; do not invent a new rate or a direct-booking savings percent
- hypothesis: a present-tense "manages 5" line is what an agent will repeat, so the measured page has to match the live catalog before any AI visibility check
- primary event: property_booking_page_click
- guardrail event: email_capture_submit
- entry criteria: flights, best-time, and restaurant guides plus two research bios still said the current portfolio is five on origin/main 06a08172
- readback window: after the corrected copy is on the production site, before the Prompt Explorer runs
- decision rule: run the two agent questions only after production no longer says Seascape currently manages five homes; do not treat a branch as the measured page

## Gate 0 Search Block

| Field | Answer |
| --- | --- |
| Target query family | flights to Anna Maria Island; Bradenton vs Sarasota restaurants; Gulf Coast vacation booking trends 2026 |
| Searcher intent | guide/research |
| Current Seascape URL | /guides/flights-to-anna-maria-island/, /guides/bradenton-vs-sarasota-restaurants/, /research/gulf-coast-vacation-booking-trends-2026/, /research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026/ |
| SERP observed date | 2026-10-02 |
| SERP stale after | 2026-10-09 |
| Current proof | docs/status/next-batch.md reread on 2026-10-02 is blocked by freshness (BigQuery GSC data_date 2026-09-29; requested window ends 2026-09-30). Final page-level analytics are not ready for impact claims. This edit uses live catalog and live-page readback. Live https://seascape-vacations.com/properties/ on 2026-10-02 says 6 homes and lists Dockside Dreams, The Oasis, Sarasota Luxe, River House, Bradenton Pool Home, and Pickleball Pool Home Retreat. Live flights guide still says Seascape Vacations manages 5 Gulf Coast rental homes. Live booking-trends author bio still says Sawyer manages 5 vacation rental properties. Study denominators that correctly say five homes for June 2022 through March 2026 stay unchanged. |
| Top visible competitors | Wingtip Ventures closest-airport guide; Visit Anna Maria Island how-to-get page; AMI Locals (300+ / 1400+ home-count claims); SeaBreeze Vacation (over 120 homes); AirDNA and Altez Vacations 2026 market pages. Public search sample on 2026-10-02, not a location-controlled rank report. |
| Competitor angle | Airport logistics on the flights SERP; published inventory counts on local-manager pages; market-wide listing counts on research SERPs. |
| Visual/format gap | None required. Competitors use airport tables, restaurant lists, and market dashboards. This batch keeps existing markup and only corrects present-tense home-count sentences. |
| Seascape gap | The live catalog is six homes. Present-tense guide and research-bio lines still say five, so an assistant quoting those pages will repeat a stale inventory count. |
| Search fit | Keep the existing guide and research URLs. Correct the present-tense portfolio count so it matches the live catalog. Leave historical study denominators at five. Conversion stays on /properties/. Do not open a new page or rewrite snippets. |
| Local/GBP proof | Not applicable: organic guide and research copy correction, no local-pack or GBP claim. |
| AEO/readback note | No AI citation-lift claim. The brief's readback rule is only that production must stop saying Seascape currently manages five homes before any agent-question run. |
| Recommendation | keep the four existing pages: change present-tense five-home lines to six, keep study-window five-home denominators, and leave titles, meta, and layout alone. |
| Attack status | completed |
| Query variants inspected | flights to Anna Maria Island; closest airport to Anna Maria Island; Bradenton vs Sarasota restaurants; Seascape Vacations how many properties; Anna Maria Island vacation rental company how many homes; gulf coast vacation booking trends 2026 Bradenton Sarasota |
| SERP source | Public web search and live page reads on 2026-10-02; not a location-controlled rank report. |
| Competitor URLs inspected | https://www.visitannamariaisland.com/post/how-do-i-get-to-anna-maria-island ; https://www.amilocals.com/rentals/ ; https://www.seabreezevacation.com/meet-the-team/ ; https://www.airdna.co/vacation-rental-data/app/us/florida/sarasota/overview ; https://altezvacations.com/blog/march-2026-sarasota-vacation-rental-market-update/ ; https://seascape-vacations.com/properties/ ; https://seascape-vacations.com/guides/flights-to-anna-maria-island/ ; https://seascape-vacations.com/research/gulf-coast-vacation-booking-trends-2026/ . Wingtip Ventures appeared on the flights SERP but the page fetch returned 500. |
| Content gap and Seascape answer | Local managers publish a current home count. Seascape's catalog already says six. The gap is stale present-tense five-home sentences on existing guides and research bios. Answer: six current homes, all with private pools, only Dockside Dreams with a dock; five-home study windows stay five. |
| Design/format strategy | Text-only correction inside existing paragraphs and author bios. No new visual pattern. |
| Seascape proof available | Live catalog on 2026-10-02 lists six named homes. Live flights intro and booking-trends author bio still say five. Property-truth test in this PR pins the present-tense count. |
| Tools/plugins used | Public web search and live page reads on 2026-10-02; docs/status/next-batch.md 2026-10-02 freshness receipt; local search-brief-gate and verify:release. |
| Decision and reason | Ship the present-tense count correction on the four existing pages. next-batch.md remains blocked by freshness, so this is catalog-truth hygiene, not a new SEO batch. |

## Why This Batch

- The live catalog is six homes. Present-tense guide and bio lines still say five.
- The 2022-2026 booking studies stay at five homes. That was the sample, not the current portfolio.
- CTA lines that bundled "waterfront, pools, docks" onto the whole portfolio are rewritten in the same sentences. Only Dockside Dreams has the dock.

## Source Files Changed In This Batch

- src/guides/flights-to-anna-maria-island/index.html
- src/guides/bradenton-vs-sarasota-restaurants/index.html
- src/research/gulf-coast-vacation-booking-trends-2026.njk
- src/research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026.njk
- scripts/enforcement/property-truth-invariants.test.js
