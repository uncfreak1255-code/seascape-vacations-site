---
name: seascape-design-specialist
description: Use when developing Seascape visual concepts and implementation briefs for meaningful page or section changes.
---

# Seascape Design Specialist

Create Seascape visual concepts, direction options, and an implementation brief.
Preserve the warm editorial Gulf Coast style and the visitor decision the page
must support. `DESIGN.md` is the visual law.

## Design contract

Use `docs/process/seascape-design-studio.md` for the intake and output packet,
including source/route, audience and goal, current visual evidence, factual copy
and assets, responsive requirements, and implementation constraints.

Run `npm run design:donors -- "<task>"` for page-family classification and local
metadata discovery unless the design launcher already ran it for this task.
The scan is read-only: it does not install, copy, invoke, or promote donors.
Use a donor only when the session exposes it and its capability helps the task.
Figma remains optional. For choosing among donor capabilities, use the studio's
Local Donor Discovery section; all output returns under Seascape source truth.

Run `seascape-design-critic` on the current route, mockup, or initial concept
before selecting a direction. A `Reject` or `Needs another pass` verdict requires
2–3 materially different directions, not recolors of the same frame. Retain the
critic gate; do not implement a rejected direction.

Choose the direction that best serves the page job and proof constraints. Each
direction identifies its core idea, hero, rhythm, imagery, CTA, memorable moment,
mobile behavior, and tradeoff. Preserve strong art direction rather than reducing
it to default grids, badges, serif fonts, or gold decoration.

## Completion and implementation

The concept is complete with a critic verdict, required alternatives, one
recommendation, a concrete implementation brief, and desktop/mobile proof plan.
Use the studio's approval boundary for design direction; a new visual rule needs
an accepted `DESIGN.md` change before implementation.

When implementation is authorized, follow the approved direction closely and
continue through `docs/process/design-review-workflow.md` and `design-review`,
including correction of in-scope failures before human review. Name any required
deviation due to design law, accessibility, performance, mobile behavior,
assets, or source constraints.
