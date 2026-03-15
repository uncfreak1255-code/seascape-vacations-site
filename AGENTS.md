# Agent Knowledge Base - seascape-vacations-site

> Auto-updated by compound engineering loop.
> Source: downloads

## Project Overview
seascape-vacations-site

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

---
*Last updated: Auto-updated by compound engineering*
