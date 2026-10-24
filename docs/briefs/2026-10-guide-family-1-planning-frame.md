# Brief: Guide Family 1 Planning Frame

- lifecycle: active
- scope: layout lane (L0 to L4) of `docs/plans/2026-10-23-guide-family-1-spec.md`.
  L0 lifts the planning-guide frame out of the cost guide; L1 to L4 move the car,
  how-to-get-to, flights and SRQ guides onto it, one PR each.

## Content Gate Inputs

Layout lane: no new public copy; the gate fields are recorded because the
content gate reads every active brief.

- persona: a traveler planning an Anna Maria Island trip who needs the answer, the table and the booking route without reading around a legacy page.
- primary keyword: Anna Maria Island vacation cost (L0 page; L1 to L4 keep each guide's existing keyword)
- secondary keywords: unchanged from each guide's current page
- audience pattern: answer first, one table, numbered steps with a rail, then the booking kit.
- proof source: each guide's own published table and sources; the frame adds none.
- required internal links: /properties/, /guides/best-time-visit-anna-maria-island/
- CTA target: the existing booking kit and sticky bar on each guide (`guide_book_direct_click` tracking unchanged)
- anti-claims: no new rate figures, no changed totals, no amenity or capacity claims, no review counts, no savings percentages beyond a page's existing copy.

## Purpose

One shared frame for planning guides (DESIGN.md "Planning guides (October 2026)")
so four more guides do not copy the cost guide's inline CSS. The frame is
structure only: the same words, links, JSON-LD and tracking a guide already has.

## Parts

- `src/_includes/layouts/guide-planning.njk`: head, JSON-LD, breadcrumb, opening,
  figure slot, rail, steps wrapper, booking kit, Keep Reading list, sticky bar.
- `src/css/planning-guide.css`: `--pg-*` tokens (scoped to `body.planning-guide`),
  the `pg-*` classes, breadcrumb, related cards, sticky bar. It loads before
  `guest.css`, the order the cost guide used inline.
- Components kept in the sheet because the cost guide uses them: `.cost-table`,
  `.budget-grid` / `.budget-card`, `.savings-card`, `.pg-facts`. Rename or
  generalise them only in the ticket that adds a second user.

## What a page supplies

Front matter (all copy lives here): `pageTitle`, `pageDescription`,
`pageKeywords` (optional), `guideOgDescription`, `guideTwitterDescription`,
`guideSchemaDescription`, `guideImage`, `guidePublished`, `guideModified`,
`guideAuthor` (`id`, `name`, `jobTitle`, `bio`), `guideSchemaBreadcrumb`,
`guideBreadcrumbLabel`, `guideLabel`, `guideTitle`, `guideSub`, `guideIntro`
(list of paragraphs, HTML allowed), `guideFigure` (optional: `heads`, `rows`),
`guideSteps` (rail labels, in order), `guideFaqs`, `guideKit` (the
`guideConversionKit` argument), `guideRelated`, `guideSticky`.

Page content: the `<section class="pg-step" id="pg-N">` blocks, each with
`<p class="pg-num">0N</p>` and its h2. The `pg-N` ids must match the order in
`guideSteps`.

Optional: `guideLocalFonts: true` swaps the Google Fonts links for the local
font faces (see Fonts below).

## What a page may not put in the frame

- No `<style>` block and no inline `style` attributes; use the sheet's classes
  or add one to the sheet.
- No guide copy in the layout or the sheet (`content:` strings included).
- No new color outside the `--pg-*` tokens; clay stays reserved for cautionary
  readings.
- No second booking box, no scripts, and no figure unless the DESIGN.md "Guide
  figures" tests pass (lane B).
- Do not change tracking attributes: the sticky bar and the booking kit keep
  `data-track-event="guide_book_direct_click"` and the guide slug.

## Fonts

L0 keeps the cost guide's Google Fonts links so the move is neutral. In the
visual runner Google is unreachable, so the committed cost-guide baseline
renders Poppins as the system fallback. `guideLocalFonts: true` loads local
Poppins instead; a guide that sets it renders taller in that runner, so its
baseline must be generated from the converted page (L1 to L4 do this for new
routes). Switching the cost guide itself is a visual change and needs its own
baseline refresh.

## Proof for L0

- Visible text and the three `application/ld+json` blocks of the built cost guide
  are identical between `origin/main` and the L0 head (JSON-LD byte-identical;
  text compared after whitespace collapse).
- Body markup differs only in whitespace and the sticky bar's inline style, which
  moved into `planning-guide.css` with the same declarations. The head swaps the
  inline `<style>` block for a `planning-guide.css` stylesheet link.
- `tests/visual/visual.spec.js` `guide-ami-vacation-cost` passes against the
  baseline taken from the unchanged page, with no snapshot update in the move.

## Gate 0 Search And Attack Receipt (L0 cost guide, L1 car guide, L2 how-to-get-to guide, L3 flights guide)

L0, L1 and L2 move page source into front matter and a layout, so the gate reads
each as a search-facing source edit. The gate parses one Gate 0 table per brief,
so each row below covers all three pages; the pages are named in order L0, L1, L2.
The rendered title, meta description, canonical, H1 and JSON-LD of both pages
are unchanged (proof sections). This receipt records the live search checks
behind keeping them unchanged.

| Field | Required answer |
| --- | --- |
| Target query family | anna maria island vacation cost; how much does a trip to anna maria island cost (L0). do you need a car on anna maria island (L1). how to get to anna maria island (L2). flights to anna maria island (L3) |
| Searcher intent | Informational: budget planning before choosing dates and a stay (L0); deciding whether to rent a car for an island trip (L1); working out how to reach the island by air, road or ferry (L2). choosing which airport to fly into for an island trip (L3) |
| Current Seascape URL | https://seascape-vacations.com/guides/anna-maria-island-vacation-cost/ (L0); https://seascape-vacations.com/guides/do-you-need-a-car-anna-maria-island/ (L1); https://seascape-vacations.com/guides/how-to-get-to-anna-maria-island/ (L2). https://seascape-vacations.com/guides/flights-to-anna-maria-island/ (L3) |
| SERP observed date | 2026-10-24 |
| SERP stale after | 2026-11-23 |
| Current proof | 2026-10-24 OpenSEO SERP reads (US, en, depth 20): L0 ranks organic position 6 for "anna maria island vacation cost" and is not in the top 20 for "how much does a trip to anna maria island cost"; L1 ranks organic position 14 for "do you need a car on anna maria island" (monthly volume 30); L2: an OpenSEO SERP read on the same date (local OpenSEO report c7a1a49d-2b8e-4d90-9666-c66646126ab4, US, en, depth 20) found Seascape not in the top 20 for "how to get to anna maria island". L3: no new SERP read; this move changes no title, meta, H1, copy or JSON-LD, so no ranking claim is made for the flights guide |
| Top visible competitors | L0: expedia.com and travelocity.com package pages, tripadvisor.com hotel lists, wimdu.com, mikenormanrealty.com budget post. L1: annamaria.com, tripadvisor.com forum, amivacationrental.com, thecoconutrentals.com, florida-dreams.com, annamarialifevacationrentals.com, plus Facebook and Reddit threads. L2: not itemized; competitors for "how to get to anna maria island" were not listed from the saved read. L3: not itemized; no SERP read for this move |
| Competitor angle | From SERP titles and snippets only. L0: package and hotel listing pages (expedia, travelocity, tripadvisor) and one budget-planning post (mikenormanrealty). L1: titles lead with the no-car answer ("5 Ways to Get Around on Anna Maria Island Without a Car", "How To Get Around Anna Maria Island Without a Car", "Anna Maria Island: Car or Golf Cart? What's the Best Option?"); two community threads and a TripAdvisor forum topic also rank. L2: no competitor titles or snippets were itemized for this query, so no competitor angle is claimed. L3: none claimed |
| Visual/format gap | Not assessed: the SERP reads give titles and snippets, not page layouts; no format claim is made for any of the three moves. L3: not assessed either |
| Seascape gap | L2: the page is not in the top 20 for the query, so a ranking gap exists, but this move changes no copy, title or markup that search reads. No change needed for the layout moves; any content change belongs to a later copy-lane brief. L3: none claimed; any content change belongs to later copy tickets (E1, E3) |
| Search fit | L0 already matches the budget-planning intent and ranks on page one. L1 already answers the no-car question in its title and first paragraph; it ranks organic 14 with title and snippet matching the query. L2: the title already names the query ("How to Get to Anna Maria Island"); the page is not in the top 20, and a copy ticket (E1) owns any change. L3: the title already names the query ("Flights to Anna Maria Island"); E3 owns any change |
| Local/GBP proof | Not applicable: layout-only moves with no local-pack or Google Business change |
| AEO/readback note | Not applicable to these moves: L0 answer paragraph and FAQ JSON-LD, and L1 Article, BreadcrumbList and LocalBusiness JSON-LD, and L2 Article, BreadcrumbList, FAQPage and LocalBusiness JSON-LD, are byte-identical; recheck positions after the 2026-11-23 stale date. L3 Article, BreadcrumbList, FAQPage and LocalBusiness JSON-LD are byte-identical to main |
| Recommendation | Keep title, meta, H1 and JSON-LD unchanged on all three pages; ship the layout moves; L3 likewise |
| Attack status | completed |
| Query variants inspected | anna maria island vacation cost; how much does a trip to anna maria island cost; do you need a car on anna maria island (none new for L3) |
| SERP source | OpenSEO local get_serp_results (DataForSEO), observed 2026-10-24 |
| Competitor URLs inspected | https://www.expedia.com/Anna-Maria-Island.d553248622847118534.Destination-Travel-Guides; https://www.mikenormanrealty.com/island-info/things-to-do/how-to-plan-your-trip-to-anna-maria-island-on-a-budget/; https://www.annamaria.com/news-and-blog/5-ways-to-get-around-on-anna-maria-island-without-a-car/; https://www.florida-dreams.com/how-to-get-around-anna-maria-island-without-a-car/ |
| Content gap and Seascape answer | L0: competitors lead with package prices; Seascape's answer is pricing the complete checkout total, unchanged here. L1: the ranking titles quoted above frame the question as car versus no car (one names golf carts); Seascape's title asks the same question and its opening answers it, unchanged here. L2: Seascape's title and opening already name the query; no competitor content is claimed, unchanged here. L3: no competitor content is claimed; the page's answer is unchanged here |
| Design/format strategy | Shared planning frame; same table and steps, no new figure in L0 or L1 |
| Seascape proof available | Current source, the 2026-10-24 SERP reads (L2: the saved report named above), and the main-versus-head build diffs |
| Tools/plugins used | OpenSEO local MCP (SERP), node build diff, Playwright visual and floors specs |
| Decision and reason | Hold search-facing output unchanged: L0 and L1 already rank and L2 is not in the top 20 for its query; all three are technical layout moves, and L2's ranking is left to the copy ticket; L3 is the same kind of layout move, left unchanged for search |

## Swaps

The numbered swap list for each guide (L1 car, L2 how-to-get-to, L3 flights, L4 SRQ)
lives in `docs/plans/2026-10-23-guide-family-1-swaps.md`. A text difference from main
that is not listed there fails the ticket.
