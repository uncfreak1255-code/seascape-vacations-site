# DataForSEO Project MCP

This repo-local MCP entry exists only to make live competitor reads repeatable
inside the Seascape site workflow.

## Boundary

- `seascape-vacations-site` uses DataForSEO as a Gate 0 input for SERP,
  keyword, backlink, AI-search, local-entity, and competitor reads.
- `seascape-analytics` still owns GSC, GA4, proof receipts, costed recurring
  pulls, and any joined measurement readback.
- DataForSEO output does not authorize page creation, redirects, public claims,
  owner-demand claims, or impact claims by itself.
- Do not add scheduled jobs, raw snapshot storage, or analytics receipts in this
  repo from this MCP setup.

## Local Secret Source

The project MCP launcher reads credentials at runtime from macOS Keychain:

- service: `dataforseo`, account: `LOGIN`
- service: `dataforseo`, account: `API_PASSWORD`

The committed `.mcp.json` contains no credential values. You can also launch it
with `DATAFORSEO_USERNAME` and `DATAFORSEO_PASSWORD` already set in the
environment.

## Smoke Check

Run this from the repo root:

```bash
npm run dataforseo:mcp:check
```

The check proves that the wrapper can resolve credentials and find `npx` without
calling the DataForSEO API or printing secret values.

## Enabled Project Modules

The project MCP enables only modules with a current site workflow:

- `SERP` for live Google Organic, Google AI Mode, Google Maps, and Local Finder
  reads.
- `KEYWORDS_DATA` and `DATAFORSEO_LABS` for bounded keyword demand, search
  intent, ranked-keyword, and competitor-domain checks.
- `BACKLINKS` for competitor link-gap and local citation work.
- `DOMAIN_ANALYTICS` for lightweight competitor technology/domain context.
- `AI_OPTIMIZATION` for LLM Mentions and AI Keyword Data use cases that support
  AI-search visibility research.
- `BUSINESS_DATA` for Google Business Profile, reviews, Q&A, update, and local
  entity truth checks.

Do not enable additional modules here unless a site-specific use case repeats
and the result would change a gated site decision.
