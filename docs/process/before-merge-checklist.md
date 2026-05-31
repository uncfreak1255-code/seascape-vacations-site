# Before Merge Checklist

Use this before anything lands on `main`.

## 1. Workspace check

- [ ] I am working on `codex/<task>`, not in the root `main` folder
- [ ] `git status --short` shows only intended task changes
- [ ] I am not hand-editing `_site`
- [ ] I am not using `DEPLOY THIS FOLDER TO NETLIFY/` as the source

## 2. Build check

- [ ] `npm run build` passes
- [ ] The build output I care about exists in `_site`

## 3. Task verification check

Run the checks that match the task.

Recovery baseline:

```bash
npm run verify:recovery:p0
npm run verify:recovery:guides
npm run verify:recovery:remediation
```

If the task does not touch all three areas, run the relevant subset and note why.

- [ ] If visible `src/` copy changed, I completed `copywriting` -> `enterprise-ui-writing` -> `humanizer` and `npm run lint:content`.

## 4. Route smoke check

Open or `curl` the changed routes locally or on a preview deploy.

Minimum expectation:

- [ ] the route returns the expected status
- [ ] the page shows the new content, not old cached content or stale local output
- [ ] redirects go where they should
- [ ] no obvious broken CTA or dead-end link was introduced
- [ ] any user-review route already passed `docs/process/before-user-review-checklist.md`

Examples:

```bash
curl -I -s http://localhost:8080/property-management/ | sed -n '1,20p'
curl -I -s http://localhost:8080/guides/anna-maria-island-area-guide/ | sed -n '1,20p'
curl -I -s http://localhost:8080/properties/dockside-dreams/ | sed -n '1,20p'
```

## 5. Visual evidence check

If the task changed layout, CSS, spacing, typography, imagery, component structure, or visual hierarchy:

- [ ] I captured fresh desktop screenshots for every changed route or changed visual section
- [ ] I captured fresh mobile screenshots for every changed route or changed visual section
- [ ] For long pages, I used enough screenshots to cover the changed sections instead of trusting one giant full-page image
- [ ] I reviewed the screenshots myself and verified any capture artifact in a live browser before merge
- [ ] Before merge, I attached or linked the visual proof set in the PR (desktop + mobile) so Sawyer can review the actual design changes.

## 6. Diff check

- [ ] `git diff --stat` matches the task I think I did
- [ ] no unrelated files are being pulled in
- [ ] generated churn is understood, not accidental

## 7. Release decision

Only merge or push `main` if this sentence is true:

> I am comfortable with this exact branch becoming production.

If that sentence feels too strong, do not merge.

## 8. After merge

- [ ] watch the Netlify deploy complete
- [ ] complete `docs/process/post-merge-runtime-proof-checklist.md`
- [ ] capture the post-merge proof receipt in the PR comment or merge closeout note

Useful production checks:

```bash
node scripts/recovery/assert-live-smoke.js https://seascape-vacations.com
node scripts/recovery/assert-live-entity-schema-coverage.js https://seascape-vacations.com
curl -I -s https://seascape-vacations.com/property-management/ | sed -n '1,20p'
curl -I -s https://seascape-vacations.com/property-owners/ | sed -n '1,20p'
```

## Hard no list

Do not merge when:

- the task only "probably works"
- verification was skipped
- `main` is being used like a scratchpad
- you are relying on memory instead of checking the routes
- you expect to "fix it after deploy"
