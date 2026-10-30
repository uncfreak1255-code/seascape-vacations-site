# Local OpenSEO — Default Seascape SEO Workflow

Local OpenSEO and its public upstream skills are the default SEO workflow for
Seascape agents across all repositories, including Codex and Claude Code.
Start with saved evidence for the task, including queries already in the tracker. It gives an agent one current, project-scoped view of
saved rankings and landing URLs before the agent opens broader research
surfaces. It is not the site SEO operating system, the source of current
analytics truth, or permission to spend DataForSEO credits.

## Project Configuration

Codex user configuration and this trusted project's `.codex/config.toml` connect to the
local OpenSEO MCP server at `http://localhost:3001/mcp`. The server is optional,
so a stopped OpenSEO app must not block a Codex session.

The committed allowlist contains the original saved-state reads:

- `whoami`
- `list_projects`
- `list_saved_keywords`
- `get_rank_tracker`
- `get_search_console_performance`
- `inspect_urls`

It also exposes the free workflow tools `get_project_context`,
`update_project_context`, `list_reports`, `get_report`,
`list_report_templates`, and `save_report`. Context updates store confirmed
project facts or dated research notes; they do not promote Hub canon. Report
saves create private local reports. Replacing an existing report requires
checking its sharing state first: replacement preserves any existing sharing.
Public sharing, report deletion, new checks and paid research remain excluded.

OpenSEO calls use Codex's configured approval route. With a human reviewer,
that route can present a manual prompt; with automatic review, an allowed call
can proceed without a manual popup. Keep `default_tools_approval_mode = "prompt"`
and the explicit tool allowlist. A missing popup alone does not prove a bypass.
Record the configured route and any approval result actually exposed; do not
invent a per-call approval receipt. A new Codex session is required after this
project configuration changes.

## Cross-agent and cross-repo default

The global Codex and Claude instructions select this workflow for Seascape SEO.
Codex uses the bounded user `openseo` MCP table; Claude Code uses a user-scoped
HTTP `openseo` server, inherited by local Code sessions in Desktop. Both use
this Mac's existing Seascape project, not the hosted plugin's Default project.
The shared `openseo-review` source in `sawyer-skills` defines the improvement
loop; its existing Site/Analytics projections remain in place.

The default is saved evidence → matching upstream skill → private report →
owning-repo action → Analytics outcome readback. Apply each repo's existing
approval, brief, review and proof requirements. This is a workflow default,
not a new scheduler, automatic page editor or grant of spending authority.

Claude's twelve free workflow tools have native allow rules. Every other tool
in the installed 0.1.16 catalog has a native ask rule (seven tools added in
0.1.13–0.1.16 got ask rules on October 25, 2026), so auto mode cannot
silently approve paid research or other unapproved effects. Verify this catalog
coverage again before an OpenSEO upgrade. Codex continues to exclude paid
lookup tools from its default allowlist. For an approved paid step, make only
the exact required capability available; approval never enables an entire pack.

Agents off this Mac must report local OpenSEO unavailable and route the read
or research step to a Mac session. They may continue independent authorized
source work; they may not use hosted OpenSEO or an alternate paid provider as
a silent fallback. No public tunnel, Google reconnect or authentication change
is part of this rollout. Regular cloud chat/Cowork connections are not local
Code sessions and do not acquire this Mac's endpoint from these settings.

## Local Authentication Boundary

The local OpenSEO app can run in `local_noauth` mode. In that mode, no hosted
OpenSEO sign-in appears. Treat the local app and MCP endpoint as unlocked-user
access and keep them on the local machine. Do not expose the endpoint through a
public tunnel, shared network listener, or reverse proxy without a separate
authentication and security review.

Search Console access is a separate Google authorization. This integration may
read performance and URL-inspection evidence through OpenSEO, but it may not
connect, reconnect, or change the Google authorization. If OpenSEO reports that
the connection expired or was revoked, stop and request Sawyer's approval
before reconnecting it. These reads do not move analytics ownership or replace
a `seascape-analytics` receipt.

## Ownership

- `seascape-vacations-site` may use saved rank history as supporting evidence
  to identify a candidate winner, money-page regression, or landing-page
  mismatch. The candidate still needs the evidence required by
  `docs/process/ranking-regression-rescue.md` before a page change.
