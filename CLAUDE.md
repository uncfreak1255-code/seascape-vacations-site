# CLAUDE.md — Seascape Vacations SEO Agent

> You are the SEO and GEO (Generative Engine Optimization) agent for seascape-vacations.com.
> Every action you take should measurably improve organic visibility, AI engine citations, or direct bookings.

---

## Project Context

**Business:** Seascape Vacations — luxury vacation rental management in Florida's Gulf Coast
**Phone:** (941) 704-8545 | **Email:** info@seascape-vacations.com
**Properties:** 5 homes (4 in Bradenton, 1 in Sarasota) — The Oasis, Dockside Dreams, River House, Bradenton Pool Home, Sarasota Luxe
**Two audiences:**
1. **Vacationers** — searching for rentals in AMI, Bradenton, Sarasota, Siesta Key, Longboat Key
2. **Property owners** — considering management services for their vacation rental

### Property Quick Reference (Verified via Hostaway API 2026-03-11)
> **EVERY agent MUST use this data when writing content. Do NOT invent amenities.**

| Property | ID | BR/BA | Guests | Pool | Hot Tub | Waterfront | Pets |
|----------|--------|-------|--------|------|---------|------------|------|
| The Oasis | 189511 | 5/3 | 16 | Yes ($40/n) | 2 hot tubs | No | Dogs <30lb |
| Dockside Dreams | 206016 | 4/3 | 12 | Yes ($40/n) | Yes | **Yes** — dock + bay | Dogs <30lb |
| River House | 135880 | 4/3 | 12 | Yes | Yes | Near river (not on water) | Dogs <30lb |
| Bradenton Pool Home | 487798 | 3/3.5 | 10 | Yes | In-ground spa | No | **No** ($1K fine) |
| Sarasota Luxe | 135881 | 4/3 | 12 | Yes ($40/n) | Yes (screened lanai) | No | Dogs <30lb |

**CRITICAL — Things That Are FALSE (Never Write These):**
- ❌ NO complimentary kayaks, paddleboards, fishing gear, or bikes at ANY property
- ❌ Only 1 property is waterfront (Dockside Dreams) — never say "waterfront homes" plural
- ❌ Never say "all homes sleep 12+" — Bradenton Pool Home sleeps 10
- ❌ Never claim equipment is included beyond beach chairs + cooler

**What IS included at every property:** Beach chairs, cooler, fully stocked kitchen, WiFi, TVs in every bedroom, Pack N Play

**Full property database with addresses, distances, amenity lists:** See `memory/property-database.md`

**Live site:** https://seascape-vacations.com
**GitHub:** https://github.com/uncfreak1255-code/seascape-vacations-site.git
**Hosting:** Netlify (site ID: `380fdf4b-91dd-4c6d-a31c-252c07aade81`)
**Stack:** Static HTML site deployed to Netlify
**Domain authority:** Low (new site) — prioritize low-competition long-tail keywords

---

## Repository Structure

```
/                               # Source repo root
├── DEPLOY THIS FOLDER TO NETLIFY/  # ← THIS is what gets deployed to Netlify
│   ├── index.html              # Homepage
│   ├── stays/                  # 96 programmatic SEO pages (vacationer-facing)
│   ├── guides/                 # 55 area guides (informational content)
│   ├── travel-spot-guide/        # 8 restored restaurant/activity pages (high-traffic from old platform)
│   ├── properties/             # 5 individual property pages
│   ├── property-management/    # 32 pages (property owner-facing)
│   ├── about-us/               # About page
│   ├── sitemap.xml             # XML sitemap
│   ├── robots.txt              # Crawler directives (AI bots allowed)
│   ├── _redirects              # Netlify redirects
│   ├── _headers                # Security/cache headers
│   └── netlify.toml            # Build config
├── CLAUDE.md                   # This file — SEO agent strategy doc
├── SEO-IMPLEMENTATION-PLAN.md  # Tracks what's been built
├── task-log-YYYY-MM.md         # Shared cross-task coordination log (monthly)
├── content-priorities-YYYY-MM.md # Seasonal content calendar (monthly)
└── docs/plans/                 # Implementation plans
```

**CRITICAL:** Only the `DEPLOY THIS FOLDER TO NETLIFY/` directory goes to production. All other files are source/build files.

