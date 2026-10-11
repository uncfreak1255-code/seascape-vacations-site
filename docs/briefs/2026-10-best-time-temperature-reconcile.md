# Brief: Best-time guide temperature reconcile

- lifecycle: active
- task scope: reconcile every temperature figure on `/guides/best-time-visit-anna-maria-island/` with the NOAA normals already published on `/guides/anna-maria-island-weather/`, complete the monthly table to 12 months with a source note, and align the water FAQ answer (visible text and FAQPage JSON-LD). No new page, no layout change.
- completion or successor: not complete; record the merged PR here when it lands.

## Content Gate Inputs

- persona: traveler asking when to visit Anna Maria Island who wants warm water, manageable crowds and a fair rate.
- primary keyword: best time to visit Anna Maria Island
- secondary keywords: Anna Maria Island weather by month, Anna Maria Island water temperature
- audience pattern: reader scans the quick answer, the month list and the table; numbers must agree across them.
- proof source: `src/guides/anna-maria-island-weather.html` table (NOAA 1991–2020 normals, Sarasota-Bradenton Airport USW00012871; water proxy NOAA station 8726384 at Port Manatee). Rate and crowd labels: `seascape-hub/context/seasonal-patterns.md` season definitions (Peak Feb–Mar; High Dec–Jan, Apr, Jun–Jul; Shoulder May, Aug, Nov; Off Sep–Oct) at hub main 0d77fea3.
- required internal links: /guides/anna-maria-island-weather/ (added in the table source note), /stays/anna-maria-island-vacation-rentals/ (existing, kept)
- CTA target: existing booking kit, unchanged.
- anti-claims: no ranking, citation or conversion lift claim. No ADR or occupancy figure. No new amenity or capacity claim. No vendor names.

## Why This Batch

- Before: the 12-month list, the 6-row table, the prose and the FAQ gave different numbers for the same month (May high 85°F in the list and 88°F in the table; November high 78°F against 80.0°F in NOAA normals; water 65°F in January against a 62.7°F proxy). None of the numbers had a source on the page.
- After: every temperature on the page matches the NOAA normals on the weather guide, rounded to whole degrees in prose and shown to one decimal in the table; the table lists all 12 months; a source note names the stations.
- Waits: the 12-month tiles figure (variant C, picked by Sawyer 2026-10-11) is a separate PR after this one merges. Rain wording ("virtually no rain" in November; the dry January note) and the "Peak Season: December Through April" heading are left as written and flagged in the PR.

## Experiment And Readback Contract

- hypothesis: none. This is a data-accuracy repair, not an experiment. No lift is claimed.
- primary event: not applicable
- guardrail event: `guide_book_direct_click` on this route must not fall below its current 30-day count
- entry criteria: Sawyer said yes to preparing this table fix (2026-10-11)
- readback window: 30 days from deploy, guardrail only
- decision rule: keep unless the guardrail event falls; then restore the prior table and investigate

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | Best time to visit Anna Maria Island; Anna Maria Island weather by month and water temperature. |
| Searcher intent | Pick travel months using heat, water and crowds. |
| Current Seascape URL | /guides/best-time-visit-anna-maria-island/ |
| SERP observed date | 2026-10-11 |
| SERP stale after | 2026-10-18 |
| Current proof | Source inspection at origin/main 3254f9d: the guide's list, table and FAQ disagree with each other and with the weather guide. Earlier note (2026-10-04) found the guide absent from a nine-result public sample. Result order is not a measured rank. |
| Top visible competitors | islaguru.com best-time article, islandreal.com weather page, wander.com season guide, in an unlocated public search sample. |
| Competitor angle | Season-by-season and month-by-month lists. |
| Visual/format gap | Not inspected beyond titles in this pass. No format change is made here. |
| Seascape gap | Numbers that disagree on the same page weaken a page meant to be quoted. Seascape's sourced normals live on a sibling guide and are not used here. |
| Search fit | Keeps the winner guide consistent with its sibling. No new page. |
| Local/GBP proof | Not applicable. |
| AEO/readback note | No citation-lift claim. Read back live AI answers later through OpenSEO on Sawyer's Mac. |
| Recommendation | Reconcile the numbers; ship the tiles figure separately. |
| Attack status | none found after named checks |
| Query variants inspected | best time to visit Anna Maria Island month by month weather water temperature |
| SERP source | WebSearch standard snapshot on 2026-10-11, no location control. Many results were scraper domains and are ignored. |
| Competitor URLs inspected | none opened in this pass; titles and domains from the search snapshot only. Named failed check: no page fetch was run because this change adds no new claim and no format. |
| Content gap and Seascape answer | Seascape answers with sourced normals and a stated proxy station. |
| Design/format strategy | No visible layout change. Table gains six rows and a one-line source note. |
| Seascape proof available | Weather guide NOAA table; Hub season definitions. |
| Tools/plugins used | WebSearch, source inspection. No paid tool. |
| Decision and reason | Ship. It is small, reversible and uses figures already published on the site. |

## Cluster In Scope

- canonical winner URL: /guides/best-time-visit-anna-maria-island/
- feeder page for the source: /guides/anna-maria-island-weather/ (read only)
- aliases or retired URLs: none changed
- money destination: existing booking kit and /stays/anna-maria-island-vacation-rentals/

## Source Files Changed

- src/guides/best-time-visit-anna-maria-island.html
