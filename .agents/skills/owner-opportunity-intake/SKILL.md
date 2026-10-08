---
name: owner-opportunity-intake
description: Use when qualifying a Seascape owner opportunity from a permissioned real signal.
---

# Owner-Direct Permissioned Intake

This skill never sends. Qualify an owner opportunity, and prepare a template
and recipient list for Sawyer's batch approval. Drafts exist only inside an
approved batch (policy version 2, 2026-10-07).

## Authority

- Public qualification policy: `docs/status/owner-direct-intake-policy.md`
- Archived platform research: `docs/status/owner-outbound.md`
- Approved owner proof assets: `src/_data/ownerProofAssets.json`
- Owner benchmark CTA: `/research/owner-fee-revenue-leak-benchmark-2026/`
- Demand register standard:
  `/Users/sawbeck/Projects/seascape-hub/projects/owner-demand-trust-outcome-register.md`

## Required Inputs

1. A named owner or authorized owner representative.
2. An owner-direct, reopenable source receipt.
3. A clear invitation or permission to make relevant business contact.
4. A factual property or operating fit signal.
5. A contact channel that the policy allows for that source type. A public
   county property record allows a postal letter to the owner mailing address
   only.
6. No scraped, guessed, purchased, or platform-derived private contact data.

Do not treat a listing host label as verified ownership or permission.

Read `docs/status/owner-direct-intake-policy.md` and verify the required evidence
is reopenable before returning `qualify`, `hold`, or `refuse`. Qualified
records go into a recipient list. Sawyer approves one template and one list per
batch; that approval covers each message in the batch. Sawyer sends.

## Output

Return for the current founder review only:

- intake date
- owner or representative label
- source type and reopenable receipt
- exact permission basis
- factual fit signal
- allowed contact channel
- `qualify`, `hold`, or `refuse` decision
- any missing evidence

Before batch approval, return a template draft only, with no recipient details
in it. After batch approval, personalized drafts may go into Sawyer's own
business mailbox or the approved private owner system.

Durable records go only into the approved private owner system (business
Google Drive "Owner Intelligence" folder and tracker Sheet). Contact details
never belong in Git.

## Stop Conditions

Stop and refuse instead of adding a row when:

- the only path is Airbnb, Vrbo, Booking.com, or another OTA host-message
  surface
- the candidate came from a property listing, directory, property record, or
  social profile without an invitation to contact, and the planned channel is
  not a postal letter to the owner mailing address on a public property record
- contact data is private, guessed, scraped, purchased, enriched, or not
  reopenable
- the person is a generic property-management target rather than an owner or
  authorized representative
- no explicit contact permission or invitation exists
- the user asks to persist named candidate or contact evidence in this public
  repository
- the user asks the agent to send, schedule, or automate a message, or to
  create a mailbox draft outside an approved batch
- the user asks the agent to count a touch, draft, delivery, or test as demand

## Rules

- Never send outreach.
- Never schedule or automate sends or follow-ups.
- Never create a mailbox draft or personalized outreach draft outside a batch
  that Sawyer approved.
- Never harvest, enrich, or export contact data. Never build an email, phone,
  or text contact from a property record.
- Never name software or vendors, or make revenue, occupancy, savings,
  review-count, fixed-fee, or guarantee claims in owner-facing text.
- Never persist a named candidate, permission receipt, fit note, or contact
  channel in this public repository.
- Never create a Hub demand-register row from qualification alone.
- Never count a qualification decision, prepared message, sent message, test send,
  delivery, page view, click, or internal helper submit as owner demand.
- Do not add a new MCP, plugin, scraper, external SEO pack, or dashboard for
  this lane.
- The only real proof gate is a later reply that passes `owner-reply-intake`
  and the Hub register Validation Standard.
