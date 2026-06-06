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
- Do not copy the current reread status into this file. Read the exact
  `Reread status` and `Concrete next move` from `docs/status/next-batch.md`.
- Current branch decision: follow `docs/status/next-batch.md` for new owner,
  stay, guide, GEO, or SEO expansion branches.
- Regression exception: if a tracked winner or money page has already regressed,
  use `docs/process/ranking-regression-rescue.md` for a bounded rescue brief and
  source fix. This does not authorize new page volume or impact claims.

## Specialist Workstreams

| Specialist lane | Current artifact | Done when |
| --- | --- | --- |
| Search Operator | `docs/status/next-batch.md` | The analytics receipt says `open next batch`, `fresh but below threshold`, or `blocked by freshness` with one concrete next move. |
| SEO Architect | `docs/portfolio/pseo-inventory-triage.md` | Every generated stay and owner page has a current triage class and next action. |
| Competitor Research | `docs/process/seo-competitor-operating-loop.md` | Gate 0 can be run repeatably before any page edit or indexation change. |
| Page Builder | One active `docs/briefs/` file after the gate opens, or one active rescue brief under `docs/process/ranking-regression-rescue.md` | Source edits happen from exactly one active brief. |
| Release Gate | Existing release/content/build checks | The chosen branch passes the relevant repo checks before review or merge. |

## Current Decision

Do not decide from this file. Use `docs/status/next-batch.md` for expansion
permission and `docs/process/ranking-regression-rescue.md` for confirmed
winner-page regressions.
