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

Run date: 2026-08-11.

The targeted joined operator read was executed in `seascape-analytics` and
rendered here from its machine-readable next-batch decision receipt.

- Requested last-7-complete-day window: 2026-08-03 to 2026-08-09.
- Latest BigQuery GSC `data_date`: 2026-08-09.
- Site work gate: `clear` - joined GSC + GA4 read covers the requested window.
- Reread status: `fresh but below threshold`.
- Concrete next move: owner cluster cannot clear by waiting - qualify one owner-direct, permissioned signal (see the Owner-Direct Intake Escalation section in seascape-vacations-site/docs/status/next-batch.md and seascape-vacations-site/docs/status/owner-direct-intake-policy.md). Do not use Airbnb or Vrbo host messaging; qualification is not a lead, named candidate state does not belong in the public site repo, and any one-to-one message still requires Sawyer's separate approval.
- Report recommendation: `hold-and-reread`.
- Reason: No cluster cleared the bar for a stronger next branch than holding for more readback.

Cluster read from the analytics receipt:

| cluster | pages | gsc_clicks | gsc_impressions | gsc_ctr | gsc_position | ga4_sessions |
|---|---:|---:|---:|---:|---:|---:|
| brand | 1 | 3 | 175 | 1.71% | 8.98 | 95 |
| catalog | 1 | 0 | 15 | 0.00% | 13.53 | 34 |
| guide_support | 1 | 0 | 362 | 0.00% | 5.86 | 0 |
| guide_winners | 4 | 44 | 4362 | 1.01% | 4.14 | 82 |
| owner_hub | 1 | 0 | 21 | 0.00% | 10.43 | 12 |
| owner_money | 4 | 0 | 58 | 0.00% | 18.10 | 2 |
| owner_support | 1 | 1 | 9 | 11.11% | 15.00 | 1 |
| property_pages | 1 | 0 | 0 | 0.00% | 0.00 | 4 |
| stay_money | 2 | 0 | 57 | 0.00% | 57.49 | 9 |
| stay_support | 2 | 0 | 160 | 0.00% | 64.59 | 1 |

SEO queue read from the analytics receipt:

| queue_bucket | pages | gsc_clicks | gsc_impressions | ga4_sessions |
|---|---:|---:|---:|---:|
| too thin to call | 11 | 1 | 160 | 62 |
| wait | 7 | 47 | 5059 | 178 |

SERP evidence from the analytics receipt:

- Evidence status: `unavailable`.
- Mode: `standard_queue`.
- Task count: 21.
- Error kind: `auth_missing`.

| query | page_path | seascape_rank | classification_support | top_visible_competitors | serp_features |
|---|---|---|---|---|---|
| Anna Maria Island vacation rentals | /stays/anna-maria-island-vacation-rentals/ | unavailable | unavailable | unavailable | unavailable |
| vacation rentals near Anna Maria Island | /stays/vacation-rentals-near-anna-maria-island/ | unavailable | unavailable | unavailable | unavailable |
| Seascape Vacations Bradenton Sarasota vacation rentals | / | unavailable | unavailable | unavailable | unavailable |
| vacation rental property management | /property-management/ | unavailable | unavailable | unavailable | unavailable |
| vacation rental management fees Florida | /property-management/vacation-rental-management-fees-florida/ | unavailable | unavailable | unavailable | unavailable |
| Bradenton vs Sarasota vacation | /guides/bradenton-vs-sarasota/ | unavailable | unavailable | unavailable | unavailable |
| Sarasota airport to Anna Maria Island | /guides/srq-airport-to-anna-maria-island/ | unavailable | unavailable | unavailable | unavailable |
| Sarasota to Anna Maria Island | /guides/srq-airport-to-anna-maria-island/ | unavailable | unavailable | unavailable | unavailable |
| Anna Maria Island vs Siesta Key | /guides/anna-maria-island-vs-siesta-key/ | unavailable | unavailable | unavailable | unavailable |
| Siesta Key vs Anna Maria Island for families | /guides/siesta-key-vs-anna-maria-island-families/ | unavailable | unavailable | unavailable | unavailable |
| best time to visit Anna Maria Island | /guides/best-time-visit-anna-maria-island/ | unavailable | unavailable | unavailable | unavailable |
| Florida Gulf Coast vacation rental market report | /guides/florida-gulf-coast-vacation-rental-market-report-2026/ | unavailable | unavailable | unavailable | unavailable |
| Bradenton vs Sarasota for families | /guides/bradenton-vs-sarasota-for-families/ | unavailable | unavailable | unavailable | unavailable |
| best vacation rental companies Anna Maria Island | /guides/best-vacation-rental-companies-ami/ | unavailable | unavailable | unavailable | unavailable |
| Anna Maria vacation rental companies | /guides/best-vacation-rental-companies-ami/ | unavailable | unavailable | unavailable | unavailable |
| luxury vacation rentals Sarasota | /stays/luxury-vacation-rentals-sarasota/ | unavailable | unavailable | unavailable | unavailable |
| vacation rental management Bradenton | /property-management/vacation-rental-management-bradenton/ | unavailable | unavailable | unavailable | unavailable |
| vacation rental management Sarasota | /property-management/vacation-rental-management-sarasota/ | unavailable | unavailable | unavailable | unavailable |
| Anna Maria Island property management | /property-management/vacation-rental-management-anna-maria-island/ | unavailable | unavailable | unavailable | unavailable |
| bradenton vacation rentals near beaches | /stays/bradenton-vacation-rentals-near-beaches/ | unavailable | unavailable | unavailable | unavailable |
| sarasota vacation rentals with pool | /stays/sarasota-vacation-rentals-with-pool/ | unavailable | unavailable | unavailable | unavailable |

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
