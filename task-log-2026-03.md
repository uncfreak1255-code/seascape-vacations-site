# Task Log — March 2026

### Internal Linking Rebuild — 2026-03-05
- Total pages: 172 | Orphans found: 43 | Orphans fixed: 42
- Broken links found/fixed: 843 (551 old area-guide URLs, 263 missing .html extensions, 29 wrong slugs)
- Generic anchors improved: 0 (none found)
- New internal links added: 15 across 11 pages
- Cluster health: Bradenton 48%, AMI 7%, PM 16%
- Deploy: ✅ (GitHub auto-deploy triggered by push to main)

### pSEO Build — 2026-03-06
- New pages:
  - [holmes-beach-vacation-rentals](https://seascape-vacations.com/stays/holmes-beach-vacation-rentals/) — target: "holmes beach vacation rentals"
  - [easter-vacation-rentals-florida-gulf-coast](https://seascape-vacations.com/stays/easter-vacation-rentals-florida-gulf-coast/) — target: "easter vacation rentals florida gulf coast"
  - [anna-maria-island-beachfront-rentals](https://seascape-vacations.com/stays/anna-maria-island-beachfront-rentals/) — target: "anna maria island beachfront rentals"
- Keywords targeted: KD/volume unavailable (Ahrefs free plan insufficient for Keywords Explorer). Selected via web search competitive analysis — all low-competition long-tail terms.
- Word counts: ~1,400 / ~1,350 / ~1,450 (estimated from content length)
- Format rotation: Type C (local story) → Type B (quick answer box) → Type A (comparison table)
- seoPages.json updated: ✅ (61→64 vacationer entries)
- Internal links added: 11 (from existing related pages)
- Sitemap updated: ✅ (3 new URLs)
- Deploy: ✅ (git push to main → Netlify auto-deploy, all 3 pages confirmed live with 200 status)

### 90-Day SEO Plan — Phase 1 Quick Wins — 2026-03-09

**CTR Optimization (5 pages):**
- bradenton-vs-sarasota.html: title rewrite ("A Local's Honest Take"), meta adds "25-35% cheaper" data point. 19,874 imp × projected 1.5% CTR = +218 clicks/mo
- anna-maria-island-vs-siesta-key.html: title rewrite ("AMI vs Siesta Key"), meta adds "#1-ranked sand vs zero high-rises + 30% lower prices". 12,162 imp × projected 1.8% = +146 clicks/mo
- index.html: title adds property count ("5 Waterfront Homes"), meta adds "4.8-star reviews" social proof
- best-time-visit-anna-maria-island.html: meta adds "80°F, rates drop 30%, book 3 months ahead" specifics
- best-vacation-rental-companies-ami.html: title uses full "Anna Maria Island", meta adds fee range "(8-20%)" and curiosity hook
- All 5 pages: og/twitter tags updated, dateModified → 2026-03-09

**Freshness Badges (9 pages):**
- Added visible "Updated March 2026" badge (inline-styled) after H1 on 7 guide pages
- 2 pages already had date text — left unchanged
- Badge style: #5F8A8B background, white text, 0.85rem, rounded

**Link Building Outreach (Gmail drafts created):**
- Master action-item email with 4 Tier 1 targets (AMI Chamber, Manatee Chamber, 941area, FLARBO)
- 941area.com submission guide with NAP details and description copy
- FLARBO listing guide with property recommendations and pricing
- Mailchimp welcome sequence setup instructions (30-min one-time task)

**Deploy:** ✅ (2 commits pushed, all changes verified live on 3 sample pages)
**Plan file:** ~/.claude/plans/humming-drifting-wigderson.md

### False Property Claims Cleanup — 2026-03-11
- **Problem:** Homepage and 13+ pages falsely claimed all 5 properties are "waterfront" with "boat docks." Only Dockside Dreams is waterfront with a dock.
- **Scope:** ~61 replacements across 14 files (homepage + 12 stays pages + 1 property-management page)
- **Key fixes:**
  - Homepage title: "5 Waterfront Homes" → "5 Luxury Vacation Homes"
  - Homepage comparison table: The Oasis corrected from 10→16 guests, "waterfront"→"Bradenton", "Deep water dock"→"2 Hot Tubs"
  - River House tags: ["Waterfront"] → ["Near River"] across all appearances
  - All plural "waterfront homes/properties" claims → specific Dockside Dreams references
  - Replaced "boat docks" with real amenities (heated pools, hot tubs, game rooms)
- **Commits:** 95e8996 (26 fixes across 13 pages), 735958d (35 more fixes including homepage + 13 additional pages)
- **Deploy:** ✅ (git push → Netlify auto-deploy, homepage title verified live)

### Content Creation — 2026-03-11
- **Content priority alignment:** Spring Break + Easter theme (PM owner acquisition — Week 2 rotation)
- **New pages created:**
  - `/property-management/vacation-rental-management-fees-florida/` — "Vacation Rental Management Fees Florida: 2026 Guide"
- **Target keywords:** vacation rental management fees Florida (primary), how much do vacation rental managers charge in Florida (secondary)
- **Format:** Type D (FAQ-style navigation anchor links opening into expanded sections)
- **Word count:** ~2,100 words
- **GEO block:** ✅ 155-word citation-ready summary with $301 ADR, $41K–$51K annual revenue, 20–35% fee range stats
- **Schemas:** FAQPage (6 Q&As), Service, Article, BreadcrumbList
- **Data tables:** 5 (fee ranges by type, market stats, hidden fees, annual cost scenarios, break-even analysis)
- **Internal links added:** 4 outbound (to existing PM pages) + 4 backlinks from existing pages (self-manage, maximize-income, AMI management, new-owner-guide)
- **Sitemap:** ✅ URL added with `<lastmod>2026-03-11</lastmod>`, priority 0.8
- **Deploy:** ✅ (git push b5a8412 → Netlify auto-deploy, title tag verified live)

### Link Building Progress — 2026-03-11
- **Yelp:** Business account created ✅ (local citation, NAP consistency)
- **Pending outreach:** AMI Chamber, Manatee Chamber, 941area, FLARBO (Gmail drafts created 2026-03-09, awaiting user review/send)
- **Hostaway support:** Gmail draft created re: Google Vacation Rentals — 2 listings won't publish (The Oasis #189511, Bradenton Pool Home #487798)

### Internal Linking Rebuild — 2026-03-12
- Rank-tracker data used: ✅ (5 striking-distance pages boosted, 0 new pages needed links, 0 dropping pages reinforced)
- Total pages: 191 | Orphans found: 7 | Orphans fixed: 7 (3 zero-inbound + 4 low-inbound)
- Broken links found/fixed: 9 URL corrections (simple href fixes for .html extensions, area-guide self-refs, trailing-quote typos). 62 remaining broken links point to non-existent guide pages (snowbirds, market-analysis, beaches, restaurants, fishing) — these need content creation, not link fixes.
- Generic anchors improved: 0 (none found)
- New internal links added: 24 across 21 pages
- Key link additions:
  - 3 orphan pages de-orphaned: book-direct-vs-airbnb-vrbo (0→3), anna-maria-island-vs-clearwater-beach (0→3), book-direct (0→3)
  - 4 low-inbound pages boosted: siesta-key-beach rentals, elevator rentals, flights-to-ami
  - 5 striking-distance pages reinforced: best-vacation-rental-companies-ami (pos 14.6, +5 links), SRQ-to-AMI (pos 6.7, +2), is-AMI-worth-visiting (pos 4.9, +2), best-time-visit-AMI (pos 4.4, +1), bradenton-vs-sarasota (pos 2.4, +1 outbound to orphan)
  - 2 top-performer pages used as link equity sources: bradenton-vs-sarasota, ami-vs-siesta-key
- Cluster health: Bradenton 17.5%, AMI 15.6%, PM 15.7% (up from 48/7/16 last week — note: methodology refined to count all cluster-internal links, not just new additions)
- Still broken (need content creation): /guides/snowbirds-guide-extended-stays-florida/, /guides/2026-bradenton-vacation-rental-market-analysis/, /guides/florida-gulf-coast-vacation-rental-market-report-2026/, /guides/anna-maria-island-beaches/, /guides/best-restaurants-anna-maria-island/, /guides/fishing-guide-anna-maria-sarasota/, /guides/where-to-stay-anna-maria-island/
- Still missing: /property-management/ and /stays/ hub index pages (220 nav links point to these)
- Deploy: ✅ (git push 5b0e63b → Netlify auto-deploy, 3 pages verified live)

### Outreach Monitor — 2026-03-12: Checking Gmail for replies from AMI Chamber, Manatee Chamber, 941area, FLARBO

### Rank Performance Tracker — 2026-03-12
- GSC 28-day totals: 409 clicks (+22.5%), 61K impressions (+15.1%), 0.7% CTR, pos 7.5
- GSC 7-day (Mar 4-10): 100 clicks, 13.1K impressions, 0.8% CTR, pos 8.4
- GSC 7-day (Feb 25-Mar 3): 141 clicks, 21.8K impressions, 0.6% CTR, pos 8.5
- WoW: -29% clicks / -40% impressions — attributed to GSC 2-3 day data lag, not actual decline. 28-day trend is the signal.
- Pages indexed: 241 (was 204 on Mar 8) → **+37 new pages indexed** ✅
- 404 count: 94 (was 90) → +4 new 404s, investigate for backlinks
- New pages discovered by Google: 12 (was 2) → pSEO pages from Mar 6 being found
- Keywords tracked via Serpbear: 0 — domain not configured in Serpbear UI ⚠️
- Top performer: /guides/bradenton-vs-sarasota at 110 clicks (+24%), 22K impressions, pos ~2.4
- High imp/low CTR flags: bradenton-vs-sarasota (0.5%), ami-weather (0.4%), srq-airport (0.5%)
- CTR optimization upside: bradenton-vs-sarasota alone at 22K imp → going 0.5%→1.5% = +220 clicks/mo
- Action: Set up Serpbear domain tracking (seascape-vacations.com + 25 target keywords via localhost:3000)
- Files: rank-tracker-latest.md overwritten, rank-tracker-2026-03-12.md archived

### Mailchimp Welcome Sequence — 2026-03-12
- **Automation:** Customer Journey #8592, 3-email welcome sequence — **ACTIVE**
- **Email 1** (immediate): Welcome + SAVE50 coupon code, from "Sawyer from Seascape Vacations"
- **Email 2** (3 days later): Social proof — guest reviews, area guides, property highlights
- **Email 3** (7 days after signup): Urgency — "$50 code expiring soon," direct booking push, phone number
- **Trigger:** Contact signs up to "Seascape Vacations" list (95e5a594d1)
- **Old automation** (March 8): Paused — had 0 sends, replaced by new sequence
- **Status:** Live and ready for new subscribers

### Competitor Intelligence + GEO Audit — 2026-03-12
- Competitors analyzed: 6 (Anna Maria Beach Life, Island Real Estate, Vacasa, Evolve, Anchor Down, Renjoy/Awning)
- Content gaps found: 3 | Gaps closed (new pages): 3
- Pages improved: 5 (weather, best-companies-ami, ami-vacation-rentals, spring-break-ami, pm-bradenton)
- Outreach templates created: 3 (saved: outreach-templates-2026-03.md)
- AI citation opportunities identified: 4
- New competitor threats flagged: 2 (Renjoy/Awning owner acq; Anchor Down activities content)
- Sitemap: +3 URLs
- Deploy: ✅ All 3 new pages live, verified 200
- Full report: competitor-intel-2026-03.md
