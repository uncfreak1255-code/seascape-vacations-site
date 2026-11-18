# Old-design guide moves: swap lists

Swap lists for moves M2 and later of `docs/briefs/2026-11-old-design-guide-moves.md`.
M1 (family guide) is "L5 swaps" in `docs/plans/2026-10-23-guide-family-1-swaps.md`.
A text difference from main that is not listed here fails the move.

## L6 swaps (beaches, restaurants, fishing)

Sources: `src/guides/anna-maria-island-beaches.html`,
`src/guides/best-restaurants-anna-maria-island.html`,
`src/guides/fishing-guide-anna-maria-sarasota.html`. Brief:
`docs/briefs/2026-11-old-design-guide-moves.md` (M2). Each item applies to all
three pages unless it names one.

1. Breadcrumb, rail ("In this guide" plus the step headings and step numbers),
   tag as `pg-label` kicker, and "Updated March 2026 • N min read" becoming
   "N min read": as L5 swaps 1 to 3 in `docs/plans/2026-10-23-guide-family-1-swaps.md`.
2. The "TL;DR Quick Summary" label is removed and its sentence becomes the serif
   lede; the first body paragraph joins it in the opening column. Other words
   unchanged. Beaches keeps its closing "Updated March 2026 guide." on purpose:
   it is part of the sentence, and a date change belongs to a copy-lane brief.
3. The opening photograph and its alt text are dropped (type-led opening, the
   M1 image rule). The OG image is unchanged.
4. The closing comparison table ("AMI Beach Comparison", "Top AMI Restaurants by
   Category", "Fishing Options Comparison"): its `h3` becomes the `h2` of the
   last step, it uses `.cost-table`, and it now sits before the booking kit.
   Cell text unchanged. The two five-column tables (beaches, restaurants) add
   `stack-table` and `data-label` so phones stack each row.
5. CTA block: its title, sentence, button words and `/properties/` href move
   into the shared booking kit, as L5 swap 8. The title's heading level goes
   from `h3` to the kit's `h2`.
6. "Related Guides" becomes "Keep Reading": same links, titles and lines; the
   thumbnail images and their alt text are dropped. Beaches only: the family
   card's second sentence "Browse our family vacation rentals." leaves the card;
   its link (`/stays/family-vacation-rentals-anna-maria-island/`, words "family
   vacation rentals") moves to the kit's repeat-link row.
7. "Related Vacation Rentals" becomes the kit's stays module: same label, titles
   and hrefs; the links gain `guide_stay_click` tracking.
8. Inline reading links become the kit's repeat-link row under "Also worth
   reading", same links and link words. Dropped lead-in words: beaches "Planning
   your trip? See", "Explore … for more info." and "You might also want to
   read"; restaurants "Related:". Fishing has no such links and shows no row.
9. Beaches only: og/twitter title stays "Ultimate Guide to Anna Maria Island
   Beaches | Seascape Vacations" through `guideOgTitle`.
10. Sticky bar, fonts and analytics: as L5 swaps 12 and 13.

## L7 swaps (noise rules, Siesta Key beach, snowbirds)

Sources: `src/guides/anna-maria-island-noise-ordinance-guide.html`,
`src/guides/siesta-key-beach-guide.html`,
`src/guides/snowbirds-guide-extended-stays-florida.html`. Brief M3. Each item
applies to all three pages unless it names one.

1. Breadcrumb, rail, tag kicker, TL;DR label, opening photograph, CTA block,
   "Related Guides", "Related Vacation Rentals", sticky bar, fonts and
   analytics: as L6 swaps 1 to 3, 5 to 7 and 10. The date stamp removed is
   "Updated March 2026 •" (noise, Siesta Key) and "Updated September 2026 •"
   (snowbirds).
2. Closing table ("AMI Noise Ordinance Summary", "Siesta Key Beaches
   Compared", "Monthly Snowbird Budget Checklist"): as L6 swap 4. Snowbirds
   keeps its sentence above the table. No table has five columns.
3. No page has inline reading links, so no page shows the repeat-link row.
4. og/twitter title stays as it was through `guideOgTitle`: noise "Anna Maria
   Island Noise Ordinance Guide 2026 | Seascape Vacations"; snowbirds "The
   Snowbird's Guide to Extended Stays on Florida's Gulf Coast".

## L8 swaps (waterfront restaurants, Bradenton vs Tampa)

Sources: `src/guides/best-waterfront-restaurants-with-boat-dock.html`,
`src/guides/bradenton-vs-tampa-vacation-rentals.html`. Brief M4. Each item
applies to both pages unless it names one.

1. Breadcrumb, rail, tag kicker, opening photograph, CTA block, "Related
   Guides", "Related Vacation Rentals", sticky bar, fonts and analytics: as L6
   swaps 1 to 3, 5 to 7 and 10. The date stamp removed is "Updated March
   2026 •" on both pages.
2. Summary label: "TL;DR Quick Summary" (waterfront restaurants) and "Quick
   Answer" (Bradenton vs Tampa) are dropped; the text of each box becomes the
   first intro paragraph. The other paragraphs above the first heading follow
   it in the intro.
3. Waterfront restaurants closing table ("Waterfront Restaurants with Docks"):
   as L6 swap 4. It has five columns, so it uses `cost-table stack-table`.
4. Bradenton vs Tampa comparison table (four columns, inside step 02): same
   cells, restyled as `cost-table stack-table` so a phone shows each row with
   its column labels; its scroll wrapper is removed.
5. Bradenton vs Tampa step 05: the two "Choose ... If..." cards become two
   sub-headings with their lists; same words, no card boxes.
6. No page has inline reading links, so no page shows the repeat-link row.
7. og/twitter title of Bradenton vs Tampa stays "Bradenton vs Tampa Vacation
   Rentals 2026 | Seascape Vacations" through `guideOgTitle`.

## L9 swaps (waterfront restaurants pick cards)

Brief: `docs/briefs/2026-11-old-design-guide-moves.md` -> M5. Sawyer chose
variant C on 2026-11-16.

1. Restaurant headings lose their list number ("1." to "7."). Four headings
   lose their place in parentheses ("(Cortez)", "(Anna Maria City)",
   "(Longboat Key)"); the place moves to the label above the name.
2. Each card has a place label above the name. Where the old heading named no
   place, the label comes from the page's own text: "Bradenton" for the two
   Manatee River cards (the step's area) and "Longboat Key" for Mar Vista (its
   description says "north end of Longboat Key").
3. Five cards add a tag that repeats the first words of their docking note:
   "Docking: Plentiful", "Docking: Very limited", "Docking: Excellent" (twice)
   and "Docking: Very good".
4. The description and the docking note are two paragraphs in place of one
   paragraph with a line break. Same words.
5. Steps 01 to 03 no longer use the long-read list styles (`pg-prose`); the
   cards carry their own spacing. Not visible as a text change.
