# Brief: Owner Revenue Review CTA Wording Refresh

## Content Gate Inputs

- persona: Florida Gulf Coast vacation-rental owner comparing managers and deciding whether to request a revenue review.
- primary keyword: vacation rental management fees Florida
- secondary keywords: owner revenue review, Florida vacation rental manager comparison, vacation rental management services
- audience pattern: skeptical switcher who needs clearer language before taking a first owner CTA step.
- proof source: `gulf-coast-owner-benchmark-2026` and `/research/owner-fee-revenue-leak-benchmark-2026/`.
- required internal links: /research/owner-fee-revenue-leak-benchmark-2026/, /property-management/vacation-rental-management-fees-florida/
- CTA target: `/property-management/#owner-cta` using `Request Your Revenue Review`.
- anti-claims: no guarantee language, no portfolio-wide performance promises, no invented benchmark scope, and no manager-switch outcome promises.

## Why This Batch

- This is a wording cleanup that standardizes owner CTA language to `review` across the active owner conversion surfaces.
- The goal is to remove mixed teardown/review phrasing and a small set of internal-sounding owner jargon from visible copy without changing routing, layout, tracking contracts, metadata, or schema strategy.
- Follow-up source artifact: `docs/status/owner-outbound.md` now gives the owner review packet a warmer second-look step around listing presentation, photo-readiness, owner-statement clarity, and renewal questions. The site-side handoff should surface only that expectation after a form submit.
- Broader owner-page rewrites stay out of scope.

## Search Operator Read

- source reads used: active owner pages and owner research routes in `src/` plus current owner CTA tests.
- URLs inspected: /property-management/, /research/owner-fee-revenue-leak-benchmark-2026/, /guides/florida-gulf-coast-vacation-rental-market-report-2026/
- main evidence: these pages still drive owner CTA clicks and needed consistent `review` wording.
- competitor pages inspected for demand patterns, not copied topics: not required for this wording-only pass.
- question-tool language worth preserving in customer wording: none.
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: this pass is a consistency and conversion-clarity edit, not a traffic-shape expansion.

## Cluster In Scope

- canonical winner URL(s): /property-management/
- feeder pages: /research/owner-fee-revenue-leak-benchmark-2026/, /guides/florida-gulf-coast-vacation-rental-market-report-2026/
- aliases or retired URLs: none.
- money destination: /property-management/#owner-cta
- active lane: owner acquisition.

## Source And Proof Constraints

- property truth needed: keep claims anchored to the published owner benchmark and current owner service pages.
- owner proof asset needed: owner fee + revenue leak benchmark.
- claims that are off-limits: guaranteed uplift claims, broad market authority claims, and universal owner-fit claims.
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: direct owner benchmark framing and local owner operations context already on-site.

## Page Builder Tasks

- source files likely to change:
  - `src/_data/seoPages.json`
  - `src/_includes/partials/owner-evaluation-form.njk`
  - `src/property-management/property-management.njk`
  - `src/property-management/revenue-review-requested.njk`
  - `src/research/owner-fee-revenue-leak-benchmark-2026.njk`
  - `src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html`
- redirect or schema work: none.
- internal-link or CTA work: keep owner links intact, standardize visible owner CTA wording to `Request Your Revenue Review`, and normalize visible helper copy to plain owner language.
- money CTA and downstream tracking event to verify: `owner_primary_cta_click` on `#owner-cta` surfaces.

## Voice Editor Checklist

- tone risks: sounding like hard-sell copy or implying guaranteed outcomes.
- generic or mechanical patterns to kill: mixed teardown/review labels and owner-facing jargon like `fee stack`, `OTA drag`, `leak`, or `likely leaking` in visible helper copy.
- proof or specificity checks: keep benchmark references factual and scoped.
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured: keep plain owner-facing language and avoid internal process wording.

## Release Gate Checklist

- routes to smoke test:
  - /property-management/
  - /research/owner-fee-revenue-leak-benchmark-2026/
  - /guides/florida-gulf-coast-vacation-rental-market-report-2026/
- commands to run: `npm run lint:content`, `npm test`, `npm run test:visual`.
- regression risks to watch: broken required links, accidental CTA event attr changes, and stale screenshot baseline drift.

## Done When

- all in-scope owner CTA surfaces use `Request Your Revenue Review` consistently.
- visible owner CTA/helper copy on the in-scope routes uses plain owner language instead of teardown/jargon residue.
- owner CTA tracking attributes stay unchanged.
- content gate and test suites pass on this branch.

## Post-Reread Outcome

- reread window used: not applicable for this wording-only pass.
- crawl freshness result: not applicable.
- actual impressions, CTR, position, and downstream event counts: to be evaluated post-merge in live follow-up.
- decision taken: hold scope to wording-only consistency refresh.
- next branch slug or explicit wait state: no follow-on branch required if post-merge live checks pass.

## Not In Scope

- broad owner page rewrites beyond CTA phrasing.
- metadata/description/title experiments.
- new owner pages, new stay pages, or redirect/canonical work.
