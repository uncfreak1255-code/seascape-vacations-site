# Claude Design Research Notes

## Goal

Claude Design exists to let Codex offload design thinking, critique, and option generation to a bounded Claude Design web lane while keeping repo truth, final implementation, and verification in Codex. Inputs are a concrete UI objective, the owning repo path, the active design law or token sources, relevant components or screenshots, and hard constraints. Outputs are a structured design packet with distinct directions or critique findings, one recommended direction, explicit risks and questions, an implementation-ready brief Codex can build from after user approval, and a verifiable handoff receipt from `claude.ai/design`. Failure modes are generic AI-slop aesthetics, ignoring repo design truth, drifting into implementation or code edits, missing mobile or state coverage, inventing assets or system rules, returning vague advice instead of a decision-ready brief, or silently answering from Claude Code without actually reaching the Design workspace.

## Named Sections

### 1. Source Pattern

- Keep the mutable surface small.
- Keep evaluation bounded.
- Keep artifacts inspectable.
- Keep implementation ownership separate from design exploration.

### 2. Inputs

- objective
- repo path
- mode: `explore`, `critique`, `compare`, `implementation-spec`
- design truth files
- hard constraints
- optional screenshots or example URLs

### 3. Outputs

- structured JSON packet for machine reliability
- optional markdown rendering for human scanability
- Claude Design handoff receipt with workspace URL and design-system visibility
- recommended direction
- Codex-ready implementation brief
- failure digest when running the evaluation loop

### 4. Architecture

- Codex skill:
  orchestrator and gatekeeper
- Claude skill:
  design specialist, output only
- bridge script:
  `claude --chrome` handoff into `https://claude.ai/design` with preflight and schema validation
- autoresearch harness:
  repeatable evaluation over multiple real tasks

### 5. Stress Test Questions

- What if the repo has no design law?
- What if the returned directions are cosmetic variants of the same idea?
- What if Claude ignores repo components and invents a new system?
- What if the packet is pretty but not implementable?
- What if mobile, loading, empty, or error states are skipped?
- What if a Figma file is the real source of truth and this lane should defer?

### 6. Practical Examples

- "Explore three hero directions for a vacation landing page using the current token system."
- "Critique an existing operator dashboard and give top three visual fixes."
- "Turn the chosen checkout direction into a component/state brief Codex can implement."

## Research Findings

### Karpathy Pattern

`karpathy/autoresearch` keeps one mutable file, one fixed time budget, one metric,
and a log of experiments. The useful transferable idea here is not ML-specific:
keep the experimental surface tiny, the evaluation loop bounded, and the morning
artifact inspectable.

### Anthropic Mechanics

Claude Code's personal skills and subagents are real user-level surfaces. The docs
also make the context boundary explicit: subagents are useful when side work would
pollute the main conversation, and skills can be invoked explicitly or loaded from
user-level paths.

### Figma + Design Context

Figma's MCP guide emphasizes that AI quality depends on design context quality:
reused components, variables, semantic layer names, auto layout, and annotations.
That maps directly to this skill's "inspect design truth first" rule.

### Public Workflow Repos

Production-tested public Claude workflow repos consistently converge on the same
themes:

- progressive disclosure
- file-based persistence
- bounded specialization
- explicit review before ship

### Design Skill Ecosystem

Public design-skill registries have converged on a split between machine-facing
`SKILL.md` and human-facing design intent. This package keeps the same split, but
uses a smaller reference note instead of a second full design-law file because the
purpose here is orchestration, not a universal design system.

## References

- OpenAI skills repo: https://github.com/openai/skills
- OpenAI skill creator guidance: https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md
- Karpathy autoresearch: https://github.com/karpathy/autoresearch
- Claude Code skills docs: https://code.claude.com/docs/en/slash-commands
- Claude Code subagents docs: https://code.claude.com/docs/en/sub-agents
- Claude Code hooks docs: https://code.claude.com/docs/en/hooks
- Figma MCP server guide: https://github.com/figma/mcp-server-guide
- Claude Code Toolkit: https://github.com/applied-artificial-intelligence/claude-code-toolkit
- Claude design review skill example: https://github.com/jezweb/claude-skills/blob/main/plugins/frontend/skills/design-review/SKILL.md
- Awesome Design Skills: https://github.com/bergside/awesome-design-skills
