# Brief: June 12 404 Alert Redirect Rescue

## Content Gate Inputs

- persona: Gulf Coast guest or owner who lands on an older Seascape URL that should still route to a useful live page instead of a 404.
- primary keyword: book direct vacation rentals
- secondary keywords: Anna Maria Island pet-friendly rentals, Florida vacation rentals with private pool, Cortez Village vacation rentals, Palmetto vacation rentals Florida, spring break rentals Anna Maria Island
- audience pattern: existing search demand or stale backlinks hitting retired stay aliases and one generic direct-book alias.
- proof source: `/Users/sawbeck/Projects/seascape-analytics/tmp/gsc-june-12-404-alert-readback.md`, `docs/status/next-batch.md`, current source reads in `src/_redirects` and `src/_data/seoPages.json`, live production route checks, live `sitemap.xml`, live `ai-discovery.json`, and built `_site/_redirects`.
- required internal links: none; this branch is route hygiene, not copy expansion.
- CTA target: preserve the current live destinations for each alias; no new CTA path.
- anti-claims: no rank-recovery claim, no indexation-recovery claim before recrawl, no claim that retired stay aliases were intentionally healthy, no new stay page reopen, and no new owner or guest proof claim.

## Why This Batch

- what changed in the data: the June 12 Search Console 404 alert still classifies the issue as `real_indexable_page_damage`, with ten live 404 stay/direct-book aliases and one owner page that remains a real live URL.
- why this cluster wins now: current repo truth says the owner page still exists and should stay live, while the ten stay/direct-book URLs are gone from current source and need current-page redirects instead of live 404s.
- what should explicitly wait: any broader stay rebuild, new page volume, content rewrites, or owner-page indexing claims beyond this route cleanup.

## Experiment And Readback Contract

- hypothesis: replacing the live 404s with direct 301s to the closest current live pages will remove avoidable route damage without reopening retired stay pages.
- primary event: the affected legacy URLs stop resolving as live 404s after deploy.
- guardrail event: `npm run lint:content`, `npm test`, `npm run verify:links`, and `npm run verify:redirects` all stay green.
- entry criteria: the analytics readback still names the alert as live damage, and live production checks confirm the listed URLs return 404 today.
- readback window: immediate live route readback after production deploy, then the post-deploy analytics rerun from `seascape-analytics`.
- decision rule: keep the redirects if the live aliases resolve cleanly to the intended destinations and the analytics rerun no longer treats them as unresolved site damage; revisit only if fresh source truth says a retired page should be rebuilt instead.

## Gate 0 Rescue Block

| Field | Required answer |
| --- | --- |
| Target query family | book direct vacation rentals; near-AMI pet-friendly/private-pool/spring-break stay intent; Bradenton/Cortez/Palmetto retired stay aliases. |
| Searcher intent | direct-book stay intent and route recovery for existing demand already landing on Seascape aliases. |
| Current Seascape URL | `/book-direct/` and the retired `/stays/*` aliases from the June 12 alert; `/property-management/maximize-vacation-rental-income-florida/` remains the live owner control URL. |
| Current proof | Live production checks on 2026-06-18 showed `/property-management/maximize-vacation-rental-income-florida/` returning `200`, while `/book-direct/`, `/stays/vacation-rentals-with-outdoor-kitchen-florida/`, `/stays/palmetto-vacation-rentals-florida/`, `/stays/cortez-village-vacation-rentals/`, `/stays/memorial-day-weekend-rentals-florida/`, `/stays/vacation-rentals-with-private-pool-florida/`, `/stays/sunset-cruise-vacation-rentals-bradenton/`, `/stays/pet-friendly-vacation-rentals-anna-maria-island/`, `/stays/spring-break-vacation-rentals-florida-gulf-coast/`, and `/stays/book-direct-vs-airbnb-vrbo/` all returned `404`. Current source inventory no longer contains those ten stay/direct-book pages, and live `sitemap.xml` only includes the current destination pages. |
| Top visible competitors | For the retired stay queries the visible market is broad inventory and OTA coverage such as Airbnb, Vrbo, and FloridaRentals.com; for direct-book comparison intent, generic booking-direct guides compete for attention. |
| Competitor angle | live inventory breadth, direct-book savings explanations, amenity/category pages, and cleaner routing for older alias demand. |
| Seascape gap | Seascape had already retired the old aliases in source, but production still left them as unresolved 404s instead of handing existing demand to the closest current live page. |
| Recommended action | redirect/canonical fix only: add direct 301s from the retired aliases to current live destinations, keep the live owner page unchanged, and verify the built/live redirect surface. |

## Search Operator Read