---

## Connected Tools

Use these MCP tools when available — they're already authenticated:

| Tool | Use For |
|------|---------|
| **Serpbear** (self-hosted) | Daily rank tracking for target keywords. Running at `http://localhost:3000` via Docker. Start: `cd ~/Projects/serpbear && docker compose up -d` |
| **Google Search Console** (via Chrome browser) | Crawl data, indexing status, keyword impressions, CTR, position tracking. PRIMARY source for real ranking data |
| **Ahrefs** | ⚠️ **COMPLETELY BROKEN** as of March 2026 — ALL endpoints return "Insufficient plan" including keywords-explorer. Do NOT rely on Ahrefs for any data |
| **Netlify** | Deploy site, check deploy status, manage env vars, check build logs |
| **Gmail** | Create drafts, search messages, read threads (for outreach coordination) |
| **Desktop Commander** | File system access on Mac: read/write/edit files, list directories, run processes, search files |
| **DataforSEO** | SEO intelligence API — ranked keywords, competitor analysis, SERP data, on-page audits. Login: sawyer@becksbnb.com. ~$50 budget (balance ~$49.82 as of 2026-03-15) |
| **Google Analytics 4** (if connected) | Traffic data, user behavior, conversion tracking |

### Ahrefs API — COMPLETELY BROKEN (March 2026)
**ALL Ahrefs API endpoints now return `{"error": "Insufficient plan"}`.** This includes keywords-explorer-overview and serp-overview that previously worked on the free plan. Do not attempt Ahrefs API calls — they waste time and tokens.

### Keyword & Rank Data Strategy (No Ahrefs)

**Rank Tracking:**
1. **Serpbear** (PRIMARY) — self-hosted at `http://localhost:3000`, tracks daily positions for 25+ target keywords. Start with `cd ~/Projects/serpbear && docker compose up -d`
2. **Google Search Console** (SECONDARY) — real impression/click/position data for pages already ranking. Access via Chrome browser
3. **Web search** (FALLBACK) — search `site:seascape-vacations.com [keyword]` to verify indexing, then search the keyword to estimate position

**Keyword Research:**
1. **Google Keyword Planner** — free with Google Ads account (no spend required). User accesses manually for volume data
2. **Google Autocomplete scraping** — use web search to find autocomplete suggestions for any seed keyword
3. **AlsoAsked.com / AnswerThePublic** — 3 free searches/day each, great for question keywords and FAQs
4. **Keywords Everywhere** ($10/year browser extension) — volume + difficulty overlay on Google searches

**Competitor Research:**
- Web search for target keywords and note who ranks in top 10
- Check competitor sites manually for content gaps
- Read `bradenton-vs-sarasota-cluster-research.md` for latest competitive intelligence

**AI Citation Tracking:**
- Manually test queries in ChatGPT, Perplexity, Google AI Overviews
- Run bi-monthly per GEO Testing Protocol below

### Research Files (Cross-Task Coordination)
All agents should check these files before acting:
| File | Contents | Updated |
|------|----------|---------|
| `rank-tracker-latest.md` | GSC audit: 334 clicks, 53K impressions, top queries, indexing status | 2026-03-08 |
| `bradenton-vs-sarasota-cluster-research.md` | 5 cluster pages to build (families, beaches, restaurants, retirement, cost-of-living) | 2026-03-08 |
| `link-building-targets.md` | 15 targets + 3 outreach email templates | 2026-03-08 |
| `mailchimp-welcome-sequence.md` | 3-email drip automation ready for Mailchimp setup | 2026-03-08 |
| `content-priorities-YYYY-MM.md` | Monthly seasonal content calendar | Rolling |
| `task-log-YYYY-MM.md` | Cross-task coordination log | Rolling |

---

## SEO Operating Rules

### 1. Intent Before Everything
Before writing ANY content, identify the search intent:
- **Informational** → guides/, area guides (answer questions, build trust)
- **Commercial investigation** → stays/ comparison pages (help them evaluate)
- **Transactional** → property pages, book-direct pages (drive conversions)
- **Local** → location-specific pages with Google Business Profile signals

Never write content without knowing which intent it serves. If you're unsure, check the SERP first using web search.

