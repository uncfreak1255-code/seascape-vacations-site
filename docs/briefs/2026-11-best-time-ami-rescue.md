# Brief: Best-time AMI guide click-decline rescue (2026-11-12)

- lifecycle: active
- task scope: Rescue the existing guide `/guides/best-time-visit-anna-maria-island/` under `docs/process/ranking-regression-rescue.md`, opened from the 2026-11-09 `docs/status/next-batch.md` read (window 2026-11-01 to 2026-11-07), which names this page the primary money-guide rescue. Sawyer approved finishing the brief on 2026-11-12 and the paid Gate 0 SERP on 2026-11-17. The implementation scope is one honest freshness correction plus title and description changes that state the page's existing month answer.
- completion or successor: implementation is in progress. Gate 0 completed 2026-11-17 from the approved local OpenSEO run. Earlier best-time briefs (`2026-07-best-time-guide-transfer-fix.md`, `2026-10-best-time-month-tiles.md`, `2026-10-best-time-rain-and-stone-crab.md`, `2026-10-best-time-temperature-reconcile.md`) cover past scoped changes; this brief does not reopen them.

## Content Gate Inputs

- persona: a traveler who has picked Anna Maria Island and is choosing a month, often comparing weather, crowds and price before looking at homes
- primary keyword: best time to visit anna maria island
- secondary keywords: best time to go to anna maria island; when is the best time to visit anna maria island; best time of year to visit anna maria island; anna maria island best time to visit
- audience pattern: reads the answer in the snippet or AI Overview first; clicks when the snippet promises a month-level answer it can trust for this year
- proof source: Search Console and GA4 through OpenSEO free reads, 2026-11-12; Search Console and URL inspection free reads, 2026-11-17; saved OpenSEO rank tracker (mobile, last full read of the head term 2026-11-05); approved local OpenSEO Gate 0 SERP report `14e1e432-1117-4898-a139-dbea8f845c8e`; repo source of the guide at `origin/main` `1c7188a5`
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/anna-maria-island-beachfront-rentals/, /guides/anna-maria-island-weather/
- CTA target: the existing stay box (`src/_data/guideStayHere.json` entry, currently The Oasis) and the existing `guide_book_direct_click` links; no CTA change
- anti-claims: no managed home placed on Anna Maria Island (none is); no claim that pool heat is never included (Coastal Stay pool heat is included as of Sawyer 2026-11-11); no traffic, ranking or booking lift claimed before readback; no "best" price or "cheapest" claim without current quotes

## Why This Batch

- What changed: Search Console, page-level, 2026-11-01 to 2026-11-07 vs 2026-10-25 to 2026-10-31: clicks 28 to 11 (−61%), impressions 1,349 to 1,166, daily average position 4.4–5.0 to 4.5–5.6. The named query family slipped: "best time to visit anna maria island" went from position 1.4 (43 impressions, 5 clicks) to 3.4 (25 impressions, 0 clicks); the family as a whole (13 query rows containing "best time") went from about 108 impressions / 6 clicks to about 99 impressions / 2 clicks, with every row moving from roughly 1–2 to roughly 3. Impressions held; position and CTR fell.
- Most clicks sit in anonymized queries: named query rows explain 7 of 28 prior-week clicks and 2 of 11 this week. The family slip is the clearest named cause, not the whole loss.
- Why now: it is the first page in the 2026-11-09 next move, and the page is otherwise healthy (indexed, canonical matched, crawled 2026-11-08), so the loss is a SERP-position and snippet problem, not an index problem.
- What waits: AMI vs Siesta Key snippet CTR (second, its own brief); the stay-box home (The Oasis stays until the event window that started 2026-11-10 has two weeks, i.e. no change before 2026-11-24); any expansion.

## Experiment And Readback Contract

