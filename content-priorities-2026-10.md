# Content Priorities — October 2026

> Status: DRAFT for Sawyer's review. Drafted 2026-10-02.
> Seasonal theme: **off-season month, booking window for the holidays and the
> January to March peak.** October is a low-rate month (`seascape-hub/context/seasonal-patterns.md`).
> Guests who book now are planning Thanksgiving, December holidays, and
> snowbird or spring stays.
> Replaces: `content-priorities-2026-03.md` (seven months old).

## 1. Gate status

Source: `docs/status/next-batch.md`, Latest Execution Read, run 2026-10-02.

- Reread status: `blocked by freshness`.
  BigQuery GSC data stops at 2026-09-29; the requested window ends 2026-09-30.
- Concrete next move: rerun the targeted operator read when BigQuery GSC
  covers 2026-09-30.
- Effect: **no new owner, stay, guide, GEO, or SEO expansion branch** this month
  until the analytics receipt says `open next batch`.
- Allowed while blocked: bounded rescue of a confirmed winner or money-page
  regression (`docs/process/ranking-regression-rescue.md`), fixes, tests,
  readbacks, and drafts.
- Owner cluster is structurally below the 1000-impression gate
  (owner_money: 49 impressions, 0 clicks in the 2026-09-24 to 2026-09-30 read).
  Waiting does not clear it. The owner lever is owner-direct intake
  (next-batch.md, "Owner-Direct Intake Escalation"), not more on-page rewrites.

## 2. Priority pages

### Owner funnel

Measure: owner lead starts and submissions (`owner_form_start`,
`owner_form_submit`, `owner_primary_cta_click`), reported by seascape-analytics.

| Page | Role | Current state |
|---|---|---|
| `/property-management/` | Owner hub | Rebuilt in Waterline (#595, merged 2026-09-18). 30-day readback is due about 2026-10-18. |
| `/property-management/vacation-rental-management-anna-maria-island/` | AMI market page | Still on the old `property-management.njk` lander template. Excluded claims removed (#626, 2026-09-27). |
| `/property-management/vacation-rental-management-bradenton/` | Bradenton market page | Same as AMI. |
| `/property-management/vacation-rental-management-sarasota/` | Sarasota market page | Same as AMI. |

Market list source: `seascape-hub/projects/q2-2026-growth-batch-plan.md`
("the three priority local owner pages": Bradenton, Anna Maria Island, Sarasota).

### Guest funnel

Measure: guide-to-stay clicks (`guide_stay_click`), book-direct CTA clicks
(`guide_book_direct_click`), and email submissions (`email_capture_submit`).

Use the repo winner list (`docs/portfolio/winner-guides.md`) for October:

1. `/guides/bradenton-vs-sarasota/`
2. `/guides/anna-maria-island-vs-siesta-key/`
3. `/guides/best-time-visit-anna-maria-island/`
4. `/guides/family-vacation-anna-maria-island/`
5. `/guides/shelling-guide-florida/`

Why: the hub list (`seascape-hub/projects/q2-2026-growth-batch-plan.md`) is
marked "terminal status; historical record, not a live claim" and dates from
March 2026. It named `/guides/booking-direct-vacation-rentals/` and
`/guides/anna-maria-island-vacation-cost/` instead of family and shelling.
The repo list is the one the current portfolio and tests use. A hub update to
match is a separate seascape-hub change, not part of this file.

Stay money destinations (`docs/portfolio/stay-money-pages.md`):
`/stays/anna-maria-island-vacation-rentals/`,
`/stays/anna-maria-island-beachfront-rentals/`,
`/stays/bradenton-vacation-rentals-near-beaches/`,
`/stays/siesta-key-area-vacation-rentals/`.

## 3. October work queue

Ranked. "Go-ahead" means the item changes a live page and waits for Sawyer.

| # | Item | Type | Starts without asking? | Source |
|---|---|---|---|---|
| 1 | Rerun the targeted operator read when GSC covers 2026-09-30, then sync `next-batch.md` from the receipt. | Measurement (seascape-analytics) | Yes | next-batch.md |
| 2 | Qualify one owner-direct, permissioned signal under `docs/status/owner-direct-intake-policy.md`. No OTA host messages. No named candidate state in this repo. Any message needs Sawyer's separate approval. | Owner intake | Qualification only | next-batch.md, Owner-Direct Intake Escalation |
| 3 | Read back the owner hub rebuild (#595) at 30 days: `owner_primary_cta_click` and `owner_form_submit` on `/property-management/`. | Readback | Yes | 2026-09-owner-page-waterline-rebuild.md |
| 4 | Read back the September 27 releases at their windows: snowbird refresh (#627, 14 days, about 2026-10-11); booking box on weather, airport, shelling guides (#628, 28 days, about 2026-10-25); homepage leave-the-page signup (#631, 28 days, about 2026-10-25). Keep or remove each by its brief's decision rule. | Readback | Yes | the three 2026-09-26/27 briefs |
| 5 | Compare the no-slash and slash rows of `/guides/anna-maria-island-vs-siesta-key/` on the next complete window before any consolidation change. | Readback | Yes | next-batch.md, Bounded Attack Check 2026-10-02 |
| 6 | Watch for a confirmed regression on a winner guide or stay money page. If the rank tracker, `queries/rank_history_deltas.sql`, or a live SERP read confirms one, open a bounded rescue brief. | Rescue (if triggered) | Yes, bounded | ranking-regression-rescue.md |
| 7 | Holiday stay check: confirm the Thanksgiving and Christmas redirects to `/stays/anna-maria-island-vacation-rentals/` still resolve, and that the page copy has no stale holiday or date claim before the holiday booking window. Fix only a broken redirect or a false claim. | Fix (if found) | Fix yes; copy change needs go-ahead | stay-money-pages.md |
| 8 | Rebuild the three priority owner market pages (AMI, Bradenton, Sarasota) in Waterline, from the owner hub pattern. Show as 2 or 3 variants. | Design / owner copy | **Not in October.** next-batch.md "Do Not Start With" blocks another owner-page rewrite before the post-recrawl read exists, and owner pages had 49 impressions in the last read. Reconsider after item 3 and after an owner-direct signal. | 2026-09-owner-page-waterline-rebuild.md ("Waits: the 26 city landers") |

## 4. Do not start this month

From `docs/status/next-batch.md`:

- a new site-wide SEO audit
- new guide volume
- Holmes Beach expansion before the AMI stay winners convert better
- another owner-page rewrite before the post-recrawl read exists
- Phase 4 or other entity expansion
- more agent docs or workflow layers

Also: no keyword volume or KD figures in this file until a fresh, paid-approved
DataForSEO or OpenSEO read supplies them. The March file's volumes are not
carried forward.

## 5. Before this file merges

A machine-local `content-priorities-2026-10.md` dated 2026-09-01 may exist on
the local checkout (the snowbird brief cites it, and
`docs/plans/2026-06-12-repo-audit.md` says live priority files were kept
untracked). If `git pull` on root `main` stops on this file, rename the local
copy (for example to `content-priorities-2026-10.local.md`) and pull again.
Nothing is lost.

## Notes for content tasks

- Every live-page change needs one active brief, the content gate, and
  `npm run lint:content`.
- Owner and guest copy never names the software stack or vendors.
- Owner claims trace to `seascape-hub/context/owner-offer.md` (stale-after
  2026-12-17) and `src/_data/ownerProofAssets.json`.
- Pricing questions go to Patrick.
