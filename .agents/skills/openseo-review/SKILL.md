---
name: openseo-review
description: Use when a Seascape page drops in Google rank or clicks, and for SEO loops, OpenSEO audits, keyword, competitor, AI-citation or rank-tracking review; reads Search Console evidence first, cost-checks paid lookups.
---

# OpenSEO Opportunity Review

Use OpenSEO as an evidence source. Do not treat it as strategy canon or proof that a site change shipped.

## Default improvement loop

This is the shared Seascape SEO entry point for local Codex and Claude agents.
Use the public upstream OpenSEO skill matching the task: coach/setup, audit,
keyword research/clustering, competitors, local search, AI visibility/prompts,
link prospects or report. Codex uses the installed `~/.agents/skills/openseo-local-*`
skills. Claude reads the matching workflow by path from the official local
OpenSEO release, `~/Projects/open-seo-review/plugins/openseo/skills/<name>/SKILL.md`
(`ai-prompt-research`, `ai-visibility-audit`, `competitive-landscape`,
`competitor-analysis`, `keyword-clustering`, `keyword-research`,
`link-prospecting`, `local-seo`, `seo-audit`, `seo-coach`,
`seo-project-setup`, `seo-report`); they are kept out of Claude's always-loaded
skill list, so this skill is the entry point. Skills are workflows; their
presence does not grant paid calls or website publication.

1. Read the local project and saved evidence first. Confirm exact domain,
   market, device, timestamps and any existing report before buying research.
2. Run the matching upstream workflow with the native local `openseo` server
   at `http://localhost:3001/mcp`. Never substitute hosted plugin tools.
3. If a paid lookup or new check is needed, state the tool, project, inputs,
   market/depth, estimated cost and maximum spend; obtain Sawyer's approval
   before that exact run. If the tool remains unavailable, report the missing
   capability rather than switching providers or broadening access silently.
4. Save a private, dated report and a bounded recommendation. Context notes
   use approved source facts and preserve their provenance; they are not canon.
5. Route the action: Hub owns strategy and promotion; Analytics owns GSC/GA4,
   attribution, AI measurement and outcome receipts; Site owns approved page,
   schema, link and conversion changes; Ops owns services and runtime.
6. Make authorized changes only in the owning repo under its normal gates.
   Re-read the same evidence window or use the next already-approved review
   to evaluate keep/revise/revert/insufficient evidence. A rank change is not
   booking or revenue proof. Do not create a new recurring job for this loop.

When local OpenSEO is unavailable, state the failed connection and route that
step to a Mac session. Cloud sessions cannot reach this Mac through their own
localhost. Do not expose the unauthenticated local server, reconnect Google,
start paid research or fall back to hosted OpenSEO to hide that gap.

## Inputs

Collect or infer the target domain and market, competitors using exact brand names or domains, device and review window, prior export or rank baseline, and the spend limit for paid lookups or rank checks.

For Seascape, default to `seascape-vacations.com`, United States, and the current configured device. Do not assume a competitor list from an old run.

## Preflight

1. Confirm the current OpenSEO project, domain, country, device, and data timestamp.
2. Prefer live OpenSEO MCP tools when already connected. Otherwise use the current OpenSEO UI through the available browser-control skill.
3. Do not add the OpenSEO connector, change global MCP settings, sign in, or spend credits without the required current approval.
4. Name the proof gate: verified query export, verified cited-source export, current rank configuration readback, and an opportunity table tied to source rows.
5. If live OpenSEO is unavailable, stop with the failed path. Do not replace it with guessed data.

## Select the evidence lane

For Seascape rank-opportunity or regression triage on already-tracked queries,
read the [Site-owned OpenSEO preflight](https://github.com/uncfreak1255-code/seascape-vacations-site/blob/main/docs/process/openseo.md)
first. Use `list_projects` and
then existing `get_rank_tracker` configuration, results and history through the
configured approval path. Record observation time, query, current/prior position
and landing URL; do not trigger a fresh check. Continue with live SERP and
competitor evidence plus the owning Analytics receipt before recommending work.
The configured free saved-state, context and private-report tools are the
default surface; paid lookup tools require the exact approval above. Unavailable tools or stale/missing target queries are evidence gaps,
not permission to start a paid run or change the measurement gate.

Use the brand/citation steps below only when that evidence lane is requested
and the lookup already exists or its exact paid run is separately approved.
A tracked-rank review starts with the rank read, not a brand lookup.

## Review workflow

### 1. Brand lookup

- Run or inspect the target-domain lookup.
- Record lookup time, estimated or actual cost, total AI-search volume, platform split, visible query count, and cited-source count.
- Keep brand mentions separate from citations. A mention is not proof of a cited source.
- If the lookup is paid and not already complete, get approval before running it.

### 2. Competitor comparison

- Add no more than five approved competitors using stable names or domains.
- Verify each competitor appears in the returned comparison or share-of-voice result.
- If a name was only typed but no result changed, label it `input only — not applied`.
- Compare query coverage, share of voice, cited domains, and missing topics. Do not infer performance from name entry alone.

### 3. Export and verify

Export Queries and Cited sources as separate CSV files. For each file, verify the full path, modified time, non-zero size, headers, and row count. Record filters and tab state. A click on Export or a browser permission prompt is not an export receipt. If the file cannot be found, mark the export unverified and continue only with visible rows.

### 4. Rank-tracking check

Read back the domain, country, schedule, device, search depth, last check, history state, keyword count, and cost per check. Capture keyword, current position, change, ranking URL, volume, difficulty, CPC, and SERP features when available.

Do not alter schedule, depth, device, keywords, or run a paid check during a review-only task. If a change is requested, show current and proposed values plus the cost effect, then get approval before applying it. Verify the saved configuration after any authorized change.

Classify opportunities:

- positions 4–10: protect or improve
- positions 11–20: near-page-one
- positions 21–40: content or internal-link candidate
- unranked: validate intent before creating content
- cited by AI but weak in Google: cross-channel opportunity
- ranking in Google but absent from AI citations: citation or entity opportunity

Treat these bands as triage, not automatic actions.

### 5. Synthesize

Use [the review template](references/review-template.md). Rank opportunities by evidence strength, business relevance, attainable position, competitor gap, and reuse of an existing page. Keep raw volume separate from conversion or revenue claims.

For Seascape, name all four before recommending work: revenue lever, proof surface, owning repo, and what stops if this starts. Route public page work to `seascape-vacations-site`, measurement to `seascape-analytics`, runtime work to `seascape-ops`, and durable strategy or evidence drafts to `seascape-hub`.

## Stop conditions

Stop and report when the domain or project is wrong, paid approval is missing, the connector or UI cannot return current data, an export cannot be verified, rank history is absent for a trend claim, or competitor application is unconfirmed.

## Closeout receipt

Report what was reviewed, costs incurred, verified export paths and row counts, current rank settings, top opportunities, unverified items, owner, and the next proof-bearing action. Never call recommendations implemented, published, or measured without owning-repo and live proof.
