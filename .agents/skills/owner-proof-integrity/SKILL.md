---
name: owner-proof-integrity
description: Keep Seascape owner proof aligned across assets, page copy, and metadata. Use for owner money pages or claims about fees, revenue, reviews, homes served, local proof, or management performance.
---

# Owner Proof Integrity

Use this when owner proof claims change.

## Authority

- Approved proof assets: `src/_data/ownerProofAssets.json`
- Owner page routing and metadata context: `src/_data/seoPages.json`
- Shared owner template: `src/property-management/property-management.njk`
- Relevant checks: `scripts/enforcement/owner-acquisition.test.js` and `scripts/enforcement/metadata-integrity.test.js`

## Workflow

1. Read `docs/status/current-state.md`, `docs/status/open-risks.md`, and the active brief.
2. Identify the claim class: benchmark metric, review or testimonial proof, service coverage, owner CTA support, or page metadata.
3. Change the proof asset or source data first.
4. Update reader-facing copy only after the source truth exists.
5. Run:

```bash
npm run verify:release
```

## Rules

- Do not invent benchmark numbers, review counts, revenue deltas, or service claims.
- Do not let page copy outrun the approved proof asset.
- Keep proof copy, reader copy, and agent notes separate.
- If proof no longer exists, remove or downgrade the claim instead of softening the wording.

## Output

State:
- which claim changed
- which file stayed source of truth
- which dependent pages were affected
- which verification command passed or failed
