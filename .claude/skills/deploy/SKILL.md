---
name: deploy
description: Stage, commit, push to GitHub, deploy via Netlify, and verify live pages
disable-model-invocation: true
---

# Deploy to Production

Run the full deploy pipeline for seascape-vacations.com.

## Steps

1. **Stage changes**: `git add -A` in the repo root
2. **Commit**: Use a descriptive conventional commit message (feat:, fix:, chore:, etc.)
3. **Push to GitHub**: `git push origin main` — Netlify caches based on remote commit hash, so this MUST happen before deploy
4. **Deploy via Netlify MCP**: Use `deploy-site` with siteId `380fdf4b-91dd-4c6d-a31c-252c07aade81`
5. **Verify**: curl 3 changed pages and confirm new content appears (check for a unique string, not just HTTP 200)
6. **If verification fails**: Wait 60 seconds, re-push, re-deploy, re-verify
7. **Log**: Append deploy summary to `task-log-YYYY-MM.md` if running as part of a scheduled task

## Important Notes

- The deploy folder is `DEPLOY THIS FOLDER TO NETLIFY/` inside the repo
- If new files return 404, add `<!-- deploy-force: YYYY-MM-DD -->` comment and redeploy
- Always use `set +H` before git commands (bash history expansion conflicts with `!!` in folder name)
- Use `GIT_DISCOVERY_ACROSS_FILESYSTEM=1` and `git -C "$REPO"` instead of `cd`

## Arguments

- `--message "your commit message"` — Override the auto-generated commit message
- `--skip-verify` — Skip the post-deploy curl verification (not recommended)
