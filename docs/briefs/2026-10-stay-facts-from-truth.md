# Brief: Stay facts resolve from property truth

- lifecycle: active
- task scope: bind stay-page capacity, heat, and home-count copy to `properties.js` / catalog tokens so a catalog change cannot leave hand-typed sleeps, heat-included, or home-count claims behind
- completion or successor: stacked with fail-closed contract; do not merge until Sawyer merges the stack

## Content Gate Inputs

- persona: guest comparing a stay lander who will repeat the first capacity, heat, or home-count sentence they see
- primary keyword: none (catalog-truth hygiene, not a search play)
- secondary keywords: none
- audience pattern: a guest or assistant quotes the stay lander’s occupancy, heat, or home-count line as current inventory
- proof source: live catalog at https://seascape-vacations.com/properties/ and stay landers under https://seascape-vacations.com/stays/ on 2026-10-17; fallback catalog in `src/_data/properties-fallback.json`; current `docs/status/next-batch.md` is fresh but below threshold as of 2026-10-12
- offer claim: n/a (guest-lane fact binding; no owner-offer line)
- required internal links: /properties/, /stays/
- CTA target: unchanged
- anti-claims: do not invent equipment, waterfront spread, or sleeping capacity; do not publish hot-tub heat included from `guestFacts.poolHeat`; do not keep a 4-bedroom range sourced from a 3-bedroom home; do not invent a new rate or direct-booking savings percent
- hypothesis: hand-typed stay facts drift when catalog numbers move; tokens that read the matching list and each home’s own row keep public copy aligned
- primary event: property_booking_page_click
- guardrail event: email_capture_submit
- entry criteria: stay JSON still contained typed sleeps, heat, and home-count facts that the catalog already owns
- readback window: after the tokenized copy is on a deploy preview, compare each changed stay path to production
- decision rule: ship only if every stay fact token resolves from catalog or matchingProperties and heat stays noncommittal without a dedicated tub-heat fact

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | 4 bedroom vacation rentals Florida; vacation rentals sleeps 12 Florida; Bradenton waterfront vacation rentals |
| Searcher intent | stay / direct-book comparison |
| Current Seascape URL | /stays/4-bedroom-vacation-rentals-florida/, /stays/vacation-rentals-sleeps-12-florida/, /stays/bradenton-waterfront-vacation-rentals/, /stays/ |
| SERP observed date | 2026-10-17 |
| SERP stale after | 2026-10-24 |
| Current proof | docs/status/next-batch.md reread on 2026-10-12 is fresh but below threshold (requested window 2026-10-03 to 2026-10-09; BigQuery GSC data_date 2026-10-09). This edit uses live catalog and live stay-page readback, not an impact claim. Live https://seascape-vacations.com/properties/ lists the current homes. Live stay landers still contain typed occupancy and heat sentences that the catalog already owns. |
| Top visible competitors | No competitor rewrite. This batch only binds existing stay copy to property truth. |
| Competitor angle | Local managers publish current occupancy and amenity terms on stay and listing pages. The gap here is Seascape stay JSON that can drift from the catalog. |
| Visual/format gap | None required. Keep existing stay templates and only replace typed facts with tokens. |
| Seascape gap | Stay JSON can still type sleeps, heat-included, and home-count claims. A catalog change then leaves public copy behind, including a 4-bedroom FAQ sourced from a 3-bedroom home and heat-included claims inferred from pool heat. |
| Search fit | Keep the existing stay URLs. Bind capacity, heat, and home-count sentences to catalog rows and each page’s matching list. Leave titles and layout alone except where a typed fact sat in a title token. Conversion stays on /properties/. Do not open a new page. |
| Local/GBP proof | Not applicable: organic stay-copy truth correction, no local-pack or GBP claim. |
| AEO/readback note | No AI citation-lift claim. Readback is only that preview stay paths stop publishing typed sleeps/heat/home-count facts the catalog does not own. |
| Recommendation | keep the existing stay landers: replace typed facts with catalog tokens, derive matching occupancy from the page list, and keep hot-tub heat noncommittal unless a dedicated tub-heat fact exists. |
| Attack status | none found after named checks |
| Query variants inspected | 4 bedroom vacation rentals Florida; vacation rentals that sleep 12 Florida; Bradenton waterfront vacation rentals; Florida vacation rentals with pool and hot tub |
| SERP source | Public stay-page and catalog reads on 2026-10-17; next-batch.md 2026-10-12 freshness receipt. Not a location-controlled rank report. |
| Competitor URLs inspected | source check: live catalog https://seascape-vacations.com/properties/ and stay paths under https://seascape-vacations.com/stays/ on 2026-10-17; SERP check: no DataForSEO or public SERP action because next-batch.md is fresh but below threshold on 2026-10-12; competitor-page check: no competitor page rewrite, this batch only binds stay tokens to property truth |
| Content gap and Seascape answer | Stay landers must repeat the catalog’s current occupancy and must not invent hot-tub heat from pool-heat text. Answer: tokens from each home row, matching-list occupancy, and noncommittal heat unless `guestFacts.tubHeat` says included. |
| Design/format strategy | Text-only token replacement inside existing stay JSON and the stay template occupancy fields. No new visual pattern. |
| Seascape proof available | Live catalog on 2026-10-17. Fallback rows in `src/_data/properties-fallback.json`. Replay tests for #638 capacity drift and #700 heat/tub inheritance. |
| Tools/plugins used | Public live page reads on 2026-10-17; docs/status/next-batch.md 2026-10-12 freshness receipt; local stay-facts-derived, property-truth, search-brief-gate, and verify:release. |
| Decision and reason | Ship the stay-fact binding on existing landers. next-batch.md remains below threshold, so this is catalog-truth hygiene, not a new SEO batch. |

