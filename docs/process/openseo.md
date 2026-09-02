# OpenSEO Bounded Integration

OpenSEO is a local evidence reader for saved Seascape SEO state. It is not the
site SEO operating system, the source of current analytics truth, or permission
to spend DataForSEO credits.

## Project Configuration

The trusted-project Codex configuration in `.codex/config.toml` connects to the
local OpenSEO MCP server at `http://localhost:3001/mcp`. The server is optional,
so a stopped OpenSEO app must not block a Codex session.

The committed allowlist contains only these no-credit reads:

- `whoami`
- `list_projects`
- `list_saved_keywords`
- `get_rank_tracker`
- `get_search_console_performance`
- `inspect_urls`

Codex asks for approval before every OpenSEO tool call. A new Codex session is
required after this project configuration changes.

## Local Authentication Boundary

The local OpenSEO app can run in `local_noauth` mode. In that mode, no hosted
OpenSEO sign-in appears. Treat the local app and MCP endpoint as unlocked-user
access and keep them on the local machine. Do not expose the endpoint through a
public tunnel, shared network listener, or reverse proxy without a separate
authentication and security review.

Search Console access is a separate Google authorization. If OpenSEO reports
that the connection expired or was revoked, stop and request Sawyer's approval
before reconnecting it.

## Ownership

- `seascape-vacations-site` may use saved rank history as supporting evidence
  for a bounded regression-rescue decision and may consume an analytics receipt.
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
3. Use `get_rank_tracker` only to read the existing tracker configuration,
   latest results, or history. Do not trigger a fresh check.
4. For AI-search exports, keep brand mentions separate from cited-source rows.
   Route current measurement and durable receipts to `seascape-analytics`.
5. Stop on an expired Search Console connection, unavailable current data,
   unexpected credit estimate, or any write request.

## Verification

From a new trusted Codex session in this repo:

```bash
codex mcp get openseo
```

The readback must show the localhost URL, `required: false`, approval mode
`prompt`, and only the six allowed tools above. A live acceptance check then
calls `list_projects` and reads the existing rank tracker twice with the same
result count. It must not run a new rank check or another paid lookup.
