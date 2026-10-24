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

## Gate 0 Search And Attack Receipt (L0 cost guide, L1 car guide, L2 how-to-get-to guide)

L0, L1 and L2 move page source into front matter and a layout, so the gate reads
each as a search-facing source edit. The gate parses one Gate 0 table per brief,
so each row below covers all three pages; the pages are named in order L0, L1, L2.
The rendered title, meta description, canonical, H1 and JSON-LD of both pages
are unchanged (proof sections). This receipt records the live search checks
behind keeping them unchanged.

| Field | Required answer |
| --- | --- |
| Target query family | anna maria island vacation cost; how much does a trip to anna maria island cost (L0). do you need a car on anna maria island (L1). how to get to anna maria island (L2) |
| Searcher intent | Informational: budget planning before choosing dates and a stay (L0); deciding whether to rent a car for an island trip (L1); working out how to reach the island by air, road or ferry (L2) |
| Current Seascape URL | https://seascape-vacations.com/guides/anna-maria-island-vacation-cost/ (L0); https://seascape-vacations.com/guides/do-you-need-a-car-anna-maria-island/ (L1); https://seascape-vacations.com/guides/how-to-get-to-anna-maria-island/ (L2) |
| SERP observed date | 2026-10-24 |
| SERP stale after | 2026-11-23 |
| Current proof | 2026-10-24 OpenSEO SERP reads (US, en, depth 20): L0 ranks organic position 6 for "anna maria island vacation cost" and is not in the top 20 for "how much does a trip to anna maria island cost"; L1 ranks organic position 14 for "do you need a car on anna maria island" (monthly volume 30); L2: an OpenSEO SERP read on the same date (local OpenSEO report c7a1a49d-2b8e-4d90-9666-c66646126ab4, US, en, depth 20) found Seascape not in the top 20 for "how to get to anna maria island" |
| Top visible competitors | L0: expedia.com and travelocity.com package pages, tripadvisor.com hotel lists, wimdu.com, mikenormanrealty.com budget post. L1: annamaria.com, tripadvisor.com forum, amivacationrental.com, thecoconutrentals.com, florida-dreams.com, annamarialifevacationrentals.com, plus Facebook and Reddit threads. L2: not itemized; competitors for "how to get to anna maria island" were not listed from the saved read |
| Competitor angle | From SERP titles and snippets only. L0: package and hotel listing pages (expedia, travelocity, tripadvisor) and one budget-planning post (mikenormanrealty). L1: titles lead with the no-car answer ("5 Ways to Get Around on Anna Maria Island Without a Car", "How To Get Around Anna Maria Island Without a Car", "Anna Maria Island: Car or Golf Cart? What's the Best Option?"); two community threads and a TripAdvisor forum topic also rank. L2: no competitor titles or snippets were itemized for this query, so no competitor angle is claimed |
| Visual/format gap | Not assessed: the SERP reads give titles and snippets, not page layouts; no format claim is made for any of the three moves |
| Seascape gap | L2: the page is not in the top 20 for the query, so a ranking gap exists, but this move changes no copy, title or markup that search reads. No change needed for the layout moves; any content change belongs to a later copy-lane brief |
| Search fit | L0 already matches the budget-planning intent and ranks on page one. L1 already answers the no-car question in its title and first paragraph; it ranks organic 14 with title and snippet matching the query. L2: the title already names the query ("How to Get to Anna Maria Island"); the page is not in the top 20, and a copy ticket (E1) owns any change |
| Local/GBP proof | Not applicable: layout-only moves with no local-pack or Google Business change |
| AEO/readback note | Not applicable to these moves: L0 answer paragraph and FAQ JSON-LD, and L1 Article, BreadcrumbList and LocalBusiness JSON-LD, and L2 Article, BreadcrumbList, FAQPage and LocalBusiness JSON-LD, are byte-identical; recheck positions after the 2026-11-23 stale date |
| Recommendation | Keep title, meta, H1 and JSON-LD unchanged on all three pages; ship the layout moves |
| Attack status | completed |
| Query variants inspected | anna maria island vacation cost; how much does a trip to anna maria island cost; do you need a car on anna maria island |
| SERP source | OpenSEO local get_serp_results (DataForSEO), observed 2026-10-24 |
| Competitor URLs inspected | https://www.expedia.com/Anna-Maria-Island.d553248622847118534.Destination-Travel-Guides; https://www.mikenormanrealty.com/island-info/things-to-do/how-to-plan-your-trip-to-anna-maria-island-on-a-budget/; https://www.annamaria.com/news-and-blog/5-ways-to-get-around-on-anna-maria-island-without-a-car/; https://www.florida-dreams.com/how-to-get-around-anna-maria-island-without-a-car/ |
| Content gap and Seascape answer | L0: competitors lead with package prices; Seascape's answer is pricing the complete checkout total, unchanged here. L1: the ranking titles quoted above frame the question as car versus no car (one names golf carts); Seascape's title asks the same question and its opening answers it, unchanged here. L2: Seascape's title and opening already name the query; no competitor content is claimed, unchanged here |
| Design/format strategy | Shared planning frame; same table and steps, no new figure in L0 or L1 |
| Seascape proof available | Current source, the 2026-10-24 SERP reads (L2: the saved report named above), and the main-versus-head build diffs |
| Tools/plugins used | OpenSEO local MCP (SERP), node build diff, Playwright visual and floors specs |
| Decision and reason | Hold search-facing output unchanged: L0 and L1 already rank and L2 is not in the top 20 for its query; all three are technical layout moves, and L2's ranking is left to the copy ticket |

