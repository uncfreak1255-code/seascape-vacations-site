# Design packet — vacation cost guide, planning-guide mock (2026-10-02)

## Intake

- Route: `/guides/anna-maria-island-vacation-cost/` (live, read with page scripts off).
- Authority: Sawyer's "yes" on 2026-10-02 covers this mock only. No source, template, CSS, `DESIGN.md`, copy or live change.
- Law: `DESIGN.md` "Planning guides (October 2026)" (merged in PR #658, `40f118c8`).
- Audience and job: a family pricing an Anna Maria Island week; the page must give the total quickly, show how it is built, and hand off to homes.
- Mock: `https://claude.ai/artifact/WaNR4Q62CistRb5wrAGvSS` — three boards: Desktop (1440), Phone opening and steps (393), Phone booking box to footer (393).
- Surface caveat: the canvas has no attached design system; Waterline colours, type and spacing were applied by value. `DESIGN.md` names the contract as "a mock built in the synced Claude Design project". Sawyer must accept this surface explicitly, or the mock is rebuilt in that project before any conversion.
- Launcher note: the donor scan classified the task as a general page, not a guide family.
- Traffic for this guide was not checked. No measurement shows this redesign lifts bookings; it is a taste and brand bet.

## Critique of the current route — `Needs another pass` (confidence: high)

- Opening is the legacy banner, pill and boxed answer the planning-guide rule retires.
- The answer and the tier table are far apart; nothing shows the three totals at a glance.
- At 375 and 360 wide the table needs an 18px / 33px sideways swipe inside its box, with no hint.
- Three sections carry the same visual weight; no sense of order.
- Keep: the words, the table figures, the booking box position, header, footer and sticky bar.

## Direction

One direction, the approved planning-guide frame (approved on the weather mock). No alternatives drawn: the frame is already law.

## What the mock does

- Opening: label and three-line serif title left; the direct answer as a serif lede right ("Direct answer:" kept inline, italic). Stacked on phone.
- Instrument: "Trip Tier / Typical Total" — three ink range bars on one $2,000 to $10,000 scale, a dotted tail for the "+" tier. Every figure is from the guide's own table.
- "Reviewed by Sawyer Beckett" sits as a note under the figure (placement is Sawyer's choice).
- Steps 01, 02, 03 with clay numerals; desktop "In this guide" rail stays in view.
- Table: all four columns visible at 360, 375 and 393; no swipe.
- Booking box, header, footer and sticky bar drawn exactly as they render live.
- "Keep Reading" as ruled rows. No closing band on this guide. "Your dates" marker not applicable here.

## Critique of the mock — `Approved with edge` (confidence: medium-high)

Works: the answer and the three totals now read in one screen; numerals give the page an order; table fits a phone; restraint holds (ink marks, clay only on numerals).

Edges, none changed in the mock:

1. Booking box is the odd one out: legacy gradient, four 11px labels (below the 12px floor), and the filled button's text is nearly unreadable on live. The rule says restyling it is its own decision.
2. Figure and table say "$9,500+"; the answer and FAQ data say "$9,000 or more". A copy mismatch on the live page that the figure makes more visible. Copy was not changed.
   The 11px labels are more than an edge for a build: the Floors rule holds a converted guide to 12px across the whole page, so a conversion needs a separate yes to raise those four labels. Not asked for now.
3. Surface caveat above. The published canvas was not opened; proof covers the board markup rendered locally, so a font fallback on the canvas would go unseen.
5. `docs/status/content-decay-patrol.md` has this guide on watch for ageing rate figures. The new figure makes those numbers the headline; refresh them before or with a conversion.
6. Readback window: this guide is not in the booking-box brief's measured set; other open windows were not exhaustively checked.
4. Phone is two boards because of an 8000px board limit; it is one page.

Preserve in a build: the lede beside the title, the single-scale bars, clay numerals, ruled rows.

## Words the mock adds

"In this guide" and the numerals 01, 02, 03. The rail repeats the three section headings. Nothing removed (two-way text check at 1440 and 393: missing from mock = none).

## Proof (local Playwright, board markup rendered on its own)

| Check | Desktop 1440 / 1280 | Phone 393 / 375 / 360 |
|---|---|---|
| Sideways scroll | none | none |
| Smallest text | 11px, only the four legacy booking-box labels | 12px upper board; 11px same four labels lower board |
| Tap targets under 44px | none | none |
| Table | fits its column | fits, four columns |
| Title | three lines | three lines |

Screenshots: `out/mock-Main-1440.png`, `out/mock-Phone-393.png`, `out/mock-PhoneLower-393.png`. The canvas itself was not opened or screenshotted.

## Implementation brief (only after a separate yes)

Copy the approved mock to `docs/mockups/`; add the planning-guide frame to this guide only; prove with a text diff, `lint:content`, `npm test`, `verify:release`, `test:visual`, and widen `tests/visual/design-floors.spec.js` to `body.planning-guide`. Not weather, airport or shelling guides before their 2026-10-25 readback.

## Approval gate

Sawyer: approve or adjust the mock; accept or reject the canvas surface. A live conversion is its own approval.
