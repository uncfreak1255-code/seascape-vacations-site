# Content Strategy 2026 — Seascape Vacations

*Created: 2026-05-17 | Owner: SEO Architect role*
*Input sources: product-marketing-context.md, keyword-ownership-map.md, current-state.md*

---

## Section 1: Content Strategy North Star

Seascape's content job is to intercept the Gulf Coast trip organizer at the moment they're narrowing their decision — destination, base, group fit — and give them the honest answer faster than an OTA can. The trip organizer (ages 30-55, planning for 8-16 people) has already decided to take the trip. What they haven't decided is whether Bradenton or Sarasota makes sense for their group, whether saving $500 in OTA fees is real or a trick, and whether they can trust a small operator enough to hand over their credit card without Airbnb as backstop. Winning in 12 months means Seascape owns the decision-stage queries — "Bradenton vacation rentals," "vacation rental near AMI that sleeps 12," "girls trip rental Florida" — and converts those clicks to direct bookings at a measurably higher rate than today's 2-impression stay-money baseline. The comparison guides are already the strongest organic asset; the rest of the site needs to catch up by fixing gaps, indexing what's buried, and consolidating cannibalization before adding any new pages.

---

## Section 2: Priority Tiers

### Now (next 4–6 weeks)

These are the highest-leverage moves from the keyword-ownership-map. They fix structural holes, not thin content expansion.

**1. Source-truth drift reconciliation**
- Not a content page — prerequisite for everything else.
- Amenity claims, BR/BA counts, and feature labels diverge across `properties-fallback.json`, per-property templates, and `llms.txt`. Fix on its own short worktree before any stay or owner content updates.
- Brief: reconcile all three sources against `properties.js` as single authority; propagate outward.

**2. Create `/stays/bradenton-vacation-rentals/` hub**
- Target keyword: "Bradenton vacation rentals" (head-of-funnel, unowned)
- Page type: destination hub
- Brief: Serve the first-time Bradenton searcher — who it's for (groups, near-AMI, pool-home value), what the base offers vs. on-island, and route cards to the five Bradenton-area facet pages that already exist. This page catches authority the current long-tail facets can't hold.

**3. Create `/stays/sarasota-vacation-rentals/` hub**
- Target keyword: "Sarasota vacation rentals" (head-of-funnel, unowned)
- Page type: destination hub
- Brief: Same structure as Bradenton hub — who Sarasota is for (culture-first, downtown proximity, Sarasota Luxe), honest tradeoff vs. Bradenton, and internal links to existing Sarasota facet pages. Don't lead with "luxury" — that's the current wrong frame.

**4. Index and fix girls trip / bachelorette cluster**
- Target keywords: "girls trip vacation rentals Florida," "bachelorette party rental Florida"
- Page type: trip-type stay pages (two pages, possibly consolidated into one)
- Brief: These are built and noindexed. Audit content quality. If thin, beef up with real amenity proof (pool, hot tub, outdoor entertaining) and group-trip math. Index. High commercial intent, near-zero current visibility.

**5. Fix homepage vs. Gulf Coast stay page cannibalization**
- Target keyword: "Florida Gulf Coast vacation rentals"
- Page type: canonical differentiation fix (no new page needed)
- Brief: Homepage claims brand + direct-book identity; `/stays/florida-gulf-coast-vacation-rentals/` owns destination discovery. Update homepage title and on-page signals to point authority clearly. Assign canonical role in portfolio doc.

---

### Next (6–12 weeks)

Second wave — trip-type and amenity gaps that compound once hubs are in place.

**6. Create `/stays/pet-friendly-vacation-rentals-florida/` (Florida-wide)**
- Target keyword: "pet-friendly vacation rental Florida"
- Page type: amenity stay page
- Brief: Pet owners search specifically and book with conviction. Current Bradenton-scoped pet page leaves the Oasis's pet-friendly status undersold. Build Florida-wide page with real proof from properties.js; internal link from Bradenton pet page.

