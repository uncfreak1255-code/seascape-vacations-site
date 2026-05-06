# Next Batch

## Latest Execution Read

Run date: 2026-05-06.

The targeted joined operator read was executed in `seascape-analytics` for the
five tracked money pages plus the existing report context pages.

- Requested last-7-complete-day window: 2026-04-29 to 2026-05-05.
- Latest BigQuery GSC `data_date`: 2026-05-03.
- Site work gate: `blocked` because the GSC export does not cover the requested
  window.
- Report recommendation: `hold-and-reread`.
- Sanity fallback using the latest GSC-covered 7-day window, 2026-04-27 to
  2026-05-03, was `clear` from a data-availability standpoint but still
  recommended `hold-and-reread`.
- Covered-window owner-money result: 342 impressions, 0.29% weighted CTR, 4.35
  weighted position, 0 owner form submits.
- Covered-window stay-money result: 2 impressions and 0 stay-to-property clicks.
- Guide winner variants still appear in GSC, but the report's consolidation
  branch trigger is 5000 guide-variant impressions; the covered window showed
  1748 total guide-winner impressions.

Do not open `owner-ctr-rewrite-round-2`, `stay-money-cro-round-2`, Holmes Beach
expansion, or fresh guide consolidation from this read. Rerun the same joined
report after BigQuery GSC covers the requested last-7-complete-day window.

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

The shared guide conversion kit currently has an inline email capture labeled
`Stay Alerts`, but repo evidence only proves Mailchimp signup plus
`email_capture_submit` tracking. Do not treat it as a real alert product yet.

Keep the idea, but build it deliberately after the current proof-clean,
owner-benchmark, and chart-pack work:

- rename visible copy to a simpler direct-booking list unless the real alert
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
