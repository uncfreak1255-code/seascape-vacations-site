# Brief: owner proof-label form field

## Content Gate Inputs

- persona: Florida vacation-rental owner requesting a revenue review after reading an owner-economics page and expecting the form path to preserve reviewed proof labels for internal measurement.
- primary keyword: owner revenue review
- secondary keywords: florida vacation rental management, owner fee revenue leak benchmark, property management revenue review
- audience pattern: owner-form source files may change when the submission contract needs to preserve measured fields without changing visible copy or CTA structure.
- proof source: preview deploy readback from PR 296, `scripts/live_owner_lead_proof.py`, and the owner form source in `src/property-management/index.njk` plus `src/_includes/partials/owner-evaluation-form.njk`.
- required internal links: /property-management/, /research/owner-fee-revenue-leak-benchmark-2026/
- CTA target: keep the existing owner revenue review submit path and confirmation route unchanged.
- anti-claims: no new visible copy promises, no owner-demand claims, no fee or revenue claim changes, and no broad owner-page rewrite beyond the hidden form-field contract.

## Why This Batch

The public owner form source changed only to declare `proof_label` as a stable hidden field so Netlify can carry proof-labeled owner submits through the preview and production submission path.

## Cluster In Scope

- `src/_includes/partials/owner-evaluation-form.njk`
- `src/property-management/index.njk`

## Release Gate Checklist

- run `node --test scripts/enforcement/owner-acquisition.test.js scripts/enforcement/owner-lead-receipts.test.js`
- run `npm run build`
- run `npm run verify:release -- --range origin/main...HEAD`
- run `npm run git:merge-check`

## Done When

- exactly one brief is changed in `docs/briefs/` for this public-source branch
- the owner form source declares `proof_label` anywhere Netlify owner submissions originate
- repo gates pass without widening the owner-form scope

## Not In Scope

- visible owner copy rewrites
- new owner pages or CTA destinations
- analytics proof-loop logic changes
- guest-capture flow changes
