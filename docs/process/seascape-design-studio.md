# Seascape Design Studio

Use this packet for the repo-local `seascape-design-specialist` lane when the
goal is a high-bar Seascape design pass that can still borrow outside taste
pressure without depending on a global tool bundle.

This is now a live repo-local lane. It exists because clean, functional Codex
design work was still too willing to ship bland or generic direction.

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

## Launcher

Use one of these commands from the repo when you want the local design lane
prewired:

- `npm run design:lane -- "<task>"`
- `./scripts/design/codex-seascape-design "<task>"`
- `npm run design:donors -- "<task>"` to inspect the family route and local
  donor matches without opening a worktree
- add `--family comparison|field-journal|planning|destination-overview|site-page`
  when automatic family detection needs an explicit override
- add `--prepare` to create or inspect the lane without launching Codex
- add `--allow-fallback` only when you intentionally want a plain git worktree
  lane after `agent-start` blocks on dirty review-worktree limits

The launcher prefers `agent-start`. If the broker refuses because dirty review
worktrees already need cleanup, the default command now stops and tells you so
instead of silently bypassing that guardrail.

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

## Guide Design Families

Guides share Seascape's design language, not a locked photo-and-copy template.
The design lane chooses one family before concept work:

| Family | Visitor job | Flexible shape | Useful donor capability |
| --- | --- | --- | --- |
| Comparison guide | Choose between two places | Verdict-led comparison axes, flexible photography, optional map or travel-time artifact | Interface direction plus visual artifacts |
| Field journal guide | Understand what a place or season feels like | Observation-led editorial pacing, photography, local callouts | Interface and imagery art direction |
| Planning guide | Finish a trip-planning task | Checklist, sequence, itinerary, timeline, or map | Interface direction plus visual artifacts |
| Destination overview guide | Orient to an area | Map-led browsing, varied photo rhythm, clear next paths | Interface, visual artifacts, and imagery |

Keep brand feel, typography, palette discipline, spacing quality, CTA quality,
mobile quality, trust/proof treatment, and booking handoff consistent. Let hero
style, photography placement, section order, comparison/checklist/itinerary
structure, and the memorable moment change when the guide job calls for it.

## Local Donor Discovery

The launcher scans locally cached Codex and Claude marketplace/plugin skill
frontmatter on every run. This lets the lane discover a strong interface,
product-design, imagery, map, chart, comparison, or interactive-artifact donor
without Sawyer maintaining a global bundle.

The scan is metadata-only and read-only. A discovered path is not proof that a
skill is installed, callable, safe, or authoritative. Invoke a donor only when
the current agent session exposes it as available; otherwise keep it as a
candidate reference and do not claim it ran. Never auto-install, vendor, copy,
or promote a donor from this scan.

`frontend-design`-style donors are preferred for a distinctive concept pass.
`visualize`-style donors are preferred when a map, chart, comparison artifact,
or interactive explainer materially helps the visitor decide. Figma,
standalone site builders, and imagery generators require an explicit task need.

Figma is optional and donor-only unless Sawyer explicitly wants it for a task.

Any donor output must be rewritten into this packet and brought back under
`DESIGN.md` plus repo truth before implementation.

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

## Critique Gate

Before settling on a direction, run `seascape-design-critic` on the current
route, the proposed mockup, or the first concept.

Allowed verdicts:

- `Reject`
- `Needs another pass`
- `Approved with edge`
- `Approved`

Rules:

- Do not implement from `Reject` or `Needs another pass`.
- Do not soften the verdict because the layout is clean or already partly built.
- Attack the real weakness first: concept, hierarchy, art direction, proof
  treatment, CTA desirability, or mobile energy.
- If the design is weak in concept, demand 2-3 materially different directions
  instead of cosmetic tweaks.

## Design Output Format

The design pass should return a reviewable direction, not vague styling advice.
Use this shape:

```markdown
# Seascape Design Studio Output

## Critique
- Status:
- What the route is trying to do:
- What feels stale, generic, weak, or too safe:
- What is worth keeping:

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
- Sawyer approval status:
- What Sawyer must approve before implementation:
- Any donor-tool influence worth naming:
- Any `DESIGN.md` change required first:
- Any open question that would change layout, hierarchy, art direction, or CTA
  treatment:

## Proof Plan
- Routes to check:
- Desktop screenshots needed:
- Mobile screenshots needed:
- Visual checks:
```

## Approval Gate

Implementation can start only when the design output has one of these statuses:

- `Approved`
- `Approved with edge`

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
  -> critic verdict
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

## Local Status

This packet now underpins the repo-local `seascape-design-specialist` and
`seascape-design-critic` skills. Keep future expansion narrow, repo-local, and
evidence-backed.

## NOT In Scope

- copying or storing leaked system prompt text
- replacing a tool Sawyer explicitly chooses for a task
- changing `DESIGN.md` without explicit approval
- turning donor tools into hard dependencies
- adding a global Codex skill
- changing source templates, CSS, imagery, or public copy during the design
  packet step