**7. Index `/stays/winter-vacation-rentals-florida-gulf-coast/` and `/stays/summer-vacation-rentals-florida-gulf-coast/`**
- Target keywords: "winter vacation rental Florida Gulf Coast," "summer vacation rentals Gulf Coast"
- Page type: seasonal stay pages (existing, noindexed)
- Brief: Seasonal search intent is real and timed. These pages exist — audit content quality, fix if thin, then index. The snowbird page (already indexed) proves seasonal works; winter and summer should follow the same logic.

**8. Resolve romantic getaway vs. honeymoon AMI cannibalization**
- Target keywords: "romantic getaway Anna Maria Island" / "honeymoon rental Florida Gulf Coast"
- Page type: canonical consolidation
- Brief: Two pages, near-identical intent. Pick one as the owner — likely "romantic getaway" (broader, includes anniversaries) — redirect or canonicalize the other. Differentiate if both stay live: honeymoon = first trip, romantic = returning couples.

**9. Create `/stays/sleeps-10-vacation-rentals-florida/` or consolidate 3BR**
- Target keyword: "vacation rental sleeps 10 Florida" / "3 bedroom vacation rental Florida"
- Page type: group-size stay page
- Brief: Bradenton Pool Home (3BR/10 guests) has no aligned group-size page. Capture the smaller-group searcher who doesn't need to sleep 12+ and is currently unserved.

**10. Resolve 4BR / sleeps-12 cannibalization**
- Target keywords: "4 bedroom vacation rental Florida" / "vacation rental sleeps 12 Florida"
- Page type: canonical differentiation
- Brief: Both pages serve the same three properties. Differentiate clearly — 4BR page leads with bedroom count and family-room logistics; sleeps-12 page leads with group-size planning math and the $450-$550/night total cost angle. Or consolidate into one with clear canonical ownership.

---

### Later (12+ weeks)

Hold until hub pages are indexed, cannibalization is resolved, and operator data shows which clusters are moving.

- Spring break page (`/stays/spring-break-rentals-anna-maria-island/`) — noindexed; revisit when seasonal index pass is measured.
- Activity page depth (fishing, kayaking, golf, dolphin watching) — currently thin on differentiation; add real itinerary content only after Bradenton hub is established to pass authority down.
- Family reunion index and content fix (`/stays/family-reunion-rentals-florida/` is noindexed).
- Retirement / babymoon / beach wedding niche pages — low volume, index only after higher-priority clusters are measured.
- Programmatic expansion (new geo spokes, new long-tail facets) — freeze until Phase 4 gates in `docs/status/next-batch.md` are cleared.

---

## Section 3: Content Rules for AI Agents

Load this section before writing any guest-facing content page.

### Who the reader is

The trip organizer — typically 30–55, US-based, coordinating a group vacation for 8–16 people (family reunion, multi-family, milestone celebration, girls trip, friend group). They are doing research, not browsing. They have a trip in mind and are narrowing where to stay and whether to book direct. They may or may not know the Gulf Coast; they almost certainly know Airbnb.

### What they're deciding

- **Trip shape:** Which base fits the group? Bradenton vs. Sarasota vs. on Anna Maria Island. Beach-first vs. pool-first vs. city-first.
- **Group fit:** Does this property sleep everyone? Is there space to gather (outdoor area, kitchen, game room)?
- **Direct-book math:** Is it actually cheaper than Airbnb? What's the real price?
- **Trust:** Is this a real operator? Will the home look like the photos?

### What makes a page pass

- First paragraph answers the real question without requiring the reader to scroll.
- Tradeoffs are named explicitly — who this base/property is for and who it's not for.
- Every amenity claim traces to `properties.js` or `ownerProofAssets.json`. No invented gear, padded occupancy, or fake waterfront.
- Drive times, fee math, and group-fit guidance use real numbers.
- Page ends with a clear booking or availability CTA — not a generic "learn more."
- Tone: direct, locally-grounded, specific. Not gushy, not tourism-board generic.

