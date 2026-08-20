# Mailchimp Welcome Sequence - Seascape Vacations

## Current Sender Authority

Corrected 2026-08-20 from the live audit in
`docs/outreach/2026-08-20-email-marketing-ultrasound.md`.

Mailchimp is the live guest-marketing sender. This welcome sequence has been
delivering from `Seascape Vacations <info@seascape-vacations.com>` on an
authenticated domain since 2026-05-26. Earlier revisions of this file described
Mailchimp as a retired provider with no send authority, which was wrong and
misrouted agents reading it. Personal Gmail is still prohibited as a sender.

Three lanes, kept apart:

- guest marketing: Mailchimp, triggered by the `guest-capture` tag written by
  site capture. Live.
- Outlook `info@` campaign and post-stay email: not live.
- owner lead mail: Microsoft Graph, transactional only, never Mailchimp.

Hub owns sender policy. Ops owns recipient authorization, scheduling, and
delivery proof for the Outlook lane. This repo owns email content, link
integrity, and claim truth.

The Outlook campaign lane stays Phase 1 hard-disabled in source, and the live
Mailchimp lane does not change that. Microsoft admin proof must show
Application `Mail.Send` in scope for `info@`, sibling role mailboxes out of
scope, and no additive unscoped Entra `Mail.Send`; a separate reviewed Phase 2
is required before any canary or send on that lane.

## Overview
- **Trigger:** the `guest-capture` tag, written when a site signup reaches the Mailchimp Marketing API through `netlify/functions/guest-email-capture.js`. A signup that falls back to the embed-form path gets no tag and never enters the sequence.
- **Mailchimp account:** us6, list ID `95e5a594d1`.
- **Current priority:** replace the plain-template second email with the designed artifact below. Do not send anything to contacts who already completed the sequence.
- **Email 1 template:** `docs/outreach/templates/save50-welcome-email.html` / `.txt`
- **Email 2 template:** `docs/outreach/templates/save50-house-fit-email.html` / `.txt`
- **Hosted email assets:** `https://seascape-vacations.com/images/email/save50/`
- **Related campaign governance:** `docs/outreach/mailchimp-guest-social-proof-campaign.md`

## Known Attribution Gap In Email 1

Every link in the Email 1 template carries `utm_source=outlook`, and
`scripts/enforcement/save50-welcome-email-template.test.js` enforces that value.
The email is sent by Mailchimp, so that source value files its traffic under the
wrong channel. Repairing it means changing the two template files, this doc, and
the test's `requiredCampaignParams` together in one PR, alongside a re-paste of
the live email. Do not change one side alone.

## Email 1: Welcome And Coupon Delivery
**Send:** immediately after signup

**Subject line:** Your $50 off code is ready

**Preview text:** SAVE50 is ready: $50 off your first direct Seascape booking of 3 nights or more.

**Primary CTA:** Browse all 5 homes -> `https://seascape-vacations.com/properties/?utm_source=outlook&utm_medium=email&utm_campaign=save50_welcome&utm_content=browse_all_homes`

**Core offer copy:**

> Thanks for joining the Seascape list. Your welcome code is ready: $50 off your first direct booking of 3 nights or more at any of our five private pool homes between Bradenton and Sarasota.
>
> Your code: SAVE50
>
> Book direct and avoid the extra service fees Airbnb and VRBO add at checkout.

**Property links used in the template:**
- Dockside Dreams: `https://seascape-vacations.com/properties/dockside-dreams/?utm_source=outlook&utm_medium=email&utm_campaign=save50_welcome&utm_content=dockside_dreams`
- The Oasis: `https://seascape-vacations.com/properties/the-oasis/?utm_source=outlook&utm_medium=email&utm_campaign=save50_welcome&utm_content=the_oasis`
- Sarasota Luxe: `https://seascape-vacations.com/properties/sarasota-luxe/?utm_source=outlook&utm_medium=email&utm_campaign=save50_welcome&utm_content=sarasota_luxe`
- River House: `https://seascape-vacations.com/properties/river-house/?utm_source=outlook&utm_medium=email&utm_campaign=save50_welcome&utm_content=river_house`
- Bradenton Pool Home: `https://seascape-vacations.com/properties/bradenton-pool-home/?utm_source=outlook&utm_medium=email&utm_campaign=save50_welcome&utm_content=bradenton_pool_home`

**Implementation notes:**
- Treat the HTML and plain-text files as content/design source only.
- Do not send a payload containing these historical Mailchimp merge links:
  - `*|ARCHIVE|*`
  - `*|UPDATE_PROFILE|*`
  - `*|UNSUB|*`
