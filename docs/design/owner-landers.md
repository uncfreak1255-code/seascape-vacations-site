# Owner landers

Rules for the generated owner pages under `/property-management/<slug>/`.
`DESIGN.md` stays the visual law; this file holds what is specific to the family.

- Source: `src/property-management/property-management.njk`, styled by
  `src/css/owner-lander.css` on top of `guest.css` and `owner.css`. Copy comes
  from `src/_data/seoPages.json`.
- The page uses the Waterline tokens only. The checkbox sits on the soft
  surface, never on white.
- The hero is the owner hub's photo hero (`.g-owner-hero` in `owner.css`): a
  real managed home under the ink scrim, paper type, a citron CTA. Sawyer chose
  this over the review-sheet and ink-band heroes on 2026-11-11.
- The hero caption names the pictured home and its city. It never states how
  many homes Seascape manages.
- The landers do not load `guest.js`: they take no trip dates, and its bytes
  count against the performance ratchet on the three budgeted owner routes.
- Motion: link hover colour stays behind `(hover: hover) and (pointer: fine)`;
  a pressed link takes the same colour and the browser tap flash is off.
- Form fields render at 16px so a phone does not zoom on focus.
- Proof: `tests/visual/design-floors.spec.js` and the visual baseline cover the
  Sarasota Airbnb route (`owner-airbnb-management-sarasota`) only; the other
  routes share the template.
