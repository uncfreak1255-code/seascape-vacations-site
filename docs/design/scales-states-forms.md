# Scales, states and forms (October 2026)

Moved out of `DESIGN.md` so that file stays under the staged-file size gate; `DESIGN.md` points here and these rules carry the same authority. The scales themselves stay in the `waterline:` front matter of `DESIGN.md`.

The `space`, `motion`, `shadow` and `breakpoints` keys in the `waterline:` block are the scales. They were measured from the live CSS, so adopting them changed nothing on screen. `npm run design:sync` emits them as `--wl-*` tokens in the design system's `tokens.css`. The site stylesheets write the scale values literally, because `src/css/guest.css` has a no-growth byte budget and a custom property used once costs more bytes than the value. `scripts/enforcement/waterline-tokens.test.js` checks every colour, duration, easing, shadow and breakpoint in the Waterline stylesheets against these scales. Off-scale values that already exist are counted debt per file, and a count may only fall; a new value goes into the `DESIGN.md` scale first.

- **Motion:** pick a duration and a curve from the scale. `out` is for presses and fades, `glide` for things that travel. Every motion respects `prefers-reduced-motion`. Known exception: the catalog card hover in `catalog.css` still uses `.3s ease`.
- **Shadows:** only the menu, the shortlist tray, the bottom booking bars and printed photos (postcards, the catalog intro photo) carry a shadow. Cards, buttons and fields are flat. The legacy `rgba(0,0,0,…)` shadows in `catalog.css` and `planning-guide.css` are debt, not examples.

States, for every control:
- **Focus:** 3px clay outline, 4px offset, on every focusable element; no component overrides it. Known exception: the owner-form consent checkbox still uses a 2px ink ring (`owner.css`).
  On ink (the footer), the ring is 3px citron `#D6EB85` instead, because clay on ink is too low-contrast to see. The same footer uses rule `#CAD4CF` for labels and tagline, paper for links, citron for link hover, and white at 15% (`#ffffff26`) for its bottom rule.
- **Disabled:** rule background, muted text, no hover or press, `cursor:not-allowed`. Prefer removing a control to disabling it; disabled means "wait", not "no".
- **Loading:** muted background, a 14px ring spinner, the verb in its -ing form, `aria-busy` on the control; the label stays readable. Never a skeleton on paper.
- **Error:** 2px clay underline, `aria-invalid`, and one 13px clay sentence under the field that says what to do next.
- **Success:** 2px ink underline and one 13px ink sentence with a check icon. It clears when the field is edited.
- **Selected:** ink fill with paper text on paper; citron fill with ink text on ink.

Forms:
- **Field:** label above in the 12px label style; control 46px tall with a 1px muted underline and no radius; help text 13px muted below. Textareas are at least 72px.
- **Field error:** the error state above, linked to the field with `aria-describedby`.
- **Error summary:** a 1px clay frame at the top of the step with `role="alert"` and one link per field in error. The form status line stays `aria-live="polite"`.
- **Checkbox:** 18px native with an ink accent and the shared focus ring.
- **Choice chip:** 44px tall, 4px radius, ink fill when selected, `aria-pressed`.
- **Step indicator:** 44px squares; done and current steps are ink; the connector turns to a 2px citron line once a step is done.
- **File input:** a dashed muted frame 44px tall with a verb label; the native input is visually hidden.
- **Text button:** underlined 14px weight 500 with a 44px hit area, never a border.
- Never use a placeholder as the only label. Never disable a submit button: validate on submit and point to the field.
