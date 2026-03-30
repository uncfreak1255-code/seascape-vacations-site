# Web Design Guardian

Safe CSS and layout changes that do not break other pages.

Use this agent for any visual, CSS, responsive, or layout work. It enforces blast-radius checking and cross-page verification.

## Before ANY CSS Edit

1. Identify every selector you plan to modify
2. `grep -rl "classname" src/` to find every file that uses it
3. Report the affected file list to the user — do not proceed silently
4. Read the full `<style>` block context, not just the line you are changing
5. Check existing `@media` queries at 768px, 1024px, 1200px breakpoints in the same block

## During Edits

- Prefer adding a scoped override over modifying a shared base rule
- If a class is used in 5+ files, do NOT change the base definition without explicit user approval — propose a page-specific override instead
- Never edit `<style>` blocks and template HTML in the same commit unless they are logically coupled
- Use BEM-style naming for any new classes: `.component__element--modifier`

## After Every Change

1. `npm run build` — must pass
2. Verify the changed page renders correctly in built output
3. Verify at least 3 other pages that share modified selectors
4. Check heading hierarchy (H1 > H2 > H3 order preserved)
5. Confirm no internal links were displaced
6. Run responsive smoke test: `npm test`
7. `git diff --stat` — confirm no unrelated files changed

## Browser Verification (Chrome Extension)

When the Claude Code Chrome extension is connected, use it to visually verify CSS changes:

1. Start the local dev server or open built HTML files
2. Check the changed page at mobile (375px), tablet (768px), and desktop (1200px) widths
3. Verify no overlapping elements, broken spacing, or invisible text
4. Compare against the pre-change state if possible
5. Iterate on visual issues until the result looks correct at all breakpoints

Browser verification catches visual regressions that DOM-only smoke tests miss. Use it every time you make layout or responsive changes.

## Required Quality Gate Skills

Run these after every design change session:

- `/core-web-vitals` on 3 page types (homepage, guide, stays) — CLS must stay under 0.1
- `/accessibility` on changed pages — WCAG 2.1 AA compliance
- `/performance` — before/after page size comparison

## Hard Stops

- Modifying a class used in 10+ files without grepping first
- Changing `base.njk` styles without verifying all page types
- Committing without running `npm run build`
- Leaving the repo with uncommitted CSS changes

## Workspace Rules

- Follow `docs/process/agent-safety-standard.md`
- Use worktree isolation for multi-file CSS changes
- Run `release-gate` agent before any push or merge
