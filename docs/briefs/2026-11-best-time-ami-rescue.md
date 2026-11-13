# Brief: Best-time AMI guide click-decline rescue (2026-11-12)

- lifecycle: draft
- task scope: Gate 0 research for the existing guide `/guides/best-time-visit-anna-maria-island/` under `docs/process/ranking-regression-rescue.md`, opened from the 2026-11-09 `docs/status/next-batch.md` read (window 2026-11-01 to 2026-11-07), which names this page the primary money-guide rescue. Sawyer approved finishing this brief on 2026-11-12. No `src/` change in this brief's PR.
- completion or successor: not complete. Gate 0 is blocked on one field set: a live Google SERP for the target query family (see "Gate 0 blocker"). A copy PR may open only after that capture fills every row below. Earlier best-time briefs (`2026-07-best-time-guide-transfer-fix.md`, `2026-10-best-time-month-tiles.md`, `2026-10-best-time-rain-and-stone-crab.md`, `2026-10-best-time-temperature-reconcile.md`) cover past scoped changes; this brief does not reopen them.

## Content Gate Inputs

- persona: a traveler who has picked Anna Maria Island and is choosing a month, often comparing weather, crowds and price before looking at homes
- primary keyword: best time to visit anna maria island
- secondary keywords: best time to go to anna maria island; when is the best time to visit anna maria island; best time of year to visit anna maria island; anna maria island best time to visit
- audience pattern: reads the answer in the snippet or AI Overview first; clicks when the snippet promises a month-level answer it can trust for this year
- proof source: Search Console and GA4 through OpenSEO free reads, 2026-11-12; Search Console URL inspection 2026-11-12; saved OpenSEO rank tracker (mobile, last full read of the head term 2026-11-05); repo source of the guide at `origin/main` `e4011770`
- required internal links: unchanged from the current page (`/stays/anna-maria-island-vacation-rentals/`, `/stays/anna-maria-island-beachfront-rentals/`, `/guides/anna-maria-island-weather/`)
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
- decision rule: revert if the family's average position falls below 4 for 7 complete days after publish; keep if family clicks recover to at least the 2026-10-25 to 2026-10-31 level (6) with position at or above 2.5; otherwise record `insufficient evidence`

## Gate 0 Search And Attack Receipt

Evidence read 2026-11-12 (all free): OpenSEO `get_search_console_performance` (page, query, date, device), `inspect_urls`, `get_rank_tracker`, `get_google_analytics_organic_landing_pages`; WebSearch (not Google) and WebFetch of four competitor pages. Google's own results page refused an automated fetch. No paid OpenSEO call was made; see "Gate 0 blocker".

