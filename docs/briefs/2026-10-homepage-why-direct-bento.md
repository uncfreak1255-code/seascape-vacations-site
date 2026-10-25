# Homepage and mobile booking consolidation

- lifecycle: active
- task scope: consolidate PRs #787, #791, #792 and #793 with the form-size subset of #796 into existing PR #787; user authorized comparison and selection on 2026-10-25. Production release remains separate.
- completion or successor: finish rendered desktop/mobile and release checks before release review. Original branches preserve all discarded explorations.
- persona: Gulf Coast guest comparing homes and complete booking totals on a phone.
- primary keyword: book direct vacation rentals
- secondary keywords: Bradenton vacation rentals, Sarasota vacation rentals
- audience pattern: guest choosing a real home, dates and group size before secure checkout.
- proof source: existing booking-direct guide FAQ; owner-operated homepage; canonical properties-fallback.json reviews, photos and private pools; existing whole-stay pool heat policy.
- required internal links: /properties/, /guides/booking-direct-vacation-rentals/
- CTA target: /properties/ with existing data-trip-link behavior.
- anti-claims: no guaranteed savings, universal platform-fee claims, live quote, invented ratings or amenities.
- hypothesis: cinema hierarchy and a static mosaic explain the direct-booking choice while larger mobile form controls reduce booking friction.
- primary event: existing catalog continuation and booking handoff events; neither proves reservations.
- guardrail event: existing homepage form and collection journeys stay intact.
- entry criteria: one reviewed implementation; no prototype selectors.
- readback window: after publication; no conversion lift claimed by this source change.
- decision rule: retain only compatible Waterline treatments and functional mobile corrections; defer unquoted price motion.

## Design and implementation contract

Cinema retains full-bleed real photography, manual scene selection, labels and direct home links. Mosaic retains paper/ink surfaces, editorial hierarchy and complete-total comparison. Shared dark sliding-arrow pill follows #787. Native selects retain their affordance. Property forms stack at 700px; catalog at 767px. Inputs/selects reach 16px; controls retain 44px minimum. No booking/Hostaway JavaScript changes.

Critic: rendered alternatives and final desktop/mobile reviewed; Approved with edge for the legacy arrow cascade, corrected by explicitly resetting the pseudo-element. Voice: Approved. Preserve the incumbent contrast overlays rather than #792’s lighter replacement; F4 tests identified unsafe navigation/seal text on three scenes. Voice revision removes #793's universal fee statement and instructs comparison of complete totals, taxes and fees. No price model changes. #794 deferred because it adds nightly-times-nights figures without a complete quote and query-controlled success styling. #796's gallery behavior and tap-highlight suppression are outside this consolidation; its old 12px booking-field assertion is discarded.

## Source files likely to change

- source files likely to change:
  - `src/index.njk`
  - `src/css/arrival.css`
  - `src/css/guest.css`
  - `src/css/catalog.css`
  - `src/_includes/partials/guest-trip-form.njk`
  - `src/_includes/layouts/guest.njk`
  - `scripts/recovery/assert-live-smoke.js`

## Proof and release

Run build, content lint, booking/continuity/runtime regressions and visual gates. Capture homepage hero/mosaic, catalog form and a property booking panel at desktop and phone widths. Preserve baseline failures as evidence; never refresh baselines without review. Keep the keeper draft until remaining release gates pass. Publication follows the existing release process.

## Gate 0 source and search receipt — October 25, 2026

This is consolidation of existing design drafts, not a new search expansion. The release gate applies to homepage source changes, so this bounded read checks the existing page purpose without adding a search/content lane.

| Field | Required answer |
| --- | --- |
| Target query family | Bradenton vacation rentals book direct; Sarasota vacation rentals book direct |
| Searcher intent | Compare real homes and complete booking costs, then choose dates. |
| Current Seascape URL | https://seascape-vacations.com/ |
| SERP observed date | 2026-10-25 |
| SERP stale after | 2026-11-01 |
| Current proof | 2026-10-25 source and rendered comparisons against main 08e4856f; mobile property inputs were 12–13px and now measure 16px; no booking uplift evidence. |
| Top visible competitors | Returned search results include Clover Vacation Homes and Bay and Key; no ranking position claimed. |
| Competitor angle | Clover leads with a searchable home collection; Bay and Key pairs date search with local support and direct-booking messaging. |
| Visual/format gap | Existing drafts split one visitor journey into separate visual choice PRs. External pages are context, not evidence of superior conversion. |
| Seascape gap | Mobile booking friction and no single chosen implementation across hero, direct-booking section and controls. |
| Search fit | Keep the brand homepage and existing metadata; send comparison to /properties/. No new URL. |
| Local/GBP proof | Not applicable: no Business Profile or map-pack changes in this task. |
| AEO/readback note | Not applicable to citation expansion: preserve schema and existing guide answers; measure bookings separately after release. |
| Recommendation | Consolidate cinema, mosaic and functional mobile corrections; do not import competitor savings claims or their terms. |
| Attack status | completed |
| Query variants inspected | Bradenton vacation rentals book direct; Sarasota vacation rentals book direct |
| SERP source | Web search on 2026-10-25; returned pages then opened directly. |
| Competitor URLs inspected | https://www.clovervacationhomes.com/ ; https://bayandkey.com/ |
| Content gap and Seascape answer | Seascape can explain same-home complete-total comparison with its own sourced local-team, pool and review facts. |
| Design/format strategy | Waterline cinema and static paper mosaic; no alternate selectors or price counter. |
| Seascape proof available | Canonical home photos/reviews; existing direct-booking guide; current form and Hostaway regression tests. |
| Tools/plugins used | Current source, web SERP and competitor-page reads, local Playwright render, repo-local design/voice review. |
| Decision and reason | Consolidate existing drafts rather than adding scope; actual booking semantics and accurate total disclosures outrank decorative motion. |
