# Seascape Design Studio Packet

Use this packet before meaningful Seascape visual design work when the goal is
to get Claude Design-quality direction without depending on Claude Design as the
only place where the thinking can happen.

This is a small process template, not a new agent or repo-local skill. Keep it
boxed here until it has helped on 2-3 real Seascape design tasks with rendered
proof.

## When To Use It

Use this for:

- homepage, owner page, stay page, guide page, article, or lander direction
- new reusable page-section patterns
- layout, hierarchy, imagery, CTA, motion, spacing, typography, or component
  treatment changes
- design exploration before Codex implements source changes

Do not use this for:

- copy-only edits
- schema-only work
- analytics or runtime work
- tiny visual fixes where `docs/process/design-review-workflow.md` is enough
- broad tool, agent, MCP, or skill expansion

## Source Order

Read these before filling the packet:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/process/agent-safety-standard.md`
4. `docs/process/git-session-rules.md`
5. `docs/status/current-state.md`
6. `DESIGN.md`
7. `docs/process/design-review-workflow.md`
8. one task-relevant source file, brief, route, screenshot, or portfolio doc

`DESIGN.md` is the visual law. This packet can propose a new design-system rule,
but implementation waits until that rule is accepted and written into
`DESIGN.md`.

## Intake Packet

Fill this before asking any design agent, model, or human reviewer for visual
direction.

```markdown
# Seascape Design Studio Intake

## Route Or Surface
- Path:
- Source file(s):
- Current URL or local preview:
- Current screenshots:

## Business Job
- Primary audience:
- Visitor decision this page must help:
- Business goal:
- What would make this design a win:

## Current State
- What works now:
- What feels weak, crowded, generic, or unclear:
- What must not change:

## Design Law From DESIGN.md
- Palette constraints:
- Typography constraints:
- Spacing and component constraints:
- Existing page or section pattern to preserve:
- Field Report standard relevance:

## Content And Proof Boundaries
- Claims that are already proven:
- Claims that must not be made:
- Copy source of truth:
- Whether this is reader copy, proof copy, or agent-only guidance:

## Assets
- Required real photos or current image sources:
- Missing asset decisions:
- Icon source, if needed:

## Responsive And Accessibility Requirements
- Mobile priority:
- Keyboard or focus states:
- Contrast or readability risks:
- Motion limits:

## Implementation Constraints
- Files likely touched:
- Routes that need screenshot proof:
- Build or smoke checks expected:
- Known risks:
```

## Design Output Format

The design pass should return a reviewable direction, not vague styling advice.
Use this shape:

```markdown
# Seascape Design Studio Output

## Current State
- What the route is trying to do:
- Main visual or decision-making weakness:

## Directions

### Direction 1: <name>
- Core idea:
- Layout and hierarchy:
- Imagery:
- CTA treatment:
- Interaction or memorable moment:
- Mobile behavior:
- Tradeoff:

### Direction 2: <name>
- Core idea:
- Layout and hierarchy:
- Imagery:
- CTA treatment:
- Interaction or memorable moment:
- Mobile behavior:
- Tradeoff:

### Direction 3: <name>
- Core idea:
- Layout and hierarchy:
- Imagery:
- CTA treatment:
- Interaction or memorable moment:
- Mobile behavior:
- Tradeoff:

## Recommendation
- Chosen direction:
- Why it best serves the page goal:
- What to reject from the other directions:

## Implementation Brief
- Section order:
- Component list:
- Typography and spacing notes:
- Color and surface notes:
- Image and asset notes:
- Hover, focus, selected, empty, loading, and error states:
- Desktop behavior:
- Mobile behavior:
- Files likely touched:

## Approval Gate
- What Sawyer must approve before implementation:
- Any `DESIGN.md` change required first:
- Any open question that would change layout, hierarchy, art direction, or CTA
  treatment:
```

## Approval Gate

Implementation can start only when the design output has one of these statuses:

- `approved as-is`
- `approved with named edits`
- `needs another design pass`
- `rejected`

If the approved direction changes layout, hierarchy, art direction, component
treatment, imagery direction, or CTA treatment, treat it as the implementation
contract. Codex should implement that direction closely and name any required
deviation before or during implementation.

Allowed reasons to deviate:

- `DESIGN.md` conflict
- accessibility issue
- mobile behavior issue
- performance issue
- missing or unsuitable asset
- source constraint in the current Eleventy templates or data

## Implementation Loop

```text
intake packet
  -> design directions
  -> Sawyer approval
  -> codex/<task> worktree
  -> source implementation
  -> build
  -> design-review workflow
  -> desktop and mobile screenshots
  -> user review
```

Work in `.worktrees/<task>` on a `codex/<task>` branch. Do not edit root
`main`. Do not edit `_site/`.

## Screenshot Proof

Before asking Sawyer to review the implementation, provide:

- exact route or routes to check
- desktop screenshot for every changed route
- mobile screenshot for every changed route
- any known screenshot artifact called out plainly
- what changed visually
- what remains known-bad, if anything

If the change touches sticky headers, fixed elements, popups, carousels, or
long scrolling sections, capture viewport-level screenshots in addition to any
full-page screenshots that might misrepresent the real browser state.

## Checks

Minimum checks:

- `npm run git:preflight` before source edits
- `npm run build` after implementation
- `npm run test:visual` for meaningful visual changes
- `npm run proof:visual` when screenshot proof is needed for review or PR
- `npm run lint:content` if public reader copy changed

Use `docs/process/before-user-review-checklist.md` before asking Sawyer to
review any rendered page.

## Promotion Gate

Do not promote this packet into `.agents/skills/` after one good run.

Promotion is allowed only after:

- it has been used on 2-3 real Seascape design tasks
- each task had desktop and mobile screenshot proof
- each task avoided rework that this packet clearly prevented
- the repeated steps are stable enough to automate
- the proposed skill would stay repo-local and narrow

If promoted, the skill should still point back to this document and
`docs/process/design-review-workflow.md` instead of becoming a second design
law.

## NOT In Scope

- copying or storing leaked system prompt text
- replacing Claude Design, Figma, Stitch, or designmd.directory when Sawyer
  explicitly chooses one for a task
- changing `DESIGN.md` without explicit approval
- adding a global Codex skill
- adding a repo-local skill before repeated proof exists
- changing source templates, CSS, imagery, or public copy during the design
  packet step
