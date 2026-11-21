# Brief: Seascape Vacations reviews page (Florida identity)

- lifecycle: active
- task scope: new indexable `/reviews/` page that wins the branded query "Seascape Vacations reviews" for the Bradenton/Sarasota, Florida manager, plus small inbound links and machine-surface disambiguation. Not an analytics-gated expansion batch.
- completion or successor: not complete until this source change merges

## Content Gate Inputs

- persona: a guest or owner googling or asking ChatGPT "Seascape Vacations reviews", and an answer engine that currently cites a Whidbey Island, Washington rental
- primary keyword: Seascape Vacations reviews
- secondary keywords: Is Seascape Vacations legit; Seascape Vacations Bradenton; Seascape Vacations Sarasota
- audience pattern: branded trust and entity disambiguation; the page must be quoteable as the Florida manager in the first 40 words
- proof source: first-party `guestFacts.reviews` in `src/_data/properties-fallback.json` (verifiedAt 2026-09-04 on the four quoted homes); Treg ChatGPT check 2026-11-21 (q06 wrong-company, q07 Florida entity); GSC brand windows in this brief's Gate 0; Sunbiz entity-name search 2026-11-21 for B&T Rental Group LLC L22000510885 Active
- required internal links: /reviews/, /, /about-us/, /properties/, /properties/the-oasis/, /properties/dockside-dreams/, /properties/sarasota-luxe/, /properties/river-house/, /guides/booking-direct-vacation-rentals/, /property-management/
- CTA target: `/properties/` and `https://book.seascape-vacations.com`; owner paragraph points to `/property-management/`
- anti-claims: no invented reviews, ratings, addresses, distances, fee figures, or savings; no company-wide star rating; no LocalBusiness `aggregateRating`; no Google review count or Google review quotes; no Vrbo quotes; no street address; never name Patrick; no Washington/Delaware/North Carolina/30A/Miramar Beach place names in title, H1, or meta
- hypothesis: a human-visible Florida reviews URL, plus Whidbey/Miramar Beach disambiguation in copy, schema, `llms.txt`, and `/ai/summary.json`, gives ChatGPT a citable page for "Seascape Vacations reviews" that cannot be the Washington rental. Citation lift is unproven.
- primary event: ChatGPT (or the next identical frozen-prompt rerun owned by Analytics) names the Bradenton/Sarasota manager on "Seascape Vacations reviews" and cites seascape-vacations.com
- guardrail event: invented review text, a company `aggregateRating`, a street address, a Google review-count claim, or a revert of the stacked phone homepage
- entry criteria: Sawyer approved this citation-gap page on 2026-11-21; live `/reviews/` 404; ChatGPT q06 cited expedia.ca for a Whidbey Island rental
- readback window: next identical OpenSEO frozen-prompt rerun after production publish, not sooner than 28 days; Analytics owns the citation receipt. No traffic lift is promised.
- decision rule: keep the truthful Florida identity page; report insufficient evidence for citation or click lift; revert invented claims, `aggregateRating`, or homepage layout changes

## Figma Handoff

- Figma capture: none
- Figma frames: none

## Why This Batch

