---
name: next-batch-gate
description: Decide whether a proposed Seascape SEO, GEO, CRO, or performance branch should open by checking the current repo gate in `docs/status/next-batch.md`, `docs/status/current-state.md`, and `docs/status/open-risks.md`. Use when the user asks what to work on next, wants to open an owner/stay/guide batch, or proposes expansion, rewrite, or audit work that may conflict with the current `hold-and-reread` rule.
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

- Treat `docs/status/next-batch.md` as the branch-opening contract.
- If it says `hold-and-reread`, do not invent a new batch from vibes.
- Favor one bounded branch over parallel SEO lanes.
- Route analytics freshness questions back to `seascape-analytics`, not to a site-wide audit here.

## Decision Flow

1. Name the proposed branch and page family.
2. Check whether `docs/status/next-batch.md` already authorizes it.
3. Check `docs/status/open-risks.md` for blockers that must be resolved first.
4. If the gate depends on Search Console, GA4, or BigQuery freshness, state the exact missing proof and stop there.
5. Return one verdict: `open now`, `wait`, or `prep only`.

## Common Blocks

- owner or stay work without a fresh joined read
- site-wide audits when the docs already say `hold-and-reread`
- new guide or entity expansion before thresholds clear
- branch ideas that ignore open truth or proof drift

## Output

Include:
- verdict
- evidence lines from the status docs
- exact next action
- whether a new brief should open
