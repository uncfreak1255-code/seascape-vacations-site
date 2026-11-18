# Waterline chart patterns

Use this catalog after the four tests in [Guide figures](guide-figures.md) pass.
Choose the treatment that makes the existing numerical comparison easiest to
understand. Name that choice in the existing design packet; charts are optional.

## Selected reference: Seasonal rhythm (weather option B)

On November 3, 2026, Sawyer selected B from the rendered current/A/B weather
comparison and requested charts like it as future design choices. B is the
selected weather direction. Its source implementation and normal-publication
proof are tracked in [the weather B brief](../briefs/2026-11-weather-waterline-b.md);
the article, SEO, source values and booking contracts must be preserved.

B uses two aligned monthly plots: normal high temperature in marine ink and
rain days in clay. Every month has its exact value printed above its mark.
The weather preview uses existing guide data and explicit scales of 0–100°F
and 0–20 rain days. Those are plotting bounds, not new climate facts. Keep the
original explanation, source note and complete table below the figure.

![Selected B: paired monthly plots on desktop](chart-patterns/seasonal-rhythm-desktop.png)

[Selected B on a phone](chart-patterns/seasonal-rhythm-phone.png)

Desktop keeps all twelve months aligned. Phone uses four months per row,
stacking the two plots with every value visible and no horizontal scrolling.
B is taller on phones than the compact strip: compare the source/table and
booking positions in rendered review. Never shrink labels or hide the table
just to save height.

This reference passed preview checks at 1261, 768, 393, 375 and 360px, preserving
full article copy, metadata, schema, data, photos and link/tracking identities.
It had no page overflow or serious/critical axe findings. These are bounded
preview results, not production behavior or conversion-lift evidence.

## Selected reusable direction: Guide Instrument

On November 15, 2026, Sawyer selected **B — Guide Instrument** from the
rendered Waterline control / Guide Instrument / Editorial decision-card study.
This selection adds a reusable visual direction for future guide figures; it
does not replace the already-approved weather figure or authorize another page
migration.

Guide Instrument translates Mono Charts' rounded pill geometry into Waterline:

- use compact pill pillars when several sourced amounts share a meaningful zero
  baseline;
- print every exact value and unit directly, without relying on hover or a
  tooltip;
- separate measures with different units into aligned plots rather than using
  a dual axis or stacking unlike values;
- keep Waterline paper, ink, clay, rules, Instrument Serif and Poppins instead
  of importing dark dashboard chrome, filters or a donor palette; and
- render as semantic HTML/CSS or build-time SVG, with no chart framework,
  animation dependency or client-side data requirement.

Desktop may keep a full comparison on one line when labels remain readable.
Phone layouts use a bounded grid, normally four items per row, so values and
labels stay visible without horizontal scrolling. The selection study passed
rendered overflow checks at 393, 375 and 360px. A new guide still needs its own
source, scale and booking-position review.

The study's **C — Editorial decision card** is retained as a supporting
composition pattern, not the default chart. It may summarize the choice beside
or after a complete figure, and may use native `details`/`summary` for source
context. It must not hide the direct answer, exact values, source note, table or
booking path. See [Reusable Waterline component patterns](component-patterns.md).

## Choose by the reader's question

| Existing data and decision | Treatment | Design choice |
| --- | --- | --- |
| Two seasonal measures with different units: when fits my trip? | **Paired seasonal plots (B)** | Separate aligned plots, explicit scale per measure, exact labels; no overlaid dual axes. |
| Exact monthly values matter more than the trend shape | **Monthly climate strip (A)** | Open ruled columns, direct labels, ink/clay shading; four columns on phones. |
| Several comparable numerical options: how do amounts compare? | **GuideBars: pill pillars or horizontal bars** | Shared zero baseline, direct value/unit labels, meaningful source order or an explicit sort. Use pillars for compact peer periods; use horizontal bars when labels need more room. Qualitative destination comparisons stay tables. |
| Published observations over time: how did this change? | **GuideLine: time-series line** | Actual intervals and visible points; gaps stay gaps. No smoothing, forecasts or invented observations. Climate normals remain normals, not a live forecast. |
| Published lower/upper values: what range should I plan for? | **GuideRange: range marks or band** | Name both endpoints and unit. A range is not a precise average or current quote. If the guide only says price your dates, retain its qualitative tiers. |

B is the selected rendered reference; A remains the compact alternative.
Horizontal bars, lines and ranges are available design choices, not preapproved
page layouts or new factual claims. They still need page-specific rendered
variants and review. A guide with no useful numerical comparison keeps its
words, photographs or table.

`GuideStacked` remains on hold until a published dataset contains meaningful
parts of one whole. Never stack unlike units, use a stacked shape as decoration
or derive missing parts merely to make the pattern fit.

## Shared treatment

- Use Waterline paper/soft surfaces, ink marks, clay rain/cautions and quiet
  rules. Poppins carries values/units; Instrument Serif carries editorial
  headings. Avoid dashboard chrome, gradient cards and decorative percentages.
- Label values, units, period and source. Color supports the answer; direct
  labels carry it. Tint the fill rather than lowering a parent's opacity,
  which also fades its text. No essential hover-only values.
- Bars start at zero. Lines/ranges may use another clearly labeled domain
  when it explains the data honestly. Never shorten a scale to exaggerate a
  difference or copy the weather bounds onto an unrelated dataset.
- Keep one subject-specific figure after the answer and retain the complete
  accessible source table. Paired plots count as one labeled figure, not a
  dashboard of several cards.
- Prefer semantic HTML/CSS or build-time SVG with real text. Keep the figure
  complete without JavaScript and within existing speed budgets. Reuse a
  suitable existing component. This catalog installs no framework, chart
  package or animation library.
- Keep the existing text, mobile-target, focus and reduced-motion floors.
  Static plots need no animation. Check 360, 375 and 393px plus tablet/desktop:
  no clipped labels, hidden months, sideways page scroll or booking obstruction.
- Preserve original reader copy, SEO/schema, source data, photographs and
  booking/tracking links through a presentation-only change.

## Agent route

Read the real guide/dataset, apply guide-figures.md, then choose a pattern and
explain its scale, mobile behavior and booking-path tradeoff in the existing
design packet. Use the design-specialist/critic lane and rendered alternatives
under [Design review](../process/design-review-workflow.md). Reuse Sawyer's B
selection for the weather option; do not ask him to choose it again.

Apply a selected pattern only within the named page's authorized scope.
Choosing a pattern does not authorize other guide changes, new facts, paid
research or publication.

[Mebius charts](https://mebius.design/freebies/charts) was a visual reference.
No Mebius code, assets or license rights are included. Actual third-party reuse
needs its specific license checked first. The screenshots above are Seascape's
own local weather preview.

[Mono Charts](https://amicro.dev/mono-charts) was the geometry reference for
Guide Instrument, GuideLine and GuideRange. No Mono Charts React, Motion or
Tailwind code was copied or installed. The rendered selection study is
[recorded here](experiments/guide-pattern-study/README.md).
