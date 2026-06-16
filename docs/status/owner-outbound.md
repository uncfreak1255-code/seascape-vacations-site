# Owner Outbound

Status: Card 3 execution home, no sends authorized by this file alone.
Source plan: `docs/plans/2026-06-13-demand-os-handoff.md`.
Owner lane: site runbook and send log here; owner-demand proof and registers stay in `seascape-hub`.

## Purpose

This file gives the owner-outbound lane a real home without pretending that
activity is demand. It exists because the owner-money search cluster is below
the on-page gate and cannot clear by waiting for another reread. When
`docs/status/next-batch.md` points here, the next useful action is owner
outreach preparation, not another owner-page rewrite.

The business goal is still real owner conversations and completed revenue
teardowns. A sent message is only a measurement event.

## Scope

This runbook owns:

- the owner-outbound preparation checklist
- the empty send log
- the proof gates for SENT, REAL reply, and completed teardown
- the homeowner-list milestone
- the decay rule that prevents another silent March-style stall

This runbook does not own:

- sending outreach
- changing the owner-demand register in `seascape-hub`
- editing analytics receipt logic
- adding skills, MCPs, dashboards, or runtime workers
- marking a test, labeled send, or internal submit as owner demand

## Weekly Batch Shape

Do this only after the homeowner-list milestone below has at least one
contactable prospect.

1. Pick one named homeowner prospect.
2. Pick one owner pain hypothesis from public evidence or a prior qualified
   exchange.
3. Use one approved proof module from the current owner benchmark or other
   approved owner-proof surface.
4. Draft one personal opener that points to the benchmark and offers a short
   revenue teardown.
5. Record the row in the send log before any send happens.
6. After the send, update only the `Sent at` and `Outcome` fields.

Do not batch generic property managers. The Demand OS plan rejected that lane
because the old operator outreach list was for competing managers, not
homeowners.

## Homeowner-List Milestone

The outbound lane does not start its time-to-first-lead clock until this
milestone clears.

Acceptance check:

- at least `10` named homeowner-reachable prospects
- each row has a contact path that another agent can re-open
- each row names why the prospect plausibly fits the benchmark-to-teardown offer
- no scraped or guessed private contact data
- no send scheduled from research alone

Allowed research sources:

- owner-direct Airbnb or VRBO listings with public host/contact surfaces
- FSBO, landlord, or public property-owner signals where outreach is allowed
- local owner/referral signals from public business or community surfaces
- existing Seascape owner-demand context from `seascape-hub`

Tool decision:

- start with browser/search and manual source receipts
- use DataForSEO only if the source already exists in repo workflows and the
  output helps produce named homeowner-reachable prospects
- do not add a new MCP, plugin, scraper, or external SEO pack without the
  `agent-surface-audit` gate named in `docs/process/skill-policy.md`

### Batch 2026-06-16: Card 3 Homeowner Prospect Batch

Milestone result: `cleared for founder review`.

This is a draft-only research batch. It uses public Airbnb and Vrbo listing
pages, public host labels, and reopenable platform contact surfaces only. No
private phone numbers, emails, property records, skip-tracing, scraped contact
data, or Hub register rows were used. No send is authorized by this file.

Founder review board:
[Card 3 homeowner prospect evidence board](../reports/card-3-owner-prospect-board-2026-06-16.html).

Approved proof module for every row:
`gulf-coast-owner-benchmark-2026` from `src/_data/ownerProofAssets.json`.
Use the benchmark as a decision aid only: 5-property Gulf Coast scope, observed
Airbnb host-fee cost, direct payment cost, and labeled property examples. Do
not claim Seascape can raise revenue for any specific home.

Benchmark CTA for every row:
`/research/owner-fee-revenue-leak-benchmark-2026/` -> shared revenue review
intake at `/property-management/?owner_source=owner-fee-revenue-leak-benchmark-2026#owner-cta`.

Founder send check before any outreach:

- confirm the platform contact path is appropriate for the message
- keep the note personal and one-to-one
- do not imply the owner is losing money or unhappy with the current setup
- do not count a send as demand
- prepare the send-log row before sending

