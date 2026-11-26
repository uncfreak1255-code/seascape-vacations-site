# Brief: Guest pages for heated pool, IMG Academy, and book direct

- lifecycle: active
- task scope: Sawyer-approved citation-gap work on Saturday, Nov 21, 2026. Add `/stays/heated-pool-vacation-rentals-bradenton/` and `/stays/vacation-rentals-near-img-academy/`; refresh `/guides/booking-direct-vacation-rentals/`; light-refresh `/stays/book-direct-anna-maria-island/`; link the existing IMG card on `/guides/things-to-do-bradenton-fl/`. Do not create `/reviews/`. Do not change the stacked phone homepage. Do not edit owner pages.
- persona: a guest asking ChatGPT where to rent a heated-pool Bradenton home, where to stay near IMG Academy, or how to book a Bradenton/Sarasota rental directly from the local manager
- primary keyword: heated pool vacation rentals Bradenton
- secondary keywords: vacation rentals near IMG Academy; book direct vacation rentals Bradenton Sarasota
- audience pattern: get a quoteable first answer, compare the named homes, then check dates on a property page and complete checkout on the booking site
- proof source: hub `context/seascape-properties.md` and `context/pool-heat-billing-policy.md` on hub main (IMG miles/minutes; pool heat $40/night capped at $280; The Coastal no-charge automatic heat unless declined; Relaxing Oasis "private heated above-ground pool"); `src/_data/properties-fallback.json`; Treg ChatGPT check 2026-11-21; free Search Console pull windows ended 2026-11-18
- required internal links: /stays/heated-pool-vacation-rentals-bradenton/, /stays/vacation-rentals-near-img-academy/, /guides/booking-direct-vacation-rentals/, /stays/book-direct-anna-maria-island/, /guides/things-to-do-bradenton-fl/, /about-us/, /properties/, /properties/bradenton-pool-home/
- CTA target: the matching property page date panel, then Hostaway checkout at book.seascape-vacations.com/listings/{listingId}; no booking submission in this PR
- anti-claims: no invented IMG distances; no street addresses; no fixed direct-booking saving; no management-fee figures; no Patrick; no DBPR/licensed-management claim; no official IMG affiliation, shuttle, or campus access; no pool-temperature guarantee; no checkout-toggle for pool heat; no $40/$280 quote on The Coastal; no pet-friendly claim on no-pet homes; no flattening Sarasota Luxe's channel-dependent occupancy; no `/reviews/` page
- hypothesis: answering the three ChatGPT guest questions on existing or new citation pages makes Seascape nameable for those prompts; a ranking, click, or booking effect is unproven
- primary event: `stay_view_property_click` on the new stay landers and `guide_book_direct_click` / catalog handoff from the refreshed guide
- guardrail event: invented distance or heat price, a second IMG card, homepage stack change, owner-fee copy, or a `/reviews/` route
- entry criteria: Sawyer approved this citation-gap work on 2026-11-21 after the ChatGPT check; hub distances and heat rules verified; `/reviews/` is not on main so book-direct links `/about-us/`
- readback window: first 7 complete days after production publish for coverage; 14 complete finalized days before and after the live boundary for outcome, owned by Analytics. No traffic lift is promised.
- decision rule: keep source-backed answers; report insufficient evidence for citation or booking lift; revert a factual or route regression

## Why This Batch

