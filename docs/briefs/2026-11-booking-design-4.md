# Booking flow Design 4 (phone search and browse)

- lifecycle: selected
- approved scope: Sawyer approved the "Design 4" booking prototype (site PR #888, /internal/booking-4/) on 2026-11-06 for the real phone booking flow on the homepage and /properties/. Merging publishes it, so the merge itself still needs his explicit go-ahead.
- persona: The person arranging a shared Gulf Coast stay, searching on a phone.
- primary keyword: Bradenton and Sarasota vacation rentals (existing homepage and catalog intent; no search expansion).
- secondary keywords: vacation homes with private pools (existing intent).
- audience pattern: Tap one summary to set dates and guests, then browse real photos of each home.
- proof source: src/_data/properties.js and properties-fallback.json (photos, names, capacity); docs/design/platform-patterns.md (PR #889) patterns 1, 3 and 4.
- required internal links: /properties/, /guides/, /properties/the-oasis/
- CTA target: existing trip form submit, home pages and booking links, unchanged.
- anti-claims: No new amenity, price, rating, availability or capacity claim. The "Available for your dates" label appears only for homes the existing live availability check (/.netlify/functions/booking-availability) reports bookable for the dates entered, and never without dates.
- hypothesis: A search summary that opens a sheet, plus swipeable photos, makes a phone search easier to start and homes easier to judge.
- primary event: homepage_search_submit and catalog_trip_update (existing, unchanged)
- guardrail event: catalog_book_direct_click, catalog_view_details_click, owner_primary_cta_click (names and attributes unchanged)
- entry criteria: Sawyer approved Design 4 on 2026-11-06.
- readback window: none until selected and published.
- decision rule: merge only on Sawyer's explicit go-ahead after he has seen the preview.
- Source files changed in this batch:
  - `src/index.njk`
  - `src/properties/index.njk`
  - `src/assets/js/trip-sheet.js`, `src/assets/js/catalog.js`
  - `src/css/trip-sheet.css`
  - `src/_includes/partials/trip-sheet-pill.njk`, `trip-sheet-shell.njk`, `guest-trip-form.njk`, `catalog-trip.njk`

## Copy pass

Draft the copy: "Dates and guests", "Your trip", "Find my home" (the existing button label), "All stays / Waterfront / Near AMI / Sarasota" (the existing catalog filter labels), "Available for your dates", "1 / 5". Remove internal wording: none reaches the page. Check voice and specificity: short functional labels, no marketing claims. The owner section and all owner links are untouched.

## Proof notes

Phone visual baselines for `home` and `properties-catalog` were regenerated on 2026-11-06 by the update-visual-baselines workflow (run 42313667334) because the sheet, pill, photo strips and chips change those pages on phones. Specs open the sheet through `openTripSheet` in `tests/visual/test-helpers.js`.

## Gate 0 Search And Attack Receipt

This batch edits visible controls on two search-facing routes (homepage and /properties/). No title, meta, schema, heading, redirect or sitemap change is made. Evidence gathered 2026-11-06 with one WebSearch; no DataForSEO, GSC or GA4 pull was run.

| Field | Required answer |
| --- | --- |
| Target query family | Bradenton Sarasota vacation rentals private pool homes book direct |
| Searcher intent | Compare real pool homes and continue to booking details. |
| Current Seascape URL | https://seascape-vacations.com/ and https://seascape-vacations.com/properties/ |
| SERP observed date | 2026-11-06 |
| SERP stale after | 2026-11-13 |
| Current proof | No GSC or GA4 receipt pulled; no ranking or conversion claim is made. Tracking event names are unchanged. |
| Top visible competitors | floridarentals.com (book-direct aggregator), Evolve (Vrbo family), Vacasa and a bradentongulfislands.com listing of Seascape appeared in the 2026-11-06 result set; not a ranked market-share read. |
| Competitor angle | Aggregators lead with booking-fee and savings claims and long listing grids; Evolve leads with rate guarantees. |
| Visual/format gap | Seascape answers with phone-native patterns from docs/design/platform-patterns.md (summary pill and sheet, swipeable photos, chips), with no fee or savings claim. |
| Seascape gap | The trip form was not visible at first paint on a phone and each card showed one photo. This closes that without changing copy that search reads. |
| Search fit | Both routes keep their title, meta, headings and intent; this is a presentation and interaction change. |
| Local/GBP proof | N/A: no business-profile, NAP or service-area change is made. |
| AEO/readback note | N/A: no machine-readable surface or AI-answer claim changes; no readback was run. |
| Recommendation | improve: ship the presentation Sawyer approved; make no title, meta, schema or claim change. |
| Attack status | completed |
| Query variants inspected | "Bradenton Sarasota vacation rentals private pool homes book direct" (one bounded query). |
| SERP source | WebSearch results observed 2026-11-06. |
| Competitor URLs inspected | https://www.floridarentals.com/southwest/bradenton-vacation-rentals/by-owner/ ; https://evolve.com/vacation-rentals/us/fl/bradenton/482506 (result pages listed by the search; not fetched) |
| Content gap and Seascape answer | Competitors lead with fee and savings claims; Seascape adds no such claim and keeps its existing honest copy about confirming the full price on the booking page. |
| Design/format strategy | Interaction patterns from the playbook (PR #889), built in Waterline tokens; no platform branding or copy. |
| Seascape proof available | Real per-home photos, names and capacity from properties.js; the existing live availability check. |
| Tools/plugins used | WebSearch, local Eleventy build, Playwright |
| Decision and reason | Proceed with the approved presentation; claim nothing new and await merge approval. |
