# Brief: Owner CTR Rewrite Round 2

## Content Gate Inputs

- persona: Florida Gulf Coast vacation-rental owner comparing managers and trying to decide whether weak reporting, booking costs, licensing friction, or platform handling is the real problem.
- primary keyword: vacation rental management fees Florida
- secondary keywords: Florida vacation rental licensing, VRBO management services Florida, owner revenue review, current manager comparison
- audience pattern: skeptical owner already comparing managers and wanting a sharper reason to click before trusting a sales conversation.
- proof source: `gulf-coast-owner-benchmark-2026` and the published owner fee benchmark.
- workflow gate: `docs/status/next-batch.md` still controls whether metadata work is allowed.
- required internal links: /research/owner-fee-revenue-leak-benchmark-2026/, /property-management/vacation-rental-management-fees-florida/, /property-management/vacation-rental-licensing-florida/, /property-management/vrbo-management-services-florida/, /property-management/#owner-cta
- CTA target: `#owner-cta` on each owner money page with `Request Your Revenue Review`
- anti-claims: no portfolio-wide guarantee, no market-wide authority claim from five homes, no flat-fee promise, no generic full-service language, no metadata rewrite while `docs/status/next-batch.md` is still blocked.

## Why This Batch

- The fees and licensing pages need to feel more like product pages for a skeptical owner making an active manager decision, not thin comparison explainers.
- The batch should show the exact 48-hour review deliverable plus the owner-visibility layer: reporting, maintenance follow-through, guest screening, and local response.
- `docs/status/next-batch.md` currently says `blocked by freshness`, so title, description, and snippet-focused rewrites stay gated until the reread opens.
- VRBO remains support content in this batch. It should reinforce the money lane, not mirror the sales posture of the two primary owner-money pages.

## Marketing Psychology Notes

- trigger order for this batch:
  - fees page: `anchoring` plus `loss aversion`
  - licensing page: `regret aversion` plus `uncertainty reduction`
  - VRBO page: `diagnostic clarity`, not equal emotional weight with the two primary money pages
  - CTA: `micro-commitment`, low-pressure diagnostic, not a disguised sales call
- strongest emotional lever: help the owner feel the cost of waiting one more renewal cycle with the current manager through missed payout, reporting blind spots, and launch risk, not hype.
- sequencing rule: the benchmark remains the public front door, the review remains the only conversion ask, and the three money pages should intensify the diagnosis rather than introduce a second offer.

## Constrained Execution Snapshot (2026-05-25)

- this pass is owner-only and limited to body copy, proof framing, CTA framing, and owner-hub route prominence
- metadata is frozen while `docs/status/next-batch.md` stays `blocked by freshness`
- no guide-page rewrites, canonical cleanup, redirect churn, or discoverability-surface expansion in this pass

## Implementation Receipt (2026-05-26)

- executed in `codex/owner-ctr-constrained-slice`
- `/property-management/` now promotes a dedicated `Current-Manager Decision Pages` block ahead of the broader owner library
- `/property-management/vacation-rental-management-fees-florida/`, `/property-management/vacation-rental-licensing-florida/`, and `/property-management/vrbo-management-services-florida/` now use decision-first section framing plus explicit cross-links inside the owner-money cluster
- metadata, titles, descriptions, guide refreshes, `llms.txt`, `ai-discovery.json.njk`, redirects, and canonical work stayed out of scope for this batch

## Search Operator Read

- source reads used: `docs/status/next-batch.md`, the content-brief template, the owner fee benchmark brief, and the existing owner-field-report brief.
- URLs inspected: /property-management/vacation-rental-management-fees-florida/, /property-management/vacation-rental-licensing-florida/, /property-management/vrbo-management-services-florida/, /research/owner-fee-revenue-leak-benchmark-2026/, /property-management/#owner-cta
- main evidence: the owner-money cluster is the active owner rewrite lane, but the reread gate is still freshness-blocked, so today's work is body-copy and product-surface positioning only.
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: `docs/status/next-batch.md` still says `blocked by freshness`; do not treat this batch as snippet or metadata authorization yet.

