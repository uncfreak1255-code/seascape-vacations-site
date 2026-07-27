# SEO Loop Keep/Kill/Rewire

Date: 2026-07-26
Mode: agent-surface audit result
Scope: Seascape SEO scheduled-task and automation loops
Repo: `seascape-vacations-site`

## Verdict

Cleanup first. Do not add another SEO agent, workflow, plugin, crawler, or
dashboard.

The live operating spine is already better than the old scheduled-task stack:
`seascape-analytics` measures, the next-batch receipt decides, this repo syncs
`docs/status/next-batch.md`, and source work opens only through a brief or a
bounded regression-rescue lane.

The problem is not missing automation. The problem is that too many old
scheduled tasks still look active even though their outputs do not feed a safe
execution path.

## Current Proof

- `docs/status/current-state.md` says owner acquisition is the main bottleneck,
  direct-book conversion is second, and new page volume is not the default answer.
- `docs/status/next-batch.md` currently says `fresh but below threshold` and
  names owner-direct, permissioned signal qualification as the concrete next
  move. It also forbids new owner, stay, guide, GEO, or SEO expansion branches
  from the current read.
- `.claude/agents/` already has the five SEO OS roles. The repo-local skill
  layer is already limited by `AGENTS.md` and `docs/process/skill-policy.md`.
- The active Codex automations already perform the stronger measurement and
  decision work:
  - `seascape-weekly-seo-gsc-audit`
  - `seascape-next-batch-decision-receipt`
- The July 21 next-batch automation produced a newer hold-and-reread receipt,
  but the site projection PR remained blocked by unchanged dependency-audit CI.
  Until that lands, the committed site status remains the July 14 read.

## Keep As Live Spine

| Loop | Owner | Why keep it | Output |
| --- | --- | --- | --- |
| Weekly SEO/GSC audit | Codex automation in `seascape-analytics` | Pulls real GSC, GA4, URL inspection, validators, PageSpeed when available, and can carry one bounded technical repair | Automation memory plus measurement receipts |
| Next-batch decision receipt | Codex automation in `seascape-analytics` with Hub/Site projections | The only measured branch-opening decision loop | Hub receipt plus synced `docs/status/next-batch.md` |
| Next-batch gate | `seascape-vacations-site` | Canonical site handoff surface for whether to build, rescue, or hold | `docs/status/next-batch.md` |
| Regression-rescue lane | `seascape-vacations-site` | Allows bounded fixes to already-live winners or money pages without reopening broad expansion | Brief under `docs/briefs/` plus normal proof gates |
| Owner-direct intake lane | `seascape-vacations-site` skill, private follow-up outside this public repo | Matches the actual business bottleneck without storing named owner candidates in the public site repo | Founder decision card only; no named candidate state here |

## Archive Or Leave Off Schedule

These can remain on disk as historical prompts, but should not be treated as
live loops unless a fresh owner lead, direct-booking signal, or next-batch
receipt creates a specific trigger.

| Scheduled task | Current state | Decision |
| --- | --- | --- |
| `content-quality-patrol` | Dormant | Defer. Useful only as a shipped-page slop spot-check after a named page family matters again. |
| `conversion-optimization-patrol` | Dormant | Defer. Useful only when a live conversion surface has enough sessions to inspect. |
| `geo-citation-audit` | Dormant | Defer. Useful only if AI citation tracking needs its own cadence beyond analytics receipts and quarterly audit. |
| `monthly-seo-summary` | Dormant | Defer. Summary-only; does not open or close work. |
| `outreach-execution-reminder` | Dormant | Rewire candidate, but only if it targets permissioned link-building or owner-approved outreach drafts and uses the allowed email system. |
| `seasonal-content-calendar` | Active/unmarked | Downgrade to planning-only. It should not imply page creation while `next-batch.md` is below threshold. |
| `seo-monthly-competitor-geo-audit` | Active/unmarked with May/June/July logs | Keep as a read-only feeder, but its output should feed a decision memo or next-batch input, not free-floating strategy prose. |
| `seo-quarterly-full-audit` | Active/unmarked | Keep as a quarterly snapshot only. It should not create work by itself. |
| `seo-weekly-strategy-loop` | Active/unmarked, no decision memos on disk | Fix or disable. As written it is the right shape, but there is no observed output yet. |

## Keep Disabled

These tasks conflict with current repo law or are already replaced by stronger
proof.

| Scheduled task | Why disabled |
| --- | --- |
| `internal-linking-rebuild` | Retired. It edits pages and pushes directly to `main`, and it uses the legacy deploy folder as source truth. Internal-link planning belongs to `.agents/skills/internal-link-targeting`. |
| `pseo-page-builder` | Retired. It creates pages and pushes directly to `main`, bypassing briefs, content gate, and next-batch clearance. |
| `seo-content-creation` | Retired. Same unsafe direct page-creation path; public content belongs to the brief/gate workflow. |
| `page-speed-monitor` | Superseded by `perf:budget:check`, `perf:psi`, and CI. File-size proxy is obsolete. |
| `rank-performance-tracker` | Superseded by `seascape-weekly-seo-gsc-audit`, which has real BigQuery/GSC/GA4 receipts. |
| `seo-weekly-health-check` | Superseded by deterministic validators: `verify:redirects`, `verify:links`, and `verify:jsonld`. |

## Rewire Rule

Any future scheduled task must land in one of these buckets:

1. Measurement receipt: writes machine-readable proof in the owning repo.
2. Decision receipt: updates `docs/status/next-batch.md` or a Hub receipt from
   analytics truth.
3. Bounded rescue brief: opens one existing-page repair lane with named proof.
4. Owner-direct intake: returns a founder decision card without persisting named
   candidate state in this public repo.
5. Read-only feeder: writes to a known consumer, not just a task log.

If a loop cannot name its consumer, stop it.

## First Safe Cleanup Step

Do not edit `~/.claude/scheduled-tasks` from this repo branch. That is a global
automation boundary.

The first executable cleanup should be a separate global-automation change that:

1. leaves `seascape-weekly-seo-gsc-audit` and
   `seascape-next-batch-decision-receipt` active;
2. keeps `indexation-health-monitor`, `seo-monthly-competitor-geo-audit`, and
   `seo-quarterly-full-audit` as read-only feeders/snapshots;
3. disables or archives the retired/superseded scheduled tasks listed above;
4. either proves `seo-weekly-strategy-loop` can produce a decision memo, or
   disables it until a consumer is wired;
5. treats `seasonal-content-calendar` as advisory only unless `next-batch.md`
   says `open next batch` or a regression-rescue brief names the page.

## Stop Conditions

- Do not delete or edit global scheduled-task files without an explicit
  global-automation approval.
- Do not turn this cleanup into a new SEO strategy audit.
- Do not create new page builders while the next-batch gate is below threshold.
- Do not store named owner candidate details in this public site repo.
- Do not count drafts, tests, labeled replies, or helper submissions as owner
  demand.
