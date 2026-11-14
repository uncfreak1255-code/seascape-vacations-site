# Catalog cards and phone surfaces

Moved out of `DESIGN.md` (which links here) when the phone rules were added. `DESIGN.md` still governs everything else.

## Catalog card (October 2026)

A catalog card carries no photo-number badge. Its title is Instrument Serif, the one reason to choose sits in open space under it, the ink "Check dates" button is the only strong control, and the details link stays at its quiet 12px secondary weight. The title is 40px on wider screens and 26px on phones, matching the homepage cards.

## Airbnb rating on home cards (Sawyer, November 7 2026)

- **Value:** each home's real Airbnb rating, one decimal with standard rounding and no floor (4.96 shows 5.0, 4.88 shows 4.9). Values come from the dated snapshot in `src/_data/airbnbRatings.json`; only the rounded value reaches the page. No structured-data rating.
- **Under 3 reviews:** the card shows `★ New` until the home reaches 3 Airbnb reviews, then switches to the rating.
- **Layout:** Airbnb's own card pattern, `★ 5.0 (44)` at the right of the name row in Poppins 500 15px ink. On desktop homepage postcards it sits on its own line under the name at 13px.
- **Label:** each card list carries one "Ratings from Airbnb" line in muted 13px; the cards themselves do not repeat it.
- **Screen readers:** the visible line is hidden; a sentence after the name says "Rated 5.0 out of 5 from 44 Airbnb reviews" (or "New home, not yet rated on Airbnb").

The markup is `src/_includes/partials/card-rating.njk`, the logic `scripts/enforcement/airbnb-rating.js`, the CSS `src/css/trip-sheet-cards.css`.

## Phones, 700px and narrower (Sawyer, November 7 2026)

- **Canvas:** white `#FFFFFF`, so the photos carry the color. Cream paper `#F6F3EB` stays on wider screens.
- **Corners:** photos 16px; panels such as the email signup and the catalog help band 20px; buttons and form fields 12px; small toggles (Compare, chips, the header phone button) are pills.
- **Depth:** the search pill, Compare toggles and the header phone button sit on a soft shadow ring instead of an outline. Dividers between sections and list items stay plain lines.
- **Fields:** 16px text so iPhone does not zoom on focus.
- **Photos:** a 1px neutral inner outline (`oklch(0 0 0 / .1)`) so light photos keep their edge.
- **Press:** home and catalog cards press to `scale(0.98)` in 160ms; off under reduced motion.

These rules live in the phone blocks at the end of `src/css/trip-sheet.css`. They follow the surface guidance in the repo's design skills (`.claude/skills/better-ui/surfaces.md`, `.claude/skills/mobile-native`).
