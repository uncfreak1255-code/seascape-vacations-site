---
paths:
  - "src/**/*.njk"
  - "src/**/*.html"
  - "src/_data/**"
  - "src/assets/js/**"
  - "src/llms.txt"
  - "docs/briefs/**"
---

# Content Gate

Read this before changing public copy in `src/`. `AGENTS.md` points here.
Claude loads it when it reads a file matching `paths:` above, through the
`.claude/rules/content-gate.md` symlink.

For new guides, substantive rewrites, and search-presentation changes, read
`docs/process/openseo.md` before drafting. Confirm the local Seascape project
and read relevant saved evidence through its tools. In the active brief, name
the report/run or query, observation date, target page and decision it informs.
A skill read or report title alone is not research execution. If evidence is
missing or stale, state the gap and follow the existing research cost boundary;
do not invent a keyword rationale.

For substantial drafting or sentence-level rewriting, apply Compound Writing's
`cw-draft` or `cw-line-edit`, including its referenced context and source checks.
Use the installed skill when available. If unavailable, report that capability
gap explicitly; native prose editing is not Compound execution. Keep the Site's
active brief, property truth and voice sources authoritative, and retain the
independent voice review. Small factual corrections, typo fixes and layout-only
work need only their existing focused route; record a skip reason when reporting
research or writing-skill use.

In the task's existing brief or result, distinguish the skills loaded, tools
executed, evidence used, and writing decisions changed. Avoid a separate report
when the active brief already carries this evidence.

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
- a PR that changes visible copy on a smoke-asserted route (homepage,
  `/properties/`, `/property-management/`, `/stays/`) updates
  `scripts/recovery/assert-live-smoke.js` in the same PR; otherwise the daily
  live-smoke workflow goes red on a healthy site
- `npm run check:brief -- <brief.md>` lists every content-gate and Gate 0
  problem at once, without a build
