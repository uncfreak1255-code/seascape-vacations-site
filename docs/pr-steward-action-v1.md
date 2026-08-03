# PR steward action v1

This is an action path, not a receipt-only report. In v1 it is human-invoked
only through `workflow_dispatch`; it is not a PR watcher or hourly scheduler.

The workflow runs in the repository that owns the pull request. It uses that
repository's `GITHUB_TOKEN`, so it cannot accidentally write a different
repository.

## Automatic actions

- A Dependabot patch or minor update is auto-merge eligible only when the title
  contains an explicit version change, every changed file is a dependency
  manifest or lockfile, checks are green, the branch is protected by required
  checks, GitHub reports no conflict or stale branch, and a non-empty clean
  Codex review is bound to the exact evaluated head. The action enables GitHub
  auto-merge with squash and `--match-head-commit`; it does not force-merge.
- A major, security, configuration, workflow, runtime, deployment, guest,
  reservation, database, or other non-routine change gets one exact-head
  `@codex review` request.
- A current unresolved review thread gets one exact-head `@codex fix`
  request.
- A failing check gets one exact-head `@codex fix` request.
- Exact-head marker comments make each request idempotent. A new commit creates
  a new head and permits one new action.
- Codex review/fix commands and merge writes require an owner/member/
  collaborator author on the base repository. Fork heads and unknown author
  associations are held without a command.

Agent-authored and other non-routine PRs are never automatically merged in v1.
They can be reviewed and repaired automatically, but the action stops before
landing them.

## Safety boundary

The workflow is deliberately `workflow_dispatch` only and checks out the
repository default branch before loading the action. It never executes code
from the pull request head. It has no deploy, send, credential,
branch-protection, force-push, or cross-repository write behavior.

If Sawyer later approves an event-driven caller, it must re-run the same
stateless policy after `workflow_run.completed`,
`pull_request_review.submitted|edited|dismissed`, and
`pull_request_review_comment.created|edited|deleted`. Those transitions are
the proof that delayed checks or newly added/resolved review threads have been
re-read; a PR-opened result of `hold` is never treated as final.

Automatic Codex reviews can remain disabled. A human dispatch invokes Codex
only for trusted exception PRs, and routine Dependabot updates also require the
same clean exact-head review receipt before any merge action.

This rollout installs the caller in Seascape Vacations Site as a separate draft PR.
It remains inactive until that PR is merged and a human dispatches it.

## Proof

```bash
python3 tools/run_tests.py tests/pr_auto_steward_test.py
```

The test suite proves action invocation, clean exact-head receipt enforcement,
head-change and `--match-head-commit` protection, unsafe author/fork rejection,
repeated-marker idempotence, delayed checks, newly added review threads, the
event re-evaluation contract, unsafe-update rejection, CI/review fix requests,
and fail-closed behavior when required branch protection is missing.