- hypothesis: once a live Google SERP shows who now holds positions 1–2 and why, one small honest change (candidate: accurate freshness signal plus a snippet that states the month answer) recovers the head-term position or CTR without new claims
- primary event: Search Console clicks for the "best time" query family on this URL
- guardrail event: `guide_book_direct_click` and stay-box clicks on this route (analytics receipt), and average position of the family
- entry criteria: every Gate 0 row filled from a dated Google SERP; content gate passed; `npm run lint:content` and `npm run build` green
- readback window: first 7 complete days after production publish, then the 28-day settle window in `docs/status/page-ledger.json`
- decision rule: Search Console position is lower-is-better. Revert if the family's average position is worse than 4 (numerically > 4) over the first 7 complete days after publish; keep if family clicks recover to at least the 2026-10-25 to 2026-10-31 level (6) with average position 2.5 or better (numerically <= 2.5); otherwise record `insufficient evidence`

## Gate 0 Search And Attack Receipt

Evidence read 2026-11-12 (all free): OpenSEO `get_search_console_performance` (page, query, date, device), `inspect_urls`, `get_rank_tracker`, `get_google_analytics_organic_landing_pages`; WebSearch and WebFetch of four competitor pages. Gate 0 completed 2026-11-17 with Sawyer's approved local OpenSEO `get_serp_results` run for the two head terms, US/en, desktop and mobile, depth 20. The private saved report is `Best-time AMI Gate 0 SERP — Nov 17, 2026` (`14e1e432-1117-4898-a139-dbea8f845c8e`); estimated cost was about 20 credits, approximately $0.02, and actual provider charge was not exposed.

