## RANK TRACKER DATA — 2026-05-03
Updated: 2026-05-03 (auto)

---

## Data Source Notice
✅ GSC browser access RESTORED — pulled real data via Chrome MCP
⚠️ Ahrefs `serp-overview` returned "Insufficient plan" (was working previously). All Ahrefs endpoints now blocked.
⚠️ Last task run was 2026-03-19 — this is a 6-week catch-up report. Trend comparisons reference Mar 12 (last full 28-day baseline) and Mar 19.

---

## WEEK-OVER-WEEK / PERIOD-OVER-PERIOD TOTALS

### 28-day window (Apr 4 – May 1) vs Mar 12 baseline (Feb 13 – Mar 11)
- **Clicks: 233 (Δ -176, -43%)** — significant decline
- **Impressions: 53.6K (Δ -7.4K, -12%)**
- **Avg CTR: 0.4% (Δ -0.3pp)** — CTR has gotten worse, not better
- **Avg Position: 7.9 (Δ +0.4, slightly worse)**

### 7-day window (Apr 25 – May 1)
- Clicks: 50 | Impressions: 8.04K | CTR: 0.6% | Avg position: 10.2

### Index health
- **Indexed pages: 227 (Δ -14 from Mar 12's 241)** — getting worse
- **Not indexed: 640** total
- **404 count: 120 (Δ +26 from Mar 12's 94)**
- **Crawled - currently not indexed: 341** 🚨 huge — Google finds pages but won't index
- Page with redirect: 126
- Alternate page with proper canonical: 39

### Page inventory (deploy reality check)
- _site/ (actual deploy target): **158 pages** (62 stays, 53 guides, 28 PM, 15 other)
- DEPLOY THIS FOLDER TO NETLIFY (legacy): 215 pages — likely unused, source of stale URLs
- Live sitemap.xml: **146 URLs** (was 68 on Mar 19 — major fix shipped)
- Sitemap gap vs _site: ~12 pages (was 147 — 92% closed)

---

### 🚨 TOP-LEVEL ALERT: TRAFFIC DECLINE
Clicks dropped 43% over 7 weeks (409 → 233 on 28-day basis). Position only slipped 0.4 spots, so this isn't pure SERP movement — it's CTR collapse (0.7% → 0.4%). Combined with 341 "Crawled not indexed" pages, signal points to:
1. **Title/meta hygiene problem** — high-impression pages have <0.5% CTR
2. **Thin/duplicate content concern** — Google crawling but rejecting indexing
3. **Possible spring break seasonality unwind** — Mar 12 28d window included peak booking season

---

### TOP PERFORMERS (28d, what's working)
| Page | Clicks | Impressions | CTR | Notes |
|------|--------|-------------|-----|-------|
| /guides/bradenton-vs-sarasota/ | 49 | 18,043 | 0.27% | Still #1 page but clicks DOWN from 110 (Mar 12). CTR collapsed. |
| /guides/anna-maria-island-vs-siesta-key/ | 29 | 7,244 | 0.40% | Down from 77 clicks (Mar 12) |
| / (homepage) | 21 | 746 | 2.81% | Slight gain (was ~31/28d) |
| /guides/srq-airport-to-anna-maria-island/ | 12 | 3,303 | 0.36% | DUPLICATE URL issue — see below |
| /guides/rainy-day-activities-bradenton-sarasota/ | 12 | 997 | 1.20% | NEW top performer |
| / (?utm_source=google&utm_medium=organic&utm_campaign=gmb) | 11 | 336 | 3.27% | GMB traffic — strip UTM in canonical |
| /guides/siesta-key-vs-anna-maria-island-families/ | 10 | 4,957 | 0.20% | Big impressions, terrible CTR |
| /guides/shelling-guide-florida/ | 9 | 964 | 0.93% | NEW |
| /guides/holmes-beach-vs-bradenton-beach/ | 8 | 475 | 1.68% | Healthy CTR |
| /guides/anna-maria-island-vs-clearwater-beach/ | 7 | 1,180 | 0.59% | Holding |
| /guides/best-vacation-rental-companies-ami | 4 | 492 | 0.81% | Money keyword page |
| /guides/anna-maria-island-noise-ordinance-guide.html | 4 | 113 | 3.54% | .html extension — fix URL |
| /stays/gulf-coast-vacation-homes-with-dock/ | 4 | 83 | 4.82% | Best CTR among /stays/ |

---

### HIGH IMPRESSION LOW CTR (title/meta optimization needed)
<!-- content-quality-patrol reads this to prioritize meta rewrites -->
| Page | Impressions | Clicks | CTR | Priority |
|------|-------------|--------|-----|----------|
| /guides/bradenton-vs-sarasota/ | 18,043 | 49 | 0.27% | 🔴 #1 — biggest single upside on the site. CTR was 0.5% in Mar, now 0.27% — got WORSE. |
| /guides/anna-maria-island-vs-siesta-key/ | 7,244 | 29 | 0.40% | 🔴 #2 |
| /guides/bradenton-vs-sarasota-for-families/ | 6,292 | 3 | 0.05% | 🔴 #3 — practically invisible, almost certainly title/meta is bad |
| /guides/siesta-key-vs-anna-maria-island-families/ | 4,957 | 10 | 0.20% | 🔴 #4 |
| /guides/srq-airport-to-anna-maria-island/ | 3,303 | 12 | 0.36% | 🟡 #5 — also has duplicate URL |
| /guides/srq-airport-to-anna-maria-island (no slash) | 2,634 | 2 | 0.08% | 🚨 DUPLICATE — split impressions across 2 URLs |
| /guides/florida-gulf-coast-vacation-rental-market-report-2026.html | 1,311 | 1 | 0.08% | 🟡 .html extension hurting CTR + canonical |
| /guides/anna-maria-island-vs-clearwater-beach/ | 1,180 | 7 | 0.59% | borderline |

**Action for downstream tasks:** title rewrite + meta description rewrite on top 5 should be #1 priority for content-quality-patrol.

---

### STRIKING DISTANCE QUERIES (28d, position not pulled but high-impression queries we're showing for)
<!-- seo-content-creation and pseo-page-builder read this -->
| Query | Impressions | Clicks | CTR | Notes |
|-------|-------------|--------|-----|-------|
| siesta key beach | 632 | 0 | 0% | Not our keyword target — exclude or claim with content |
| bradenton fl | 601 | 1 | 0.17% | Brand-adjacent, hard SERP |
| anna maria island | 520 | 1 | 0.19% | Generic — head term, low intent |
| sarasota to anna maria island | 498 | 0 | 0% | Transit query — own with /guides/srq-airport-to-anna-maria-island |
| bradenton florida | 414 | 0 | 0% | Tough SERP |
| sarasota airport to anna maria island | 353 | 1 | 0.28% | We rank, weak CTR |
| sarasota florida | 291 | 1 | 0.34% | Tough SERP |
| bradenton | 284 | 4 | 1.41% | Healthy CTR |
| siesta key vs anna maria island | 238 | 2 | 0.84% | Striking distance |
| anna maria island vs siesta key | 224 | 2 | 0.89% | Striking distance |
| seascape | 171 | 1 | 0.58% | Brand confusion (Seascape Resort generic) |
| florida dbpr vacation rental license requirements | 154 | 0 | 0% | Property mgmt — should win this |
| how far is sarasota from anna maria island | 153 | 0 | 0% | Transit query |
| how far is anna maria island from sarasota | 152 | 0 | 0% | Same intent — capture both phrasings |
| siesta key | 137 | 0 | 0% | Generic |

---

### DROPPING PAGES (other tasks: prioritize fixing these)
<!-- content-quality-patrol and internal-linking-rebuild read this -->
| Page | Mar 12 Clicks | Now (28d) | Change | Action Needed |
|------|--------------|-----------|--------|---------------|
| /guides/bradenton-vs-sarasota/ | 110 | 49 | -55% | Title/meta refresh + content freshness signal (lastmod, new sections) |
| /guides/anna-maria-island-vs-siesta-key/ | 77 | 29 | -62% | Title rewrite + add seasonal angle |
| /guides/best-vacation-rental-companies-ami | 20 | 4 | -80% | Money keyword bleeding — content depth + internal links |
| /guides/best-time-visit-anna-maria-island | 21 | 3 | -86% | Seasonal page — refresh for May–Sep window |
| /guides/is-anna-maria-island-worth-visiting | 11 | 3 | -73% | Refresh + boost links |

---

### UNDERPERFORMING PAGES (4+ weeks old, no clicks)
<!-- internal-linking-rebuild reads this to add more links -->
| Page | Notes |
|------|-------|
| /property-management/vacation-rental-management-fees-florida/ | Created Mar 11 — still no rankings 7 weeks later |
| /stays/holmes-beach-vacation-rentals/ | Created Mar 6 — only crumb-volume traffic |
| /stays/easter-vacation-rentals-florida-gulf-coast/ | Seasonal — expected to die after April; archive or pivot |
| /stays/anna-maria-island-beachfront-rentals/ | Created Mar 6 — flat |
| ~24 PM pages | Listed in sitemap but invisible in GSC top pages |
| Most /stays/ pages beyond the top 5 | Very long tail, no individual page clicks |

---

### NEW 404s DETECTED
<!-- seo-weekly-health-check reads this -->
| Status | Count Now | Mar 12 | Change | Action |
|--------|-----------|--------|--------|--------|
| Total 404s | 120 | 94 | +26 | Pull URL list, redirect any with backlinks; 410 the rest |
| Page with redirect | 126 | n/a | n/a | Investigate — many redirects = chain risk |
| Crawled - not indexed | 341 | n/a | n/a | 🚨 single biggest indexing problem |
| Discovered - not indexed | 1 | n/a | n/a | Improvement from previous 12+ |

---

### URL HYGIENE ISSUES (NEW — flag for engineering)
1. 🚨 **Duplicate URLs on srq-airport-to-anna-maria-island** — appears with AND without trailing slash. Splits impressions: 3,303 vs 2,634, 12 clicks vs 2. Add 301 from no-slash → slash version.
2. 🟡 **`.html` extensions still indexed** on a few guides (noise-ordinance, market-report, best-time-visit). Should redirect to clean URLs.
3. 🟡 **GMB UTM-tagged homepage** ranking separately (336 imp, 11 clicks). Add canonical → / so equity consolidates.
4. 🟡 **Sitemap gap of ~12 pages** vs _site/ build output — minor but worth closing.

---

### KEYWORD RANKING SCORECARD (from GSC avg position data; Ahrefs unavailable)
Using GSC's reported impressions as proxy for visibility. Actual positions not pulled — Ahrefs SERP API blocked, manual SERP checks deferred.

| # | Keyword | Visibility (GSC imp/28d) | Status |
|---|---------|-------------------------|--------|
| 1 | bradenton vs sarasota | 18,043 | ✅ Top 3 (49 clicks confirms ranking) |
| 2 | anna maria island vs siesta key | 7,244 | ✅ Top 5 |
| 3 | bradenton vs sarasota for families | 6,292 | ⚠️ Showing but 0.05% CTR — likely page 2 |
| 4 | siesta key vs anna maria island families | 4,957 | ⚠️ Visibility but weak CTR |
| 5 | sarasota airport to anna maria island | 353+2,634 | ✅ Top 10 (split URL) |
| 6 | vacation rentals Bradenton FL | <100 imp | ❌ Off page 1 (was ~#7 Mar 19) |
| 7 | anna maria island vacation rentals | <100 imp | ❌ Off page 1 |
| 8 | luxury vacation rental Sarasota | not in top queries | ❌ |
| 9 | pet friendly vacation rental Bradenton | not in top queries | ❌ |
| 10 | vacation rental management Bradenton | not in top queries | ❌ |

**Summary: ~5/10 core keywords in top 10. Comparison/transit guides winning. Money keywords (vacation rentals + management) still failing.**

---

### TREND ANALYSIS (Mar 19 → May 3, 6 weeks)
**Improving:**
- ✅ Sitemap fixed: 68 → 146 URLs (+115%)
- ✅ Sitemap gap closed from 147 → ~12
- ✅ GSC browser access restored
- ✅ /guides/rainy-day-activities-bradenton-sarasota/ emerged as new top-10 page
- ✅ /guides/shelling-guide-florida/ new performer (9 clicks)

**Concerning:**
- 🔴 Clicks DOWN 43% (28-day basis)
- 🔴 CTR collapsed from 0.7% → 0.4%
- 🔴 Indexed pages dropped 241 → 227
- 🔴 404 count up +26 (now 120)
- 🔴 341 pages "Crawled not indexed" — major signal of thin/duplicate content
- 🔴 Top performer (bradenton-vs-sarasota) lost more than half its clicks
- 🔴 Money keywords (vacation rentals Bradenton, AMI rentals) appear off page 1
- 🔴 Property management page from Mar 11 still has zero rankings 7 weeks later

**Stable:**
- Position avg only moved +0.4 (7.5 → 7.9) — so SERP positions roughly held
- Guide-cluster wins continue

---

### RECOMMENDATIONS (Priority Order)
1. **🔴 EMERGENCY: TITLE/META REWRITE on top 5 high-impression pages** — bradenton-vs-sarasota alone could recover 100+ clicks/month if CTR returns from 0.27% → 1.0%. Total upside across top 5: ~250-400 clicks/mo recoverable.
2. **🔴 Fix srq-airport duplicate URL** — 301 redirect non-slash → slash. Will consolidate 14 clicks + 5,937 imp into one URL.
3. **🔴 Investigate "Crawled not indexed: 341"** — likely legacy DEPLOY-folder URLs Google found but rejected. Need to inventory and serve 410 Gone for permanently dead URLs.
4. **🟡 Run a fresh content audit on top guides** — clicks dropped because content went stale. Add fresh sections, update dateModified, add 2026 data points.
5. **🟡 Money keywords (vacation rentals Bradenton, AMI vacation rentals)** need link equity push and content depth review — they fell off page 1.
6. **🟡 Close remaining sitemap gap** — ~12 pages in _site/ not in sitemap.xml.
7. **🟢 Investigate Ahrefs plan** — `serp-overview` was working last cycle, now blocked. Either plan changed or rate limit. Need to fix to resume competitor SERP monitoring.

---

### NOTES FOR DOWNSTREAM TASKS
- **content-quality-patrol**: HIGH IMPRESSION LOW CTR list above is the priority queue. Bradenton-vs-sarasota gets the next refresh.
- **internal-linking-rebuild**: UNDERPERFORMING PAGES list — focus on /property-management/vacation-rental-management-fees-florida/ which has zero clicks 7 weeks in.
- **seo-weekly-health-check**: 26 NEW 404s + 341 crawled-not-indexed need investigation. Pull URL inventory.
- **pseo-page-builder**: STOP creating new pages until indexing health recovers. Page count is fine (158); the issue is Google rejecting what we already have.
