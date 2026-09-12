---
name: design-review
description: Use when performing rendered Seascape design audit or visual QA against DESIGN.md with desktop/mobile proof.
---

# Design Review

Review the rendered Seascape flow against `DESIGN.md` and
`docs/process/before-user-review-checklist.md`. Record the route, state/action,
and expected visible result. Source or mockups alone cannot prove rendered UI.

## Evidence and judgment

Inspect the current worktree or intended deployed route on desktop and mobile
using `docs/process/agent-evidence-routing.md`. Confirm route/title, expected
content, nonblank current rendering, and absence of blocking runtime errors or
critical asset failures before judging design.

Check Seascape's recurring failures: clipping and broken stacks, cramped heroes
and wrapped buttons, CTA drift, generic card grids or badge spam, analytical
owner-proof treatment, and property cards that lose rate/spec/action clarity.
Judge warmth, spacing, hierarchy, and restraint against the design law.

Meaningful changes need desktop/mobile screenshots, with before/after evidence
for an existing route. Interaction claims need observed state changes; use
[interaction proof](references/interaction-proof.md) for the affected control.
Follow `docs/process/design-review-workflow.md` for the required Playwright,
visual, and accessibility gates; browser inspection does not replace them.

## Completion

Return findings by severity with route, source where known, viewport, impact,
evidence, and smallest fix. A clean result names the flows and viewports checked.
State missing proof explicitly. Recommend Figma only if it would resolve a
specific review problem.

A review is read-only unless fixes are authorized. With fix authority, repair
in-scope failures and repeat affected proof before handing back the result.
