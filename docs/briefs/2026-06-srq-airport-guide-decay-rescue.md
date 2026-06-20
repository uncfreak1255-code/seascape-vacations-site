# Brief: SRQ Airport Guide Decay Rescue

## Content Gate Inputs

- persona: Gulf Coast guest flying into Sarasota-Bradenton International Airport
  and deciding how to reach an Anna Maria Island or near-island stay.
- primary keyword: Sarasota airport to Anna Maria Island
- secondary keywords: SRQ airport to Anna Maria Island, Sarasota airport to AMI,
  how to get to Anna Maria Island from SRQ, SRQ to Anna Maria Island, do you
  need a rental car on Anna Maria Island
- audience pattern: arrival-planning traveler who wants a fast route answer,
  realistic transport options, and a direct path from airport planning into
  bookable Gulf Coast homes.
- proof source: `docs/status/next-batch.md` run date 2026-06-20,
  `docs/status/content-decay-patrol.md` generated 2026-06-20,
  `docs/process/ranking-regression-rescue.md`, source readback from
  `src/guides/srq-airport-to-anna-maria-island.html`, official SRQ ground
  transportation and car-rental pages reviewed 2026-06-20, the Manatee County
  AMI trolley page reviewed 2026-06-20, and live/source route smoke before
  public copy changes.
- required internal links: /guides/flights-to-anna-maria-island/,
  /guides/how-to-get-to-anna-maria-island/,
  /guides/do-you-need-a-car-anna-maria-island/,
  /stays/anna-maria-island-vacation-rentals/,
  /stays/bradenton-vacation-rentals-near-beaches/,
  /stays/vacation-rentals-near-anna-maria-island/
- CTA target: keep the direct-book home CTA and route airport-intent readers
  into the strongest AMI/near-AMI stay pages without implying Seascape owns
  on-island inventory unless the destination page says so.
- anti-claims: no rank recovery claim, no AI Overview claim, no precise live
  fare promise, no promise that SRQ always beats TPA on ticket price, no
  unsupported shuttle/operator endorsement, and no date refresh unless the
  page receives a real content or proof review.

## Experiment And Readback Contract

- hypothesis: a narrow freshness and trust cleanup on the SRQ airport guide
  should improve the page's fit for airport-to-AMI searchers by replacing stale
  March freshness signals, reconciling transport-cost ranges, and making the
  stay handoff clearer without creating a new route page.
- primary event: `guide_book_direct_click`
- guardrail event: route returns 200, canonical remains self-referencing,
  Article/FAQPage/BreadcrumbList/LocalBusiness JSON-LD remains valid, and stay
  links stay location-honest.
- entry criteria: `docs/status/next-batch.md` names the query family twice on
  the 2026-06-20 read, with one row at rank 6 and one absent/regression row;
  `docs/status/content-decay-patrol.md` flags both stale `dateModified` and a
  stale visible March freshness label.
- readback window: first 7 complete days after deploy once final GSC data covers
  the full window, respecting Search Console delay.
- decision rule: keep if rank, CTR, clicks, or `guide_book_direct_click` trend
  improves without a guardrail failure; if flat, run a deeper competitor/intent
  pass against the visible route-planner and official visitor results; if worse,
  revert the weak source change or retune title/meta in a separate brief.

## Why This Batch

- `docs/status/content-decay-patrol.md` puts this URL at the top of the high
  priority queue with both stale-dateModified and dated-proof-label findings.
- `docs/status/next-batch.md` shows current SERP pressure for `Sarasota airport
  to Anna Maria Island`, so this is not a random freshness sweep.
- The page already has exact query fit, FAQPage schema, direct-home CTA, and
  related stay links; the likely issue is stale trust and route-intent clarity,
  not the need for a new page.

## Gate 0 Rescue Block

