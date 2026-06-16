# Brief: Guide → Owner Referral (Bradenton vs Sarasota)

## Content Gate Inputs

- persona: A Gulf Coast second-home or rental owner who lands on the Bradenton vs Sarasota vacation guide while researching the area, and who quietly also wonders what their own rental nets.
- primary keyword: Bradenton vs Sarasota
- secondary keywords: Bradenton or Sarasota, vacation rental owner fees Gulf Coast, what vacation rentals keep after fees
- audience pattern: high-traffic guest comparison guide carrying a small share of home-owning readers with no current owner path off the page
- proof source: src/_data/ownerProofAssets.json (gulf-coast-owner-benchmark-2026) — Approved Quantified Proof only (13.4% observed Airbnb host fee, 2.9% direct payment cost, 5-home Gulf Coast scope)
- required internal links: /research/owner-fee-revenue-leak-benchmark-2026/, /property-management/
- CTA target: /research/owner-fee-revenue-leak-benchmark-2026/ (owner fee benchmark → revenue review intake)
- anti-claims: no fee/revenue numbers beyond the approved benchmark asset; no guarantee a specific home will keep more; no blurring of guest direct-booking savings with owner economics; no invented amenities or portfolio scale

## Why This Batch

- what changed in the data: `guide_winners` is the only surface with real traction (per `docs/plans/2026-06-13-demand-os-handoff.md`), yet it carries zero owner CTA; owner impressions fell 413 → 42 and the on-page loop cannot move owner acquisition by waiting.
- why this cluster wins now: Card 1 of the frozen Demand OS — the one founder-proof, impression-independent path to a first owner lead is a quiet owner-economics referral on the top guide winner.
- what should explicitly wait: outbound sending, hold-escalation analytics (Card 2), and the outbound home (Card 3) stay out of this PR.

## Experiment And Readback Contract

- hypothesis: a quiet owner aside on the Bradenton vs Sarasota winner routes a small but real number of home-owning readers to the owner fee benchmark without disturbing guest conversion.
- primary event: guide_owner_referral_click (navigation event)
- guardrail event: guide_book_direct_click / email_capture_submit (guest conversion must not drop); owner_primary_cta_click stays the only owner-cluster signal, and only at the benchmark form
- entry criteria: module live on /guides/bradenton-vs-sarasota/ with the locked taxonomy and a passing content gate
- readback window: standard owner-funnel read once crawled
- decision rule: keep if it produces benchmark referrals with no guest-conversion regression; revise copy or placement if guest events fall or referral clicks stay at zero

## Search Operator Read

- source reads used: `docs/plans/2026-06-13-demand-os-handoff.md` §4 (Card 1) and §9; `src/_data/ownerProofAssets.json`; existing benchmark page `src/research/owner-fee-revenue-leak-benchmark-2026.njk`
- URLs inspected: /guides/bradenton-vs-sarasota/, /research/owner-fee-revenue-leak-benchmark-2026/, /property-management/
- main evidence: the guide is a named top winner with no owner path; the benchmark page already holds the approved owner economics and the revenue-review intake
- competitor pages inspected for demand patterns, not copied topics: none new — this reuses an existing on-site asset rather than building page volume
- question-tool language worth preserving in customer wording: owners think in "what do I actually keep," not fee jargon
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: guide_winners traffic is real and growing; owner cluster is structurally deadlocked, so an on-traffic referral is the only non-waiting move

## Cluster In Scope

- canonical winner URL(s): /guides/bradenton-vs-sarasota/
- feeder pages: none new
- aliases or retired URLs: none
- money destination: /research/owner-fee-revenue-leak-benchmark-2026/ then the revenue-review intake
- active lane: owner acquisition (referral from a guest comparison guide)

## Source And Proof Constraints

- property truth needed: none changed
- owner proof asset needed: gulf-coast-owner-benchmark-2026 (13.4% / 2.9% / 5-home scope)
- claims that are off-limits: any owner number not in the approved asset; any promise of a specific payout outcome
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: a real five-home Gulf Coast operating benchmark, not a generic fee survey

## Page Builder Tasks

- source files likely to change: src/guides/bradenton-vs-sarasota.html only
- redirect or schema work: none
- internal-link or CTA work: add a quiet owner aside linking to the benchmark and the management hub
- money CTA and downstream tracking event to verify: guide_owner_referral_click fires on the benchmark link as a navigation event; it must not register as the owner_money cluster or as a guide_winners conversion (it becomes an owner event only at the benchmark form)

## Voice Editor Checklist

- tone risks: sounding like an owner sales pitch inside a guest guide; keep it quiet and secondary
- generic or mechanical patterns to kill: banned owner jargon (channel mix, leak, fee stack, OTA drag, routed through), AI throat-clearing, instruction-template phrasing
- proof or specificity checks: only the approved 13.4% / 2.9% / five-home figures; source note below the hook
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured: lead with "what your rental keeps," not methodology language

## Release Gate Checklist

- routes to smoke test: /guides/bradenton-vs-sarasota/ (smoke body assertions unchanged — no Hostaway/relative-image markers added)
- commands to run: npm run lint:content && npm run build && npm test && npm run verify:release; npm run test:visual with a fresh desktop+mobile baseline committed in this PR
- regression risks to watch: visual baseline shift on the guide route (expected — show the rendered diff before committing); guest conversion events; no owner event landing in owner_money or guide_winners

## Done When

- the quiet owner module is live on /guides/bradenton-vs-sarasota/ with the locked guide_owner_referral_click taxonomy, the content gate and full test suite pass, and a fresh desktop+mobile visual baseline is committed in the same PR.

## Post-Reread Outcome

- reread window used: pending first crawl after merge
- crawl freshness result: pending
- actual impressions, CTR, position, and downstream event counts: pending
- decision taken: pending
- next branch slug or explicit wait state: Card 2 (owner-outbound-escalation) after Card 1 merges

## Not In Scope

- the work this batch should not expand into: outbound sending, analytics hold-escalation, new owner pages, or any page-volume growth
- blog-post sprawl from competitor pages or question tools: none
- copied competitor structure without Seascape-specific proof or local judgment: none