## L1 swaps (car guide)

`src/guides/do-you-need-a-car-anna-maria-island.html` moved onto the frame. Title,
meta description, keywords, canonical, og/twitter text and all three
`application/ld+json` blocks (Article, BreadcrumbList, LocalBusiness) are
byte-identical to main. Body words are unchanged except for these swaps, each
forced by the frame:

1. JSON-LD: the page carries its own blocks verbatim in a new optional front-matter
   list `guideJsonLd`; the layout emits them instead of its Article/BreadcrumbList/FAQ
   shape. The cost guide does not set it and its built output is byte-identical to L0.
2. Author: the legacy page is authored by the organization and had no "Reviewed by"
   card. The layout renders the card only when `guideAuthor.bio` is set; the car guide
   sets only `guideAuthor.name` (used for `<meta name="author">`, unchanged).
3. Email popup: legacy included `partials/email-popup.njk`; the optional
   `guideEmailPopup: true` keeps it (hidden until triggered, same markup).
4. Breadcrumb: separator glyph `›` becomes `>` and the Home link `https://seascape-vacations.com` becomes `/` (frame breadcrumb; same destination); labels unchanged.
5. Rail: "In this guide" plus the seven step headings repeated as rail labels, and
   `01` to `07` step numbers (frame structure; cost guide does the same).
6. "Travel Guide" tag becomes the `pg-label` kicker; "Updated March 2026 • 8 min read"
   becomes the sub line under the H1. Words unchanged.
7. The "TL;DR Quick Summary" box and the two opening paragraphs become the opening
   column (`guideIntro`); words unchanged.
8. Transport table: its `h3` "Getting Around AMI: Transport Options" becomes the `h2`
   of step 07 and the table uses the sheet's `.cost-table`; cell text unchanged. The
   inline styles are gone. Order is unchanged (still after the FAQ).
9. FAQ `h3`s stay `h3` inside step 06.
10. CTA block ("Ready to Experience AMI's Beautiful Beaches?", "Book a private-pool
    home near the beaches. Compare the complete checkout total across channels before
    booking.", button "Book Direct & Save", href `/properties/`,
    `guide_book_direct_click`, slug `do-you-need-a-car-anna-maria-island`) is replaced
    by the shared booking kit carrying those same words as its title, copy and primary
    button. The kit also brings its standard copy (Book Direct Math label,
    direct-booking list sign-up and its status messages, the hidden SAVE50 returning-guest
    module, Check Direct Availability and Browse Homes buttons), exactly as on the cost
    guide. This is new on-page text and links to the booking route; it is not guide copy
    written for this page.
11. Sticky bar: words unchanged ("Book Direct & Compare Totals", "Browse Our Homes →",
    `/properties/`); it now carries `guide_book_direct_click` tracking (legacy had none).
12. "Related Guides" heading becomes the frame's "Keep Reading"; the three cards keep
    title, blurb and href. Card thumbnails (and their alt text) are dropped; the frame
    has no image slot.
13. "Related Vacation Rentals" list becomes the kit's "Relevant Stays" module with
    label "Related Vacation Rentals", same four titles and hrefs; the links gain
    `guide_stay_click` tracking.
14. "Also worth reading: Holmes Beach area guide." becomes the kit's repeat-link row
    (label "Also worth reading", the colon and period dropped, same link).
15. Hero image (`/images/ami-hero.webp`, with its alt text) is dropped; the frame has no
    hero slot. The OG image is unchanged.
16. Fonts: `guideLocalFonts: true` replaces the Google Fonts links; the legacy inline
    `<style>` blocks (page, `.ai-tldr`, and related-stays blocks) are removed.
17. Analytics: the legacy inline gtag snippet in the head is replaced by the site's
    shared `analytics-ga4.njk` partial the frame already includes.

All internal hrefs on the legacy page are still present (list below in the PR
description); the booking kit and sticky bar add more.

Content-gate note (not a page swap): the brief's required internal links changed
from `/guides/booking-direct-vacation-rentals/` to
`/guides/best-time-visit-anna-maria-island/`. The car guide never linked the
booking-direct guide and adding it would be new copy; the two links now required
are ones both the cost guide and the car guide already carry.