| # | Prospect label | Public evidence | Reopenable contact path | Fit reason and pain hypothesis | Proof-rule result |
|---:|---|---|---|---|---|
| 1 | Kiri | Airbnb listing: [Beautiful Canal front house with heated pool & spa](https://www.airbnb.com/rooms/1477087787726582138). Public page shows an Anna Maria entire home for 12 guests, 6 bedrooms, 6.5 baths, hosted by Kiri. | Airbnb listing -> public host surface -> Message host after platform sign-in. No copied contact detail. | Premium canal-front, pool-and-spa home with enough booking value for fee percentage, Airbnb cost, direct booking cost, and owner statement clarity to matter. Pain hypothesis: first-year or new-listing revenue review. | Pass: named public host label, reopenable source, homeowner-reachable path, one approved proof module, no private data. |
| 2 | Megan | Airbnb listing: [Gorgeous 4BR w/Htd Pool, Walk 2 Beach, Boat Dock](https://www.airbnb.com/rooms/1339940979581613196). Public page shows a Bradenton Beach entire home for 10 guests, 4 bedrooms, 3 baths, hosted by Megan. | Airbnb listing -> public host surface -> Message host after platform sign-in. No copied contact detail. | High-performing dock-and-pool beach home. Pain hypothesis: mature host may still benefit from a second look at what Airbnb-heavy bookings cost versus lower-cost direct demand. | Pass: named public host label, reopenable source, homeowner-reachable path, one approved proof module, no private data. |
| 3 | Ashley | Airbnb listing: [New! 4BR Villa + Crosswalk to Sand + Beach View](https://www.airbnb.com/rooms/1517691281023647588). Public page shows a Bradenton Beach entire home for 10 guests, 4 bedrooms, 3 baths, hosted by Ashley. | Airbnb listing -> public host surface -> Message host after platform sign-in. No copied contact detail. | Newer beachside villa with pool, balconies, and Bridge Street proximity. Pain hypothesis: early operating period is a good time to compare owner payout, booking-source cost, and reporting before the pattern hardens. | Pass: named public host label, reopenable source, homeowner-reachable path, one approved proof module, no private data. |
| 4 | Wendy | Airbnb listing: [Prime Holmes Beach Location, Pool, Walk to Beach](https://www.airbnb.com/rooms/1025371189528255498). Public page shows a Holmes Beach entire home for 8 guests, 4 bedrooms, 3.5 baths, hosted by Wendy. | Airbnb listing -> public host surface -> Message host after platform sign-in. No copied contact detail. | Walkable Holmes Beach pool home with fast public host response signals. Pain hypothesis: owner may value a clean comparison of what reaches the owner statement after platform costs and direct-payment options. | Pass: named public host label, reopenable source, homeowner-reachable path, one approved proof module, no private data. |
| 5 | Adam | Airbnb listing: [Spectacular Beach/Bay views private pool elevator](https://www.airbnb.com/rooms/41800150). Public page shows a Bradenton Beach entire home for 10 guests, 4 bedrooms, 3.5 baths, hosted by Adam. | Airbnb listing -> public host surface -> Message host after platform sign-in. No copied contact detail. | Mature premium listing with beach/bay views, pool, elevator, and many public reviews. Pain hypothesis: high-volume homes can have meaningful owner-statement movement from booking-source cost and direct-booking share. | Pass: named public host label, reopenable source, homeowner-reachable path, one approved proof module, no private data. |
| 6 | Kate | Airbnb listing: [Heated Pool, 4BR with 2 King Suites, Near AMI & IMG](https://www.airbnb.com/rooms/1280439468418163165). Public page shows a private Bradenton home with 4 bedrooms, 4 baths, heated pool, and public host details for Kate. | Airbnb listing -> public host surface -> Message host after platform sign-in. No copied contact detail. | Large pool home near AMI and IMG with family/group fit. Pain hypothesis: mainland-near-island homes can be busy but still need a net-payout read on direct demand versus Airbnb cost. | Pass: named public host label, reopenable source, homeowner-reachable path, one approved proof module, no private data. |
| 7 | Naomi Ewald | Vrbo listing: [Playa Palma Private Pool Home 4 Minute Walk to Holmes Beach on AMI](https://www.vrbo.com/4425699). Public page says hosted by Naomi Ewald and notes Bill and Naomi bought the property and added the pool. | Vrbo listing -> public host section -> sign in/contact host surface. No copied contact detail. | Clear owner-operated signal, Holmes Beach pool home, and explicit ownership context on the public listing. Pain hypothesis: owner-operator may want a second set of eyes on owner statement clarity and direct-payment economics. | Pass: named public host label, reopenable source, homeowner-reachable path, one approved proof module, no private data. |
| 8 | Teresa | Airbnb listing: [3 Minute Walk to Beach, Heated Pool, Spa, FirePit, BBQ](https://www.airbnb.com/rooms/1502928363519390450). Public page shows a Bradenton Beach entire home for 9 guests, 4 bedrooms, 2 baths, hosted by Teresa. | Airbnb listing -> public host surface -> Message host after platform sign-in. No copied contact detail. | Newer public hosting signal on a strong beach-walk pool/spa home. Pain hypothesis: early revenue patterns are easier to review before pricing, platform dependence, and reporting habits settle. | Pass: named public host label, reopenable source, homeowner-reachable path, one approved proof module, no private data. |
| 9 | Morgan | Airbnb listing: [House with Private Pool & Hot Tub - Bridge Street](https://www.airbnb.com/rooms/1384108265624016866). Public page shows a Bradenton Beach entire home for 10 guests, 4 bedrooms, 3.5 baths, hosted by Morgan. | Airbnb listing -> public host surface -> Message host after platform sign-in. No copied contact detail. | Elevated home steps from the beach and Bridge Street, with pool and hot tub. Pain hypothesis: premium amenity homes are a fit for comparing headline fee, Airbnb booking cost, and direct-payment cost. | Pass: named public host label, reopenable source, homeowner-reachable path, one approved proof module, no private data. |
| 10 | Christy | Airbnb listing: [New Golf cart + 4bd/3b w pool/2100 sq ft home](https://www.airbnb.com/rooms/28602630). Public page shows a Holmes Beach 4-bedroom, 3-bath pool home hosted by Christy, with Matt listed as co-host. | Airbnb listing -> public host surface -> Message host after platform sign-in. No copied contact detail. | Mature Holmes Beach host with out-of-area public host signal and a larger pool home. Pain hypothesis: owner may value clearer reporting on booking-source costs, direct demand, and local operating follow-through. | Pass: named public host label, reopenable source, homeowner-reachable path, one approved proof module, no private data. |

## Proof Gates

### Gate 1: SENT

SENT means an outbound touch went to a named prospect.

It proves only that the lane was executed. It does not prove owner demand, does
not move the owner gate, and does not update any demand claim.

Never count these as demand:

- test sends
- labeled sends
- internal helper submits
- generic `SENT` rows
- page views or clicks without an owner signal

### Gate 2: REAL Reply

A reply can become owner-demand evidence only when it meets the validation
standard in `seascape-hub/projects/owner-demand-trust-outcome-register.md`.

Minimum bar:

- dated interaction or receipt window
- source page, asset, or outbound touch named explicitly
- `REAL` status called out plainly
- owner pain or objection summarized from the owner signal
- next action or explicit stop
- evidence path another agent can re-open

Email-origin demand is provisional until a repo-anchored receipt or source note
exists. Do not paste private email content into this file.

### Gate 3: Teardown Completed

A completed teardown is the first strong proof that the outbound lane produced
real owner demand.

Completion proof needs:

- the real owner signal from Gate 2
- the teardown date or delivery window
- what the owner wanted to understand
- whether the teardown advanced, stalled, lost, or ended the conversation
- the evidence path in the owning repo

Only this level of proof can flip the hub claim
`CLM-OWNER-BENCHMARK-DEMAND-PROVEN` or support a later claim that the owner
benchmark or teardown wedge is producing demand.

## Send Log

Keep this table honest. Empty is better than fake progress.

| Date prepared | Prospect | Contact path | Fit reason | Proof module | Draft path | Sent at | Reply status | Outcome | Evidence path |
|---:|---|---|---|---|---|---|---|---|---|
| 2026-06-16 | Kiri | Airbnb host message surface; no copied contact detail | 6BR canal-front Anna Maria pool/spa home; first-year or newer-listing revenue review angle | `gulf-coast-owner-benchmark-2026` | [draft](#draft-1-kiri) |  | not sent | draft only; founder review needed | [Airbnb](https://www.airbnb.com/rooms/1477087787726582138) |
| 2026-06-16 | Megan | Airbnb host message surface; no copied contact detail | 4BR Bradenton Beach pool/dock home; mature host owner-statement review angle | `gulf-coast-owner-benchmark-2026` | [draft](#draft-2-megan) |  | not sent | draft only; founder review needed | [Airbnb](https://www.airbnb.com/rooms/1339940979581613196) |
| 2026-06-16 | Ashley | Airbnb host message surface; no copied contact detail | 4BR beachside villa near Bridge Street; early-pattern revenue review angle | `gulf-coast-owner-benchmark-2026` | [draft](#draft-3-ashley) |  | not sent | draft only; founder review needed | [Airbnb](https://www.airbnb.com/rooms/1517691281023647588) |
| 2026-06-16 | Wendy | Airbnb host message surface; no copied contact detail | 4BR Holmes Beach pool home; owner-statement clarity angle | `gulf-coast-owner-benchmark-2026` | [draft](#draft-4-wendy) |  | not sent | draft only; founder review needed | [Airbnb](https://www.airbnb.com/rooms/1025371189528255498) |
| 2026-06-16 | Adam | Airbnb host message surface; no copied contact detail | 4BR beach/bay view home with pool/elevator; high-volume booking-source review angle | `gulf-coast-owner-benchmark-2026` | [draft](#draft-5-adam) |  | not sent | draft only; founder review needed | [Airbnb](https://www.airbnb.com/rooms/41800150) |
| 2026-06-16 | Kate | Airbnb host message surface; no copied contact detail | 4BR heated-pool home near AMI/IMG; mainland-near-island net-payout review angle | `gulf-coast-owner-benchmark-2026` | [draft](#draft-6-kate) |  | not sent | draft only; founder review needed | [Airbnb](https://www.airbnb.com/rooms/1280439468418163165) |
| 2026-06-16 | Naomi Ewald | Vrbo host contact surface; no copied contact detail | Owner-operated Holmes Beach pool home; owner-statement and direct-payment review angle | `gulf-coast-owner-benchmark-2026` | [draft](#draft-7-naomi-ewald) |  | not sent | draft only; founder review needed | [Vrbo](https://www.vrbo.com/4425699) |
| 2026-06-16 | Teresa | Airbnb host message surface; no copied contact detail | 4BR beach-walk pool/spa home; early hosting-cycle revenue review angle | `gulf-coast-owner-benchmark-2026` | [draft](#draft-8-teresa) |  | not sent | draft only; founder review needed | [Airbnb](https://www.airbnb.com/rooms/1502928363519390450) |
| 2026-06-16 | Morgan | Airbnb host message surface; no copied contact detail | 4BR Bridge Street pool/hot-tub home; premium amenity net-payout review angle | `gulf-coast-owner-benchmark-2026` | [draft](#draft-9-morgan) |  | not sent | draft only; founder review needed | [Airbnb](https://www.airbnb.com/rooms/1384108265624016866) |
| 2026-06-16 | Christy | Airbnb host message surface; no copied contact detail | 4BR Holmes Beach pool home; out-of-area owner/reporting clarity angle | `gulf-coast-owner-benchmark-2026` | [draft](#draft-10-christy) |  | not sent | draft only; founder review needed | [Airbnb](https://www.airbnb.com/rooms/28602630) |

## Draft Messages

These are copy-paste opener drafts for founder review. Each message points to
the owner benchmark and offers a short revenue review. They deliberately avoid
claiming that the owner is losing money, unhappy, or ready to switch managers.

### Draft 1: Kiri

Hi Kiri - I came across your 6-bedroom canal-front Anna Maria listing with the
pool and spa. It looks like the kind of premium home where the management
percentage alone would not explain what reaches the owner statement.

I run Seascape Vacations, and we built a small Gulf Coast owner benchmark that
compares Airbnb host-fee cost with lower-cost direct payment. If useful, I can
do a short revenue review on your listing and point out what is clear, what is
worth a second look, and what I would ask before renewing any management setup.

Benchmark:
https://seascape-vacations.com/research/owner-fee-revenue-leak-benchmark-2026/

### Draft 2: Megan

Hi Megan - your Bradenton Beach home caught my eye because it has the bigger
owner-economics pieces in one place: walk-to-beach appeal, a heated pool, and a
boat dock.

I am Sawyer with Seascape Vacations. We have a Gulf Coast owner benchmark that
looks beyond the headline management fee and compares what Airbnb-heavy bookings
cost against lower-cost direct payment. I can send back a short revenue review
on your listing if you want a second set of eyes before the next renewal or
pricing reset.

Benchmark:
https://seascape-vacations.com/research/owner-fee-revenue-leak-benchmark-2026/

### Draft 3: Ashley

Hi Ashley - I saw Starfish Villa East, especially the crosswalk-to-sand location,
pool, balconies, and Bridge Street proximity. Since it looks newer, this may be
a good time to check the payout story before the first strong pattern hardens.

I run Seascape Vacations nearby. We built a small Gulf Coast owner benchmark
that compares Airbnb host-fee cost with lower-cost direct payment, then turns
that into a property-specific revenue review. I can do the same short scan on
your listing if that would be useful.

Benchmark:
https://seascape-vacations.com/research/owner-fee-revenue-leak-benchmark-2026/

### Draft 4: Wendy

Hi Wendy - your Holmes Beach pool home looks like a strong fit for families who
want to park once and walk to the beach, restaurants, and shops.

I am Sawyer from Seascape Vacations. We put together a Gulf Coast owner
benchmark because a management percentage by itself misses the booking costs
and direct-payment upside that show up later on the owner statement. If you want
it, I can send back a short revenue review on your listing with the obvious
questions I would ask before renewing or changing anything.

Benchmark:
https://seascape-vacations.com/research/owner-fee-revenue-leak-benchmark-2026/

### Draft 5: Adam

Hi Adam - your Bradenton Beach place has the kind of premium setup where small
differences can matter: beach and bay views, private pool, elevator, and a deep
review history.

I run Seascape Vacations. We built a five-home Gulf Coast owner benchmark that
looks at what actually reaches the owner statement after Airbnb host-fee cost,
direct payment cost, and reporting clarity. I can do a short revenue review on
your listing if a second set of eyes would be useful.

Benchmark:
https://seascape-vacations.com/research/owner-fee-revenue-leak-benchmark-2026/

### Draft 6: Kate

Hi Kate - I saw your heated-pool Bradenton home near AMI and IMG. Four bedrooms,
two king suites, and the family/group setup make it the kind of property where
booking-source costs can quietly change the owner result.

I am Sawyer with Seascape Vacations. We built a small Gulf Coast owner benchmark
that compares Airbnb host-fee cost with lower-cost direct payment and turns that
into a short revenue review. I can run that same review on your listing and send
back what looks clear, what deserves a closer look, and what I would ask before
renewal.

Benchmark:
https://seascape-vacations.com/research/owner-fee-revenue-leak-benchmark-2026/

### Draft 7: Naomi Ewald

Hi Naomi - I found the Playa Palma listing and noticed the owner story about you
and Bill buying the property and adding the pool. That is exactly the kind of
hands-on ownership where the owner statement should be easy to understand.

I run Seascape Vacations. We built a Gulf Coast owner benchmark that compares
Airbnb host-fee cost with lower-cost direct payment, then uses that as the
starting point for a short property-specific revenue review. If useful, I can
look at Playa Palma and send back the questions I would ask before making any
management or pricing decision.

Benchmark:
https://seascape-vacations.com/research/owner-fee-revenue-leak-benchmark-2026/

### Draft 8: Teresa

Hi Teresa - your Bradenton Beach listing looks like a strong early-cycle home:
short walk to the beach, heated pool, spa, firepit, and enough guest capacity
for family weeks.

I am Sawyer from Seascape Vacations. We have a small Gulf Coast owner benchmark
that helps compare headline fee, Airbnb host-fee cost, and direct-payment cost
before those numbers get blurred in the owner statement. I can do a short
revenue review on your listing if you want a clean second read while the hosting
pattern is still fresh.

Benchmark:
https://seascape-vacations.com/research/owner-fee-revenue-leak-benchmark-2026/

### Draft 9: Morgan

Hi Morgan - I came across Bimini Breeze near Bridge Street. The elevated layout,
pool, hot tub, and beach proximity make it a good fit for a net-payout review,
not just a management-fee comparison.

I run Seascape Vacations. We built a Gulf Coast owner benchmark that compares
Airbnb host-fee cost with lower-cost direct payment, then uses that benchmark to
frame a short property-specific revenue review. I can send one back for your
listing if that would be useful before the next pricing or renewal decision.

Benchmark:
https://seascape-vacations.com/research/owner-fee-revenue-leak-benchmark-2026/

### Draft 10: Christy

Hi Christy - I saw your Holmes Beach pool home with the golf cart and larger
4-bedroom setup. Since you are managing a high-demand island home from outside
the immediate market, clear owner reporting and local operating follow-through
probably matter as much as the headline fee.

I am Sawyer with Seascape Vacations. We built a small Gulf Coast owner benchmark
that compares Airbnb host-fee cost with lower-cost direct payment and turns that
into a short revenue review. I can run that review on your listing and send back
what I would check before renewing, changing pricing, or shifting more demand
direct.

Benchmark:
https://seascape-vacations.com/research/owner-fee-revenue-leak-benchmark-2026/

## Effect Rule

After two batches that actually went out and got zero real replies, change the
list, offer, or opener before sending another batch.

If zero sends happened, do not call that channel failure. That is a discipline
or execution failure.

## Kill And Decay Rule

At the end of each week, set the lane state:

- `not started`: no homeowner-list milestone yet
- `ready`: list milestone cleared, no sends yet
- `sent-no-reply`: at least one real send, no real reply
- `reply-qualified`: real reply meets Gate 2
- `teardown-complete`: Gate 3 reached
- `decayed`: no real send or update for `3` consecutive weeks after the list is ready

If the lane reaches `decayed`, stop preserving it as a live motion. Write the
reason in `Outcome`, then either change the list/offer or close the outbound
lane. Do not let it sit silently as strategy.

Current lane state: `ready`.

State note: the 2026-06-16 Card 3 prospect batch clears the site-side
homeowner-list milestone for founder review. It does not authorize a send, count
as demand, or create a Hub register row.

## Owner-Truth Preflight

Before linking any prospect to a public page, verify the linked page is still
fact-clean:

- `src/_data/ownerProofAssets.json` has the proof claim being used
- `/research/owner-fee-revenue-leak-benchmark-2026/` is the benchmark path
- no owner proof claim relies on test receipts, labeled sends, or internal
  helper traffic
- any visible claim still passes the owner-proof and content gates before reuse

## Register Boundary

If Gate 2 or Gate 3 fires, route the durable demand proof to
`/Users/sawbeck/Projects/seascape-hub/projects/owner-demand-trust-outcome-register.md`
through a clean Seascape Hub branch or PR.

Do not edit the generated `owner-receipt-projection` block by hand. The
hand-authored `## Register` section is the only durable destination for
qualified owner-demand rows.
