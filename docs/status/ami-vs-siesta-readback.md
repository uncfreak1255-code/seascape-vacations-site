# AMI vs Siesta Readback

## Status

- Status: pending first 7 complete days after deploy.
- Route: `/guides/anna-maria-island-vs-siesta-key/`.
- Source file: `src/guides/anna-maria-island-vs-siesta-key.html`.
- Source PR: #397, `Improve AMI vs Siesta guide transfer path`.
- Merge commit: `8f1b84cf18a19fd13e2131aa82fa4755f7e6c3c0`.
- Primary event: `guide_book_direct_click`.
- Site-side verifier: `npm run verify:ami-vs-siesta-readback`.

This note is the repo-local reminder for the PR #397 readback promise. It does
not replace the analytics receipt. `seascape-analytics` owns the joined GSC +
GA4 read; this repo owns the page source, tracking markers, and the reminder
that the readback is still pending.

## What Deployed

PR #397 added an early stay-base shortcut on the AMI vs Siesta guide. The source
markers that must remain present until the readback closes are:

- `data-transfer-choice="ami-vs-siesta-stay-base"`
- `Stay-base shortcut Anna Maria Island vacation rentals`
- `Stay-base shortcut Bradenton homes near AMI beaches`
- `Stay-base shortcut Siesta Key area stays`

## Baseline

Use the entry state from the analytics receipt for 2026-06-12 to 2026-06-18:

| Metric | Entry value |
| --- | ---: |
| GSC clicks | 25 |
| GSC impressions | 2502 |
| GA4 sessions | 104 |
| guide transfer events | 0 |

The guide entered PR #397 as a distribution gap: demand was present, but the
tracked guide-to-stay handoff had not happened.

## Readback Gate

Run the readback for the first 7 complete days after the production deploy of
merge commit `8f1b84cf18a19fd13e2131aa82fa4755f7e6c3c0`, once GSC and GA4 both
cover the full window.

If the Netlify production deploy completed on 2026-06-20 in
`America/New_York`, the first complete local-date window is 2026-06-21 through
2026-06-27. If the deploy receipt shows a different production deploy date, use
the first full local date after that deploy date and the next 6 complete days.

The readback should collect, for this route and window:

- GSC clicks
- GSC impressions
- GA4 sessions
- `guide_book_direct_click`
- rank, CTR, indexation, and event-markup guardrail status if the analytics
  receipt already includes them

Decision rule:

- keep if `guide_book_direct_click` is at least 1 and there is no rank, CTR,
  indexation, or event-markup regression
- if sessions stay above 20 and guide/stay/booking actions all remain 0, test
  CTA placement or copy before broad guide expansion
- do not claim booking, revenue, rank, or AI-citation lift from this readback
  unless a separate receipt proves it

## Next Agent Runbook

1. Run `npm run verify:ami-vs-siesta-readback` in this repo to confirm the
   source markers and reminder are still intact.
2. Confirm the Netlify production deploy receipt for merge commit
   `8f1b84cf18a19fd13e2131aa82fa4755f7e6c3c0`.
3. In `seascape-analytics`, run the joined route read for the first 7 complete
   local dates after that deploy.
4. Compare the readback to the baseline table above and apply the decision rule.
5. If the analytics receipt changes the broader branch-opening decision, update
   `docs/status/next-batch.md` with
   `node scripts/enforcement/sync-next-batch-from-analytics-receipt.js --receipt <path>`.
6. Close this note only after the analytics receipt exists; otherwise leave
   `Status: pending first 7 complete days after deploy`.
