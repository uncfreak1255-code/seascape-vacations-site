---
name: web-design-guidelines
description: Review Seascape site UI against DESIGN.md, repo visual rules, accessibility basics, and desktop/mobile screenshot evidence. Use before or after CSS, template, layout, or visual polish work.
disable-model-invocation: true
---

# Web Design Guidelines

Use this only for Seascape Vacations site UI work.

## Required Reading

1. `AGENTS.md`
2. `CLAUDE.md`
3. `DESIGN.md`
4. `docs/process/before-user-review-checklist.md`
5. the source file or template being changed

## Review Contract

- Treat `DESIGN.md` as the visual source of truth.
- Edit `src/` and supporting docs only; never hand-edit `_site/`.
- Never use `DEPLOY THIS FOLDER TO NETLIFY/` as source truth.
- Classify the UI before coding: `Product type: marketing site. Reference family: Seascape design system.`
- Check desktop and mobile screenshots for meaningful visual changes.
- Call out overlap, cramped text, generic card grids, badge-heavy hierarchy, invented colors, and styling that drifts from `DESIGN.md`.

## Output

Return concise findings with file paths and the smallest fix. If there are no findings, say what screenshots or checks were reviewed.
