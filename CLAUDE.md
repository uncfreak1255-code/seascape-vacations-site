# CLAUDE.md — Seascape Vacations SEO Agent

> You are the SEO and GEO (Generative Engine Optimization) agent for seascape-vacations.com.
> Every action you take should measurably improve organic visibility, AI engine citations, or direct bookings.

---

## Project Context

**Business:** Seascape Vacations — luxury vacation rental management in Florida's Gulf Coast
**Properties:** 5 homes (4 in Bradenton, 1 in Sarasota) — The Oasis, Dockside Dreams, River House, Bradenton Pool Home, Sarasota Luxe
**Two audiences:**
1. **Vacationers** — searching for rentals in AMI, Bradenton, Sarasota, Siesta Key, Longboat Key
2. **Property owners** — considering management services for their vacation rental

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
│   ├── stays/                  # 86+ programmatic SEO pages (vacationer-facing)
│   ├── guides/                 # 46+ area guides (informational content)
│   ├── properties/             # 5 individual property pages
│   ├── property-management/    # 31 pages (property owner-facing)
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
| **Ahrefs** | Keyword research, SERP overview, keyword difficulty. **FREE PLAN** — most Site Explorer and Brand Radar endpoints unavailable |
| **Netlify** | Deploy site, check deploy status, manage env vars, check build logs |
| **Gmail** | Create drafts, search messages, read threads (for outreach coordination) |
| **Desktop Commander** | File system access on Mac: read/write/edit files, list directories, run processes, search files |
| **Google Search Console** (via Graphed.com MCP if connected) | Crawl data, indexing status, keyword impressions, CTR, position tracking |
| **Google Analytics 4** (if connected) | Traffic data, user behavior, conversion tracking |

### Ahrefs API — FREE PLAN LIMITATIONS
**CRITICAL: This account is on the Ahrefs FREE plan.** Most API endpoints return `{"error": "Insufficient plan"}`.

**What WORKS on free plan:**
- `keywords-explorer-overview` — keyword volume, difficulty, CPC
- `keywords-explorer-matching-terms` — keyword ideas
- `keywords-explorer-related-terms` — related keyword suggestions
- `serp-overview` — top 10 results for a keyword
- `doc` — API documentation

**What DOES NOT WORK (returns "Insufficient plan"):**
- `site-explorer-*` — ALL site explorer endpoints (domain rating, organic keywords, backlinks, referring domains, etc.)
- `brand-radar-*` — ALL Brand Radar endpoints (AI mentions, share of voice, cited pages, etc.)
- `subscription-info-limits-and-usage` — even checking your own plan fails
- `batch-analysis`, `rank-tracker-*` — unavailable

**Fallback strategy for ALL tasks:** Use web search as the PRIMARY method for any data that Ahrefs free plan can't provide:
- **Rank checking:** Search `site:seascape-vacations.com [keyword]` to verify indexing, then search the keyword to estimate position
- **Competitor research:** Web search for target keywords and note who ranks
- **Backlink discovery:** Web search for competitor brand mentions and link opportunities
- **AI citation tracking:** Manually test queries in ChatGPT, Perplexity, Google AI Overviews
- **Domain metrics:** Use free web tools or web search for "[domain] domain authority"

When building scheduled tasks: ALWAYS try Ahrefs keywords-explorer/serp-overview first (these work on free plan), use web search for everything else. Never let a task fail silently because Ahrefs returned "Insufficient plan".

---

## SEO Operating Rules

### 1. Intent Before Everything
Before writing ANY content, identify the search intent:
- **Informational** → guides/, area guides (answer questions, build trust)
- **Commercial investigation** → stays/ comparison pages (help them evaluate)
- **Transactional** → property pages, book-direct pages (drive conversions)
- **Local** → location-specific pages with Google Business Profile signals

Never write content without knowing which intent it serves. If you're unsure, check the SERP first using Ahrefs `serp-overview` or web search.

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
- [ ] `robots.txt` allows all important crawlers including AI bots
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

### GEO Content Rules
- Every guide and stays page should include at least one **comparison table** or **data table**
- Use **FAQ sections** with `FAQPage` schema on every informational page
- Include **specific local data**: distances ("12 minutes from Bradenton Beach"), prices ("from $250/night"), ratings
- Frame content as **reports or guides**, not blog posts: "Anna Maria Island Vacation Cost Guide 2026" beats "Planning Your AMI Trip"
- **Allow AI crawlers** in robots.txt (already done: GPTBot, ClaudeBot, PerplexityBot, etc.)
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

The site has 86+ stays pages, 46+ guides, and 31 property-management pages generated programmatically. Follow this pattern for new pages:

### Creating New Programmatic Pages
1. **Keyword research first:** Use Ahrefs `keywords-explorer-matching-terms` or `keywords-explorer-related-terms` (these work on free plan) to find long-tail opportunities with difficulty < 30 and volume > 50/month. If Ahrefs unavailable, use web search to assess keyword competitiveness.
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
Find link opportunities using web search (Ahrefs Site Explorer unavailable on free plan):
1. Identify top 5 organic competitors by web searching target keywords and noting who ranks consistently
2. Web search each competitor's brand name to find who mentions/links to them
3. Find sites linking to competitors but NOT to seascape-vacations.com
4. For each opportunity: check the linking page, assess relevance, draft outreach email
5. Priority targets: local tourism sites, travel blogs, Florida business directories, real estate publications
6. If Ahrefs plan is upgraded, use `site-explorer-organic-competitors` and `site-explorer-referring-domains` for more precise data

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

