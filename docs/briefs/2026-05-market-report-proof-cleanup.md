# Market Report Proof Cleanup Brief - May 2026

## Goal

Clean the older `/guides/florida-gulf-coast-vacation-rental-market-report-2026/` page so it stops presenting unsupported market-wide numbers as fact.

## Scope

Source page:

- `src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html`

Reference sources:

- `src/research/gulf-coast-vacation-booking-trends-2026.njk`
- `src/research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026.njk`
- `src/_data/ownerProofAssets.json`
- `docs/style/banned-patterns.md`

## Proof Rules

- Keep claims that are explicitly tied to Seascape's 545 confirmed bookings and 1,492 reservation dataset.
- Demote unsupported market-wide claims about occupancy, cap rates, YoY growth, and area-level ADR.
- Do not claim AMI, Siesta Key, Longboat Key, or Holmes Beach averages unless the source says how those numbers were calculated.
- Do not reuse "full-service" or generic owner language without naming the owner economics problem.

## Specific Fixes

- Replace metadata that claims AMI averages `$350/night` and Bradenton `$225/night`.
- Replace FAQ answers that assert unsupported occupancy, gross revenue, cap-rate, and area-comparison figures.
- Replace the booking-window section with the sourced 74-day average and 62-day median.
- Replace amenity percentage claims with a qualitative owner checklist.
- Replace the direct-booking YoY claim with sourced channel-mix framing.
- Replace the bottom market-performance table with a Seascape benchmark table sourced from the research report.

## Verification

- `git diff --check`
- `npm run verify:release`
- `npm run git:merge-check`
