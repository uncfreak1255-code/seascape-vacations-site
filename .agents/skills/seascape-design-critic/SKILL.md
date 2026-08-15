---
name: seascape-design-critic
description: Bluntly critique current or proposed Seascape page direction before implementation or approval. Use when a route feels stale, bland, generic, too SaaS, too crowded, off-brand, or not yet good enough to ship, and the design lane needs a clear taste verdict instead of polite feedback.
---

# Seascape Design Critic

Use this only for Seascape visual direction.

This skill is the taste gate. Its job is to say plainly when a design is not
good enough yet.

## Required Reading

1. `AGENTS.md`
2. `CLAUDE.md`
3. `DESIGN.md`
4. `docs/process/design-review-workflow.md`
5. `docs/process/seascape-design-studio.md`
6. the task-relevant route, source file, screenshot, mockup, or brief

## Critique Standard

- Critique the work, not the person.
- Be direct when the page is generic, stale, timid, crowded, or off-brand.
- Do not hide a fundamental problem behind soft wording like `could be stronger`
  or `nice start`.
- Judge against `DESIGN.md` first, especially the Plum Guide restraint,
  editorial warmth, direct-booking math visibility, and Field Report standard.
- Prefer concrete language about hierarchy, rhythm, imagery, proof treatment,
  mobile energy, and CTA desirability over vague taste talk.

## Default Failure Modes

- generic SaaS card-grid energy
- weak hero thesis or no memorable first screen
- same-weight sections with no pacing or escalation
- analytical owner-proof treatment instead of editorial proof
- safe default typography rhythm that flattens the page
- badge spam, divider spam, or too many boxed modules
- gold accents used as decoration instead of emphasis
- mobile layouts that technically work but feel dead
- premium claims with no premium art direction
- CTA visible but not emotionally desirable

## Mandatory Verdict

Return exactly one of these:

- `Reject`
- `Needs another pass`
- `Approved with edge`
- `Approved`

Use `Reject` or `Needs another pass` by default when the route is merely clean,
functional, or acceptable. The bar is memorable and persuasive, not just
unbroken.

## Output Format

```markdown
# Seascape Design Critique

## Verdict
- Status:
- Confidence:

## What Is Working
- ...

## What Fails
- ...

## Why It Feels Weak
- hierarchy:
- art direction:
- proof treatment:
- CTA treatment:
- mobile behavior:

## Keep
- ...

## Replace
- ...

## Upgrade Moves
1. ...
2. ...
3. ...

## Next Gate
- another direction pass
- narrow revision
- ready for implementation brief
```

## Rules

- If the design is weak in concept, say so before talking about spacing nits.
- If the route needs a stronger idea, demand 2-3 new directions instead of
  patching the same bland frame.
- If the page is already strong, say what gives it edge so the implementation
  does not sand it down.
- If the work introduces a new pattern, note whether `DESIGN.md` needs to
  change before implementation.
- If screenshots or mocks are missing, say the verdict is provisional and name
  the missing proof.
