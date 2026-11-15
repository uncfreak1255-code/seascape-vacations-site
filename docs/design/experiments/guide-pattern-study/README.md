# Guide pattern study

Status: Sawyer selected **B — Guide Instrument** on November 15, 2026. The
study remains nonpublic reference material; selection makes B a reusable design
direction, not an automatic production migration.

This study tests whether selected ideas from Mono Charts and Sawyer's Claude
Studio artifact can improve future Seascape planning guides without turning
them into dashboards. It uses the already-published weather fixture only; the
approved weather guide itself is not being reopened.

## Acceptance gate

- Render A, B and C at desktop plus 393, 375 and 360 pixels.
- Preserve direct values, separate units, source language and an accessible
  table contract.
- Use Waterline tokens, Instrument Serif and Poppins.
- Add no runtime dependency, animation, hover-only fact or invented metric.
- Obtain a design-critic verdict of `Approved` or `Approved with edge` before
  asking Sawyer to choose a direction.

## Donor boundaries

- **Mono Charts:** rounded spline, pill pillars and range-band geometry only.
  Its React, Motion and Tailwind implementation is not imported.
- **Studio:** compact card hierarchy, native disclosure and restrained press
  feedback only. Orb, Shader, Feedback, TiltCard, chat FAQ, loops and the
  black/orange palette are excluded.
- **GuideStacked:** held until a published dataset contains meaningful parts of
  a whole. The weather fixture does not qualify.

The selected rule is translated into `docs/design/chart-patterns.md` and
`docs/design/component-patterns.md`. `DESIGN.md` is unchanged because the
selection fits its existing source, static-render, direct-label and mobile laws.

## Critic verdict

**Approved with edge — high confidence.** The desktop render and 393, 375 and
360 pixel checks support the verdict.

- **Keep B as the recommended direction.** Its pill marks give the existing
  seasonal comparison a recognizable instrument quality while direct values,
  separate units and the source/table contract keep it editorial rather than
  dashboard-like.
- **Keep C as a secondary composition pattern, not the default chart.** The
  decision card and native disclosure strengthen hierarchy, but its four range
  markers are less complete than B's twelve-month view and should not replace a
  full comparison when every month matters.
- **Keep A as the control.** It remains the clearest low-risk presentation and
  makes the value of B measurable rather than assumed.
- **Hold GuideStacked.** No meaningful parts-of-a-whole dataset exists in the
  fixture. Rendering it as weather data would be decorative and misleading.

The edge to preserve is the combination of Waterline editorial typography with
compact, directly labeled instrument marks. Do not carry over Mono's dashboard
shell or animation, or Studio's large-radius cards and decorative effects. No
new `DESIGN.md` law is required for this study; the current source, direct-label,
static-render and mobile rules already govern it.

## Rendered proof

- Desktop: `guide-pattern-study-desktop.png` in the task's Codex visualization
  artifact folder.
- Phone: individual 393 pixel captures for A, B, C and the component shelf;
  overflow checks also passed at 375 and 360 pixels.
- Disclosure: native `details` expanded successfully; its phone target measured
  at least 51 pixels.
- Contrast: ink/paper 10.62:1, muted/paper 5.40:1, clay/paper 4.87:1 and
  citron/ink 9.02:1.
