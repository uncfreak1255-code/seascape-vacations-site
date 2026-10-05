# Failed Visual Gate

Use this when `npm run test:visual`, `npm run proof:visual`, or manual
screenshot review says the visual result is not trustworthy yet.

## Immediate Actions

1. Decide whether the diff is intentional or a regression.
2. Re-open the affected route in a fresh local browser session and inspect the
   changed section live.
3. If the change is intentional, finish the design-review loop and only then
   refresh the baseline or proof output.
4. If the change is unintentional, fix the source before touching baselines.
5. Re-run the visual gate with fresh desktop and mobile proof for the changed
   route.

Useful commands:

```bash
npm run test:visual
npm run proof:visual
```

If the intended design changed and the repo flow calls for a baseline refresh,
regenerate the committed baselines with the workflow instead of editing
screenshots by hand or committing local `--update-snapshots` output:

1. Push the task branch.
2. Run the `update-visual-baselines.yml` workflow (`Actions` -> `Update Visual
   Baselines` -> `Run workflow`, or `gh workflow run update-visual-baselines.yml
   -f branch=<task-branch> -f grep=<route-slug>`). `branch` is required; `grep`
   limits the run to specs matching the route slug. The job only runs for
   Sawyer's GitHub account on the self-hosted Mac runner, so start it from a
   Mac session, not from a cloud thread.
3. The workflow commits the new screenshots to the task branch as a bot
   commit. That commit does not restart the PR checks; push your next real
   commit (or an empty one) to run them again.
4. Pull the branch, look at the new screenshots, and confirm they show the
   intended design before asking for review.

## Source Of Truth

- current local route rendering
- visual diff output
- fresh desktop/mobile screenshots

## Proof Gate

- `npm run test:visual` passes
- fresh desktop/mobile proof shows the intended design
- the reviewer can see the changed section clearly, not just a giant full-page
  capture

## Do Not

- update baselines to hide a bug
- ask Sawyer for review while the visual result is still ambiguous
