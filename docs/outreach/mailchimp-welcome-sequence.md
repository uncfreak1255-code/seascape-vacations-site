# Mailchimp Welcome Sequence - Seascape Vacations

## Current Sender Authority

This is historical Mailchimp-format content, not an executable delivery
runbook. Every Seascape campaign must be sent by the Ops-owned Microsoft Graph
lane from `info@seascape-vacations.com`. Personal Gmail, a Mailchimp From
identity, and any other sender are prohibited. Do not activate this sequence
from the Site repo. Hub owns the policy; Ops owns recipient authorization,
scheduling, delivery, and Sent Items proof.
The Outlook campaign lane is Phase 1 hard-disabled in source. Microsoft admin
proof must show Application `Mail.Send` in scope for `info@`, sibling role
mailboxes out of scope, and no additive unscoped Entra `Mail.Send`; a separate
reviewed Phase 2 is required before any canary or send.

## Overview
- **Trigger:** new subscriber joins from the SAVE50 homepage popup.
- **Historical Mailchimp account:** us6, list ID `95e5a594d1` (content and evidence reference only; not current send authority).
- **Current priority:** keep Phase 1 source-disabled. Do not run a canary. After the Microsoft admin scope proof above, a separate reviewed Phase 2 must deliberately add the Outlook renderer, recipient eligibility, legal/opt-out handling, and internal-canary path.
- **Primary template:** `docs/outreach/templates/save50-welcome-email.html`
- **Plain-text fallback:** `docs/outreach/templates/save50-welcome-email.txt`
- **Hosted email assets:** `https://seascape-vacations.com/images/email/save50/`
- **Related campaign governance:** `docs/outreach/mailchimp-guest-social-proof-campaign.md`

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

## Email 2: Trip Fit Follow-Up
**Send:** 3 days after Email 1

**Subject line:** Want help picking the right Seascape home?

**Preview text:** A quick way to match the house to your group, beach plans, and dates.

**Body draft:**

Hey `*|FNAME|*`,

If you're still choosing dates, the main thing is matching the house to the trip.

For the biggest groups, start with The Oasis. For a private dock and a Bradenton base, look at Dockside Dreams. If you want Sarasota as your home base, start with Sarasota Luxe. If you want the simplest family pool setup, compare River House and Bradenton Pool Home.

Your code is still `SAVE50`: $50 off your first direct booking of 3 nights or more.

Browse the homes here:
`https://seascape-vacations.com/properties/?utm_source=outlook&utm_medium=email&utm_campaign=save50_welcome&utm_content=email_2_browse_homes`

If you want help choosing, reply with your group size and dates. We'll point you toward the best fit.

- Sawyer and the Seascape team

## Email 3: Direct Booking Reminder
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

## Retired Mailchimp Setup

The old provider setup steps were removed from this runbook; Git history keeps
them for receipt forensics. Do not configure, test, activate, or deliver this
sequence through Mailchimp. The templates above remain content/design inputs
only.

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
