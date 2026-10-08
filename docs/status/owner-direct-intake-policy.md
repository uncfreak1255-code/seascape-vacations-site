# Owner-Direct Intake Policy

Status: **public policy only - no candidate records - batch approval required**.

Version 2, approved by Sawyer on 2026-10-07. It replaces the 2026-07-17 rule
that blocked every draft until Sawyer approved one named person. Hub record:
`seascape-hub/decisions/2026-10-07-owner-outreach-rules-v2.md`.

This public repository defines how to find and qualify owner opportunities. It
is not an owner database, lead list, or campaign queue. Agents never send.

Do not store a named owner or representative, source URL, permission receipt,
fit note, contact channel, contact detail, or message content in this
repository. Those records belong only in the approved private owner system:
the business Google Drive "Owner Intelligence" folder and its tracker Sheet
(`seascape-hub/decisions/2026-09-29-owner-intelligence-private-store.md`).

## Allowed Source Types

An opportunity may come from these sources:

- a named local referral or warm introduction with a documented path to the
  owner or authorized representative
- an owner who submitted the Seascape revenue-review or property-management
  form
- a public business or contact page that explicitly invites a relevant inquiry,
  including referral partners such as real estate agents, pool, cleaning, and
  repair companies, inspectors, and insurance agents
- a named networking-group or event connection where follow-up permission was
  given
- a direct inbound email, call, text, or referral from an owner or authorized
  representative
- a public county property record that names the owner of a home in the
  service area, for a postal letter to the owner mailing address on that
  record only

A public name alone is not enough for email or phone contact. A property
record supports a postal letter only; it does not support an email, a call, or
a text, and it does not support a search for other contact details.

## Allowed Channels

| Source | Allowed channel |
|---|---|
| Referral, warm introduction, networking connection | The channel the introduction or connection gave |
| Owner form or direct inbound request | The channel the owner used or gave |
| Public business page that invites inquiries | The business contact on that page (email, phone, or form) |
| Public county property record | A postal letter to the owner mailing address on the record |

## Refuse

Refuse and leave out:

- Airbnb, Vrbo, Booking.com, or other OTA host-message surfaces
- public listing observations used as a contact path
- scraped, guessed, purchased, or enriched contact data
- email, phone, or text contact built from a property record, directory, or
  social profile
- automated or prerecorded calls, and texts to anyone who did not give that
  number for this purpose
- competing property managers, generic vendor lists, or mass-campaign targets
- any record where the owner/representative relationship cannot be supported

## Qualification Evidence

Before returning a qualification decision to Sawyer, verify:

1. the named owner or authorized representative label
2. source type and date received
3. a reopenable source or a redacted receipt
4. the permission, invitation, or public-record basis for the channel
5. a factual property/business fit signal
6. the channel that the source allows

Do not infer dissatisfaction, a wish to change managers, a revenue problem, or
owner demand from a source type or property details.

The evidence may be inspected for the current decision, but it must not be
copied into this public repository.

## Batch Approval Gate

Agents may prepare a message template, a recipient list, and personalized
drafts for Sawyer's review. Sawyer approves one template and one recipient list
for each batch. That approval covers every message in the batch.

After batch approval:

- agents may personalize each message from the approved template and may place
  drafts in Sawyer's own business mailbox or the private owner system
- Sawyer sends each message, letter, or call himself
- do not create a mailbox draft or schedule a message through this repository
- do not automate a send or follow-up
- do not use the benchmark to promise or imply a particular outcome
- do not count a touch, delivery, response absence, or form test as demand

A change to the template or a new recipient outside the approved list needs a
new approval. Owner-facing copy never names software or vendors and makes no
revenue, occupancy, savings, review-count, fixed-fee, or guarantee claim.
Pricing questions go to Patrick.

A real reply or owner request must pass the Hub validation standard before it
can be recorded as owner-demand evidence.

## Storage and Privacy Boundary

This repository is public. It must never contain a named candidate record,
source or permission receipt, contact channel, private contact detail, property
record, personal profile, or message content.

Named records, drafts, approvals, and delivery times go only in the approved
private owner system. Review an inactive or declined prospect after 90 days
without activity; Sawyer decides deletion or continued retention. Nothing
deletes automatically.

When a qualified real owner signal exists, route durable demand proof through a
clean `seascape-hub` branch or PR, never by editing generated receipt
projection content by hand. A real reply that meets the Hub validation standard
may be recorded there with a minimal redacted identifier and a reopenable
private evidence path; raw contact details still do not belong in Git.