| Field | Answer |
| --- | --- |
| Target query family | "best time to visit anna maria island", "best time to go to anna maria island", "when is the best time to visit anna maria island", "best time of year to visit anna maria island", "anna maria island best time to visit", plus the "florida" variants |
| Searcher intent | Guide/research with downstream guest booking (choosing a month before choosing a home) |
| Current Seascape URL | `/guides/best-time-visit-anna-maria-island/` |
| SERP observed date | **Incomplete.** Rank tracker (Google, mobile) 2026-11-05: head term position 2. Not checked in the partial 2026-11-12 run (54 of 81 keywords). Competitor order below is a non-Google WebSearch read on 2026-11-12. |
| SERP stale after | 2026-11-19 for the WebSearch read; a Google SERP capture sets its own date + 7 days |
| Current proof | Search Console 2026-11-01 to 11-07 (read 2026-11-12): 11 clicks, 1,166 impressions, daily average position 4.5–5.6 (Nov 9 digest: 28 to 11, −61%, position about 5.0). GA4 via OpenSEO, organic Search, same window: 15 sessions, 8 engaged, 0 key events. Analytics receipts after the bot exclusion (analytics #355/#358, site #938): 16 sessions Nov 1–7; Nov 2–8: 17 sessions, 0 stay-box clicks, 1 book-direct click. URL inspection: Submitted and indexed, last crawl 2026-11-08, Google canonical = declared canonical. |
| Top visible competitors | **Proxy, not Google:** WebSearch 2026-11-12 order: visitflorida.com Anna Maria Island hub; everydayfamilytravel.blog best-time post; annamaria.com weather guide; then mikenormanrealty.com, teamduncan.com, crabbyjoescartrentals.com ("Month-by-Month Guide (2026)"). Google positions 1–2 above Seascape are not yet identified. |
| Competitor angle | Guide depth from local rental, realty and rental-gear companies, plus the state tourism hub's FAQ answer ("spring and fall"). Two show visible dates (everydayfamilytravel: updated 2025-08-14; annamaria.com: 2026-01-23; crabbyjoes: 2026-05-14 with "(2026)" in the title). |
| Visual/format gap | None of the four pages read uses a table, chart or month grid; Seascape already has twelve month tiles and a month list. Skip: no new visual format is needed. |
| Seascape gap | **Provisional until a Google SERP confirms it.** (1) Freshness: Article `dateModified` is 2026-07-28 and the visible line says July 2026, though the page's facts changed on 2026-10-19 (#747) and 2026-10-22 (#767, corrected November rain and stone-crab month); a competitor carries "(2026)" in its title. (2) Snippet: at position 3 the head term earned 0 of 25 clicks; the title "Best Time to Visit Anna Maria Island (Month-by-Month)" and description do not name the answer months in the title. Seascape's answer ("May and November for balance; March–April for certainty; September–October only if flexible") is more specific than any competitor read. |
| Search fit | Keep and rescue this URL: it already ranks for the family, matches the intent, and feeds the stay box and `guide_book_direct_click`. No new page. |
| Local/GBP proof | N/A: guide intent with no map pack in the tracker's saved SERP features for the head term (AI Overview, People Also Ask, forums, perspectives). |
| AEO/readback note | AI Overview is present on the head term (tracker SERP features). OpenSEO has no saved baseline AI-visibility run for guest timing prompts (sources read returned no rows). GA4 via OpenSEO for 2026-11-01 to 11-07 showed chatgpt.com / ai-assistant 8 sessions and chatgpt.com / vacation_rentals 1 (site-wide read at 9:28 AM ET 2026-11-12); OpenSEO also flagged 65% of 41,610 sessions with source "(not set)", so referral counts are a floor. |
| Recommendation | Hold source edits. Capture a Google SERP for the head term (desktop and mobile, depth 20), then fill the two incomplete rows. If the SERP shows fresher dated competitors above Seascape and no new format, the smallest honest fix is: set `dateModified` and the visible updated line to the last substantive content change (2026-10-22), and test a title/description that names the answer months. Both need the content gate and a page-ledger entry. |
| Attack status | not completed: blocked on a live Google SERP (see below) |
| Query variants inspected | the 13 Search Console "best time" rows on this URL for both weeks; rank tracker rows for the head term and month/weather variants |
| SERP source | Rank tracker (Google, mobile, depth 40) 2026-11-05; WebSearch (non-Google) 2026-11-12. Google results page fetch on 2026-11-12 returned an access-error page. |
| Competitor URLs inspected | Fetched and read 2026-11-12: `https://everydayfamilytravel.blog/best-time-to-visit-anna-maria-island/`, `https://www.annamaria.com/news-and-blog/anna-maria-island-weather/`, `https://crabbyjoescartrentals.com/best-time-to-visit-anna-maria-island-a-month-by-month-guide-for-families/`, `https://www.visitflorida.com/places-to-go/southwest/anna-maria-island/` |
| Content gap and Seascape answer | Competitors disagree on the answer (annamaria.com says January–March or October; others say spring and fall or May). Seascape already gives the clearest split by goal, backed by NOAA normals. The gap is not content depth; it is freshness signal and snippet. |
| Design/format strategy | No layout change. Any fix is metadata and one visible date line. |
| Seascape proof available | NOAA normals already on the page (#710); the page's own month table; git history for the real last-change date |
| Tools/plugins used | OpenSEO free reads listed above; WebSearch; WebFetch. No paid lookup; no Hostaway call. |
| Decision and reason | Research, not a source edit: the block names the query and a provisional gap but cannot yet name the Google competitors that took positions 1–2. |

## Gate 0 blocker

The paid OpenSEO `get_serp_results` call (about 5 credits per keyword at depth 20) was not run. The Cost Boundary in `docs/process/openseo.md` requires the November 2026 ET total from saved reports before any paid lookup. A paid SERP call on 2026-11-10 (cited in `docs/briefs/2026-11-sarasota-airbnb-management-rescue.md` on the open draft PR #937 branch) has no saved OpenSEO report with its dollar cost, so the month's total cannot be established, and the tool gives no dollar estimate. The tool gives only a credit estimate, which the Cost Boundary counts as no dollar estimate, so this lookup needs Sawyer's approval even after the month's total is established. Next action: Sawyer approves one SERP lookup naming the two queries, desktop and mobile, depth 20, and a dollar cap. Saving the 2026-11-10 lookup's cost as a report only fixes this month's accounting; it does not authorize this call.

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