| Field | Answer |
| --- | --- |
| Target query family | "best time to visit anna maria island", "best time to go to anna maria island", "when is the best time to visit anna maria island", "best time of year to visit anna maria island", "anna maria island best time to visit", plus the "florida" variants |
| Searcher intent | Guide/research with downstream guest booking (choosing a month before choosing a home) |
| Current Seascape URL | `/guides/best-time-visit-anna-maria-island/` |
| SERP observed date | 2026-11-17 |
| SERP stale after | 2026-11-24 |
| Current proof | Search Console 2026-11-01 to 11-07 (read 2026-11-12): 11 clicks, 1,166 impressions, daily average position 4.5–5.6 (Nov 9 digest: 28 to 11, −61%, position about 5.0). Free GSC read 2026-11-08 to 11-16: this page drew about 165–197 impressions and 1–6 clicks per day at position 4.4–6.2; the head-term family was position 1.0–1.5 on desktop with 0 clicks and 2.9–5.3 on mobile. `best time to visit anna maria island` on mobile had 37 impressions, 2 clicks and position 5.3. URL inspection 2026-11-17: indexed, last crawl 2026-11-14, Google canonical matched the declared canonical. |
| Top visible competitors | Across the four 2026-11-17 Google SERPs: Tripadvisor forum threads, including `Best time to visit island in 2027?` (desktop organic #1); franmaxonrealestate.com fall post (mobile organic #1); annamarialifevacationrentals.com off-season post; national-park.com weather-by-month; amivacationrental.com summer post; seabreezevacation.com fall post dated 2026-09-15; florida-dreams.com weather; agentsgather.com dated 2026-02-04; crabbyjoescartrentals.com month-by-month; amilocals.com fall/winter; and everydayfamilytravel.blog. |
| Competitor angle | Season-framed answers dominate: fall, off-season, summer, fall/winter and weather by month. Forum freshness and a 2027 question hook also win prominent organic placement; several editorial results carry visible 2026 dates. |
| Visual/format gap | None of the four pages read uses a table, chart or month grid; Seascape already has twelve month tiles and a month list. Skip: no new visual format is needed. |
| Seascape gap | (1) Freshness: Article `dateModified` is 2026-07-28 and the visible line says July 2026, though git history verifies the last substantive content change on 2026-10-22 (#767, corrected November rain and stone-crab month). (2) Snippet: the title "Best Time to Visit Anna Maria Island (Month-by-Month)" does not name the answer months. Seascape's existing answer is more specific: May and November for balance; March–April for certainty; September–October only if flexible. **Inference:** national blue-link absence plus GSC position near 1 on desktop with 0 clicks fits an AI Overview citation rather than an organic top-three rank. |
| Search fit | Keep and rescue this URL: it already ranks for the family, matches the intent, and feeds the stay box and `guide_book_direct_click`. No new page. |
| Local/GBP proof | Not applicable to this guide query. Three SERPs had no map feature; mobile "best time to go" showed a map, but the dominant intent remained editorial guidance through AI Overview, People Also Ask and organic results. |
| AEO/readback note | AI Overview appeared first on all four 2026-11-17 SERPs. OpenSEO has no saved baseline AI-visibility run for guest timing prompts, so AI citation lift remains unmeasured. The first readback uses the defined GSC family clicks and position; AI Overview presence is supporting context only. |
| Recommendation | Apply the smallest honest rescue: set Article `dateModified` and the visible updated line to the verified 2026-10-22 substantive change, and test a title and description that state the page's existing month answer. Do not add a year hook because the page does not yet support a full 2027 freshness claim. Keep the current layout and The Oasis stay box. |
| Attack status | completed |
| Query variants inspected | the 13 Search Console "best time" rows on this URL for both weeks; rank tracker rows for the head term and month/weather variants; and the two head terms on Google desktop and mobile at depth 20 on 2026-11-17 |
| SERP source | Local OpenSEO `get_serp_results`, Google US/en, desktop and mobile, depth 20, 2026-11-17. Raw structured and text exports are retained in the approved run folder; private report id `14e1e432-1117-4898-a139-dbea8f845c8e`. |
| Competitor URLs inspected | Fetched and read 2026-11-12: `https://everydayfamilytravel.blog/best-time-to-visit-anna-maria-island/`, `https://www.annamaria.com/news-and-blog/anna-maria-island-weather/`, `https://crabbyjoescartrentals.com/best-time-to-visit-anna-maria-island-a-month-by-month-guide-for-families/`, `https://www.visitflorida.com/places-to-go/southwest/anna-maria-island/` |
| Content gap and Seascape answer | Competitors disagree on the answer (annamaria.com says January–March or October; others say spring and fall or May). Seascape already gives the clearest split by goal, backed by NOAA normals. The gap is not content depth; it is freshness signal and snippet. |
| Design/format strategy | No layout change. Any fix is metadata and one visible date line. |
| Seascape proof available | NOAA normals already on the page (#710); the page's own month table; git history for the real last-change date |
| Tools/plugins used | OpenSEO free reads listed above; WebSearch; WebFetch; approved local OpenSEO `get_serp_results` paid run on 2026-11-17 (about 20 credits, approximately $0.02; actual provider charge not exposed). No Hostaway call. |
| Decision and reason | Rescue the existing winner with metadata and truthful freshness only. The live SERPs confirm season/freshness competition, while the page already has the answer depth and conversion path; new copy, layout or a second page would add risk without addressing the observed snippet gap. |

## Gate 0 completion

Sawyer approved the exact paid lookup, and Grok Bot completed it through local OpenSEO on 2026-11-17 at 17:03 ET: two queries, US/en, desktop and mobile, depth 20. The raw result contained the structured organic items used above. The private saved report is `Best-time AMI Gate 0 SERP — Nov 17, 2026` (`14e1e432-1117-4898-a139-dbea8f845c8e`). Estimated cost was about 20 credits, approximately $0.02; the actual provider charge was not exposed. This closes the Gate 0 research requirement and authorizes only the scoped source rescue described in this brief.

## Cluster In Scope

- canonical winner URL: `/guides/best-time-visit-anna-maria-island/`
- feeder pages: `/guides/anna-maria-island-weather/` (shares month/weather queries; no change)
- money destination: `/stays/anna-maria-island-vacation-rentals/` and the stay box
- active lane: comparison guides feeding direct-book stay intent

## Source And Proof Constraints

- no managed home is on Anna Maria Island; the stay box keeps The Oasis (Bradenton) until at least 2026-11-24
- any date change must match a real content change in git history
- no new weather, price or crowd fact without a source already on the page

## Not In Scope

- AMI vs Siesta Key snippet (second target, separate brief)
- new month pages, new guides or expansion
- stay-box home change, layout or CSS
