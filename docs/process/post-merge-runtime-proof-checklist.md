# Post-Merge Runtime Proof Checklist

Use this right after merge and deploy, before calling the task done.

This is required for deploy-sensitive site work.

## 1. Wait for deploy

- [ ] Netlify deploy is complete for the merged commit.
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
