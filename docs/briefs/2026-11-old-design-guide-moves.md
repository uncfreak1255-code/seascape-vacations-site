# Brief: Old-Design Guide Moves

- lifecycle: active
- scope: move guides that still render the pre-Waterline design onto the shared
  planning frame (`docs/briefs/2026-10-guide-family-1-planning-frame.md` is the
  frame contract), one guide or small batch per PR. On 2026-11-14 Sawyer chose
  calm editorial variant A from three rendered desktop and mobile previews of the
  family guide and asked for every old-design guide to move. M1 moves the family
  guide. M2 moves the beaches, restaurants and fishing guides. M3 moves the noise
  rules, Siesta Key beach and snowbird guides. Later moves are
  added to this brief with their own swap list.

## Content Gate Inputs

Layout lane: no new public copy; the gate fields are recorded because the
content gate reads every active brief.

- persona: a parent planning an Anna Maria Island trip who needs beaches, activities and a place to stay without reading around a legacy page.
- primary keyword: family vacation Anna Maria Island (M1; each later move keeps its guide's existing keyword)
- secondary keywords: unchanged from each guide's current page
- audience pattern: answer first, numbered steps with a rail, then the booking kit.
- proof source: each guide's own published copy and sources; the move adds none.
- required internal links: /properties/, /guides/
- CTA target: the shared booking kit and sticky bar (`guide_book_direct_click` tracking)
- anti-claims: no new rate figures, no amenity or capacity claims, no review counts, no savings percentages beyond a page's existing copy.

## M1 family guide

- Source: `src/guides/family-vacation-anna-maria-island.html`.
- Frame additions (this brief extends the frame contract): `.pg-prose` (plain
  lists and sub-headings of a moved long read) and `.guide-packing` (the packing
  aside in `--pg-*` tokens). The frame sheet and layout comments point here.
- Images: one image style per page. Sawyer saw the first preview on 2026-11-14,
  said the old opening photograph and the painted packing illustration clash, and
  chose option 1 of three rendered fixes: the photograph is removed and the
  illustration is the page's only image. Later moves open with type; an
  illustration is added only where it explains the content beside it.
- Swap list: `docs/plans/2026-10-23-guide-family-1-swaps.md` -> "L5 swaps (family
  guide)". A text difference from main that is not listed there fails the move.
- Proof: title, meta description, keywords, canonical, og/twitter text and the
  four `application/ld+json` blocks are byte-identical between `origin/main` and
  the head; a word-level diff of the rendered body shows only the listed swaps.
- Not in M1: the mid-article "stay here" home box. It needs authored home copy
  traced to property truth, so it ships under its own copy-lane scope.

## M2 beaches, restaurants and fishing guides

- Sources: `src/guides/anna-maria-island-beaches.html`,
  `src/guides/best-restaurants-anna-maria-island.html`,
  `src/guides/fishing-guide-anna-maria-sarasota.html`.
- Why these three: they use the same legacy page shell as M1 and no open
  measurement window names them. `/guides/best-time-visit-anna-maria-island/`
  and `/guides/anna-maria-island-vs-siesta-key/` are the money-guide rescue
  pages in `docs/status/next-batch.md`; a layout move there would mix into
  their readback, so they wait for that window to close.
- Frame additions: `guideOgTitle` (optional; keeps a page's own og/twitter
  title when it differs from `pageTitle`). The frame sheet hides the booking
  kit's repeat-link row when a page lists no `repeatLinks`.
- Images: type-led opening, no image (the M1 rule). The opening photograph and
  the related-card thumbnails are dropped; the OG image is unchanged.
- Tables: five-column tables use `cost-table stack-table` so phones stack each
  row with its column label.
- Swap list: `docs/plans/2026-11-14-old-design-guide-swaps.md` -> "L6 swaps
  (beaches, restaurants, fishing)".
- Proof: same as M1. Title, description and og/twitter text match main after
  HTML entity decoding (the layout escapes `'` and `&`); the four JSON-LD
  blocks per page are byte-identical.

## M3 noise rules, Siesta Key beach and snowbird guides

