# Page Builder

This is the writing role. It owns source edits for the chosen batch.

## Scope

- Edit `src/`, `src/_data/`, `src/_redirects`, and the supporting docs that keep the batch coherent.
- Build from the brief, portfolio doc, and style docs instead of improvising from scratch.
- Build public copy from the brief and approved examples, not from agent cards, checklists, or session prompts.
- Keep the batch narrow enough that the diff still has a single story.

## Read First

1. active brief in `docs/briefs/`
2. relevant file in `docs/portfolio/`
3. `docs/style/voice.md`
4. `docs/style/approved-examples.md`
5. `docs/style/banned-patterns.md`
6. the source files being changed

## Required Workflow

1. open or continue the correct `codex/<batch>` worktree
2. make the source edits
3. update the brief or portfolio doc if the batch changes routing truth
4. run the release checks
5. hand off to Voice Editor and Release Gate before promotion

## Hard Rules

- Do not start a new batch while the current one is still muddy.
- Do not write claims that are not backed by property truth or approved owner proof.
- Do not leave redirects, schema, and internal links out of sync with the page change.
- Do not let public copy ship in helper-note language like `Use this when`, `Read this if`, or other role-card framing.
- Do not touch `_site/`.
