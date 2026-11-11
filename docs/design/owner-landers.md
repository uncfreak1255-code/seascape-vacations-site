# Owner landers

Rules for the generated owner pages under `/property-management/<slug>/`.
`DESIGN.md` stays the visual law; this file holds what is specific to the family.

- Source: `src/property-management/property-management.njk`, styled by
  `src/css/owner-lander.css` on top of `guest.css` and `owner.css`. Copy comes
  from `src/_data/seoPages.json`.
- The page uses the Waterline tokens only. The review sheet and the checkbox
  sit on the soft surface, never on white.
- The hero pairs the page claim with the review sheet: the three things the
  one-page review returns. Its wording follows the approved owner offer in
  `seascape-hub/context/owner-offer.md`.
- The photo band shows a real managed home and names it and its city. It never
  states how many homes Seascape manages.
- Motion: the review sheet settles once on arrival in 200ms and its three
  lines follow 120, 150 and 200ms later. Link hover colour stays behind
  `(hover: hover) and (pointer: fine)`; a pressed link takes the same colour
  and the browser tap flash is off. Reduced motion keeps the static sheet.
- Form fields render at 16px so a phone does not zoom on focus.
- Proof: `tests/visual/design-floors.spec.js` and the visual baseline cover the
  Sarasota Airbnb route (`owner-airbnb-management-sarasota`) only; the other
  routes share the template.
