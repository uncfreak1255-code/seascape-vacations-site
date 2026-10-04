# Brief: Vacation Cost Guide Planning-Guide Frame

- lifecycle: completed
- completion: source PR #665 merged as `68d624bb` (2026-10-03).
  Implementation scope is complete; the readback window below remains a
  measurement contract, not evidence of deployment or lift.

Design-only conversion of one guide to
the planning-guide frame in `DESIGN.md` ("Planning guides (October 2026)").
The words on the page are unchanged except for five small phrase swaps the
content gate requires once the file is touched (internal planning wording in
the meta description, one paragraph, two booking-kit titles and the sticky
bar: "booking path", "trip shape", "right stay", "cleaner"), plus the added
rail label "In this guide" and the numerals 01, 02 and 03. The booking kit's
filled button keeps paper text; the frame's link colour rule no longer
overrides it.

## Content Gate Inputs

- persona: a family pricing an Anna Maria Island week who wants the realistic total quickly, how it is built, and a route to homes that fit the number.
- primary keyword: Anna Maria Island vacation cost
- secondary keywords: how much does a vacation to Anna Maria Island cost, Anna Maria Island trip budget
- audience pattern: the reader wants the answer in the first screen, the three tiers at a glance, and the full table for detail; the booking channel decision follows.
- proof source: the guide's own tier table and `docs/mockups/2026-10-02-vacation-cost-planning-guide/` (approved mock, Sawyer 2026-10-02); no new claims.
- required internal links: /stays/anna-maria-island-vacation-rentals/, /guides/booking-direct-vacation-rentals/
- CTA target: the existing booking kit on the guide (`guide_book_direct_click` tracking unchanged)
- anti-claims: no new rate figures, no changed totals, no amenity or capacity claims, no review counts, no occupancy or savings percentages beyond the existing copy.

## Why This Batch

- The guide used the legacy banner, pill badge and boxed answer that the planning-guide rule retires, and its answer sat far from the tier table.
- At 375 and 360 wide the tier table needed a sideways swipe with no hint.
- Waits: the weather, airport and shelling guides until their 2026-10-25 readback; the booking-box restyle (its own decision); the "$9,500+" versus "$9,000 or more" copy mismatch and the March 2026 rate refresh flagged by `docs/status/content-decay-patrol.md`.

## Experiment And Readback Contract