### 2. Keyword Strategy
- **Primary keyword:** 1 per page, in title tag, H1, first 100 words, meta description, one H2
- **Secondary keywords:** 2-5 natural variations woven throughout
- **Semantic coverage:** Include related entities, questions, and topics that the top 3 ranking pages cover
- **Cannibalization check:** Before creating any new page, search existing pages for keyword overlap. Use `site:seascape-vacations.com [keyword]` to verify
- **Never** stuff keywords or force exact match — use natural language

### 3. On-Page Standards (verify before publishing)
- Title tag: 50-60 characters, primary keyword front-loaded
- Meta description: 140-160 characters, includes CTA ("Book direct", "Explore", "Save X%")
- H1: One per page, matches intent (not necessarily identical to title tag)
- Images: Every `<img>` has descriptive `alt` text with location context
- Internal links: Every page links to at least 2 other relevant pages on the site
- Schema markup: Every page has appropriate JSON-LD (VacationRental, BreadcrumbList, FAQPage, LocalBusiness)
- URL structure: lowercase, hyphens, descriptive (`/stays/fishing-vacation-rentals-bradenton/`)

### 4. Content Quality Gate
Before presenting any content as done, ask yourself:
- Does this answer the searcher's question better than the current top 3 results?
- Would a real person planning a Gulf Coast vacation find this genuinely useful?
- Does it include local knowledge that generic travel sites can't match? (specific beach names, restaurant recommendations, local tips)
- Is there a clear next action for the reader? (book a property, explore an area guide, contact us)

If the answer to any is "no" — rewrite. Thin content hurts the entire domain.

### 4b. AI Citability Gate (run `/geo-citability` to score)
Every page should score 65+ on citability before publishing. Key criteria:

**Opening paragraph (134-167 words):** Must be a self-contained answer block using definition pattern ("X is...", "X refers to..."). Include 2+ specific facts. This single paragraph should make sense if quoted by an AI with zero surrounding context. Definition patterns increase citation rate by 2.1x.

**Statistical density:** Minimum 10 specific data points per page. Each stat must be concrete ("$250/night", "12 minutes from Bradenton Beach", "4.8-star average") not vague ("affordable", "nearby", "highly rated"). Adding statistics boosts citation probability by 40%.

**Self-containment:** Every H2 section should be quotable on its own — no "it", "this", "they" without explicit subjects. Name entities explicitly every time ("Anna Maria Island" not "the island").

**Passage length:** AI systems prefer 134-167 word passages. Structure paragraphs in this range for maximum extractability.

### 5. Content Writing Rules (Anti-AI Detection)
Google's detection systems flag predictable AI patterns. Every piece of content must feel human-written:

**Structural Variation (CRITICAL — current site fails this)**
- NEVER use the same H2 pattern across multiple pages. Each page needs unique section headings
- Mix formats unpredictably: some pages lead with a story, others with a data table, others with a question
- Vary paragraph lengths — 1-sentence paragraphs mixed with 4-5 sentence paragraphs
- Break the "intro → body → FAQ → CTA" template. Rearrange sections differently per page

**Tone Modulation**
- Shift between conversational and informative within the same piece
- Use first person ("we") in some sections, second person ("you'll love") in others
- Include opinionated statements a real local would make: "Skip the tourist traps on Bridge Street — head to the Sandbar instead"
- Add imperfect human touches: parenthetical asides, rhetorical questions, short exclamations

**Banned AI Phrases — NEVER use these:**
- "elevate your" / "curated" / "nestled" / "boasts" / "plethora" / "myriad"
- "unparalleled" / "seamlessly" / "embark on" / "delve into" / "tapestry"
- "whether you're a [X] or a [Y]" (the classic AI hedge)
- "look no further" / "in conclusion" / "it's important to note"
- Any sentence starting with "In the heart of" or "When it comes to"

**What TO Do Instead**
- Write like a friend who lives in Bradenton texting travel tips
- Use specific details only a local would know (dock depths, which ramp has parking, where the mullet run happens)
- Include occasional imperfections — a dash where a comma could go, a sentence fragment for emphasis
- Reference real local businesses, events, and landmarks by name
- Add personal recommendations: "Our guests keep coming back to Anna Maria Oyster Bar — the grouper sandwich is the move"

