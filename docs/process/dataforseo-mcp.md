# DataForSEO Project MCP

This repo-local MCP entry exists only to make live competitor reads repeatable
inside the Seascape site workflow.

## Boundary

- `seascape-vacations-site` uses DataForSEO as a Gate 0 input for SERP,
  keyword, backlink, and competitor reads.
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
./scripts/mcp/dataforseo-mcp.sh --check
```

The check proves that the wrapper can resolve credentials and find `npx` without
calling the DataForSEO API or printing secret values.
