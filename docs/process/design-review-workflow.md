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
3. For meaningful visual changes, run the repo-local `claude-design` skill before
   implementation. It is a deliberate vendored copy of the global upstream
   bridge and should still drive a real Claude Design handoff, not just verbal
   styling advice.
4. Wait for Sawyer approval when the Claude Design output changes layout,
   hierarchy, art direction, or component treatment. Do not implement a
   materially different visual direction after approval.
5. If the approved direction changes the visual law, update `DESIGN.md` first.
6. Implement the approved mockup closely in source. Preserve the approved
   hierarchy, spacing intent, imagery direction, CTA treatment, and interaction
   intent unless a named constraint requires adjustment.
7. Rebuild the branch output locally.
8. Run the repo-local `design-review` skill against the affected routes, or use its
   diff-aware mode when the change scope is branch-specific.
9. Fix any high- or medium-impact rendered issues it finds before asking for
   human review.
10. Capture fresh desktop and mobile screenshots for every changed route. If a
   full-page capture lies about a fixed or sticky element, also capture
   viewport-level screenshots that show the real behavior.
11. Run the relevant build and release checks for the lane.
12. Use `docs/process/before-user-review-checklist.md` before asking Sawyer to
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