- Sources: `src/guides/anna-maria-island-noise-ordinance-guide.html`,
  `src/guides/siesta-key-beach-guide.html`,
  `src/guides/snowbirds-guide-extended-stays-florida.html`.
- Why these three: same legacy shell as M1 and M2, and no open measurement
  window names them.
- Same rules as M2: type-led opening with no image, same words, `guideOgTitle`
  where the og title differs (noise, snowbirds).
- Swap list: `docs/plans/2026-11-14-old-design-guide-swaps.md` -> "L7 swaps
  (noise rules, Siesta Key beach, snowbirds)".
- Proof: as M2. Noise and snowbirds carry three JSON-LD blocks, Siesta Key four.
- Receipts of merged batches (M1, M2):
  `docs/plans/2026-11-14-old-design-guide-receipts.md`.

## Gate 0 Search And Attack Receipt (M3 noise rules guide)

| Field | Required answer |
| --- | --- |
| Target query family | anna maria island noise ordinance; quiet hours anna maria island |
| Searcher intent | Informational: a renter checking quiet hours and rules before or during a stay |
| Current Seascape URL | https://seascape-vacations.com/guides/anna-maria-island-noise-ordinance-guide/ |
| SERP observed date | 2026-11-14 |
| SERP stale after | 2026-12-14 |
| Current proof | 2026-11-14 web search for "Anna Maria Island noise ordinance quiet hours vacation rental" (US). It lists result pages and is not a rank read: no Seascape position is claimed |
| Top visible competitors | amisun.com (news and tag pages), islander.org, tampabaybeacons.com |
| Competitor angle | From result titles only: local news reports on enforcement ("New Anna Maria noise ordinance in effect", "Anna Maria taking new approach to noise violations") |
| Visual/format gap | Not assessed: the search gives titles, not page layouts; no format claim is made |
| Seascape gap | None claimed for the layout move; any content change belongs to a later copy-lane brief |
| Search fit | The title names the query ("Anna Maria Island Noise Ordinance Guide 2026") and the page covers quiet hours, violations, fines and a summary table; unchanged here |
| Local/GBP proof | Not applicable: layout-only move with no local-pack or Google Business change |
| AEO/readback note | The JSON-LD blocks are byte-identical to main. Read tracker positions before and about four weeks after publish |
| Recommendation | Keep title, meta, H1, body copy and JSON-LD unchanged; ship the layout move |
| Attack status | completed |
| Query variants inspected | Anna Maria Island noise ordinance quiet hours vacation rental |
| SERP source | Web search, observed 2026-11-14 (titles and URLs only) |
| Competitor URLs inspected | https://amisun.com/new-anna-maria-noise-ordinance-in-effect/; https://amisun.com/anna-maria-taking-new-approach-to-noise-violations/ |
| Content gap and Seascape answer | Not assessed beyond titles; the page's content is unchanged here |
| Design/format strategy | Shared planning frame, type-led opening, no image; same words, numbered steps, rail and booking kit |
| Seascape proof available | Current source and the main-versus-head build diff |
| Tools/plugins used | Web search, node build diff, Playwright render |
| Decision and reason | Hold search-facing output unchanged: this is a layout move; ranking work waits for the tracker read and the SEO gate |

## Gate 0 Search And Attack Receipt (M3 Siesta Key beach guide)