- hypothesis: a taste and brand bet; the frame makes the answer and the three totals readable in one screen without changing the words. No ranking or booking lift is claimed.
- primary event: guide_book_direct_click on this route
- guardrail event: guide_book_direct_click does not fall below its current 30-day count
- entry criteria: mock approved by Sawyer (2026-10-02); DESIGN.md planning-guide rule merged (PR #658)
- readback window: 30 days from deploy
- decision rule: keep unless the guardrail event falls; the frame then returns to the mock, not to the legacy banner

## Gate 0 Search And Attack Receipt

This block satisfies the search-decision brief gate. The release is a
presentation change to one existing guide, not a search expansion: the route,
canonical, title, headings and JSON-LD are unchanged and the five phrase swaps
carry no new claim or keyword.

| Field | Required answer |
| --- | --- |
| Target query family | Anna Maria Island vacation cost / how much does a vacation to Anna Maria Island cost |
| Searcher intent | A family pricing a week on the island wants the realistic total, how it is built, and homes that fit the number. |
| Current Seascape URL | https://seascape-vacations.com/guides/anna-maria-island-vacation-cost/ |
| SERP observed date | 2026-10-02 |
| SERP stale after | 2026-10-09 |
| Current proof | On 2026-10-02 a public web search for the query returned the Seascape guide on the first page of results alongside Travelocity, Expedia, Kayak, Holidu, HomeToGo and Wimdu package and listing pages. Qualitative returned results, not a controlled organic position. |
| Top visible competitors | Travelocity and Expedia destination package pages, Kayak packages, Holidu, HomeToGo and Wimdu rental aggregators. No other editorial budget guide was returned. |
| Competitor angle | Aggregators lead with "from $X" package or nightly prices and inventory; none shows a whole-trip total by season and stay tier. |
| Visual/format gap | The live Seascape guide buried its answer under a legacy banner and boxed answer, and its tier table needed a sideways swipe at 360 and 375 wide; the three totals were never visible at a glance. |
| Seascape gap | The answer and the three tier totals sit far apart on the live page; the booking-kit button text was unreadable; no competitor shows trip totals, so the gap is presentation, not content. |
| Search fit | Preserve the route, title, description intent, headings and JSON-LD; the figure and rail add no new query targets and change no internal links. |
| Local/GBP proof | N/A for this release: it changes no business profile, address, phone or local fact. |
| AEO/readback note | N/A for this release: no discovery JSON, property fact or citation claim changes; the figure repeats the table's own tiers and totals. |
| Recommendation | improve: convert the existing guide to the planning-guide frame; no new pages |
| Attack status | none found after named checks |
| Query variants inspected | how much does a vacation to Anna Maria Island cost |
| SERP source | Public web search for the named query on 2026-10-02; returned results read for angle and format only. |
| Competitor URLs inspected | Source check: the live guide and its built head. SERP check: the named query on 2026-10-02. Competitor-page check: https://www.travelocity.com/Anna-Maria-Island.d553248622847118534.Destination-Travel-Guides and https://www.holidu.com/vacation-rentals/usa/anna-maria-island as returned on 2026-10-02; both lead with "from $" prices and inventory, no trip-total guide. |
| Content gap and Seascape answer | No copy gap. The guide already holds the only whole-trip total by season and tier in the returned set; the answer is to make that total and the three tiers readable in one screen. |
| Design/format strategy | Apply the `DESIGN.md` planning-guide frame: answer beside the title, trip-tier figure from the table, numbered sections with a rail, a table that fits phones; no new component styles. |
| Seascape proof available | The guide's own tier table (March 2026 rate checks), the approved mock in `docs/mockups/2026-10-02-vacation-cost-planning-guide/`, the design floors spec on the route. |
| Tools/plugins used | Repository source, Playwright, node:test, one public web search. No paid service or plugin installation. |
| Decision and reason | Ship the presentation change: the guide already ranks for the query and the only gap found is how the answer reads. |

## Cluster In Scope

- canonical winner URL(s): /guides/anna-maria-island-vacation-cost/
- feeder pages: none changed
- aliases or retired URLs: none
- money destination: /stays/anna-maria-island-vacation-rentals/
- active lane: direct-book stay intent

## Source And Proof Constraints

- property truth needed: none
- owner proof asset needed: none
- claims that are off-limits: any figure not already on the page
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: unchanged from the live guide

## Page Builder Tasks

- source files likely to change: `src/guides/anna-maria-island-vacation-cost.html`, `tests/visual/design-floors.spec.js`
- redirect or schema work: none; JSON-LD byte-identical
- internal-link or CTA work: none; hrefs and tracking attributes unchanged
- money CTA and downstream tracking event to verify: guide_book_direct_click

## Voice Editor Checklist

- tone risks: the five phrase swaps must read as plain guest language, not softer sales copy
- generic or mechanical patterns to kill: "booking path", "trip shape", "right stay", "cleaner" (gate-banned internal wording)
- proof or specificity checks: two-way text diff against the live page shows nothing missing beyond the five swaps, with only the rail label and numerals added

## Release Gate Checklist

- routes to smoke test: /guides/anna-maria-island-vacation-cost/
- commands to run: `npm run build`, `npm run lint:content`, `npm test`, `npm run verify:release`, `npm run test:visual`, the floors spec on `guide-ami-vacation-cost`
- regression risks to watch: sticky bar height on narrow phones (existing wrap), booking kit width inside the text column

## Done When

- the route renders the approved mock at desktop and phone, every floor passes at 1440, 1280, 393, 375 and 360, the booking button text is readable, and the text diff shows only the five swaps, the figure legend (the table's own tier names and totals), "In this guide" and 01 to 03

## Post-Reread Outcome

- reread window used: open until 30 days after deploy
- decision taken: pending

## Not In Scope

- copy changes beyond the five gate swaps, the booking-box restyle, the other guides, figure axis labels beyond the mock
