# Brief: Pool-Heat Truth Correction (Stay Pages)

## Content Gate Inputs

- persona: High-intent guest reading stay-page amenity and "what's included" copy before booking, who could be misled into expecting free pool heat that is actually a $40/day optional add-on.
- primary keyword: vacation rentals with heated pool
- secondary keywords: Bradenton vacation rental heated pool, Sarasota vacation rental pool, Anna Maria Island pool home, winter Florida pool rental
- audience pattern: guest who compares included amenities and fees before booking and expects on-page claims to hold at checkout.
- proof source: seascape-hub/context/seascape-properties.md (canonical: pool heat is an optional $40/day add-on at every home; spa/hot-tub heat included) and the live property pages src/properties/*/index.njk, which already disclose the $40/day price.
- required internal links: /properties/sarasota-luxe/, /properties/the-oasis/
- CTA target: unchanged; existing matching-property and direct-book CTAs. This is a copy-truth correction, no new CTA.
- anti-claims: no "pool heat free / included / at no additional charge", no listing pool heating among "what's included", no direct-book savings beyond 10-15%. Heated pool stays a selling point; the exact $40/day fee is disclosed on property pages, not headlined on collection pages.

## Why This Batch

- what changed in the data: an audit against canonical hub facts found 5 stay pages stating or implying pool heat is free/included, contradicting the $40/day reality already disclosed on the property pages — a guest-trust and chargeback risk.
- why this cluster wins now: removing false fee claims is correctness and proof safety, not SEO expansion; it protects existing money pages and is permitted under the freshness hold.
- what should explicitly wait: the broad 60-page voice rewrite and distance reconciliation (separate staged batches).

## Experiment And Readback Contract

- hypothesis: correcting false free-heat claims reduces guest fee disputes and aligns stay pages with property-page truth; no ranking bet.
- primary event: none; correctness change with no impact claim.
- guardrail event: content gate passes; canonical and schema unchanged; no new banned patterns introduced.
- entry criteria: 5 pages identified with explicit free/included pool-heat claims that contradict canonical facts.
- readback window: not applicable; truth correction, not an experiment.
- decision rule: ship once the content gate passes and no stay page claims pool heat is free or included.

## Search Operator Read

- source reads used: src/_data/seoPages.json, src/properties/*/index.njk, seascape-hub/context/seascape-properties.md.
- URLs inspected: /stays/sarasota-vacation-rentals-with-pool/, /stays/vacation-rentals-with-pool-and-hot-tub/, /stays/winter-vacation-rentals-florida-gulf-coast/, /stays/book-direct-anna-maria-island/, /stays/affordable-vacation-rentals-florida-gulf-coast/.
- main evidence: 5 explicit free/included pool-heat claims live; property pages correctly disclose $40/day.
- competitor pages inspected for demand patterns, not copied topics: none; internal correctness pass.
- question-tool language worth preserving in customer wording: heated pool, hot tub included, optional add-on, cooler months.
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: not applicable; correctness fix, not an expansion decision.

## Cluster In Scope

- canonical winner URL(s): the 5 corrected stay pages listed above.
- feeder pages: none changed.
- aliases or retired URLs: none.
- money destination: existing property and booking CTAs, unchanged.
- active lane: direct-book stay intent (correctness).

## Source And Proof Constraints

- property truth needed: pool heat is a $40/day optional add-on; spa/hot-tub heat included; per seascape-properties.md and the property pages.
- owner proof asset needed: none.
- claims that are off-limits: free or included pool heat, pool heating inside "what's included" lists, savings beyond 10-15%.
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: the property pages already state the $40/day truth; stay pages must not contradict it.

## Page Builder Tasks

- source files likely to change: src/_data/seoPages.json and this brief.
- redirect or schema work: none; FAQ and FAQPage schema text update with the corrected answers.
- internal-link or CTA work: none.
- money CTA and downstream tracking event to verify: unchanged.

## Voice Editor Checklist

- tone risks: making the $40/day fee a scare headline; over-correcting away the heated-pool selling point.
- generic or mechanical patterns to kill: not in scope for this pass (separate voice batch).
- proof or specificity checks: every pool-heat mention now frames it as an optional add-on or omits it from "included" lists; the hot tub is correctly described as included; the exact price stays on property pages.

## Release Gate Checklist

- routes to smoke test: the 5 corrected /stays/ URLs.
- commands to run: npm run lint:content.
- regression risks to watch: any remaining "pool heat included/free" phrasing on stay pages.

## Done When

- no stay page claims pool heat is free or included; pool-heat mentions frame it as an optional add-on or omit it from included lists; the hot tub is described as included; the content gate passes.

## Post-Reread Outcome

- reread window used: not applicable (correctness).
- crawl freshness result: not applicable.
- actual impressions, CTR, position, and downstream event counts: not applicable.
- decision taken: correction shipped.
- next branch slug or explicit wait state: stage the broad voice rewrite and distance reconciliation separately.

## Not In Scope

- the broad 60-page voice rewrite.
- distance reconciliation against property-page tables (separate correctness sub-pass).
- the softer generic "heated pool" amenity labels, which remain an approved selling point.
- any SEO expansion or new pages.
