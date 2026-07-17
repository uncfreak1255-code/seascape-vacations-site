# Owner Fee Comparison Guide — Integrity Rescue

Date: 2026-07-17
Site route: `/research/owner-fee-revenue-leak-benchmark-2026/`
Status: active truthfulness rescue; legacy URL retained

## Content Gate Inputs

- persona: Gulf Coast vacation-rental owner comparing a management proposal with booking-platform and payment-processing charges before signing or renewing
- primary keyword: Airbnb host fees vs card processing
- secondary keywords: vacation rental owner fees, Airbnb host service fee, Stripe card processing fee, vacation rental management quote
- audience pattern: owner who sees several percentages on a statement or proposal and needs to know what each charge covers before comparing them
- proof source: Airbnb's official service-fee page, Stripe's official pricing page, and the property-specific signed Seascape management agreement
- required internal links: /property-management/, /property-management/vacation-rental-management-fees-florida/, /property-management/maximize-vacation-rental-income-florida/
- CTA target: /property-management/?owner_source=owner-fee-revenue-leak-benchmark-2026#owner-cta
- anti-claims: no current Seascape performance total, no owner-savings claim from direct booking, no all-in comparison between platform commission and card processing, no universal Seascape management percentage, no private owner identity, no internal evidence path
- hypothesis: replacing expired performance claims with primary-source fee definitions will make the page more trustworthy and more useful without opening a new owner-content batch
- primary event: owner_primary_cta_click
- guardrail event: owner_form_submit
- entry criteria: confirmed public proof drift and reader-facing internal language on the existing indexed route
- readback window: first complete 28-day Search Console and owner-funnel window after the corrected route is live
- decision rule: retain the guide if it remains indexed and sends qualified owner activity; revisit search positioning only after the current owner-cluster threshold in docs/status/next-batch.md opens

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | `Airbnb host fee`, `Stripe card processing fee`, and owner questions about which vacation-rental charges are comparable. |
| Searcher intent | Research the charges behind an owner statement or management proposal before requesting a property-specific quote. |
| Current Seascape URL | `/research/owner-fee-revenue-leak-benchmark-2026/` |
| SERP observed date | 2026-07-17 |
| SERP stale after | 2026-08-16 |
| Current proof | A July 17, 2026 live search showed this research route indexed under the broad management-fee title while `/property-management/` also described the fee guide as a conversion resource. The current route therefore overlaps the owner-money page and needs a distinct platform-fee comparison title. |
| Top visible competitors | Gulf Coast Property Management pricing, Luxe Haus Florida management-cost guide, Emperor Rentals Florida management-fee guide, and Airbnb's own service-fee documentation. |
| Competitor angle | Competitors lead with a management percentage or package; Airbnb defines its host service fee. Few explain why platform commission, card processing, and management are different services. |
| Visual/format gap | The current Seascape route has a qualitative scenario table but no sourced fee-definition table. |
| Seascape gap | The page treats expired internal observations as current proof, compares unlike costs as owner savings, and uses the same management-fee head term as the money page. |
| Search fit | This research route should answer the fee-definition comparison. `/property-management/vacation-rental-management-fees-florida/` remains the service and quote page. |
| Local/GBP proof | Not applicable to the fee-definition answer; local fit belongs in the management quote and property review, not in the platform pricing facts. |
| AEO/readback note | Keep one extractable table, primary-source links beside the claims, synchronized Article metadata, and an explicit sentence stating that the rates are not all-in equivalents. |
| Recommended action | Rescue the existing indexed route in place, remove expired performance proof everywhere it was reused, and keep the current URL and CTA attribution. |

## Reader Answer

An owner should compare three separate things:

1. Airbnb's published host service fee for software-connected listings.
2. Stripe's published standard price for a successful domestic online card transaction.
3. The property-specific management services and fee basis written into the signed agreement.

The first two published rates do not prove that a direct booking raises owner payout. Platform commission, payment processing, guest acquisition, software, and management work are different costs.

## Page Contract

- Title tag: `Airbnb Host Fees vs Card Processing | Seascape`
- Meta description: `Compare Airbnb's published host fee with Stripe's card-processing price, see why they are not all-in equivalents, and learn how Seascape quotes each home.`
- Open Graph and Twitter title: `Airbnb Host Fees vs Card Processing`
- Eyebrow: `Gulf Coast Owner Fee Guide`
- H1: `What Do Vacation Rental Fees Actually Cost?`
- Social image: `/images/owner-field-hero.webp`
- On-page format: sourced fee-definition table plus a quote-review checklist; no percentage-magnitude chart or per-property performance table without approved current proof
- Body image: not required for this fee guide; do not add decorative imagery that makes unlike percentages look comparable
- CTA label: `Request Your Revenue Review`
- CTA attribution: keep `owner_source=owner-fee-revenue-leak-benchmark-2026`

## Approved Public Sources

- Airbnb service fees for home hosts: `https://www.airbnb.com/help/article/1857`
- Stripe pricing: `https://stripe.com/pricing`

Source claims checked July 17, 2026:

- Airbnb says most hosts on its single-fee structure pay 15.5%, with other hosts typically paying 14–16%. The fee is deducted from the host payout and is calculated on the booking subtotal.
- Stripe lists standard domestic online-card pricing at 2.9% + 30 cents per successful transaction.
- Both companies may change pricing. The page must point readers to the linked source instead of presenting either rate as permanent.

## Retired Proof

Earlier versions used a March 2026 planning baseline and April owner-report examples. Those figures cannot support public performance claims now:

- their public-use window expired
- no approved claim-bound public receipt exists
- direct-booking fee differences were incorrectly described as automatic owner savings
- one example exposed a private owner name and internal evidence paths

`src/_data/ownerProofAssets.json` therefore keeps the stable asset key for template compatibility but holds empty `stats` and `examples` arrays with `reuseStatus: retired-stale`. The published Airbnb and Stripe pricing has its own active freshness window (`pricingReviewedDate` through `pricingStaleAfter`) so retired performance proof cannot let external rates age forever.

## Required Cleanup

- Remove the expired owner metrics and savings language from every `src/` surface that repeats them.
- Remove internal workflow language from the benchmark CTA and shared owner form.
- Remove private owner naming and internal repository paths from visible archive copy.
- Keep Article and BreadcrumbList JSON-LD, visible author/source information, self-canonical, sitemap inclusion, and CTA tracking.
- Do not change layout, forms, redirects, or tracking field names in this rescue.

## Verification

- `npm run lint:content`
- `npm test`
- `npm run verify:release`
- rendered desktop and mobile review for the research route and `/property-management/`
- Claude Fable copy/truth review
- configured Codex autoreview
