---
name: owner-outbound-batch
description: Draft a small Seascape homeowner outbound batch from approved owner proof, a named homeowner prospect list, and the owner benchmark CTA. Use when the owner cluster is below the on-page gate and the next move is founder-reviewed outbound preparation. This skill drafts only; it never sends.
---

# Owner Outbound Batch

Use this to prepare one founder-reviewed owner outbound batch.

## Authority

- Demand OS handoff: `docs/plans/2026-06-13-demand-os-handoff.md`
- Owner outbound home: `docs/status/owner-outbound.md`
- Approved owner proof assets: `src/_data/ownerProofAssets.json`
- Owner benchmark CTA: `/research/owner-fee-revenue-leak-benchmark-2026/`
- Demand register standard: `/Users/sawbeck/Projects/seascape-hub/projects/owner-demand-trust-outcome-register.md`

## Required Inputs

1. A named homeowner-reachable prospect row from the hub-owned homeowner list.
2. The prospect's reopenable contact path.
3. The public fit reason for the benchmark-to-teardown offer.
4. One approved quantified proof module from `src/_data/ownerProofAssets.json`.
5. The current benchmark CTA page, verified fact-clean before use.

## Workflow

1. Read `docs/status/owner-outbound.md` and confirm the homeowner-list milestone is either cleared or this is a draft-only research rehearsal.
2. Read the approved proof asset being used. Do not invent fee, revenue, review, or management-performance claims.
3. Pair exactly one prospect with exactly one pain hypothesis and exactly one proof module.
4. Draft a short personal opener that points to the benchmark and offers a revenue teardown.
5. Produce a copy-paste batch for founder review.
6. Produce the founder checklist below.

## Founder Checklist

Before any send:

- prospect is a named homeowner or owner-reachable contact
- contact path can be reopened by another agent
- proof module exists in `src/_data/ownerProofAssets.json`
- benchmark page is still fact-clean
- no scraped or guessed private contact data is used
- send log row is prepared in `docs/status/owner-outbound.md`

## Output

Return:

- batch date
- prospect name or public owner/contact label
- contact path summary, without private copied contact details
- fit reason
- proof module used
- copy-paste opener
- benchmark CTA
- founder checklist result
- send-log row draft

## Stop Conditions

Stop instead of drafting when:

- the prospect is generic property-management outreach rather than homeowner outreach
- the contact path is private, guessed, scraped, or not reopenable
- no approved proof module exists
- the benchmark page cannot be verified fact-clean
- the user asks the agent to send, automate sending, scrape contact data, or count a send as demand

## Rules

- Never send outreach.
- Never schedule or automate sends.
- Never create a register row.
- Never count a draft, prepared row, sent message, test send, labeled send, or internal helper submit as owner demand.
- Do not add a new MCP, plugin, scraper, external SEO pack, or dashboard for this lane.
- The only real proof gate is a later reply that passes `owner-reply-intake` and the Hub register Validation Standard.
