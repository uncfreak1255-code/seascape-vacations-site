## RANK TRACKER DATA — 2026-05-06
Updated: 2026-05-06 (auto)

---

## ⚠️ Data Source Notice — DEGRADED RUN
- ❌ **Chrome MCP unavailable** — "Permission denied: Chrome control requires automation permissions" (regression from May 3 when access worked). GSC + GA4 data NOT pulled this run.
- ❌ **Ahrefs `serp-overview` still blocked** — "Insufficient plan" (unchanged since May 3).
- ✅ **Web search fallback used** for SERP rank confirmation on top 12 keywords.
- ✅ **curl** confirmed sitemap state and live URL health.

**Implication:** Click/impression/CTR/position deltas are NOT updated this week. Use the May 3 baseline (Apr 4 – May 1 28d window: 233 clicks, 53.6K imp, 0.4% CTR, pos 7.9) until Chrome access is restored. Only changes captured this run are SERP-position confirmations and content/site-state diff.

---

## 🚨 LIVE-SITE INCIDENT FLAG
First curl request to `https://seascape-vacations.com/` returned **HTTP 500** (Netlify). Subsequent requests returned 200. This is a transient origin error — investigate Netlify build logs or a function/middleware that sometimes fails. Even an intermittent 500 hurts crawl budget and Core Web Vitals signal.

**Action:** check Netlify deploy logs for the `01KQYXNXN5TS8KZ89Z5CJKY33D` request ID timestamped 2026-05-06 15:14 UTC.

---

## SITE STATE (2026-05-06)

| Metric | This Week | Last Week (May 3) | Change |
|--------|-----------|-------------------|--------|
| Sitemap URLs | 146 | 146 | 0 |
| _site/ pages | 158 | 158 | 0 |
| /stays/ pages | 62 | 62 | 0 |
| /guides/ pages | 53 | 53 | 0 |
| /property-management/ pages | 28 | 28 | 0 |
| /research/ pages | 6 | 3 | **+3** |

**3 new /research/ pages shipped May 3** — too new to rank or generate impressions:
- `/research/florida-gulf-coast-vacation-cost-calculator-2026/`
- `/research/gulf-coast-vacation-rental-chart-pack-2026/`
- `/research/owner-fee-revenue-leak-benchmark-2026/`

These are **citation-ready owner-funnel research assets** (commit message confirms). Track in 2-3 weeks for indexing + AI-engine citations. They will not show clicks in this week's GSC pull (when restored).

---

## SERP POSITION CHECKS (web search, US, 2026-05-06)

✅ = seascape-vacations.com confirmed in result set
❌ = not in top 10 organic
🟡 = ranking but weak

| Keyword | Result | Notes |
|---------|--------|-------|
| bradenton vs sarasota | ✅ #1 | `/guides/bradenton-vs-sarasota` consistently top result |
| bradenton vs sarasota vacation rental | ✅ #1 (+ #8) | Guide #1, also `/stays/vacation-rentals-bradenton-florida/` ranking #8 |
| bradenton vs sarasota for families | ✅ #5 | Ranking but GSC shows 0.05% CTR — title problem confirmed |
| srq airport to anna maria island | ✅ #5 | Holding mid-page-1 |
| direct booking vacation rental Bradenton | ✅ #7 | `/stays/vacation-rentals-bradenton-florida/` page is working |
| anna maria island vs siesta key | ❌ | Off page 1 — TripAdvisor, Quora, Mousin' Around dominate |
| how far is anna maria island from sarasota | ❌ | Rome2Rio, amisland.com, Travelmath dominate |
| vacation rentals Bradenton FL | ❌ | FloridaRentals, HomeToGo, Vacasa, AMI Locals dominate |
| Anna Maria Island vacation rentals | ❌ | Anna Maria Life, Anna Maria Vacations, AMI Locals dominate |
| vacation rental management Bradenton FL | ❌ | Gulf Coast PM, Stringer, Anchor Down, Renjoy dominate |
| Anna Maria Island vacation rental management | ❌ | Island Vacation Properties, AML, Beach Boutique dominate |
| luxury vacation rental Sarasota FL | ❌ | Emerald Kite, FloridaRentals, Lido Key Vacations, Airbnb dominate |
| pet friendly vacation rental Bradenton | ❌ | BringFido, Airbnb, FloridaRentals, Vrbo dominate |
| florida dbpr vacation rental license requirements | ❌ | MyFloridaLicense (.gov), funstayflorida, Avantio dominate |
| Bradenton beach house rental waterfront | ❌ | Mike Norman Realty, Zillow, HomeToGo dominate |