- `seascape-analytics` owns current Search Console, AI citation and mention
  measurement, prompt packs, recurring pulls, joined attribution, and receipts.
- Use OpenSEO first for new SEO research after approval for the exact paid
  run. The existing direct DataForSEO connection remains available for a
  specifically approved capability gap; changing provider does not waive Gate 0
  evidence, cost approval or Analytics ownership.
- `docs/status/next-batch.md` remains the only next-batch handoff surface. Do
  not change its gate from an OpenSEO screen, MCP response, or CSV alone.

## Cost Boundary

Do not add or call OpenSEO tools that start new keyword, SERP, backlink, domain,
local-search, Google Business, or AI-brand lookups without Sawyer's approval for
that exact paid run. An MCP tool can be marked read-only and still consume
DataForSEO credits. Self-hosted OpenSEO does not currently expose the remaining
DataForSEO balance through `whoami`, so tool annotations are not a cost gate.

| Tool | Reads | Spends DataForSEO credits | Needs Sawyer's approval |
| --- | --- | --- | --- |
| `whoami`, `list_projects`, `list_saved_keywords`, `get_rank_tracker` | saved OpenSEO project state and rank history | no | no; use the configured Codex approval route |
| `get_search_console_performance`, `inspect_urls` | the existing Search Console authorization | no | no for reads; yes before any reconnect |
| `get_project_context`, `list_reports`, `get_report`, `list_report_templates` | saved local workflow context, reports and templates | no | no for reads |
| `update_project_context`, `save_report` | local project notes and private reports | no | use only within the requested task; verify the exact project and preserve existing content |
| every paid lookup tool in the list below | live SERP, keyword, backlink, domain, local or AI lookups | yes, per call | yes, for that exact paid run |

The following OpenSEO tools are intentionally outside the project allowlist:

- `research_keywords`
- `get_domain_overview`
- `get_domain_keyword_suggestions`
- `get_backlinks_overview`
- `get_serp_results`
- `get_ranked_keywords`
- `find_serp_competitors`
- `search_local_businesses`
- `get_local_serp_results`
- `get_google_business_questions`
- `get_keyword_metrics`
- `save_keywords`

## Standalone upstream skills on the Mac

Sawyer approved the upstream workflows against local OpenSEO on October 19,
2026, including a free read and private report save. Keep the upstream skills
outside this repository; the Site roles, measurement and publication gates
continue to govern any resulting website work.

The Mac installs the public skill directories as user-scope symlinks named
`openseo-local-<skill>` under `~/.agents/skills/` for Codex and
`~/.claude/skills/` for Claude, pointing to
`~/Projects/open-seo-review/plugins/openseo/skills/<skill>`. Their upstream
skill names stay unchanged. The initial source was official release 0.1.12,
commit `89e5a00717cdf049b7c2b4e29646edb3a7d4995b`. Sawyer approved the upgrade
to release 0.1.16 (commit `236761ad848716077cd10d8503713bb690971b3b`) on
October 25, 2026; the twelve skills and their links were rechecked after it.
The pre-upgrade local database is kept under
`~/Projects/open-seo-backups/2026-10-25-pre-v0.1.16/`. The installed local
OpenSEO checkout supplies the skills and their supporting files; no plugin
fork, copied skill pack or hosted migration is needed. A later approved local
OpenSEO upgrade also changes these symlink targets' contents, so rediscover
skills and recheck compatibility after upgrading.

For Seascape tasks, select those standalone local skill paths rather than the
hosted plugin's same-named skills. Use the project-configured `openseo` MCP
namespace at `http://localhost:3001/mcp` for every workflow call. The hosted
`mcp__codex_apps__openseo_*` connector is a different data store. Never fall back
to it when local tools are unavailable. Confirm `Seascape Vacations` and
`seascape-vacations.com` with local `list_projects` before reading or saving.

Start a fresh local Codex or Claude Code session to load the user defaults.
The Site project configuration retains the same bounded local tools. The skills can use free
reads and private report saves now. When an upstream workflow requires a paid
lookup or another excluded tool, stop that step and report the exact missing
capability and cost approval required; installing a skill does not authorize
spending or a broader tool allowlist. Keep reports private and use `get_report`
to read back the saved title, project, HTML and sharing state. Missing or
unreadable sharing evidence is unverified, not private-by-assumption.

