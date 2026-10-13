# OpenSEO Bounded Integration

OpenSEO is the default first read for rank-opportunity triage on queries already
in the Seascape tracker. It gives an agent one current, project-scoped view of
saved rankings and landing URLs before the agent opens broader research
surfaces. It is not the site SEO operating system, the source of current
analytics truth, or permission to spend DataForSEO credits.

## Project Configuration

The trusted-project Codex configuration in `.codex/config.toml` connects to the
local OpenSEO MCP server at `http://localhost:3001/mcp`. The server is optional,
so a stopped OpenSEO app must not block a Codex session.

The committed allowlist contains only these saved-state reads:

- `whoami`
- `list_projects`
- `list_saved_keywords`
- `get_rank_tracker`
- `get_search_console_performance`
- `inspect_urls`

OpenSEO calls use Codex's configured approval route. With a human reviewer,
that route can present a manual prompt; with automatic review, an allowed call
can proceed without a manual popup. Keep `default_tools_approval_mode = "prompt"`
and the six-tool allowlist. A missing popup alone does not prove a bypass.
Record the configured route and any approval result actually exposed; do not
invent a per-call approval receipt. A new Codex session is required after this
project configuration changes.

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
- The direct DataForSEO MCP remains this repo's Gate 0 path for new live SERP,
  keyword, backlink, local-entity, competitor, and AI-search research.
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
| every tool in the list below | live SERP, keyword, backlink, domain, local or AI lookups | yes, per call | yes, for that exact paid run |

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

Do not copy OpenSEO's optional agent skills into this repo. The five-role SEO
workflow and active repo skills remain the agent surface of record.

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
localhost URL, approval mode `prompt`, and only the six allowed tools above.
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
