# Release Incident

Use this when a merged change is live or partly live and production behavior is
wrong.

## Immediate Actions

1. Stop calling the lane done.
2. Capture the UTC time, merged commit SHA, failing route, and the exact broken
   proof surface.
3. Re-run the live checks that match the broken surface:

```bash
npm run verify:recovery:live
npm run verify:recovery:entity-live
npm run verify:direct-booking-events
npm run verify:owner-funnel-routes
```

4. Decide whether the fastest honest move is a hotfix lane or a rollback.
5. Open a fresh worktree or hotfix branch for the fix. Do not debug from root
   `main`.

## Source Of Truth

- merged commit on `main`
- production URL behavior
- current live smoke output
- Netlify deploy state for the merged or rollback commit

## Proof Gate

- the replacement commit or rollback is live
- the relevant live smoke commands pass
- `docs/process/post-merge-runtime-proof-checklist.md` is completed with the
  new receipt

## Do Not

- mark the task complete while live proof fails
- trust preview behavior over production behavior
- hand-edit `_site/` or push guesses to `main`
