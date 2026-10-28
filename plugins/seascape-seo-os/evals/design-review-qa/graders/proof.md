---
type: llm
weight: 2
---

A strong answer:
- Calls for rendered checks of the changed pages at both desktop and mobile widths, not just reading the CSS.
- Checks the change against the site's design rules (DESIGN.md colors, spacing, components), including button contrast and accessibility.
- Names concrete proof for the PR: fresh desktop and mobile screenshots and the visual regression test run, with baselines updated only when the change is intended.
- Makes clear that in-scope failures (found in the diff or by the checks) get
  fixed before the PR goes to a human reviewer. Any wording that sets that
  order counts, such as "fix these before you run QA" or "fix and rerun
  before you request review". Only requiring a passing check does not count.
Score low if it only lists generic QA tips with no proof the PR must carry.
