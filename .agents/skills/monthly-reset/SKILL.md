---
name: monthly-reset
description: Refresh the repo's live status surfaces at month boundaries or after a batch closes. Use when the user asks to roll the month forward, refresh current repo truth, or clean up stale monthly coordination habits.
disable-model-invocation: true
---

# Monthly Truth Reset

This repo no longer runs on monthly task logs or content-priority files.

Repo truth:
- live operating state belongs in `docs/status/`
- batch intent belongs in `docs/briefs/`
- routing truth belongs in `docs/portfolio/`
- old root files like `task-log-YYYY-MM.md` and `content-priorities-YYYY-MM.md` are legacy artifacts, not live authority

## Use This Flow

1. Read the current operating layer:
   - `docs/status/current-state.md`
   - `docs/status/next-batch.md`
   - `docs/status/open-risks.md`
   - the active brief in `docs/briefs/`
   - the relevant file in `docs/portfolio/`
2. Gather fresh evidence before changing status docs:
   - latest operator read from `seascape-analytics` if the reset depends on GSC, GA4, or BigQuery evidence
   - current source files if copy, schema, redirects, or routing truth changed
   - current repo state if the question is workflow or release readiness
3. Update only the surfaces that are actually live:
   - refresh `docs/status/current-state.md` when a claim can be verified now
   - refresh `docs/status/next-batch.md` when the measured gates or next branch changed
   - refresh `docs/status/open-risks.md` when a risk was added, retired, or materially changed
   - update the active brief if the next batch definition changed
4. Keep the repo out of stale monthly habits:
   - do not create a new `task-log-YYYY-MM.md`
   - do not create a new `content-priorities-YYYY-MM.md`
   - do not write repo-local `MEMORY.md`
   - if legacy monthly root files need cleanup, treat that as a separate archival change instead of regenerating them

## Stop Conditions

- The needed operator evidence is unavailable, stale, or was not actually checked
- The status docs would need guessed numbers or guessed outcomes
- The source files and status docs disagree about what is live
- The change is really a new SEO batch decision and there is no fresh brief/evidence yet

## Output

Report:
- what status files were updated
- what evidence supported each update
- what stayed unchanged because it was not verified
- whether any legacy monthly files were intentionally ignored or queued for archival cleanup
