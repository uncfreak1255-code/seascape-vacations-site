# Seascape Vacations Full SEO + GSC Audit

Date: 2026-03-30
Site: https://seascape-vacations.com
Audit window: Google Search Console data from 2026-03-02 through 2026-03-29
Scope: live site checks, GSC domain-property data, Eleventy build output, targeted Lighthouse mobile runs, page-level SEO review, image audit, content/E-E-A-T review, GEO/AEO readiness review
Business type: local vacation rental operator + owner-acquisition service business + destination/comparison publisher

## Executive Summary

**Overall SEO Health Score: 65/100**

The site is not starving for indexed pages. It is wasting the authority it already has.

What is working:
- The comparison-guide cluster proves the domain can win nonbrand search demand.
- Core technical plumbing is mostly intact: sitemap valid, redirects valid, internal-link verification passes, JSON-LD validation passes.
- Key comparison pages already have the right shape for both classic search and AI citation: direct answers, tables, dates, and real source links.

What is not working:
- Google is still splitting traffic across legacy `.html`, no-slash, slash, and older alias URLs.
- Owner pages are getting impressions without earning clicks.
- High-intent stay pages exist, but several are too thin to compete on commercial SERPs.
- The homepage is the slowest important page on the site and is dragging the brand layer.
- Metadata, author-treatment, and image hygiene are still inconsistent enough to look sloppy.

If you keep shipping net-new page volume before fixing consolidation, CTR, and thin-template problems, you will just create more places for authority to leak.

## Scorecard

| Category | Score | What the score means |
|---|---:|---|
| Technical SEO | 69/100 | Crawlability and validation are mostly solid, but canonical convergence is still weak in Google. |
| Content Quality | 60/100 | The best guides are strong; many stay and owner pages still look underpowered. |
| On-Page SEO | 62/100 | Core tags exist, but CTR underperformance and metadata QA defects are real. |
| Schema / Structured Data | 68/100 | Coverage is broad, but rich-result eligibility is inconsistent and Person usage is thin. |
| Performance / CWV | 72/100 | Important inner pages are fast; homepage LCP is not. |
| Images | 45/100 | Too many unsized, non-lazy, and legacy-format images remain. |
| AI Search Readiness | 74/100 | Good technical accessibility and strong comparison pages, weaker entity/distribution footprint. |

## Baseline

### GSC snapshot

- Clicks: `376`
- Impressions: `66,154`
- CTR: `0.57%`
- Average position: `7.9`

### Technical validation snapshot

- Sitemap status: `Valid`
- Sitemap indexed URLs: `141`
- Sitemap errors: `0`
- Local link verification: `155` pages crawled, all internal links valid
- Local JSON-LD verification: `687` blocks validated across `155` pages
- Redirect validation: `317` rules validated

This is why the main problem is not "Google cannot crawl the site." The main problem is that Google can crawl it and still does not get one clean version of the story.

## Highest-Impact Findings

### High. Legacy URL fragmentation is still bleeding clicks and impressions

This is the single clearest structural problem in the audit.

Evidence:
- GSC shows `25` legacy `.html` pages still drawing `44` clicks and `7,749` impressions over the last 28 days.
- `https://seascape-vacations.com/guides/is-anna-maria-island-worth-visiting.html` alone still drew `16` clicks and `1,317` impressions.
- `https://seascape-vacations.com/guides/florida-gulf-coast-vacation-rental-market-report-2026.html` still drew `2` clicks and `1,513` impressions.
- The `bradenton-vs-sarasota` cluster is split across three URLs:
  - `/guides/bradenton-vs-sarasota` — `53` clicks, `12,686` impressions
  - `/guides/bradenton-vs-sarasota/` — `22` clicks, `9,473` impressions
  - `/guides/bradenton-vs-sarasota-vacation-rental-comparison/` — `5` clicks, `5,516` impressions
- URL inspection shows some old `.html` pages are still indexed with **Google canonical = old URL** even though the current page markup declares the newer slash URL.

What this means:
- You are making Google relearn page identity instead of letting it compound authority on one URL.
- The site already has ranking leverage. It is just spread across too many historical versions.

What to do:
1. Audit sitemap, canonicals, internal links, and nav/footer links against one canonical URL standard.
2. Remove every legacy URL from discoverability surfaces, not just by redirecting them.
3. Re-request indexing on the few canonical pages that matter most after the cleanup.
4. Track legacy-URL GSC impressions as a decline metric, not as vanity "extra visibility."

### High. Owner-acquisition pages rank, but they do not earn the click

Owner SEO is visible. It is just not persuasive enough yet.

