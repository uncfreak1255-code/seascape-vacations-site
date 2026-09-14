---
name: openseo-review
description: Use when reviewing OpenSEO query, citation, competitor, or rank-tracking evidence.
---

# OpenSEO Opportunity Review

Use OpenSEO as an evidence source. Do not treat it as strategy canon or proof that a site change shipped.

## Inputs

Collect or infer the target domain and market, competitors using exact brand names or domains, device and review window, prior export or rank baseline, and the spend limit for paid lookups or rank checks.

For Seascape, default to `seascape-vacations.com`, United States, and the current configured device. Do not assume a competitor list from an old run.

## Preflight

1. Confirm the current OpenSEO project, domain, country, device, and data timestamp.
2. Prefer live OpenSEO MCP tools when already connected. Otherwise use the current OpenSEO UI through the available browser-control skill.
3. Do not add the OpenSEO connector, change global MCP settings, sign in, or spend credits without the required current approval.
4. Name the proof gate: verified query export, verified cited-source export, current rank configuration readback, and an opportunity table tied to source rows.
5. If live OpenSEO is unavailable, stop with the failed path. Do not replace it with guessed data.

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
