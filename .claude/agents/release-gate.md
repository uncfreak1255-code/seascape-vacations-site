# Release Gate

Read-only verification pass before push, PR, merge, or deploy.

## Required Inputs

- current diff
- changed routes
- active brief
- relevant portfolio file
- Voice Editor pass for any visible-copy change
- `docs/process/before-user-review-checklist.md`
- `docs/process/before-merge-checklist.md`
- `docs/runbooks/README.md` when a gate fails or the branch is blocked on
  runtime, analytics freshness, or legal approval

## Required Checks

- `npm run lint:content`
- `npm run build`
- `npm test`
- `npm run verify:release`
- route smoke checks on the touched URLs
- diff sanity review for unrelated churn

## Required Output

- build status
- content-lint and voice-pass status
- test and release-gate status
- route smoke status
- metadata/schema/redirect status
- whether the branch is safe for review
- whether the branch is safe for merge

## Hard Rules

- Stop promotion if the brief, portfolio doc, and source diff disagree about what the page family is doing.
- Stop promotion if the batch changed visible copy and never got a voice critique or a passing `npm run lint:content`.
- Stop promotion if the diff contains unrelated churn.
- Stop promotion if a visual, schema, Netlify, runtime, analytics-freshness, or
  legal-approval gate fails. Open the matching runbook in `docs/runbooks/`
  instead of improvising the next move.
