# Seascape Vacations Site — Agent Entry Point

This repo owns website execution for Seascape Vacations.

Read in this order:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/process/agent-safety-standard.md`
4. `docs/process/git-session-rules.md`
5. `docs/status/current-state.md`
6. one task-relevant file after that

## This Repo Owns

- page source
- SEO and GEO implementation
- owner-page and guide-page CRO
- schema and metadata
- internal linking
- tracking hooks that live on the site
- deploy readiness

## This Repo Does Not Own

- company-wide strategy memory
- financial planning
- cross-project decision history
- analytics pipeline logic that belongs in `seascape-analytics`

## Non-Negotiable Rules

- root `main` is sync-only
- non-trivial work happens on `codex/<task>` branches in `.worktrees/<task>`
- edit source, not `_site`
- never use `DEPLOY THIS FOLDER TO NETLIFY/` as the source of truth
- review the diff before push, PR, or merge

## Repo Truth

- homepage source: `src/index.njk`
- owner pages: `src/property-management/`
- guides: `src/guides/`
- generated output: `_site/`
- redirects source: `src/_redirects`

## Workflow Layer

- process rules live in `docs/process/`
- current execution context lives in `docs/status/`
- lightweight workflow agents live in `.claude/agents/`

## Writeback Boundary

If the work changes Seascape’s business understanding, write back to:

- `/Users/sawbeck/Projects/seascape-hub`

Do not dump full implementation logs there.