Evidence from GSC:
- `/property-management/vacation-rental-management-fees-florida/` — `2` clicks, `1,558` impressions, `0.13%` CTR, `6.6` average position
- `/property-management/vacation-rental-management-licensing-florida/` — `0` clicks, `477` impressions, `8.2` average position
- `/property-management/vrbo-management-services-florida/` — `0` clicks, `128` impressions, `2.6` average position
- `/property-management/` hub — `0` clicks, `46` impressions, `11.7` average position

Evidence from the page itself:
- The fees page is not thin at `1,462` words.
- It has only `9` internal links and `0` external links.
- The page matches topic intent, but it is light on third-party proof and too light on click motive for a page already ranking on page one.

What this means:
- This is not an indexing problem.
- This is a trust, proof, and snippet problem.
- If owner acquisition remains the business bottleneck, these pages need a sharper commercial layer than the current "informational but generic" setup.

What to do:
1. Rewrite owner-page title/meta around concrete payoff, not generic service language.
2. Add source-backed benchmarks, local proof, and clear "reviewed by" treatment.
3. Push internal links from top-performing guides and market-report pages into the owner cluster.
4. Build one hard proof asset that owner pages can all cite: fee benchmarks, owner economics, or channel-mix data.

### High. Stay search pages are too thin for the queries that matter

The site has stay pages. That is not the same thing as having stay pages strong enough to win.

Evidence:
- `/stays/anna-maria-island-beachfront-rentals/` — `2` clicks, `1,889` impressions, `0.11%` CTR, `39.8` average position
- The page has only `435` words.
- It has no external links and limited topical depth for a commercial inventory query.
- URL inspection shows it is indexed, so this is not a crawl problem.

What this means:
- Thin commercial pages do not beat operators with better inventory fit, richer property proof, and more robust local content.
- On a term like "Anna Maria Island beachfront rentals," a light template page is a brochure in a knife fight.

What to do:
1. Rebuild the highest-value stay pages as category landers, not inventory stubs.
2. Add inventory proof, map/area logic, booking-window context, and comparison sections.
3. Treat `/stays/anna-maria-island-vacation-rentals/` and `/stays/anna-maria-island-beachfront-rentals/` as core money pages, not filler.
4. Link them from the comparison pages that already have real visibility.

### High. The homepage is the slowest important page on the site

Evidence:
- Lighthouse mobile performance score: `69`
- Largest Contentful Paint: `7.2s`
- First Contentful Paint: `3.4s`
- Time to Interactive: `7.3s`
- CLS: `0`
- Lighthouse flagged `95 KiB` of unused JavaScript, led by:
  - `gtag.js` — `63,569` wasted bytes
  - `fbevents.js` — `33,258` wasted bytes
- Lighthouse flagged the unsized logo image in the main nav.
- The heaviest requests on the page include a Hostaway image (`~211 KB`), `images/sarasota-sunset-hero.jpg` (`~183 KB`), `gtag.js` (`~158 KB`), and Facebook Pixel (`~95 KB`).

What this means:
- The brand page that frames the whole site is paying the heaviest third-party and hero-media tax.
- The inner pages are mostly fast. The homepage is the obvious exception.

What to do:
1. Resize and explicitly dimension the nav logo and any hero-adjacent imagery.
2. Re-evaluate whether both GA and Meta Pixel need to load at the current priority on first paint.
3. Trim or defer the analytics layer that is not required above the fold.
4. Re-run Lighthouse after each homepage change. This is not a "ship all improvements, then check later" area.

### Medium. Metadata QA is still loose enough to create real defects

Evidence:
- `33` titles are longer than `65` characters.
- `75` descriptions are short.
- `7` descriptions are long.
- `src/guides/anna-maria-city.html` has a broken meta description string that renders as:
  - `... vacation rentals."s quietest gem.`
- Live HTML confirms that defect is shipping, so this is not just a source artifact.

What this means:
- Metadata coverage exists, but quality control is weak.
- Google can work around sloppy metadata. That does not mean you should keep feeding it sloppy metadata.

What to do:
1. Add a metadata QA check that catches malformed quotes, overlong titles, and obviously thin descriptions.
2. Prioritize metadata rewrites for pages already ranking but under-clicked.
3. Stop treating metadata as a sitewide copy exercise. Fix the pages already in striking distance.

### Medium. Author treatment and E-E-A-T are inconsistent across the guide corpus

Evidence:
- Total guide pages reviewed: `53`
- Guides without visible author treatment: `47`
- Guides without visible dates: `7`
- Article schema blocks found: `139`
- Person schema blocks found: `19`
- Many guides still use Organization authorship rather than an identifiable reviewer/author.

What this means:
- The best pages already show the winning pattern: visible reviewer, updated date, cited sources, and a direct answer near the top.
- The rest of the corpus is lagging behind that standard.

What to do:
1. Roll out one consistent author/reviewer module across guides and owner pages.
2. Use Person schema where a real person is doing the review or authorship.
3. Keep Organization schema for brand ownership, not as a lazy substitute for authorship.

