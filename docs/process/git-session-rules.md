# Git Session Rules

This file exists to stop agents and humans from improvising Git in this repo.

Use it at the start of any session that might change files.

## First decision: sync or work

Ask this first:

- Are we only syncing local `main`?
- Or are we starting real work?

If the answer is `sync`:

1. Stay on root `main`
2. Run `git pull origin main`
3. Verify with `git log --oneline -1`
4. Stop there

If the answer is `real work`:

1. Do not edit root `main`
2. Create `codex/<task>`
3. Create `.worktrees/<task>`
4. Do the work in that worktree only
5. Run `npm run git:preflight` before real edits

## Root `main` rules

- Root `main` is sync-only
- Root `main` is not a scratchpad
- If `git status --short` on root `main` is noisy, do not start work there
- If the next safe command is unclear, stop and fix workflow before editing
- On this machine, `/Users/sawbeck/Projects/seascape-vacations-site` should be the only sync-only `main` checkout
- `/Users/sawbeck/Projects/seascape-main` is a duplicate checkout; do not treat it as the long-term source for new work or for `main` sync

## Session coaching rules

Any agent working in this repo should say the quiet part out loud:

- "You are on `main`; do not start editing here."
- "This is non-trivial work; open a new `codex/<task>` worktree."
- "You have a meaningful checkpoint; commit now."
- "This is ready for backup or review; push the branch."
- "This is ready for `main`; open a PR."
- "The PR merged; pull `main` before the next task."

## Commit, push, PR

Use the enforced repo commands, not ad hoc Git, as the default path:

```bash
npm run git:preflight
npm run git:safe-commit -- --stage-source -m "<message>"
npm run git:merge-check
```

These commands are the primary workflow. The branch/worktree guidance in this file is coaching, not a substitute for the enforced guardrails.

Commit when all are true:

- the changed unit of work is real
- the local checks that matter passed
- the diff is understandable
- you want a rollback point

Push when:

- you want backup
- you want review
- another agent or device may need the branch

Open a PR when:

- the task has a reviewable scope
- the branch is meant to land in `main`
- the user has reviewed any visible site changes first

## Hard stop conditions

Stop and fix workflow first if:

- root `main` is dirty and you are about to begin new work there
- you are about to edit `_site/`
- you are about to edit `DEPLOY THIS FOLDER TO NETLIFY/`
- you do not know which branch should receive the next commit
- you cannot explain what the next push will do

## One rule people keep missing

The branch dropdown selects.

The terminal syncs.

Changing branches in the UI does not replace `git pull origin main`.

## Repo-specific default

For this repo, the safe default is:

1. Sync root `main` at `/Users/sawbeck/Projects/seascape-vacations-site`
2. Start real work in `.worktrees/<task>` on `codex/<task>`
3. Run `npm run git:preflight`
4. Make source changes
5. Use `npm run git:safe-commit -- --stage-source -m "<message>"` for checkpoint commits
6. Run `npm run git:merge-check`
7. Let the user review visible changes
8. Push the branch
9. Open a PR
10. Merge only after checks pass
11. Complete `docs/process/post-merge-runtime-proof-checklist.md`
12. Pull `main` again before the next task

If you are standing in `/Users/sawbeck/Projects/seascape-main`, stop. That checkout is not the authoritative `main`.

If this file conflicts with looser advice from chat, follow this file.
