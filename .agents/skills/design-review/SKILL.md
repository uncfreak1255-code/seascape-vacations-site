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

1. Inspect the rendered page in Browser on desktop and mobile. Prefer localhost, the current worktree build, or the deployed page over mockups.
2. Judge against `DESIGN.md` first. Warmth, spacing, hierarchy, and restraint are law.
3. Check the common Seascape failure modes:
   - mobile clipping, overflow, or broken card stacks
   - cramped hero copy, button wraps, or CTA hierarchy drift
   - generic SaaS polish, badge spam, or invented component styles
   - owner-proof sections that feel analytical instead of editorial
   - property or stay cards that lose rate/spec/CTA clarity
4. Note what viewport and route were reviewed. For meaningful changes, compare before/after screenshots when possible.
5. Return findings with route, impact, and the smallest fix. Say explicitly if Figma would help or if the work should stay in browser/code only.

## Output

- Put findings first, ordered by severity.
- Include the route and source file when obvious.
- If no issues were found, say which pages and viewports were checked.
