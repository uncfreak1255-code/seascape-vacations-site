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

## Show, do not describe

Sawyer cannot steer design from prose. For any visible change, return 2–3
rendered variants (screenshots or preview links), each anchored to a named
reference site from `npm run design:donors`. Ask only "which one" or "keep X,
lose Y". An `Approved` critic verdict does not remove this; it only removes the
rule that a `Reject` or `Needs another pass` verdict requires 2–3 directions.
If rendering is impossible, ship the directions as provisional and name the
missing renders.

Each direction states its hover, focus, pressed, empty, loading, and error
states, and its reduced-motion path. Stay inside `DESIGN.md` motion limits: CSS
and browser-native motion only, no animation library, no page loader (inline
loading text or a static state is fine). Keep the change inside the page-speed
budgets (`npm run perf:ratchet` and `npm run perf:budget`). Reader-facing
copy in a variant describes the capability and never names software or vendors.

## Completion and implementation

The concept is complete with a critic verdict, required alternatives, one
recommendation, a concrete implementation brief, and desktop/mobile proof plan.
Use the studio's approval boundary for design direction; a new visual rule needs
an accepted `DESIGN.md` change before implementation.

If `DESIGN.md`, the studio doc, the route, or the critic is unavailable, still
deliver the whole packet: critique the current design, give the directions,
recommend one, and write the implementation brief and the desktop/mobile proof
plan. Mark it provisional, name each check you could not run, and say which
checks must pass before approval. Never hold back the brief while waiting for
access.

When implementation is authorized, follow the approved direction closely and
continue through `docs/process/design-review-workflow.md` and `design-review`,
including correction of in-scope failures before human review. Name any required
deviation due to design law, accessibility, performance, mobile behavior,
assets, or source constraints.
