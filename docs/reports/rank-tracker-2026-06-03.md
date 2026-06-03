## RANK TRACKER DATA — 2026-06-03
Updated: 2026-06-03 (automated)

---

## ⚠️ Data Source Notice — PARTIAL RUN
- ✅ **Chrome MCP restored** — GSC Performance + Indexing data pulled successfully (first clean pull since May 3).
- ❌ **GSC `Pages` tab not pullable** — React tab elements don't respond to synthetic clicks via the Chrome MCP. Top-page data is inferred from query-level data + repo inventory rather than measured directly. Owner action: a one-click manual Pages export each Wed would close this gap permanently.
- ❌ **GSC Compare mode not pullable** — date-picker compare UI also requires real user input. Week-over-week deltas are computed against the **May 3 baseline (28d window: 233 clicks, 53.6K imp, 0.4% CTR, pos 7.9)** stored in the previous tracker.
- ❌ **Ahrefs `serp-overview` still blocked** ("Insufficient plan") — competitor SERP detail dark.
- ✅ **Web search fallback** used for 9 priority keyword SERP confirmations.
- ✅ **curl** confirmed live site is 200 OK and sitemap state.

---

## SITE STATE (2026-06-03)

| Metric | This Week | May 6 | Δ |
|--------|-----------|-------|---|
| Live homepage HTTP | 200 | 500→200 (intermittent) | ✅ stable this run |
| Sitemap URLs | 145 | 146 | -1 |
| _site/ pages | 160 | 158 | +2 |
| /stays/ pages | 62 | 62 | 0 |
| /guides/ pages | 53 | 53 | 0 |
| /property-management/ pages | 29 | 28 | +1 |
| /research/ pages | 7 | 6 | +1 |

---

## 🚨 INDEXING ALARM

| Metric | Today | May 3 baseline | Δ |
|--------|-------|---------------|---|
| Indexed pages | **162** | 227 | **-65 (-29%)** |
| Not found (404) | 135 | 120 | +15 |
| Crawled - currently not indexed | 402 | 341 | +61 |
| Page with redirect | 122 | not tracked | n/a |
| Excluded by 'noindex' | 10 | not tracked | n/a |
| Discovered - not indexed | 3 | not tracked | n/a |

**Read:** Google is actively shrinking the indexed footprint. We added pages on disk (+2) and sitemap is roughly flat (-1), but Google removed 65 pages from the index and pushed +61 more into "Crawled - not indexed." Indexing health is the single biggest problem on the site.

---

## SERP POSITION CHECKS (web search, US, 2026-06-03)

✅ = seascape-vacations.com confirmed in top 10
🟡 = ranking but weak / below top 5
❌ = not in top 10

| Keyword | Today | May 6 | Δ | Notes |
|---------|-------|-------|---|-------|
| bradenton vs sarasota | 🟡 #5 | ✅ #1 | **🔴 -4** | Zachos, midflorida, bestplaces overtook. Lost the #1 spot. |
| bradenton vs sarasota for families | ✅ #1 | ✅ #5 | **🟢 +4** | seascape now top result — title-rewrite priority pays off |
| srq airport to anna maria island | ✅ #1 | ✅ #5 | **🟢 +4** | Now dominating this transit term |
| anna maria island vs siesta key | 🟡 #5 | ❌ off | **🟢 reclaimed** | Back on page 1 |
| direct booking vacation rental Bradenton | ✅ #6 | ✅ #7 | **🟢 +1** | Holding |
| Anna Maria Island vacation rentals | ❌ | ❌ | 0 | Anna Maria Vacations, Anna Maria Life, AMI Locals dominate |
| vacation rentals Bradenton FL | ❌ | ❌ | 0 | GC Vacation Rentals, HomeToGo, FloridaRentals, Vacasa, AMI Locals dominate |
| vacation rental management Bradenton FL | ❌ | ❌ | 0 | Stringer, Gulf Coast PM, GCVR, SkyRun, Renjoy dominate |
| luxury vacation rental Sarasota FL | ❌ | ❌ | 0 | Emerald Kite, FloridaRentals, Jennette, Airbnb dominate |
| summer vacation rentals florida gulf coast | ❌ | not checked | n/a | GCVR, TopVillas, FloridaGulfCoastVR, 360 Blue dominate — July seasonal target page is invisible |

