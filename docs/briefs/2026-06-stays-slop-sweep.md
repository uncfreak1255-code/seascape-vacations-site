# Brief: Stays slop sweep

## Content Gate Inputs

- persona: Gulf Coast guest comparing private-home stay pages and deciding whether the amenity or location tradeoff fits the trip.
- primary keyword: Florida Gulf Coast vacation rentals
- secondary keywords: Bradenton vacation rentals with hot tub, Gulf Coast beach house rentals, Florida vacation rentals with pool and hot tub, quiet relaxing vacation rentals Florida
- audience pattern: high-intent guest who needs plain tradeoff copy about pool time, hot tubs, beach access, quiet neighborhoods, and direct-book savings without resort or luxury filler.
- proof source: `src/_data/seoPages.json`, `docs/style/banned-patterns.md`, the guest-lane voice judge handoff, and existing property truth in `src/_data/properties-fallback.json`.
- required internal links: /stays/, /properties/, /stays/anna-maria-island-homes-with-pool/
- CTA target: preserve existing stay-page property cards and direct-book paths.
- anti-claims: no new amenities, no on-sand or beachfront promise, no new inventory breadth claim, no title or metadata rewrite beyond the one requested description field, and no claim that this wording change proves demand.

## Gate 0 Search Block

| Field | Value |
| --- | --- |
| Target query family | Existing stay-page amenity and trip-shape queries, including hot tub, beach house, pool plus hot tub, and quiet Florida rental searches. |
| Searcher intent | Guests are comparing specific vacation-rental fit before they open a property or direct-book path. |
| Current Seascape URL | `/stays/bradenton-vacation-rentals-with-hot-tub/`, `/stays/beach-house-rentals-florida-gulf-coast/`, `/stays/vacation-rentals-with-pool-and-hot-tub/`, `/stays/quiet-relaxing-vacation-rentals-florida/`. |
| Current proof | The four source fields contain `best of both worlds` or nearby banned weak phrasing such as `the ultimate in`, `backyard oasis`, `luxury`, `resort-level amenities`, and `The result?`; the requested replacements keep the same page facts while removing that texture. |
| Top visible competitors | Broad OTA and directory surfaces such as Airbnb, VRBO, FloridaRentals.com, and local Gulf Coast rental managers generally compete on large inventory, amenity filters, beachfront wording, or resort-style language. |
| Competitor angle | Competitors tend to sell generic amenity abundance and beach-house feeling; Seascape can be clearer about the actual tradeoff: drive time, private-home space, pool/hot-tub use, quieter neighborhoods, and direct-book savings. |
| Seascape gap | Several existing stay fields used generic phrasing that weakens the page voice and now trips the guest-lane autoFail pattern. |
| Recommendation | Replace only the four named fields with direct guest tradeoff copy; do not change routes, schema, property sets, CTAs, or unrelated stay-page copy. |

## Why This Cleanup

- `best of both worlds` is now part of the guest-lane voice-judge autoFail set, and these four fields are known hits.
- The replacements keep each page's factual angle while dropping generic tourism and amenity filler.
- This is a copy-quality cleanup on existing stay pages, not a new stay-page batch.

## Cluster In Scope

- canonical winner URLs:
  - /stays/bradenton-vacation-rentals-with-hot-tub/
  - /stays/beach-house-rentals-florida-gulf-coast/
  - /stays/vacation-rentals-with-pool-and-hot-tub/
  - /stays/quiet-relaxing-vacation-rentals-florida/
- feeder pages: /stays/ and existing related stay cards.
- aliases or retired URLs: none.
- money destination: existing property cards and direct-book paths.
- active lane: direct-book stay intent copy hygiene on existing pages.

## Source And Proof Constraints

- property truth needed: do not add amenities, capacity, distance, or location claims beyond what the existing source fields already support.
- owner proof asset needed: none.
- claims that are off-limits: new beachfront, on-island, luxury, resort, exact availability, or demand-lift claims.
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: existing private pool, hot tub, private-yard, near-beach drive-time, and direct-book savings framing only.

## Page Builder Tasks

- source files likely to change:
  - `src/_data/seoPages.json`
  - this brief
- redirect or schema work: none.
- internal-link or CTA work: none.
- money CTA and downstream tracking event to verify: existing stay property-card and direct-book paths remain unchanged.

## Voice Editor Checklist

- tone risks: replacing one banned phrase with another generic tourism line, over-selling inland homes as beachfront, or turning amenity copy into resort copy.
- generic or mechanical patterns to kill: `best of both worlds`, `the ultimate in`, `backyard oasis`, `luxury`, `resort-level amenities`, and `The result?`.
- proof or specificity checks: keep the edits tied to actual pool, hot tub, beach drive-time, quiet-neighborhood, and direct-book savings facts.
- customer wording kept where it sounds natural; generic stay-page filler removed where it sounds manufactured.

## Release Gate Checklist

- routes to smoke test: the four stay URLs listed in scope.
- commands to run: `grep -c "best of both worlds" src/_data/seoPages.json`, `npm run lint:content`, `npm run build`, `npm run eval:guest` when the voice-judge gate and `ANTHROPIC_API_KEY` are available, and `npm run verify:release`.
- regression risks to watch: accidental JSON formatting churn, metadata drift outside the requested description field, new unsupported amenity claims, or changed related/property-card routing.

## Done When

- the four requested source fields match the handoff.
- `best of both worlds` drops by four in `src/_data/seoPages.json`.
- deterministic local gates pass.
- guest eval is either run through the merged voice-judge gate with a key or explicitly marked blocked until that gate lands.
- release safety passes with this active brief.

## Not In Scope

- new stay pages.
- broad stay-page rewrites.
- route, schema, sitemap, redirect, property-card, or CTA changes.
- owner-page work.
