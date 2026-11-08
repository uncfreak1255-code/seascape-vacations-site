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
  It sits a few pixels below where the current-page text underline sits.
- The current-page link gets only the color change, no drawn underline. On
  `guest-site` pages it keeps its text underline. On `guest-shell` pages
  (guides, stays) `.guest-shell .g-header a{text-decoration:none}` already
  removes that underline; this change leaves that as it was.
- The old ungated `.g-nav a:hover` rule in `guest.css` is gone. On the
  homepage, `arrival.css` used to override it, so hover there did nothing.

## Guides index (`src/css/guides-index.css`)

Layout and tokens: [guides index design](guides-index.md).


- Featured and side story cards: the 1px rule darkens to ink (`--g-ink`) and
  the title turns clay. The card itself does not move.
- Card photos scale to 1.03 inside the card's `overflow: hidden`; the card has
  `isolation: isolate` so Safari keeps the clip while the photo scales.
- Start-here items: the title and "Read this first" turn clay.
- Guide links and resource links: the color moves to clay and an underline
  fades in through `text-decoration-color`, so nothing reflows.
- Stay-collection chips: the fill turns soft (`--g-soft`) and the border ink.
  On fine pointers with motion allowed, a press scales the chip to 0.97 over
  120ms. Phones keep their default tap behaviour. Cards get no press scale,
  because 3% of a 400px card is a visible lurch.
