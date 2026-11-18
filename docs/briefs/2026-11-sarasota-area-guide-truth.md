# Brief: Sarasota area guide title truth repair

- lifecycle: active
- task scope: rewrite the Google snippet on `/guides/sarasota-area-guide/` so it no longer calls Sarasota Luxe a beach home. Title, meta description, Open Graph and Twitter mirrors only. No homepage, H1, body, FAQ, or layout change.
- completion or successor: not complete until this title/meta repair merges.

## Content Gate Inputs

- persona: a traveler searching "sarasota vacation rentals" who needs to know the home is downtown, not on the beach
- primary keyword: sarasota vacation rentals
- secondary keywords: sarasota vacation rentals downtown; sarasota vacation rental with private pool
- audience pattern: clicks a snippet that names downtown vs beach; bounces if the title promises beach homes
- proof source: `src/_data/properties-fallback.json` (Sarasota Luxe city Sarasota, amenities pool and downtown); live area-guide subtitle already says the home is near downtown and Gulf beaches by car; Hub/content-priorities note Lido/Siesta as a drive, about 10 and 15–20 minutes
- required internal links: /stays/sarasota-vacation-rentals-with-pool/, /guides/bradenton-vs-sarasota/
- CTA target: existing area-guide property card and `/properties/` browse; no new CTA
- anti-claims: no beachfront, beach home, walkable, 5-star, luxury-as-a-standalone, on-island, or fee-range claim; no walk to downtown or St. Armands; no invented second Sarasota home
- hypothesis: a truthful downtown-plus-pool snippet earns clicks from "sarasota vacation rentals" without mismatch bounce; ranking or booking lift is unproven
- primary event: Search Console clicks for "sarasota vacation rentals" on this URL
- guardrail event: average position for that query and `guide_book_direct_click` on this route
- entry criteria: Gate 0 filled; content gate passed; `npm run lint:content` and `npm run build` green
- readback window: first 7 complete days after production publish, then the 28-day settle window in `docs/status/page-ledger.json`
- decision rule: keep if the snippet no longer says beach homes and position does not worsen by more than 5 places over 7 complete days; revert the title/meta if position is worse than 50 or CTR stays at 0 with impressions still flowing; no booking lift is claimed

## Why This Batch

- What changed: Google still ranks this guide for "sarasota vacation rentals" around position 42. The live title is "Sarasota Vacation Rentals | Luxury Beach Homes". Sarasota Luxe is a downtown Sarasota home with a private pool; beach days are a drive.
- Why now: this is a source-truth defect in the ranking snippet, not expansion. Sawyer directed the repair.
- What waits: body/FAQ cleanup, a second Sarasota home, homepage, and any ranking or booking claim.

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | sarasota vacation rentals |
| Searcher intent | Guest booking: find a Sarasota vacation rental, then decide beach vs downtown |
| Current Seascape URL | `/guides/sarasota-area-guide/` |
| SERP observed date | 2026-11-18 |
| SERP stale after | 2026-11-25 |
| Current proof | Task evidence that this URL ranks around position 42 for "sarasota vacation rentals". Live title still says Luxury Beach Homes. Property truth: Sarasota Luxe is city Sarasota, downtown, private pool. |
| Top visible competitors | Booking.com Sarasota vacation rentals; House of the Sun (Siesta Key beach condos); Sea Club II on Siesta Key; Airbnb "Oasis by Siesta Key Beach and Downtown SRQ w/pool"; Beach Plus Sarasota direct-booking collection |
| Competitor angle | Beachfront or Siesta Key inventory, named homes, private pools, and OTA or direct booking |
| Visual/format gap | Competitors lead with beach or pool photos and named inventory. Seascape already has a property card. No layout change. |
| Seascape gap | The ranking title calls the inventory luxury beach homes. The home is downtown, about a 10-minute drive to Lido and 15–20 to Siesta, with a private pool. |
| Search fit | Keep this URL. It already ranks for the head term. Repair the snippet so it matches the downtown pool home. Conversion stays on the existing property card and `/stays/sarasota-vacation-rentals-with-pool/`. |
| Local/GBP proof | Not a map-pack or GBP action. Location facts come from the property catalog. |
| AEO/readback note | No ChatGPT citation is claimed for this URL. The repair is snippet truth, not AI-visibility lift. |
| Recommendation | Rewrite title and meta description (and OG/Twitter mirrors) only. |
| Attack status | completed |
| Query variants inspected | sarasota vacation rentals; sarasota vacation rentals downtown; sarasota rentals with private pools |
| SERP source | Public web search results on 2026-11-18; no paid OpenSEO lookup |
| Competitor URLs inspected | https://www.booking.com/booking-home/city/us/sarasota.html ; https://www.siestakeyhos.com/ ; http://seaclub2.com/ ; https://www.airbnb.com/rooms/644052707298231615 ; https://beachplus.co/vacation-rentals/sarasota |
| Content gap and Seascape answer | Name downtown, the private pool, and that beaches are a drive. |
| Design/format strategy | No layout, CSS, H1, or body change. |
| Seascape proof available | Property fallback for Sarasota Luxe; existing area-guide subtitle and property card; stay-page drive times already published for Lido and Siesta |
| Tools/plugins used | Repo source, public web search, content gate. No paid lookup. No Hostaway write. |
| Decision and reason | Repair the ranking snippet on the existing winner URL. Do not create a beach-home page or change the homepage. |

## Cluster In Scope

- canonical winner URL: `/guides/sarasota-area-guide/`
- feeder pages: none changed
- money destination: `/properties/sarasota-luxe/` and `/stays/sarasota-vacation-rentals-with-pool/`
- active lane: comparison guides feeding direct-book stay intent

## Source Files Changed

- `src/guides/sarasota-area-guide/index.html`
- `docs/status/page-ledger.json`
- `scripts/enforcement/sarasota-area-guide-truth.test.js`

## Not In Scope

- homepage (`src/index.njk` must stay untouched)
- H1, body, FAQ answers, schema beyond mirrors of title/description
- a second Sarasota home or new stay URL
