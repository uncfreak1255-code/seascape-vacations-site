# Brief: Guide CTR title and meta rescue

## Content Gate Inputs

- persona: Gulf Coast trip planner already seeing a Seascape weather, timing, or SRQ result on page one who needs a clearer snippet before clicking
- primary keyword: Anna Maria Island weather by month
- secondary keywords: best time to visit Anna Maria Island, SRQ airport to Anna Maria Island
- audience pattern: organic reader who already sees the existing guide URL but often skips it because the snippet still leads with format instead of the month, cost, or route answer
- proof source: `docs/status/next-batch.md` joined read for 2026-09-05 to 2026-09-11 (`guide_winners` 23 clicks / 3,202 impressions / 0.72% CTR / position 5.25). Page-level GSC from `docs/briefs/2026-08-search-content-rescue.md` for 2026-07-21 to 2026-08-17: weather 34/6,514/0.52%/7.09; best-time 57/8,277/0.69%/4.56; SRQ 17/4,843/0.35%/6.09. Live WebSearch SERP observed 2026-09-20.
- offer claim: n/a (guest lane)
- required internal links: /stays/anna-maria-island-vacation-rentals/, /guides/best-time-visit-anna-maria-island/
- CTA target: unchanged. Titles and meta descriptions only; keep every existing on-page CTA and event contract.
- anti-claims: no ranking or CTR lift claim, no new URL, no H1 change, no body rewrite, no owner or property-management page, no twin/alternate guide, no invented weather or transfer numbers

## Required Internal Link Map

- src/guides/anna-maria-island-weather.html: /stays/anna-maria-island-vacation-rentals/, /guides/best-time-visit-anna-maria-island/
- src/guides/best-time-visit-anna-maria-island.html: /stays/anna-maria-island-vacation-rentals/, /stays/anna-maria-island-beachfront-rentals/
- src/guides/srq-airport-to-anna-maria-island.html: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/

These are links each page already carries. This batch does not add or remove internal links.

## Why This Batch

- what changed in the data: OpenSEO ranks are climbing on these intents while GSC CTR on the same pages often sits under 2%, including the 0.52% / 0.69% / 0.35% page-level window above.
- why this cluster wins now: the three URLs already rank and already hold the month, crowd, water, time, cost, and bridge answers. This is snippet framing, not a new batch.
- what should explicitly wait: owner, stay, and new-guide expansion remain below the next-batch threshold. Do not add twin weather, timing, or airport pages.

## Experiment And Readback Contract

- hypothesis: titles and metas that name the month, cost, or route answer already on the page will raise CTR on impressions these URLs already have.
- primary event: GSC CTR per URL for the three routes
- guardrail event: average position per URL; revert a single snippet if position drops by 1.0 or more after a complete comparable window
- entry criteria: `docs/status/next-batch.md` is `fresh but below threshold` on 2026-09-13, so expansion is closed and this stays a bounded snippet rescue on existing winners
- readback window: first full 28-day GSC window after deploy, compared with 2026-07-21 to 2026-08-17
- decision rule: keep a URL when CTR rises without average position degrading by 1.0 or more; revert that URL's title and meta if CTR falls or position drops

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | Anna Maria Island weather by month, best time to visit Anna Maria Island, SRQ airport to Anna Maria Island |
| Searcher intent | guide/research |
| Current Seascape URL | `/guides/anna-maria-island-weather/`, `/guides/best-time-visit-anna-maria-island/`, `/guides/srq-airport-to-anna-maria-island/` |
| SERP observed date | 2026-09-20 |
| SERP stale after | 2026-09-27 |
| Current proof | Joined `guide_winners` read 2026-09-05 to 2026-09-11: 23/3,202/0.72%/5.25. Page-level GSC 2026-07-21 to 2026-08-17: weather 34/6,514/0.52%/7.09; best-time 57/8,277/0.69%/4.56; SRQ 17/4,843/0.35%/6.09. Live WebSearch on 2026-09-20 returned all three Seascape URLs. |
| Top visible competitors | Weather: timeanddate.com, historicalclimate.com, climate-data.org. Best-time: floridavacationhomes.com, islandvacationproperties.com, staywithstay.com. SRQ: amitransportation.com, rome2rio.com, conciergeami.com. |
| Competitor angle | Climate tables, month-by-month travel guides, and time/cost/route transfer pages. Data sites lead with temps and rain; transfer pages lead with minutes and dollars. |
| Visual/format gap | None. No layout change. The pages already have monthly tables, season sections, and transfer comparison. |
| Seascape gap | Snippets still understate the month, cost, and bridge answers the pages already publish, so CTR stays weak while ranks hold. |
| Search fit | Existing URLs already rank for the query family and already convert to stay CTAs. Title and meta only. |
| Local/GBP proof | Not a GBP or local-pack action. These are informational weather, timing, and transfer queries; the 2026-09-20 WebSearch results showed organic guides and climate/transport pages, not a map pack. |
| AEO/readback note | Not a separate AI-answer audit. Title and meta work is for the organic snippet only and restates answers already on the page. |
| Recommendation | improve titles and matching meta descriptions on the three existing guide URLs; do not change H1s, body copy, or add pages |
| Attack status | completed |
| Query variants inspected | Anna Maria Island weather by month; best time to visit Anna Maria Island; SRQ airport to Anna Maria Island |
| SERP source | Cursor WebSearch live Google-shaped results observed 2026-09-20 |
| Competitor URLs inspected | https://www.timeanddate.com/weather/@4146082/climate, https://www.islandvacationproperties.com/when-is-the-best-time-to-visit-anna-maria-island-fl/, https://www.rome2rio.com/s/Sarasota-Bradenton-Airport-SRQ/Anna-Maria-Island |
| Content gap and Seascape answer | No new content needed. Weather already publishes NOAA highs, lows, rain days, and Gulf water temps. Best-time already names May and November as the balance months. SRQ already covers drive time, rental vs rideshare, and bridge choice by town. |
| Design/format strategy | Unchanged. Metadata only. |
| Seascape proof available | Current source pages plus the dated GSC windows named above. Every rewritten claim is already on the page. |
| Tools/plugins used | Repo source inspection, `docs/status/next-batch.md`, and Cursor WebSearch on 2026-09-20 |
| Decision and reason | Ship title and meta only on three already-ranking guides. `docs/status/next-batch.md` is fresh but below threshold, so this is a bounded snippet rescue, not expansion. |

## Source Files Changed In This Batch

  - src/guides/anna-maria-island-weather.html
  - src/guides/best-time-visit-anna-maria-island.html
  - src/guides/srq-airport-to-anna-maria-island.html

## Not In Scope

- new URLs or twin/alternate guides
- H1, body, image, or schema headline edits
- owner or property-management pages
- impact claims before the post-deploy GSC window closes
