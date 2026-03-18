# Agent Safety Standard

These rules apply to any coding or content agent working in this repo: Codex, Claude, ChatGPT, subagents, or custom automation.

Use `docs/process/git-session-rules.md` alongside this file when deciding whether to sync, branch, commit, push, or open a PR.

## Non-negotiable rules

1. Treat root `main` as release history, not a scratchpad.
2. For any non-trivial task, work on `codex/<task>` in `.worktrees/<task>`.
3. Edit source files only. In this repo that means `src/`, data/config, and docs.
4. Never hand-edit `_site/`.
5. Never use `DEPLOY THIS FOLDER TO NETLIFY/` as the source of truth.
6. Do not push or merge `main` without local verification.
7. Do not deploy from an unverified working tree.

## Required workflow for deploy-sensitive work

1. Start from a clean branch or isolated worktree.
2. Make source changes.
3. Run `npm run build`.
4. Run the task-specific checks.
5. Complete the pre-review gate in `docs/process/before-user-review-checklist.md` before asking a human to review UI or content.
6. Smoke test the changed routes.
7. Review the diff for unrelated churn.
8. Only then push or merge `main`.

## Installed enforcement

- Local hook installer: `npm run setup:hooks`
- Local protected-branch gate: `.githooks/pre-push`
- Shared verifier: `npm run verify:release`
- GitHub Actions gate on `main`: `Release Safety`

## Required checks before `main`

At minimum, an agent must use the repo checklist in:

- `docs/process/before-user-review-checklist.md`
- `docs/process/before-merge-checklist.md`

If the task touches recovered site areas, run:

```bash
npm run verify:recovery:p0
npm run verify:recovery:guides
npm run verify:recovery:remediation
```

Use the relevant subset if the task is narrower, but skipping verification entirely is not allowed.

## Stop conditions

An agent must stop and fix workflow first if any of these are true:

- root `main` is dirty and the agent is about to begin new work there
- the agent is editing `_site`
- the agent is editing `DEPLOY THIS FOLDER TO NETLIFY/`
- the next push target is unclear
- the changed routes have not been checked
- the agent is using `/Users/sawbeck/Projects/seascape-main` as if it were the authoritative `main` checkout

## Repo-specific truth

- Editable source: `src/`, `eleventy.config.js`, `package.json`, `netlify.toml`
- Generated output: `_site/`
- Netlify publish directory: `_site`
- Legacy archival content only: `DEPLOY THIS FOLDER TO NETLIFY/`
- On this machine, the only sync-only `main` checkout should be `/Users/sawbeck/Projects/seascape-vacations-site`
- `/Users/sawbeck/Projects/seascape-main` is a duplicate checkout, not the long-term sync target for `main`

If any older instruction conflicts with this document, follow the stricter safety rule.