### What makes a page fail

- Opens with a destination description instead of the visitor's decision.
- Uses banned words: luxury (standalone), nestled, curated, seamless, unparalleled, resort-style, boasts, myriad.
- Claims trace to nothing — invented amenities, padded sleeps count, false beachfront language on near-island pages.
- Duplicate intent with no differentiated angle — two pages competing on the same queries with the same properties.
- Noindexed with no documented reason.
- Internal links point nowhere — page exists but has no feeder pages and no destination to route to.

### 3 questions before the page is done

1. **Does the page answer the trip organizer's real question in the first paragraph?** If the reader bounces after 20 seconds, do they leave with a useful answer?
2. **Does every claim trace to `properties.js` or `ownerProofAssets.json`?** No amenity, occupancy, or feature claim that cannot be verified against source truth.
3. **Is there a clear next step toward booking?** A Check Dates link, a direct comparison to OTA pricing, or a route card to the right property — not a dead-end paragraph.

---

## Section 4: Anti-patterns to Stop

**1. Building destination facets without a hub root.**
Bradenton has 8+ stay pages and zero hub. Sarasota has 4 stay pages and zero hub. Search authority is distributed across facets with nowhere to consolidate. Every new facet page opened before the hub exists makes the problem worse.

**2. Leaving high-commercial-intent pages noindexed with no documented reason.**
Girls trip, bachelorette, anniversary, retirement, spring break, winter, summer, and beach wedding pages are all built and noindexed. Collectively these represent multiple high-intent trip-type clusters earning zero organic impressions. If the reason is thin content, fix it. If there's no reason, index it.

**3. Homepage competing for destination discovery queries.**
"Luxury Vacation Rentals AMI, Bradenton & Sarasota" in the homepage title pulls the homepage into the same SERP family as stay cluster pages. The homepage should own brand and direct-book queries; destination discovery belongs to cluster pages. Letting these compete splits authority and dilutes both.

**4. Romantic/honeymoon and 4BR/sleeps-12 page pairs with undifferentiated angles.**
Two near-identical pages fighting for the same queries on the same inventory. Google will rank one, deprioritize the other, and neither will reach its ceiling. Both pairs need a canonical resolution — consolidate, differentiate, or redirect.

**5. Activity pages that describe the destination instead of the trip.**
Fishing, kayaking, golf, and dolphin watching pages currently explain what's available near Bradenton. They do not explain what makes Seascape properties the right base for those activities. Without that differentiation, they read like OTA landing page filler and rank accordingly.

---

## Section 5: Measurement

These are the 4–5 KPIs that signal the content strategy is working. All tied to direct booking outcomes, not vanity traffic.

| KPI | What it measures | Target direction |
|-----|-----------------|-----------------|
| **Direct booking revenue share** | % of total revenue from seascape-vacations.com vs. OTA channels | Increase quarter-over-quarter |
| **Stay-money cluster impressions** | GSC impressions for stay pages (current baseline: 2 impressions/week per current-state.md) | Clear 500/week within 12 weeks of hub page indexing |
| **Owner lead form submissions** | Qualified owner inquiries from `/property-management/` cluster | Target 2+ per month from organic |
| **Click yield on stay money pages** | Clicks ÷ impressions for the Bradenton hub, Sarasota hub, and top 5 stay pages | CTR above 3% — currently below action threshold |
| **Noindexed page debt** | Count of pages built but noindexed with no documented governance reason | Target: 0 undocumented noindexes within 6 weeks |

Do not track: total pageviews, social shares, blog traffic, or any metric not traceable to a booking or owner lead.

---

*This document is the single "what should we write and why" reference for 2026. Operational batch details belong in `docs/briefs/`. Execution state belongs in `docs/status/current-state.md`. Update this document when a strategic call is made or reversed — not on a monthly cadence.*
