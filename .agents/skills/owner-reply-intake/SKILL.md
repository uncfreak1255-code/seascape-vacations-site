---
name: owner-reply-intake
description: Classify Seascape owner outbound replies and refuse weak demand evidence before it reaches the Hub owner-demand register. Use when a reply, form submit, email-origin signal, or outbound outcome is proposed as owner demand.
---

# Owner Reply Intake

Use this before any owner outbound result is treated as demand.

## Authority

- Demand OS handoff: `docs/plans/2026-06-13-demand-os-handoff.md`
- Owner outbound home: `docs/status/owner-outbound.md`
- Hub register: `/Users/sawbeck/Projects/seascape-hub/projects/owner-demand-trust-outcome-register.md`
- Generated receipt block warning: `ingest-verification-receipts.py` overwrites `owner-receipt-projection`

The real guard is the Hub register Validation Standard plus this intake refusal
step. The proof-label-blind `owner_form_submits` counter is not enough by
itself.

## Required Inputs

1. Source type: outbound reply, form submit, email-origin signal, direct call note, or other receipt.
2. Label state: unlabeled, TEST, internal, helper, synthetic, or unknown.
3. Dated interaction or receipt window.
4. Source page, asset, outbound touch, or contact path.
5. Named owner pain, objection, or request.
6. Next action or explicit stop.
7. Evidence path another agent can re-open.

## Classification

- `REFUSE_TEST`: TEST, labeled, internal, helper, synthetic, or obvious test traffic.
- `REFUSE_INCOMPLETE`: missing named pain, source, date/window, next action, or reopenable evidence path.
- `PROVISIONAL_EMAIL`: email-origin owner signal with the full facts present but no repo-anchored receipt yet.
- `REAL_REGISTER_READY`: unlabeled owner signal with named pain, source, date/window, next action, and reopenable evidence path.

## Workflow

1. Check the label state first. Any TEST, labeled, internal, helper, or synthetic signal is refused.
2. Check that the owner pain or objection is named plainly. A click, page view, sent row, or vague reply is not enough.
3. Check that another agent can reopen the evidence path without private email content pasted into the repo.
4. Mark email-origin demand `PROVISIONAL_EMAIL` until a repo-anchored receipt or source note exists.
5. Only when every Validation Standard field is present, prepare a row for the hand-authored `## Register` section in the Hub register.

## Register Write Rule

Write only to:

`/Users/sawbeck/Projects/seascape-hub/projects/owner-demand-trust-outcome-register.md`

and only inside the hand-authored `## Register` section.

Never edit the generated `owner-receipt-projection` block by hand. That block is
receipt-generated and can be overwritten by `ingest-verification-receipts.py`.

## Negative Fixtures

| Fixture | Input | Expected |
|---|---|---|
| test-labeled-submit | TEST or labeled owner receipt, even with a message | `REFUSE_TEST` |
| internal-helper-submit | internal helper submit or synthetic check | `REFUSE_TEST` |
| sent-row-only | outbound row has `SENT`, no real reply | `REFUSE_INCOMPLETE` |
| vague-reply | reply exists but no named owner pain or next action | `REFUSE_INCOMPLETE` |
| email-origin-complete | email-origin signal has date, source, pain, next action, and reopenable evidence path but no repo receipt | `PROVISIONAL_EMAIL` |
| unlabeled-complete | unlabeled real owner signal has date, source, pain, next action, and reopenable evidence path | `REAL_REGISTER_READY` |

## Output

Return:

- classification
- whether a Hub register row is allowed
- missing field, if refused
- provisional reason, if email-origin
- proposed `## Register` row only when `REAL_REGISTER_READY`
- next action or explicit stop

## Stop Conditions

Stop and refuse when:

- the signal is TEST, labeled, internal, helper, or synthetic
- the only proof is `SENT`
- the only proof is an `owner_form_submits` count
- private email content would need to be pasted into the repo
- the evidence path cannot be reopened
- the target write would touch `owner-receipt-projection`
