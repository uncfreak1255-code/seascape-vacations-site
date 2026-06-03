---
name: design-review
description: Review rendered Seascape Vacations pages against `DESIGN.md`, repo visual rules, accessibility basics, and desktop/mobile browser proof. Use when the user asks for a design audit, page-by-page review, screenshot feedback, visual QA after CSS/template/layout changes, or help catching overflow, spacing, hierarchy, or component drift on localhost or the live site.
---

# Design Review

Use this only for Seascape rendered UI review.

## Required Reading

1. `AGENTS.md`
2. `CLAUDE.md`
3. `DESIGN.md`
4. `docs/process/before-user-review-checklist.md`
5. the changed route or source file

## Review Loop

1. Name the rendered flow under review in one sentence:
   `The flow under review is: [route] -> [state/action] -> [expected visible result].`
   For a general visual smoke, use:
   `The flow under review is: route loads -> first meaningful screen renders -> primary visible controls and CTAs are present without runtime errors.`
2. Inspect the rendered page in Browser on desktop and mobile. Prefer localhost, the current worktree build, or the deployed page over mockups.
3. Confirm the page identity before judging taste:
   - URL and title match the intended route
   - the expected heading or primary page content appears above the fold
   - the page is not blank, stale, or showing a framework/build error
   - no blocking console error or critical image/CSS/script 404 is present
4. Judge against `DESIGN.md` first. Warmth, spacing, hierarchy, and restraint are law.
5. Check the common Seascape failure modes:
   - mobile clipping, overflow, or broken card stacks
   - cramped hero copy, button wraps, or CTA hierarchy drift
   - generic SaaS polish, badge spam, or invented component styles
   - owner-proof sections that feel analytical instead of editorial
   - property or stay cards that lose rate/spec/CTA clarity
6. Capture evidence that matches the claim:
   - desktop and mobile screenshots for meaningful visual changes
   - before/after screenshots when the branch changes an existing route
   - a clicked or focused state check when the change claims interaction behavior
7. For interaction-heavy changes, capture the smallest proof that shows the
   control actually works:
   - navigation or CTA click: before state, after state, and final URL or scroll target
   - form or lead path: empty state, filled or submitted state, validation or success state
   - accordion, menu, modal, carousel, or filter: collapsed/closed state and expanded/opened state
   - mobile menu or sticky CTA: closed state, opened state, and tap target check
   - keyboard/focus claim: focused state plus the expected visible result after Enter, Space, or Escape
8. Return findings with route, viewport, impact, evidence, and the smallest fix. Say explicitly if Figma would help or if the work should stay in browser/code only.

## Output

- Put findings first, ordered by severity.
- Include the route and source file when obvious.
- Include the flow under review, viewports checked, and the proof used: screenshot, DOM/readback, console/network check, or interaction check.
- If no issues were found, say which pages and viewports were checked.