### Medium. Image hygiene is still weaker than the rest of the stack

Evidence:
- Total `<img>` tags reviewed: `564`
- Missing alt text: `1`
- Empty alt text: `24`
- Missing dimensions: `187`
- Missing lazy loading: `177`
- Modern-format image count: `40`
- Legacy or remote-format count: `522`
- Live OG images are still fairly heavy:
  - `seascape-og-default.jpg` — `229,135` bytes
  - `anna-maria-island-og.jpg` — `229,135` bytes
  - `sarasota-og.jpg` — `187,503` bytes

What this means:
- The site is not failing image SEO because of missing alts.
- It is failing it because the delivery layer is still inconsistent: too many unsized images, too many legacy assets, and too little responsive control.

What to do:
1. Standardize width/height across all emitted `<img>` tags.
2. Ensure below-fold images are lazy and non-LCP images use `decoding="async"`.
3. Convert or replace remaining heavy JPEG OG assets where reasonable.
4. Treat image work as template work, not one-off cleanup.

### Medium. Rich results are not translating cleanly from the current schema footprint

Evidence:
- URL inspection reports rich-result failure on:
  - homepage `/`
  - `/stays/anna-maria-island-beachfront-rentals/`
- The build contains broad schema coverage:
  - `BreadcrumbList`: `154`
  - `FAQPage`: `144`
  - `Article`: `139`
  - `LocalBusiness`: `72`
  - `Person`: `19`

What this means:
- The site is not missing schema.
- The site is over-relying on broad schema coverage while still underperforming on page-level trust and eligibility details.
- FAQ schema is useful for structure and AI parsing. It is not a magic Google-growth lever on commercial pages.

## Targeted Page Reviews

### Homepage `/`

**Page score: 61/100**

- Query pattern: mostly branded
- GSC: `33` clicks, `906` impressions, `3.64%` CTR, `13.6` position
- Strengths:
  - good overall content volume for homepage intent
  - core schema present
  - clean canonical
- Problems:
  - poor mobile LCP
  - unsized logo image
  - too much third-party JS for the first screen
  - rich-result status failing

### `/guides/bradenton-vs-sarasota/`

**Page score: 84/100**

- GSC cluster visibility is excellent, but split across multiple variants
- The canonical slash URL is indexed and healthy
- Strengths:
  - strong direct answer
  - visible reviewer treatment
  - external citations
  - strong heading structure
  - fast on mobile (`0.9s` LCP)
- Problems:
  - cluster fragmentation
  - CTR is still weak for a page ranking around position `2.7`
  - description is long at `173` characters

### `/property-management/vacation-rental-management-fees-florida/`

**Page score: 73/100**

- Indexed and ranking, but under-clicked
- Strengths:
  - adequate depth
  - clear H1 and intent alignment
  - strong technical health
  - fast on mobile (`0.9s` LCP)
- Problems:
  - almost no external proof
  - not enough internal-link support
  - snippet not compelling enough to earn clicks at current position

### `/stays/anna-maria-island-beachfront-rentals/`

**Page score: 56/100**

- Indexed but commercially weak
- Strengths:
  - technically clean and indexed
  - fast on mobile (`0.9s` LCP)
  - first image appears properly prioritized
- Problems:
  - only `435` words
  - low SERP competitiveness for the query class
  - thin evidence layer
  - rich-result status failing

## Content Audit

### What the site is already good at

- Comparison content is the strongest format on the domain.
- The winning pages answer the question fast, show a date, cite sources, and route the user to relevant next pages.
- The domain is clearly capable of publishing pages that work for both humans and machines.

### What the site is still doing badly

- Too many guides still look like anonymous brand content rather than reviewed local expertise.
- Too many stay pages rely on template presence rather than category dominance.
- Owner pages still need harder proof, sharper copy, and stronger click motive.

## Bottom-Line Priorities

### Fix this first

1. Canonical convergence and legacy URL cleanup
2. Owner-page CTR and proof pass
3. Stay-page depth rebuild on the highest-value commercial terms
4. Homepage LCP and analytics-weight cleanup

### Fix this next

1. Metadata QA gate
2. Author/reviewer + Person-schema rollout
3. Template-level image sizing and lazy-loading cleanup
4. Better internal linking from winning guides into money pages

### Do not start with

- another large page-volume batch
- broad schema tinkering without page-level proof improvements
- cosmetic metadata rewrites on pages with no impressions

## The Real Strategic Read

The comparison cluster is your proof that the domain can win.

The site does not need more proof that it can publish pages. It needs proof that it can:
- collapse authority into one canonical version,
- turn rankings into clicks on owner pages,
- and turn stay templates into pages strong enough to compete on real commercial SERPs.

That is the actual job now.
