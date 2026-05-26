# Brief: Owner Field Report Page

## Content Gate Inputs

- persona: Gulf Coast vacation rental owner comparing manager economics, booking sources, and operating proof before a switch conversation.
- primary keyword: vacation rental property management
- secondary keywords: Florida vacation rental management, owner revenue teardown, vacation rental management fees, Bradenton property management, Sarasota property management
- audience pattern: High-intent owner wants evidence, not a brochure; the page must help them see what they keep after fees, channels, and execution.
- proof source: Seascape owner fee and revenue leak benchmark, five-home Gulf Coast portfolio math, existing owner proof cluster pages, and Claude Design Field Report direction reviewed May 19, 2026.
- required internal links: /research/owner-fee-revenue-leak-benchmark-2026/, /property-management/maximize-vacation-rental-income-florida/, /property-management/switch-vacation-rental-management-company/
- CTA target: #owner-cta
- anti-claims: Do not promise passive income, flat universal fees, guaranteed revenue lift, or hands-off management without missing-information caveats.

## Why This Batch

- Claude Design produced a stronger owner-page direction than the current explainer hub.
- The page should become a premium proof-and-teardown front door for owner acquisition.
- The batch should not expand into new owner claims or rewrite the child owner pages.
- 2026-05-21 CRO follow-up: pressure-test the owner hub against skeptical STR owner/operator language from X-style discourse without turning the page into generic AI or property-management copy.

## Current CRO Test Focus

- Test 1: pre-renewal hero framing should beat a generic owner-brief intro by making the switch decision explicit earlier.
- Test 2: `48-hour revenue review` should outperform `revenue teardown` as the visible CTA language on the owner hub while preserving the same form and tracking path underneath.
- Test 3: real Sarasota owner leads should be asked for the same two first-pass inputs across the shared review surfaces: the listing or address, and what feels expensive or unclear.
- Test 4: the owner hub should say exactly what comes back in the 48-hour review before the reader reaches the form, so the CTA feels concrete instead of polite-but-vague.
- 2026-05-24 implementation note: the owner hub postcard should keep the approved Field Report layout, add visible proof-strip links back to the benchmark/proof pack, and let owners write one plain-English note on what feels off instead of forcing a canned property-management script.
- 2026-05-26 constrained execution note: keep this slice on `/property-management/` only. Allowed changes are body copy, proof framing, and owner CTA clarity on the hub. Do not widen into metadata, child owner pages, canonicals, redirects, or new proof claims.

## Search Operator Read

- source reads used: Existing owner fee benchmark page, owner hub tests, design system, and Claude Design export assets.
- URLs inspected: /property-management/, /research/owner-fee-revenue-leak-benchmark-2026/, /property-management/maximize-vacation-rental-income-florida/, /property-management/switch-vacation-rental-management-company/.
- main evidence: Existing owner tests require the $119,923 direct-channel proof, 13.4% to 2.9% commission comparison, and owner teardown CTA.
- competitor pages inspected for demand patterns, not copied topics: Not needed for this design implementation pass.
- question-tool language worth preserving in customer wording: What does the home actually keep; what feels expensive or unclear.
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: Not reread in this branch; this is a design-quality implementation against existing owner acquisition proof.

## Cluster In Scope

- canonical winner URL(s): /property-management/
- feeder pages: Owner guides linked from the redesigned hub.
- aliases or retired URLs: None.
- money destination: #owner-cta
- active lane: owner acquisition

## Source And Proof Constraints

- property truth needed: Use existing Seascape owner proof and do not invent portfolio claims.
- owner proof asset needed: Owner fee revenue leak benchmark and rendered owner hub proof.
- claims that are off-limits: Passive income, guaranteed lift, all-inclusive flat-fee positioning, or generic full-service claims.
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: Field-report presentation of owner economics, market map, teardown form, and Gulf Coast-specific route links.

## Page Builder Tasks

- source files likely to change: src/property-management/index.njk and this brief.
- redirect or schema work: Keep existing owner page schema and canonical route.
- internal-link or CTA work: Preserve owner proof links, owner long-tail links, and tracked owner CTA.
- money CTA and downstream tracking event to verify: #owner-cta with data-track-event="owner_primary_cta_click" and data-track-form="owner".

## Voice Editor Checklist

- tone risks: Avoid generic luxury brochure language and detached "the owner" phrasing.
- generic or mechanical patterns to kill: Explainer-hub copy, passive income claims, flat-fee shortcut copy, vague full-service promises, and internal-feeling `teardown` language when `review` says the same thing more naturally.
- proof or specificity checks: Keep $119,923, 13.4% to 2.9%, benchmark attribution, and missing-information caveats.
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured: Keep "what does your pool home actually keep" and "what feels expensive or unclear right now."

## Release Gate Checklist

- routes to smoke test: /property-management/
- commands to run: npm run lint:content, npm run build:prod, npm run test, npm run verify:release, rendered browser screenshot review.
- regression risks to watch: Owner CTA source contract, owner-only nav CTA, long-tail owner links, form tracking, mobile overflow, broken images.

## Done When

- The owner page renders the Field Report direction, routes owners into the teardown form, passes release verification, and records the direction in DESIGN.md.

## Post-Reread Outcome

- reread window used: Not applicable.
- crawl freshness result: Not applicable.
- actual impressions, CTR, position, and downstream event counts: Not measured in this branch.
- decision taken: rewrite
- next branch slug or explicit wait state: Wait for human visual review before extending the direction to other page families.

## Not In Scope

- Rewriting child owner pages.
- Adding new owner proof claims.
- Redesigning guest stay pages.
- Copying the exact Field Report layout onto every future route.
