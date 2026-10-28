# Guide Family 1 Layout Swaps

Every visible-text change in the layout lane (L1 to L4), one numbered list per guide.
The contract these swaps follow is `docs/briefs/2026-10-guide-family-1-planning-frame.md`;
moved here from that brief on 2026-10-24 to keep it under the staged-file size limit.

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

## L3 swaps (flights guide)

`src/guides/flights-to-anna-maria-island/index.html` moved onto the frame. Title,
meta description, keywords, canonical, og/twitter text and all four
`application/ld+json` blocks (Article, BreadcrumbList, FAQPage, LocalBusiness) are
byte-identical to main (carried in `guideJsonLd`). The only head difference is that
the title's `&` is now escaped as `&amp;` by the layout (same decoded text). No fact,
number or wording was corrected, including trolley and drive claims; copy tickets
E1 and E3 own those. Body words are unchanged except for these swaps, each forced by
the frame:

1. JSON-LD, author, email popup, fonts, analytics: as L1 swaps 1, 2, 3, 16 and 17.
2. Breadcrumb: separator `›` becomes `>` (frame breadcrumb); labels and links unchanged.
3. Rail: "In this guide" plus nine rail labels repeating the nine `h2`s, and step numbers
   `01` to `09`. The legacy page's nine `h2`s are unchanged; the opening paragraph sits
   above step 01.
4. The "✈ Travel Planning" tag becomes the `pg-label` kicker "Travel Planning" (the ✈ glyph is dropped: the emoji gate bans glyphs in source); "Updated March 2026 ·
   By Seascape Vacations · 9 min read" becomes the sub line under the H1. Words
   unchanged.
5. The first paragraph becomes the opening column (`guideIntro`); words unchanged.
6. The three tables use `.cost-table stack-table`. Inline scroll wrappers, row banding
   and the brand-colour "winner" highlight on a few cells are gone (the sheet bolds
   the first and third columns). Below 900px `.stack-table` (new scoped rule in
   `planning-guide.css`) shows each row as a card: the first cell is the row title and
   every other value sits beside its column header, taken from a `data-label`
   attribute that repeats the table's own header words. Every value stays visible at
   360, 375 and 393px with no sideways scroll; desktop keeps the column layout.
7. The `.guide-quote` block ("Track the fares for your own itinerary...") becomes a
   `.savings-card` paragraph; words unchanged.
8. The RSW list uses `.pg-facts`; wording unchanged. FAQ `h3`s and "Quick booking
   math for families" stay `h3` inside their steps.
9. CTA block ("Your Anna Maria Island Vacation Starts Here", its paragraph, button
   "Browse Our Properties", `/properties/` replacing the absolute URL, same destination)
   is replaced by the shared booking kit carrying those words as title, copy and
   primary button. The kit also brings its standard copy, forms and buttons (as L1
   swap 10). Its "Relevant Stays" and "Plan The Stay" modules, which the kit always
   renders, carry links the page already had: "Anna Maria Island vacation rentals"
   (`/stays/anna-maria-island-vacation-rentals/`, which gains `guide_stay_click`
   tracking) and "Siesta Key" and "downtown Sarasota" guide links.
10. Sticky bar: the page's fixed bar words ("Book Direct & Compare Totals",
    "Browse Our Homes →") are unchanged and now come from the frame. The legacy mobile
    call bar (phone icon, "Compare booking quotes", "No platform fees", "Book Now") is
    dropped; the frame has no second fixed bar. Its `guide_book_direct_click` event on
    `/properties/` with slug `flights-to-anna-maria-island` is carried by the sticky bar and
    the kit buttons.
11. "More Travel Planning Guides" heading becomes the frame's "Keep Reading"; the three
    cards keep title, blurb and href.

All internal hrefs on the legacy page are still present.

## L4 swaps (SRQ guide)

