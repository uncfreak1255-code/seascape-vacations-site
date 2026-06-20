---
name: internal-link-targeting
description: Analyze the repo internal link graph and propose target inbound-link counts by page family and by page, with a prioritized donor plan. Use when owner/stay/guide families show authority imbalance, when internal linking is named as a bottleneck, or when an execution-ready internal-link plan is needed.
---

# Internal Link Targeting

Use this skill to produce a measurable internal-link plan from repo source.

## Workflow

1. Run the analyzer script.
2. Review family imbalance first (owner vs guide is the default pressure lane).
3. Set family-level inbound targets.
4. Set page-level target gaps for underlinked pages.
5. Produce candidate donor-page suggestions and execution order.
6. Verify each target route's indexability, intent, and sentence fit in the
   active brief before changing source links.

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

## Output Contract

Return:

1. Family inbound summary: current vs target.
2. Top underlinked pages with gap to target.
3. Candidate donor-page suggestions per priority target.
4. A single execution sequence: highest impact first.

## References

- Family mapping defaults: `references/family-mapping.md`
