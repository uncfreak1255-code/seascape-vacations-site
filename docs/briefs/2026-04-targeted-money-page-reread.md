# Brief: targeted money-page reread gate

## Why This Batch

- the next move is still a measurement decision, not another writing sprint
- the owner and AMI money pages are the current gates for whether Seascape should rewrite, wait, or expand
- this batch exists to choose the next real build brief with evidence

## Search Operator Read

- targeted GSC reread after more recrawl time
- latest weekly operator report from `seascape-analytics`
- current page-family routing from `docs/portfolio/owner-acquisition.md` and `docs/portfolio/stay-money-pages.md`

## Cluster In Scope

- `/property-management/vacation-rental-management-fees-florida/`
- `/property-management/vacation-rental-licensing-florida/`
- `/property-management/vrbo-management-services-florida/`
- `/stays/anna-maria-island-vacation-rentals/`
- `/stays/anna-maria-island-beachfront-rentals/`

## Decision Rules

- owner rewrite only clears if all three owner money pages have a Search Console last crawl date later than the latest owner-page deploy and the 7-day joined report shows:
  - combined owner-money impressions `>= 1000`
  - weighted owner-money CTR `< 0.20%`
  - weighted owner-money average position `<= 10`
  - combined `owner_form_submits = 0`
- within the owner cluster, page-level snippet rewrites only clear when a page has:
  - impressions `>= 500`
  - average position `<= 10`
  - CTR `< 0.30%`
- treat an owner page as a CRO issue when:
  - GA4 sessions `>= 20`
  - `owner_primary_cta_clicks = 0`
- treat an owner page as form friction or a tracking gap when:
  - `owner_primary_cta_clicks > 0`
  - `owner_form_submits = 0`
- wait if one or more owner pages still have not recrawled after the latest deploy or if the owner cluster has combined impressions `< 1000`
- Holmes Beach only reopens if the AMI stay winners have fresh post-deploy crawls and the 7-day joined report shows:
  - combined stay-money impressions `>= 1000`
  - combined `stay_view_property_clicks >= 1`
- if the AMI stay winners hit `>= 1000` impressions but still show `stay_view_property_clicks = 0`, the next move is `stay-money-cro-round-2`, not stay expansion
- if any tracked page has impressions `< 100` in the 7-day window, treat it as too thin to call and do not let it decide the branch

## Not In Scope

- new guide production
- Holmes Beach build work
- Phase 4 entity expansion
- another site-wide audit
