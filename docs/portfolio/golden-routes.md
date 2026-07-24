# Golden Routes — the Seascape design conformance bar

These routes are the **reference implementations** of the Field Report standard.
When a new or rebuilt page needs a "what good looks like" target, match one of
these — not an arbitrary legacy page. They are the conformance bar (must meet the
`DESIGN.md` law), which is distinct from the visual-regression baseline (must not
change pixels unexpectedly).

A page earns a spot here only when it: is built on the shared layout + tokens (no
per-page `<style>` shell, no inline hex, passes `npm run lint:design`), uses real
Gulf Coast photography, self-hosts fonts, carries the shared nav/footer, and has
one memorable, decisive moment rather than a neutral wall of text.

## The set

| Route | Family | Why it's the bar |
|---|---|---|
| `/guides/shelling-guide-florida/` | Guide (field journal) | The original modern guide: shared `guide-field-journal.njk` layout, real cover photo, ledger, sticky rail, responsive `.journal-matrix`. |
| `/guides/anna-maria-island-vs-siesta-key/` | Guide (comparison) | Split-photo "versus" hero from real photography, verdict-first decision path, on-brand tokenized callouts. The comparison-family reference. |
| `/property-management/` | Owner money page | The Field Report direction `DESIGN.md` names as the quality bar: cinematic photography, issue-style framing, editorial proof. |
| `/research/owner-fee-revenue-leak-benchmark-2026/` | Research | Editorial data presentation — proof that reads as a report, not a dashboard. |
| `/` (homepage) | Homepage | The brand signal: warm hero, restraint, the cream/teal/gold identity at full strength. |

## North-star theme per family (the one-line brief)

- **Comparison guides:** *a decisive local's verdict, not a neutral encyclopedia.*
  The reader should know which side wins for their trip within the first screen.
- **Field-journal guides:** *a Gulf Coast field report* — conditions, choices, and
  what a local would actually do.
- **Owner money pages:** *proof a skeptical owner can verify*, presented with
  editorial warmth, not SaaS polish.
- **Research pages:** *a premium local report*, where the data is the art
  direction.

## How this is used in the loop

- Design concepts (`seascape-design-specialist` → `seascape-design-critic`) judge
  against the matching golden route, not against whatever legacy page exists.
- When the drift-locked visual baselines are rebuilt, rebuild them from these
  on-standard routes so the regression gate teaches the right bar.
- `docs/reports/2026-07-21-design-loop-audit.md` explains why a designated bar is
  necessary: without it, the only concrete reference the machinery has is a
  baseline set that still includes bespoke legacy pages.
