# Hover motion: header nav and guides index

Desktop hover feedback for the guest header nav and the guides index
(`/guides/`), added November 2026. It follows the motion rules in `DESIGN.md`
(Guest journey) and the scales in `docs/design/scales-states-forms.md`.

## Shared rules

- Hover lives only inside `@media (hover: hover) and (pointer: fine)`, so taps
  on phones and tablets never trigger it.
- Color, border and underline-color changes run 200ms `ease`. Transforms run
  200ms `cubic-bezier(.23,1,.32,1)`. Each transition names its properties;
  none uses `all`.
- Hover never moves a link or a card. Keyboard focus keeps its outline and
  gets no hover motion.
- Under `prefers-reduced-motion: reduce`, transforms do not animate. The nav
  underline then appears at once instead of drawing in.

## Header nav (`src/css/motion.css`)

- Text turns clay (`--g-accent`). On the homepage hero, where the header sits
  on a photograph, it turns citron (`--g-citron`) so contrast holds.
- A 1px underline in the text color draws in from the left (`scaleX` 0 to 1).
  It sits where the current-page underline sits.
- The current-page link keeps its existing underline and gets no second one.
- The old ungated `.g-nav a:hover` rule in `guest.css` is gone. On the
  homepage, `arrival.css` used to override it, so hover there did nothing.

## Guides index (`src/guides/index.njk`, inline styles)

- Featured, side and start-here cards: the border darkens to brand teal at 32%
  and the shadow deepens slightly. The card itself does not move.
- Card photos scale to 1.03 inside the card's `overflow: hidden`.
- "Read this first" turns `--brand-dark` while its card is hovered.
- Guide links and resource links: the color moves to `--brand` and an
  underline fades in through `text-decoration-color`, so nothing reflows.
- Stay-collection chips: the fill turns white and the border turns brand teal.
  A press scales the chip to 0.97 over 120ms, as on other guest controls. Cards
  get no press scale, because 3% of a 400px card is a visible lurch.

The guides index still uses its legacy inline palette. These rules use only
the variables already declared there.
