# Seascape Vacations Site — Agent Entry Point

This repo owns website execution for Seascape Vacations.

Read in this order:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/process/agent-safety-standard.md`
4. `docs/process/git-session-rules.md`
5. `docs/process/content-quality-gate.md` before content or SEO copy work
6. `docs/status/current-state.md`
7. `DESIGN.md` before UI, CSS, template, or layout work
8. `docs/process/design-review-workflow.md` for any visual or layout change
9. one task-relevant file from `docs/briefs/`, `docs/portfolio/`, `docs/style/`, or source

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
- one serious SEO cluster at a time, with one brief driving it
- no public content PR without one active brief, the content gate read, and `npm run lint:content`
- review the diff before push, PR, or merge

## Repo Truth

- homepage source: `src/index.njk`
- owner pages: `src/property-management/`
- guides: `src/guides/`
- stay landers: `src/stays/stays.njk` plus `src/_data/seoPages.json`
- generated output: `_site/`
- redirects source: `src/_redirects`
- voice source of truth: `docs/style/`
- batch briefs: `docs/briefs/`
- page-family routing map: `docs/portfolio/`

## Workflow Layer

- process rules live in `docs/process/`
- current execution context lives in `docs/status/`
- the five SEO OS role cards live in `.claude/agents/`
- active repo-local skills are limited to `.agents/skills/accessibility`, `.agents/skills/design-review`, `.agents/skills/next-batch-gate`, `.agents/skills/owner-proof-integrity`, `.agents/skills/page-cro`, `.agents/skills/property-truth-regeneration`, `.agents/skills/schema-markup`, `.agents/skills/site-architecture`, and `.agents/skills/web-design-guidelines`
- `.claude/skills/` should mirror only those active site/design skills; copied marketing, deploy, monthly reset, and generic SEO skills are not live authority
- global marketing skills in `/Users/sawbeck/.codex/skills/` may be used as advisory helpers for CRO, SEO, copy, psychology, analytics, and growth decisions, but they do not override this repo's source files, briefs, status docs, or five-role workflow

## Content Gate

For any PR that changes public copy in `src/`:

- read the active brief plus `docs/process/content-quality-gate.md`
- read `docs/style/voice.md`, `docs/style/banned-patterns.md`, and `docs/style/approved-examples.md`
- keep reader copy, proof copy, and agent copy separate
- run `npm run lint:content` before push, PR, or merge

## Design Review Workflow

- `DESIGN.md` is the visual law. Figma, Claude Design, Stitch, or any outside design tool can inform direction, but they do not override repo truth.
- For any meaningful visual change, including layout, spacing, typography, color, imagery, iconography, CTA treatment, or motion, run the repo flow in `docs/process/design-review-workflow.md`.
- The required rendered QA loop for visual changes is the global `design-review` skill. Use it after implementation and before human review so the review surface is screenshots plus live route checks, not code alone.
- If an outside design tool introduces a new pattern or style direction, propose it as a `DESIGN.md` change first, then implement after that design law is explicit.

## Design System

Before UI work, read `DESIGN.md`; treat it as the visual source of truth.
Do not invent colors, fonts, spacing, border radius, shadows, or component styles unless Sawyer explicitly asks for a design-system change.
If Claude Design, Stitch, designmd.directory, or another design tool produces a new direction, propose it as a `DESIGN.md` change first.

## Writeback Boundary

If the work changes Seascape’s business understanding, write back to:

- `/Users/sawbeck/Projects/seascape-hub`

Do not dump full implementation logs there.
