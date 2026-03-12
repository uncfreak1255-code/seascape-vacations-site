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
- Status: STARTED

### Outreach Monitor — 2026-03-12: Checking Gmail for replies from AMI Chamber, Manatee Chamber, 941area, FLARBO

### Mailchimp Welcome Sequence — 2026-03-12
- **Automation:** Customer Journey #8592, 3-email welcome sequence — **ACTIVE**
- **Email 1** (immediate): Welcome + SAVE50 coupon code, from "Sawyer from Seascape Vacations"
- **Email 2** (3 days later): Social proof — guest reviews, area guides, property highlights
- **Email 3** (7 days after signup): Urgency — "$50 code expiring soon," direct booking push, phone number
- **Trigger:** Contact signs up to "Seascape Vacations" list (95e5a594d1)
- **Old automation** (March 8): Paused — had 0 sends, replaced by new sequence
- **Status:** Live and ready for new subscribers
