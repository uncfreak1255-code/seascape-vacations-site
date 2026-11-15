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

## Bounded Attack Check — October 2, 2026

Attack status: `completed` for the existing AMI-versus-Siesta comparison.
Query variants checked: `Anna Maria Island vs Siesta Key vacation families` and
`best time visit Anna Maria Island`; guest destination-choice intent. Free web
search and competitor-page reads were used, not paid DataForSEO or a new rank
check. Search results are research evidence, not a Google rank-tracker receipt.

Inspected competitors: [Compass Hotel](https://www.compasshotel.com/anna-maria-sound/anna-maria-island-vs-siesta-key),
[Vacation Florida](https://vacationflorida.tv/anna-maria-island-vs-siesta-key/), and
[Mousin Around](https://mousinaround.com/siesta-key-vs-anna-maria-island/).
They compete on destination fit, family logistics and accommodation choices.
Current Site source already supplies a verdict, comparison table, parking and
stay-base choices; preserve that decision format rather than add another page.

The Analytics September 24–30 read reports 888 impressions, 12 clicks and
14 impressions on the no-slash variant. Source already has the trailing-slash
canonical and 301 rule; an October 2 live HEAD read of that exact variant returned
301 to `/guides/anna-maria-island-vs-siesta-key/`. No redundant redirect repair is
warranted from this evidence. It does not prove Google has recrawled the variant.
Next bounded proof action: Analytics should compare variant rows on the next
complete window before proposing any consolidation change. No title rewrite,
new expansion, design change or booking-PR overlap is authorized by this check.

OpenSEO configuration readback showed the optional localhost MCP and exactly
six allowed saved-state reads with approval mode `prompt`; the local endpoint
responded. This task exposes no OpenSEO tool calls or browser-control execution
surface, so `list_projects` and two saved-tracker reads remain unverified. Do not
replace them with guessed rank history or invoke paid lookup tools.
