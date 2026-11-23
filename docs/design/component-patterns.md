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


## Exploration shelf: Studio and Amicro

These references broaden assigned design work, not the live site's palette or
framework. Use the existing specialist → critic → rendered-review workflow.
Propose at least two materially different treatments, recommend one by guest
usefulness and visual quality, and let Sawyer choose from working previews.
Current component geometry is a default; isolated previews may challenge it.
Do not silently turn a promising reference into a selected or implemented rule.

Statuses: **reference** is inspiration; **explored** has a working local preview;
**selected** records Sawyer's named choice; **implemented** links to verified
Site source. Preserve the distinction when updating an entry. An entry Sawyer
selected may carry its recorded motion onto a production page:
[pattern motion](pattern-motion.md).

| Pattern / status | Reference and quality to borrow | Seascape application and constraints |
| --- | --- | --- |
| Page-turn booklet — selected | [Amicro Dither Book](https://amicro.dev/3d), Studio `PropertyStorybook`: a deliberate photographic sequence, paper depth and user-directed page turns | [Dockside study](experiments/property-photo-study/README.md). Selected by Sawyer November 17, 2026; reusable for photo stories and visual guides. Two-page desktop, single-photo phone. Full-size and all-photo access stay available. No dither, fake property details or autoplay. Reduced motion swaps directly. |
| Photographic folio — explored | Amicro CoverFlow: a dominant image with restrained neighboring depth | Same Dockside study; show the whole active photo and thumbnail access. Phone layout preserves photo size. No pointer tilt or parallax; reduced motion swaps directly. |
| Responsive CTA — reference | Studio `Cta`: clear action hierarchy and an arrow that responds to intent | Explore gallery and editorial actions with Waterline colors, visible focus and stable labels. Press/hover cannot delay activation. No hold-to-book, decorative trails or hover-only meaning. |
| Filter / selection pill — reference | Studio `Pagination`, Amicro pill controls: unmistakable active state and continuous selection feedback | Real filters or gallery choices. Preserve result counts and keyboard behavior; narrow screens wrap or offer reachable controls. Reduced motion changes selection immediately. Existing radius is not an experiment's limit. |
| Disclosure — reference | Studio `Collapsible`: expansion feels connected to its trigger | Native details/summary for supporting facts; essential booking facts stay visible. Keep focus and touch targets. No spatial animation under reduced motion. |
| Photo lightbox — reference | Studio `Lightbox`: continuity from thumbnail to a generous photo view | Native dialog, Escape, focus return, explicit close and original-image access. Phone content remains readable; keyboard and reduced-motion paths do not depend on animation. |
| Editorial decision card — existing catalog pattern | Studio `EditorialDecisionCard`: direct answer with source context nearby | Keep the constraints above; it supplements complete comparison facts rather than replacing them. |

Studio inspected November 17, 2026 at
[the user's artifact](https://claude.ai/artifact/D9eQSY9M8UcUP6JgCoFbiZ#readme).
The README lists these components and explicitly keeps Studio separate from the
live site. That observation establishes reference provenance, not functional
verification of every Studio component. Its `PropertyStorybook` is already a
concept; do not create another Studio catalog or claim it is shipped on Site.

### Selected page-turn booklet

Sawyer selected the working Dockside booklet on November 17, 2026: “i like
that can we add that to the design system ... for guides or in general.” This
selects a reusable pattern, not a sitewide gallery replacement. The earlier
Studio storybook's short slide is not the selected motion.

Use it for a deliberate visual sequence: property photography, a destination
photo essay, a local field guide, or an editorial story with meaningful pages.
Agents may independently propose and adapt it within assigned page work. Say
why paging helps this reader, preserve the selected physical turn, and show the
adaptation in context at desktop and phone sizes. Compare a simpler treatment
when scanning or comparison may work better. Do not default every guide to a
book: long articles, numerical comparisons and essential booking information
need directly accessible content outside the moving pages.

**Working reference:** [source and run instructions](experiments/property-photo-study/README.md),
[rendered proof and motion recording](experiments/property-photo-study/review.md).
Reuse this implementation before rebuilding it from a donor link. Supply ordered,
verified image sources, dimensions, accessible captions and a collection label;
remove Dockside-specific labels when adapting. Guide text and images remain
sourced, and all content must be present in a static semantic list or contact
sheet before progressively enhancing a production page.

Preserve a full 180-degree sheet turn hinged at the spine, two printed faces
on desktop, the underlying destination spread, restrained paper depth and
moving shade. The turn runs 700ms on `cubic-bezier(.77,0,.175,1)`, a strong
ease-in-out, for deliberate storytelling;
this is not a new timing default for buttons or filters. One readable page on
phones, immediate interruptible navigation, no autoplay, direct keyboard and
reduced-motion changes, visible progress, 44px controls, and an always-available
all-content view are part of the pattern. Keep originals/full-size photos
reachable and never distort or invent property imagery. Test both directions,
odd final pages, rapid input, resizing and reduced-motion changes mid-turn.
Real-device touch feel remains an implementation check, not a claim from the
emulated phone proof. Apply Emil's relevant guidance through the existing Site
specialist and critic workflow.

### Craft and evidence

Use installed `emil-design` in Codex (`emil-design-eng` in Claude), loading only
relevant design, animation and mobile guidance. Reuse Site timing and easing
scales first; motion should respond promptly, interrupt cleanly and leave all
controls usable. Test actual transitions, keyboard use, touch-sized controls,
reduced motion and missing images, not only a still screenshot. Distinguish
emulated mobile checks from real-device touch proof.

Each exploration records the donor, quality borrowed, actual skill/reference
use, source assets, recommendation, desktop/phone preview, tradeoff and status.
This happens inside an assigned task, not a scheduled autonomous redesign.
No new skill installation or review layer is required. Amicro's own skill sets
its palette, React/Motion and haptic conventions; do not install it wholesale
as Seascape's authority. Rebuild the interaction with native HTML/CSS/JavaScript
when that meets the result; any actual third-party code reuse retains its license.
