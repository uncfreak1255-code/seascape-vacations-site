# Post-Merge Runtime Proof Checklist

Use this after the merged commit has been published and deployed, before
calling the task shipped. A merge made after the daily 09:05 UTC Publish
Production run deploys with the next day's batch; until then the honest state is
merged and queued for publish.

This is required for deploy-sensitive site work.

## 1. Wait for deploy

- [ ] A Netlify production deploy is complete for a `production` commit that
  contains the merge (`git fetch origin production && git merge-base --is-ancestor <merge-sha> origin/production`).
  The deployed SHA is usually a later `main` commit carrying several merges.
  A batch that changes only agent docs, tooling or CI is skipped on purpose
  while live availability is under 12 hours old
  (`scripts/enforcement/netlify-ignore-build.js`); the deploy log then shows
  the skip reason and no new deploy is expected.
- [ ] I am testing production, not preview.

## 2. Run production smoke

- [ ] `npm run verify:recovery:live`

## 3. Re-run live entity schema coverage

- [ ] `npm run verify:recovery:entity-live`

## 4. Capture proof receipt

Record all of this in the PR comment or merge closeout note:

- [ ] UTC timestamp
- [ ] merged commit SHA
- [ ] command outputs for Sections 2 and 3
- [ ] pass/fail verdict

Example receipt block:

```text
Post-merge runtime proof
UTC: 2026-05-30T20:10:00Z
Commit: <sha>
verify:recovery:live: PASS
verify:recovery:entity-live: PASS
```

## 5. Failure rule

If either command fails:

- [ ] do not mark the task complete
- [ ] use `docs/runbooks/failed-netlify-deploy.md` if the deploy never goes healthy
- [ ] use `docs/runbooks/release-incident.md` if production behavior is broken after deploy
- [ ] open a hotfix lane or rollback plan
- [ ] include the failing output in the closeout note