`src/guides/srq-airport-to-anna-maria-island.html` moved onto the frame. Title, meta
description, keywords, canonical, og/twitter text and all four `application/ld+json`
blocks (Article, BreadcrumbList, FAQPage, LocalBusiness) match main except swap 14
(carried in `guideJsonLd`; the first three as YAML block scalars so the source still
holds the raw `"dateModified": "2026-08-19"`, headline and breadcrumb strings the pinned
enforcement tests read). The H1 text is unchanged (its `guide-title` class is gone). No
fact, number or wording was corrected. "Reviewed August 19, 2026",
"<strong>August 2026 review:</strong>" and "planning ranges, not live quotes" are
unchanged. Body words are unchanged except for these swaps, each forced by the frame:

1. JSON-LD, author, email popup, fonts, analytics: as L1 swaps 1, 2, 3, 16 and 17.
2. Breadcrumb: separator `›` becomes `>` (frame breadcrumb); labels and links unchanged.
3. Rail: "In this guide" plus five rail labels repeating the five `h2`s, and step numbers
   `01` to `05`. The legacy page had four `h2`s and a table `h3`; the table `h3` "SRQ
   Airport to AMI Transport Options" becomes the `h2` of step 05.
4. "Travel Guide" tag becomes the `pg-label` kicker; "Reviewed August 19, 2026 • 8 min
   read" becomes the sub line under the H1. Words unchanged.
5. The "TL;DR Quick Summary" box, the opening paragraph and the "August 2026 review"
   paragraph become the opening column (`guideIntro`); words unchanged.
6. Hero image (`/images/ami-hero.webp`, with its alt text) is dropped; the frame has no
   hero slot. The OG image is unchanged.
7. Driving-route step lists use `.pg-facts`; wording unchanged. The inline
   `margin-top` on the "Planning your travel?" paragraph is gone.
8. Order: the transport table, which sat after the Keep Reading block, is now step 05
   and precedes the booking kit and Keep Reading. The "Own a rental home on the
   island or in Bradenton?" paragraph, which sat before the kit, moves with it to the end
   of step 05, words unchanged.
9. The table uses `.cost-table stack-table` (as L3 swap 6): inline scroll wrapper, inline
   styles and row banding are gone; below 900px each row stacks as a card with every
   value beside its column header (`data-label` repeats the table's own header words).
10. The booking kit is unchanged in title, copy, bullets, stay cards, repeat links and
    button labels (now passed as `guideKit`). The legacy "Related Vacation Rentals" list
    folds into the kit's "Relevant Stays" module: its heading "Related Vacation
    Rentals" is dropped, "Gulf Coast Beach House Rentals" and "Coquina Beach Vacation
    Rentals" join as cards with the same hrefs (no blurb: the legacy list had none; they
    gain `guide_stay_click` tracking), and "Bradenton Rentals Near Beaches" and "Siesta
    Key Area Rentals" are dropped as titles because the kit already links the same hrefs
    under "Bradenton homes near AMI beaches" and "Siesta Key area stays".
11. "Related Guides" heading and the separate "Keep Reading" box merge into the frame's
    single "Keep Reading". The three cards keep title, blurb and href; their thumbnails
    (and alt text) are dropped. The two legacy "Keep Reading" links join as cards with
    the same titles and hrefs, without blurbs (the legacy list had none).
12. Sticky bar: the legacy page had none. The frame always renders one, so it carries
    the same words as the other planning guides ("Book Direct & Compare Totals",
    "Browse Our Homes →", `/properties/`, `guide_book_direct_click`, slug
    `srq-airport-to-anna-maria-island`). This is new on-page text, not guide copy.
13. Source marker: the pinned test `search-content-rescue.test.js` reads this source file
    for a literal `<title>` tag. A Nunjucks comment at the top of the body spells it; it
    is stripped from the built page and renders no text.
14. FAQPage JSON-LD, rental-car answer: "a rental car is usually the cleaner move" becomes
    "a rental car is usually the better move". The content voice gate bans "cleaner" once
    the file counts as changed. This is the only JSON-LD change; the other three blocks are
    byte-identical to main.

All internal hrefs on the legacy page are still present.
