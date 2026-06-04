# SEO Triage Program

## Objective

Orchestrate the Seascape Vacations SEO triage program:

- classify existing pSEO pages into `keep`, `improve`, `noindex`, `redirect`,
  or `consolidate`
- define a lightweight competitor operating loop for owner and stay pages before
  copy changes
- open one next-batch brief only if the analytics reread clears the gate
- limit tooling cleanup to proven gaps in research, competitor capture, or
  reread sync

## Current Gate

- Current source: `docs/status/next-batch.md`
- Current reread status: `fresh but below threshold`
- Current branch decision: do not open a new owner, stay, guide, GEO, or SEO
  expansion branch from the current read
- Current next move: rerun the targeted operator read after more recrawl time
  using the last 7 complete days

## Specialist Workstreams

| Specialist lane | Current artifact | Done when |
| --- | --- | --- |
| Search Operator | `docs/status/next-batch.md` | The analytics receipt says `open next batch`, `fresh but below threshold`, or `blocked by freshness` with one concrete next move. |
| SEO Architect | `docs/portfolio/pseo-inventory-triage.md` | Every generated stay and owner page has a current triage class and next action. |
| Competitor Research | `docs/process/seo-competitor-operating-loop.md` | Gate 0 can be run repeatably before any page edit or indexation change. |
| Page Builder | One active `docs/briefs/` file only after gate opens | Source edits happen from exactly one active brief. |
| Release Gate | Existing release/content/build checks | The chosen branch passes the relevant repo checks before review or merge. |

## Current Decision

No new next-batch brief is opened in this branch because the latest status is
`fresh but below threshold`.

The active work is triage scaffolding: inventory, competitor loop, and a narrow
generator for refreshing the inventory from source data.
