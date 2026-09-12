---
name: internal-link-targeting
description: Use when analyzing Seascape internal links for authority imbalance and a prioritized donor plan.
---

# Internal Link Targeting

Use this skill to produce a measurable internal-link plan from repo source.

## Command

```bash
python3 .agents/skills/internal-link-targeting/scripts/analyze_internal_link_graph.py --repo <repo-path>
python3 .agents/skills/internal-link-targeting/scripts/analyze_internal_link_graph.py --repo <repo-path> --format json
```

## Targeting Rules

- Use guide-family average inbound links as the baseline unless the brief says otherwise.
- Prioritize owner-family gap closure before broad guide expansion.
- Exclude generated template sources, noindex pages, redirect sources,
  templated placeholders, and non-routable links from the graph.
- Recommend donor links from high-authority guide pages first, then research/support pages.
- Do not count footer-only or nav-only links as the primary remediation lane.
- Treat analyzer output as planning input, not permission to link. The active
  brief still owns business priority, conversion fit, and final target choice.

Before source link changes, verify target indexability, intent, and sentence
fit against the active brief.

## Output Contract

Return:

1. Family inbound summary: current vs target.
2. Top underlinked pages with gap to target.
3. Candidate donor-page suggestions per priority target.
4. A single execution sequence: highest impact first.

## Reference

Use [family mapping](references/family-mapping.md) when interpreting or changing
route-family classification.
