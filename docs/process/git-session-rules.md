# Git Session Rules

This file exists to stop agents and humans from improvising Git in this repo.

Use it at the start of any session that might change files.

These checkout and wrapper commands apply to the local coordinator. For a
Codex cloud task's disposable checkout, use `AGENTS.md` -> Codex Cloud Handoff;
the coordinator retains these gates for integration and publication.

## Source currency

Before loading task documents or choosing an implementation base:

1. Run `git status --short --branch` and `git rev-parse HEAD` in the owning
   checkout. Record the task owner and preserve all existing changes.
2. Run `git fetch origin main`, then `git rev-parse origin/main` and
   `git rev-list --left-right --count HEAD...origin/main`. The two counts show
   commits unique to this checkout and to the fetched main. A cached tracking
   ref alone does not prove currency. If fetch fails, say the comparison is
   against cached source and do not claim it is current. Read-only analysis
   may continue with that caveat; starting new work that requires current
   main waits for a successful fetch.
3. Choose the route:
   - Clean root `main` with no unique commits: synchronize with
     `git pull --ff-only origin main` when synchronization is part of the task.
   - Dirty, divergent, or detached root or unassigned checkout: leave it
     intact. Start new work in a guarded `.worktrees/<task>` checkout on
     `codex/<task>` from the fetched `origin/main`. Do not stash, reset, or
     switch the original checkout.
   - Existing task branch: keep its changes and base. Inspect upstream changes
     relevant to the task; fetching does not require resetting or rebasing it.
   - Read-only audit: read current files with `git show origin/main:<path>`.
     Read the local diff separately when the question concerns local edits.
4. Load instructions and task source from the selected checkout or snapshot.
   If the harness already loaded older instructions, compare affected rules
   with current source before acting and report material conflicts.

## Advisory overlap check before new work

Before creating a branch, identify the intended files and check live open PRs,
including drafts. Use the connected GitHub reads or the existing authenticated
CLI; do not wait for the Hub's six-hour report:

```bash
gh api --paginate 'repos/uncfreak1255-code/seascape-vacations-site/pulls?state=open&per_page=100' \
  --jq '.[] | {number, title, html_url, draft, head_ref: .head.ref, head_sha: .head.sha}'
# For each candidate, replace NUMBER with its PR number:
gh api --paginate 'repos/uncfreak1255-code/seascape-vacations-site/pulls/NUMBER/files?per_page=100' \
  --jq '.[] | {filename, previous_filename}'
```

- Compare planned paths with the candidates' changed files, including rename
  source paths. Read matching titles, bodies and diffs to distinguish the same
  task from independent edits. Inspect relevant merges from the last seven
  days too; file overlap alone is an advisory, not proof of duplicated work.
- If the same task already has a PR, continue its branch and review destination.
  Name that PR and the mutation owner. A restack or harness-created branch does
  not need a second PR; preserve its commits and update the existing task branch
  through the normal safe Git route. Do not overwrite another agent's work.
- If scopes only share a file, decide a bounded order or consolidation from the
  actual diffs. Generated indexes and append-only logs often overlap without
  duplicating a task. Record the disposition in the handoff or PR body; do not
  create a new approval request merely because a path overlaps.
- Repeat the live read immediately before the first push/review request, PR
  creation and merge. Compare `git rev-parse HEAD` with open PR `head_sha`
  values, and inspect the intended keeper PR's current state. An identical
  commit on another branch is strong evidence to reuse that review destination.
  If that task has already merged, verify remaining changes against fresh main
  before spending another review or CI run. Do not open a duplicate PR.
- An inaccessible repo, incomplete file list or failed read means unknown
  coverage, not clear. Continue independent local work and report the missing
  evidence; do not mint credentials or treat a green scheduled job as coverage.

This is an agent procedure using existing reads, not a required status check,
merge lock, new job or permission change. The Hub checker remains a periodic
backstop; its file/key rows are candidates for inspection, not merge conflicts
or automatic close instructions. Simultaneous agents can still race; changed
agent behavior and saved CI require subsequent live-task evidence.

## First decision: sync or work

Ask this first:

- Are we only syncing local `main`?
- Or are we starting real work?

If the answer is `sync`:

1. Stay on root `main`
2. Run `git pull --ff-only origin main`
3. Verify with `git log --oneline -1`
4. Stop there

If the answer is `real work`:

1. Do not edit root `main`; complete the advisory overlap check above
2. Create `codex/<task>`
3. Create `.worktrees/<task>`
4. Do the work in that worktree only
5. Run `npm ci` there once; a fresh worktree has no `node_modules`, and the
   root checkout's install is not shared. Skip this only for a docs-only
   change that you will not test locally
6. Run `npm run git:preflight` before real edits

A Claude Code session that its harness already pinned to
`.claude/worktrees/<name>` has completed steps 2 to 4 under a different name.
Stay in that worktree on the branch the harness created; do not add a
`.worktrees/<task>` checkout on top of it.

## Root `main` rules

- Root `main` is sync-only
- Root `main` is not a scratchpad
- If `git status --short` on root `main` is noisy, do not start work there
- If the next safe command is unclear, stop and fix workflow before editing
- On this machine, `/Users/sawbeck/Projects/seascape-vacations-site` should be the only sync-only `main` checkout
- `/Users/sawbeck/Projects/seascape-main` is a duplicate checkout; do not treat it as the long-term source for new work or for `main` sync

## File size gate

The pre-commit hook blocks staged files over 5,000 tokens (bytes / 4) and
growth of files already over it; its error says how to split the file. Guide
pages, mockups, `src/_data` JSON and lockfiles are exempt; the list lives in
`scripts/enforcement/check-staged-file-size.js#IGNORED`.

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

1. Check source currency above; sync clean root `main` only when appropriate
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
