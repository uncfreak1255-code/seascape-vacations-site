# Brief: Index rescue — Florida vacation rental licensing money page

Rescue lane brief under `docs/process/ranking-regression-rescue.md`. Triggered by
the 2026-07-15 indexation-health-monitor run: the owner money page
`/property-management/vacation-rental-licensing-florida/` is sitting in Google's
`Crawled - currently not indexed` bucket with a stale `last_crawled 2026-02-01`.

## Content Gate Inputs

- persona: Florida Gulf Coast vacation-rental owner/operator evaluating compliance and net income
- primary keyword: florida vacation rental license
- secondary keywords: DBPR vacation rental license, vacation rental license requirements florida, county vacation rental rules
- audience pattern: owner/operator informational intent feeding the property-management funnel
- proof source: DBPR/myfloridalicense.com statute references already cited on the page; Seascape county-level operating experience
- required internal links: /property-management/vacation-rental-licensing-florida/, /property-management/maximize-vacation-rental-income-florida/
- CTA target: `/property-management/` management inquiry
- anti-claims: no fabricated fee/revenue-lift/homes-served numbers; no new metric claims on the owner page itself

## Why This Batch

- what changed in the data: 2026-07-15 GSC URL Inspection audit shows the page `Crawled - currently not indexed`, `INDEXING_STATE_UNSPECIFIED`, null Google canonical, no recrawl since 2026-02-01 despite a 2026-06-25 sitemap `lastmod`.
- why this cluster wins now: it is a tracked owner money page (owner acquisition is the #1 bottleneck) that already has links + owner value, so it qualifies for rescue under next-batch.md line 129 (not the "do not force-reindex the pruned set" exclusion).
- what should explicitly wait: any content rewrite of the owner page itself waits for a post-recrawl read (next-batch.md #7 and "Do Not Start With"). This batch does NOT touch the owner page source.

## Experiment And Readback Contract

- hypothesis: a fresh contextual inbound link from an already-indexed, recrawled owner-research page plus an external GSC recrawl request will move the licensing page from `Crawled - not indexed` to `Submitted and indexed`.
- primary event: GSC coverage state flips to indexed AND `last_crawled` advances past 2026-02-01.
- guardrail event: no sibling owner page regresses out of the index; owner CTA routing unchanged.
- entry criteria: page is `index, follow`, in sitemap, self-canonical, content-complete (all true).
- readback window: 2026-07-24 onward (first inspection ≥ 7 days after the GSC recrawl request), then the standard 7 complete days once indexed.
- decision rule: if still `Crawled - not indexed` after a confirmed post-request recrawl, escalate to a content-differentiation pass (then unblocked); if indexed but zero owner impressions, treat as an owner-cluster demand problem per the Owner Outbound Escalation, not a page fix.

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | florida vacation rental license / DBPR vacation rental license requirements |
| Searcher intent | Owner-management: an owner/operator determining license obligations, cost, and county compliance risk before or during renting |
| Current Seascape URL | https://seascape-vacations.com/property-management/vacation-rental-licensing-florida/ |
| SERP observed date | 2026-07-16 |
| SERP stale after | 2026-07-23 |
| Current proof | 2026-07-15 GSC URL Inspection audit (seascape-analytics/tmp/gsc-audit-claude-2026-07-15.json): coverage `Crawled - currently not indexed`, `INDEXING_STATE_UNSPECIFIED`, google_canonical null, `last_crawled 2026-02-01`. No final GA4/booking impact yet (page not indexed). |
| Top visible competitors | myfloridalicense.com (DBPR official), experiencegulfcoast.com, luxehausstays.com, avantio.com |
| Competitor angle | Statewide license-type explainers (single/group/collective), fee breakdowns ($50 + $10 + $90/$170), step-by-step DBPR application; official portal holds the authority slot |
| Visual/format gap | Competitors lean on license-type comparison tables, fee tables, and numbered application steps; Seascape's page already carries FAQPage/Service/State schema and comparable depth, so no missing format — match, do not copy |
| Seascape gap | Not a content-depth gap. The page already answers the query with a local county-risk + owner-net angle competitors underweight. The real gap is indexation: Google has not recrawled since 2026-02-01 |
| Search fit | Rescue the existing owner money page (do not build a new one): it feeds owner-management intent into the `/property-management/` inquiry funnel; qualifies for rescue via links + owner value under next-batch.md line 129 |
| Local/GBP proof | N/A for this route — the query is statewide statutory/licensing informational intent, not a map-pack or GBP-category local query; the page's Seascape-specific angle is county operating experience, not a GBP listing |
| AEO/readback note | Page already has FAQPage + Question/Answer schema aimed at AI-answer extraction; AEO is not the blocker — indexation is. Recheck answer extractability after the page is indexed |
| Recommendation | Add one contextual inbound internal link from the indexed research benchmark; request GSC recrawl (external); hold any owner-page content rewrite until the post-recrawl read |
| Attack status | completed |
| Query variants inspected | "florida vacation rental license requirements DBPR"; "vacation rental license florida how to get owner" |
| SERP source | Live web search, observed 2026-07-16 |
| Competitor URLs inspected | https://www.experiencegulfcoast.com/blog/florida-dbpr-vacation-rental-license-explained ; https://www.luxehausstays.com/insights/florida-dbpr-vacation-rental-license/ ; https://www.avantio.com/blog/florida-vacation-rental-laws/ ; https://www2.myfloridalicense.com/hotels-restaurants/licensing/vrtsp-guide/ |
| Content gap and Seascape answer | No net-new content gap: Seascape already covers DBPR license types, county risk, and owner-net impact with statute references and schema. The competitor set is generic statewide explainers; Seascape's local county-risk framing is the differentiator and is already present |
| Design/format strategy | Keep existing FAQ/Service/State schema and tables; no new layout. Match competitor comparison-table clarity already met; do not import competitor structure |
| Seascape proof available | Existing DBPR/statute citations and Seascape county operating experience on-page; no new proof claim added this batch |
| Tools/plugins used | seascape-analytics GSC URL Inspection audit (read-only), live web search SERP read, repo source/link/schema inspection, `npm run build` / `lint:content` / `verify:links` |
| Decision and reason | Ship the internal-link nudge and request recrawl; hold content rewrite. The page is content-complete, so the only gate-allowed on-repo lever is internal-link strengthening; the dominant lever (recrawl) is external. A rewrite now is premature per the next-batch gate and would be theater against an already-optimized page |

A blocked or below-threshold proof lane does not complete this receipt. The proof
lane is genuinely waiting on a Google recrawl; the attack lane is completed and
its bounded action (internal link + recrawl request) is recorded above.

## Cluster In Scope

- canonical winner URL(s): `/property-management/vacation-rental-licensing-florida/`
- feeder pages: `/research/owner-fee-revenue-leak-benchmark-2026/` (new inbound link this batch), `/property-management/` hub, `/guides/florida-gulf-coast-vacation-rental-market-report-2026/`
- aliases or retired URLs: none
- money destination: `/property-management/` owner management inquiry
- active lane: owner acquisition

## Source And Proof Constraints

- property truth needed: none changed — no property facts touched
- owner proof asset needed: none new; existing statute/DBPR citations stand
- claims that are off-limits: fabricated fees, revenue lift, homes-served, or management-performance numbers
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: county-level compliance risk and owner-net impact, already present on the page

## Page Builder Tasks

- source files likely to change: `src/research/owner-fee-revenue-leak-benchmark-2026.njk` (add one contextual inbound link to the licensing page in the existing owner-net-risk paragraph). The owner page source in `src/_data/seoPages.json` is intentionally NOT changed.
- redirect or schema work: none — canonical, sitemap, and schema are already correct
- internal-link or CTA work: one descriptive-anchor inbound link from the indexed research benchmark
- money CTA and downstream tracking event to verify: existing `/property-management/` CTA and owner inquiry routing unchanged; no tracking change

## Voice Editor Checklist

- tone risks: the added clause must read like the existing plain benchmark voice, not SEO filler
- generic or mechanical patterns to kill: no "unlock", "nestled", "boasts", or listy keyword stuffing
- proof or specificity checks: the added clause makes no new metric claim; it names licensing/county compliance as an owner-net factor, which is domain-true
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured

## Release Gate Checklist

- routes to smoke test: `/research/owner-fee-revenue-leak-benchmark-2026/` (link renders), `/property-management/vacation-rental-licensing-florida/` (target 200)
- commands to run: `npm run lint:content`, `npm run build`, `npm run verify:links`, `npm run verify:release`
- regression risks to watch: none to owner-page copy (untouched); watch that the new link passes internal-link validation (it does)

## Done When

- the inbound link is live in production AND a GSC recrawl request has been submitted for the licensing URL; then the readback contract above governs the indexation outcome.

## Post-Reread Outcome

- reread window used: **void and reset** — the original ≥ 2026-07-24 window never opened because the inbound link was not continuously live (see regression below).
- **Regression (2026-07-22 audit):** the rescue inbound link shipped in PR #449 (a34f4ac6, 2026-07-16) was deleted ~28 hours later by PR #454 "Fix owner benchmark integrity gaps" (7e19f6a7, 2026-07-18), which rewrote the benchmark page and removed the `Where the pressure shows up` section that hosted the link. #454 passed a full green gate (build, lint:content, verify:release, test:visual, autoreview) because no enforcement pinned this specific rescue link. Confirmed live: research page lost the link in production; licensing target still 200.
- crawl freshness result: pending recrawl — the experiment was never validly live long enough to read.
- actual impressions, CTR, position, and downstream event counts: pending — page not yet indexed; prior window invalidated.
- decision taken: re-land the link against current main on a new anchor paragraph (the original host section no longer exists) and add a regression guard in `scripts/enforcement/indexation-link-graph.test.js` so a future page rewrite cannot silently drop it. Reset the readback contract.
- next branch slug or explicit wait state: `fix/relink-licensing-index-rescue` re-lands the link + guard; then re-submit the GSC recrawl request and hold the owner-page content rewrite for the post-recrawl read (new window ≥ 7 days after the relink deploys and recrawl is requested).

## Not In Scope

- rewriting the licensing owner page content before the post-recrawl read
- creating a new licensing/compliance page
- broad site-wide SEO audit or new guide volume
- copied competitor structure without Seascape-specific proof or local judgment