- A Treg ChatGPT check on Nov 21, 2026 (7:13–7:22 AM ET) asked 13 guest questions. Florida Seascape was named in only 2. Misses this PR covers: heated pool in Bradenton (q13), stays near IMG Academy (q15), book direct with a local manager (q19).
- `docs/status/next-batch.md` Latest Execution Read 2026-11-09: site work gate `clear`, reread `fresh but below threshold`, default next move is bounded rescue of money guides. Expansion stays held. This PR is allowed because Sawyer explicitly approved this citation-gap work the same day as the ChatGPT check. It is not a license for unrelated new pages.
- GSC (windows ended 2026-11-18): the book-direct guide already has impressions and almost no clicks; heated-pool Bradenton has no query in the dump; IMG Academy has no recorded GSC demand. Build for answer-engine coverage, not promised clicks.

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | heated pool vacation rentals Bradenton; vacation rentals near IMG Academy; book direct vacation rentals Bradenton/Sarasota |
| Searcher intent | Guest booking: name a local heated-pool home, a house near IMG Academy, or the direct local-manager checkout path |
| Current Seascape URL | `/guides/booking-direct-vacation-rentals/` (refresh); `/stays/book-direct-anna-maria-island/` (light refresh); new `/stays/heated-pool-vacation-rentals-bradenton/`; new `/stays/vacation-rentals-near-img-academy/` |
| SERP observed date | 2026-11-21 |
| SERP stale after | 2026-11-28 |
| Current proof | Treg ChatGPT check 2026-11-21 named Seabreeze, Vrbo, FloridaRentals, FindRentals, Airbnb, hotels, Palms Heaven, Suncoast, Island Time AMI, Let's Flamingle, OwnerDirect — not Seascape — for the three prompts. Free Search Console pull 2026-11-21, windows ended 2026-11-18: `/guides/booking-direct-vacation-rentals/` 1,269 impressions / 0 clicks / pos 22.4 in 90 days. No 16-month query contained both heated and Bradenton, or IMG Academy. |
| Top visible competitors | Seabreeze Signature Stays; FloridaRentals; FindRentals; Vrbo; Airbnb; Legacy Hotel; Holiday Inn Express; TownePlace Suites; Palms Heaven Rentals; Suncoast Vacation; Island Time AMI Rentals; Let's Flamingle; OwnerDirect |
| Competitor angle | Named inventory or hotels, heated-pool filters, campus-adjacent lodging, and a book-direct or OTA checkout |
| Visual/format gap | Competitors name homes or hotels in the first answer. Reuse the existing stay-lander and guide frames; no new template |
| Seascape gap | No heated-pool Bradenton lander; no IMG stay lander; the live book-direct guide leads with generic OTA-fee comparison instead of a local Bradenton/Sarasota manager path |
| Search fit | Refresh the already-indexed book-direct guide for queries it already almost ranks for. Add two new stay URLs only for intents with no current title/H1 match. Conversion is the existing property date panel and Hostaway checkout |
| Local/GBP proof | Not a map-pack action. Distances and heat rules come from hub property canon and the site catalog |
| AEO/readback note | ChatGPT omitted Seascape on the three prompts on 2026-11-21. This PR supplies quoteable first answers. No citation lift is claimed |
| Recommendation | Ship the two new stay landers, refresh the book-direct guide, light-refresh the AMI book-direct lander, and add inbound links. Do not merge in this task |
| Attack status | completed |
| Query variants inspected | Where can I rent a vacation home with a heated pool in Bradenton, Florida?; What is the best place to stay near IMG Academy?; How can I book a vacation rental in Bradenton directly from the owner or manager?; book direct vacation rentals |
| SERP source | Treg ChatGPT check 2026-11-21; free Search Console query inventory 2026-11-21 (windows ended 2026-11-18); no paid OpenSEO lookup |
| Competitor URLs inspected | https://www.floridarentals.com/southwest/bradenton-vacation-rentals/private-pool/ ; hotel and OTA names returned in the ChatGPT raw answers for q13, q15, and q19 |
| Content gap and Seascape answer | Seascape already manages heated-pool Bradenton homes, a closest home 2.6 miles from IMG Academy, and a direct Hostaway checkout. The site did not answer those three questions on dedicated, quoteable URLs |
| Design/format strategy | Existing `seoPages.json` + `stays.njk` vacationer shape for the new landers; keep the current booking-direct guide frame; no homepage or new layout system |
| Seascape proof available | Hub distances for Bradenton Pool Home, The Oasis, Dockside Dreams, and River House; catalog-bound capacities; pool-heat $40 / $280 with The Coastal exception; eight published homes |
| Tools/plugins used | Hub canon read, site source, free Search Console pull cited in the spec, Treg ChatGPT check 2026-11-21 |
| Decision and reason | Sawyer approved this citation-gap cluster on 2026-11-21. Stay inside the three intents. Do not open unrelated new pages |

## Page Ledger Readback

Judge the seven routes below on the November 22, 2026 production version from
PR #1035. The 28-day window ends December 20, and the ledger verdict is due
Monday, December 21. The book-direct guide has its own source and a November 22
settle hold. All six stay routes share `src/_data/seoPages.json`, so their
`shipped` dates are null. Bring a harm verdict on a newly launched page to
Sawyer. Keep source-backed guide answers and revert a factual or route regression.

| Route | Change and baseline evidence |
| --- | --- |
| `/stays/anna-maria-island-homes-with-pool/` | #967 added date-panel links for The Oasis, Dockside Dreams, and River House on November 16. #1035 added a heated-pool related-stay sentence. No Search Console pull covers October 25 through November 21. The nearest verified URL-prefix pull on November 25 covered October 18 through November 15 and showed 0 clicks, 5 impressions, and position 78.0. |
| `/stays/sarasota-vacation-rentals-with-pool/` | #997 added Sarasota Luxe's date-panel link on November 19. #1035 added a heated-pool related-stay sentence. No Search Console pull covers October 25 through November 21. The nearest verified URL-prefix pull on November 25 covered October 21 through November 18. The URL had 0 clicks, 19 impressions, and position 18.1. The target query had 0 clicks, 17 impressions, and position 18.4. |
| `/stays/heated-pool-vacation-rentals-bradenton/` | New collection. The November 25 Search Console URL-prefix pull found no rows through November 22. |
| `/stays/vacation-rentals-near-img-academy/` | New collection. The November 25 Search Console URL-prefix pull found no rows through November 22. |
| `/guides/booking-direct-vacation-rentals/` | Rewrote the title, description, H1, FAQ, and body for the local-manager book-direct query. Gate 0 records the 90 days ending November 18. A pull for the 28 days before publication is unavailable. |
| `/stays/book-direct-anna-maria-island/` | Refreshed the body and added a related-stay sentence linking to the guide. A Search Console pull for this URL through November 22 is unavailable. |
| `/stays/bradenton-vacation-rentals/` | #1035 added heated-pool, IMG, and book-direct links to `longContent` and replaced the verdict for the November 19 launch in #1002. No Search Console pull covers October 25 through November 21. The launch brief recorded no rows before #1002. |

