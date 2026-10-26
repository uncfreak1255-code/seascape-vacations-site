---
type: llm
weight: 2
---

A strong answer:
- Calls for rendered checks of the changed pages at both desktop and mobile widths, not just reading the CSS.
- Checks the change against the site's design rules (DESIGN.md colors, spacing, components), including button contrast and accessibility.
- Names concrete proof for the PR: fresh desktop and mobile screenshots and the visual regression test run, with baselines updated only when the change is intended.
- Says to fix in-scope failures before asking for human review.
Score low if it only lists generic QA tips with no proof the PR must carry.