**Format Rotation for GEO**
- Page Type A: Opens with comparison table, followed by narrative sections
- Page Type B: Opens with a "Quick Answer" box, then deep-dive content
- Page Type C: Opens with a local story/anecdote, transitions to practical info
- Page Type D: Opens with FAQ-style questions, then expands each answer
- NEVER let more than 3 pages in a row use the same format type

### 5. Technical SEO Checklist
When making changes to the site, always verify:
- [ ] All new pages added to `sitemap.xml` with correct `<lastmod>` date
- [ ] No broken internal links (check with crawl or manual review)
- [ ] Images are optimized (WebP/AVIF with JPG fallback, compressed)
- [ ] Page loads under 3 seconds (check Netlify build logs for asset sizes)
- [ ] Mobile-responsive (all pages use existing responsive CSS)
- [ ] HTTPS everywhere (no mixed content)
- [ ] Canonical tags point to correct URLs
- [ ] `robots.txt` allows all important crawlers including AI bots (see 3-tier list in GEO section)
- [ ] `llms.txt` updated if pages are added/removed (run `/llms-txt update`)
- [ ] `_redirects` updated if any URLs change (301 only, never 302)

---

## GEO (Generative Engine Optimization) Strategy

AI search engines (ChatGPT, Perplexity, Google AI Overviews, Claude) are now a primary discovery channel. Optimize for AI citation alongside traditional SEO.

### What Makes AI Engines Cite You
1. **Structured data they can parse** — tables, comparison lists, FAQ schema, clear H2/H3 hierarchy
2. **Authoritative factual claims** — specific numbers, dates, prices, ratings (not vague superlatives)
3. **Research-style content framing** — "2026 Report", "Complete Guide", "Data-Backed Analysis"
4. **Freshness signals** — recent dates, updated statistics, current pricing
5. **Entity-rich content** — mention specific places, businesses, landmarks by name

### AI Crawler 3-Tier System
Manage which AI bots can crawl the site. All are currently allowed in `robots.txt`.

| Tier | Bots | Purpose | Priority |
|------|------|---------|----------|
| **Tier 1: Live AI Search** | GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot | Powers real-time AI search answers | **Critical** — never block |
| **Tier 2: Ecosystem** | Google-Extended, Applebot-Extended, Amazonbot, FacebookBot, Meta-ExternalAgent | Feeds AI features in Google, Apple, Amazon, Meta | High — keep allowed |
| **Tier 3: Training** | CCBot, anthropic-ai, cohere-ai, Bytespider, Timespider | Corpus training for AI models | Medium — allow for now |

**llms.txt:** Deployed at `/llms.txt` — tells AI systems what matters most on the site. Update with `/llms-txt update` after adding/removing pages.

### GEO Content Rules
- Every guide and stays page should include at least one **comparison table** or **data table**
- Use **FAQ sections** with `FAQPage` schema on every informational page
- Include **specific local data**: distances ("12 minutes from Bradenton Beach"), prices ("from $250/night"), ratings
- Frame content as **reports or guides**, not blog posts: "Anna Maria Island Vacation Cost Guide 2026" beats "Planning Your AMI Trip"
- **Allow AI crawlers** in robots.txt — all 3 tiers currently allowed (see table above)
- Create **structured data snippets** that AI can directly quote (concise 2-3 sentence summaries at top of each page)
- Add `<meta name="description">` that reads like an AI-friendly summary, not just a click-bait teaser

### GEO Page Requirements (Every Page Must Have)
1. **Citation-ready summary** — A 2-3 sentence factual summary in the first 100 words that AI can quote directly. Include specific data: property count, location, price range, star rating
2. **At least one HTML table** — comparison data, pricing, features, distances, or seasonal info. AI engines extract tables as structured data
3. **FAQ section with schema** — 4-6 questions real searchers ask, with concise factual answers. Must have `FAQPage` JSON-LD
4. **Freshness markers** — "Updated March 2026", "2026 pricing", current seasonal data. AI engines prefer recent content
5. **Entity density** — Name specific beaches, restaurants, marinas, parks, neighborhoods. AI builds knowledge graphs from named entities
6. **Quotable statistics** — "12 minutes from Bradenton Beach", "from $250/night", "4.8-star average", "sleeps 10 guests". Hard numbers > vague claims

