---
name: next-batch-gate
description: Decide whether a proposed Seascape SEO, GEO, CRO, or performance branch should open by checking the current repo gate in `docs/status/next-batch.md`, `docs/status/current-state.md`, and `docs/status/open-risks.md`. Use when the user asks what to work on next, wants to open an owner/stay/guide batch, or proposes expansion, rewrite, or audit work that may conflict with the current reread status contract.
---

# Next Batch Gate

Use this only for Seascape batch selection.

## Required Inputs

1. `docs/status/current-state.md`
2. `docs/status/next-batch.md`
3. `docs/status/open-risks.md`
4. the active brief if one exists
5. the latest joined operator read in `seascape-analytics` when freshness is part of the decision

## Gate Contract

- Treat `docs/status/next-batch.md` as the only canonical reread and branch-opening contract.
- `docs/status/current-state.md` is durable context, not the place to trust the latest volatile `data_date` or blocked-window detail.
- `docs/status/next-batch.md` must contain exactly one `Reread status` and one `Concrete next move`.
- Allowed reread statuses are only:
  - `blocked by freshness`
  - `fresh but below threshold`
  - `open next batch`
- If the status is `blocked by freshness`, do not invent a new batch from vibes.
- If the status is `fresh but below threshold`, do not invent a new SEO batch just because the data is fresh.
- Favor one bounded branch over parallel SEO lanes.
- Route analytics freshness questions back to `seascape-analytics`, not to a site-wide audit here.

## Decision Flow

1. Name the proposed branch and page family.
2. Read the exact `Reread status` and `Concrete next move` in `docs/status/next-batch.md`.
3. Check whether `docs/status/next-batch.md` already authorizes the proposed branch.
4. Check `docs/status/open-risks.md` for blockers that must be resolved first.
5. If the gate depends on Search Console, GA4, or BigQuery freshness, state the exact missing proof and stop there.
6. Return one verdict matching the repo contract: `blocked by freshness`, `fresh but below threshold`, or `open next batch`.

## Common Blocks

- owner or stay work without a fresh joined read
- site-wide audits when the docs still say `blocked by freshness` or `fresh but below threshold`
- new guide or entity expansion before thresholds clear
- branch ideas that ignore open truth or proof drift

## Output

Include:
- verdict
- reread status
- evidence lines from the status docs
- exact next action
- whether a new brief should open
