# Runbooks

Use this directory when a release-sensitive lane is blocked by failure, not by
scope.

The rule is simple: if a gate fails, open the matching runbook instead of
improvising the next move.

## Failure Routing

| Trigger | Open this runbook | Primary proof surface |
| --- | --- | --- |
| Production behavior is broken after merge or live smoke fails | `docs/runbooks/release-incident.md` | live recovery commands and merged commit readback |
| Netlify deploy fails, stalls, or publishes the wrong build | `docs/runbooks/failed-netlify-deploy.md` | Netlify deploy logs plus local `npm run build` |
| `verify:jsonld`, AI discovery schema, or entity-schema checks fail | `docs/runbooks/failed-schema-smoke.md` | local schema commands and live entity smoke when merged |
| `test:visual`, visual proof, or screenshot sanity fails | `docs/runbooks/failed-visual-gate.md` | visual diff output plus fresh desktop/mobile proof |
| The current analytics receipt or next-batch read is stale or missing | `docs/runbooks/stale-analytics-receipt.md` | `seascape-analytics` receipt path and date |
| Public legal or trust copy is blocked on approval | `docs/runbooks/legal-approval-blocked.md` | approved copy source or a narrowed non-substantive diff |

## Hard Rules

- Runbooks do not override repo safety docs.
- Runbooks are for response and recovery, not for skipping verification.
- If the failure touches production, use a fresh worktree or hotfix branch; do
  not debug from root `main`.
