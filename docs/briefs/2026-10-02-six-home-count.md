# Brief: Current portfolio count is six

## Content Gate Inputs

- persona: guest or owner whose agent quotes a Seascape page as the current inventory
- primary keyword: none (truth correction, not a search play)
- secondary keywords: none
- audience pattern: an assistant repeats the first inventory sentence it finds, including a present-tense home count
- proof source: live catalog at https://seascape-vacations.com/properties/ on 2026-10-02, which says "6 homes" and lists Dockside Dreams, The Oasis, Sarasota Luxe, River House, Bradenton Pool Home, and Pickleball Pool Home Retreat; the same page says all have private pools and only Dockside Dreams is drawn as waterfront with a dock
- offer claim: n/a (guest-lane count correction; owner pages already say six)
- required internal links: /properties/, /guides/
- CTA target: unchanged
- anti-claims: do not change historical study denominators that correctly say five homes for June 2022 through March 2026; do not say every home is waterfront or has a dock; do not say two homes have docks; do not invent a new rate or a direct-booking savings percent
- hypothesis: a present-tense "manages 5" line is what an agent will repeat, so the measured page has to match the live catalog before any AI visibility check
- primary event: property_booking_page_click
- guardrail event: email_capture_submit
- entry criteria: flights, best-time, and restaurant guides plus two research bios still said the current portfolio is five on origin/main 06a08172
- readback window: after the corrected copy is on the production site, before the Prompt Explorer runs
- decision rule: run the two agent questions only after production no longer says Seascape currently manages five homes; do not treat a branch as the measured page

## Gate 0 Search Block

| Field | Answer |
| --- | --- |
| Target query family | flights to Anna Maria Island, airports for an AMI stay |
| Searcher intent | choose an airport, then a home; not a new ranking play |
| Current Seascape URL | /guides/flights-to-anna-maria-island/, /guides/bradenton-vs-sarasota-restaurants/, /research/gulf-coast-vacation-booking-trends-2026/, /research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026/ |
| SERP observed date | 2026-10-02 |
| SERP stale after | 2026-11-02 |
| Current proof | Search Console web report 2026-09-01 to 2026-09-29: flights guide 30 clicks, 3,940 impressions, position 6.1. Live catalog https://seascape-vacations.com/properties/ on 2026-10-02 says 6 homes. |
| Top visible competitors | Google Flights, annamaria.com, Expedia, Island Vacation Properties, Anna Maria Life Vacation Rentals, Kayak |
| Competitor angle | airport choice plus an on-island rental pitch |
| Visual/format gap | Not a layout change. The defect is a present-tense count, not a missing table or map. |
| Seascape gap | our own pages said the current portfolio is five homes |
| Search fit | keep the existing guide and research URLs; the conversion stays the six-home catalog |
| Local/GBP proof | Not a Google Business Profile edit. The false count is on guide and research copy, not a map pin. |
| AEO/readback note | An agent will repeat the first inventory sentence. Do not run Prompt Explorer until production says six. |
| Recommendation | correct the present-tense count in place; leave the 2022-2026 five-home study sample alone |
| Attack status | none found after named checks |
| Query variants inspected | flights to Anna Maria Island, nearest airport Anna Maria Island, cheap flights to Anna Maria Island |
| SERP source | web search results read 2026-10-02 |
| Competitor URLs inspected | current source https://seascape-vacations.com/properties/ read 2026-10-02; SERP web search results read 2026-10-02; competitor pages opened from those results: https://www.annamaria.com/news-and-blog/which-airport-is-nearest/ and https://www.islandvacationproperties.com/traveling-made-easy-with-these-airports-near-anna-maria-island/ |
| Content gap and Seascape answer | say six current homes, all with private pools, and name Dockside Dreams as the one with a dock |
| Design/format strategy | sentence edits only; no new section, table, or page |
| Seascape proof available | live catalog read 2026-10-02 and Search Console page row for the flights guide |
| Tools/plugins used | Search Console, web search, repository content gates |
| Decision and reason | ship the count correction now so an agent does not repeat five homes |

## Why This Batch

- The live catalog is six homes. Present-tense guide and bio lines still say five.
- The 2022-2026 booking studies stay at five homes. That was the sample, not the current portfolio.
- CTA lines that bundled "waterfront, pools, docks" onto the whole portfolio are rewritten in the same sentences. Only Dockside Dreams has the dock.

## Source Files Changed In This Batch

- src/guides/flights-to-anna-maria-island/index.html
- src/guides/bradenton-vs-sarasota-restaurants/index.html
- src/research/gulf-coast-vacation-booking-trends-2026.njk
- src/research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026.njk
- scripts/enforcement/property-truth-invariants.test.js
