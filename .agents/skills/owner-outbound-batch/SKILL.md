---
name: owner-outbound-batch
description: Qualify a small, owner-direct and permissioned Seascape owner-intake list from real signals, warm relationships, explicit contact invitations, or direct inbound requests. Use when a founder needs a reviewable intake decision. This skill never sends or creates outreach drafts.
---

# Owner-Direct Permissioned Intake

Use this skill to qualify an owner opportunity before any outreach decision. It
is not a lead scraper, bulk-list builder, email-draft workflow, or send tool.

## Authority

- Owner-direct intake home: `docs/status/owner-direct-outbound.md`
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
5. A named contact channel supplied or invited by the source.
6. No scraped, guessed, purchased, or platform-derived private contact data.

Do not treat a listing host label as verified ownership or permission.

## Workflow

1. Read `docs/status/owner-direct-outbound.md`.
2. Refuse platform-only, generic, or permissionless candidates.
3. Verify the source, identity/representative signal, fit signal, and explicit
   contact permission can be reopened.
4. Add only a factual intake row with status `qualifying`,
   `permissioned`, `owner-requested`, or `closed`.
5. Return a founder decision card: `qualify`, `hold`, or `refuse`.
6. Stop. Do not write an opener, mailbox draft, follow-up, schedule, or send
   instruction.

If Sawyer later explicitly authorizes one named, one-to-one message, use that
separate authorization as the only basis for preparing it. That later step is
still manual and outside this skill's authority.

## Output

Return:

- intake date
- owner or representative label
- source type and reopenable receipt
- exact permission basis
- factual fit signal
- source-supplied contact channel
- `qualify`, `hold`, or `refuse` decision
- any missing evidence

Do not return copy-paste outreach text.

## Stop Conditions

Stop and refuse instead of adding a row when:

- the only path is Airbnb, Vrbo, Booking.com, or another OTA host-message
  surface
- the candidate came from a property listing, directory, property record, or
  social profile without an invitation to contact
- contact data is private, guessed, scraped, purchased, enriched, or not
  reopenable
- the person is a generic property-management target rather than an owner or
  authorized representative
- no explicit contact permission or invitation exists
- the user asks the agent to send, schedule, automate, or create a mailbox
  draft
- the user asks the agent to count a touch, draft, delivery, or test as demand

## Rules

- Never send outreach.
- Never schedule or automate sends or follow-ups.
- Never create a mailbox draft or prospect-facing outreach draft.
- Never harvest, enrich, or export contact data.
- Never create a Hub demand-register row from intake alone.
- Never count an intake row, prepared message, sent message, test send,
  delivery, page view, click, or internal helper submit as owner demand.
- Do not add a new MCP, plugin, scraper, external SEO pack, or dashboard for
  this lane.
- The only real proof gate is a later reply that passes `owner-reply-intake`
  and the Hub register Validation Standard.
