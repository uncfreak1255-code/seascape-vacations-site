# Next Batch — Historical Receipts

Companion to `docs/status/next-batch.md`. Dated receipts and closed notes live here so the live handoff surface stays editable under the file-size gate.

## Historical September 13 Receipt

Run date: 2026-09-13 (historical receipt; freshness below applies only to its
2026-09-05 to 2026-09-11 window, not to the current execution date).
A current joined Analytics receipt is required before using this read to open a
measured batch or make a current performance claim.

The targeted joined operator read was executed in `seascape-analytics` and
rendered here from its machine-readable next-batch decision receipt.

- Requested last-7-complete-day window: 2026-09-05 to 2026-09-11.
- Latest BigQuery GSC `data_date`: 2026-09-11.
- Site work gate: `clear` - joined GSC + GA4 read covers the requested window.
- Historical verdict: `fresh but below threshold`.
- Historical next move: owner cluster cannot clear by waiting - qualify one owner-direct, permissioned signal (see the Owner-Direct Intake Escalation section in seascape-vacations-site/docs/status/next-batch.md and seascape-vacations-site/docs/status/owner-direct-intake-policy.md). Do not use Airbnb or Vrbo host messaging; qualification is not a lead, named candidate state does not belong in the public site repo, and any one-to-one message still requires Sawyer's separate approval.
- Report recommendation: `hold-and-reread`.
- Reason: No cluster cleared the bar for a stronger next branch than holding for more readback.

Cluster read from the analytics receipt:

| cluster | pages | gsc_clicks | gsc_impressions | gsc_ctr | gsc_position | ga4_sessions |
|---|---:|---:|---:|---:|---:|---:|
| brand | 1 | 7 | 145 | 4.83% | 8.81 | 132 |
| catalog | 1 | 0 | 31 | 0.00% | 11.06 | 34 |
| guide_support | 1 | 0 | 66 | 0.00% | 7.21 | 0 |
| guide_winners | 4 | 23 | 3202 | 0.72% | 5.25 | 61 |
| owner_hub | 1 | 0 | 42 | 0.00% | 13.90 | 8 |
| owner_money | 4 | 0 | 25 | 0.00% | 11.60 | 2 |
| owner_support | 1 | 0 | 4 | 0.00% | 14.00 | 1 |
| property_pages | 1 | 0 | 1 | 0.00% | 8.00 | 10 |
| stay_money | 2 | 0 | 236 | 0.00% | 65.67 | 11 |
| stay_support | 2 | 0 | 34 | 0.00% | 18.26 | 3 |

SEO queue read from the analytics receipt:

| queue_bucket | pages | gsc_clicks | gsc_impressions | ga4_sessions |
|---|---:|---:|---:|---:|
| measurement issue | 1 | 7 | 1510 | 13 |
| too thin to call | 13 | 2 | 257 | 73 |
| wait | 4 | 21 | 2019 | 176 |

Do not open a new owner, stay, guide, GEO, or SEO expansion branch from this read.
If a tracked winner or money page has regressed, use `docs/process/ranking-regression-rescue.md` for a bounded rescue brief instead of waiting passively.
`docs/status/next-batch.md` should move to `open next batch` only when the analytics receipt says so.
