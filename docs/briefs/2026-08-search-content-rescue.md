# Brief: August Search Content Rescue

## Content Gate Inputs

- persona: family trip planner choosing timing and transport, plus a proof-sensitive Bradenton or Sarasota rental owner.
- primary keyword: Anna Maria Island weather by month
- secondary keywords: SRQ airport to Anna Maria Island, best time to visit Anna Maria Island, Florida Gulf Coast vacation rental market report 2026, Bradenton vs Sarasota vacation, is Anna Maria Island worth visiting
- audience pattern: searcher who already sees a Seascape page on page one but needs a clearer, current, source-labeled answer before clicking or continuing.
- proof source: live GSC URL data for 2026-07-21 through 2026-08-17; exact-query read-only SERP receipt observed 2026-08-19; NOAA, NHC, NWS, CDC, Manatee County, Site terms, and the fixed Seascape historical research set named below.
- required internal links: /terms/#cancellations, /guides/hurricane-preparedness-florida-vacation/, /research/gulf-coast-vacation-booking-trends-2026/, /property-management/#owner-cta, /stays/anna-maria-island-vacation-rentals/
- CTA target: preserve the weather guide's neutral stay path and the market page's owner revenue-review CTA; improve tracking lineage without changing reader-facing CTA copy.
- anti-claims: no current weather or availability, exact crowd level, guaranteed best month, exact price reduction, AMI-exact proxy reading, storm rarity, fixed storm warning time, cancellation or insurance coverage promise, market-wide average, current 2026 portfolio metric, causal waterfront premium, direct-booking savings guarantee, ranking lift, CTR lift, or booking lift.

## Why This Batch

- Weather has expired March-April copy, false hurricane history, and unsupported safety/commercial claims on a page with 6,514 impressions and 0.52% CTR.
- The market report has 1,663 impressions and 0.24% CTR but presents a five-home historical set as a broad 2026 market report.
- Best-time and SRQ remain page-one, weak-CTR rescue candidates. Worth-visiting and Bradenton-vs-Sarasota hold the top returned position and have no current snippet gap.
- The guide-to-booking report undercounts real booking-engine exits because catalog exits use a different primary event and internal lineage is dropped.
- Ten pSEO candidates are real, but the current proof gate does not authorize public retirement.

## Experiment And Readback Contract

