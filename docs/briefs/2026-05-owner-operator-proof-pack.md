# Brief: Owner Operator Proof Pack

Date: 2026-05-16

## Why This Batch

- `docs/status/current-state.md` says Phase 2 owner proof pages are live and indexed, but owner CTR is still weaker than rankings suggest.
- The benchmark now does the diagnostic job well: it proves that fee percentage alone is the wrong comparison.
- The next trust gap is not more fee-stack education. The next trust gap is operator confidence: can Seascape actually run the home better?
- This batch should create one proof asset that moves the owner from problem awareness to execution trust.
- What should wait:
  - more fee-stack explainers
  - more scenario math
  - testimonial-wall copy with no source discipline
  - owner-cluster expansion based on speculative keyword volume

## Search Operator Read

- Source reads used:
  - `docs/status/current-state.md`
  - `.agents/product-marketing-context.md`
  - `docs/briefs/2026-05-owner-fee-revenue-leak-benchmark.md`
  - live `https://seascape-vacations.com/research/owner-fee-revenue-leak-benchmark-2026/`
  - live `https://seascape-vacations.com/property-management/`
- Main evidence:
  - owner acquisition remains the business bottleneck
  - owner proof pages are already live
  - the new benchmark establishes problem proof, but not enough execution proof
  - current owner messaging already claims local follow-through, revenue visibility, review protection, and clearer owner communication
- Competitor pages inspected for demand patterns, not copied topics:
  - none required for this batch
  - this is a proof-density and conversion-trust asset, not a competitor-led topic expansion batch
- Question-tool language worth preserving in customer wording:
  - none
  - this page should sound like a sharp operator showing receipts, not an SEO prompt list
- GSC/GA4 evidence supporting the batch:
  - use the current-state read until the weekly operator report supplies fresher thresholds
  - current truth is enough to justify one trust-layer proof asset, not a new owner page family

## Cluster In Scope

- Canonical winner URL:
  - `/research/how-seascape-protects-owner-net-2026/`
- Feeder pages:
  - `/research/owner-fee-revenue-leak-benchmark-2026/`
  - `/property-management/`
  - `/property-management/maximize-vacation-rental-income-florida/`
  - `/property-management/vacation-rental-management-fees-florida/`
- Aliases or retired URLs:
  - none unless a later reread proves a better canonical
- Money destination:
  - `/property-management/#owner-cta`
- Active lane:
  - owner acquisition

## Source And Proof Constraints

- Owner proof asset needed:
  - approved redacted operator-performance evidence, not just benchmark facts
- Acceptable proof types:
  - a redacted owner-statement before/after or annotated statement excerpt
  - a real direct-mix improvement example
  - a premium-week pricing protection example
  - a maintenance or review-risk recovery example
  - a redacted owner-update or teardown-output sample that shows unusually clear communication
- Evidence gate:
  - do not build the public page until at least 3 proof modules have human-approved, source-backed material
  - if the evidence is not approved, hold the batch instead of backfilling with generic testimonials
- Claims that are off-limits:
  - “we always outperform”
  - portfolio-wide guarantees from one home
  - anonymous vanity praise with no operating context
  - market-wide authority from a narrow Seascape sample
  - review-count, Superhost, or Premier Host claims unless freshly verified in approved source
  - “full service,” “passive income,” or “sit back while we handle everything” fluff
- Seascape-specific proof this page must add beyond the benchmark:
  - what Seascape actually changed or protected
  - what the owner could see more clearly because of Seascape
  - what risks were reduced in practice, not just discussed in theory

## Page Builder Tasks

- Source files likely to change:
  - `src/research/how-seascape-protects-owner-net-2026.njk`
  - `src/_data/ownerProofAssets.json` or a new owner-operator proof data file if the structure needs to stay separate
  - `src/research/owner-fee-revenue-leak-benchmark-2026.njk`
  - `src/property-management/index.njk`
  - `docs/portfolio/owner-acquisition.md` if the route becomes a durable feeder in the cluster map
- Redirect or schema work:
  - no redirect expected at v1
  - default schema target: `Article` + `BreadcrumbList`
  - add `FAQPage` only if the questions are materially useful and source-backed
- Internal-link or CTA work:
  - benchmark page should link into the operator proof asset as the next trust step
  - owner hub should introduce it as “how Seascape actually protects owner net,” not as another benchmark
  - fees and income pages may feed it where the reader needs solution proof, not more category education
- Money CTA and downstream tracking event to verify:
  - primary CTA stays `Request Your Revenue Teardown`
  - preserve `owner_primary_cta_click`
  - preserve `source_page_slug` and placement attribution so this asset can be measured separately

## Voice Editor Checklist

- Tone risks:
  - sounding defensive
  - sounding like Seascape is only good at critique
  - sounding like a small company apologizing for not being large
- Generic or mechanical patterns to kill:
  - “we pride ourselves”
  - “full-service management”
  - “maximize returns” without showing how
  - generic testimonial-card layouts with no operating specifics
- Proof or specificity checks:
  - every proof module should answer: what changed, why it mattered, and what boundary still exists
  - if a result is narrow, say so plainly
  - if a proof is redacted, explain what is hidden and why
- Customer wording kept where it sounds natural:
  - owner net
  - channel mix
  - what actually reaches my owner statement
  - proven leak, likely leak, unknown

## Release Gate Checklist

- Routes to smoke test:
  - `/research/how-seascape-protects-owner-net-2026/`
  - `/research/owner-fee-revenue-leak-benchmark-2026/`
  - `/property-management/`
- Commands to run:
  - `npm run build`
  - `npm run verify:links`
  - `npm run verify:jsonld`
  - `node --test scripts/enforcement/owner-acquisition.test.js`
- Regression risks to watch:
  - proof drift into unsourced testimonial language
  - CTA duplication or weak attribution
  - benchmark and operator-proof pages saying the same thing in different words
  - owner proof claims outrunning approved evidence
  - the page turning into another fee explainer instead of execution proof

## Done When

- one live proof asset exists at the chosen route
- it contains at least 3 approved operator-performance proof modules
- it clearly separates:
  - what Seascape observed
  - what Seascape changed or protected
  - what remains unknown or non-generalizable
- the benchmark page and owner hub both feed it intentionally
- the page drives the same teardown CTA without inventing a new conversion path
- rendered desktop and mobile review both show premium, evidence-first design rather than generic testimonial filler

## Post-Reread Outcome

- Reread window used:
  - wait for the next owner-acquisition operator read
- Crawl freshness result:
  - fill after publish
- Actual impressions, CTR, position, and downstream event counts:
  - fill after publish
- Decision taken:
  - hold, rewrite, expand, or kill
- Next branch slug or explicit wait state:
  - default next branch: `codex/owner-operator-proof-pack`

## Not In Scope

- building a case-study library
- publishing raw owner statements without redaction and approval
- adding more benchmark math
- calculator work
- fake authority polish like giant-stat walls with weak operational meaning
- copied competitor structure without Seascape-specific proof
