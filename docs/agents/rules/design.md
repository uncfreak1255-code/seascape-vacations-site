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

- For site design work, use the design craft skill your harness has: `emil-design` in Codex, `emil-design-eng` in Claude. If neither is available, name the gap; do not claim it was used.
- `DESIGN.md` is the visual law: read it before UI work and use only its
  colors, fonts, spacing, radius, shadows, and component styles in production.
  Isolated, explicitly labeled explorations may propose new geometry and motion
  under the component catalog; they do not change production defaults. Figma, Stitch,
  and other outside tools are donors; a new direction from any tool lands as a
  `DESIGN.md` change first. Claude Design is the approved mock surface only
  while synced by `npm run design:sync`.
- Meaningful visual work (mockups, page concepts, layout, type, color,
  imagery, CTA treatment, motion) starts in the `seascape-design-specialist`
  lane with `seascape-design-critic` as taste gate (`npm run design:lane --
  "<task>"`) and ends with the `design-review` rendered QA loop. Visual
  changes also need `npm run test:visual` and fresh desktop and mobile
  screenshots; `docs/process/design-review-workflow.md` holds the full route.
- An approved mock or direction is the implementation contract: build it
  closely and name any deviation with its source, accessibility, performance,
  or responsive reason.
- Sawyer cannot steer design by describing it. For any visible design change,
  show two or three rendered variants (deploy-preview links or screenshots),
  each anchored to a named reference site from `npm run design:donors`, and ask
  only "which one" or "keep X, lose Y".
- Choose by task. In assigned visual work, name the reader's job in each
  section you design (compare, narrow a set, read numbers, open detail, follow
  a photo sequence, act). Pick the pattern in the
  [component catalog](../../design/component-patterns.md) built for that job
  and say why it fits; the page's current pattern is one candidate among them.
  The catalog's statuses govern: a `reference` or `explored` pattern, or a new
  piece when none fits, enters as a labeled exploration. Render distinct
  alternatives and recommend one.
  Read the relevant Emil design, animation and mobile guidance; record what was
  actually used. A donor scan or installed skill is not evidence of invocation.
- Keep UI lean: cut marketing filler and repeated labels; keep accessible
  names, essential instructions, errors, and required disclosures.
- Treat any edit to a shared header, footer or nav partial as an SEO change as
  well as a visual one: it redistributes internal links across every built
  page. Run `node --test scripts/enforcement/internal-link-floor.test.js`
  against a fresh build; a green visual gate is not proof a shell edit was
  safe — its per-route pixel tolerance absorbed an entire new footer column on
  2026-09-10 without a single diff.
- Treat a layout rebuild of a page that already gets search traffic (a guide,
  stay or owner page) as a search change too: before choosing its sections,
  read the page's Search Console queries and position through local OpenSEO
  (`docs/process/openseo.md` -> Read-Only Use) and keep a section that answers
  each query it earns clicks for.
- Claude: of Emil's sixteen skills only `emil-design-eng` and `mobile-native`
  load on their own. For the other fourteen, open
  `.claude/skills/ask-emil/SKILL.md`, which maps them by task, then read the
  `SKILL.md` in the folder it names.
- Claude: when you delegate UI or visual work, run that subagent with
  `model: "sonnet"`. Whether to delegate is your call.
- For visitor-facing work, apply
  [Audience, benefit and next step](../../process/content-quality-gate.md#audience-benefit-and-next-step).