- hypothesis: source-correct scope and query-matched snippets will improve trust and click fit, while repaired lineage will make real booking-engine exits measurable without changing page layout.
- primary event: GSC CTR per changed guide URL and named `booking_engine_handoff` totals.
- guardrail event: average GSC position, `guide_book_direct_click`, `guide_stay_click`, catalog events, route/canonical integrity, and zero duplicate handoff receipts.
- entry criteria: weather 34/6,514/0.52%/7.09; market 4/1,663/0.24%/6.01; best-time 57/8,277/0.69%/4.56; SRQ 17/4,843/0.35%/6.09 for 2026-07-21 through 2026-08-17.
- readback window: first complete 28 days after deploy for URL CTR; first seven complete days for event-name and lineage integrity.
- decision rule: keep a page change when CTR rises without average position degrading by 1.0 or more; revert the route-specific snippet if CTR falls after a complete comparable window. Keep tracking when catalog exits emit one primary event, one handoff event, and one receipt without false hash-link handoffs.

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | Anna Maria Island weather/timing, SRQ transport, destination/base comparison, and 2026 Gulf Coast rental research. |
| Searcher intent | guide/research, support, comparison, and owner research. |
| Current Seascape URL | `/guides/anna-maria-island-weather/`, `/guides/florida-gulf-coast-vacation-rental-market-report-2026/`, `/guides/best-time-visit-anna-maria-island/`, `/guides/srq-airport-to-anna-maria-island/`, `/guides/is-anna-maria-island-worth-visiting/`, and `/guides/bradenton-vs-sarasota/`. |
| SERP observed date | 2026-08-19 |
| SERP stale after | 2026-08-26 |
| Current proof | Page-level GSC for 2026-07-21 through 2026-08-17 is recorded in Route Decisions; current live search shape is recorded in `workspace/seo-content-rescue-20260819/serp-gate-0.md`. |
| Top visible competitors | Plan Anna Maria, Rome2Rio, World Travel Index, Zachos Realty, WeatherSpark, StaySTRA, Timeanddate, and current regional market reports. |
| Competitor angle | Month scoring, exact route/time/cost, pros and cons, relocation comparison, objective climate normals, and current market-wide metrics. |
| Visual/format gap | Weather needs a named-source table; market needs a clear scope card. Best-time and SRQ need query-fit snippets. Worth-visiting and Bradenton-vs-Sarasota need no new format. |
| Seascape gap | Two pages make stale or over-broad claims, two snippets understate the exact query answer, and the conversion report cannot name all real booking-engine exits. |
| Search fit | Rescue existing URLs only. They already rank and map to the correct trip, support, comparison, or owner decision. No new pages. |
| Local/GBP proof | Not applicable; these are informational routes and the observed search surface did not show a map pack. |
| AEO/readback note | No separate AI-answer audit was available. Use source-labeled answer blocks, valid FAQ/Article schema, and later live/GSC readback. |
| Recommendation | Rescue weather and historical market scope; improve best-time meta and SRQ title/meta; hold worth-visiting and Bradenton-vs-Sarasota snippet framing; repair tracking lineage; hold public pSEO consolidation. |
| Attack status | completed |
| Query variants inspected | `Anna Maria Island weather by month`, `best time to visit Anna Maria Island`, `SRQ airport to Anna Maria Island`, `is Anna Maria Island worth visiting`, `Bradenton vs Sarasota vacation`, and `Florida Gulf Coast vacation rental market report 2026`. |
| SERP source | Exact-query read-only web search observed 2026-08-19, followed by Agent Reach Jina Reader for selected competitor pages. |
| Competitor URLs inspected | `https://www.planannamaria.com/best-time-to-visit`, `https://www.rome2rio.com/s/Sarasota-Bradenton-Airport-SRQ/Anna-Maria-Island`, `https://theworldtravelindex.com/en/north-america/united-states/anna-maria-island-florida/is-anna-maria-island-worth-visiting`, `https://zachosre.com/sarasota-vs-bradenton-which-florida-gulf-coast-city-is-right-for-you/`, `https://weatherspark.com/y/16814/Average-Weather-in-Anna-Maria-Florida-United-States-Year-Round`, and `https://staystra.com/sarasota-str-market-2026/`. |
| Content gap and Seascape answer | Seascape can label nearby NOAA proxies, state storm/cancellation boundaries, expose its historical portfolio scope, lead SRQ with the exact route query, and preserve strong top-position pages instead of rewriting them. |
| Design/format strategy | Preserve current layouts. Replace the weather table data and market scope content; make metadata-only changes on best-time and SRQ; no layout work on hold routes. |
| Seascape proof available | Current GSC, current source/live pages, official weather/safety sources, Site terms, fixed historical Seascape research, and live funnel data through 2026-08-19. |
| Tools/plugins used | BigQuery GSC, live GA4/Postgres read, Agent Reach/Jina Reader, official direct sources, repo tests, and build gates; no paid calls or account mutation. |
| Decision and reason | Use the regression-rescue lane for high-impression weak-CTR or factually stale winners, fix only the proven tracking contract, and leave pSEO URLs intact until index/SERP proof clears. |

## Route Decisions

| Route | Proof | Decision | Source action |
| --- | --- | --- | --- |
| `/guides/anna-maria-island-weather/` | 34 clicks / 6,514 impressions / 0.52% CTR / 7.09 position; stale and unsafe claims confirmed | `improve - completed Gate 0 rescue` | Replace stale answer, official-proxy table, safety/cancellation copy, FAQ, metadata, and material date |
| `/guides/florida-gulf-coast-vacation-rental-market-report-2026/` | 4 / 1,663 / 0.24% / 6.01; current title overstates five-home historical evidence | `improve - completed Gate 0 rescue` | Relabel historical scope; remove current/causal claims; preserve owner CTA; make the evidence table readable on mobile |
| `/guides/best-time-visit-anna-maria-island/` | 57 / 8,277 / 0.69% / 4.56; live result returned 5 | `improve - completed Gate 0 rescue` | Meta description only; preserve current title and body |
| `/guides/srq-airport-to-anna-maria-island/` | 17 / 4,843 / 0.35% / 6.09; live result returned 5 | `improve - completed Gate 0 rescue` | Lead title and heading with SRQ; update matching meta/social description; remove the unsupported sticky savings claim; contain the mobile transport table |
| `/guides/is-anna-maria-island-worth-visiting/` | 11 / 2,512 / 0.44% / 3.10; live result returned 1 | `hold - completed Gate 0 decision` | No source change |
| `/guides/bradenton-vs-sarasota/` | 31 / 3,823 / 0.81% / 4.06; live result returned 1 | `hold - completed Gate 0 decision` | No snippet/body change; tracking-only shared runtime applies |

