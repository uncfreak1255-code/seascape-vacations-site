# Brief: Best-time guide twelve-month tiles

- lifecycle: active
- task scope: add one build-time HTML figure (twelve month tiles: normal high and the table's own crowd label; May and November marked "Best balance", as the page's TL;DR already says) directly under the TL;DR on `/guides/best-time-visit-anna-maria-island/`. Uses only values already in that page's table. No new fact, no copy change outside the figure caption, no schema change, no date change (dateModified and "Updated July 2026" stay).
- completion or successor: not complete; record the merged PR here when it lands. Successor to the table fix in #710 and sibling of the weather strip (#720).

## Content Gate Inputs

- persona: traveler choosing a month who wants warmth and crowds in one look before reading the table.
- primary keyword: best time to visit Anna Maria Island
- secondary keywords: Anna Maria Island crowds by month, Anna Maria Island temperature by month
- audience pattern: reader scans the quick answer, then wants to compare months; the table needs horizontal scrolling on a phone, the tiles do not.
- proof source: the table on the same page (the 12-row month table, normal high and crowd columns). The tiles repeat them unchanged. The Crowds column is our read and is labeled as such; it is not yet checked against the Hub.
- required internal links: /guides/anna-maria-island-weather/, /stays/anna-maria-island-vacation-rentals/
- CTA target: existing page CTA, unchanged.
- anti-claims: no ranking, citation or conversion lift claim. No new number, threshold or season label. No vendor names.

## Why This Batch

- Before: the guide has a twelve-row table and no figure; on a phone the table scrolls sideways.
- After: one figure under the TL;DR shows high and crowd note for all twelve months in a 3-column grid on phones and 6 columns on wider screens, with the table kept as the data source.
- Direction: Sawyer picked variant C, tiles, on 2026-10-11.
- Waits: no further figures on this guide; no copy edits; Crowds/Rates Hub check stays a separate open item.

## Experiment And Readback Contract

- hypothesis: none. A format change, no lift is claimed.
- primary event: not applicable
- guardrail event: `guide_book_direct_click` on this route must not fall below its current 30-day count
- entry criteria: Sawyer picked variant C (2026-10-11) and chose "Best-time only" build on 2026-10-19
- readback window: 30 days from deploy, guardrail only
- decision rule: keep unless the guardrail event falls; then remove the figure and investigate

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | Best time to visit Anna Maria Island, month by month. |
| Searcher intent | Pick a month balancing warmth, crowds and value. |
| Current Seascape URL | /guides/best-time-visit-anna-maria-island/ |
| SERP observed date | 2026-10-19 |
| SERP stale after | 2026-10-26 |
| Current proof | Source inspection at origin/main: twelve-row table, no figure. Result order is not a measured rank. |
| Top visible competitors | islaguru.com best-time article, islandreal.com weather page, wander.com season guide, in an unlocated public search sample. No ranking claim. |
| Competitor angle | islaguru.com: month-by-month text list. islandreal.com: one normals table. |
| Visual/format gap | Neither fetched page has a chart or tile figure (re-fetched 2026-10-19). |
| Seascape gap | The table is the only way to compare months and it scrolls sideways on phones. |
| Search fit | Same page, same answer; the figure puts the May and November answer in one look. |
| Local/GBP proof | Not applicable. |
| AEO/readback note | No citation-lift claim. Read back live AI answers later through OpenSEO on Sawyer's Mac. |
| Recommendation | Ship the tiles as a draft PR. |
| Attack status | completed |
| Query variants inspected | best time to visit Anna Maria Island month by month weather water temperature |
| SERP source | WebSearch standard snapshot on 2026-10-19, no location control. |
| Competitor URLs inspected | https://www.islandreal.com/blog/anna-maria-island-weather/ ; https://islaguru.com/articles/best-time-visit-anna-maria-island (both fetched 2026-10-19) |
| Content gap and Seascape answer | A month-by-month tile view with the best-balance months marked, which neither competitor gives. |
| Design/format strategy | DESIGN.md Guide figures rule: one figure, under the answer, build-time HTML, table kept, Waterline colors, readable at 360/375/393px. |
| Seascape proof available | The page's own NOAA table. |
| Tools/plugins used | Source inspection, Playwright screenshots. No paid tool. |
| Decision and reason | Ship. Small, reversible, no new fact. |

## Cluster In Scope

- canonical winner URL: /guides/best-time-visit-anna-maria-island/
- feeder pages: none changed
- aliases or retired URLs: none
- money destination: existing page CTA, unchanged

## Source Files Changed

- src/guides/best-time-visit-anna-maria-island.html

## Not In Scope

- the weather guide, other guides, schema, dates, or table values
