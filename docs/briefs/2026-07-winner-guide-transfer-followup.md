# Brief: Winner Guide Transfer Follow-up

## Content Gate Inputs

- persona: Gulf Coast traveler who has compared two bases and is ready to narrow the stay search.
- primary keyword: Bradenton vs Sarasota vacation
- secondary keywords: Siesta Key vs Anna Maria Island for families, Bradenton vacation rentals near beaches, Anna Maria Island family vacation rentals, Siesta Key area vacation rentals
- audience pattern: organic comparison reader who reaches the verdict but does not move into a stay or booking action.
- proof source: read-only joined BigQuery GSC and GA4 report for 2026-06-14 through 2026-07-11, run from `seascape-analytics/scripts/weekly_search_operator_report.py`, plus the current source for both guide routes.
- required internal links: /stays/bradenton-vacation-rentals-near-beaches/, /stays/anna-maria-island-vacation-rentals/, /stays/siesta-key-area-vacation-rentals/
- CTA target: present the two relevant stay bases immediately after each comparison table using the existing `guide_book_direct_click` contract.
- anti-claims: no booking or revenue lift claim, no ranking or CTR lift claim, no current-rate claim, no inventory-count claim, no title or meta rewrite, and no new comparison route.

## Required Internal Link Map

- src/guides/bradenton-vs-sarasota.html: /stays/bradenton-vacation-rentals-near-beaches/, /stays/siesta-key-area-vacation-rentals/
- src/guides/siesta-key-vs-anna-maria-island-families.html: /stays/anna-maria-island-vacation-rentals/, /stays/siesta-key-area-vacation-rentals/

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
| SERP observed date | 2026-07-14 |
| SERP stale after | 2026-07-21 |
| Current proof | The 2026-06-14 through 2026-07-11 joined read shows both pages in visible positions with zero measured guide, stay, or booking actions. Bradenton vs Sarasota averaged position `4.52`; the family guide averaged position `3.20`. |
| Top visible competitors | MIDFLORIDA's Bradenton/Sarasota living comparison, AAA's Bradenton trip guide, Florida Vacation Advisor, Passage Key Dolphin Tours, Luxury Travel Diarie, TB Relo, and Reddit family beach discussions. |
| Competitor angle | Bradenton results lean toward relocation or separate city guides; AMI/Siesta results emphasize beach feel, family fit, crowds, activities, public access, and broad where-to-stay advice. |
| Visual/format gap | Competitors commonly use side-by-side tables and scannable verdict headings, but the inspected pages do not pair that decision point with two clear stay-collection actions. Seascape already has the comparison format and needs the stay handoff directly after it. |
| Seascape gap | Both pages answer the comparison, but the stay decision arrives too late or blends into longer editorial content. |
| Search fit | The existing guides remain the correct URLs. This is a transfer placement test, not a new page, title, meta description, or answer rewrite. |
| Local/GBP proof | Not a local-pack or GBP route. |
| AEO/readback note | Preserve the direct answer and comparison table. Put the stay choice after the table so it supports the answer instead of interrupting it. |
| Recommended action | Move one existing two-choice stay decision directly after each comparison table and preserve page-specific event labels. |
| Attack status | completed |
| Query variants inspected | `Bradenton vs Sarasota vacation which is better`, `Bradenton or Sarasota vacation`, `Siesta Key vs Anna Maria Island for families`, and `Anna Maria Island vs Siesta Key family vacation`. |
| SERP source | Read-only Codex web search on 2026-07-14 after Agent Reach's installed-backend check showed its Exa search backend was unavailable. |
| Competitor URLs inspected | https://www.midflorida.com/resources/insights-and-blogs/insights/mortgage/which-city-is-better-to-live-in-bradenton-or-sara ; https://www.aaa.com/tripcanvas/bradenton-fl ; https://floridavacationadvisor.com/siesta-key-vs-anna-maria-island/ ; https://www.passagekeydolphintours.com/blog/anna-maria-island-vs-siesta-key ; https://luxurytraveldiarie.com/siesta-key-vs-anna-maria/ |
| Content gap and Seascape answer | Seascape already has the stronger vacation-specific comparison answer. The missing piece is an immediate choice between the relevant stay collections, so no broad content or snippet rewrite is warranted. |
| Design/format strategy | Reuse the existing white decision aside on Bradenton and the existing gold verdict-card treatment on the family guide; place each directly after its table, keep two links, and add no shared component or CSS. |
| Seascape proof available | The dated 2026-06-14 through 2026-07-11 joined GSC/GA4 read shows `195` sessions on Bradenton and `36` on the family guide with zero guide, stay, or booking actions. |
| Tools/plugins used | Agent Reach backend doctor; attempted Agent Reach Exa command, which failed because `mcporter` is not installed; read-only Codex web search fallback; repo content, build, link, schema, redirect, event, accessibility, and release checks. No paid DataForSEO call. |
| Decision and reason | Execute the post-table transfer placement only. Seascape already surfaces for both query families and the first-party failure is downstream action, so changing titles, metadata, canonicals, schema, or the comparison answer would attack the wrong problem. |

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