## Authorized Source Files

- src/guides/anna-maria-island-weather.html
- src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html
- src/guides/best-time-visit-anna-maria-island.html
- src/guides/srq-airport-to-anna-maria-island.html

## Required Internal Link Map

- src/guides/anna-maria-island-weather.html: /terms/#cancellations, /guides/hurricane-preparedness-florida-vacation/, /stays/anna-maria-island-vacation-rentals/
- src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html: /research/gulf-coast-vacation-booking-trends-2026/, /property-management/#owner-cta
- src/guides/best-time-visit-anna-maria-island.html: /research/gulf-coast-vacation-booking-trends-2026/, /guides/hurricane-preparedness-florida-vacation/, /stays/anna-maria-island-vacation-rentals/
- src/guides/srq-airport-to-anna-maria-island.html: /stays/anna-maria-island-vacation-rentals/, /guides/flights-to-anna-maria-island/

## Source And Proof Constraints

- Weather air/rain values use NOAA 1991-2020 normals at Sarasota-Bradenton Airport station `USW00012871`; water values use NOAA Port Manatee station `8726384` as a proxy, not an AMI surf reading.
- Storm guidance follows NHC/NWS sources. Cancellation details remain property-specific at secure checkout.
- Market figures are a fixed historical portfolio benchmark: 545 confirmed bookings out of 1,492 reservation records, five homes, June 2022 through March 2026.
- The expired 924-reservation diagnostic is not publishable as current evidence.
- Event names, handoff endpoint, response fields, and receipt fields remain unchanged.

## Page Builder Tasks

- source files likely to change: the four Authorized Source Files above.
- tracking source: `src/assets/js/conversion-tracking.js` with focused `scripts/enforcement/guide-funnel-lineage.test.js`.
- evidence/status: `docs/status/content-decay-patrol.md` may refresh its stale generated count; no public pSEO routing changes.
- money CTA and downstream tracking event to verify: weather stay path, market owner CTA, `guide_book_direct_click`, `guide_stay_click`, catalog events, and `booking_engine_handoff`.

## Voice Editor Checklist

- Preserve direct local language and remove false urgency, superlatives, promises, and process language.
- Define every proxy, threshold, sample, and date before using the number.
- Keep titles and first answers natural; do not copy competitor phrasing.
- Final verdict after copy pass: Voice Editor approved. The source-contract tests and content lint pass, the public copy contains no internal process language, and the desktop/mobile proof review shows the changed layouts without obstruction or page-level overflow.

## Release Gate Checklist

- `node --test scripts/enforcement/search-content-rescue.test.js scripts/enforcement/guide-funnel-lineage.test.js`
- `npm run lint:content`
- `npm test`
- `npm run verify:links`
- `npm run verify:jsonld`
- `npm run verify:redirects`
- `npm run verify:release`
- `node scripts/enforcement/run-visual-tests.js tests/visual/search-content-rescue.spec.js`
- local and post-deploy route/event smoke with exact-SHA Netlify status readback

## Done When

- Four approved routes have source-backed changes and two hold routes remain untouched.
- Tracking keeps one guide click ID through internal funnel links and names true booking-engine exits without false or duplicate handoffs.
- The stale pSEO count is corrected, while public redirect/noindex changes remain held with a named future pair.
- Full content, test, build, link, schema, redirect, visual, review, and live SHA-bound gates pass before any shipped claim.

## Not In Scope

- new articles or generated pages
- current market metrics from an expired Analytics snapshot
- Analytics schema changes for historical row-level journey attribution
- public pSEO redirects/noindex changes without URL Inspection and live intent proof
- changes to worth-visiting or Bradenton-vs-Sarasota snippet framing