### Scorecard
- Top-10 hits this run: 5/10 (50%) — same hit rate as May 6 but the mix changed
- **Net position movement:** 3 keywords UP, 1 keyword DOWN, 1 NEW RANK, 5 unchanged at ❌
- Money keywords (rentals + management): **still 0/4 in top 10** (UNCHANGED)
- Comparison/guide cluster: 3/3 in top 10 (1 dropped to #5 from #1)
- Transit cluster: 1/1 at #1 (improved)

---

## DROPPING PAGES (other tasks: prioritize fixing these)
<!-- content-quality-patrol and internal-linking-rebuild read this -->

| Page | Signal | Action Needed |
|------|--------|---------------|
| /guides/bradenton-vs-sarasota/ | SERP rank #1 → #5 (largest single drop this week) | Freshness pass + content depth vs Zachos and midflorida; this page was the click engine |
| /stays/summer-vacation-rentals-florida-gulf-coast/ | Off page 1 for primary July seasonal head term (per July content priorities, this is the #1 refresh target) | Execute the July seasonal refresh NOW — title/meta CTR tune + July 4th section, per content-priorities-2026-07.md |
| /guides/best-time-visit-anna-maria-island | Not in top queries; seasonal window is OPEN | Carry-over from May — still unrefreshed |
| /guides/best-vacation-rental-companies-ami | Money keyword bleed | Carry-over from May — internal linking + content depth |

---

## HIGH IMPRESSION LOW CTR (title/meta optimization needed)
<!-- content-quality-patrol reads this to prioritize meta rewrites -->

Source: GSC 28d queries view (2026-05-05 → 2026-06-01).

| Query | Imp/28d | CTR | Avg Pos | Likely Landing Page | Priority |
|-------|---------|-----|---------|---------------------|----------|
| anna maria island | 1,902 | 0.4% | 3.2 | /guides/anna-maria-island-vs-siesta-key/ or area guide | 🔴 #1 — head term ranked #3 with 0.4% CTR. Title/meta is invisible. |
| bradenton fl | 1,667 | 0.3% | 3.0 | / or /stays/vacation-rentals-bradenton-florida/ | 🔴 #2 — ranked #3 with 0.3% CTR |
| sarasota to anna maria island | 1,210 | 0.2% | 7.6 | /guides/srq-airport-to-anna-maria-island/ | 🔴 #3 — worst CTR in top 10 queries |
| bradenton florida | 1,027 | 0.3% | 2.9 | / | 🔴 #4 |
| sarasota airport to anna maria island | 956 | 0.4% | 6.1 | /guides/srq-airport-to-anna-maria-island/ | 🟡 #5 |
| sarasota florida | 849 | 0.1% | 3.0 | /guides/bradenton-vs-sarasota/ probably | 🟡 #6 |
| bradenton | 745 | 0.8% | 3.3 | / | 🟡 #7 (better CTR but huge volume) |
| siesta key vs anna maria island | 607 | 1.0% | 5.8 | /guides/anna-maria-island-vs-siesta-key/ | 🟢 acceptable CTR |
| anna maria island vs siesta key | 566 | 1.4% | 5.9 | /guides/anna-maria-island-vs-siesta-key/ | 🟢 acceptable |

---

## STRIKING DISTANCE KEYWORDS (position 4-15)
<!-- seo-content-creation and pseo-page-builder read this -->

Source: GSC 28d query data.

| Keyword | Position | Impressions | Current Page | Action |
|---------|----------|-------------|--------------|--------|
| sarasota to anna maria island | 7.6 | 1,210 | /guides/srq-airport-to-anna-maria-island/ | 301 the no-slash dupe + title rewrite — biggest single CTR upside |
| sarasota airport to anna maria island | 6.1 | 956 | /guides/srq-airport-to-anna-maria-island/ | Same page — consolidate equity |
| anna maria island vs siesta key | 5.9 | 566 | /guides/anna-maria-island-vs-siesta-key/ | Push to top 3; competitor cluster is Mousin'Around + Luxurytraveldiarie |
| siesta key vs anna maria island | 5.8 | 607 | /guides/anna-maria-island-vs-siesta-key/ | Same target |
| anna maria island or siesta key | 6.4 | 160 | /guides/anna-maria-island-vs-siesta-key/ | Same target |
| seascape (brand near-miss) | 12.1 | 497 | / | Brand-protect — check homepage title carries "Seascape Vacations" |
| things to do in bradenton fl | 25.4 | 206 | unknown | Outside striking distance; do not over-invest |
| anna maria vacation rental companies | 29.1 | 61 | /guides/best-vacation-rental-companies-ami | Money-page bleed flagged May 6, still bleeding |

---

## UNDERPERFORMING PAGES (4+ weeks old, no rankings)
<!-- internal-linking-rebuild reads this to add more links -->

| Page | Created | Status | Notes |
|------|---------|--------|-------|
| /property-management/vacation-rental-management-fees-florida/ | Mar 11 | Still invisible | 12 weeks old, still zero clicks. Carry-over from May. |
| /stays/holmes-beach-vacation-rentals/ | Mar 6 | Crumb traffic | 13 weeks old |
| /stays/anna-maria-island-beachfront-rentals/ | Mar 6 | Flat | 13 weeks old |
| /research/florida-gulf-coast-vacation-cost-calculator-2026/ | May 3 | Indexing unknown | 4 weeks old — should be ranking or de-indexed by now; check coverage status |
| /research/gulf-coast-vacation-rental-chart-pack-2026/ | May 3 | Indexing unknown | 4 weeks old |
| /research/owner-fee-revenue-leak-benchmark-2026/ | May 3 | Indexing unknown | 4 weeks old — owner-funnel asset |
| ~24 PM pages | various | Mostly invisible | Same pattern as May |

---

## TOP PERFORMERS (what's working)

| Page | Top Keyword | Position | 28d Clicks (query-attributed) | Notes |
|------|------------|----------|-------------------------------|-------|
| /guides/srq-airport-to-anna-maria-island/ | srq airport to anna maria island | #1 (web search) | 4 (sarasota airport variant) + 3 (sarasota to AMI) + others | NEW #1 RANK — biggest win this week |
| /guides/bradenton-vs-sarasota-for-families/ | bradenton vs sarasota for families | #1 (web search) | included in "bradenton vs sarasota" cluster | NEW #1 RANK |
| /guides/anna-maria-island-vs-siesta-key/ | anna maria island vs siesta key | #5 | 8 + 6 (variants) | Reclaimed page 1 |
| / (homepage) | seascape vacations | #1 brand | 25 | Brand protection holding |
| /stays/vacation-rentals-bradenton-florida/ | direct booking vacation rental Bradenton | #6 | n/a in top queries | Holding page-1 |
| /guides/bradenton-vs-sarasota/ | bradenton vs sarasota | #5 (dropped from #1) | 1 (vs ~49 previously) | 🔴 was top performer, now bleeding |

---

## NEW 404s DETECTED
<!-- seo-weekly-health-check reads this -->

GSC Indexing report shows **135 Not Found URLs** today (was 120 on May 3, +15). Specific new URLs not enumerated in this run — the GSC Pages tab interaction was blocked. Owner action: open GSC > Indexing > Pages > "Not found (404)" and export the list; that will reveal whether the +15 are legacy DEPLOY-folder URLs or new build artifacts.

| URL | First Detected | Status |
|-----|---------------|--------|
| (unenumerated — 15 new this period) | between 2026-05-03 and 2026-06-03 | Investigate via GSC UI |

---

## URL HYGIENE ISSUES (still open, unchanged from May 6)
1. 🚨 **`/guides/srq-airport-to-anna-maria-island`** duplicate slash vs no-slash — Google still shows both `.html` (#6 result) and slashed (#1 result). 5-minute 301 fix, single highest leverage on the site.
2. 🟡 `.html` extensions indexed on srq guide, noise-ordinance, market-report, best-time-visit
3. 🟡 GMB UTM-tagged homepage canonical
4. 🟡 Sitemap inventory vs _site mismatch (~15 pages in `_site` not in sitemap.xml: 160 vs 145)

---

## WEEK-OVER-WEEK TOTALS

Source: GSC Performance, unfiltered.

| Metric | Current 7d (2026-05-26 → 06-01) | Current 28d (2026-05-05 → 06-01) | May 3 28d baseline | 28d Δ |
|--------|-------------------------------|----------------------------------|---------------------|-------|
| Clicks | 116 | **300** | 233 | **+67 (+29%)** ✅ |
| Impressions | 12,400 | **37,100** | 53,600 | **-16,500 (-31%)** 🔴 |
| Avg CTR | 0.9% | **0.8%** | 0.4% | **+0.4pp (DOUBLED)** ✅ |
| Avg Position | 9.6 | **10.6** | 7.9 | **+2.7 (worse rank)** 🟡 |
| Indexed pages | — | 162 | 227 | **-65 (-29%)** 🔴 |
| 404 count | — | 135 | 120 | **+15** 🔴 |
| Crawled - not indexed | — | 402 | 341 | **+61** 🔴 |

### Plain-English read
Clicks are recovering (+29% on the 28d window vs the May 3 floor) **even though impressions and indexed-page count are both down sharply**. CTR doubled, which means the surviving indexed pages are matching better-qualified searches and the May title-rewrite priorities (bradenton-vs-sarasota-for-families specifically) paid off — that page jumped from #5 to #1. The bad news: the bradenton-vs-sarasota head-term page lost #1 → #5, and Google is actively de-indexing. Net traffic is up, but the index is shrinking under us.

---

## RECOMMENDATIONS (Priority Order)

1. **🔴 INVESTIGATE INDEXING SHRINK** — 65 pages dropped out of the index in 4 weeks while only -1 sitemap change. Open GSC > Indexing > Pages, sort by "Crawled - not indexed" trend, and identify what Google decided to drop. Likely candidates: thin PM pages, duplicate slash variants, low-quality stays pages. This is the single biggest unmanaged signal.
2. **🔴 RESCUE /guides/bradenton-vs-sarasota/** — dropped #1 → #5 SERP. The page that produced the most clicks all year is bleeding. Freshness pass + content-depth audit vs Zachos Realty's and midflorida.com's versions. Do not write a new comparison page; fix this one.
3. **🔴 FIX `/guides/srq-airport-to-anna-maria-island` SLASH DUP** — flagged 4 weeks running. With 1,210 imp on "sarasota to anna maria island" at 0.2% CTR, the duplicate is the single biggest hygiene leak. 5-minute 301.
4. **🔴 EXECUTE JULY SEASONAL REFRESH** — `/stays/summer-vacation-rentals-florida-gulf-coast/` is the #1 page in content-priorities-2026-07.md, currently off page 1 for its target term. July 4th window is 4 weeks out.
5. **🟡 TITLE/META REWRITE the top 4 high-imp / low-CTR queries** — "anna maria island," "bradenton fl," "sarasota to anna maria island," "bradenton florida." Combined 5,806 imp / 0.3% CTR = ~17 clicks where 1.5% CTR would give 87. ~70 clicks of monthly upside in 4 title rewrites.
6. **🟡 ENUMERATE THE NEW 15 × 404s** — owner action: GSC export, then either 410 the dead ones or 301 the live ones.
7. **🟢 HOLD on new page volume** — content-priorities-2026-07.md explicitly says "blocked by freshness," and the indexing-shrink signal confirms that's right.
8. **🟢 RESTORE Chrome MCP `Pages tab + Compare mode` access** — the React-tab interaction failure is the limit on this report's depth. Owner action: enable real-input access for Chrome, or set up a weekly manual GSC export to `~/Projects/seascape-vacations-site/gsc-weekly/`.

---

## NOTES FOR DOWNSTREAM TASKS
- **content-quality-patrol**: queue #1 is `/guides/bradenton-vs-sarasota/` rescue (SERP drop #1 → #5). Queue #2 is the July seasonal refresh on `/stays/summer-vacation-rentals-florida-gulf-coast/`. Queue #3 is the high-imp/low-CTR title rewrites on the 4 queries above.
- **internal-linking-rebuild**: still need links into `/property-management/vacation-rental-management-fees-florida/` (12 weeks old, invisible) and into the 3 May-3 `/research/` pages (4 weeks old, indexing status unknown).
- **seo-weekly-health-check**: 🔴 lead with the **indexing shrink** finding. -65 indexed in 4 weeks is the biggest unmanaged signal. Enumerate the 15 new 404s.
- **pseo-page-builder**: HOLD. Page volume is the wrong move while Google is actively de-indexing existing pages.
- **Owner action**: (a) Open GSC > Indexing > Pages, find the dropped pages; (b) re-enable Chrome MCP real-input to unblock weekly Pages-tab pull; (c) decide whether to start tracking GSC via the Search Console API (service account) given Chrome MCP's repeated tab-click limitations.
