# Card 2 — Hold-Escalation: analytics-repo handoff

Cross-repo half of Card 2 from `docs/plans/2026-06-13-demand-os-handoff.md` §4.
The SITE half (the `## Owner Outbound Escalation` section in
`docs/status/next-batch.md`) ships in this repo. This file specifies the
`seascape-analytics` change so it can be executed in a session scoped to that
repo. **No site code depends on this landing first** — the site section is
forward-compatible and is only *pointed at* by the generated line once this
ships.

## Owner lane

ANALYTICS (the receipt/generator logic). Name it as a cross-repo change in the
analytics PR.

## The change

In `weekly_search_operator_report.py`, function `build_concrete_next_move`
(around lines 1192-1203), add an owner-state branch.

- Today `build_concrete_next_move` is a hardcoded 3-arg function with no
  owner-state branch (verified in the demand-OS handoff §3).
- Key the escalation off the **current-window** owner sub-gate value already
  computed at `recommend_next_branch` (around lines 722-728). Do **not** add a
  persistence counter or any net-new cross-window state — the sub-gate
  condition is effectively permanent, so a dynamic counter would just detect a
  constant.
- When the owner cluster is sub-gate in the current window, set the
  `concrete_next_move` text to a single line:

  > owner cluster cannot clear by waiting — run this week's outbound batch
  > (see ## Owner Outbound Escalation below). A test send is not a lead.

  Keep it one line (the site contract test asserts exactly one
  `- Concrete next move:` line, and the sync script renders this value into
  that single line).

## Invariants (do not break)

- `reread_status` stays pinned to `fresh but below threshold` when the owner
  cluster is sub-gate. It must remain one of the three allowed values
  (`blocked by freshness`, `fresh but below threshold`, `open next batch`).
- `next_branch` stays `hold-and-reread`. **Never** `open next batch` on the
  strength of an outbound send.
- The receipt still renders through
  `sync-next-batch-from-analytics-receipt.js`; that script rewrites only the
  `## Latest Execution Read` region, so the generated next-move line and the
  hand-authored `## Owner Outbound Escalation` section coexist without
  collision.
- Honor the cross-repo contract locks in
  `docs/plans/2026-06-12-v1-implementation-handoff.md` §5 (do not rename live
  `/.netlify/functions/*` paths, `receipts[]` field names, or `verify:*`
  script names).

## Tests

- Analytics unit test: when the owner cluster is sub-gate in the current
  window, `build_concrete_next_move` returns the escalation line **and**
  `reread_status` stays within the 3-value enum and `next_branch` stays
  `hold-and-reread`. Add a negative case proving it never emits
  `open next batch` from this branch.
- Site cross-check (this repo): a sample `next-batch.md` synced from a
  sub-gate receipt shows the escalation next-move line and still passes
  `scripts/enforcement/status-doc-contract.test.js` (exactly one reread-status
  line, exactly one concrete-next-move line) and `npm run verify:release`.

## Acceptance

Analytics unit test green; a sample synced `next-batch.md` shows the escalation
line and still passes the contract test; `reread_status` never leaves the enum
and `next_branch` never becomes `open next batch`. Open the analytics change as
its own PR on a `codex/owner-outbound-escalation` branch; stop for review
before merge.
