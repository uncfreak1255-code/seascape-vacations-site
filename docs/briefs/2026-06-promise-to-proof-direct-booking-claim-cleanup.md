# Brief: Promise-To-Proof Direct Booking Claim Cleanup

## Content Gate Inputs

- persona: Gulf Coast guest comparing Seascape homes against Airbnb, VRBO, and beach-area alternatives before opening live booking dates.
- primary keyword: book direct Anna Maria Island vacation rentals
- secondary keywords: Bradenton vacation rentals near Anna Maria Island, direct booking vacation rentals Florida, Seascape Vacations direct booking
- audience pattern: fee-sensitive guest who needs direct-booking savings and location claims to be clear, current, and not overstated.
- proof source: `src/_data/site.json`, `src/_data/properties-fallback.json`, `src/_data/seoPages.json`, existing direct-booking copy at `/stays/book-direct-anna-maria-island/`, and the Promise-to-Proof loop reviewed on 2026-06-21.
- required internal links: /properties/, /guides/
- CTA target: keep direct booking and property browsing paths unchanged.
- anti-claims: no best-rate guarantee, no savings range above 10-15%, no claim that Bradenton/Sarasota homes are on Anna Maria Island, no direct-beach promise, no new review-count or demand claim.
- proof targets to preserve: /stays/book-direct-anna-maria-island/, /stays/bradenton-waterfront-vacation-rentals/

## Gate 0 Search Block

| Field | Value |
| --- | --- |
| Target query family | Direct-booking and near-AMI stay comparison queries. |
| Searcher intent | Guests are deciding whether to book direct with Seascape instead of paying marketplace checkout fees or choosing an on-island/beachfront rental. |
| Current Seascape URL | Existing homepage, guide CTAs, and stay-page data fields that mention direct-booking savings, best rates, or property location. |
| SERP observed date | 2026-06-21 |
| SERP stale after | 2026-06-28 |
| Current proof | Site-owned data supports `10-15%` direct-booking savings language and property truth says Seascape homes are in Bradenton and Sarasota near AMI, not on-island inventory unless a listing specifically says otherwise. |
| Top visible competitors | Airbnb, VRBO, and local vacation-rental manager pages. |
| Competitor angle | Competitors often emphasize broad inventory, beachfront access, and platform trust. Seascape should compete by being precise about fee savings and the near-AMI tradeoff. |
| Seascape gap | A few older public lines still used inflated savings ranges, guaranteed-best-rate language, or on-island/direct-beach wording that current property truth does not support. |
| Search fit | Keep the direct-booking message, but narrow it to supported fee language and property geography. |
| Local/GBP proof | Not applicable; this is public claim cleanup, not map-pack work. |
| AEO/readback note | AI answers should not quote the unsupported guarantee, inflated savings ranges, or on-island inventory wording. |
| Recommended action | Fix the riskiest unsupported promises first, then verify the content gate and homepage smoke assertions. |

## Source And Proof Constraints

- Supported direct-booking range: `10-15%` versus marketplace checkout, stated as typical or tied to platform fees.
- Supported geography: homes are in Bradenton and Sarasota, near Anna Maria Island, Siesta Key, and Lido Key beaches.
- Supported amenity/location wording: one canal-front private-dock home, private-pool homes, hot tubs/spas as listed in property truth.

## Release Gate Checklist

- source files likely to change:
  - `src/index.njk`
  - `src/_data/seoPages.json`
  - affected static guide CTAs
  - `scripts/recovery/assert-live-smoke.js`
- routes to smoke test:
  - `/`
  - representative affected guide pages
  - representative affected stay pages
- commands to run:
  - direct claim scan for inflated savings and guarantee language
  - `npm run lint:content`
  - `npm run build`
- regression risks to watch: over-softening the direct-booking CTA, breaking one-line static guide markup, or leaving the homepage smoke assertion stale.

## Done When

- no public source still says direct booking saves `10-20%`, `10–20%`, `15-35%`, `15–35%`, `20-35%`, or `20–35%`.
- the homepage no longer promises best rates guaranteed.
- direct-beach/on-island wording touched in this batch is narrowed to current property truth.
- content lint and build pass.
