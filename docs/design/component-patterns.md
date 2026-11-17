# Reusable Waterline component patterns

Sawyer requested this catalog on October 27, 2026. DESIGN.md remains the
visual law. The patterns below help guests compare and choose; they do not
authorize migrating another guide or changing a held page.

## Shared treatment

Use paper and soft surfaces, ink text and primary controls, muted supporting
text, clay cautions, and rule-colored dividers from the Waterline tokens.
Instrument Serif carries section headings; Poppins carries facts and controls.
Keep the existing spacing scale, 4px control radius, visible focus, reduced
motion, 12px text floor and 44px mobile controls. Citron stays within the
existing on-dark/selection rules. Keep essential facts, sources and booking
links available without JavaScript; labels must describe what an action does.

## Comparison table

Use a real table for shared attributes across destinations, activities or
stays. Keep column headers and all values; never invent a score to fill a cell.
Rainy Day's approved Structured treatment uses an ink header, fine column
rules, alternating paper/soft rows and semibold activity names. On phones,
each activity has an ink title row, paired location/cost and full-width group
fit, with visible labels and preserved table/row/header semantics. See
activity-guides.md and src/css/activity-guide.css for the implemented pattern.

## Tabs and filters

Use tabs for peer views of the same task and filters for narrowing a real set,
such as location or group fit. Show a clear selected state and result count;
an empty result explains how to reset. Keep keyboard operation and focus
predictable. A no-JavaScript page exposes the full useful content. Never put
the only booking link or essential comparison fact behind an inactive view.
Prefer the existing catalog behavior before adding a new implementation.

## FAQ disclosure

Use native details/summary when an answer benefits from expansion. Keep the
question readable, make the whole summary a 44px target, show expanded state,
and support keyboard operation. The direct answer and booking action remain
visible outside the disclosure. Keep source/schema answers consistent.

## Charts and figures

A figure needs sourced numerical data and a comparison that becomes clearer
visually. Follow guide-figures.md: label units, dates and sources, retain the
complete accessible table, and explain uncertainty. Prefer build-time SVG or
HTML for a static guide. No decorative ratings, fabricated live values or
chart library solely for appearance. Interaction must earn its loading cost.

Use [Waterline chart patterns](chart-patterns.md) for paired seasonal plots,
monthly strips, ranked bars, time-series lines and sourced ranges. Choose from
the actual reader question and published dataset after the guide-figures tests
pass. The catalog includes the selected weather B reference.

### Guide Instrument

Guide Instrument is the selected reusable direction for sourced numerical
figures. Its rounded pill pillars are compact marks inside an editorial guide,
not a dashboard card system. Keep direct values and units, separate unlike
measures, preserve the accessible source table, and render without JavaScript.
Use `GuideBars`, `GuideLine` or `GuideRange` only when the dataset matches the
question defined in [Waterline chart patterns](chart-patterns.md).

`GuideStacked` is a held pattern. It becomes eligible only when published parts
form a meaningful whole; never stack unlike units or invent a remainder.

### Pick card

Sawyer selected photo cards (variant C) for the waterfront restaurants guide on
November 16, 2026, from three rendered variants. A pick card presents one named
place inside a planning-guide step: place label, serif name, short description
and one ruled practical note, with an optional ink tag. A card may open with a
3:2 photograph only when it is a real photograph of that named place with a
recorded source; without one the card is text only and shows no placeholder.
Cards sit on the `soft` surface with a rule; a card with a photograph uses the
`photo` shadow. The selection covers the named guide; another guide needs its
own scope. Rules: `.pick-*` in `src/css/planning-guide.css`.

### Editorial decision card

The Studio-derived editorial decision card is a supporting hierarchy pattern,
not the default figure and not a new guide shell. Use it when a short question
and answer helps the reader interpret a complete comparison. Keep the direct
answer visible, use a quiet Waterline surface and restrained radius, and place
optional source context in native `details`/`summary` with a 44px minimum
target. The card never replaces exact values, the source note, the accessible
table or the booking action.

## Reference and implementation

[shadcn/ui components](https://ui.shadcn.com/docs/components) provide reference
patterns, not a replacement brand. Its [theme tokens](https://ui.shadcn.com/docs/theming)
can map to Waterline; its [charts](https://ui.shadcn.com/docs/components/chart)
use Recharts. This Eleventy site should reuse its templates, native HTML,
CSS and existing scripts for equivalent behavior. Actual third-party code
reuse must retain the upstream license and be evaluated in its own scope.
This catalog installs no React, Tailwind, Radix, Recharts or other dependency.

[Mono Charts](https://amicro.dev/mono-charts) is likewise a visual donor rather
than a runtime dependency. Guide Instrument borrows rounded mark geometry while
retaining Waterline tokens, static rendering and the site's existing Eleventy
stack. Sawyer's Claude Studio artifact contributed the decision-card hierarchy
and native disclosure treatment; decorative shaders, orbs, tilt effects,
chat-style FAQs, loops and its alternate palette are not part of this catalog.