### GEO Testing Protocol (Monthly)
Test these queries across ChatGPT, Perplexity, and Google AI Overviews:
- "best vacation rentals in Bradenton Florida"
- "waterfront vacation rentals Anna Maria Island"
- "Bradenton beach house with pool and dock"
- "vacation rental management companies Bradenton"
- "where to stay near Anna Maria Island 2026"
- "Bradenton vs Sarasota for vacation rental"
Record: Was Seascape cited? Which competitors were? What content format did the AI pull from?

### Brand Authority Tracking (Monthly)
Run `/brand-authority "Seascape Vacations" --competitors "Anna Maria Vacations, Island Real Estate"` monthly to track brand presence across AI-weighted platforms:
- **YouTube** (25%) — brand channel, third-party mentions, view counts
- **Reddit** (25%) — mentions in r/florida, r/vacationrentals, recommendation context
- **Wikipedia/Wikidata** (20%) — entity presence, mentions in related articles
- **LinkedIn** (15%) — company page completeness, employee profiles
- **Other** (15%) — Google Business Profile, TripAdvisor, Yelp, local directories
Track the composite score (0-100) month-over-month. Unlinked brand mentions correlate ~3x more with AI visibility than traditional backlinks.

### Digital PR for AI Visibility (Press Release Strategy)
When creating content designed to get cited by AI engines:
1. Write as a **research report or industry analysis**, not a press release
   - Bad: "Seascape Vacations Offers Best Rentals"
   - Good: "2026 Bradenton Beach Vacation Rental Market Report: Pricing, Occupancy & Top Areas"
2. Include **comparison tables** with real data (AI loves structured, parseable information)
3. Include star ratings, pricing ranges, and factual claims AI can extract
4. Distribute through PRWeb, local news outlets, or tourism industry publications ($200-400/placement)
5. Wait 48-72 hours, then test with ChatGPT/Perplexity: "best vacation rentals in Bradenton Florida"

---

## Programmatic SEO Playbook

The site has 96 stays pages, 55 guides, 32 property-management pages, and 8 travel-spot-guide pages (203 total) generated programmatically. Follow this pattern for new pages:

### Creating New Programmatic Pages
1. **Keyword research first:** Use web search + Google Autocomplete to find long-tail opportunities. Check Serpbear (localhost:3000) for tracked keyword positions. Assess competitiveness by checking DR of top-ranking sites in web search results.
2. **Check SERP:** Use `serp-overview` (works on free plan) to see what's ranking — if it's all DR 70+ sites, skip it. Alternatively, web search the keyword and check the top 10 manually.
3. **Template consistency:** Match the existing HTML template structure in `/stays/` or `/property-management/`
4. **Unique content:** Each page must have genuinely unique body content (not just swapped keywords). Include specific local knowledge, property recommendations, area tips
5. **Schema markup:** Every new page gets `VacationRental` or `LocalBusiness` schema + `BreadcrumbList` + `FAQPage`
6. **Internal linking:** Link from 3-5 existing related pages to the new page, and link from the new page to relevant properties and guides
7. **Add to sitemap:** Update `sitemap.xml` with the new URL and today's date

### Content Cluster Strategy
Organize content in topical clusters to build authority:

**Cluster: Bradenton Vacations**
- Pillar: `/stays/bradenton-waterfront-vacation-rentals/`
- Supporting: fishing, hot tub, pool, family, luxury, pet-friendly pages
- All interlinked with descriptive anchor text

**Cluster: Anna Maria Island**
- Pillar: `/stays/family-vacation-rentals-anna-maria-island/`
- Supporting: beaches, restaurants, weather, cost guides, book-direct
- All interlinked

**Cluster: Property Management**
- Pillar: `/property-management/vacation-rental-management-anna-maria-island/`
- Supporting: income maximization, Airbnb management, self-manage comparison, investment guides
- All interlinked

### Internal Linking Rules
- Use **descriptive anchor text** that includes the target keyword (not "click here")
- Link contextually within body content, not just in footers or sidebars
- Every new page should receive links from at least 3 existing topically-related pages
- Review and strengthen internal links monthly — this is a top-3 ranking factor for low-DR sites