- what changed in the data: a 2026-11-21 Treg ChatGPT check answered "Seascape Vacations reviews" about Seascape Whidbey Island Vacation Rental in Oak Harbor, Washington. PR #718 machine-surface disambiguation did not reduce wrong-company brand answers on the 2026-11-09 readback. Live `/reviews/`, `/reviews`, and `/testimonials/` 404.
- why this cluster wins now: Sawyer explicitly approved this citation-gap page on Saturday, Nov 21, 2026. It is not a new analytics-gated expansion. `docs/status/next-batch.md` Latest Execution Read 2026-11-09 remains `fresh but below threshold`; expansion branches stay held.
- what should explicitly wait: `aggregateRating`, Google review quotes, Airbnb/Hostaway listing scores, a Sunbiz street address, Vrbo review text, and any new pages beyond `/reviews/`

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | Seascape Vacations reviews |
| Searcher intent | Branded trust: is this the Florida manager, and where are guest reviews? |
| Current Seascape URL | none live; this batch creates `/reviews/`. `/about-us/` identifies the local operator but does not disambiguate Whidbey Island or show reviews |
| SERP observed date | 2026-11-21 |
| SERP stale after | 2026-12-19 |
| Current proof | GSC 2026-08-21 to 2026-11-18: `seascape vacations` 148 impressions, 26 clicks, position 1.8. No `/reviews/` URL. No exact `seascape vacations reviews` query in the 16,797-query 16-month dump. Closest: `seascape property management reviews` 4 impressions, 0 clicks, pos 14.8 in 90 days. ChatGPT q06 2026-11-21 cited expedia.ca for a Whidbey Island rental. |
| Top visible competitors | Seascape Whidbey Island Vacation Rental (Oak Harbor, WA) via Expedia; Seascape Resort, Miramar Beach; similarly named managers already listed in `site.disambiguatingDescription` |
| Competitor angle | Same brand string, different geography; answer engines pick the wrong entity |
| Visual/format gap | None. Reuse guest layout, homepage `g-review-grid`, and property-page review attribution. No new visual system. |
| Seascape gap | No indexable reviews URL; Organization JSON-LD has no PostalAddress; `disambiguatingDescription` omits Whidbey Island and Miramar Beach |
| Search fit | New `/reviews/` is the canonical winner for the branded reviews query. Money destination stays `/properties/` and direct booking. About Us stays the team page. |
| Local/GBP proof | GBP review count and Google review text are unverified in this build. Link the existing kgmid profile already in `site.sameAsLinks`; do not state a count. |
| AEO/readback note | ChatGPT q06 missed the Florida company. q07 ("Is Seascape Vacations legit?") did identify Bradenton/Sarasota and cited seascape-vacations.com. This page is for answer-engine disambiguation, not a proven high-volume Google query. |
| Recommendation | Ship `/reviews/` with first-party booking-listing quotes, Florida identity, and Whidbey/Miramar Beach disambiguation. Omit `aggregateRating`. |
| Attack status | completed |
| Query variants inspected | Seascape Vacations reviews; Is Seascape Vacations legit; seascape property management reviews |
| SERP source | Treg ChatGPT check 2026-11-21 7:13–7:22 AM ET; free GSC pull 2026-11-21 (windows ended 2026-11-18); live URL check that `/reviews/` 404s |
| Competitor URLs inspected | https://www.expedia.ca/ (ChatGPT q06 citation for the Whidbey Island rental); https://seascape-vacations.com/about-us/; https://seascape-vacations.com/reviews/ (404 on 2026-11-21) |
| Content gap and Seascape answer | A Florida-only reviews page with first-party guest quotes and an explicit not-the-Washington-rental paragraph |
| Design/format strategy | Guest layout following `/about-us/`. Reuse homepage review-grid typography. One text link on the homepage reviews intro. No stacked-phone homepage CSS. |
| Seascape proof available | Twelve first-party quotes in `properties-fallback.json` already shown on property pages and (shortest quote) the homepage. Sunbiz search 2026-11-21: B&T Rental Group LLC L22000510885 Active. Eight published managed homes in the fallback catalog. |
| Tools/plugins used | Live booking-page fetch 2026-11-21; Sunbiz entity-name search via WebFetch; repo source. No paid OpenSEO. Compound Writing `cw-draft` / `cw-line-edit` is not installed in this Cursor cloud session; native prose edit against `docs/style/`. |
| Decision and reason | Sawyer approved this citation-gap page. Do not open unrelated new pages. |

## Cluster In Scope

- canonical winner URL: `/reviews/`
- feeder pages: `/`, `/about-us/`, footer Explore, `llms.txt`, `/ai/summary.json`
- aliases or retired URLs: none. `/testimonials/` stays 404.
- money destination: `/properties/` and `https://book.seascape-vacations.com`
- active lane: branded trust / AEO entity disambiguation (direct-book stay intent)

## Source And Proof Constraints

