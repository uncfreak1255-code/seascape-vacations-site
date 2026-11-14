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