---

## Link Building Playbook

### Competitor Backlink Gap Analysis
Find link opportunities using web search:
1. Identify top 5 organic competitors by web searching target keywords and noting who ranks consistently
2. Web search each competitor's brand name to find who mentions/links to them
3. Find sites linking to competitors but NOT to seascape-vacations.com
4. For each opportunity: check the linking page, assess relevance, draft outreach email
5. Priority targets: local tourism sites, travel blogs, Florida business directories, real estate publications
6. Read `link-building-targets.md` for pre-researched targets and outreach templates

### Local Link Building (High Priority for Low-DR Sites)
- Bradenton Area Convention and Visitors Bureau
- Anna Maria Island Chamber of Commerce
- Local business directories (Yelp, TripAdvisor, Google Business Profile)
- Florida vacation rental associations
- Local event sponsorships with backlink
- Guest posts on Florida travel blogs

---

## Automation & Monitoring

### Scheduled Tasks (Configured in Cowork)

> **IMPORTANT (Updated 2026-03-15):** Most code-modifying tasks have been DISABLED after the March 8 redirect disaster.
> All SEO content work (new pages, redirects, internal linking, content rewrites) should be done in manual chat sessions with the site owner.
> Only read-only monitoring tasks and the daily-deploy batch remain active.

**ACTIVE Tasks (read-only monitoring + deploy):**

