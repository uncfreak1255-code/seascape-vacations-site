# Next Batch

## Reread Contract

- `docs/status/next-batch.md` is the only canonical reread handoff surface.
- Every reread update must write exactly one `Reread status` line and exactly one `Concrete next move` line in `Latest Execution Read`.
- Reread updates should be generated from a `seascape-analytics` next-batch decision receipt with `node scripts/enforcement/sync-next-batch-from-analytics-receipt.js --receipt <path>`.
- Allowed reread statuses:
  - `blocked by freshness`
  - `fresh but below threshold`
  - `open next batch`
- `docs/status/current-state.md` should not repeat volatile reread windows or `data_date` details from this file.
- A freshness block stops new expansion branches and impact claims. It does not
  stop bounded rescue work for a confirmed winner or money-page regression under
  `docs/process/ranking-regression-rescue.md`.

## Latest Execution Read

Run date: 2026-07-14.

The targeted joined operator read was executed in `seascape-analytics` and
rendered here from its machine-readable next-batch decision receipt.

- Requested last-7-complete-day window: 2026-07-06 to 2026-07-12.
- Latest BigQuery GSC `data_date`: 2026-07-12.
- Site work gate: `clear` - joined GSC + GA4 read covers the requested window.
- Reread status: `fresh but below threshold`.
- Concrete next move: owner cluster cannot clear by waiting - qualify one owner-direct, permissioned signal (see the Owner-Direct Intake Escalation section in seascape-vacations-site/docs/status/next-batch.md and seascape-vacations-site/docs/status/owner-direct-intake-policy.md). Do not use Airbnb or Vrbo host messaging; qualification is not a lead, named candidate state does not belong in the public site repo, and any one-to-one message still requires Sawyer's separate approval.
- Report recommendation: `hold-and-reread`.
- Reason: No cluster cleared the bar for a stronger next branch than holding for more readback.

Cluster read from the analytics receipt:

| cluster | pages | gsc_clicks | gsc_impressions | gsc_ctr | gsc_position | ga4_sessions |
|---|---:|---:|---:|---:|---:|---:|
| brand | 1 | 6 | 215 | 2.79% | 8.53 | 73 |
| catalog | 1 | 1 | 24 | 4.17% | 25.79 | 27 |
| guide_support | 1 | 1 | 1037 | 0.10% | 6.76 | 4 |
| guide_winners | 4 | 81 | 6442 | 1.26% | 4.16 | 135 |
| owner_hub | 1 | 0 | 28 | 0.00% | 10.25 | 2 |
| owner_money | 4 | 0 | 17 | 0.00% | 7.41 | 3 |
| owner_support | 1 | 0 | 1 | 0.00% | 10.00 | 1 |
| property_pages | 1 | 0 | 1 | 0.00% | 3.00 | 2 |
| stay_money | 2 | 0 | 3 | 0.00% | 9.00 | 17 |
| stay_support | 2 | 0 | 192 | 0.00% | 56.85 | 8 |

SEO queue read from the analytics receipt:

| queue_bucket | pages | gsc_clicks | gsc_impressions | ga4_sessions |
|---|---:|---:|---:|---:|
| measurement issue | 1 | 56 | 2498 | 74 |
| too thin to call | 11 | 1 | 74 | 58 |
| transfer/CRO issue | 1 | 19 | 2255 | 38 |
| wait | 5 | 13 | 3133 | 102 |

Do not open a new owner, stay, guide, GEO, or SEO expansion branch from this read.
If a tracked winner or money page has regressed, use `docs/process/ranking-regression-rescue.md` for a bounded rescue brief instead of waiting passively.
`docs/status/next-batch.md` should move to `open next batch` only when the analytics receipt says so.

## Likely Priorities

1. if `queries/rank_history_deltas.sql`, a rank tracker, or a live SERP read
   confirms a tracked winner or money-page regression, use
   `docs/process/ranking-regression-rescue.md` and the exact receipt-named
   branch before normal expansion thresholds
2. rerun the targeted operator read on the five tracked money pages after more recrawl time using the last 7 complete days:
   - `/property-management/vacation-rental-management-fees-florida/`
   - `/property-management/vacation-rental-licensing-florida/`
   - `/property-management/vrbo-management-services-florida/`
   - `/stays/anna-maria-island-vacation-rentals/`
   - `/stays/anna-maria-island-beachfront-rentals/`
3. open `owner-ctr-rewrite-round-2` only if all three owner money pages have a Search Console last crawl date later than the latest owner-page deploy and the joined 7-day read shows:
   - combined owner-money impressions `>= 1000`
   - weighted owner-money CTR `< 0.20%`
   - weighted owner-money average position `<= 10`
   - combined `owner_form_submits = 0`
4. inside that owner batch, treat a page as a snippet problem only when the page-level read shows:
   - impressions `>= 500`
   - average position `<= 10`
   - CTR `< 0.30%`
5. treat an owner page as a page-CRO problem when:
   - GA4 sessions `>= 20`
   - `owner_primary_cta_clicks = 0`
6. treat an owner page as form friction or tracking-gap territory when:
   - `owner_primary_cta_clicks > 0`
   - `owner_form_submits = 0`
7. wait instead of writing if one or more owner money pages still have not recrawled after the latest deploy or the owner cluster has combined impressions `< 1000`
8. reconsider Holmes Beach only if the two AMI stay winners both have fresh crawls after the stay deploy and the joined 7-day read shows:
   - combined stay-money impressions `>= 1000`
   - combined `stay_view_property_clicks >= 1`