Use the upstream skills installer only if a local source is unavailable, with
an inspected public skill selection and no duplicate discovery entries. The
current symlinks deliberately reuse the already-installed release.

## Read-Only Use

1. Confirm the OpenSEO desktop app is running and the project is
   `Seascape Vacations` for `seascape-vacations.com`.
2. Use `list_projects` before a project-specific read. Stop on a wrong or
   missing project.
3. For a rank-opportunity or regression question involving tracked queries,
   read `get_rank_tracker` before consulting a stale status handoff or opening
   a paid research surface. Use the existing tracker configuration, latest
   results, and history only; do not trigger a fresh check.
4. Treat the tracker result as triage, not the final decision. Record the
   observation time, query, current and prior position, and landing URL. Then
   use live SERP evidence and the owning analytics receipt required for the
   proposed action. If the tracker is stale or lacks the target query, stop and
   report the evidence gap. Do not open DataForSEO; a separately approved paid
   run is required.
5. Use `get_search_console_performance` and `inspect_urls` only as read-only
   confirmation for the exact site, query, page, country, device, and date
   window under review. Do not connect or reconnect Search Console, and do not
   treat a successful read as permission to change a page.
6. For AI-search exports, keep brand mentions separate from cited-source rows.
   Route current measurement and durable receipts to `seascape-analytics`.
7. Stop on an expired Search Console connection, unavailable current data,
   unexpected credit estimate, or any write request.

## Business Decision Boundary

OpenSEO evidence may inform a business decision; it may not silently make one.
When the proposed next action would change Seascape's business priority,
revenue-lever focus, budget, or measured batch strategy, stop before acting and
put this exact line at the top of the handoff:

`BUSINESS DECISION REQUIRED — SAWYER`

State the evidence, the recommended decision, the consequence of yes and no,
and the exact approval needed. Do not bury the request in a routine update.
Routine read-only evidence gathering and already-approved implementation do not
need a new strategy decision.

## Verification

From a new trusted Codex session in this repo:

```bash
codex mcp get openseo
```

The committed config and its enforcement test prove that the server is optional
with `required = false`. The `codex mcp get openseo` readback must show the
localhost URL, approval mode `prompt`, and only the allowed tools above.
Run acceptance through the native tools in a fresh trusted session:

1. Call `list_projects` and verify the Seascape project/domain.
2. Discover the existing tracker if needed, then read the same saved run twice
   and compare result counts. Do not trigger a check.
3. Make one read-only Search Console query through its existing authorization.
4. Record saved-read and Search Console outcomes separately, along with the
   approval route and any actual approval evidence. Automatic approval does not
   require a manual popup. A returned `api_error` leaves Search Console reads
   unverified; it does not invalidate a successful saved-rank read or prove the
   Google grant expired. Inspect the owning error before proposing a reconnect.

Use the native MCP path for this acceptance; raw HTTP or a shell proxy does not
prove Codex tool exposure or approval handling. Acceptance does not authorize a
Google reconnect, new rank check, paid lookup, or configuration change.

### October 11, 2026 readback

The native CLI acceptance ran before and after the verified local upgrade to
OpenSEO 0.1.12 (`89e5a007`). Both used automatic review. `list_projects` returned
the correct Seascape project. Two saved snapshots returned the same 78 rows
from the October 8 completed run. No per-call approval receipt was exposed.
The October 1–7 Search Console query returned `ok: false`, `reason: api_error`;
no reconnect or paid lookup ran. The October 2 test's missing manual popup was
therefore insufficient evidence of a bypass: its separate automatic reviewer
had explicitly allowed `list_projects`. This follows the supported
[automatic approval route](https://learn.chatgpt.com/docs/agent-approvals-security#automatic-approval-reviews);
no approval setting or paid-tool exclusion changed.

The October 11 Analytics-owned joined read covers October 3–9 with GSC export
freshness clear and `fresh but below threshold`. That BigQuery/GA4 result is
independent of OpenSEO's failing Search Console API read. See `docs/status/next-batch.md`
for the receipt-derived handoff.
