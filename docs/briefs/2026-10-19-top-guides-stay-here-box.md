# Brief: Top Five Guides Stay-Here Box

- lifecycle: active
- task scope: add one shared "stay here" box (`src/_includes/partials/guide-stay-here.njk`, data in `src/_data/guideStayHere.json`) to the five highest-click travel guides so readers move on to a fitting Seascape home. Approved by Sawyer 2026-10-19.
- completion or successor: set to completed with the merged PR once this ships; deployment and click lift are separate claims.

## Content Gate Inputs

- persona: Gulf Coast traveler mid-planning who found a guide through search (timing, weather, rain plan, shelling, or AMI vs Siesta Key) and has not yet chosen where to stay.
- primary keyword: Anna Maria Island vacation rentals
- secondary keywords: best time to visit Anna Maria Island, Anna Maria Island weather, Anna Maria Island vs Siesta Key, rainy day activities Bradenton Sarasota, shelling Anna Maria Island
- audience pattern: reader lands on an informational guide, gets the answer, and needs one concrete, honest next step into a specific home without leaving the guide's context.
- proof source: `src/_data/properties-fallback.json` (name, specs, `guestFacts`, photography) rendered through the `properties` global; Search Console export for seascape-vacations.com, 2026-07-18 to 2026-10-17 (see Why This Batch).
- required internal links: /properties/ and the matching /properties/<slug>/ page (The Oasis, Dockside Dreams, River House, The Coastal); existing guide stay collections and conversion kits stay in place.
- CTA target: `/properties/<slug>/#check-availability` (direct-book property page, the same path the AMI vs Siesta Sarasota Luxe feature uses), with `/properties/` as the compare-all link.
- anti-claims: no discount or savings claim, no price, no beachfront or "on the island" claim (all four homes are Bradenton mainland; River House says about five miles from AMI beaches, taken from its data description), no invented amenity or capacity, no review-count claim, no urgency or scarcity claim beyond what each guide already says.

## Why This Batch

- Search Console (Jul 18 to Oct 17, 2026): guides brought about 1,200 of 1,511 total clicks while the home page got 74. Readers arrive on guides, so the guide is where stay intent has to be caught.
- Top five guides by clicks: best-time-visit-anna-maria-island (234), anna-maria-island-vs-siesta-key (199), rainy-day-activities-bradenton-sarasota (130), anna-maria-island-weather (102), shelling-guide-florida (86).
- Four of the five already end with the conversion kit (rainy-day ends with a generic CTA), which only the readers who scroll to the bottom see. The new box sits after the first main section.
- Waits: no change to guide answers, titles, meta, schema, or the other 40+ guides until a readback shows click-through to property pages.

## Experiment And Readback Contract

- hypothesis: a specific, honest home recommendation near the top of each guide moves more guide readers to a property page than the end-of-page kit alone.
- primary event: `guide_property_check_dates_click` with `data-placement="guide_stay_here"`.
- guardrail event: `guide_stay_click` and `guide_book_direct_click` from the existing kits must not fall; guide bounce and scroll depth unchanged.
- entry criteria: merged and published to production, GA4 receiving events for the five guide slugs.
- readback window: first 14 complete days after publish, compared with the prior 14 days per guide.
- decision rule: keep and extend to the next guides if property-page visits from the five guides rise without a drop in end-of-page kit clicks; otherwise move the box lower or change the recommended home.

## Gate 0 Search And Attack Receipt

This change does not alter titles, descriptions, headings that target queries, schema, redirects, or sitemap. Page answers and ranking inputs are unchanged; one extra block with a heading is added inside each guide.

| Field | Required answer |
| --- | --- |
| Target query family | Existing guide queries; unchanged |
| Searcher intent | Informational, with a stay decision following |
| Current Seascape URL | The five guide URLs above |
| SERP observed date | not re-read; no ranking change is attempted |
| Recommendation | Add the box; do not edit guide copy |
| Attack status | none found after named checks: change adds a conversion block only, no search-facing page source other than the added block |
| Decision and reason | Ship; the traffic is already earned, the gap is the next step |

## Cluster In Scope

- canonical winner URLs: the five guides above.
- feeder pages: none added.
- aliases or retired URLs: none.
- money destination: property pages for The Oasis, Dockside Dreams, River House, The Coastal.
- active lane: direct-book stay intent.

## Source And Proof Constraints

- property truth needed: name, specs, and photo come straight from the `properties` data at build; the one-line fit text per guide uses only facts in the same record (`guestFacts`, description, pool-heat note).
- claims that are off-limits: discounts, price, beachfront, walkable-to-beach, "closest to the sand".
- Seascape-specific proof this adds: a named home with real specs and a photo per guide, with the mainland location stated plainly.

## Page Builder Tasks

- source files: `src/_includes/partials/guide-stay-here.njk`, `src/_data/guideStayHere.json`, the five guide files (one include line each).
- placement: best-time after Peak Season section; weather after the monthly table section; shelling after the quick answer; AMI vs Siesta after the Sarasota Luxe feature (the Siesta side already has a home feature); rainy-day after the Sarasota picks.
- CTA tracking: `guide_property_check_dates_click` and `guide_stay_click`, both existing events.

## Voice Editor Checklist

- no banned phrases from `docs/style/banned-patterns.md`; short, plain sentences.
- every home stated as Bradenton or mainland, not on the island.

## Release Gate Checklist

- `npm run lint:content`, `npm run build`, the guide-conversion and tracking enforcement tests, `git diff --check`.
- none of the changed routes is smoke-asserted (`scripts/recovery/assert-live-smoke.js` covers homepage, /properties/, /property-management/, /stays/).

## Done When

- all five guides render the box with the right home, photo, and working links; checks pass; PR open for review.

## Post-Reread Outcome

- pending; fill after the 14-day readback.

## Not In Scope

- editing guide answers, titles, meta, or schema; boxes on other guides; new property copy; discounts.
