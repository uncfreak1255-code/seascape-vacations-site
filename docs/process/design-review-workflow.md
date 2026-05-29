# Design Review Workflow

Use this workflow for any meaningful visual change in `seascape-vacations-site`.

That includes:

- layout or spacing changes
- typography or color changes
- imagery or art-direction changes
- iconography changes
- CTA treatment changes
- motion or interaction-polish changes

## Source Order

1. `AGENTS.md`
2. `CLAUDE.md`
3. `DESIGN.md`
4. this file
5. the task-relevant source file

## Design Authority

- `DESIGN.md` is the visual source of truth.
- Claude Design is the required first-pass design lane for meaningful Seascape
  website visual changes, including homepage, owner pages, guide pages, research
  pages, article/blog-style pages, landers, and reusable page-section patterns.
- Codex owns the handoff packet before Claude Design work starts: repo/source
  truth, page goal, audience, `DESIGN.md` constraints, existing route/component
  patterns, proof and copy boundaries, URLs or screenshots, implementation
  risks, and responsive requirements.
- Figma, Stitch, and other outside tools are reference surfaces only unless
  Sawyer explicitly approves them as the design source for a specific task.
- Once Sawyer approves a Claude Design mockup, that approved mockup becomes the
  implementation contract for the visual change. Codex should implement it
  closely, not reinterpret it, simplify it into a generic site pattern, or swap
  in a different art direction.
- Any necessary deviation from an approved Claude Design mockup must be named
  before or during implementation and limited to repo truth, `DESIGN.md`,
  accessibility, performance, responsive behavior, or source constraints.
- If a new pattern, visual direction, or design-system rule is needed, update `DESIGN.md` first.

## Required Execution Loop

1. Work on a `codex/<task>` branch in a worktree, not root `main`.
2. Read `DESIGN.md` before touching CSS, layout, templates, or imagery.
3. Prepare a concise Codex handoff packet for Claude Design before requesting
   visual direction. The packet should include:
   - the route or page family and business goal
   - the target audience and job the page must do
   - current repo/source truth and relevant URLs or screenshots
   - active `DESIGN.md` constraints and existing patterns to preserve
   - proof, claim, voice, and copy boundaries
   - responsive, accessibility, performance, and implementation risks
4. For meaningful visual changes, run the global `claude-design` skill before
   implementation. The output should be a reviewable mockup, direction, or
   implementation spec, not just verbal styling advice.
5. Wait for Sawyer approval when the Claude Design output changes layout,
   hierarchy, art direction, or component treatment. Do not implement a
   materially different visual direction after approval.
6. If the approved direction changes the visual law, update `DESIGN.md` first.
7. Implement the approved mockup closely in source. Preserve the approved
   hierarchy, spacing intent, imagery direction, CTA treatment, and interaction
   intent unless a named constraint requires adjustment.
8. Rebuild the branch output locally.
9. Run the global `design-review` skill against the affected routes, or use its
   diff-aware mode when the change scope is branch-specific.
10. Fix any high- or medium-impact rendered issues it finds before asking for
   human review.
11. Capture fresh desktop and mobile screenshots for every changed route. If a
   full-page capture lies about a fixed or sticky element, also capture
   viewport-level screenshots that show the real behavior.
12. Run the relevant build and release checks for the lane.
13. Use `docs/process/before-user-review-checklist.md` before asking Sawyer to
    review.

## Iconography Rule

- Live site iconography must use SVGs from source.
- Preferred source is `src/_includes/partials/ui-icon.njk`.
- If a needed icon is missing, add an approved SVG from the design system or Figma export to source. Do not use emoji on the live site.

## Review Standard

Before human review, the handoff must show:

- the exact route or routes to check
- fresh desktop and mobile screenshots
- any known screenshot artifact called out plainly
- what changed visually
- what is still known-bad, if anything

If the rendered surface still needs the user to discover basic bugs, the review is not ready.

## Visual Regression Failures

- A red visual regression gate is evidence, not a bypass target. Before changing any baseline or threshold, rebase or merge current `main`, inspect the CI artifact and local rendered screenshots, update only an approved failing baseline or route-specific tolerance, rerun local targeted visual verification and GitHub checks, and verify the live route or endpoint after deploy before calling it shipped.
