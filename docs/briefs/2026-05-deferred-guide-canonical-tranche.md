# Brief: Deferred Guide And Canonical Tranche

## Content Gate Inputs

- persona: Florida Gulf Coast trip planners comparing beach markets and booking windows before they click into a stay page.
- primary keyword: bradenton vs sarasota
- secondary keywords: anna maria island vs siesta key, best time to visit anna maria island, florida gulf coast vacation rental market report
- audience pattern: searchers who already have intent and need a clear winner path plus clean canonical routing they can trust.
- proof source: `docs/status/next-batch.md`, `docs/portfolio/winner-guides.md`, current guide source files, and existing canonical/redirect enforcement tests.
- required internal links: /guides/, /stays/bradenton-vacation-rentals-near-beaches/, /stays/siesta-key-area-vacation-rentals/, /stays/anna-maria-island-vacation-rentals/, /stays/anna-maria-island-beachfront-rentals/
- CTA target: keep existing guide winner CTA handoffs (`guide_book_direct_click`) tied to the mapped stay pages.
- anti-claims: no invented ranking wins, no fake seasonal certainty, no broad market authority claims, and no canonical-success claims without enforcement and live redirect proof.

## Why This Batch

- the winning guide family still carries meaningful nonbrand demand and is the right place to tighten canonical consistency once freshness allows a measured pass.
- this tranche should be a bounded routing and snippet-quality pass, not a broad guide rewrite or net-new content lane.
- `docs/status/next-batch.md` currently says `blocked by freshness`, so this brief is queued and execution-ready but not authorized for live copy or metadata edits yet.

## Constrained Execution Snapshot (2026-05-25)

- this is a deferred tranche packet only; no source edits are authorized while reread status is `blocked by freshness`.
- keep scope to the three winner guides plus their known aliases and discoverability surfaces.
- no owner-page rewrites, no stay-page CRO expansion, no phase-4 growth work.

## GSC Hygiene Execution Snapshot (2026-06-01)

- this branch is limited to crawl, canonical, and schema hygiene found during GSC issue triage; it does not ship CTR title/meta/snippet edits while reread status remains `blocked by freshness`.
- source-link edits are mechanical URL-shape normalization only: guide links should point at slash-canonical routes, not `.html` or slashless legacy forms.
- stay-page work is schema repair for `/stays/bradenton-vacation-rentals-near-beaches/` and related collection schema output, not stay-page CRO copy expansion.
- fresh CTR triage for the five guide pages remains deferred until the weekly joined read includes 2026-05-31 in BigQuery GSC.

## Search Operator Read

- source reads used: `docs/status/next-batch.md`, `docs/portfolio/winner-guides.md`, `docs/briefs/2026-04-winner-guide-consolidation-round-2.md`, and current guide/canonical enforcement files.
- URLs inspected: /guides/bradenton-vs-sarasota/, /guides/anna-maria-island-vs-siesta-key/, /guides/best-time-visit-anna-maria-island/
- main evidence: this family remains a strong organic lane and still depends on strict canonical alignment and clean guide-to-stay routing.
- competitor pages inspected for demand patterns, not copied topics: not required for this prep-only pass.
- question-tool language worth preserving in customer wording: keep direct comparison language and timing questions that map to real stay decisions.
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: hold execution until `docs/status/next-batch.md` moves off `blocked by freshness`.

## Cluster In Scope

- canonical winner URL(s):
  - /guides/bradenton-vs-sarasota/
  - /guides/anna-maria-island-vs-siesta-key/
  - /guides/best-time-visit-anna-maria-island/
- feeder pages:
  - /guides/bradenton-vs-sarasota-beaches/
  - /guides/bradenton-vs-sarasota-cost-of-living/
  - /guides/bradenton-vs-sarasota-for-families/
  - /guides/bradenton-vs-sarasota-restaurants/
  - /guides/bradenton-vs-sarasota-retirement/
- aliases or retired URLs: use the alias sets recorded in `docs/portfolio/winner-guides.md` only; do not invent new variants.
- money destination:
  - /stays/bradenton-vacation-rentals-near-beaches/
  - /stays/siesta-key-area-vacation-rentals/
  - /stays/anna-maria-island-vacation-rentals/
  - /stays/anna-maria-island-beachfront-rentals/
- active lane: comparison-guide winner routing and canonical convergence.

## Source And Proof Constraints

- property truth needed: none beyond existing stay destination mapping and live guide routing surfaces.
- owner proof asset needed: none in this tranche; do not import owner-proof claims into guide copy.
- claims that are off-limits: market-wide authority claims, guaranteed booking outcomes, and any claim that canonical cleanup is complete before verification passes.
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: local tradeoff framing, clear beach-base decision logic, and direct booking handoff clarity to mapped stays.

## Page Builder Tasks

- source files likely to change:
  - `src/guides/bradenton-vs-sarasota.html`
  - `src/guides/anna-maria-island-vs-siesta-key.html`
  - `src/guides/best-time-visit-anna-maria-island.html`
  - live guide source files with legacy `/guides/*.html` or slashless `/guides/*` links
  - `src/stays/stays.njk`
  - `src/_data/properties.js`
  - `src/_redirects`
  - `src/llms.txt`
  - `src/ai-discovery.json.njk`
- redirect or schema work: keep alias-to-canonical one-hop redirects, add guide placeholder redirects for `.html` and slashless variants, and keep stay collection schema aligned to canonical property URLs.
- internal-link or CTA work: preserve winner-guide CTA routing to mapped stay destinations; remove internal links that reinforce retired alias routes.
- money CTA and downstream tracking event to verify: `guide_book_direct_click` must remain intact and mapped to the intended stay pages.

## Voice Editor Checklist

- tone risks: generic listicle voice, fake certainty about seasonal outcomes, and copy that sounds detached from a real booking decision.
- generic or mechanical patterns to kill: vague "best area" filler and ranking theater unsupported by source truth.
- proof or specificity checks: keep tradeoff language concrete and route every recommendation to a mapped stay destination.
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured: preserve direct comparison phrasing; avoid mechanical keyword stuffing.

## Release Gate Checklist

- routes to smoke test:
  - /guides/bradenton-vs-sarasota/
  - /guides/anna-maria-island-vs-siesta-key/
  - /guides/best-time-visit-anna-maria-island/
- commands to run:
  - `npm run lint:content`
  - `node --test scripts/enforcement/winner-guide-consolidation.test.js`
  - `node --test scripts/enforcement/guide-conversion.test.js`
  - `npm run verify:redirects`
  - `npm run verify:links`
  - `npm run verify:jsonld`
  - `npm run verify:release`
- regression risks to watch: alias drift, canonical mismatch across schema/meta/links, and guide CTA routing regressions.

## Done When

- all in-scope guide aliases resolve in one hop to the intended canonical slash routes.
- canonical URL truth is aligned across visible links, head tags, schema, `llms.txt`, and `ai-discovery` for this tranche.
- guide winner CTA handoffs still fire `guide_book_direct_click` and route to intended stay pages.
- this tranche remains bounded and does not reopen owner/stay expansion lanes.

## Post-Reread Outcome

- reread window used: fill after analytics refresh.
- crawl freshness result: fill after analytics refresh.
- actual impressions, CTR, position, and downstream event counts: fill after analytics refresh.
- decision taken: hold, execute tranche, or defer again.
- next branch slug or explicit wait state: fill after analytics refresh.

## Not In Scope

- owner money-page rewrites or owner CTA strategy changes.
- stay money-page CRO experimentation.
- net-new guide creation.
- broad template redesign or design-system changes.