- source reads used: `src/_redirects`, `src/_data/seoPages.json`, `src/sitemap.njk`, `scripts/enforcement/seo-structure.test.js`, `docs/status/next-batch.md`, and the analytics alert receipt.
- URLs inspected: the eleven URLs named in the user request plus the chosen live destinations and live `sitemap.xml`/`ai-discovery.json`.
- main evidence: none of the ten stay/direct-book alert URLs exist in current source page inventory, none appear in current live sitemap or live AI-discovery output, and production still returns 404 for each of them.
- competitor pages inspected for demand patterns, not copied topics: generic OTA and directory results for the retired query families only; no competitor structure was copied.
- question-tool language worth preserving in customer wording: none; this branch changes routes, not public copy.
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: the analytics readback supports killing the live 404 state and routing demand into current live pages; it does not support reopening the retired pages themselves.

## Cluster In Scope

- canonical winner URL(s): `/guides/booking-direct-vacation-rentals/`, `/stays/anna-maria-island-homes-with-pool/`, `/stays/bradenton-vacation-rentals-near-beaches/`, `/stays/long-weekend-getaway-florida/`, `/stays/pet-friendly-vacation-rentals-bradenton/`, `/stays/spring-break-rentals-anna-maria-island/`, `/guides/things-to-do-bradenton-fl/`, `/guides/bradenton-area-guide/`, `/properties/`, and `/property-management/maximize-vacation-rental-income-florida/`.
- feeder pages: none changed.
- aliases or retired URLs: `/book-direct/`, `/stays/book-direct-vs-airbnb-vrbo/`, `/stays/cortez-village-vacation-rentals/`, `/stays/memorial-day-weekend-rentals-florida/`, `/stays/palmetto-vacation-rentals-florida/`, `/stays/pet-friendly-vacation-rentals-anna-maria-island/`, `/stays/spring-break-vacation-rentals-florida-gulf-coast/`, `/stays/sunset-cruise-vacation-rentals-bradenton/`, `/stays/vacation-rentals-with-outdoor-kitchen-florida/`, and `/stays/vacation-rentals-with-private-pool-florida/`.
- money destination: mixed current live destinations listed above; no single new money page.
- active lane: stay/direct-booking route hygiene and indexation rescue.

## Source And Proof Constraints

- property truth needed: destination choices must stay aligned with current source-backed live pages and actual inventory position; no invented on-island inventory claims.
- owner proof asset needed: none.
- claims that are off-limits: that these redirects alone fixed indexing, that the retired pages should be reopened, or that the owner page indexing state changed.
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: current live source inventory, validated redirect targets, and production readback on the exact alert URLs.

## Page Builder Tasks

- source files likely to change: `src/_redirects`, `scripts/enforcement/seo-structure.test.js`, and this brief.
- redirect or schema work: add direct 301s for the ten retired aliases and `/book-direct/`.
- internal-link or CTA work: none.
- money CTA and downstream tracking event to verify: none added; existing destination pages keep their current CTAs and tracking.

## Voice Editor Checklist

- tone risks: none; no reader-facing copy changes.
- generic or mechanical patterns to kill: none; do not expand this into a copy pass.
- proof or specificity checks: keep every route claim tied to source truth or live route checks.
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured: not applicable for this branch.

## Release Gate Checklist

- routes to smoke test: the ten retired aliases, `/book-direct/`, the owner control URL, and the chosen live destinations.
- commands to run: `npm run lint:content`, `npm test`, `npm run verify:links`, `npm run verify:redirects`, and `node --test scripts/enforcement/seo-structure.test.js`.
- regression risks to watch: redirect hops, bad destination choices, any retired alias still appearing in live 404 state, or accidental owner-page regressions.

## Done When

- the owner control URL still resolves live,
- the retired June 12 aliases 301 directly to the intended current live destinations,
- the redirect rules appear in built `_site/_redirects`,
- the repo verification gates pass,
- and the post-deploy analytics rerun can read the cleanup from production.

## Post-Reread Outcome

- reread window used: pending until post-deploy analytics rerun.
- crawl freshness result: pending until Google recrawl.
- actual impressions, CTR, position, and downstream event counts: pending.
- decision taken: route cleanup now; wait for post-deploy readback before any broader indexation claim.
- next branch slug or explicit wait state: wait for the analytics rerun and fresh Search Console recrawl.

## Not In Scope

- reopening the retired stay pages as source pages,
- owner-page copy or metadata rewrites,
- broad sitemap or internal-link restructuring beyond the redirect lane,
- blog-post sprawl from retired-query demand,
- copied competitor structure without Seascape-specific proof.
