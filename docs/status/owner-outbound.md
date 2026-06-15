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
|  |  |  |  |  |  |  |  |  |  |

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

Current lane state: `not started`.

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
