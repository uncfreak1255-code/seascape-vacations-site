# Brief: Winner Guide Transfer Follow-up

## Content Gate Inputs

- persona: Gulf Coast traveler who has compared two bases and is ready to narrow the stay search.
- primary keyword: Bradenton vs Sarasota vacation
- secondary keywords: Siesta Key vs Anna Maria Island for families, Bradenton vacation rentals near beaches, Anna Maria Island family vacation rentals, Siesta Key area vacation rentals
- audience pattern: organic comparison reader who reaches the verdict but does not move into a stay or booking action.
- proof source: read-only joined BigQuery GSC and GA4 report for 2026-06-14 through 2026-07-11, run from `seascape-analytics/scripts/weekly_search_operator_report.py`, plus the current source for both guide routes.
- required internal links: `/stays/bradenton-vacation-rentals-near-beaches/`, `/stays/anna-maria-island-vacation-rentals/`, `/stays/siesta-key-area-vacation-rentals/`
- CTA target: present the two relevant stay bases immediately after each comparison table using the existing `guide_book_direct_click` contract.
- anti-claims: no booking or revenue lift claim, no ranking or CTR lift claim, no current-rate claim, no inventory-count claim, no title or meta rewrite, and no new comparison route.

## Experiment And Readback Contract

- hypothesis: readers who have just compared the two destinations are more likely to choose a stay base when the next action appears directly after the comparison table instead of near the end of the guide.
- primary event: `guide_book_direct_click`
- guardrail event: `booking_engine_handoff`, route integrity, canonical integrity, JSON-LD validity, and the existing guide conversion kit.
- entry criteria: in the 2026-06-14 through 2026-07-11 joined read, `/guides/bradenton-vs-sarasota/` recorded `14` clicks, `3,045` impressions, `195` GA4 sessions, and zero guide, stay, or booking actions; `/guides/siesta-key-vs-anna-maria-island-families/` recorded `11` clicks, `2,993` impressions, `36` sessions, and the same zero-action result.
- readback window: first 7 complete days after deploy once GSC and GA4 both cover the full window.
- decision rule: judge each `guide_slug` separately. Keep when `guide_book_direct_click >= 1` without route, schema, content, or rank regression. Iterate once only when GA4 sessions remain `>= 20` and guide, stay, and booking actions all remain `0`.

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | `Bradenton vs Sarasota vacation`, `Siesta Key vs Anna Maria Island for families`, and the matching stay-base follow-up queries. |
| Searcher intent | Destination comparison feeding guest stay selection. |
| Current Seascape URL | `/guides/bradenton-vs-sarasota/` and `/guides/siesta-key-vs-anna-maria-island-families/`. |
| SERP observed date | 2026-06-26, inherited from the last comparison-guide review; no snippet change is in scope. |
| SERP stale after | 2026-07-03; the current decision comes from first-party transfer behavior, not a fresh competitor claim. |
| Current proof | The 2026-06-14 through 2026-07-11 joined read shows both pages in visible positions with zero measured guide, stay, or booking actions. Bradenton vs Sarasota averaged position `4.52`; the family guide averaged position `3.20`. |
| Top visible competitors | Prior review found Reddit and Facebook discussions, travel comparison blogs, TripAdvisor-style advice, and broad beach-choice roundups. This follow-up does not rely on a fresh competitor ranking. |
| Competitor angle | Beach feel, restaurants and nightlife, family fit, public access, and where-to-stay framing. |
| Seascape gap | Both pages answer the comparison, but the stay decision arrives too late or blends into longer editorial content. |
| Search fit | The existing guides remain the correct URLs. This is a transfer placement test, not a new page, title, meta description, or answer rewrite. |
| Local/GBP proof | Not a local-pack or GBP route. |
| AEO/readback note | Preserve the direct answer and comparison table. Put the stay choice after the table so it supports the answer instead of interrupting it. |
| Recommended action | Move one existing two-choice stay decision directly after each comparison table and preserve page-specific event labels. |

## Page Decisions

- Bradenton vs Sarasota: move the existing direct-book decision aside after the quick-comparison table. Keep only the Bradenton-near-AMI and Siesta-area choices in that block.
- Siesta vs AMI for families: replace the late rental list with a two-choice verdict card after the comparison table. Route calmer, island-first trips to AMI stays and Sarasota/Siesta-oriented trips to Siesta-area stays.
- Mobile behavior: reuse the current responsive surfaces, allow inline links to wrap naturally, and add no fixed-width control or new horizontal scroll region.
- CTA volume: move or replace existing decision content; do not add another conversion kit or a third post-table destination.

## Public Copy Guardrails

- Say what kind of trip each stay base fits.
- Use “compare homes” and “check dates” rather than analytics or funnel language.
- Keep rate, availability, and total-price language conditional because they vary by property and date.
- Do not imply that either destination always costs less or that booking direct guarantees a specific savings amount.

## Release Gate Checklist

- source files:
  - `src/guides/bradenton-vs-sarasota.html`
  - `src/guides/siesta-key-vs-anna-maria-island-families.html`
  - `scripts/enforcement/winner-guide-transfer-followup.test.js`
- route checks:
  - `/guides/bradenton-vs-sarasota/`
  - `/guides/siesta-key-vs-anna-maria-island-families/`
- commands:
  - `node --test scripts/enforcement/winner-guide-transfer-followup.test.js`
  - `npm run lint:content`
  - `npm run build`
  - `npm run verify:links`
  - `npm run verify:jsonld`
  - `npm run verify:redirects`
  - `npm test`
  - `npm run verify:release`
- visual proof: desktop and Pixel 5 full-page screenshots for both routes, with the post-table decision visible and no overflow or duplicate CTA section.

## Done When

- each guide has exactly one marked post-table stay decision with two complete tracked payloads
- the redundant late family-rental list is removed
- the current guide conversion kits remain intact
- focused, content, build, link, schema, redirect, release, and visual gates pass
- the change is committed locally for Sawyer's screenshot review before any push or PR
