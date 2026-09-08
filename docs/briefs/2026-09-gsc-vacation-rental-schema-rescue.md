# Brief: GSC Vacation Rental Schema Rescue

## Content Gate Inputs

- persona: guests comparing a Seascape home in Google Search before booking direct
- primary keyword: Seascape vacation rentals
- secondary keywords: Bradenton vacation rental, Sarasota vacation rental, vacation rental reviews
- audience pattern: travelers using property details and review proof to decide whether a home fits their stay
- proof source: Google Search Console enhancement readback on 2026-09-08, current property templates, and verified review data already published in those templates
- required internal links: /properties/, /guides/
- CTA target: /properties/
- anti-claims: do not invent reviews, ratings, amenities, inventory, locations, or search-performance gains

## Why This Batch

Google Search Console reported 10 invalid VacationRental items. The invalid items
were incomplete duplicate entities: one organization-level VacationRental on the
homepage and standalone Review.itemReviewed references on four property pages.
The complete property entities were already valid. This batch removes the false
duplicates, nests the existing verified reviews under their owning properties,
shows those same reviews on the page, and meets Google's image and coordinate
eligibility guidance using current booking-engine facts.

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | Seascape property names and vacation rentals in Bradenton and Sarasota |
| Searcher intent | Verify a specific home, its location, amenities, and guest review proof before booking. |
| Current Seascape URL | `https://seascape-vacations.com/` and the five canonical `/properties/` pages |
| SERP observed date | 2026-09-08 |
| SERP stale after | 2026-09-15 |
| Current proof | Google Search Console reported 9 valid and 10 invalid VacationRental items; the invalid examples lacked required property fields and traced to duplicate entities in current source. |
| Top visible competitors | No competitor change is needed for this technical correction. |
| Competitor angle | None; the defect is measured against Google's required VacationRental fields. |
| Visual/format gap | Existing review cards did not match the reviews in structured data. Keep the card design and show the same verified records that the schema publishes. |
| Seascape gap | Duplicate incomplete entities make valid property markup appear partly invalid. |
| Search fit | One complete VacationRental entity per home gives search systems one canonical property record. |
| Local/GBP proof | Not applicable; this batch changes on-site property markup only. |
| AEO/readback note | Nesting verified reviews under the complete property entity removes ambiguous property references without adding new claims. |
| Recommendation | Remove the homepage property entity and standalone review entities; retain one complete VacationRental per property with reviews nested under it. |
| Attack status | none found after named checks |
| Query variants inspected | Property-name searches and affected stay-page searches from the 2026-09-08 stale-snippet audit. |
| SERP source | Google Search and Search Console, observed 2026-09-08. |
| Competitor URLs inspected | SERP check: none required. Competitor-page check: none required. Search Console identified a source-local validation defect. |
| Content gap and Seascape answer | Align each visible review card with its verified structured review. Correct coordinate facts from the current booking engine and expand each schema image set to eight existing gallery assets. |
| Design/format strategy | Preserve the current card layout, links, and calls to action while changing the review records shown inside the cards. |
| Seascape proof available | Canonical property facts and the 12 existing verified review records in current property source. |
| Tools/plugins used | Google Search Console URL inspection and enhancement reports, repository tests, production build, and JSON-LD validation. |
| Decision and reason | Ship the narrow schema repair because it removes 10 measured invalid items while preserving the valid property entities and published review facts. |

## Cluster In Scope

- canonical winner URL(s): `/`, `/properties/bradenton-pool-home/`, `/properties/dockside-dreams/`, `/properties/river-house/`, `/properties/sarasota-luxe/`, `/properties/the-oasis/`
- feeder pages: `/properties/`
- aliases or retired URLs: none
- money destination: `/properties/`
- active lane: technical entity and enhancement rescue

## Source And Proof Constraints

- property truth needed: preserve every canonical name, URL, occupancy, identifier, amenity, offer, and verified review fact; source coordinates and gallery images from the current booking engine
- owner proof asset needed: none
- claims that are off-limits: new ratings, review totals, amenities, locations, or guaranteed rich-result visibility
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: the existing canonical facts for each Seascape home

## Page Builder Tasks

- source files likely to change: `src/index.njk`, `src/_data/properties.js`, and all five `src/properties/*/index.njk` property templates
- redirect or schema work: remove the organization-level VacationRental; nest each verified Review under its complete property VacationRental; publish at least eight existing property images and booking-engine coordinates at current precision
- internal-link or CTA work: preserve all existing links and calls to action
- money CTA and downstream tracking event to verify: no booking or tracking change

## Voice Editor Checklist

- tone risks: review cards must remain guest wording and must not introduce internal process language
- generic or mechanical patterns to kill: none
- proof or specificity checks: retain review author, rating, text, and publication date exactly
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured: preserve all existing reader wording

## Release Gate Checklist

- routes to smoke test: `/`, `/properties/bradenton-pool-home/`, `/properties/dockside-dreams/`, `/properties/river-house/`, `/properties/sarasota-luxe/`, `/properties/the-oasis/`
- commands to run: `npm run build`, focused property and metadata tests, `npm run verify:jsonld`, and the repository CI suite
- regression risks to watch: lost review facts, multiple VacationRental entities per property, invalid JSON-LD, or loss of homepage LocalBusiness markup

## Done When

- each property page publishes one complete VacationRental entity with at least eight images and precise current coordinates, the 12 verified reviews remain nested under their owning properties and visible on-page, the homepage publishes no property-level VacationRental, and Search Console validation can start against the deployed correction

## Post-Reread Outcome

- reread window used: Google Search Console enhancement report updated 2026-09-03 and inspected 2026-09-08
- crawl freshness result: current report contains source entities that remain live until this correction deploys
- actual impressions, CTR, position, and downstream event counts: no performance gain claimed; three-month clicks and impressions were reviewed separately in the full audit
- decision taken: rewrite the invalid entity relationships, then request Search Console validation after live proof
- next branch slug or explicit wait state: `codex/gsc-schema-cleanup`

## Not In Scope

- layout, redirects, new pages, or new search claims
- copied competitor structure or new schema types
