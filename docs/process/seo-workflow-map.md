# SEO Workflow Map

One map of Seascape's SEO and AEO workflows, shared by Claude and Codex. It
names what runs on its own, what an agent runs on request, and which skill or
role owns each step. Process detail lives in the linked docs; this page only
routes. Verified 2026-11-23; re-verify the scheduled rows before relying on
them.

## Recurring SEO Jobs

| Job | Where | What it does | Re-verify |
| --- | --- | --- | --- |
| Local OpenSEO app | launchd `com.sawbeck.open-seo-review` on Sawyer's Mac | Serves the OpenSEO app and MCP at `http://localhost:3001/mcp` | `launchctl list com.sawbeck.open-seo-review` |
| OpenSEO scheduler tick | launchd `com.sawbeck.open-seo-review-scheduler`, every 15 minutes | Runs OpenSEO's own scheduled work: the saved weekly rank tracker and the weekly AI-visibility tracker (ChatGPT, Gemini, Google AI Overviews). Paid schedules exist only when Sawyer approved them | `launchctl print gui/501/com.sawbeck.open-seo-review-scheduler`; `get_rank_tracker` and `get_ai_visibility_tracker` show `scheduleInterval` and `nextCheckAt` |
| Weekly search drop check | launchd `com.seascape.seo-weekly-drop-check`, Mondays 07:47 Eastern; plist owned by `seascape-ops`, script owned by `seascape-analytics` | Compares the last 28 days of Search Console clicks with the 28 days before for each page with 10+ prior clicks. A page down 30% or more puts one card on Sawyer's docket and replaces the prior week's card | `launchctl print gui/501/com.seascape.seo-weekly-drop-check` |
| Weekly index coverage check | Claude Desktop scheduled task `weekly-index-coverage-check`, Mondays 10:13 local time | Free, read-only `inspect_urls` pass over every `/stays/` and `/guides/` address in the live sitemap. Files or comments on one open "Index check:" issue in this repo when a page is not indexed, has a canonical mismatch, or the check cannot run. Never requests indexing | Claude Desktop scheduled-tasks list; the latest comment on the open "Index check:" issue |
| Weekly SEO verdicts and opportunity hunt | Claude scheduled task `Weekly SEO verdicts and opportunity hunt (Site)`, Sundays 18:37 Eastern (agent-issues #80; hunt added 2026-11-23) | Part A judges due entries in `docs/status/page-ledger.json` with free Search Console reads and lands one "SEO verdicts" PR; a harm verdict on a held guide or new page becomes a ready-for-human issue instead of a revert. Part B reads Search Console and GA4, picks at most one SEO or AEO fix (near page one, weak snippet) outside held guides, new pages and pages still settling, and lands it as "SEO fix" with its ledger entry; at most one paid lookup within the Cost Boundary. Conversion changes are not approved: a traffic-without-bookings page becomes one ready-for-human issue | Claude scheduled-task list; the latest "SEO verdicts" and "SEO fix" PRs |

This table covers recurring SEO jobs, not every Site or GitHub schedule.
One-time rechecks (for example a single page's index recheck) are Claude
Desktop or Claude scheduled tasks that disable themselves after firing; list
them there rather than recording them here. Codex automations held no SEO job
on 2026-11-20. Retired Claude Desktop SEO tasks (the March 2026 content,
audit and patrol set, and the old `indexation-health-monitor`) are disabled on
purpose; do not re-enable them. The
Analytics weekly operator report (`scripts/weekly-search-operator-report.sh`)
runs on request and needs the BigQuery CLI. Site workflows under
`.github/workflows/` separately test, preview, publish, and check live pages;
inspect their current triggers before making schedule claims. This map does
not add or enable any schedule.

## What An Agent Runs On Request

| Step | Owner | Use |
| --- | --- | --- |
| Saved evidence | local OpenSEO | Free saved reads first, per `docs/process/openseo.md`. Paid lookups follow its Cost Boundary: a standing approval for one-off lookups up to $25 a month and $6 a lookup, with an ask-first list |
| Choose the next batch | Search Operator; `next-batch-gate` when exposed | Apply `docs/status/next-batch.md` and `docs/process/batch-workflow.md` even when the helper is unavailable; one cluster or one rescue, proof lane plus attack lane |
| Rescue a dropped page | `docs/process/ranking-regression-rescue.md` | Triggered by a weekly drop-check card, a rank-tracker drop, or indexing drift; returns the Gate 0 block |
| Required SEO/AEO research method | local OpenSEO's upstream skills (user-scope `openseo-local-*` paths; exposed as `openseo:*`) | Select the matching audit, keyword, competitor or AI-visibility skill through `docs/process/openseo.md`; Site checks and Analytics measurement still apply |
| Evidence report | `openseo-review` skill | Saved-evidence review and private report |
| Write or change copy | brief from `docs/briefs/README.md`, `content-quality-rubric`, `docs/process/aeo-citability-rubric.md`, the content gate | Copy changes need a brief |
| Titles and meta | `serp-ctr-title-rewrite` | High-impression, weak-CTR pages |
| Internal links | `internal-link-targeting` | Link targets for a chosen cluster |
| Structured data | `schema-markup` | JSON-LD rules |
| Outcome readback | `seascape-analytics` | Keep, revise, revert or insufficient evidence after the measurement window |

## Claude And Codex Differences

- Both Codex and Claude have the `seascape-seo-improvement-loop` skill in their
  respective skill sets. It walks one improvement from OpenSEO evidence to an
  Analytics decision and follows this map and `docs/process/openseo.md`.
- For AEO research, use local OpenSEO's `ai-visibility-audit` or
  `ai-prompt-research`. For Site copy, retain `docs/process/aeo-citability-rubric.md`
  and `content-quality-rubric`; the retired global `ai-seo` helper is not required.
- Both harnesses use only the local `openseo` MCP server for Seascape, never
  the hosted OpenSEO connector.

## Changing This Map

Update this page in the same PR that adds, changes or retires an SEO job,
role or skill. A scheduled job also needs its owning repo's review and
Sawyer's approval before it is enabled.
