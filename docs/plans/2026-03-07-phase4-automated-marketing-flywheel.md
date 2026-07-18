# Phase 4: Automated Marketing Flywheel
> Created: 2026-03-07 | Budget: $0/mo fixed cost | Goal: Full automated system with minimal manual effort

> **Historical plan; provider and sender instructions are superseded.** Do not
> activate Mailchimp, Gmail, Hostaway, or any Site-owned campaign sender from
> this document. All Seascape outbound campaigns use Microsoft 365 / Outlook
> from `info@seascape-vacations.com` through the Ops-owned Graph lane. Personal
> Gmail and every other role mailbox are prohibited campaign senders. This file preserves
> content and funnel ideas only.

---

## Overview

Phase 4 builds the marketing engine that runs itself. Everything here is either free or pay-per-result, layered so each tier feeds the next. Execute after Phase 2 (trust/design) and Phase 3 (SEO domination) are complete.

**Two audiences, one flywheel:**
- **Vacationers** — book direct stays at 5 Gulf Coast properties
- **Property owners** — consider Seascape for vacation rental management

---

## Tier 1: Email Automation (historical provider proposal)

**Historical status:** Mailchimp was connected and a popup was present. This is
not current authorization to activate a Mailchimp campaign or sender.

### Immediate Actions
1. **Expand email popup** to all 130+ stays/guides pages (currently only homepage + /properties/)
2. **Prepare welcome-sequence content** for the Ops-owned Outlook campaign lane:
   - Email 1 (immediate): "Your $50 code is SAVE50" + top 3 properties + area guide links
   - Email 2 (Day 3): "Planning your Gulf Coast trip?" + seasonal content + booking CTA
   - Email 3 (Day 7): "Still dreaming of the beach?" + urgency/availability + direct booking link
3. **Prepare monthly newsletter content**: seasonal highlights, new content,
   property availability. Sending remains outside this repo.

### Retired Provider Migration Idea

The former Mailchimp-to-Listmonk migration proposal is not executable and is
not campaign authority. Git history preserves the old provider steps. Any
future capture-backend change must be scoped separately in the repo that owns
capture; campaign delivery remains exclusively Ops-owned Outlook `info@` and
Phase 1 hard-disabled.

### Metrics
- Email capture rate: target 3-5% of page visitors
- Welcome sequence open rate: target 40%+
- Click-to-book rate: target 5-8%

---

## Tier 2: Content Repurposing Engine ($0/mo)

Turn every SEO page into 3-5 pieces of social content with zero extra research.

### Automated Workflow
For each new content page published (Wed + Fri scheduled tasks):

1. **Extract 3 social posts** — pull key facts, tips, or comparisons from the page
2. **Create 1 email snippet** — add to monthly newsletter draft
3. **Generate 1 Google Business Profile post** — local SEO signal + direct link

### Platforms (Free, Organic Only)
| Platform | Content Type | Frequency | Audience |
|----------|-------------|-----------|----------|
| Google Business Profile | Posts + photos | 2x/week | Vacationers (local search) |
| Facebook (business page) | Area tips, property highlights | 3x/week | Vacationers |
| Instagram | Property photos, area reels | 2x/week | Vacationers |
| LinkedIn | Market insights, management tips | 1x/week | Property owners |
| Pinterest | Destination pins linking to guides | 5x/week | Vacationers (evergreen traffic) |

### Pinterest Strategy (Highest ROI for $0)
- Every area guide and stays page becomes a pin
- Rich pins with property photos → link to booking page
- Pinterest drives traffic for 6-12 months per pin (unlike social which dies in 24hrs)
- Target: 50 pins in first month, 10/week ongoing

---

## Tier 3: Review & Reputation Flywheel ($0/mo)

### Historical Review-Content Concepts (not executable)

- post-checkout thank-you/review-request content
- later review reminder content
- drafts for human-reviewed public review responses

These are content ideas only. They do not authorize an automation, schedule,
canary, or send. Outlook delivery stays Phase 1 hard-disabled until Microsoft
admin scope proof and a separate reviewed Phase 2.

### Review Amplification
- Pull best quotes into property pages (already started in Phase 1)
- Add to email signature: "Rated 4.9/5 by 200+ guests"
- Create a `/reviews/` page aggregating all platforms
- Schema markup: `AggregateRating` on property pages

