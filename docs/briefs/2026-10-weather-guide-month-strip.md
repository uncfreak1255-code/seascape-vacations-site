# Brief: Weather guide twelve-month strip

- lifecycle: active
- task scope: add one build-time HTML figure (two-row heat map: normal high shaded by heat, rain days shaded clay by wetness) directly under the quick answer on `/guides/anna-maria-island-weather/`. Uses only the numbers already in that page's table. No new fact, no copy change outside the figure caption, no schema change, no date change.
- completion or successor: not complete; record the merged PR here when it lands.

## Content Gate Inputs

- persona: traveler choosing a month who wants the pattern of heat and rain in one look before reading the table.
- primary keyword: Anna Maria Island weather by month
- secondary keywords: Anna Maria Island rainy season, Anna Maria Island temperature by month
- audience pattern: reader scans the quick answer, then wants to compare months; the table needs horizontal scrolling on a phone, the strip does not.
- proof source: the table on the same page (NOAA 1991–2020 normals, Sarasota-Bradenton Airport USW00012871). The strip repeats its normal high and rain-day columns unchanged.
- required internal links: /guides/best-time-visit-anna-maria-island/, /stays/anna-maria-island-vacation-rentals/
- CTA target: existing page CTA, unchanged.
- anti-claims: no ranking, citation or conversion lift claim. No new number, threshold or season label. No vendor names.

## Why This Batch

- Before: the guide has a twelve-row table and no figure; on a phone the table scrolls sideways.
- After: one figure under the answer shows heat and rain days for all twelve months in a 4-by-3 grid on phones and one row of twelve on desktop, with the table kept as the data source.
- Direction: Sawyer picked the two-row heat map ("b") from three rendered mocks on 2026-10-13.
- Waits: no further figures on this guide; no copy edits; the best-time guide is a separate scope.

## Experiment And Readback Contract

- hypothesis: none. A format change, no lift is claimed.
- primary event: not applicable
- guardrail event: `guide_book_direct_click` on this route must not fall below its current 30-day count
- entry criteria: Sawyer picked variant B (2026-10-13)
- readback window: 30 days from deploy, guardrail only
- decision rule: keep unless the guardrail event falls; then remove the figure and investigate

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | Anna Maria Island weather by month and rainy season. |
| Searcher intent | See which months are hot or wet before choosing dates. |
| Current Seascape URL | /guides/anna-maria-island-weather/ |
| SERP observed date | 2026-10-11 |
| SERP stale after | 2026-10-18 |
| Current proof | Source inspection at origin/main: sourced twelve-row table, no figure. Result order is not a measured rank. |
| Top visible competitors | islandreal.com weather page, islaguru.com best-time article, wander.com season guide, in an unlocated public search sample. No ranking claim. |
| Competitor angle | islandreal.com: one NOAA normals table with a FAQ. islaguru.com: month list with seasonal ranges. |
| Visual/format gap | Neither fetched page has a chart or heat map; one has a sourced table. |
| Seascape gap | The sourced table is the only way to compare months and it scrolls sideways on phones. |
| Search fit | Same page, same answer; the figure makes the pattern quotable at a glance. |
| Local/GBP proof | Not applicable. |
| AEO/readback note | No citation-lift claim. Read back live AI answers later through OpenSEO on Sawyer's Mac. |
| Recommendation | Ship the strip. |
| Attack status | completed |
| Query variants inspected | best time to visit Anna Maria Island month by month weather water temperature |
| SERP source | WebSearch standard snapshot on 2026-10-11, no location control (recorded in the best-time temperature brief). |
| Competitor URLs inspected | https://www.islandreal.com/blog/anna-maria-island-weather/ ; https://islaguru.com/articles/best-time-visit-anna-maria-island (both fetched 2026-10-11) |
| Content gap and Seascape answer | A heat-and-rain view on a sourced table, which neither competitor gives. |
| Design/format strategy | DESIGN.md Guide figures rule: one figure, under the answer, build-time HTML, table kept, Waterline colors, readable at 360/375/393px. |
| Seascape proof available | The page's own NOAA table. |
| Tools/plugins used | Source inspection, Playwright screenshots. No paid tool. |
| Decision and reason | Ship. Small, reversible, no new fact. |

## Cluster In Scope

- canonical winner URL: /guides/anna-maria-island-weather/
- feeder pages: none changed
- aliases or retired URLs: none
- money destination: existing page CTA, unchanged

## Source Files Changed

- src/guides/anna-maria-island-weather.html

## Not In Scope

- the best-time guide, other guides, schema, dates, or table values
