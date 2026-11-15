# Brief: Old-Design Guide Moves

- lifecycle: active
- scope: move guides that still render the pre-Waterline design onto the shared
  planning frame (`docs/briefs/2026-10-guide-family-1-planning-frame.md` is the
  frame contract), one guide or small batch per PR. On 2026-11-14 Sawyer chose
  calm editorial variant A from three rendered desktop and mobile previews of the
  family guide and asked for every old-design guide to move. M1 moves the family
  guide. M2 moves the beaches, restaurants and fishing guides. M3 moves the noise
  rules, Siesta Key beach and snowbird guides. M4 moves the waterfront
  restaurants and Bradenton vs Tampa guides. Later moves are added to this
  brief with their own swap list.

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
- Receipts of merged batches: M1 and M2 in
  `docs/plans/2026-11-14-old-design-guide-receipts.md`, M3 in
  `docs/plans/2026-11-15-old-design-guide-receipts-m3.md`.

## M4 waterfront restaurants and Bradenton vs Tampa guides

- Sources: `src/guides/best-waterfront-restaurants-with-boat-dock.html`,
  `src/guides/bradenton-vs-tampa-vacation-rentals.html`.
- Why these two: same legacy shell as M1 to M3, and no open measurement window
  names them.
- Same rules as M2: type-led opening with no image, same words, `guideOgTitle`
  where the og title differs (Bradenton vs Tampa).
- Bradenton vs Tampa opens with a "Quick Answer" box, not a TL;DR box; its text
  becomes the first intro paragraph and the label is dropped, as for TL;DR.
- Swap list: `docs/plans/2026-11-14-old-design-guide-swaps.md` -> "L8 swaps
  (waterfront restaurants, Bradenton vs Tampa)".
- Proof: as M2. Waterfront restaurants carries three JSON-LD blocks, Bradenton
  vs Tampa four.

## Gate 0 Search And Attack Receipt (M4 waterfront restaurants guide)

| Field | Required answer |
| --- | --- |
| Target query family | waterfront restaurants with boat dock anna maria island; dock and dine bradenton |
| Searcher intent | Informational: a boater choosing where to tie up for a meal |
| Current Seascape URL | https://seascape-vacations.com/guides/best-waterfront-restaurants-with-boat-dock/ |
| SERP observed date | 2026-11-15 |
| SERP stale after | 2026-12-15 |
| Current proof | 2026-11-15 web search for "waterfront restaurants with boat dock Anna Maria Island Bradenton dock and dine" (US). It lists result pages and is not a rank read: no Seascape position is claimed |
| Top visible competitors | bradentongulfislands.com (several pages), opentable (list pages), boatsetter.com, sarasotamagazine.com, islandreal.com |
| Competitor angle | From result titles only: tourism-board "dock and dine" lists and restaurant-booking list pages |
| Visual/format gap | Not assessed: the search gives titles, not page layouts; no format claim is made |
| Seascape gap | None claimed for the layout move; any content change belongs to a later copy-lane brief |
| Search fit | The title names the query and the page lists restaurants by area with docking notes and a closing table; unchanged here |
| Local/GBP proof | Not applicable: layout-only move with no local-pack or Google Business change |
| AEO/readback note | The JSON-LD blocks are byte-identical to main. Read tracker positions before and about four weeks after publish |
| Recommendation | Keep title, meta, H1, body copy and JSON-LD unchanged; ship the layout move |
| Attack status | completed |
| Query variants inspected | waterfront restaurants with boat dock Anna Maria Island Bradenton dock and dine |
| SERP source | Web search, observed 2026-11-15 (titles and URLs only) |
| Competitor URLs inspected | https://www.bradentongulfislands.com/blogs/dock-and-dine-best-boat-up-restaurants/; https://boatsetter.com/boating-resources/anna-maria-island-restaurants |
| Content gap and Seascape answer | Not assessed beyond titles; the page's content is unchanged here |
| Design/format strategy | Shared planning frame, type-led opening, no image; same words, numbered steps, rail and booking kit |
| Seascape proof available | Current source and the main-versus-head build diff |
| Tools/plugins used | Web search, node build diff, Playwright render |
| Decision and reason | Hold search-facing output unchanged: this is a layout move; ranking work waits for the tracker read and the SEO gate |

## Gate 0 Search And Attack Receipt (M4 Bradenton vs Tampa guide)

| Field | Required answer |
| --- | --- |
| Target query family | bradenton vs tampa; bradenton or tampa vacation rental |
| Searcher intent | Comparison before choosing a base for a Gulf Coast trip |
| Current Seascape URL | https://seascape-vacations.com/guides/bradenton-vs-tampa-vacation-rentals/ |
| SERP observed date | 2026-11-15 |
| SERP stale after | 2026-12-15 |
| Current proof | 2026-11-15 web search for "Bradenton vs Tampa vacation rental which is better" (US). It lists result pages and is not a rank read: no Seascape position is claimed |
| Top visible competitors | vrbo.com, airbnb.com, vacasa.com, expedia.com, holidu.com, bnbfinder.com |
| Competitor angle | From result titles only: listing pages for Bradenton rentals; no side-by-side comparison page is visible in the titles |
| Visual/format gap | Not assessed: the search gives titles, not page layouts; no format claim is made |
| Seascape gap | None claimed for the layout move; any content change belongs to a later copy-lane brief |
| Search fit | The title names the comparison and the page covers cost, beaches, trip types, airports and a FAQ; unchanged here |
| Local/GBP proof | Not applicable: layout-only move with no local-pack or Google Business change |
| AEO/readback note | The JSON-LD blocks are byte-identical to main. Read tracker positions before and about four weeks after publish |
| Recommendation | Keep title, meta, H1, body copy and JSON-LD unchanged; ship the layout move |
| Attack status | completed |
| Query variants inspected | Bradenton vs Tampa vacation rental which is better |
| SERP source | Web search, observed 2026-11-15 (titles and URLs only) |
| Competitor URLs inspected | https://www.vacasa.com/usa/Florida/Bradenton/; https://www.expedia.com/Bradenton-Vacation-Rentals.d6020.Travel-Guide-VacationRentals |
| Content gap and Seascape answer | Not assessed beyond titles; the page's content is unchanged here |
| Design/format strategy | Shared planning frame, type-led opening, no image; same words, numbered steps, rail and booking kit |
| Seascape proof available | Current source and the main-versus-head build diff |
| Tools/plugins used | Web search, node build diff, Playwright render |
| Decision and reason | Hold search-facing output unchanged: this is a layout move; ranking work waits for the tracker read and the SEO gate |
