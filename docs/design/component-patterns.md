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

## Reference and implementation

[shadcn/ui components](https://ui.shadcn.com/docs/components) provide reference
patterns, not a replacement brand. Its [theme tokens](https://ui.shadcn.com/docs/theming)
can map to Waterline; its [charts](https://ui.shadcn.com/docs/components/chart)
use Recharts. This Eleventy site should reuse its templates, native HTML,
CSS and existing scripts for equivalent behavior. Actual third-party code
reuse must retain the upstream license and be evaluated in its own scope.
This catalog installs no React, Tailwind, Radix, Recharts or other dependency.
