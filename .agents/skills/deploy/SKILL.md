---
name: deploy
description: Promote a verified seascape-vacations-site branch toward production without bypassing repo guardrails. Use when the user asks to deploy, ship, land, merge, push for release, or verify whether a branch is safe to become production.
disable-model-invocation: true
---

# Deploy

This repo ships source changes, not hand-edited build output.

Repo truth:
- root `main` is sync-only
- real work happens on `codex/<task>` in `.worktrees/<task>`
- editable source lives in `src/`, `src/_data/`, config, and supporting docs
- `_site/` is generated output
- `DEPLOY THIS FOLDER TO NETLIFY/` is archival only and never the source of truth

## Use This Flow

1. Confirm the workspace is safe:
   - run `git status --short --branch`
   - if you are on root `main`, stop and move to the correct worktree first
   - run `npm run git:preflight`
2. Re-read the task authority before promotion:
   - active brief in `docs/briefs/`
   - relevant file in `docs/portfolio/`
   - `docs/process/before-user-review-checklist.md`
   - `docs/process/before-merge-checklist.md`
3. Run the required verification:
   - `npm run build`
   - `npm test`
   - `npm run verify:release`
   - run the relevant `verify:recovery:*` subset if the task touched recovered areas
   - smoke-check the changed routes locally or on preview
4. Review the diff for unrelated churn:
   - check `git diff --stat`
   - make sure `_site/` and `DEPLOY THIS FOLDER TO NETLIFY/` are not part of the release diff
5. Create a checkpoint from source only:
   - use `npm run git:safe-commit -- --stage-source -m "<message>"`
   - do not use blind `git add -A`
6. Promote the branch safely:
   - push the task branch for backup or review
   - run `npm run git:merge-check` before any merge decision
   - merge to `main` only when you are comfortable with this exact branch becoming production
7. After merge, verify production:
   - watch the Netlify deploy complete
   - run `node scripts/recovery/assert-live-smoke.js https://seascape-vacations.com`
   - run targeted `curl` checks on the changed live routes

## Hard Rules

- Do not deploy from an unverified working tree.
- Do not treat `push branch` as the same thing as `ship production`.
- Do not edit `_site/`.
- Do not use `DEPLOY THIS FOLDER TO NETLIFY/` as if it were live source.
- Do not push directly from a messy diff that still contains unrelated churn.
- If the brief, portfolio file, and source diff disagree, stop and fix that first.

## Output

Report:
- branch and worktree status
- verification results
- smoke-check results
- whether the branch is safe for review
- whether the branch is safe for merge
- whether live production was verified after merge
