# Mailchimp Guest Social Proof Campaign

## Purpose

This file governs the outbound guest email with one approved subject line:

- `Why Guests Keep Coming Back To Our Gulf Coast Homes`

Use this doc plus the template files below as source truth before editing or sending this campaign again.

## Outlook Proof Receipt

These Outlook messages prove the outbound path is live. They do not approve the drifted `200+` subject or the old placeholder-link variant.

Fresh runtime evidence that this outbound path is live:

- outbound message observed in Outlook:
  - subject: `What 200+ Guests Love About Our Gulf Coast Homes`
  - sender: `Sawyer from Seascape Vacations <sawyer@becksbnb.com>`
  - received timestamp: `2026-05-26T22:26:15Z` (Monday, May 26, 2026)
  - message id: `AAMkADdkZmU0ZDM3LTBhMTAtNDYzYS05MjU3LTA2YWE4ZWZmZDRhNABGAAAAAACBnwxd0R02RLcf0MYdgrzPBwCmrCepJ936Qp4ckMYQKHQnAAAAAAEMAACmrCepJ936Qp4ckMYQKHQnAAM88amGAAA=`
- external auto-reply proving the outbound reached an external mailbox:
  - subject: `Automatic reply: What 200+ Guests Love About Our Gulf Coast Homes`
  - sender: `Kimberly E Waldinger <Kimberly.Waldinger@cornerstone-bb.com>`
  - received timestamp: `2026-05-30T18:56:56Z` (Saturday, May 30, 2026)
  - message id: `AAMkADdkZmU0ZDM3LTBhMTAtNDYzYS05MjU3LTA2YWE4ZWZmZDRhNABGAAAAAACBnwxd0R02RLcf0MYdgrzPBwCmrCepJ936Qp4ckMYQKHQnAAAAAAEMAACmrCepJ936Qp4ckMYQKHQnAAM-d3WNAAA=`

## Approved Mailchimp Artifact

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

## Send Checklist

Before re-sending or reusing this campaign:

1. confirm the subject line is exactly `Why Guests Keep Coming Back To Our Gulf Coast Homes`
2. run `node --test scripts/enforcement/guest-social-proof-email-template.test.js`
3. send a test to Gmail and confirm all guide links and social links resolve
4. confirm `SAVE50` wording still matches active offer terms
