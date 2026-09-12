---
name: next-batch-gate
description: Use when deciding whether a proposed Seascape batch may open under the current measurement gates.
---

# Next Batch Gate

Use this only for Seascape batch selection.

## Required Inputs

1. `docs/status/current-state.md`
2. `docs/status/next-batch.md`
3. `docs/status/open-risks.md`
4. `docs/status/search-growth-map.md`
5. the active brief if one exists
6. the latest joined operator read in `seascape-analytics` when freshness is part of the decision

## Gate Contract

- Treat `docs/status/next-batch.md` as the only canonical reread and branch-opening contract.
- `docs/status/current-state.md` is durable context, not the place to trust the latest volatile `data_date` or blocked-window detail.
- `docs/status/next-batch.md` must contain exactly one `Reread status` and one `Concrete next move`.
- Allowed reread statuses are only:
  - `blocked by freshness`
  - `fresh but below threshold`
  - `open next batch`
- If the status is `blocked by freshness`, do not invent a new batch from vibes.
- A freshness block applies to measured expansion, snippet/CTR claims, and
  impact claims. It does not block bounded SEO attack work that does not depend
  on the missing readback.
- Allowed attack-lane work during `blocked by freshness`: hygiene fixes,
  internal-link improvements, schema repairs, SERP gap research,
  competitor/query research, brief preparation for future execution, and
  source-truth cleanup that has its own proof.
- If attack-lane work is available, name it separately from the blocked proof
  lane. Do not collapse the answer to `wait` unless no bounded attack candidate
  survives source, SERP, and repo checks.
- A verdict is incomplete until the attack lane is `completed` or `none found
  after named checks`. Those named checks must cover a current source, SERP
  evidence, and competitor pages. Analytics unavailable, below threshold, or
  waiting for recrawl is not an attack-lane result.
- If the status is `fresh but below threshold`, do not invent a new SEO batch just because the data is fresh.
- Favor one bounded branch over parallel SEO lanes.
- Route analytics freshness questions back to `seascape-analytics`, not to a site-wide audit here.

## Decision

Name the proposed branch and page family, check its authorization and open
risks, and use the matching query family/current URL in the search-growth map.
Return one verdict matching the repo contract, plus a separate attack-lane
action when one survives the required checks. A gate review does not itself
authorize implementing that action.

## Output

Include:
- verdict
- reread status
- evidence lines from the status docs
- query family and current URL from `docs/status/search-growth-map.md`
- proof-lane block, if any
- attack-lane action, if any
- exact next action
- whether a new brief should open
- attack status, inspected query variants, dated SERP source, competitor URLs,
  content and design strategy, tool route, and decision reason
