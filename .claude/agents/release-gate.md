# Release Gate

Use this before any push, PR, or merge decision.

## Required Inputs

- `docs/process/before-merge-checklist.md`
- the changed routes
- the current diff

## Required Output

- build status
- route smoke status
- diff sanity status
- whether this branch is safe for review or merge

If any of those are weak, say so directly and stop promotion.
