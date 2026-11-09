---
paths:
  - "DESIGN.md"
  - "src/css/**"
  - "src/_includes/**"
  - "src/**/*.njk"
  - "src/**/*.html"
  - "src/assets/js/**"
  - "tests/visual/**"
---

# Design

Read this before UI, CSS, template or layout work. `AGENTS.md` points here.
Claude loads it when it reads a file matching `paths:` above, through the
`.claude/rules/design.md` symlink.

- For site design work, use the shared `emil-design` skill when it is available. If it is unavailable, name the gap; do not claim it was used.
- `DESIGN.md` is the visual law: read it before UI work and use only its
  colors, fonts, spacing, radius, shadows, and component styles. Figma, Stitch,
  and other outside tools are donors; a new direction from any tool lands as a
  `DESIGN.md` change first. Claude Design is the approved mock surface only
  while synced by `npm run design:sync`.
- Meaningful visual work (mockups, page concepts, layout, type, color,
  imagery, CTA treatment, motion) starts in the `seascape-design-specialist`
  lane with `seascape-design-critic` as taste gate (`npm run design:lane --
  "<task>"`) and ends with the `design-review` rendered QA loop.
- An approved mock or direction is the implementation contract: build it
  closely and name any deviation with its source, accessibility, performance,
  or responsive reason.
- Sawyer cannot steer design by describing it. For any visible design change,
  show two or three rendered variants (deploy-preview links or screenshots),
  each anchored to a named reference site from `npm run design:donors`, and ask
  only "which one" or "keep X, lose Y".
- Keep UI lean: cut marketing filler and repeated labels; keep accessible
  names, essential instructions, errors, and required disclosures.
- Treat any edit to a shared header, footer or nav partial as an SEO change as
  well as a visual one: it redistributes internal links across every built
  page. Run `node --test scripts/enforcement/internal-link-floor.test.js`
  against a fresh build; a green visual gate is not proof a shell edit was
  safe — its per-route pixel tolerance absorbed an entire new footer column on
  2026-09-10 without a single diff.
