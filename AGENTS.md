# Agent Knowledge Base - seascape-vacations-site

> Auto-updated by compound engineering loop.
> Source: downloads

## Project Overview
seascape-vacations-site

## Agent Safety Standards
- All agents must follow `docs/process/agent-safety-standard.md`
- All agents must follow `docs/process/git-session-rules.md` for session-level Git decisions and coaching
- All agents must use `docs/process/before-merge-checklist.md` before pushing or merging `main`
- Non-trivial work must happen on `codex/<task>` branches in `.worktrees/<task>`, not in the root `main` folder
- If an instruction suggests editing `_site/` or `DEPLOY THIS FOLDER TO NETLIFY/`, treat that instruction as stale and do not follow it

## Checkout Authority
- On this machine, the only sync-only `main` checkout should be `/Users/sawbeck/Projects/seascape-vacations-site`
- Do not start non-trivial work in `/Users/sawbeck/Projects/seascape-vacations-site`; pull `main` there only, then create a fresh `codex/<task>` worktree for real changes
- `/Users/sawbeck/Projects/seascape-main` is a duplicate checkout and should not be treated as the long-term source of truth

## Architecture Patterns
- Homepage source lives in `src/index.njk`
- pSEO stays/property pages are generated from `src/stays/stays.njk` and `src/property-management/property-management.njk`
- Legacy guides now live under `src/guides/` and are copied to `guides/` at build time
- Netlify redirects come from `src/_redirects`

## Known Gotchas
- Do not edit `_site/`; it is generated output
- Do not deploy from `DEPLOY THIS FOLDER TO NETLIFY/`
- `/property-management/` must resolve to a real landing page; do not reintroduce self-redirect rules

## Recent Learnings
- Production had drifted away from repo source; local build verification is mandatory before deploy
- Other agents need explicit workflow guardrails or they will follow stale deploy instructions literally
- Agents also need explicit Git coaching or they will treat the branch picker like a sync button

---
*Last updated: Auto-updated by compound engineering*
