# Brief: Content Quality Rubric Route Pass

## Content Gate Inputs

- persona: Gulf Coast travelers and owners using Seascape research or guide pages to make a practical stay or management decision
- primary keyword: bradenton vs sarasota
- secondary keywords: vacation rental management fees Florida, owner fee benchmark, Gulf Coast vacation rental owner payout
- audience pattern: readers who need the answer fast, with the proof numbers framed clearly enough to cite without pulling in internal notes
- proof source: `src/_data/ownerProofAssets.json` (`gulf-coast-owner-benchmark-2026`), `docs/portfolio/winner-guides.md`, and the current source for `/guides/bradenton-vs-sarasota/` and `/research/owner-fee-revenue-leak-benchmark-2026/`
- required internal links: /research/owner-fee-revenue-leak-benchmark-2026/, /property-management/
- CTA target: `/research/owner-fee-revenue-leak-benchmark-2026/` for owner benchmark readers, then `/property-management/?owner_source=owner-fee-revenue-leak-benchmark-2026#owner-cta`
- anti-claims: no new owner revenue promise, no market-wide fee survey claim, no rank or AI-citation win claim, no proof number outside the approved owner benchmark asset

## Why This Batch

- what changed in the data: the new `content-quality-rubric` lane exists and Sawyer asked for its first pass on two already-active routes.
- why this cluster wins now: both routes reuse the same approved owner benchmark proof, so the smallest useful fix is making that proof easier to extract without changing the proof asset.
- what should explicitly wait: broader page rewrites, new research assets, AI-citation monitoring, and any deterministic rubric gate.

## Experiment And Readback Contract

- hypothesis: tightening the first-screen benchmark answer and the guide owner aside makes the approved proof easier to quote without adding new claims.
- primary event: advisory content-quality-rubric finding resolved in source; no analytics event changes.
- guardrail event: `npm run lint:content` stays green, owner proof remains tied to `gulf-coast-owner-benchmark-2026`, and `owner_primary_cta_click` / `guide_owner_referral_click` markup stays unchanged.
- entry criteria: the two target routes already exist and cite the owner benchmark.
- readback window: next content review or route QA pass; do not claim ranking or citation impact from this edit alone.
- decision rule: keep the copy if lint and owner-proof checks pass and the diff only clarifies approved proof.

## Cluster In Scope

- canonical winner URL(s): `/guides/bradenton-vs-sarasota/`, `/research/owner-fee-revenue-leak-benchmark-2026/`
- feeder pages: none changed
- aliases or retired URLs: none changed
- money destination: `/property-management/`
- active lane: advisory content-quality cleanup on existing guide and owner-research routes

## Source And Proof Constraints

- property truth needed: none
- owner proof asset needed: `gulf-coast-owner-benchmark-2026`
- claims that are off-limits: any owner number not in the approved asset; any promise that direct bookings or a lower fee will improve a specific property's payout
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: approved five-home Gulf Coast operating data, not a generic market-fee survey

## Page Builder Tasks

- source files likely to change: `src/guides/bradenton-vs-sarasota.html`, `src/research/owner-fee-revenue-leak-benchmark-2026.njk`, this brief
- redirect or schema work: only update `dateModified` if visible copy changes
- internal-link or CTA work: preserve existing benchmark and property-management links
- money CTA and downstream tracking event to verify: no tracking taxonomy change

## Voice Editor Checklist

- tone risks: turning the page into methodology copy or an owner sales pitch
- generic or mechanical patterns to kill: vague proof language, internal process wording, and unsupported "market-wide" framing
- proof or specificity checks: only `$1.4M`, `$119,923`, `13.4%`, `2.9%`, and five-home scope from the approved benchmark asset
- customer wording kept where it sounds natural: "what actually reaches your payout"

## Release Gate Checklist

- routes to smoke test: `/guides/bradenton-vs-sarasota/`, `/research/owner-fee-revenue-leak-benchmark-2026/`
- commands to run: `npm run lint:content`; run the owner proof check if the copy touches owner benchmark claims
- regression risks to watch: copy outrunning `src/_data/ownerProofAssets.json`, required internal-link failure, or changing tracking attributes

## Done When

- the two real rubric failures are fixed in source, the proof asset is unchanged, and `npm run lint:content` passes.

## Not In Scope

- public page redesign
- new proof numbers
- analytics or AI-citation monitoring
- a new CI gate for the advisory rubric