| Field | Required answer |
| --- | --- |
| Target query family | siesta key beach guide; siesta key beach parking |
| Searcher intent | Informational: planning a day at Siesta Key beach (areas, parking, drum circle) |
| Current Seascape URL | https://seascape-vacations.com/guides/siesta-key-beach-guide/ |
| SERP observed date | 2026-11-14 |
| SERP stale after | 2026-12-14 |
| Current proof | 2026-11-14 web search for "Siesta Key beach guide parking drum circle" (US). It lists result pages and is not a rank read: no Seascape position is claimed |
| Top visible competitors | tripadvisor.com, visitflorida.com, redawning.com, mustdo.com, siestakeychamber.com, parkingaccess.com, findrentals.com |
| Competitor angle | From result titles only: destination overviews and single-topic pages ("Siesta Key Beach Parking Guide", "The Siesta Key Drum Circle") |
| Visual/format gap | Not assessed: the search gives titles, not page layouts; no format claim is made |
| Seascape gap | None claimed for the layout move; any content change belongs to a later copy-lane brief |
| Search fit | The title names the query ("Siesta Key Beach Guide: Everything You Need to Know (2026)") and the page covers beach areas, parking, the drum circle and a comparison table; unchanged here |
| Local/GBP proof | Not applicable: layout-only move with no local-pack or Google Business change |
| AEO/readback note | The JSON-LD blocks are byte-identical to main. Read tracker positions before and about four weeks after publish |
| Recommendation | Keep title, meta, H1, body copy and JSON-LD unchanged; ship the layout move |
| Attack status | completed |
| Query variants inspected | Siesta Key beach guide parking drum circle |
| SERP source | Web search, observed 2026-11-14 (titles and URLs only) |
| Competitor URLs inspected | https://www.visitflorida.com/travel-ideas/articles/beach-highlights-siesta-key; https://parkingaccess.com/siesta-key-beach-parking |
| Content gap and Seascape answer | Not assessed beyond titles; the page's content is unchanged here |
| Design/format strategy | Shared planning frame, type-led opening, no image; same words, numbered steps, rail and booking kit |
| Seascape proof available | Current source and the main-versus-head build diff |
| Tools/plugins used | Web search, node build diff, Playwright render |
| Decision and reason | Hold search-facing output unchanged: this is a layout move; ranking work waits for the tracker read and the SEO gate |

## Gate 0 Search And Attack Receipt (M3 snowbird guide)

| Field | Required answer |
| --- | --- |
| Target query family | snowbird guide florida gulf coast; monthly winter rental anna maria island |
| Searcher intent | Informational with booking intent: planning a one to three month winter stay |
| Current Seascape URL | https://seascape-vacations.com/guides/snowbirds-guide-extended-stays-florida/ |
| SERP observed date | 2026-11-14 |
| SERP stale after | 2026-12-14 |
| Current proof | 2026-11-14 web search for "snowbird guide monthly rental Anna Maria Island Bradenton winter stay" (US). It lists result pages and is not a rank read: no Seascape position is claimed |
| Top visible competitors | furnishedfinder.com, vacasa.com, floridarentalbyowners.com, floridarentals.com, vrbo.com, travelawaits.com, emeraldcoastbyowner.com |
| Competitor angle | From result titles only: listing pages for monthly rentals and a few how-to guides ("Guide to monthly rentals for snowbirds", "8 best Florida snowbird destinations") |
| Visual/format gap | Not assessed: the search gives titles, not page layouts; no format claim is made |
| Seascape gap | None claimed for the layout move; any content change belongs to a later copy-lane brief |
| Search fit | The title names the topic and the page covers when to book, what to look for, packing and a budget checklist; unchanged here |
| Local/GBP proof | Not applicable: layout-only move with no local-pack or Google Business change |
| AEO/readback note | The JSON-LD blocks are byte-identical to main. Read tracker positions before and about four weeks after publish |
| Recommendation | Keep title, meta, H1, body copy and JSON-LD unchanged; ship the layout move |
| Attack status | completed |
| Query variants inspected | snowbird guide monthly rental Anna Maria Island Bradenton winter stay |
| SERP source | Web search, observed 2026-11-14 (titles and URLs only) |
| Competitor URLs inspected | https://www.furnishedfinder.com/blog/guide-to-monthly-rentals-for-snowbirds; https://www.vacasa.com/discover/best-florida-snowbird-destinations |
| Content gap and Seascape answer | Not assessed beyond titles; the page's content is unchanged here |
| Design/format strategy | Shared planning frame, type-led opening, no image; same words, numbered steps, rail and booking kit |
| Seascape proof available | Current source and the main-versus-head build diff |
| Tools/plugins used | Web search, node build diff, Playwright render |
| Decision and reason | Hold search-facing output unchanged: this is a layout move; ranking work waits for the tracker read and the SEO gate |
