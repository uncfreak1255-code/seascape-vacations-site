# Monthly SEO Summary — March 2026
**seascape-vacations.com** | Generated: 2026-03-28

---

## The Headlines

**Best month yet for organic growth.** 28-day rolling clicks hit 409 (+22.5% vs prior period), impressions reached 61K (+15.1%), and indexed pages jumped from 204 to 241 (+37). The big win: bradenton-vs-sarasota climbed from #2 to **#1**, overtaking Tripadvisor. The big problem: the Bradenton FL money page went 404 and killed our second top-10 ranking.

---

## Traffic (GSC data through Mar 12 — no fresh data since)

| Metric | 28-Day (as of Mar 12) | Change |
|--------|----------------------|--------|
| Clicks | 409 | +22.5% |
| Impressions | 61,000 | +15.1% |
| Avg CTR | 0.7% | +0.1pp |
| Avg Position | 7.5 | -0.1 (slight regression) |
| Indexed Pages | 241 | +37 new pages indexed |

**Important caveat:** GSC browser access has been down since Mar 12 (3 consecutive weeks of timeouts). These are the last reliable numbers we have. Real traffic could be materially different by now.

---

## Keyword Wins & Losses
**Won:**
- "bradenton vs sarasota vacation" → **#1** (was #2). Our top page — 110 clicks/28d, 22K impressions. Now above Tripadvisor.
- "bradenton vs sarasota for families" → **#6** (new entry). Wasn't ranking at all before.
- "bradenton vs sarasota for vacation rental" → **#1-4** (4 Seascape pages in top 10). Strongest query overall.

**Lost:**
- "vacation rentals Bradenton FL" → **dropped out of top 10** (was ~#7). Cause: /stays/vacation-rentals-bradenton-florida/ returning 404 on Netlify despite file existing in git. This is our top money keyword.

**Unchanged (still outside top 10):**
- AMI vacation rentals, waterfront rentals, pet-friendly, luxury, fishing, management keywords — all still >10. These are the transactional queries that would drive bookings. The comparison/informational guides rank; the booking-intent pages don't yet.

**Scorecard: 1/15 tracked keywords in top 10** (was 2/15 before the 404).

---

## Content Published This Month

4 new pages created, 30+ pages optimized:

| Page | Date | Target Keyword |
|------|------|---------------|
| /stays/holmes-beach-vacation-rentals/ | Mar 6 | holmes beach vacation rentals |
| /stays/easter-vacation-rentals-florida-gulf-coast/ | Mar 6 | easter vacation rentals florida (expanded to 1,978 words on Mar 13) |
| /stays/anna-maria-island-beachfront-rentals/ | Mar 6 | anna maria island beachfront rentals |
| /property-management/vacation-rental-management-fees-florida/ | Mar 11 | vacation rental management fees florida |

**Major optimizations:**
- False waterfront claims cleaned across 14 files (was claiming all 5 homes are waterfront — only Dockside Dreams is)
- CTR title/meta rewrites on 5 highest-impression pages
- Freshness "Updated March 2026" badges on 9 guide pages
- Two internal link rebuilds: 39 new contextual links across 32 pages
- GEO citation-ready hero blocks added to 7 pages with real stats ($301 ADR, $41K-$51K revenue, etc.)
- Schema upgrades: LocalBusiness, SpeakableSpecification, expanded FAQ schemas

---

## Technical SEO

**Sitemap: Fixed.** Went from 68 URLs to 204 URLs (gap closed from 147 pages to 11). Google can now discover 95% of site content. The /stays/ and /property-management/ sections are fully covered. Only 11 "other" pages (homepage utilities) still missing.

**Indexing: Strong.** 241 pages indexed (+37 in the first two weeks). New pSEO pages from Mar 6 were discovered by Google within a week.

**404s: One critical, 94 legacy.** The /stays/vacation-rentals-bradenton-florida/ 404 is the only one that matters right now — it's actively costing rankings. The 94 legacy 404s are old /travel-spot-guide/ and /blog/ URLs from a previous platform.

**Broken internal links:** 843 broken links fixed in early March. 62 remaining broken links point to guide pages that don't exist yet (snowbirds, market-analysis, beaches, restaurants, fishing, where-to-stay).

**Mailchimp:** 3-email welcome sequence activated (Welcome + SAVE50 → Social proof → Urgency close). Live and waiting for subscribers.

---

## GEO / AI Citations

**Score: 3/20 queries cited** (up from 2/20 on Mar 15).

Seascape is cited in Google organic results for 3 queries (bradenton-vs-sarasota at #1, bradenton-vs-sarasota-for-families at #6, bradenton-vs-sarasota for vacation rental at #1-4). But Perplexity cites us on **zero** queries — even where we rank #1 organically. 

**Root cause: Domain Authority.** DA is 4. Perplexity and AI Overviews strongly favor DA 40+ sources. Content quality alone won't win AI citations without backlink investment. This is the single biggest bottleneck for AI visibility.

---

## Link Building

- Yelp business account created (local citation)
- Gmail drafts prepared for: AMI Chamber, Manatee Chamber, 941area.com, FLARBO
- **None of the outreach emails have been sent.** They're sitting in Gmail drafts waiting for Saw to review and hit send.
- Hostaway support contacted re: 2 Google Vacation Rentals listings that won't publish

---

## Issues Needing Immediate Attention
1. **🔴 /stays/vacation-rentals-bradenton-florida/ is 404.** File exists in git, sitemap, and deploy folder — Netlify just isn't serving it. Was ranking ~#7 for "vacation rentals Bradenton FL" (our top money keyword). Fix: trigger a fresh Netlify deploy or investigate deploy cache. Every day this stays broken, we lose ranking equity.

2. **🔴 GSC has been inaccessible for 3 weeks.** Browser automation keeps timing out. We're flying blind on real traffic data. Switch to the API-based GSC MCP server at ~/Projects/mcp-gsc/.

3. **🟡 Ahrefs is dead.** Every endpoint returns "Insufficient plan." No competitive data, no backlink monitoring, no keyword difficulty scores. Need paid plan or alternative tool.

4. **🟡 Outreach emails unsent.** 4 link-building drafts have been in Gmail since Mar 9. These are the easiest backlinks available — chamber of commerce and local directory listings.

5. **🟡 Serpbear still unconfigured.** Installed and running but 0 keywords tracked. No automated rank monitoring.

---

## April Priorities

1. **Fix the 404** — this is job #1, takes 5 minutes, restores a top-10 ranking
2. **Send the outreach emails** — 4 drafts in Gmail, 10 minutes of work, starts building DA from 4 toward 15+
3. **Get fresh GSC data** — switch to API-based MCP, stop relying on browser automation
4. **CTR optimization on bradenton-vs-sarasota** — sitting at #1 with 0.5% CTR across 22K impressions. A meta rewrite to 2% CTR = +330 clicks/month from one page.
5. **Push best-vacation-rental-companies-ami into top 10** — currently ~#13-18, money keyword, needs content depth
6. **Create missing guide pages** — 62 broken internal links point to guides that don't exist (snowbirds, restaurants, beaches, fishing, where-to-stay). Each one created fixes broken links AND adds content.

---

*Summary generated by automated SEO task. Data sources: task-log-2026-03.md, rank-tracker-latest.md, rank-tracker-2026-03-12.md, rank-tracker-2026-03-19.md, rank-tracker-2026-03-27.md, content-priorities-2026-03.md, geo-audit-2026-03-13.md, competitor-intel-2026-03.md.*