# Brief: Booking Direct Proof Refresh

## Content Gate Inputs

- persona: Gulf Coast guest comparing a direct Seascape booking against Airbnb or Vrbo before checking live dates.
- primary keyword: booking direct vacation rentals
- secondary keywords: book direct vacation rentals, direct booking vacation rentals, Airbnb fees, Vrbo fees, book direct Anna Maria Island rentals
- audience pattern: fee-sensitive guest who needs the direct-booking savings claim to look current without turning the page into a new market report.
- proof source: `docs/status/content-decay-patrol.md` generated 2026-06-20, current source file `src/guides/booking-direct-vacation-rentals.html`, and current direct-booking savings claims in `src/_data/seoPages.json`.
- required internal links: /guides/anna-maria-island-vacation-cost/, /guides/best-vacation-rental-companies-ami/, /guides/best-time-visit-anna-maria-island/
- CTA target: keep the existing guide conversion kit handoff to direct stay pages and booking-engine availability.
- anti-claims: no new June booking dataset claim, no guarantee that every live quote saves the same amount, no platform-fee percentage beyond the current repo-supported 10-15% boundary, no claim of rank or conversion lift before analytics readback.

## Experiment And Readback Contract

- hypothesis: replacing stale March 2026 proof wording with a reviewed June 2026 source note will reduce trust risk while preserving the direct-booking conversion path.
- primary event: `guide_book_direct_click` and `booking_engine_handoff` from `/guides/booking-direct-vacation-rentals/`.
- guardrail event: content lint, guide conversion enforcement, JSON-LD, links, content-decay patrol, and release verification.
- entry criteria: `docs/status/content-decay-patrol.md` generated 2026-06-20 flags `/guides/booking-direct-vacation-rentals/` for stale `dateModified` and stale March 2026 proof language.
- readback window: next complete 7-day analytics window after deploy, plus the next generated content-decay patrol.
- decision rule: keep if the decay patrol no longer flags this route and direct-booking handoff events do not show a regression; if the page still flags, decide whether the scenario examples need a real pricing-data refresh instead of another label cleanup.

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | `booking direct vacation rentals`, `book direct vacation rentals`, and direct-booking fee comparison searches. |
| Searcher intent | Guest booking comparison and trust validation before leaving an OTA funnel for a local direct-booking site. |
| Current Seascape URL | `/guides/booking-direct-vacation-rentals/`. |
| SERP observed date | 2026-06-21 |
| SERP stale after | 2026-06-28 |
| Current proof | `docs/status/content-decay-patrol.md` generated 2026-06-20 flags the route for stale `dateModified` age 91d and a March 2026 proof label age 111d. Current `src/_data/seoPages.json` supports 10-15% direct-booking savings and $300-$600 budget framing, but does not support a new June booking dataset claim. |
| Top visible competitors | East West Hospitality, Brett/Robinson, Rent Waterscape, On The Sand Vacations, Houfy, and other direct-booking explainer pages visible for the query family on 2026-06-21. |
| Competitor angle | Competitors mainly sell OTA fee avoidance, local support, secure booking, direct communication, and trust checks for leaving Airbnb or Vrbo. |
| Seascape gap | The page already has the right direct-booking answer and handoff, but its Article schema and author card made the supporting examples look stuck in March 2026. |
| Search fit | Keep the existing URL. It already serves direct-booking comparison intent and sends guests into current stay inventory without creating a new page. |
| Local/GBP proof | Not applicable because this is a guest direct-booking guide, not map-pack or GBP work. |
| AEO/readback note | The direct answer, FAQ schema, and source note should stay citable. AI/search impact is unproven until analytics and citation readback. |
| Recommendation | Update only the stale proof label and `dateModified`, add a short source note that keeps the scenario rows as planning examples, regenerate content-decay patrol, then run content and release checks. |

## Source And Proof Constraints

- The direct-booking savings range must stay inside the current repo-supported 10-15% boundary.
- The `$300-$600` savings framing can remain because current stay-page data uses the same budget range, but the page must not imply that the three scenario rows are fresh June quote pulls.
- Keep the route narrow: no title rewrite, no new route, no new external fee claim, no change to the conversion kit.

## Page Builder Tasks

- update `src/guides/booking-direct-vacation-rentals.html`
- update Article `dateModified`
- replace stale March 2026 proof wording with reviewed June 2026 language
- add one source note below the fee-stack setup
- regenerate `docs/status/content-decay-patrol.md`

## Release Gate Checklist

- routes to smoke test: `/guides/booking-direct-vacation-rentals/`
- commands to run: `npm run lint:content`, `node --test scripts/enforcement/guide-conversion.test.js`, `npm run seo:decay -- --as-of 2026-06-21`, `npm run build`, `npm run verify:jsonld`, `npm run verify:links`, and `npm run verify:release`
- regression risks to watch: stale March label remains, unsupported fresh-data claim appears, guide conversion links break, or JSON-LD becomes invalid.

## Done When

- content-decay patrol no longer flags `/guides/booking-direct-vacation-rentals/`
- the page keeps its existing direct-booking conversion path
- release checks pass or a concrete blocker is named

## Not In Scope

- rewriting the direct-booking strategy
- changing stay-page pricing claims
- adding a calculator or live quote proof
- claiming SEO, AI, or conversion lift from this wording cleanup