- property truth: quote only `guestFacts.reviews` already in `src/_data/properties-fallback.json` for Dockside Dreams, The Oasis, Sarasota Luxe, and River House. Empty review arrays stay unquoted.
- owner proof asset: none
- claims that are off-limits: company-wide rating, Google review count, street address including 6103 Riverview Blvd, Airbnb listing scores from the Nov 7 file, Vrbo quotes, management fees, Patrick
- Seascape-specific proof: first-party booking-listing quotes in the guests' own words, Florida legal entity B&T Rental Group LLC, and the Whidbey Island mix-up from the 2026-11-21 ChatGPT check

## Required Internal Link Map

- src/reviews/index.njk: /, /about-us/, /properties/, /properties/the-oasis/, /properties/dockside-dreams/, /properties/sarasota-luxe/, /properties/river-house/, /guides/booking-direct-vacation-rentals/, /property-management/
- src/index.njk: /reviews/, /properties/
- src/about-us/index.njk: /reviews/, /property-management/

## Source Files Changed In This Batch

  - src/reviews/index.njk
  - src/css/reviews.css
  - src/index.njk
  - src/about-us/index.njk
  - src/_includes/partials/guest-footer.njk
  - src/_includes/partials/organization-schema.njk
  - src/_data/site.json
  - src/llms.txt
  - src/ai/summary.json.njk
  - src/_redirects
  - docs/briefs/2026-11-21-seascape-vacations-reviews.md
  - docs/status/page-ledger.json
  - scripts/enforcement/reviews-page.test.js
  - scripts/enforcement/ai-discovery-schema.test.js
  - scripts/enforcement/content-voice.test.js
  - scripts/recovery/assert-build-output.js

## Page Builder Tasks

- source files likely to change: see Source Files Changed In This Batch
- redirect or schema work: `/reviews` → `/reviews/`; CollectionPage, LocalBusiness, FAQPage, BreadcrumbList, optional Review nodes; no `aggregateRating`; update Organization `disambiguatingDescription`, `legalName`, locality-only address
- internal-link or CTA work: homepage reviews intro, footer Explore, About Us paragraph, `llms.txt`, `/ai/summary.json`
- money CTA and downstream tracking event to verify: existing `/properties/` and booking-host links; no new tracked event

## Voice Editor Checklist

- tone risks: sounding like a legal disclaimer, attacking other businesses, or padding with tourism adjectives
- generic or mechanical patterns to kill: curated, seamless, luxury-as-filler, not-just-but-also
- proof or specificity checks: quotes stay verbatim, including Florian Lasserre's original spelling; Sunbiz document number only if the 2026-11-21 search still showed Active
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured

## Release Gate Checklist

- routes to smoke test: `/reviews/`, `/`, `/about-us/`, `/llms.txt`, `/ai/summary.json`
- commands to run: `npm run check:brief -- docs/briefs/2026-11-21-seascape-vacations-reviews.md`; `npm run build`; `npm run lint:content`; `npm run verify:jsonld`; `npm run verify:links`; `node --test scripts/enforcement/reviews-page.test.js scripts/enforcement/ai-discovery-schema.test.js`; `npm run verify:release -- --range origin/main`
- regression risks to watch: stacked phone homepage (#965 / #1026); owner-fee copy; homepage settle window for `src/index.njk` (PR #994 shipped 2026-11-17) needs `Settle-Override` for the inbound text link

## Writing skill

- Compound Writing `cw-draft` / `cw-line-edit` is not installed in this Cursor cloud session. Native prose edit against `docs/style/voice.md`, `docs/style/banned-patterns.md`, and `docs/style/approved-examples.md`. Capability gap recorded here and in the PR.

## Done When

- `/reviews/` is indexable with the specified title, meta, H1, Florida identity statement, first-party quotes, FAQ parity, and no `aggregateRating`
- inbound links exist from the homepage reviews intro, footer, and About Us
- `llms.txt` and `/ai/summary.json` point at `/reviews/` for the Whidbey Island disambiguation
- content lint, JSON-LD, link check, and release verification pass on the committed head

## Not In Scope

- stacked phone homepage layout, hero, or homepage CSS protected by #965 / #1026
- owner-fee pages (#1030)
- Google review quotes or counts
- Airbnb or Hostaway listing scores
- Sunbiz street address
- Vrbo review text
- `/testimonials/`
- merging or publishing to `production`
