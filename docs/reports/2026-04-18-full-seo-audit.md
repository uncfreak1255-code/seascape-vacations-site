# Seascape Vacations Full SEO Audit

Date: 2026-04-18
Site: [seascape-vacations.com](https://seascape-vacations.com)
Audit windows:
- Structural + live-site checks: 2026-04-18
- Operator read, last 7 complete days: 2026-04-11 through 2026-04-17
- Operator read, last 28 days: 2026-03-21 through 2026-04-17

Business type: local vacation rental operator + owner-acquisition service business + destination/comparison publisher

## Executive Summary

**Overall SEO Health Score: 74/100**

The March 30 audit is not the current bottleneck anymore. Source hygiene is materially better. The site builds cleanly, redirects are clean, JSON-LD validates, the homepage is no longer slow, and live canonical redirects are mostly doing what they should.

What is still broken is more specific:

1. Google is still splitting authority across winner-guide variants even though the live redirects look clean now.
2. Owner money pages have enough visibility to matter, but they still do not convert that visibility into clicks or forms.
3. The stay money pages are still weak commercial pages, and the broader stay corpus is still too thin.
4. Metadata, author treatment, and image discipline are still loose enough to leak quality.
5. One of the repo's live-smoke checks is stale and now fails on a page that is actually live and current.

The hard read: the site is no longer in "technical emergency" territory. It is in "authority consolidation + click yield" territory.

## What Improved Since 2026-03-30

- `npm run verify:release` now passes cleanly in a fresh worktree.
- Local build integrity is strong:
  - `153` HTML pages built
  - `326` redirect rules validated
  - `153` pages passed internal-link validation
  - `153` pages scanned with `677` valid JSON-LD blocks
- Live canonical surfaces look cleaner:
  - `https://seascape-vacations.com/sitemap.xml` serves `141` URLs
  - tested alias URLs 301 directly to canonical slash routes
- Homepage performance is no longer the obvious drag:
  - March 30 baseline: Lighthouse mobile `69`, LCP `7.2s`
  - April 18 live run: Lighthouse mobile `96`, LCP `2.1s`

That means the old homepage-performance diagnosis is mostly stale. The problem moved.

## Scorecard

| Category | Score | Evidence |
| --- | ---: | --- |
| Technical SEO | 82 | Clean build, redirect validation, internal-link validation, JSON-LD validation, live sitemap present, alias redirects working |
| Content Quality | 68 | winner guides are strong, but `38/60` stay pages are under `800` words and several guide pages are still thin |
| On-Page SEO | 66 | no missing canonicals or H1s, but `34` titles are over `65` chars and key money pages still have weak snippets |
| Schema / Structured Data | 78 | coverage is broad and valid, but visible author treatment and schema authorship are still inconsistent |
| Performance | 84 | homepage, owner fees, and winner guide are strong; AMI stay page is still slow |
| Images | 62 | too many images still lack dimensions/loading and too many remain legacy/remote-hosted |
| AI Search Readiness | 76 | `robots.txt` and `llms.txt` are live, but owner-money routes are still underrepresented in the AI surface |

## Evidence Snapshot

### Structural Checks

- `verify:release`: passed
- built HTML pages: `153`
- sitemap URLs: `141` local, `141` live
- redirects validated: `326`
- internal links: `153` pages crawled, all valid
- JSON-LD: `153` pages scanned, `677` valid blocks

### Live Performance Checks

| Page | Perf | SEO | LCP | Notes |
| --- | ---: | ---: | ---: | --- |
| `/` | 96 | 92 | `2.1s` | major improvement from March audit |
| `/property-management/vacation-rental-management-fees-florida/` | 100 | 100 | `0.88s` | technically strong but not persuasive enough in SERP |
| `/stays/anna-maria-island-vacation-rentals/` | 74 | 100 | `5.36s` | weakest sampled commercial page |
| `/guides/bradenton-vs-sarasota/` | 100 | 100 | `0.91s` | guide winner remains technically strong |

### Operator Read: Last 7 Complete Days

Window: `2026-04-11` through `2026-04-17`

- guide_winners: `10,591` impressions, `19` clicks, `0.18%` CTR, avg position `2.38`
- owner_money: `764` impressions, `0` clicks, `0.00%` CTR, avg position `5.10`
- stay_money: `38` impressions, `0` clicks, `0.00%` CTR, avg position `25.37`
- next branch from the live operator report: `winner-guide-consolidation`

### Operator Read: Last 28 Days

Window: `2026-03-21` through `2026-04-17`

- owner_money: `3,738` impressions, `4` clicks, `0.11%` CTR, avg position `4.68`, `44` GA4 sessions
- stay_money: `502` impressions, `0` clicks, `0.00%` CTR, avg position `35.98`, `148` GA4 sessions
- next branch from the 28-day operator report: `owner-ctr-rewrite-round-2`

This is the important split:

- the **7-day gate** still says "do not fire the owner rewrite yet"
- the **28-day trend** says "the owner rewrite is coming next unless guide leakage still muddies the read"

The repo docs say the 7-day joined reread is the decision gate. So the immediate branch should still follow that rule.

## Findings

### Critical. Winner-guide canonical leakage is still the top live search bottleneck

This is no longer a redirect-plumbing problem. It is now a Google-convergence problem.

Evidence:

- last 7 days:
  - `/guides/bradenton-vs-sarasota/`: `5,512` impressions, `13` clicks, `2` URL variants
  - `/guides/anna-maria-island-vs-siesta-key/`: `2,877` impressions, `5` clicks, `2` URL variants
  - `/guides/best-time-visit-anna-maria-island/`: `73` impressions, `1` click, `3` URL variants
- last 28 days:
  - `/guides/bradenton-vs-sarasota/`: `18,853` impressions, `43` clicks, `2` URL variants
  - `/guides/anna-maria-island-vs-siesta-key/`: `8,092` impressions, `38` clicks, `2` URL variants
- live checks confirm the obvious aliases already 301 correctly:
  - `/guides/bradenton-vs-sarasota-vacation-rental-comparison/` -> `/guides/bradenton-vs-sarasota/`
  - `/guides/bradenton-vs-sarasota.html` -> `/guides/bradenton-vs-sarasota/`
  - `/guides/is-anna-maria-island-worth-visiting.html` -> `/guides/is-anna-maria-island-worth-visiting/`

What this means:

- Source cleanup happened.
- Google still has not fully collapsed the winning guide families into one reporting identity.
- The repo's own April brief was right: another owner rewrite before the guide-family cleanup finishes is premature.

### High. Owner money pages have visibility, but snippet yield is dead

Evidence from the 28-day operator read:

- owner_money cluster: `3,738` impressions, `4` clicks, `0.11%` CTR, avg position `4.68`
- `/property-management/vacation-rental-management-fees-florida/`:
  - `1,037` impressions
  - `2` clicks
  - `0.19%` CTR
  - avg position `3.47`
  - `18` GA4 sessions
  - `0` owner CTA clicks
  - `0` form submits
- `/property-management/vacation-rental-licensing-florida/`:
  - `741` impressions
  - `0` clicks
  - `0.00%` CTR
  - avg position `6.71`
  - `4` GA4 sessions
  - `0` owner CTA clicks
  - `0` form submits

Page-shape evidence from the build:

- owner money pages are not thin:
  - fees page: `1,605` words
  - licensing page: `1,728` words
  - VRBO page: `1,748` words
- but they still have weak trust surfaces:
  - `0` external links on each sampled owner money page
  - no visible updated date on sampled owner money pages
  - fees page title length: `90`
  - licensing page title length: `86`

What this means:

- This is not an indexing problem.
- This is not a "write more words" problem.
- This is a click-yield problem: titles, meta framing, proof density, and above-fold persuasion are still underpowered.

### High. Stay money pages are still the weakest commercial surface

Evidence:

- stay-money cluster, last 28 days: `502` impressions, `0` clicks, `0.00%` CTR, avg position `35.98`
- `/stays/anna-maria-island-vacation-rentals/`:
  - `27` impressions
  - avg position `20.04`
  - `36` GA4 sessions
  - `0` `stay_view_property_clicks`
  - operator decision: "Stay page CRO problem"
- `/stays/anna-maria-island-beachfront-rentals/`:
  - `224` impressions
  - avg position `37.91`
  - `38` GA4 sessions
  - `10` `stay_view_property_clicks`
  - `2` URL variants still splitting demand

Corpus-level evidence:

- `60` stay pages total
- `38` stay pages under `800` words

Performance evidence:

- live Lighthouse mobile on `/stays/anna-maria-island-vacation-rentals/`:
  - performance `74`
  - LCP `5.36s`
- heaviest sampled requests on that page:
  - Hostaway image `~118 KB`
  - nav logo `~74 KB`
  - `gtag.js` adds `~65 KB` wasted JS

What this means:

- The stay system is still a weak money-page template with too much thin sprawl around it.
- Do not answer this with more stay pages.
- Fix page strength and handoff behavior first.

### Medium. Metadata QA is still leaking obvious quality

Evidence from the local build:

- `34` titles over `65` characters
- `70` meta descriptions under `120` characters
- `13` meta descriptions over `160` characters
- no pages missing meta descriptions, canonicals, or H1s

Important examples:

- live `/guides/bradenton-vs-sarasota/` meta description length: `173`
- `/property-management/vacation-rental-management-fees-florida/` title length: `90`
- `/property-management/vacation-rental-licensing-florida/` title length: `86`
- `/stays/anna-maria-island-vacation-rentals/` title length: `89`
- `/stays/anna-maria-island-beachfront-rentals/`:
  - title length: `94`
  - meta description length: `167`

What this means:

- The site is no longer shipping broken metadata.
- It is still shipping bloated metadata on pages where snippet efficiency matters most.

### Medium. Visible authorship and freshness are still inconsistent outside the best guides

Evidence from the build scan:

- guide pages: `53`
- guides without visible author markers (`Reviewed by` / `data-guide-author` scan): `48`
- guides without visible updated-date marker: `19`

Example split:

- `/guides/bradenton-vs-sarasota/` has visible `Reviewed by Sawyer Beck` treatment and an updated-date badge
- `/guides/is-anna-maria-island-worth-visiting/` still uses Organization authorship in schema and does not expose the same visible author-treatment pattern

What this means:

- The winning pattern exists.
- It has not been rolled out consistently enough to become a site-wide trust signal.

### Medium. Image delivery is still sloppier than the rest of the stack

Evidence from the build:

- total images: `552`
- missing alt: `1`
- empty alt: `26`
- missing width: `178`
- missing height: `91`
- missing `loading`: `100`
- remote-hosted image references: `368`
- modern image references: `40`
- legacy references: `512`

What this means:

- Alt text is not the problem.
- Delivery discipline is the problem: sizing, loading, and legacy/remote dependency are still inconsistent.

### Medium. AI-search readiness is real, but still guest-heavy and owner-light

Evidence:

- live `robots.txt`: `200`
- live `llms.txt`: `200`
- `robots.txt` explicitly allows AI crawlers
- `llms.txt` includes `/stays/anna-maria-island-vacation-rentals/`
- `llms.txt` does **not** include `/property-management/vacation-rental-management-fees-florida/`
- shared `sameAs` footprint is still only three URLs:
  - Facebook
  - Instagram
  - Google Business Profile search URL

Inference:

- guest/discovery content is represented well enough for AI ingestion
- owner-acquisition pages are underrepresented relative to the stated business priority

### Low. The release gate has one stale assertion and is now generating false alarms

Evidence:

- `node scripts/recovery/assert-live-smoke.js https://seascape-vacations.com` failed on:
  - `property-management hub is missing the owner explainer content`
- local build and live page both show the current owner-hub H1:
  - `Property management for owners who care about net revenue`

What this means:

- the smoke test is stale
- false alarms in release tooling waste time and train people to ignore the gate

## What To Stop Doing

- Stop treating this like a fresh "full audit" problem. The structural debt is narrower now.
- Stop using new page volume as the default answer. The stay corpus already has too many weak pages.
- Stop pretending owner CTR is a ranking problem. It is a snippet and proof problem.
- Stop trusting the live-smoke script blindly until the stale owner-hub assertion is fixed.

## Current Decision

Using the repo's own decision rules, the immediate next move is still:

**`winner-guide-consolidation`**

Not because owner CTR is fine. It is not. Because the current 7-day joined read still says the guide-family canonical leak is the cleaner next bottleneck to remove before interpreting the owner and stay numbers too aggressively.

The next branch after that is likely:

**`owner-ctr-rewrite-round-2`**

The 28-day evidence already points there.

## Limits

- This audit used the live site, local build, and the `seascape-analytics` operator report.
- It did **not** run per-URL Search Console inspection through the Search Console MCP server.
- That means "Google is still splitting variants" is grounded in the joined operator report's `variants` counts, not a fresh URL Inspection export for every page.
