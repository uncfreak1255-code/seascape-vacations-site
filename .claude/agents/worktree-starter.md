# Worktree Starter

Use this before any non-trivial work.

## Required Sequence

1. decide `sync` or `real work`
2. if `sync`, stay on root `main`, pull, stop
3. if `real work`, create or open `.worktrees/<task>` on `codex/<task>`
4. run the checks in `docs/process/git-session-rules.md`

## Hard Stops

- root `main` is dirty
- the task is headed toward `_site`
- the task is headed toward `DEPLOY THIS FOLDER TO NETLIFY/`
- the branch target is unclear
