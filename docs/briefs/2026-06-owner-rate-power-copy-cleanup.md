# Brief: Owner rate power copy cleanup

## Content Gate Inputs

- persona: Florida Gulf Coast vacation-rental owner comparing managers and trying to decide whether pricing, booking costs, or weak local execution is hurting what they keep.
- primary keyword: vacation rental management fees Florida
- secondary keywords: Sarasota vacation rental management, Bradenton vacation rental management, Anna Maria Island property management, owner revenue review
- audience pattern: skeptical switching owner who needs plain language about nightly rates, pricing discipline, and operating quality instead of internal owner-economics shorthand.
- proof source: `src/_data/seoPages.json`, `docs/style/banned-patterns.md`, the existing owner benchmark proof asset, and live competitor SERP reads from June 18, 2026.
- required internal links: /property-management/, /research/owner-fee-revenue-leak-benchmark-2026/, /property-management/vacation-rental-management-fees-florida/
- CTA target: preserve existing owner revenue-review CTAs and form paths.
- anti-claims: no new owner proof claims, no title or metadata rewrite, no new fee promise, no new owner pages, no claim that this wording change proves owner demand.

## Gate 0 Search Block

| Field | Value |
| --- | --- |
| Target query family | Florida vacation rental management fees and Sarasota/Bradenton owner management comparison queries. |
| Searcher intent | Owners are comparing management cost, local execution, and whether a manager can protect revenue after fees and operations. |
| Current Seascape URL | `/property-management/vacation-rental-management-fees-florida/`, `/property-management/maximize-vacation-rental-income-florida/`, `/property-management/vacation-rental-management-anna-maria-island/`, `/property-management/vacation-rental-management-bradenton/`, `/property-management/vacation-rental-management-sarasota/`. |
| Current proof | Existing owner pages already frame fee drag, direct-booking cost, and local execution; `rate power` is now banned in `docs/style/banned-patterns.md` and should be replaced with plain owner language. |
| Top visible competitors | FunStay Florida on Airbnb management fees, AirDNA on manager fee ranges, Lodgify on vacation rental management fees, TIDY Sarasota vacation property management, iTrip Sarasota-Bradenton, PMI Southwest Florida, Gulf Coast Property Management Sarasota/Bradenton. |
| Competitor angle | Competitors mostly lead with fee ranges, full-service management, local coverage, or low-fee positioning; several use broad "earn more" or service-list language rather than explaining the pricing power tradeoff in owner terms. |
| Seascape gap | The owner copy had a correct concept but used `rate power`, which reads like internal shorthand and is now a banned owner phrase. |
| Recommendation | Replace `rate power` with plain language about your nightly rates, what guests will pay, premium pricing, and pricing protection; do not change metadata, routes, schema, CTAs, or proof claims in this cleanup. |

## Why This Cleanup

- `rate power` is now a banned owner phrase, but the idea behind it is still useful: strong homes should defend better nightly rates when operations, pricing, and guest experience support it.
- The rewrite should keep the pricing-leverage meaning while speaking to owners in normal language.
- This is a copy-quality cleanup, not a new owner acquisition batch.

## Cluster In Scope

- canonical winner URLs:
  - /property-management/vacation-rental-management-anna-maria-island/
  - /property-management/vacation-rental-management-bradenton/
  - /property-management/maximize-vacation-rental-income-florida/
  - /property-management/vacation-rental-management-fees-florida/
  - /property-management/vacation-rental-management-sarasota/
- feeder pages: /property-management/ and /research/owner-fee-revenue-leak-benchmark-2026/
- aliases or retired URLs: none.
- money destination: existing owner revenue-review form path.
- active lane: owner acquisition copy hygiene on existing pages.

## Source And Proof Constraints

- property truth needed: none; this branch does not add property-specific amenity, capacity, or location claims.
- owner proof asset needed: no new proof asset; preserve existing benchmark-backed owner proof.
- claims that are off-limits: new revenue guarantees, new owner-demand proof, new fee structures, portfolio-wide claims, or new local-market authority claims.
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: existing direct-booking and owner benchmark proof only; no new proof is added in this pass.

## Page Builder Tasks

- source files likely to change:
  - `src/_data/seoPages.json`
  - `scripts/enforcement/owner-acquisition.test.js`
  - this brief
- redirect or schema work: none.
- internal-link or CTA work: none.
- money CTA and downstream tracking event to verify: existing owner revenue-review CTA paths remain unchanged.

## Voice Editor Checklist

- tone risks: replacing one jargon phrase with another abstract phrase, drifting into detached `the owner` language, or making the pages sound like generic full-service management copy.
- generic or mechanical patterns to kill: `rate power`, instruction-template phrasing, vague claims about full service, and unsupported pricing guarantees.
- proof or specificity checks: keep every replacement tied to nightly rates, what guests will pay, premium pricing, or price protection.
- customer wording kept where it sounds natural; owner shorthand removed where it sounds manufactured.

## Release Gate Checklist

- routes to smoke test: the five owner pages listed in scope.
- commands to run: `grep -c "rate power" src/_data/seoPages.json`, `npm run build`, `node --test scripts/enforcement/content-voice.test.js scripts/enforcement/recovery-smoke.test.js scripts/enforcement/owner-acquisition.test.js scripts/enforcement/owner-lead-receipts.test.js`, `npm run eval:owner` when `ANTHROPIC_API_KEY` is available, and `npm run verify:release`.
- regression risks to watch: stale exact-copy assertions, accidental metadata changes, changed CTAs, or any new owner proof claim.

## Done When

- `src/_data/seoPages.json` has zero `rate power` matches.
- the five owner pages keep the same conversion path and proof boundaries.
- deterministic local gates pass.
- Anthropic owner eval is either run with a key or explicitly marked blocked by missing local secret.
- release safety passes with this active brief.

## Not In Scope

- title, meta description, schema, sitemap, redirect, CTA, or form changes.
- new owner pages or new proof assets.
- broad owner-page rewrites beyond the exact phrase cleanup.