9. if the AMI stay winners clear `>= 1000` impressions but still show `stay_view_property_clicks = 0`, open `stay-money-cro-round-2` instead of expansion
10. if any tracked page has GSC impressions `< 100` in the 7-day window, treat that page as too thin to call and do not let it drive the branch choice
11. keep Phase 4 and other entity-expansion work frozen unless the measured gates above move

## Owner-Direct Intake Escalation

The owner cluster is structurally sub-gate. Owner-money impressions sit far
below the 1000-impression gate in `## Likely Priorities`, and that gate cannot
clear by waiting — re-reading the same deadlocked cluster only produces another
hold. When the synced `## Latest Execution Read` shows the owner cluster
sub-gate in the current window, the report keeps `hold-and-reread` and the
reread status stays below threshold; it never moves to `open next batch` on the
strength of owner intake. The on-page loop has no lever here, so the next useful
step is to qualify a real owner-direct, permissioned signal instead of waiting
for an impression number that is not coming or using an OTA host-message path.

When this fires, the founder move is:

- qualify one signal from a referral, owner form, invited public contact path,
  permissioned networking connection, or direct inbound owner request
- apply `docs/status/owner-direct-intake-policy.md` and return a founder
  decision card for the current review; do not persist named candidate,
  receipt, fit, or contact-channel state in this public repository
- do not run an Airbnb, Vrbo, or other OTA outreach batch, and do not recreate
  drafts or follow-ups from the archived platform research
- treat a qualification decision as intake only: it is not a lead, does not move an
  owner gate, and does not authorize a message
- require Sawyer's separate approval before preparing any named, one-to-one
  next step
- count only a real, unlabeled reply that meets the register Validation
  Standard as owner demand

This section is hand-authored and lives after `## Likely Priorities` on
purpose: `scripts/enforcement/sync-next-batch-from-analytics-receipt.js` only
rewrites `## Latest Execution Read`, so this guidance is never overwritten by a
reread. The synced next-move line points here when the owner cluster is
sub-gate; this section does not restate it, and it adds no second reread-status
or next-move line of its own.

## Corrected SEO Decision Notes

- Authority order for this dispute: enforcement tests, rendered build output, live GSC/analytics, then agent opinion. `scripts/enforcement/owner-proof-clean.test.js` settles the AMI income guide: keep `src/guides/vacation-rental-income-anna-maria.html` noindexed and keep owner-income intent routed to `/research/owner-fee-revenue-leak-benchmark-2026/`.
- Do not force-reindex the pruned URL set from the June 2026 indexing drop. The June 3 rank tracker showed clicks and CTR rising while indexed pages shrank, so export the dropped URLs first and rescue only URLs with clicks, links, owner value, or a clear canonical mistake.
- `/guides/bradenton-vs-sarasota/` remains the defensible winner-defense target because the June 3 rank tracker recorded a #1 to #5 drop on the existing page. That supports a narrow rescue of the current page, not a new comparison page or broad expansion batch.
- `/stays/summer-vacation-rentals-florida-gulf-coast/` is resolved for now: keep it served but suppressed. Current source still puts it in `seoGovernance.staysNoindexSlugs`, `docs/portfolio/pseo-inventory-triage.md` classifies it as `noindex`, and `docs/portfolio/stay-money-pages.md` gives the stay winner lane to `/stays/anna-maria-island-vacation-rentals/` and `/stays/anna-maria-island-beachfront-rentals/`, not this seasonal slug. Retire it from the near-term July refresh queue unless a separate GSC + SERP proof pack and a defined money destination justify a rebuild.

## Planned Later: Real Stay Alerts

The shared guide conversion kit now uses a simpler `Direct Booking List`
offer because repo evidence only proves Mailchimp signup plus
`email_capture_submit` tracking. Do not treat the capture as a real alert
product yet.

Keep the idea, but build it deliberately after the current proof-clean,
owner-benchmark, and chart-pack work:

- keep visible copy on the simpler direct-booking list unless the real alert
  workflow exists
- collect actual trip intent fields: travel month or date range, area,
  guest count, and needs such as pool, dock, pet-friendly, or large group
- pass guide/page context and trip-intent fields to the email/CRM destination,
  not only GA4
- prove the downstream workflow: tag/segment creation, first email, owner of
  follow-up, unsubscribe path, and test submission evidence
- only then use language like `Stay Alerts`, `matching homes`, or
  `date alerts`

## Planned Later: Stays Page A/B Test

Keep the A/B test as a separate CRO build task. Do not let it block bounded SEO
regression rescue work, and do not run it on the low-volume owner page first.

Open the test only after the next joined read confirms which stays URL has
enough traffic to conclude cleanly. The current candidate is
`/stays/anna-maria-island-vacation-rentals/`, but use the highest-impression
direct-booking stays page if the read points elsewhere.

Before implementation, write a short experiment brief with:

- hypothesis, control, and one headline variant
- primary metric tied to direct-booking action, not vanity page views
- secondary and guardrail metrics
- estimated sample-size or duration check from the current traffic
- implementation path: Netlify split testing or a lightweight client-side
  variant with sticky assignment and no layout flicker

## Do Not Start With

- another site-wide SEO audit
- random new guide volume
- Holmes Beach expansion before the AMI winners prove they can convert better
- another owner-page rewrite before the post-recrawl read exists
- more agent docs or workflow theater beyond the five-role system
