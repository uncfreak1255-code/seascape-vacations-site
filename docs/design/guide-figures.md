# Guide figures: when a guide earns a chart or diagram

Moved from `DESIGN.md` on 2026-10-25 so that file stays under the staged-file size gate; `DESIGN.md` points here and this rule carries the same authority.

A table and a clear answer at the top carry a guide in search and in AI answers. A figure helps the human reader only. Add one figure to a guide only when all four are true:

1. **Real comparison.** The guide compares at least 6 data points, or 3 items across 2 or more measures (for example 12 months of heat and rain).
2. **Data already published, with a source.** The figure draws only from numbers the guide already shows. It adds no new number and no new claim.
3. **Faster than words.** The reader sees the answer in about 3 seconds.
4. **The question fits.** "When" and "how much" questions fit a figure. "Which area" questions fit a table. "What to do" questions fit real photographs.

If one test fails, add no figure. Improve the table or the lead sentence instead.

| Guide type | Add | Do not add |
| --- | --- | --- |
| When to go (season, weather) | Twelve-month strip plus the table | Pie chart, animated chart |
| Cost | Tier cards plus the table | A savings percentage that has no source |
| Place A versus place B | Side-by-side table | Chart |
| Distance or drive times | Labeled map, only when the drive times are published | Decorative map |
| Family, shelling, activities | Real photographs of the named place | Stock-style diagram |
| Process with three steps or fewer | Numbered steps | Flow chart |

A figure ships only when all of these hold:

- Plain SVG or HTML made at build time. It needs no script and is never an image of text.
- A text label, and the full table stays on the page as the data source.
- One figure per guide, directly under the answer (see Instrument above).
- Colors only from this file.
- Readable at 360, 375 and 393px wide with no sideways swipe.
- A text diff against the page it replaces shows no new fact.
- Shown to Sawyer as two or three variants before it is built.
- Held to the design review lane in `docs/process/design-review-workflow.md`.