| Field | Required answer |
| --- | --- |
| Target query family | `Sarasota airport to Anna Maria Island`, `SRQ airport to Anna Maria Island`, and nearby AMI arrival-route queries. |
| Searcher intent | Guide/support intent with guest-booking handoff. The searcher wants route time, transport options, traffic/bridge risk, and whether a car is needed before booking or arriving. |
| Current Seascape URL | `/guides/srq-airport-to-anna-maria-island/`. |
| SERP observed date | 2026-06-20 |
| SERP stale after | 2026-06-27 |
| Current proof | `docs/status/next-batch.md` run date 2026-06-20 lists `Sarasota airport to Anna Maria Island` for this URL with one row at rank 6 and one absent/regression row. `docs/status/content-decay-patrol.md` generated 2026-06-20 flags stale `dateModified` age 109d and visible `Updated March 2026` age 111d. Source readback confirms the page is indexable, self-canonical, and still has Article, FAQPage, BreadcrumbList, LocalBusiness, direct-book CTA, and related stay links. Official source review on 2026-06-20 confirmed SRQ still lists rental cars, taxis, shuttles, Uber, and Lyft as ground transportation options, and Manatee County still lists the AMI trolley as free daily service. |
| Top visible competitors | Facebook, Rome2rio, Anna Maria Island Chamber, and Visit Florida from the 2026-06-20 SERP evidence in `docs/status/next-batch.md`. |
| Competitor angle | UGC/trip discussion, route planner, official visitor guidance, destination trust, and practical arrival logistics. |
| Seascape gap | Seascape has the exact travel-guide page and useful FAQ schema, but the page still presents March freshness, has mixed transport cost ranges between body and table, and does not clearly mark which claims were reviewed in June 2026. |
| Search fit | The existing URL should be rescued because it directly answers the airport-to-AMI query and can hand travelers into honest direct-book stay pages. A new page would split the route intent. |
| Local/GBP proof | Not primary for this guide-support query. GBP/local proof may support brand trust, but the SERP evidence is organic route/visitor guidance rather than map-pack owner-service intent. |
| AEO/readback note | Page has a TL;DR answer and visible FAQPage content, but there is no current direct AI observation row for this query. Treat AI-answer visibility as unproven until the analytics direct observation work order is filled. |
| Recommended action | Update the active source page only after a real source review: change visible freshness to `Reviewed June 2026`, update `dateModified`, reconcile transport cost ranges, add a short June review/proof note near the top, and route the stay handoff into AMI/near-AMI stay pages with existing tracking. Then run `npm run lint:content`, `npm run build`, `npm run verify:jsonld`, `npm run verify:links`, and `npm run git:preflight`. |

## Source And Proof Constraints

- property truth needed: keep location language honest; do not imply every
  Seascape home is on Anna Maria Island.
- external truth needed: route and fare language should be framed as typical or
  planning ranges unless checked against current transport/provider sources.
- external sources reviewed 2026-06-20:
  - https://flysrq.com/ground-transportation
  - https://flysrq.com/car-rentals
  - https://www.mymanatee.org/services-and-amenities/service-listing/service-details/ride-route-5-anna-maria-island-trolley
- claims that are off-limits: exact current fares, guaranteed drive times,
  live bridge conditions, and rank/AI/revenue impact.
- Seascape-specific proof to preserve: local operator framing, direct-book stay
  handoff, airport route advice tied to the AMI/Bradenton/Sarasota corridor.

## Page Builder Tasks

- source file likely to change:
  - `src/guides/srq-airport-to-anna-maria-island.html`
- redirect or schema work: preserve canonical, Article, FAQPage,
  BreadcrumbList, and LocalBusiness schema; update `dateModified` only with a
  visible freshness/proof review.
- internal-link or CTA work: preserve existing direct-book CTA and related stay
  links; add or retune links only where the sentence fit is natural.
- money CTA and downstream tracking event to verify: `guide_book_direct_click`
  should be used for any added guide-to-stay links.

## Voice Editor Checklist

- answer the route question in the first visible answer block.
- remove or avoid exaggerated language like `exponentially closer`.
- keep fare and time language bounded: typical, often, can, usually.
- avoid public copy that explains SEO, stale labels, or proof mechanics.
- keep the stay handoff helpful, not pushy.

## Release Gate Checklist

- route to smoke test:
  - `/guides/srq-airport-to-anna-maria-island/`
  - `/guides/flights-to-anna-maria-island/`
  - `/guides/do-you-need-a-car-anna-maria-island/`
  - `/stays/anna-maria-island-vacation-rentals/`
  - `/stays/bradenton-vacation-rentals-near-beaches/`
- commands to run:
  - `npm run lint:content`
  - `npm run build`
  - `npm run verify:jsonld`
  - `npm run verify:links`
  - `npm run git:preflight`

## Done When

- this active rescue brief exists with a filled Gate 0 block
- the source page has a bounded freshness/proof cleanup if public copy changes
- relevant commands pass or a blocker is named
- final closeout separates source execution from later GSC/GA4/AI readback

## Post-Reread Outcome

- reread window used: fill after deploy plus final GSC data window.
- crawl freshness result: fill after Search Console/analytics read.
- actual impressions, CTR, position, and downstream event counts: fill after
  readback.
- decision taken: hold, refine, expand, or kill.
- next branch slug or explicit wait state: fill after readback.

## Not In Scope

- new SRQ or airport route variants
- broad travel-guide expansion
- exact live fare scraping
- owner-page work
- AI visibility claims before observation rows exist
