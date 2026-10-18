# Brief: Owner benchmark published-pricing freshness

- lifecycle: active
- task scope: refresh the owner-fee benchmark published-pricing dates after a live re-read of Airbnb help article 1857 and Stripe pricing. Figures unchanged. Date and label refresh only; not a guest-copy rewrite.
- completion or successor: stacked with fail-closed contract and claim-parser; do not merge until Sawyer merges the stack

## Content Gate Inputs

- persona: Gulf Coast vacation-rental owner comparing a management proposal with booking-platform and payment-processing charges
- primary keyword: Airbnb host fees vs card processing
- secondary keywords: vacation rental owner fees, Stripe card processing fee
- audience pattern: owner who treats the "sources checked" date as proof the published rates are still current
- proof source: Airbnb help article 1857 and Stripe pricing re-read at 9:35 PM ET on 2026-10-17. Figures unchanged from the September 17 check. `docs/status/next-batch.md` reread on 2026-10-12 is fresh but below threshold
- offer claim: `seascape-hub/context/owner-offer.md` section 6, landed through the existing property-management quote CTA on this research route
- required internal links: /property-management/, /property-management/vacation-rental-management-fees-florida/, /property-management/maximize-vacation-rental-income-florida/
- CTA target: /property-management/?owner_source=owner-fee-revenue-leak-benchmark-2026#owner-cta
- anti-claims: no current Seascape performance total, no owner-savings claim from direct booking, no all-in comparison between platform commission and card processing, no universal Seascape management percentage, no private owner identity
- hypothesis: a stale `pricingStaleAfter` fails owner-proof CI even when the published figures have not moved
- primary event: owner_primary_cta_click
- guardrail event: owner_form_submit
- entry criteria: owner-proof freshness CLI compared wall-clock 2026-10-18 against `pricingStaleAfter` 2026-10-17 and failed
- readback window: after the date refresh is on a deploy preview, confirm the published figures still match Airbnb 1857 and Stripe
- decision rule: keep the date/label refresh only; do not change fee figures or guest guide copy

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | Airbnb host fee; Stripe card processing fee; vacation rental owner fees |
| Searcher intent | Research the charges behind an owner statement or management proposal |
| Current Seascape URL | /research/owner-fee-revenue-leak-benchmark-2026/ |
| SERP observed date | 2026-10-17 |
| SERP stale after | 2026-10-24 |
| Current proof | docs/status/next-batch.md reread on 2026-10-12 is fresh but below threshold. This edit re-reads Airbnb 1857 and Stripe published pricing at 9:35 PM ET on 2026-10-17. Figures are unchanged. The change is the reviewed/stale dates only. |
| Top visible competitors | No competitor rewrite. This batch only refreshes published-pricing dates on the existing fee-definition page. |
| Competitor angle | Competitors still lead with a management percentage or package. This page stays a sourced fee-definition comparison. |
| Visual/format gap | None. Keep the existing three-row fee table and quote checklist. |
| Seascape gap | `pricingStaleAfter` 2026-10-17 expired at 2026-10-18T00:00Z, so owner-proof CI failed on an otherwise unchanged page. |
| Search fit | Keep the existing research URL. Refresh the checked-on dates. Conversion stays on /property-management/. Do not open a new page. |
| Local/GBP proof | Not applicable: published-pricing date refresh, no local-pack or GBP claim. |
| AEO/readback note | No AI citation-lift claim. Readback is only that the preview still shows the same published fee figures with a current checked-on date. |
| Recommendation | keep the existing research route: move pricingReviewedDate to 2026-10-17 and pricingStaleAfter to 2026-11-16. Leave guest guides alone. |
| Attack status | none found after named checks |
| Query variants inspected | Airbnb host fees vs card processing; Florida vacation rental management fees |
| SERP source | Official Airbnb 1857 and Stripe pricing page re-read at 9:35 PM ET on 2026-10-17; next-batch.md 2026-10-12 freshness receipt. Not a location-controlled rank report. |
| Competitor URLs inspected | source check: Airbnb https://www.airbnb.com/help/article/1857 and Stripe https://stripe.com/pricing at 9:35 PM ET on 2026-10-17; SERP check: no DataForSEO or public SERP action because next-batch.md is fresh but below threshold on 2026-10-12; competitor-page check: no competitor page rewrite |
| Content gap and Seascape answer | The page must not present expired published-pricing dates as current. Answer: the same Airbnb and Stripe figures, checked October 17, 2026. |
| Design/format strategy | Date and label replacement only. No new visual pattern. |
| Seascape proof available | Airbnb 1857 and Stripe pricing re-read 9:35 PM ET 2026-10-17; figures match the September 17 check. |
| Tools/plugins used | Official pricing-page reads at 9:35 PM ET on 2026-10-17; docs/status/next-batch.md 2026-10-12 freshness receipt; local owner-proof-integrity and content-voice gates. |
| Decision and reason | Refresh dates after a live re-read confirmed unchanged figures. next-batch.md remains below threshold, so this is freshness hygiene, not a new SEO batch. |

## Source Files Changed In This Batch

- source files likely to change: `src/research/owner-fee-revenue-leak-benchmark-2026.njk`, `src/_data/ownerProofAssets.json`
- src/research/owner-fee-revenue-leak-benchmark-2026.njk
- src/_data/ownerProofAssets.json
- scripts/enforcement/owner-proof-integrity.test.js
