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
- required internal links: /stays/anna-maria-island-vacation-rentals/, /guides/booking-direct-vacation-rentals/
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

## Gate 0 Search And Attack Receipt

L0 moves page source into front matter and a layout, so the gate reads it as a
search-facing source edit. The rendered title, meta description, canonical, H1
and JSON-LD are unchanged (proof above). This receipt records the live search
check behind keeping them unchanged.

| Field | Required answer |
| --- | --- |
| Target query family | anna maria island vacation cost; how much does a trip to anna maria island cost |
| Searcher intent | Informational budget planning before choosing dates and a stay |
| Current Seascape URL | https://seascape-vacations.com/guides/anna-maria-island-vacation-cost/ |
| SERP observed date | 2026-10-24 |
| SERP stale after | 2026-11-23 |
| Current proof | Seascape ranks organic position 6 for "anna maria island vacation cost" in the 2026-10-24 OpenSEO SERP read (US, en, depth 20); not in the top 20 for "how much does a trip to anna maria island cost" |
| Top visible competitors | expedia.com and travelocity.com package pages, tripadvisor.com hotel lists, wimdu.com, mikenormanrealty.com budget post |
| Competitor angle | From SERP titles and snippets only: package and hotel listing pages (expedia, travelocity, tripadvisor) and one budget-planning post (mikenormanrealty) |
| Visual/format gap | Not assessed: the SERP read gives titles and snippets, not page layouts; no format claim is made for this move |
| Seascape gap | No change needed for the layout move; any content change belongs to a later copy-lane brief |
| Search fit | Current page already matches the budget-planning intent and ranks on page one |
| Local/GBP proof | Not applicable: a layout-only move with no local-pack or Google Business change |
| AEO/readback note | Not applicable to this move: answer paragraph and FAQ JSON-LD are byte-identical; recheck position after the 2026-11-23 stale date |
| Recommendation | Keep title, meta, H1 and JSON-LD unchanged; ship the layout move |
| Attack status | completed |
| Query variants inspected | anna maria island vacation cost; how much does a trip to anna maria island cost |
| SERP source | OpenSEO local get_serp_results (DataForSEO), observed 2026-10-24 |
| Competitor URLs inspected | https://www.expedia.com/Anna-Maria-Island.d553248622847118534.Destination-Travel-Guides; https://www.mikenormanrealty.com/island-info/things-to-do/how-to-plan-your-trip-to-anna-maria-island-on-a-budget/ |
| Content gap and Seascape answer | Competitors lead with package prices; Seascape's answer is pricing the complete checkout total, unchanged here |
| Design/format strategy | Shared planning frame; same table and steps, no new figure in L0 |
| Seascape proof available | Current source, the 2026-10-24 SERP read, and the main-versus-head build diff |
| Tools/plugins used | OpenSEO local MCP (SERP), node build diff, Playwright visual and floors specs |
| Decision and reason | Hold search-facing output unchanged: the page already ranks on page one, and L0 is a technical layout move |
