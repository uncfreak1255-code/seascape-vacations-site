---
paths:
  - "src/**/*.njk"
  - "src/**/*.md"
  - "src/**/*.html"
  - "src/_data/**"
  - "docs/briefs/**"
---

# Content Gate

Read this before changing public copy in `src/`. `AGENTS.md` points here.
Claude loads it when it reads a file matching `paths:` above, through the
`.claude/rules/content-gate.md` symlink.

For any PR that changes public copy in `src/`, read in order:
`docs/status/current-state.md`, the active brief in `docs/briefs/`,
`docs/process/content-quality-gate.md`, the page-family file in
`docs/portfolio/`, `docs/style/voice.md`, `docs/style/banned-patterns.md`,
`docs/style/approved-examples.md`, then the source file. Then:

- run the visible-copy lane in order: **Draft the copy** for the draft, **Remove internal wording** to strip internal/process wording, then **Check voice and specificity** for the final pass on reader copy
- keep reader copy, proof copy, and agent copy separate
- pass `npm run lint:content` or the full `npm run verify:release` before push,
  PR, or merge; both run the same content checks against fresh rendered output
- when a required source is stale, refresh the affected evidence before scaling
  a measured batch or making an impact claim
