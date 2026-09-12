---
name: owner-proof-integrity
description: Use when checking or changing Seascape owner proof claims against approved assets.
---

# Owner Proof Integrity

Use this when owner proof claims change.

## Authority

- Approved proof assets: `src/_data/ownerProofAssets.json`
- Owner page routing and metadata context: `src/_data/seoPages.json`
- Shared owner template: `src/property-management/property-management.njk`
- Relevant checks: `scripts/enforcement/owner-acquisition.test.js` and `scripts/enforcement/metadata-integrity.test.js`

## Change and completion contract

Use the active brief and relevant current drift warnings to identify the claim
and dependent surfaces. Establish approved source truth before updating copy.
Run `npm run verify:release` and repair in-scope failures before reporting the
implementation complete. For review-only requests, report discrepancies.

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