## Cluster In Scope

- canonical winner URL(s):
  - /property-management/vacation-rental-management-fees-florida/
  - /property-management/vacation-rental-licensing-florida/
  - /property-management/vrbo-management-services-florida/
- feeder pages: /research/owner-fee-revenue-leak-benchmark-2026/
- aliases or retired URLs: none named in this batch.
- money destination: /property-management/#owner-cta
- active lane: owner acquisition, specifically two primary owner-money pages plus one supporting VRBO page.

## Source And Proof Constraints

- property truth needed: use only the published owner fee benchmark and the named 48-hour review deliverable; do not invent broader portfolio proof.
- workflow constraint: `docs/status/next-batch.md` is an execution gate for metadata timing, not a source for on-page claims.
- owner proof asset needed: benchmark-backed owner-fee and revenue-leak framing that can support all three pages without turning them into duplicate research pages.
- claims that are off-limits: portfolio-wide guarantees, market-wide authority from five homes, flat-fee promises, generic full-service language, and any implied metadata win while freshness is blocked.
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: the exact revenue-review deliverable, owner visibility into reporting and maintenance follow-through, guest screening, local response, and where licensing or platform handling usually shows up in owner net.

## Page Builder Tasks

- source files likely to change:
  - `src/property-management/property-management.njk`
  - `src/_data/seoPages.json`
  - `scripts/enforcement/owner-acquisition.test.js`
- redirect or schema work: none in this batch.
- internal-link or CTA work: each page should carry the required benchmark link and drive to `/property-management/#owner-cta`. The fees and licensing pages should each link to the other primary money page. The VRBO page should link to both primary money pages as support routing.
- money CTA and downstream tracking event to verify: `#owner-cta` with visible CTA copy `Request Your Revenue Review`; keep the current owner CTA tracking contract intact.
- page-level rewrite intent:
  - fees page: make the click worth it by showing that the real comparison is owner net, reporting clarity, booking-cost drag, and the 48-hour review output.
  - licensing page: frame licensing friction as an owner-visibility and local-execution problem, not just a compliance checklist.
  - VRBO page: keep it as support content that explains platform handling, ranking, screening, and guest-response execution without pretending it is the primary money lane.

## Voice Editor Checklist

- tone risks: sounding like a generic manager brochure, overclaiming from a small benchmark sample, or drifting into detached `the owner` phrasing instead of speaking to `you`.
- generic or mechanical patterns to kill: `full-service`, vague hospitality adjectives, flat-fee shortcut copy, and generic manager-comparison filler that does not sharpen the actual decision.
- proof or specificity checks: keep the 48-hour review deliverable concrete, keep the owner visibility layer concrete, and separate benchmark proof from any page-specific promise.
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured: keep language around weak reporting, booking costs, licensing friction, platform handling, and current manager comparison.

## Release Gate Checklist

- routes to smoke test:
  - /property-management/vacation-rental-management-fees-florida/
  - /property-management/vacation-rental-licensing-florida/
  - /property-management/vrbo-management-services-florida/
- commands to run: `npm run lint:content`, targeted route smoke check, and relevant owner CTA verification before merge.
- regression risks to watch: missing required internal links, broken `#owner-cta` routing, owner-detached voice, generic claims, and accidental title/meta edits while the reread gate is still blocked.

## Done When

- all three owner money pages have body-copy rewrite guidance that makes them feel like product pages for skeptical owners already comparing managers.
- the brief clearly separates unblocked body work from blocked snippet/title/meta work.
- the required links, CTA target, proof sources, and anti-claims are explicit enough for page building and review.
- the batch remains limited to these three pages and does not reopen stay work or add new owner pages.

## Not In Scope

- new owner pages, new stay pages, or any Holmes Beach / stay-money expansion work.
- metadata, title, or description rewrites before `docs/status/next-batch.md` moves off `blocked by freshness`.
- treating VRBO as a primary expansion lane without later query evidence.
- new benchmark claims, portfolio guarantees, or broader owner-proof assets beyond the named sources.
