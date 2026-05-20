# Brief: Owner Operator Proof Pack

Date: 2026-05-19
Status: ACTIVE

## Content Gate Inputs

- persona: premium Gulf Coast vacation-rental owner who already understands fee math and now needs proof that Seascape can operate the home better
- primary keyword: vacation rental owner revenue protection
- secondary keywords: owner revenue teardown, vacation rental management proof, vacation rental owner statement review, Gulf Coast property management
- audience pattern: skeptical switcher who wants specific operating proof before sending a listing URL, statement, or fee quote
- proof source: `seascape-hub/projects/operator-performance-proof-library.md`, `seascape-hub/projects/owner-acquisition-machine.md`, and `src/_data/ownerProofAssets.json`
- required internal links: /property-management/, /research/owner-fee-revenue-leak-benchmark-2026/
- CTA target: /property-management/?owner_source=how-seascape-protects-owner-net-2026#owner-cta
- anti-claims: no demand proof from test receipts, no portfolio-wide guarantee, no market-wide authority from narrow examples, no review-count theater, no AI-led pitch, no generic full-service promise

## Why This Batch

- The owner benchmark already proves that management percentage alone is the wrong comparison.
- The next trust gap is execution proof: what Seascape can actually protect, explain, or flag after the owner understands the fee and booking-source math.
- This batch creates one proof asset at `/research/how-seascape-protects-owner-net-2026/`.

## Canonical Route

- Winner URL: `/research/how-seascape-protects-owner-net-2026/`
- Feeders: `/research/owner-fee-revenue-leak-benchmark-2026/` and `/property-management/`
- Money destination: `/property-management/?owner_source=how-seascape-protects-owner-net-2026#owner-cta`

## Approved Proof Modules

Use the current Hub proof library modules only:

- `OPM-2026-04-BT-DIRECT-MIX-01`: Sarasota Luxe March 2026 direct booking share and avoided Airbnb-like cost.
- `OPM-2026-04-PATRICK-DIRECT-MIX-01`: Patrick portfolio March 2026 direct booking share and one direct-booking savings example.
- `OPM-2026-04-BRADENTON-FEE-STACK-01`: Bradenton Pool March 2026 cleaning-heavy Airbnb cost example.
- `OPM-2026-04-OWNER-REPORT-COMMS-01`: redacted owner-report communication standard.

## Boundaries

- These modules are redacted operating examples, not promises for every home.
- Benchmark-path receipts are measurement proof only and must not be presented as real owner demand.
- Completed real-owner teardowns are still not promoted; the public page must say that property-specific conclusions require a private teardown.
- Missing owner statements, calendars, reviews, or fee terms stay unknown instead of being guessed.

## Page Job

The page should answer:

- what Seascape has already seen in real operating examples
- what Seascape changed, protected, or made clearer
- what the examples cannot prove
- why the next step remains the same teardown CTA, not a new form or pitch path

## Release Gate

Smoke these routes:

- `/research/how-seascape-protects-owner-net-2026/`
- `/research/owner-fee-revenue-leak-benchmark-2026/`
- `/property-management/`

Run:

- `npm run build`
- `npm run lint:content`
- `npm run verify:links`
- `npm run verify:jsonld`
- `node --test scripts/enforcement/owner-acquisition.test.js`
