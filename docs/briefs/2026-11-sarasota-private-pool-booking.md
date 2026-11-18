# Brief: Sarasota private-pool booking dates

- lifecycle: active
- task scope: Add a tracked date-panel link on `/stays/sarasota-vacation-rentals-with-pool/` for the one matching Sarasota home, copying the #967 Bradenton pool-homes pattern. geoIntro only. No homepage, title, meta, FAQ, layout, or second Sarasota home.
- completion or successor: not complete until this date-link repair merges.

## Content Gate Inputs

- persona: a guest comparing a private-pool home in Sarasota before checking dates
- primary keyword: sarasota rentals with private pools
- secondary keywords: sarasota vacation rentals with private pool; downtown sarasota vacation rental with pool
- audience pattern: confirm the home is downtown with a private pool, then open that home's date panel
- proof source: `src/_data/properties-fallback.json` (Sarasota Luxe city Sarasota, amenities pool and downtown, sleeps 12); `src/_data/stayFacts.js`; the live collection `sarasota-vacation-rentals-with-pool`; #967 Bradenton pattern on `anna-maria-island-homes-with-pool`
- required internal links: /properties/sarasota-luxe/#booking
- CTA target: Sarasota Luxe's existing date and guest panel; no booking submission
- anti-claims: no beachfront, beach home, walkable, 5-star, luxury-as-a-standalone, on-island, fee-range, guaranteed availability, or invented second Sarasota home; no walk to downtown or St. Armands; capacity comes from property truth
- hypothesis: a named date-panel link in the collection's first answer helps a guest check Sarasota Luxe dates; a ranking, citation, booking, or revenue effect is unproven
- primary event: `stay_view_property_click` with `page_slug` sarasota-luxe and `placement` stay_intro
- guardrail event: wrong-home destination, lost trip details, unsupported pool or occupancy claim, or indexability/canonical regression
- entry criteria: existing indexed URL and property truth verified; Gate 0 filled; content gate passed; `npm run lint:content` and `npm run build` green
- readback window: first 7 complete days after production publish for coverage; 14 complete finalized days before and after the live boundary for outcome, owned by Analytics
- decision rule: keep the technically correct source-backed date link; report insufficient evidence for any unmeasured booking or revenue outcome; revert a factual or route regression

## Why This Batch

- What changed: the collection ranks around position 18.6 for "sarasota rentals with private pools". Its intro names Sarasota Luxe but does not link to the date panel. Sawyer directed the #967 pattern on this page.
- Why now: existing-page conversion repair, not expansion. The catalog has one matching Sarasota private-pool home.
- What waits: a second Sarasota home, FAQ rewrites, title/meta, homepage, and any booking-lift claim.

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | sarasota rentals with private pools |
| Searcher intent | Guest booking: find a Sarasota vacation rental with a private pool, then check dates |
| Current Seascape URL | `/stays/sarasota-vacation-rentals-with-pool/` |
| SERP observed date | 2026-11-18 |
| SERP stale after | 2026-11-25 |
| Current proof | Task evidence that this URL ranks around position 18.6 for "sarasota rentals with private pools". Live geoIntro names Sarasota Luxe and the private pool but has no `#booking` date-panel link. Property truth: one matching home, Sarasota Luxe. |
| Top visible competitors | VRBO Kiwi Cove (private heated pool, Sarasota); VRBO Gulf Gate heated pool and spa near Siesta Key; VRBO 4BR heated pool fenced yard minutes to Siesta; VRBO 4BR family retreat with private heated pool near Siesta Key Beach |
| Competitor angle | Named homes, private or heated pools, occupancy, and a booking or listing action |
| Visual/format gap | Competitors put the home name next to a book/check-dates action. Reuse this page's existing paragraphs and cards; no redesign. |
| Seascape gap | The first answer names Sarasota Luxe and the private pool but does not link that name to the date panel; tracked home cards sit farther down. |
| Search fit | Keep this URL. It already ranks for the pool query. Add the #967 date-panel pattern for the one matching home. Conversion is the existing property booking panel. |
| Local/GBP proof | Not a map-pack or GBP action. Location facts come from the property catalog. |
| AEO/readback note | No ChatGPT citation is claimed for this URL. The repair is a date-panel handoff, not AI-visibility lift. |
| Recommendation | Add one tracked `#booking` link for Sarasota Luxe in geoIntro. Keep FAQ, title, meta, cards, and other pages. |
| Attack status | completed |
| Query variants inspected | sarasota rentals with private pools; sarasota vacation rentals with private pool |
| SERP source | Public web search results on 2026-11-18; no paid OpenSEO lookup |
| Competitor URLs inspected | https://www.vrbo.com/4512478 ; https://www.vrbo.com/481514 ; https://www.vrbo.com/2968006 ; https://www.vrbo.com/en-gb/p4917717vb |
| Content gap and Seascape answer | Name the actual Sarasota home with catalog-bound capacity and a direct link to its date panel. Beaches remain a drive. |
| Design/format strategy | Reuse existing collection intro paragraphs and card styling; no layout change. |
| Seascape proof available | Sarasota Luxe pool and downtown amenities, occupancy in property fallback; live same-site booking anchor; #967 event contract |
| Tools/plugins used | Repo source, public web search, content gate. No paid lookup. No Hostaway write. |
| Decision and reason | Improve one existing indexed page for the approved intent. Do not create a second collection or change the homepage. |

## Cluster In Scope

- canonical winner URL: `/stays/sarasota-vacation-rentals-with-pool/`
- feeder pages: none changed
- money destination: `/properties/sarasota-luxe/#booking`
- active lane: direct-book stay intent

## Source Files Changed

- `src/_data/seoPages.json`
- `scripts/enforcement/sarasota-private-pool.test.js`

## Not In Scope

- homepage (`src/index.njk` must stay untouched)
- title, meta, H1, FAQ, schema, or card layout
- a second Sarasota home or new stay URL
- Bradenton pool collection (already shipped in #967)
