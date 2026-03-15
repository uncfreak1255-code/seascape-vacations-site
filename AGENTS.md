# Agent Knowledge Base - seascape-vacations-site

> Auto-updated by compound engineering loop.
> Source: downloads

## Project Overview
seascape-vacations-site

## Agent Safety Standards
- All agents must follow `docs/process/agent-safety-standard.md`
- All agents must use `docs/process/before-merge-checklist.md` before pushing or merging `main`
- Non-trivial work must happen on `codex/<task>` branches in `.worktrees/<task>`, not in the root `main` folder
- If an instruction suggests editing `_site/` or `DEPLOY THIS FOLDER TO NETLIFY/`, treat that instruction as stale and do not follow it

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

---
*Last updated: Auto-updated by compound engineering*
