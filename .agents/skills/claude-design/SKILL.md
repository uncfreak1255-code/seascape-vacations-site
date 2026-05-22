---
name: claude-design
description: "Use when a task is mainly about design direction, visual exploration, design critique, or implementation-ready UI specification and Codex should hand the design thinking to the Claude Design web workspace at claude.ai/design via Claude in Chrome, then bring the chosen direction back for Codex implementation and verification. Triggers: design this, what should this look like, review the design, give me options, prepare a UI spec, send this to Claude design, have Claude handle the design part."
---

# Claude Design

Codex owns repo truth, user alignment, implementation, and verification.
Claude Design owns bounded design thinking only: exploration, critique, comparison,
and implementation-ready visual specs.

This repo vendors the upstream global `claude-design` skill here on purpose.
Keep `/Users/sawbeck/.codex/skills/claude-design` as the upstream source and sync
both surfaces intentionally when the bridge behavior changes.

This skill now uses the Claude Design web workspace at `https://claude.ai/design`
through Claude in Chrome. It is not the old local-only Claude CLI packet lane.

Use this skill when design is the bottleneck and code should wait until the design
decision is sharper.

## Do Use It For

- generating 2-3 real visual directions for a feature or page
- critiquing an existing UI before implementation or polish
- comparing candidate directions and choosing one
- translating a chosen direction into a Codex-ready implementation brief

## Do Not Use It For

- tiny styling tweaks Codex can do directly
- tasks that are already implementation-only
- direct Figma file editing when the Figma plugin is the real source of truth
- repo changes on protected or dirty branches without the repo's normal guardrail flow

## Inputs Codex Must Gather First

1. The concrete design objective.
2. The owning repo path.
3. The local design truth:
   `DESIGN.md`, tokens, theme files, existing components, screenshots, or relevant
   pages.
4. Hard constraints:
   brand, scope, assets, accessibility, mobile, and "do not touch" boundaries.
5. The requested mode:
   `explore`, `critique`, `compare`, or `implementation-spec`.

If any of these are missing, say so plainly instead of asking Claude to invent them.

## Workflow

1. Inspect local repo truth before handoff.
2. Pick the narrowest mode that fits the task.
3. Run the bridge:

```bash
python3 .agents/skills/claude-design/scripts/run_claude_design.py \
  --repo /abs/path/to/repo \
  --mode explore \
  --task "Design a sharper hero for the pricing page" \
  --context path/to/DESIGN.md \
  --context src/components/Hero.tsx \
  --output /tmp/claude-design.json \
  --markdown-out /tmp/claude-design.md
```

4. The bridge must preflight `claude --chrome` and `https://claude.ai/design`
   before the real handoff.
5. The bridge must fail loudly if Chrome integration is unavailable, the Design
   workspace is signed out or blocked, or the web handoff cannot be confirmed.
6. Review the returned packet yourself before showing it to the user.
7. Reject or revise if the output is generic, off-brand, vague, implementation-heavy,
   or clearly came from Claude Code without the web Design workspace.
8. Present the user with the winner and the practical next decision.
9. Only after the user agrees on the direction, Codex implements locally and verifies
   the rendered result.

There is no silent fallback to the old local-only CLI design packet path.

## Return Contract

The bridge expects a structured design packet with:

- handoff receipt from `claude.ai/design`
- whether the existing design system was visible and used
- current state summary
- distinct directions or critique findings
- one recommended direction
- an implementation brief Codex can build from
- open questions and concrete risks
- readiness status and the next Codex action

## Failure Modes To Watch For

- generic "clean modern intuitive" filler
- directions that are not meaningfully distinct
- advice that ignores the repo's existing design law
- implementation bleed: Claude starts coding instead of designing
- local CLI answer masquerading as a Claude Design web handoff
- no mobile or state coverage
- invented assets, tokens, or repo conventions
- a pretty idea with no Codex-ready implementation brief

If one of these appears, revise locally or rerun with tighter context instead of
pretending the packet is ready.

## Autoresearch Lane

When creating or upgrading this skill itself, run the bounded evaluation loop:

```bash
python3 .agents/skills/claude-design/scripts/autoresearch.py \
  --scenarios .agents/skills/claude-design/references/scenarios.example.json \
  --out-dir ~/.codex/evaluations/claude-design/latest
```

That loop runs real design tasks through the bridge, captures artifacts, scores
mechanical pass/fail criteria, and produces a failure digest for the next patch.

Read [references/research-notes.md](references/research-notes.md) when you need the
why behind this shape instead of the how.
