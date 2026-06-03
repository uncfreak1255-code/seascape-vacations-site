# Failed Netlify Deploy

Use this when a merged commit never reaches a healthy production deploy, the
wrong build publishes, or Netlify fails before publish.

## Immediate Actions

1. Capture the deploy URL or ID and the first failing log lines.
2. Re-run the local build from a clean worktree at the merged commit:

```bash
npm run build
```

3. If the local build fails, fix that source issue in a hotfix lane first.
4. If the local build passes, check the deploy seam that can still differ:
   `netlify.toml`, runtime pin, publish directory, and any deploy-time env
   assumption.
5. Only reopen product or content work after deploy proof is back.

## Source Of Truth

- Netlify deploy logs
- current `main` commit SHA
- local `npm run build` output from a clean checkout

## Proof Gate

- Netlify shows a successful production deploy for the merged or hotfix commit
- `docs/process/post-merge-runtime-proof-checklist.md` passes against
  production

## Do Not

- debug from dirty root `main`
- deploy from `DEPLOY THIS FOLDER TO NETLIFY/`
- assume a passing preview proves production is healthy
