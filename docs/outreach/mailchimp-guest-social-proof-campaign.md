# Mailchimp Guest Social Proof Campaign

## Purpose

This file governs the outbound guest email with one approved subject line:

- `Why Guests Keep Coming Back To Our Gulf Coast Homes`

Use this doc plus the template files below as source truth before editing or sending this campaign again.

## Sender Authority

Corrected 2026-08-20 from `docs/outreach/2026-08-20-email-marketing-ultrasound.md`.

This repo owns campaign content only. Mailchimp is the live guest-marketing
sender, delivering from `info@seascape-vacations.com` on an authenticated domain;
personal Gmail is prohibited. The Microsoft 365 / Outlook campaign lane from
`info@seascape-vacations.com` is a separate lane that is Phase 1 hard-disabled in
source, and no credential, approval, or environment variable may activate it.
Sender enforcement, recipient authorization, scheduling, and delivery readback
for that Outlook lane belong in `seascape-ops`. Durable policy is
`seascape-hub/context/operating-canon.md#business-email`.

## Superseded By The House-Fit Artifact

The content in this file was pasted into the live welcome journey's second email.
As of 2026-08-20 that slot belongs to
`docs/outreach/templates/save50-house-fit-email.html`, which uses Email 1's
visual system and sorts the five homes by group size instead of leading with
guest quotes. Keep this file as the governed archive of the superseded variant.
Do not paste it back into the journey.

The live variant of this content also carried claim drift that the templates here
do not support: a sitewide "pools, hot tubs, and beach chairs included at every
property" line, and specific drive-time claims. Neither traces to
`src/_data/properties-fallback.json`.

## Outlook Proof Receipt

These historical Outlook messages prove that an older outbound path delivered.
They do not authorize that sender today, and they do not approve the drifted
`200+` subject or the old placeholder-link variant.

Historical delivery evidence from the retired outbound path:

- outbound message observed in Outlook:
  - subject: `What 200+ Guests Love About Our Gulf Coast Homes`
  - historical, non-authoritative sender: `Sawyer from Seascape Vacations <sawyer@becksbnb.com>`
  - received timestamp: `2026-05-26T22:26:15Z` (Monday, May 26, 2026)
  - message id: `AAMkADdkZmU0ZDM3LTBhMTAtNDYzYS05MjU3LTA2YWE4ZWZmZDRhNABGAAAAAACBnwxd0R02RLcf0MYdgrzPBwCmrCepJ936Qp4ckMYQKHQnAAAAAAEMAACmrCepJ936Qp4ckMYQKHQnAAM88amGAAA=`
- external auto-reply proving the outbound reached an external mailbox:
  - subject: `Automatic reply: What 200+ Guests Love About Our Gulf Coast Homes`
  - sender: `Kimberly E Waldinger <Kimberly.Waldinger@cornerstone-bb.com>`
  - received timestamp: `2026-05-30T18:56:56Z` (Saturday, May 30, 2026)
  - message id: `AAMkADdkZmU0ZDM3LTBhMTAtNDYzYS05MjU3LTA2YWE4ZWZmZDRhNABGAAAAAACBnwxd0R02RLcf0MYdgrzPBwCmrCepJ936Qp4ckMYQKHQnAAAAAAEMAACmrCepJ936Qp4ckMYQKHQnAAM-d3WNAAA=`

## Approved Content Artifact (historical Mailchimp format)

The files below are approved content/design source, not a send-ready Outlook
payload. Their Mailchimp merge tags and `utm_source=mailchimp` links are
historical. Before a separate reviewed Phase 2 can propose any Microsoft Graph
canary, Microsoft admin proof must show Application `Mail.Send` in scope for
`info@`, sibling role mailboxes out of scope, and no additive unscoped Entra
`Mail.Send`. The Ops-owned renderer must also replace provider merge tags with a
working opt-out/legal footer and use the approved current attribution values.

- subject: `Why Guests Keep Coming Back To Our Gulf Coast Homes`
- preview: `Real guest notes, practical area guides, and your SAVE50 code in one place.`
- HTML template: `docs/outreach/templates/guest-social-proof-email.html`
- plain-text fallback: `docs/outreach/templates/guest-social-proof-email.txt`
- canonical guide URLs:
  - `https://seascape-vacations.com/guides/anna-maria-island-vs-siesta-key/?utm_source=mailchimp&utm_medium=email&utm_campaign=guest_social_proof`
  - `https://seascape-vacations.com/guides/best-time-visit-anna-maria-island/?utm_source=mailchimp&utm_medium=email&utm_campaign=guest_social_proof`
  - `https://seascape-vacations.com/guides/things-to-do-bradenton-fl/?utm_source=mailchimp&utm_medium=email&utm_campaign=guest_social_proof`
- canonical social URLs:
  - `https://www.facebook.com/SeascapeVacations`
  - `https://www.instagram.com/seascapevacations`

## Canonical Repo Surface

Do not use `/emails/` or any one-off Mailchimp export as canonical governance for this campaign.

## Proof And Copy Guardrails

- do not ship stale sitewide review-count claims as universal proof
- do not ship `200+`, `500+`, `650+`, or similar aggregate review-count claims unless a current approved source is added and cited in this doc
- keep guest quotes framed as guest notes, not portfolio-wide performance guarantees
- do not use placeholder links like `https://` or empty social URLs
- all links must be production Seascape URLs, `tel:`, `mailto:`, or approved Mailchimp merge links

## Drift Found In The Live Variant

Compared with current proof rules and link integrity expectations, the live send variant had these issues:

1. subject-level review-count claim (`200+`) without a current approved source note in repo governance.
2. social icon links rendered as `https://` placeholders.
3. guide block copy mixed guide names that did not clearly map to canonical guide URLs in source form.
4. campaign variant lived outside the governed template/test surface.

## Phase 2-Only Send Checklist

Do not execute this checklist during Phase 1. After Microsoft admin scope proof
and a separate reviewed Phase 2:

1. confirm the subject line is exactly `Why Guests Keep Coming Back To Our Gulf Coast Homes`
2. run `node --test scripts/enforcement/guest-social-proof-email-template.test.js`
3. after separate current-turn canary approval, use only the internal Outlook canary path
   `info@seascape-vacations.com` to `proofs@seascape-vacations.com` and confirm
   all guide links and social links resolve
4. confirm no raw Mailchimp merge tag or stale `utm_source=mailchimp` value is
   present in the Outlook-rendered payload
5. confirm `SAVE50` wording still matches active offer terms
