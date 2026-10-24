# Legacy gold CTAs

Moved out of `DESIGN.md` on 2026-10-23 to keep that file under the staged-file size gate. `DESIGN.md` still names this file; the rules below are unchanged and remain visual law for the legacy routes.

The 51 pre-Waterline guide routes, the owner pages and the research pages ship bespoke styling, including a gold pill CTA (`#C9A962`). It rendered white-on-gold at 2.25:1 against a 4.5:1 requirement, on hit boxes as small as 40px, and it was the owner funnel's primary CTA as well as the guides'. That gold is retired. The replacement is chosen per surface by measured contrast, not by class:

- **Ink `#173D42` with white text** on cream, white and photos. Clears 10.14:1 against cream.
- **Citron `#D6EB85` with ink text** where we own the surface and it is dark enough: the two sticky CTA bars, the near-black owner hero (ink would be 1.51:1 there), and the generated owner band on the 27 landers, whose `#3D5C5D`-to-`#1A3A3C` gradient takes ink to 1.04:1. Citron clears 5.57:1 and 9.38:1 across that gradient.
- **Paper `#F6F3EB` with ink text and a 1px ink hairline** on the legacy teal bands (`.hero`, `.cta-section`, `.cta-shell`), which run from `#5F8A8B` to `#203F40`. Ink loses them entirely and citron only reaches 2.93:1 on the lightest stop, under the 3:1 a filled control needs against its own surface. Paper clears every stop at 3.45:1, and the hairline keeps a boundary on the one band light enough that the fill alone is 2.49:1. The owner lead form re-lightens to a cream card inside those bands, so it takes ink at 11:1 rather than paper at 1.04:1.

Do not substitute one of these for another by eye. Each was picked because the other two fail on that surface. Shape follows `--g-control-treatment` (default sliding-arrow-pill). The overrides live in `src/css/guest.css` and need `!important` because these pages carry the colours inline. The tracked owner CTA is selected by its `data-track-event` attribute rather than the generic `.btn` class, which 62 built pages use for something already correct. Gold survives as a non-clickable accent on borders, badges and card rules; only the buttons changed.
