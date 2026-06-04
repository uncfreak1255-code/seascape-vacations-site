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

## Latest Execution Read

Run date: 2026-06-04.

The targeted joined operator read was executed in `seascape-analytics` and
rendered here from its machine-readable next-batch decision receipt.

- Requested last-7-complete-day window: 2026-05-28 to 2026-06-03.
- Latest BigQuery GSC `data_date`: 2026-06-01.
- Site work gate: `blocked` - GSC export freshness does not cover the requested window.
- Reread status: `blocked by freshness`.
- Concrete next move: rerun the targeted operator read after BigQuery GSC covers 2026-06-03.
- Report recommendation: `hold-and-reread`.
- Reason: No cluster cleared the bar for a stronger next branch than holding for more readback.
- GSC freshness warning: Requested window ends `2026-06-03`, but BigQuery GSC data is only current through `2026-06-01`. Treat the trailing day as unavailable.

Cluster read from the analytics receipt:

| cluster | pages | gsc_clicks | gsc_impressions | gsc_ctr | gsc_position | ga4_sessions |
|---|---:|---:|---:|---:|---:|---:|
| brand | 1 | 10 | 160 | 6.25% | 12.38 | 78 |
| catalog | 1 | 0 | 25 | 0.00% | 23.00 | 45 |
| guide_support | 1 | 0 | 542 | 0.00% | 6.72 | 3 |
| guide_winners | 4 | 30 | 3237 | 0.93% | 4.92 | 109 |
| owner_hub | 1 | 1 | 45 | 2.22% | 6.38 | 29 |
| owner_money | 4 | 0 | 75 | 0.00% | 5.69 | 0 |
| owner_support | 1 | 0 | 0 | 0.00% | 0.00 | 0 |
| property_pages | 1 | 0 | 0 | 0.00% | 0.00 | 2 |
| stay_money | 2 | 0 | 1 | 0.00% | 11.00 | 3 |
| stay_support | 2 | 0 | 60 | 0.00% | 37.88 | 1 |

Do not open a new owner, stay, guide, GEO, or SEO expansion branch from this read.
`docs/status/next-batch.md` should move to `open next batch` only when the analytics receipt says so.

## Likely Priorities

1. rerun the targeted operator read on the five tracked money pages after more recrawl time using the last 7 complete days:
   - `/property-management/vacation-rental-management-fees-florida/`
   - `/property-management/vacation-rental-licensing-florida/`
   - `/property-management/vrbo-management-services-florida/`
   - `/stays/anna-maria-island-vacation-rentals/`
   - `/stays/anna-maria-island-beachfront-rentals/`
2. open `owner-ctr-rewrite-round-2` only if all three owner money pages have a Search Console last crawl date later than the latest owner-page deploy and the joined 7-day read shows:
   - combined owner-money impressions `>= 1000`
   - weighted owner-money CTR `< 0.20%`
   - weighted owner-money average position `<= 10`
   - combined `owner_form_submits = 0`
3. inside that owner batch, treat a page as a snippet problem only when the page-level read shows:
   - impressions `>= 500`
   - average position `<= 10`
   - CTR `< 0.30%`
4. treat an owner page as a page-CRO problem when:
   - GA4 sessions `>= 20`
   - `owner_primary_cta_clicks = 0`
5. treat an owner page as form friction or tracking-gap territory when:
   - `owner_primary_cta_clicks > 0`
   - `owner_form_submits = 0`
6. wait instead of writing if one or more owner money pages still have not recrawled after the latest deploy or the owner cluster has combined impressions `< 1000`
7. reconsider Holmes Beach only if the two AMI stay winners both have fresh crawls after the stay deploy and the joined 7-day read shows:
   - combined stay-money impressions `>= 1000`
   - combined `stay_view_property_clicks >= 1`
8. if the AMI stay winners clear `>= 1000` impressions but still show `stay_view_property_clicks = 0`, open `stay-money-cro-round-2` instead of expansion
9. if any tracked page has GSC impressions `< 100` in the 7-day window, treat that page as too thin to call and do not let it drive the branch choice
10. keep Phase 4 and other entity-expansion work frozen unless the measured gates above move

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

## Do Not Start With

- another site-wide SEO audit
- random new guide volume
- Holmes Beach expansion before the AMI winners prove they can convert better
- another owner-page rewrite before the post-recrawl read exists
- more agent docs or workflow theater beyond the five-role system
