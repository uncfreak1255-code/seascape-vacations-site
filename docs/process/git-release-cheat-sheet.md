# Git Release Cheat Sheet

This repo is not a sandbox. `main` is the production line.

## What each thing means

- `branch` = one line of work
- `worktree` = a separate folder for that branch
- `commit` = a checkpoint
- `push branch` = remote backup or review
- `merge/push main` = release decision

## The rule for this repo

- Edit source in `src/`, config in `eleventy.config.js` / `netlify.toml`, and data in `src/_data/`
- Build with `npm run build`
- Netlify publishes from `_site`
- Do not hand-edit `_site`
- Do not deploy from `DEPLOY THIS FOLDER TO NETLIFY/`
- Install local enforcement once with `npm run setup:hooks`
- Use `npm run verify:release` before anything risky

## Default workflow

1. Start from a clean root `main` folder. Treat it as read-only.
2. Create a task branch: `codex/<task>`
3. Create a worktree: `.worktrees/<task>`
4. Do the work in that worktree only
5. Run local build and the checks that match the task
6. Commit once one meaningful unit is verified
7. Push the branch when you want backup or review
8. Merge or push `main` only when you are ready for Netlify to ship it

## When to do what

### Create a branch

Create one for any real task, bugfix, content batch, SEO pass, or deploy-sensitive change.

### Create a worktree

Use a worktree when:

- root `main` is dirty
- the task is more than a tiny typo
- you need isolation from other in-progress work
- you do not trust the current workspace state

### Commit

Commit when:

- the local build passes
- the changed routes were checked
- the diff is understandable
- you want a rollback point

Do not commit half-finished guessing.

### Push the branch

Push the branch when:

- you want remote backup
- you want a PR
- you want someone else or another agent to continue from it

Pushing a branch is usually safe.

### Merge or push `main`

Only do this when all are true:

- the work is on a task branch
- the intended diff is clear
- local verification passed
- the changed pages/routes were smoke-tested
- you are willing for Netlify to deploy it

## Repo-specific stop signs

Stop and fix the workflow first if:

- you are editing `_site` directly
- you are editing `DEPLOY THIS FOLDER TO NETLIFY/`
- `main` is dirty and you are about to start a new task there
- you have not run `npm run build`
- you cannot explain what will happen after the next push

## Safe mental model

- `push branch` = save my work
- `merge to main` = ship my work

If those feel the same to you, stop. You are about to recreate drift.