- Do not add an expiration date unless the SAVE50 coupon config proves one.
- Do not add review counts, rating claims, price-from claims, or broad savings promises unless the proof source is current.

## Email 2: House Fit Follow-Up
**Send:** 2 days after Email 1 (the live journey delay)

**Subject line:** Want help picking the right Seascape home?

**Preview text:** A quick way to match the house to your group, beach plans, and dates.

**Production templates:**
- `docs/outreach/templates/save50-house-fit-email.html`
- `docs/outreach/templates/save50-house-fit-email.txt`

These replace the plain-text draft that previously lived in this section. Email 2
now uses the same visual system as Email 1 and does a different job: it sorts the
five homes by group size instead of restating the offer.

**Campaign parameters:** `utm_source=mailchimp`, `utm_medium=email`,
`utm_campaign=guest_social_proof`. That campaign token is deliberate. It is one of
only two tokens allowlisted in `src/_includes/partials/save50-offer.njk` and
`src/_includes/partials/email-popup.njk`, so any other value means the reader
lands on `/properties/` with the on-site SAVE50 reminder hidden.

**Fit lines trace to source:** group size, bedroom and bathroom counts, the single
waterfront claim, and each home's differentiator come from
`src/_data/properties-fallback.json`. Pool heat is a paid nightly add-on, so the
email claims private pools and never "heated" pools.

**Verification:** `node --test scripts/enforcement/save50-house-fit-email-template.test.js`

## Email 3: Direct Booking Reminder (draft, not built)

This third touch does not exist in the live journey and should not be built yet.
Email 2 has to earn a click first. Adding a third message to a sequence whose
first email clicks at 0.40% adds volume, not results. The draft below is kept as
content source only.

**Send:** 7 days after Email 1

**Subject line:** Still have your SAVE50 code

**Preview text:** Use it when you book direct for 3 nights or more.

**Body draft:**

Hey `*|FNAME|*`,

Quick reminder: your welcome code is `SAVE50`.

Use it for $50 off your first direct booking of 3 nights or more. Booking direct also means you avoid the extra service fees Airbnb and VRBO add at checkout, and you can reach us directly if you need help before your stay.

Check the homes and dates here:
`https://seascape-vacations.com/properties/?utm_source=outlook&utm_medium=email&utm_campaign=save50_welcome&utm_content=email_3_check_homes`

Questions? Reply here or call us at `(941) 704-8545`.

- Sawyer and the Seascape team

## Live Journey Shape

Recorded from the 2026-08-20 audit so a reader knows what is already running
before proposing a change:

- one active journey, triggered by the `guest-capture` tag, re-entry off
- Email 1 immediately on entry, then a 2-day delay, then Email 2
- Email 1 is designed HTML with SAVE50, five homes, and no expiry date
- Email 2 was still a plain Mailchimp template at audit time; the artifact above
  is its replacement
- no regular campaign has ever been sent from this account, and the audience has
  no segments
- contacts that entered before a change keep the version they were sent; do not
  re-send to contacts who already completed the sequence

Provider setup steps are deliberately not restated here. Journey structure and
audience configuration are operated in the Mailchimp UI; this file governs
content, links, claim truth, and campaign parameters.

## Phase 2-Only Outlook Canary Checklist

- do not execute this checklist during Phase 1
- require the Microsoft admin scope proof above and a separate reviewed Phase 2 first
- after separate current-turn canary approval, use only `info@seascape-vacations.com` to `proofs@seascape-vacations.com`
- Outlook desktop loads the hero, logo, and property images from `https://seascape-vacations.com/images/email/save50/`.
- Mobile preview keeps the property cards readable.
- `SAVE50` remains visible when images are blocked.
- Every property card opens the correct Seascape property URL with `utm_campaign=save50_welcome`.
- The main CTA opens `https://seascape-vacations.com/properties/?utm_source=outlook&utm_medium=email&utm_campaign=save50_welcome&utm_content=browse_all_homes`.
- The phone link opens `tel:+19417048545`.
- the Ops-rendered legal footer, preferences, and unsubscribe links resolve without raw Mailchimp merge tags
- the Sent Items readback proves the message was accepted from `info@seascape-vacations.com`

## Repo Verification

Before handing this content to Ops, run:

```bash
node --test scripts/enforcement/save50-welcome-email-template.test.js
npm run lint:content
npm run build
```
