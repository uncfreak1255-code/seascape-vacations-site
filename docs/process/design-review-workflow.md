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
- Figma, Claude Design, Stitch, and other outside tools are reference surfaces only.
- If a new pattern, visual direction, or design-system rule is needed, update `DESIGN.md` first.

## Required Execution Loop

1. Work on a `codex/<task>` branch in a worktree, not root `main`.
2. Read `DESIGN.md` before touching CSS, layout, templates, or imagery.
3. Implement the source change.
4. Rebuild the branch output locally.
5. Run the global `design-review` skill against the affected routes, or use its diff-aware mode when the change scope is branch-specific.
6. Fix any high- or medium-impact rendered issues it finds before asking for human review.
7. Capture fresh desktop and mobile screenshots for every changed route. If a full-page capture lies about a fixed or sticky element, also capture viewport-level screenshots that show the real behavior.
8. Run the relevant build and release checks for the lane.
9. Use `docs/process/before-user-review-checklist.md` before asking Sawyer to review.

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
