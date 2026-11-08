# Catalog cards and phone surfaces

Moved out of `DESIGN.md` (which links here) when the phone rules were added. `DESIGN.md` still governs everything else.

## Catalog card (October 2026)

A catalog card carries no photo-number badge. Its title is Instrument Serif, the one reason to choose sits in open space under it, the ink "Check dates" button is the only strong control, and the details link stays at its quiet 12px secondary weight. The title is 40px on wider screens and 26px on phones, matching the homepage cards.

## Phones, 700px and narrower (Sawyer, November 7 2026)

- **Canvas:** white `#FFFFFF`, so the photos carry the color. Cream paper `#F6F3EB` stays on wider screens.
- **Corners:** photos 16px; panels such as the email signup and the catalog help band 20px; buttons and form fields 12px; small toggles (Compare, chips, the header phone button) are pills.
- **Depth:** the search pill, Compare toggles and the header phone button sit on a soft shadow ring instead of an outline. Dividers between sections and list items stay plain lines.
- **Fields:** 16px text so iPhone does not zoom on focus.
- **Photos:** a 1px neutral inner outline (`oklch(0 0 0 / .1)`) so light photos keep their edge.
- **Press:** home and catalog cards press to `scale(0.98)` in 160ms; off under reduced motion.

These rules live in the phone blocks at the end of `src/css/trip-sheet.css`. They follow the surface guidance in the repo's design skills (`.claude/skills/better-ui/surfaces.md`, `.claude/skills/mobile-native`).
