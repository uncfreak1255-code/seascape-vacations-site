---
name: seascape-design-specialist
description: Produce high-bar Seascape page direction, design concepts, and implementation briefs that feel editorial, warm, premium, and distinctly Seascape instead of generic website design. Use for homepage, owner-page, guide, research, stay, landing-page, or reusable section design work before implementation.
---

# Seascape Design Specialist

Use this only for meaningful Seascape website visual work.

This skill owns the concept pass, the direction options, and the implementation
brief. It is allowed to use outside design donors, but the final answer must
still feel Seascape-native and obey repo truth.

## Required Reading

1. `AGENTS.md`
2. `CLAUDE.md`
3. `DESIGN.md`
4. `docs/process/design-review-workflow.md`
5. `docs/process/seascape-design-studio.md`
6. one task-relevant route source, screenshot, brief, or live URL
7. when helpful, one Seascape reference source that already sets a high bar:
   - `src/index.njk`
   - `src/property-management/index.njk`
   - `src/research/owner-fee-revenue-leak-benchmark-2026.njk`

## Required Loop

1. State the page decision the route must help the visitor make.
2. Fill the intake in `docs/process/seascape-design-studio.md`.
3. Run `seascape-design-critic` first on the current route, the proposed mockup,
   or the initial concept.
4. If the critic returns `Reject` or `Needs another pass`, create 2-3 materially
   different directions before any implementation brief.
5. Choose one direction and explain why it best fits the page job, Seascape's
   design law, and the route's proof/copy constraints.
6. Produce an implementation brief with layout, hierarchy, surfaces, imagery,
   CTA treatment, states, and mobile behavior detailed enough for source work.
7. If implementation happens in the same task, follow
   `docs/process/design-review-workflow.md` and the rendered `design-review`
   gate before human review.

## Design Bar

- Warm editorial Gulf Coast energy, not generic SaaS polish
- Strong first-screen thesis and one memorable moment
- Whitespace discipline and section rhythm
- Premium photography or art direction that matches the claim
- Direct-booking math or owner-proof visibility when the route needs it
- Mobile layouts that still feel intentional, not just stacked
- Specific CTA treatment that feels desirable, not default

## What To Avoid

- default conversion templates with minor color swaps
- interchangeable card grids as the whole page idea
- timid hierarchy where every section has the same weight
- clever polish without a stronger content or decision path
- luxury claims built only from serif fonts and gold accents
- cargo-culting a donor comp without checking `DESIGN.md`

## Optional Donor Lenses

Use these only when they materially improve the direction:

- global `claude-design`
- `product-design:ideate`
- `product-design:audit`
- `creative-production:moodboard-explorer`
- `creative-production:scene-explorer`
- `creative-production:shot-explorer`

These are donor lenses only. Rewrite their useful output into the Seascape
packet and keep `DESIGN.md` plus repo truth as authority.

Figma is optional. It is not a required dependency for this lane.

## Direction Standard

Each direction must be materially different, not just a recolor or a swapped
headline. Name:

- the core idea
- the hero move
- the section rhythm
- the imagery or photography treatment
- the CTA treatment
- the memorable interaction or visual moment
- the mobile behavior
- the risk or tradeoff

## Output Format

Use the packet format in `docs/process/seascape-design-studio.md`.

At minimum the output must contain:

- the critic verdict
- 2-3 directions when the critic does not already approve the concept
- one recommendation
- a concrete implementation brief
- a proof plan for desktop and mobile review

## Implementation Guard

- Do not hand off a bland direction just because it is easier to build.
- Do not call a direction approved if the critic verdict is `Reject` or
  `Needs another pass`.
- If a new visual rule is required, name the `DESIGN.md` change first.
- If a donor tool produces something strong, keep the strength and remove the
  generic donor-tool defaults before implementation.