### Targets
- Google reviews: 5+ new per month
- Response rate: 100%
- Average rating maintained: 4.8+

---

## Tier 4: Referral & Partnership Engine ($0 fixed / pay-per-result)

### Guest Referral Program
- Returning guest gets $75 off next stay when they refer a friend
- New guest gets $50 off first stay (SAVE50 code)
- Track via unique referral codes in Hostaway
- Announce in post-stay email sequence

### Local Business Cross-Promotion
Target 10 partnerships in first 90 days:
1. **Fishing charters** — they recommend us to clients, we recommend them in guides
2. **Boat rentals** — same mutual referral structure
3. **Restaurants** — "Seascape Guest" discount card, we feature them in area guides
4. **Beach equipment rentals** — include their flyer in welcome packet, they display our cards
5. **Real estate agents** — they refer new vacation rental owners to our management service

### Link Building Through Partnerships
Every partner = potential backlink:
- "Recommended lodging" on their website
- Guest post swap on their blog
- Joint "Best of Bradenton" content

---

## Tier 5: Property Owner Acquisition ($0/mo)

### Content Funnel for Owners
Already have 31 property-management pages. Add:
1. **"Vacation Rental Income Calculator"** — interactive tool, captures email
2. **Monthly market report** — "Bradenton Vacation Rental Market: March 2026" → email-gated
3. **Comparison content** — "Self-Managing vs. Professional Management: Real Numbers"
4. **Case studies** — anonymized P&L from actual properties (with owner permission)

### Outreach Automation
1. **Identify targets**: Web search for VRBO/Airbnb listings in Bradenton/Sarasota with poor reviews or stale calendars
2. **Prepare personalized outreach content** for review; any approved campaign
   is delivered only through the Ops-owned Outlook `info@` lane
3. **Follow-up sequence**: 3 emails over 2 weeks, each with different value prop
4. **LinkedIn outreach**: Connect with local property investors, share market insights

---

## Tier 6: GEO + AI Citation Acceleration ($0/mo)

### Already Running
- 15 scheduled SEO tasks (see CLAUDE.md for full schedule)
- Bi-monthly GEO citation audits
- AI-friendly structured data on all pages

### Additional Automation
1. **Test AI citations weekly** (expand from bi-monthly): Query ChatGPT, Perplexity, Google AI Overviews with 10 target keywords → log which competitors get cited, track our progress
2. **Structured data enrichment**: Add `speakable` schema to key FAQ answers so voice assistants can read them
3. **"Research report" content**: Quarterly "State of Bradenton Vacation Rentals" report — AI engines love citing data-backed reports
4. **Answer engine optimization**: For every FAQ answer, write a 2-3 sentence "quotable snippet" that AI can extract directly

---

## Implementation Timeline

| Week | Actions |
|------|---------|
| Week 1 | Historical: expand email capture and prepare welcome-sequence content; provider activation is superseded |
| Week 2 | Set up Google Business Profile posting cadence, create first 20 Pinterest pins |
| Week 3 | Prepare post-stay review-request content only; any launch waits for Microsoft admin scope proof and a reviewed Outlook Phase 2 activation change. Draft 5 local business partnership proposals |
| Week 4 | Create referral program structure, publish first "market report" for property owners |
| Month 2 | Optimize based on data — double down on what converts, cut what doesn't |
| Month 3 | Historical provider-migration idea retired; expand partnership network and publish the quarterly GEO report |

---

## What This Does NOT Include (Saved for Phase 5)

- **Paid advertising** (Meta/Google Ads) — only after organic flywheel is producing consistent traffic
- **Meta ads automation** via OpenClaw — promising but premature; build organic foundation first
- **Influencer marketing** — revisit when budget allows $200-500/month
- **PR/press releases** — revisit when there's news worth distributing ($200-400/placement)

---

## Success Metrics (90-Day Targets)

| Metric | Current | 90-Day Target |
|--------|---------|---------------|
| Email subscribers | 5 | 200+ |
| Monthly organic traffic | ~unknown | 2,000+ sessions |
| Google reviews | ~10 | 25+ |
| Pinterest monthly impressions | 0 | 5,000+ |
| AI citation appearances | 0 tracked | 3+ queries citing us |
| Direct bookings from SEO | 0 tracked | 5+ |
| Local business partnerships | 0 | 10 |
| Property owner leads | 0 | 5+ |
