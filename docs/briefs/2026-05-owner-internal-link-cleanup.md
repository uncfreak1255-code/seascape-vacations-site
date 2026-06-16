# Brief: owner internal-link cleanup

## Content Gate Inputs

- persona: Florida vacation-rental owner evaluating management fit, local compliance risk, and market-specific execution before requesting a teardown.
- primary keyword: florida vacation rental management
- secondary keywords: florida vacation rental licensing, anna maria island vacation rental management, bradenton vacation rental management, sarasota vacation rental management
- audience pattern: owner-intent guide and research pages should route readers into the exact owner management and licensing pages when the sentence already covers ownership decisions.
- proof source: source review of `src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html` and `src/research/owner-fee-revenue-leak-benchmark-2026.njk` plus current owner money-page routing in `src/property-management/`.
- required internal links: /property-management/vacation-rental-licensing-florida/, /property-management/buy-vacation-rental-property-florida/
- CTA target: keep existing owner CTA paths as-is; this batch only improves contextual owner internal links.
- anti-claims: no title/meta rewrites, no new pages, no schema changes, no new revenue guarantees, and no broad copy rewrite outside bounded internal-link context.

## Why This Batch

The current branch already shipped bounded owner-link additions in two public source files. This brief exists to document the content contract for that narrow cleanup so merge verification can validate one active brief against the changed public files.

## Cluster In Scope

- `src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html`
- `src/research/owner-fee-revenue-leak-benchmark-2026.njk`

## Release Gate Checklist

- run `npm run lint:content`
- run `npm run verify:links`
- run `SEASCAPE_WORKTREE_LOCK_REPO_BUILD="/Users/sawbeck/Projects/seascape-vacations-site/.git/worktrees/seascape-vacations-site-codex-owner-internal-link-cleanup/repo-build.lock" npm test`
- run `git diff --check`
- run `npm run git:merge-check`

## Done When

- exactly one brief is changed in `docs/briefs/` for this public-content branch
- required internal links from this brief are present on both changed public source files
- verification commands pass without widening scope

## Not In Scope

- new owner page creation
- title/meta rewrites
- CTA copy changes
- broad paragraph rewrites outside the inserted internal-link context