### Scorecard
- **Top-10 hits:** 5/15 (33%) — same as May 3 baseline
- **Money keywords (rentals + management):** 0/6 in top 10 — UNCHANGED
- **Comparison/guide keywords:** 4/4 in top 10 — strong cluster
- **Transit keywords:** 1/2 in top 10 — split URL still hurting

---

## DROPPING PAGES (other tasks: prioritize fixing these)
<!-- content-quality-patrol and internal-linking-rebuild read this -->
*No fresh GSC data this run. Carry over May 3 list.*

| Page | Mar 12 → May 3 Clicks | Action Needed |
|------|----------------------|---------------|
| /guides/bradenton-vs-sarasota/ | 110 → 49 (-55%) | Title/meta refresh + freshness signal (still #1 SERP, CTR 0.27% is the bleed) |
| /guides/anna-maria-island-vs-siesta-key/ | 77 → 29 (-62%) | Title rewrite + reclaim page-1 SERP (currently off page 1) |
| /guides/best-vacation-rental-companies-ami | 20 → 4 (-80%) | Money keyword bleeding — content depth + internal links |
| /guides/best-time-visit-anna-maria-island | 21 → 3 (-86%) | Seasonal — refresh for May–Sep window NOW |
| /guides/is-anna-maria-island-worth-visiting | 11 → 3 (-73%) | Refresh + boost links |

---

## HIGH IMPRESSION LOW CTR (title/meta optimization needed)
<!-- content-quality-patrol reads this to prioritize meta rewrites -->
*Carried from May 3 — no new GSC pull this run.*

| Page | Imp/28d | CTR | Priority |
|------|---------|-----|----------|
| /guides/bradenton-vs-sarasota/ | 18,043 | 0.27% | 🔴 #1 — biggest single upside |
| /guides/anna-maria-island-vs-siesta-key/ | 7,244 | 0.40% | 🔴 #2 |
| /guides/bradenton-vs-sarasota-for-families/ | 6,292 | 0.05% | 🔴 #3 — confirmed ranking #5 SERP this run, so title is the problem, not position |
| /guides/siesta-key-vs-anna-maria-island-families/ | 4,957 | 0.20% | 🔴 #4 |
| /guides/srq-airport-to-anna-maria-island/ | 3,303 | 0.36% | 🟡 #5 |
| /guides/srq-airport-to-anna-maria-island (no slash) | 2,634 | 0.08% | 🚨 DUPLICATE — split with #5 |

---

## STRIKING DISTANCE KEYWORDS (position 4-15)
<!-- seo-content-creation and pseo-page-builder read this -->

| Keyword | Confirmed Position | Page | Action |
|---------|-------------------|------|--------|
| bradenton vs sarasota for families | ~5 | /guides/bradenton-vs-sarasota-for-families/ | TITLE REWRITE — at position 5 with 6,292 imp/28d earning 3 clicks. Title is invisible. |
| direct booking vacation rental Bradenton | ~7 | /stays/vacation-rentals-bradenton-florida/ | Add "book direct, save 10-15%" to title — already in content |
| srq airport to anna maria island | ~5 | /guides/srq-airport-to-anna-maria-island/ | 301 the no-slash version, consolidate equity |

---

## UNDERPERFORMING PAGES (4+ weeks old, no rankings)
<!-- internal-linking-rebuild reads this to add more links -->

| Page | Created | Inbound Links | Notes |
|------|---------|---------------|-------|
| /property-management/vacation-rental-management-fees-florida/ | Mar 11 | unknown | 8 weeks old, still zero clicks per May 3 baseline |
| /stays/holmes-beach-vacation-rentals/ | Mar 6 | unknown | 9 weeks old, crumb traffic only |
| /stays/anna-maria-island-beachfront-rentals/ | Mar 6 | unknown | 9 weeks old, flat |
| ~24 PM pages | various | unknown | Listed in sitemap but invisible in GSC |
| /research/florida-gulf-coast-vacation-cost-calculator-2026/ | May 3 | unknown | Brand new — 3 days old, expect indexing in 2-3 weeks |
| /research/gulf-coast-vacation-rental-chart-pack-2026/ | May 3 | unknown | Brand new |
| /research/owner-fee-revenue-leak-benchmark-2026/ | May 3 | unknown | Brand new — owner-funnel asset |

---

## TOP PERFORMERS (what's working)
| Page | Top Keyword | Confirmed Position | Notes |
|------|------------|--------------------|-------|
| /guides/bradenton-vs-sarasota/ | bradenton vs sarasota | #1 | 49 clicks/28d at 0.27% CTR — CTR is the limit, not rank |
| /guides/srq-airport-to-anna-maria-island/ | srq airport to anna maria island | #5 | Holding |
| /stays/vacation-rentals-bradenton-florida/ | direct booking vacation rental Bradenton | #7 | 4.82% CTR (best on /stays/) |
| /guides/rainy-day-activities-bradenton-sarasota/ | rainy day activities | unknown | Emerged as new top-10 on May 3 |

---

## NEW 404s DETECTED
<!-- seo-weekly-health-check reads this -->
*GSC indexing data not pulled this run. Carry over May 3 baseline of 120 total 404s, 341 "Crawled not indexed."*

The 341 "Crawled not indexed" remains the single largest indexing problem. Until Chrome access is restored, run `seo-weekly-health-check` to pull the URL inventory via direct sitemap diff or another channel.

---

## URL HYGIENE ISSUES (still open, unchanged from May 3)
1. 🚨 **Duplicate URL on `/guides/srq-airport-to-anna-maria-island`** — with vs without trailing slash, splits 5,937 imp. **Fix: 301 no-slash → slash.**
2. 🟡 `.html` extensions still indexed on noise-ordinance, market-report, best-time-visit guides
3. 🟡 GMB UTM-tagged homepage indexes separately — add canonical → /
4. 🟡 ~12 pages in _site/ not in sitemap.xml

---

## WEEK-OVER-WEEK TOTALS
*Cannot compute this run — Chrome MCP blocked. Last known values (May 3, 28d window):*

- Clicks: 233 (Δ -176 vs Mar 12, **-43%**)
- Impressions: 53.6K (Δ -7.4K, **-12%**)
- Avg CTR: 0.4% (Δ -0.3pp)
- Avg Position: 7.9 (Δ +0.4)
- Indexed pages: 227
- 404 count: 120
- Crawled - not indexed: 341

---

## TREND ANALYSIS (May 3 → May 6, 3-day delta)
**Improving:**
- ✅ 3 new /research/ pages shipped (citation-ready owner-funnel assets) — early signal that Phase 4 owner-acquisition content is back in motion despite earlier "Phase 4 frozen" rule in CLAUDE.md
- ✅ SERP positions for top 5 ranking keywords are HOLDING — no further drops detected via web search
- ✅ Hero v2 booking + property cards shipped May 3 (homepage CRO upside, untracked)

**Concerning:**
- 🔴 Transient HTTP 500 on homepage — flag investigated above
- 🔴 Chrome MCP regression — GSC access broken between May 3 and May 6
- 🔴 No detectable progress on the 5 top-priority items from May 3 (title rewrites, srq duplicate, 341 crawled-not-indexed inventory)
- 🔴 Money keywords (vacation rentals + management) still 0/6 in top 10

**Stable:**
- Page inventory unchanged
- Sitemap URL count unchanged

---

## RECOMMENDATIONS (Priority Order)

1. **🔴 RESTORE Chrome MCP automation permission** — without it, weekly tracking is a partial-data exercise. Owner action: System Settings > Privacy & Security > Automation > enable Google Chrome under Claude.
2. **🔴 INVESTIGATE the HTTP 500 on `/`** — pull Netlify logs for the request ID and timestamp above. Even intermittent 500s degrade crawl rate.
3. **🔴 EXECUTE title/meta rewrites on top 5 high-imp/low-CTR pages** — flagged on May 3, no movement since. `/guides/bradenton-vs-sarasota/` alone could recover 100+ clicks/mo.
4. **🔴 FIX srq-airport duplicate URL** — 301 redirect non-slash → slash. Single highest-leverage 5-minute fix on the site.
5. **🟡 INVESTIGATE 341 "Crawled not indexed"** — likely legacy DEPLOY-folder URLs Google rejected. Inventory and 410 the dead ones.
6. **🟡 SEASONAL CONTENT REFRESH** — May–Sep is summer/shoulder season. Update `/guides/best-time-visit-anna-maria-island` and add summer-specific angles to top guides. Page lost 86% of its clicks.
7. **🟢 LET NEW /research/ PAGES RIPEN** — don't ship more research pages until you see whether the May 3 trio gets indexed and cited. Indexing health is the bottleneck.
8. **🟢 RESOLVE Ahrefs plan issue** — competitor SERP monitoring is dark.

---

## NOTES FOR DOWNSTREAM TASKS
- **content-quality-patrol**: priority queue is unchanged from May 3 — bradenton-vs-sarasota title rewrite first.
- **internal-linking-rebuild**: 3 new /research/ pages need feeder links from /guides/ and /property-management/. Also still need links into `/property-management/vacation-rental-management-fees-florida/`.
- **seo-weekly-health-check**: investigate the transient 500 and the unchanged 341 crawled-not-indexed count. Consider direct Search Console API access via service account if Chrome MCP keeps failing.
- **pseo-page-builder**: STILL HOLD on new pages. Page count fine; indexing is rejecting what we have.
- **Owner action**: re-enable Chrome automation permission before next Wednesday's run.