| Schedule | Task ID | What It Does |
|----------|---------|-------------|
| Daily 6pm | `daily-deploy` | Single daily deploy — pushes accumulated commits. ONLY task allowed to git push. 15 credits/day max. |
| Wed 7am | `rank-performance-tracker` | Pulls GSC clicks/impressions/CTR, tracks keyword positions, saves data |
| Sat 8am | `weekly-task-supervisor` | Reviews week's task activity, texts Saw a status report |
| 1st of month, 6am | `seasonal-content-calendar` | Sets monthly content theme (writes planning file, doesn't touch site code) |
| 1st & 15th, 10am | `page-speed-monitor` | Checks page file sizes, image optimization, flags issues |
| 1st & 15th, 11am | `indexation-health-monitor` | Monitors GSC coverage, identifies crawled-not-indexed pages |
| Last day of month | `monthly-seo-summary` | Plain-English monthly digest for owner |

**DISABLED Tasks (were modifying site code autonomously — too risky):**

| Task ID | Why Disabled |
|---------|-------------|
| `seo-weekly-health-check` | Was auto-fixing links/schema/meta — risk of unintended changes |
| `seo-content-creation` | Was writing new pages autonomously |
| `pseo-page-builder` | Was building long-tail pages autonomously |
| `content-quality-patrol` | Was rewriting content autonomously |
| `internal-linking-rebuild` | Was modifying internal links autonomously |
| `conversion-optimization-patrol` | Was changing CTAs/layouts autonomously |
| `geo-citation-audit` | Was adding structured data autonomously |
| `seo-orchestrator` | Was writing coordination directives |
| `outreach-execution-reminder` | Was drafting outreach emails |
| `seo-monthly-competitor-geo-audit` | Was making strategy changes autonomously |
| `seo-quarterly-full-audit` | Was making strategy changes autonomously |

**ReviewGuard Tasks (separate business, still active):**
5 tasks for lead scraping, email drafting, follow-up, reply monitoring, and contact finding. Not related to Seascape SEO.

### Automated Workflow Summary

> **Post-cleanup (March 2026):** Most automated workflows are disabled. The remaining active tasks focus on monitoring and reporting only.

**Active Monitoring Loop:** rank-performance-tracker (Wed) pulls GSC data → page-speed-monitor (bi-monthly) flags bloat → indexation-health-monitor (bi-monthly) checks coverage → weekly-task-supervisor (Sat) reports status → monthly-seo-summary aggregates everything

**Content & Optimization (MANUAL ONLY):** All content creation, internal linking, redirect changes, CTA optimization, and competitive strategy work is done in manual chat sessions with the site owner. This prevents autonomous tasks from making harmful changes (see: March 8 redirect disaster).

**Deploy Workflow:**
> **For scheduled tasks:** Commit changes but DO NOT push. The `daily-deploy` task handles pushing at 6pm daily (15 credits/day).
> **For manual chat sessions:** Commit AND push directly — manual deploys are fine.

1. Stage changes: `git add [specific files]` (avoid `git add -A` to prevent accidental commits)
2. Commit with descriptive message
3. **If manual session:** Push to GitHub (`git push origin main`) — Netlify auto-deploys
4. **If scheduled task:** STOP here. Do NOT push. `daily-deploy` handles it.
5. Verify (manual sessions only): curl 3 changed pages, confirm new content is live
6. If verification fails: wait 60s, re-push, re-verify

### Key Metrics to Track
- Organic traffic (Google Analytics — connect via Graphed.com MCP)
- Keyword positions for target terms (Serpbear daily tracking at localhost:3000, GSC for impression data, web search `site:` checks as fallback)
- AI engine citations (test bi-monthly per GEO Testing Protocol above — manual web search method)
- Direct booking conversions from SEO pages
- Pages indexed (Google Search Console or `site:seascape-vacations.com` count)
- Table coverage: % of pages with at least one HTML table (target: 100%)
- H2 uniqueness: % of pages with non-template headings (target: 100%)
- CTA coverage: % of stays/guides pages with strong booking CTA (target: 100%)
- Mobile CTA placement: % of pages with CTA in first screen (target: 90%+)
- Content performance: % of pages published 60+ days ago that appear in top 50 for target keyword

---

## Workflow Rules

### When Given an SEO Task
1. **Don't ask for hand-holding.** Audit the issue, identify the fix, implement it.
2. **Be specific.** "Title tag on /stays/fishing-vacation-rentals-bradenton/ is 73 chars, needs trimming to 58" — not "some title tags are too long."
3. **Verify before done.** Run your own checks. Don't say "I updated the meta descriptions" without confirming they render correctly.
4. **Minimal impact edits.** Only touch what needs changing. Don't rewrite entire pages when fixing a title tag.
5. **Explain what changed and why.** Every edit gets a one-line summary: "Shortened title from 73→58 chars, front-loaded primary keyword 'fishing vacation rentals Bradenton'"

### When Creating Content
1. Write the keyword plan + H2 outline first
2. Check the top 3 ranking pages for that keyword (what do they cover that we should too?)
3. Draft content with genuine local knowledge — specific place names, distances, insider tips
4. Include at least one table or structured data element for GEO
5. Add FAQ section with 3-5 questions real searchers would ask
6. Verify on-page checklist before calling it done
7. Update internal links on related existing pages

### When Deploying Changes
1. Make changes in the `DEPLOY THIS FOLDER TO NETLIFY/` directory
2. Update `sitemap.xml` if any new pages or significant content changes
3. Stage and commit: `git add -A && git commit -m "descriptive message"`
4. **Push to GitHub** — this triggers Netlify auto-deploy via GitHub integration
5. Wait 60 seconds, then verify with `curl -sL` (always follow redirects — site uses trailing-slash redirects)
6. Verify 3 changed pages: confirm new content appears (not just HTTP 200 — check for a unique string)
7. If pages aren't updated after 90s, deploy manually via Netlify MCP: `deploy-site` with siteId `380fdf4b-91dd-4c6d-a31c-252c07aade81`
8. If MCP also fails (502), log `⚠️ DEPLOY FAILED` in task-log and wait for GitHub auto-deploy to complete
9. If new files return 404 after deploy, add `<!-- deploy-force: YYYY-MM-DD -->` comment and redeploy

---

## Self-Improvement

After any correction from the user, append the lesson to this section:

### Lessons Learned
<!-- Append new lessons here as they come up -->
- Git commands in sandbox need: `set +H` (disable bash history expansion for `!!` in folder name), `GIT_DISCOVERY_ACROSS_FILESYSTEM=1`, and `git -C "$REPO"` instead of `cd`
- Netlify deploys use the MCP connector's proxy auth command — not direct git-based deploys (those hit strict contributor verification)
- Always use Python `os` module for file operations when folder names contain `!!` — bash escaping is unreliable
- Netlify MCP deploy caches based on remote git commit hash — if local commits aren't pushed to GitHub, Netlify reuses cached files from the last known remote commit. New files that were never in the remote repo won't get uploaded automatically.
- **Deploy workaround for new files:** If a new file returns 404 after deploy, append a comment like `<!-- deploy-force: YYYY-MM-DD -->` to the file so Netlify's diff engine detects it as "changed" and uploads it. Only needed for files that never existed in a previous successful deploy.
- Netlify site is connected to `seascape-vacations-site` on GitHub (not `seascape-vacations-2026` which is the local remote) — commit URLs in deploy data reference the former
- Property photo images use Hostaway CDN (`bookingenginecdn.hostaway.com/listing/51916-{listingID}-{hash}`). **Dockside Dreams = listing 189511, The Oasis = listing 206016.** Both `bookingenginecdn` (CDN display images) and `hostaway-platform.s3` (schema images) must use the same listing ID per property. When they mismatch, photos appear swapped on the live site.
- **Ahrefs is completely dead (March 2026):** ALL endpoints return "Insufficient plan" including keywords-explorer and serp-overview that previously worked. Do not attempt any Ahrefs API calls. Use Serpbear + GSC + web search instead.
- **Serpbear** self-hosted rank tracker at ~/Projects/serpbear/ — start with `cd ~/Projects/serpbear && docker compose up -d`, access at localhost:3000. Tracks 25+ target keywords daily.
- Cross-task coordination via shared `task-log-YYYY-MM.md` prevents duplicate content creation and keeps the monthly summary accurate
- Seasonal content alignment (via `content-priorities-YYYY-MM.md`) outperforms random keyword selection — always check the priorities file before creating content
- Conversion elements (CTAs, book-direct messaging, trust signals) are as important as traffic generation — audit them bi-monthly
- Deploy verification must include content checking (not just HTTP 200) — verify a unique string from the new content appears in the curl response
- H2 uniqueness audit (March 2026): 298 unique H2s across 70 pages, 0 duplicates — current site passes
- Internal linking rebuild (March 2026): 11 new contextual links added across topic clusters
- **Always use `curl -sL` for Netlify verification** — the site has trailing-slash redirects via `_redirects`. Without `-L`, curl returns redirect HTML instead of page content, wasting a round-trip.
- **After `git push` succeeds, Netlify auto-deploys via GitHub integration** — the MCP `deploy-site` command is only needed if auto-deploy doesn't trigger. Don't run MCP as a mandatory step after every push.
- **CRITICAL — March 8 redirect disaster (2026-03-08):** A scheduled task ("GSC 404 cleanup") added 113 x 301 redirects for `/travel-spot-guide/*` URLs, sending them to generic pages. These travel-spot-guide pages were from an OLD PLATFORM and were the site's BEST ranking content (~42,000 monthly searches combined, multiple page-1 rankings). The 301s told Google the content permanently moved to non-matching pages, destroying all rankings. **Fix (2026-03-15):** Created 8 dedicated HTML pages at the original URLs, removed 14 harmful redirect entries. Recovery expected in 1-3 weeks. **Lesson: NEVER redirect a ranking URL to a non-matching page. NEVER automate redirect decisions. Always check if a 404 URL is actually ranking in Google before redirecting it.**
- **Scheduled task risk (2026-03-15):** Disabled 11 code-modifying scheduled tasks. Autonomous tasks cannot understand SEO nuance — they make "logical" decisions that can be catastrophically wrong. Only read-only monitoring tasks should be automated. All content and code changes should be manual sessions with the site owner.
- **Netlify credit management:** Personal plan = 1,000 credits/month, each deploy = 15 credits. 24 scheduled tasks were burning ~180 credits/day. Implemented daily-deploy batch system: tasks commit but don't push, single `daily-deploy` task pushes at 6pm daily (15 credits/day max).
- **DataforSEO setup (2026-03-15):** API access configured. Login: sawyer@becksbnb.com. Key findings: site has 362 keywords ranking but ZERO money keywords. On-page score 90.76/100. Competitors have 10-15x more keywords. Primary gap: no rankings for "vacation rentals [location]" terms.
- **Travel-spot-guide pages are HIGH VALUE:** These old-platform URLs rank for restaurant/attraction names with massive search volume (e.g., "beach house waterfront restaurant" = 18,100/mo). They are NOT throwaway 404s — they are the site's best organic assets. Never redirect or remove them.
