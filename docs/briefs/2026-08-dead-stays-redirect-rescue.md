# Brief: August 2026 dead /stays/ redirect rescue

Technical route-recovery batch for ten repeatedly confirmed retired `/stays/` URLs that still returned hard 404s. This batch adds direct redirects only; it does not reopen retired pages, create new search inventory, or make a ranking claim.

## Content Gate Inputs

- persona: a guest or crawler arriving through a retired Seascape stay URL.
- primary keyword: Bradenton beach house rental and related retired stay-intent aliases.
- secondary keywords: monthly vacation rentals Florida Gulf Coast, vacation rentals near Siesta Key Beach, Riverwalk Bradenton vacation rentals, waterfront vacation rentals with kayaks, birdwatching vacation rentals Florida, De Soto National Memorial vacation rentals, Fourth of July vacation rentals Florida, and screened-lanai vacation rentals Florida.
- audience pattern: older search or backlink demand landing on retired routes instead of a useful current destination.
- proof source: repeated live 404 checks from the August 2026 monthly audit, current source inventory, built redirect validation, and current destination route readback.
- required internal links: none; this is redirect plumbing, not copy or link expansion.
- CTA target: preserve each destination page's existing booking path.
- anti-claims: no rank recovery, indexation recovery, traffic lift, or DataForSEO position claim while SERP evidence is unavailable.

## Why This Batch

- what changed in the data: ten retired `/stays/` slugs, including the tracked `bradenton-beach-house-rental` money-keyword URL, were repeatedly observed as hard 404s with no redirect or sitemap entry.
- why this cluster wins now: direct 301s repair confirmed route damage without resurrecting thin legacy pages.
- what should explicitly wait: any new stay page, content rewrite, ranking interpretation, or expansion decision based on the unavailable SERP queue.

## Experiment And Readback Contract

- hypothesis: direct 301s from the twenty slash/no-slash legacy forms to current live destinations remove the avoidable 404 without creating a redirect hop.
- primary event: each retired form resolves to its intended current destination.
- guardrail event: built redirect validation reports no missing or chained targets; the SEO regression asserts every rule.
- entry criteria: repeated live 404 confirmation, current source inventory showing the retired routes are not pages, and live current destinations.
- readback window: immediate post-deploy route readback, followed by normal recrawl; no ranking claim before fresh legitimate SERP evidence exists.
- decision rule: keep only direct rules whose targets remain live and current; revisit a target if source or live truth changes.

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | Retired Bradenton, Gulf Coast, Siesta Key, kayaking, birdwatching, De Soto, holiday, and screened-lanai stay aliases. |
| Searcher intent | Reach a useful current stay or property destination instead of a dead retired URL. |
| Current Seascape URL | Ten retired source slugs in `src/_redirects`, each with slashless and trailing-slash forms; eight current destination paths. |
| SERP observed date | 2026-08-11 |
| SERP stale after | 2026-08-18 |
| Current proof | Repeated August live 404 audit; current source has no page inventory for the retired routes; current destination readback resolves to Seascape pages; the 2026-08-11 DataForSEO standard-queue receipt is `unavailable` with `auth_missing`. |
| Top visible competitors | Not used for this route-only rescue because the current SERP evidence is unavailable; no competitor ranking claim is made. |
| Competitor angle | Route recovery is the gap; no competitor page structure is being copied. |
| Visual/format gap | Not applicable: no public page or layout is changed. |
| Seascape gap | Retired search/backlink routes leaked directly to 404 instead of handing visitors to the closest current destination. |
| Search fit | Direct route hygiene preserves the closest current destination without reopening unsupported legacy pages. |
| Local/GBP proof | Not applicable: no local-pack or GBP surface is touched. |
| AEO/readback note | Not applicable: the redirect carries no answer content, and post-deploy recrawl—not unavailable SERP data—will establish later search readback. |
| Recommendation | Add twenty exact 301 rules, verify every target is built/live and not another redirect, and keep all ranking fields unavailable until legitimate SERP evidence returns. |
| Attack status | completed |
| Query variants inspected | Each of the ten named retired slugs in slashless and trailing-slash form, plus source inventory, built redirects, and current destination paths. |
| SERP source | DataForSEO standard queue receipt observed 2026-08-11; status `unavailable`, error `auth_missing`; not used as rank evidence. |
| Competitor URLs inspected | Current destination route checks included https://seascape-vacations.com/stays/bradenton-vacation-rentals-near-beaches/ and https://seascape-vacations.com/properties/; no competitor structure was copied. |
| Content gap and Seascape answer | The gap is dead routing, not missing reader content; direct current destinations are the answer. |
| Design/format strategy | No public copy or layout change; preserve existing destination pages. |
| Seascape proof available | Current source inventory, exact redirect rules, built validator, and current destination route readback. |
| Tools/plugins used | GitHub exact-head inspection, live route readback, built redirect validator, SEO regression, and analytics receipt sync contract. |
| Decision and reason | Ship the bounded route repair after release safety passes; hold all rank interpretation until SERP evidence is available. |

## Cluster In Scope

- canonical winner URL(s): the eight current destination paths named by the redirect rules.
- feeder pages: none.
- aliases or retired URLs: the ten named legacy slugs and their slash variants.
- money destination: the existing current stay/property pages; no new money page.
- active lane: technical stay-route rescue.

## Source And Proof Constraints

- property truth needed: only current destination existence and existing page truth.
- owner proof asset needed: none.
- claims that are off-limits: ranking, indexation, traffic, conversion, or SERP competitor claims from the unavailable DataForSEO evidence.
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: exact current route ownership and verified destination mapping.

## Page Builder Tasks

- source files likely to change: `src/_redirects`, `scripts/enforcement/seo-structure.test.js`, `scripts/enforcement/sync-next-batch-from-analytics-receipt.js`, `scripts/enforcement/sync-next-batch-from-analytics-receipt.test.js`, and `docs/status/next-batch.md`.
- redirect or schema work: direct 301s only; no schema or sitemap expansion.
- internal-link or CTA work: none.
- money CTA and downstream tracking event to verify: existing destination CTAs only.

## Release Gate Checklist

- routes to smoke test: all ten retired slugs in both slash forms and all eight current destinations.
- commands to run: `npm run build`, `node --test scripts/enforcement/seo-structure.test.js`, `npm run verify:redirects`, `npm run verify:links`, `npm run verify:jsonld`, and `npm run verify:release`.
- regression risks to watch: missing destination, redirect chain, accidental page resurrection, or unavailable SERP fields being rendered as rank evidence.

## Done When

- exact-head release safety passes,
- all twenty rules are present,
- every target is a built/current page with no downstream redirect,
- the sync output labels unavailable SERP evidence as unavailable,
- and the PR remains separate from deployment and live analytics/runtime changes.

## Not In Scope

- deployment or live runtime/analytics changes,
- DataForSEO credential repair,
- new stay pages or copy rewrites,
- rank or competitor claims before fresh legitimate SERP evidence,
- broader SEO expansion.