## Cluster In Scope

- New: `/stays/heated-pool-vacation-rentals-bradenton/`, `/stays/vacation-rentals-near-img-academy/`
- Refresh: `/guides/booking-direct-vacation-rentals/` (keep `/book-direct` 301)
- Light refresh: `/stays/book-direct-anna-maria-island/`
- Inbound: Bradenton and pool stay collections, things-to-do IMG card #16, Bradenton area guide, Bradenton Pool Home property page, about-us, llms.txt
- Money destination: property date panels and book.seascape-vacations.com checkout
- Active lane: direct-book stay intent plus one existing comparison guide

## Source And Proof Constraints

- Capacities from stay-fact tokens, not hand-typed numbers
- IMG miles/minutes only for Bradenton Pool Home (2.6 mi / 7 min), The Oasis (5.1 mi / 10 min), Dockside Dreams (5.6 mi), River House (15 min)
- Pool heat: `{pool-heat-fee}` / $280 whole-stay cap; The Coastal has no charge and turns on unless declined; Relaxing Oasis is a private heated above-ground pool
- `/reviews/` is not on main; link `/about-us/` and the homepage reviews section already on the live site

## Page Builder Tasks

- `src/_data/seoPages.json` two new vacationer entries; relatedStaySlugs on neighbors
- `src/guides/booking-direct-vacation-rentals.html` refresh
- `src/guides/things-to-do-bradenton-fl.html` existing IMG card link
- `src/guides/bradenton-area-guide/index.html` contextual IMG stay link
- `src/about-us/index.njk` Direct-booking value tile
- `src/llms.txt` and `src/ai/summary.json.njk` retrieval lines
- `src/guides/index.njk` drop "Saves You Hundreds"
- `src/_includes/layouts/property.njk` Bradenton Pool Home IMG stay link
- `docs/portfolio/stay-money-pages.md` feeder note

## Required Internal Link Map

- src/guides/booking-direct-vacation-rentals.html: /stays/heated-pool-vacation-rentals-bradenton/, /stays/vacation-rentals-near-img-academy/, /about-us/, /properties/
- src/guides/bradenton-area-guide/index.html: /stays/vacation-rentals-near-img-academy/, /stays/heated-pool-vacation-rentals-bradenton/
- src/guides/things-to-do-bradenton-fl.html: /stays/vacation-rentals-near-img-academy/, /stays/bradenton-vacation-rentals/
- src/guides/snowbirds-guide-extended-stays-florida.html: /stays/heated-pool-vacation-rentals-bradenton/, /stays/snowbird-rentals-florida-gulf-coast/
- src/guides/index.njk: /guides/booking-direct-vacation-rentals/, /properties/
- src/stays/index.njk: /guides/booking-direct-vacation-rentals/, /properties/

## Voice Editor Checklist

- Answer-first 40-word openings stay quoteable
- No fee-stack or OTA-savings theater
- No "heat is included" phrasing that trips stay-fact heat-included detection; use "no charge" for The Coastal
- Public home names only

## Release Gate Checklist

- Routes: the two new stay URLs, booking-direct guide, AMI book-direct lander, things-to-do IMG card, Bradenton area guide, Bradenton Pool Home, about-us
- Commands: `npm run check:brief -- docs/briefs/2026-11-guest-heated-pool-img-book-direct.md --gate0`, `npm run lint:content`, `npm run build`, focused stay-fact and JSON-LD checks, `npm run verify:release -- --range origin/main` if the dirty tree allows
- Watch: homepage stack, owner pages, `/reviews/`, production branch, invented distances

## Done When

- Ready-for-review PR to `main` with the four page actions, inbound links, and a `@codex review` comment. Not merged.

## Not In Scope

- `/reviews/`
- Homepage card stack, hero, or homepage CSS
- Owner pages and fee copy
- Golf stay lander as an IMG page
- A second IMG card on things-to-do
- New `/stays/book-direct-bradenton/` URL
- Promised GSC or ChatGPT lift