## Why This Batch

- Stay JSON still typed sleeps, heat, and home-count facts the catalog already owns.
- A 4-bedroom FAQ sourced from Coastal Stay will publish a 3-bedroom occupancy.
- Hot-tub tokens must not inherit “heat included” from `guestFacts.poolHeat`.

## Source Files Changed In This Batch

### October 18 party-capacity correction

- Authorized scope: correct the FAQ on `/stays/bachelor-bachelorette-rentals-florida/` identified in PR #732 review discussion r4305171930 at `1bcdb3086d80e7f2aebe13959b292a3c7f6e0c24`.
- The recommendation FAQ names The Oasis and Sarasota Luxe; the property-card list contains only The Oasis. The capacity answer therefore names each recommended home and uses its own existing `{sleeps:slug}` token, rather than applying `{sleeps-matching}` to plural homes.
- Source receipt: October 18 fallback catalog has The Oasis at 16 overnight guests and Sarasota Luxe at 12. Local rendering of the original PR head confirms the misleading plural 16-guest answer in FAQPage JSON-LD.
- Keep `matchingProperties`, catalog facts, scanner, baseline allowances, titles, links and layout unchanged. Overnight capacities do not establish permission or capacity for events.
- Complete Draft the copy → Remove internal wording → Check voice and specificity for the replacement. Regression proof covers both named capacities and independent catalog changes, including Sarasota Luxe outside `matchingProperties`.
- Keep this correction coordinated with draft PR #732. Preserve the draft-stack merge hold, independent exact-head review and separate production-publication decision.
- scripts/enforcement/stay-party-capacity.test.js

- source files likely to change: `src/_data/seoPages.json`, `src/stays/stays.njk`
- src/_data/seoPages.json
- src/stays/stays.njk
- src/_data/stayFacts.js
- src/_data/stayNumberBaseline.json
- src/_data/staysPages.js
- docs/reviews/2026-10-stay-number-suspected-claims.md
- scripts/enforcement/stay-facts-derived.test.js
- scripts/enforcement/property-truth-invariants.test.js