Content-gate note for L2 (not a page swap): the how-to-get-to guide never linked
`/stays/anna-maria-island-vacation-rentals/` and adding it would be new copy, so that
required link became `/properties/`, which all three guides carry through the booking
kit and sticky bar. `/guides/best-time-visit-anna-maria-island/` is carried by all
three pages' own copy.

## L2 swaps (how-to-get-to guide)

`src/guides/how-to-get-to-anna-maria-island.html` moved onto the frame. Title, meta
description, keywords, canonical, og/twitter text and all four `application/ld+json`
blocks (Article, BreadcrumbList, FAQPage, LocalBusiness) are byte-identical to main
(carried in `guideJsonLd`, as on the car guide). No fact, number or wording was
corrected, including the distance figures that differ between the airport cards, the
FAQ and the table; copy ticket E1 reconciles them. Body words are unchanged except for
these swaps, each forced by the frame:

1. JSON-LD: carried verbatim in `guideJsonLd` (swap 1 of L1). The layout needs no
   change.
2. Author, email popup, fonts, analytics: as L1 swaps 2, 3, 16 and 17 (organization
   author with no "Reviewed by" card, `guideEmailPopup: true`, `guideLocalFonts: true`,
   legacy `<style>` blocks and inline gtag removed, shared analytics partial).
3. Breadcrumb: separator `›` becomes `>` (frame breadcrumb); labels and links unchanged.
4. Rail: "In this guide" plus nine rail labels repeating the nine step headings, and
   step numbers `01` to `09`. The legacy page had eight `h2`s and a table `h3`; the
   table `h3` "Getting to AMI from Major Airports" becomes the `h2` of step 09.
5. "Travel Guide" badge becomes the `pg-label` kicker; "Updated March 2026" becomes the
   sub line under the H1. The H1 loses its `<br>` after "How to Get to" (text unchanged).
6. The hero line ("Nearest airports, driving routes, ferry options, and everything you
   need to plan your trip.") and the article's first paragraph become the opening column
   (`guideIntro`); words unchanged. The hero's gradient banner and badge are gone.
7. Airport cards (SRQ, TPA, PIE) and the transport cards (four drive origins, four
   on-island options) become rows in the sheet's `.budget-card` layout: the code or
   card heading is the `h3`, the rest follows. Card text is unchanged. The cards'
   `Recommended`, `Most Popular` and `Budget Option` badges become bold lines under each
   airport (the leading check mark is kept). The icons that sat in the card headings
   and tip headings are dropped; the frame has no icon slot in headings.
8. Tip boxes ("Airport Selection Tip", "Do You Need a Car?") use `.savings-card`
   (heading and paragraph, no list); gold gradient dropped. Words unchanged.
9. Bulleted lists (bridges, trolley facts, bike rentals, rideshare tips, money-saving
   tips) use `.pg-facts`. Wording unchanged.
10. "Plan Your Stay" link list becomes `.related-card` rows (same five titles and
    hrefs) so each link meets the 44px tap floor; list bullets are gone.
11. Airport table: its inline styles, row banding and scroll wrapper are gone; it uses
    `.cost-table route-table` as step 09 (five columns on desktop, no horizontal scroll at
    360px). Cell text and order unchanged. Below 900px `.route-table` hides the Code
    column, which repeats the code already in each airport name, and widens the name
    column so names wrap only at hyphens and spaces.
12. Order: the table, which sat after the Keep Reading block, is now step 09 and
    precedes the booking kit and Keep Reading. The trailing paragraph "Explore SRQ
    airport transfer guide for more info." moves with it to the end of step 09, words
    unchanged.
13. CTA block ("Book Your AMI Vacation", "Compare the complete checkout total across
    channels before booking.", button "Browse All Properties →", `/properties/`,
    `guide_book_direct_click`, slug `how-to-get-to-anna-maria-island`) is replaced by the
    shared booking kit carrying those words as title, copy and primary button. The kit
    also brings its standard copy, forms and buttons (as L1 swap 10).
14. Sticky bar: words unchanged; it now carries `guide_book_direct_click` tracking
    (legacy had none).
15. "Related Vacation Rentals" list becomes the kit's "Relevant Stays" module with the
    same label, three titles and hrefs; the links gain `guide_stay_click` tracking.
16. "Keep Reading" list becomes the frame's Keep Reading cards: the same two titles and
    hrefs; the cards have no blurb because the legacy list had none.
17. The "Planning your beach base?" callout becomes the kit's repeat-link row: label
    "Planning your beach base?" and link "Anna Maria Island vs Longboat Key comparison"
    (same href). The words "Check out our" and "to see which island fits your trip."
    are dropped.

All internal hrefs on the legacy page are still present.
