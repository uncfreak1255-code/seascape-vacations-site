# Brief: Old-Design Guide Moves

- lifecycle: active
- scope: move guides that still render the pre-Waterline design onto the shared
  planning frame (`docs/briefs/2026-10-guide-family-1-planning-frame.md` is the
  frame contract), one guide or small batch per PR. On 2026-11-14 Sawyer chose
  calm editorial variant A from three rendered desktop and mobile previews of the
  family guide and asked for every old-design guide to move. M1 moves the family
  guide. Later moves are added to this brief with their own swap list.

## Content Gate Inputs

Layout lane: no new public copy; the gate fields are recorded because the
content gate reads every active brief.

- persona: a parent planning an Anna Maria Island trip who needs beaches, activities and a place to stay without reading around a legacy page.
- primary keyword: family vacation Anna Maria Island (M1; each later move keeps its guide's existing keyword)
- secondary keywords: unchanged from each guide's current page
- audience pattern: answer first, numbered steps with a rail, then the booking kit.
- proof source: each guide's own published copy and sources; the move adds none.
- required internal links: /properties/, /stays/family-vacation-rentals-anna-maria-island/
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

## Gate 0 Search And Attack Receipt (M1 family guide)

M1 moves page source into front matter and a layout, so the gate reads it as a
search-facing source edit. The rendered title, meta description, canonical, H1
and JSON-LD are unchanged. This receipt records the check behind keeping them
unchanged.

| Field | Required answer |
| --- | --- |
| Target query family | family vacation anna maria island; anna maria island with kids |
| Searcher intent | Informational: planning a family beach trip (beaches, activities, where to stay) before choosing dates and a home |
| Current Seascape URL | https://seascape-vacations.com/guides/family-vacation-anna-maria-island/ |
| SERP observed date | 2026-11-14 |
| SERP stale after | 2026-12-14 |
| Current proof | 2026-11-14 web search for "family vacation anna maria island with kids guide" (US). It lists result pages and is not a rank read: no Seascape position is claimed. Family terms were saved to the local rank tracker on 2026-11-01; the next tracker read supplies positions |
| Top visible competitors | compasshotel.com (kids activity guide), islandreal.com (older kids), amilocals.com (things to do with kids), johnnyjet.com, flashpackingfamily.com, mummytravels.com, familytraveller.com, wander.com |
| Competitor angle | From result titles only: activity lists for kids ("5 Must-Do Activities To Do with Kids on Anna Maria Island", "5 Things To Do With Older Kids While Visiting Anna Maria Island") and family travel write-ups |
| Visual/format gap | Not assessed: the search gives titles, not page layouts; no format claim is made |
| Seascape gap | None claimed for the layout move; any content change belongs to a later copy-lane brief |
| Search fit | The title already names the query ("Planning the Perfect Family Vacation to Anna Maria Island") and the page covers beaches, activities by age, restaurants and rentals; unchanged here |
| Local/GBP proof | Not applicable: layout-only move with no local-pack or Google Business change |
| AEO/readback note | Article, BreadcrumbList, FAQPage and LocalBusiness JSON-LD are byte-identical to main. Read tracker positions for the family terms before and about four weeks after publish |
| Recommendation | Keep title, meta, H1, body copy and JSON-LD unchanged; ship the layout move |
| Attack status | completed |
| Query variants inspected | family vacation anna maria island with kids guide |
| SERP source | Web search, observed 2026-11-14 (titles and URLs only) |
| Competitor URLs inspected | https://compasshotel.com/anna-maria-sound/local-guide/family-friendly-things-to-do-around-anna-maria-island/5-must-do-activities-to-do-with-kids-on-anna-maria-island; https://www.islandreal.com/blog/older-kids-visiting-anna-maria-island/ |
| Content gap and Seascape answer | Competitor titles are activity lists; Seascape's page already groups activities by age and adds beaches, safety and rentals. Unchanged here |
| Design/format strategy | Shared planning frame, type-led opening, one illustration; same words, numbered steps, rail and booking kit |
| Seascape proof available | Current source and the main-versus-head build diff |
| Tools/plugins used | Web search, node build diff, Playwright render |
| Decision and reason | Hold search-facing output unchanged: this is a layout move; ranking work waits for the tracker read and the SEO gate |