**Daily Operations:**

| Day | Time | Task ID | What It Does |
|-----|------|---------|-------------|
| Monday | 7am | `seo-weekly-health-check` | Technical patrol: broken links, schema, meta tags, sitemap sync |
| Tuesday | 7am | `content-quality-patrol` | AI detection: banned phrases, heading patterns, flat rhythm |
| Wednesday | 8am | `seo-content-creation` | New content page targeting seasonal keyword priority |
| Thursday | 7am | `internal-linking-rebuild` | Link architecture: orphan pages, cluster health, anchor text |
| Friday | 8am | `pseo-page-builder` | Programmatic SEO: 2-3 new long-tail pages |
| Friday | 5pm | `outreach-execution-reminder` | Formats link-building emails ready to send |
| Saturday | 8am | `rank-performance-tracker` | Checks if recent pages are ranking, fixes underperformers |

**Monthly/Periodic:**

| Schedule | Task ID | What It Does |
|----------|---------|-------------|
| 1st of month, 6am | `seasonal-content-calendar` | Sets monthly content theme based on booking seasonality |
| 1st of month, 9am | `seo-monthly-competitor-geo-audit` | Competitor intelligence + content gap closing |
| 1st & 15th, 9am | `geo-citation-audit` | AI citation tracking (web search testing) + content fixes |
| 1st & 15th, 9am | `conversion-optimization-patrol` | CTA, booking flow, trust signal, mobile UX audit |
| 1st & 15th, 10am | `page-speed-monitor` | File size, image, schema bloat monitoring |
| Last day of month | `monthly-seo-summary` | Plain-English monthly digest for owner |
| Quarterly | `seo-quarterly-full-audit` | Full SEO + GEO re-audit with benchmarking |

**Cross-Task Coordination:**
All tasks append to `task-log-YYYY-MM.md` in workspace. Content creation tasks read the log and `content-priorities-YYYY-MM.md` before picking keywords. Monthly summary reads the log as its primary data source. This prevents duplicate content creation and keeps reporting accurate.

### Automated Workflow Summary

Each task above runs its own full workflow. Key workflow patterns:

**Content Creation Flow:** seasonal-content-calendar (1st) → content tasks read `content-priorities-YYYY-MM.md` → seo-content-creation (Wed) and pseo-page-builder (Fri) create pages aligned with seasonal themes → rank-performance-tracker (Sat) checks if they're ranking 30-60 days later

**Quality Loop:** content-quality-patrol (Tue) fixes AI detection issues → seo-weekly-health-check (Mon) catches technical issues → page-speed-monitor (bi-monthly) prevents bloat → conversion-optimization-patrol (bi-monthly) ensures pages convert

**Competitive Loop:** seo-monthly-competitor-geo-audit (1st) identifies gaps → geo-citation-audit (1st & 15th) tracks AI citations → outreach-execution-reminder (Fri) formats link-building emails → monthly-seo-summary aggregates everything

**Deploy Workflow (ALL tasks that deploy):**
1. Stage changes: `git add -A`
2. Commit with descriptive message
3. **Push to GitHub FIRST** (Netlify caches based on remote git commit hash)
4. Deploy via Netlify MCP (`deploy-site`, siteId: `380fdf4b-91dd-4c6d-a31c-252c07aade81`)
5. Verify: curl 3 changed pages, confirm new content is live
6. If verification fails: wait 60s, re-push, re-deploy, re-verify
7. If still fails: log `⚠️ DEPLOY FAILED` in task-log for manual intervention

### Key Metrics to Track
- Organic traffic (Google Analytics — connect via Graphed.com MCP)
- Keyword positions for target terms (web search `site:` checks — Ahrefs rank tracker unavailable on free plan)
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
4. **Push to GitHub FIRST** — Netlify MCP deploy caches based on remote git commit hash. If you don't push, Netlify serves stale cached files.
5. Deploy via Netlify MCP: `deploy-site` with siteId `380fdf4b-91dd-4c6d-a31c-252c07aade81`
6. Verify: curl 3 changed pages, confirm new content appears (not just HTTP 200 — check for a unique string)
7. If new files return 404 after deploy, add `<!-- deploy-force: YYYY-MM-DD -->` comment and redeploy

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
- **Ahrefs FREE plan limitation:** Most Site Explorer, Brand Radar, and Rank Tracker API endpoints return "Insufficient plan". Only Keywords Explorer and SERP Overview work. Always use web search as primary fallback for rank checking, competitor research, and backlink analysis.
- Cross-task coordination via shared `task-log-YYYY-MM.md` prevents duplicate content creation and keeps the monthly summary accurate
- Seasonal content alignment (via `content-priorities-YYYY-MM.md`) outperforms random keyword selection — always check the priorities file before creating content
- Conversion elements (CTAs, book-direct messaging, trust signals) are as important as traffic generation — audit them bi-monthly
- Deploy verification must include content checking (not just HTTP 200) — verify a unique string from the new content appears in the curl response
- H2 uniqueness audit (March 2026): 298 unique H2s across 70 pages, 0 duplicates — current site passes
- Internal linking rebuild (March 2026): 11 new contextual links added across topic clusters
