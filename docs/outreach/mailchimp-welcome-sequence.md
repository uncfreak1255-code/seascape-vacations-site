# Mailchimp Welcome Sequence - Seascape Vacations

## Overview
- **Trigger:** new subscriber joins from the SAVE50 homepage popup.
- **Mailchimp account:** us6, list ID `95e5a594d1`.
- **Current priority:** upgrade Email 1 with the Claude Design welcome template, then keep Emails 2 and 3 plain until the first send proves clean in Gmail and Mailchimp reporting.
- **Primary template:** `docs/outreach/templates/save50-welcome-email.html`
- **Plain-text fallback:** `docs/outreach/templates/save50-welcome-email.txt`
- **Hosted email assets:** `https://seascape-vacations.com/images/email/save50/`

## Email 1: Welcome And Coupon Delivery
**Send:** immediately after signup

**Subject line:** Your $50 off code is ready

**Preview text:** SAVE50 is ready: $50 off your first direct Seascape booking of 3 nights or more.

**Primary CTA:** Browse all 5 homes -> `https://seascape-vacations.com/properties/`

**Core offer copy:**

> Thanks for joining the Seascape list. Your welcome code is ready: $50 off your first direct booking of 3 nights or more at any of our five private pool homes between Bradenton and Sarasota.
>
> Your code: SAVE50
>
> Book direct and avoid the extra service fees Airbnb and VRBO add at checkout.

**Property links used in the template:**
- Dockside Dreams: `https://seascape-vacations.com/properties/dockside-dreams/`
- The Oasis: `https://seascape-vacations.com/properties/the-oasis/`
- Sarasota Luxe: `https://seascape-vacations.com/properties/sarasota-luxe/`
- River House: `https://seascape-vacations.com/properties/river-house/`
- Bradenton Pool Home: `https://seascape-vacations.com/properties/bradenton-pool-home/`

**Implementation notes:**
- Use the HTML template as Mailchimp custom-code email content.
- Use the plain-text file as the Mailchimp plain-text version.
- Keep Mailchimp merge links in place:
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
`https://seascape-vacations.com/properties/`

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
`https://seascape-vacations.com/properties/`

Questions? Reply here or call us at `(941) 704-8545`.

- Sawyer and the Seascape team

## Mailchimp Setup Instructions

1. Go to Mailchimp -> Automations -> Customer Journeys.
2. Open the SAVE50 popup welcome journey for audience `95e5a594d1`.
3. Confirm the starting point is the new subscriber event for the homepage SAVE50 popup.
4. Replace Email 1 content with `docs/outreach/templates/save50-welcome-email.html`.
5. Paste `docs/outreach/templates/save50-welcome-email.txt` into the plain-text version.
6. Set the Email 1 subject and preview text from this doc.
7. Keep tracking enabled:
   - Opens: on
   - Clicks: on
   - Google Analytics tracking: on
   - Suggested UTM campaign: `save50_welcome`
8. Send test emails before activating.

## Required Test Send Checklist

- Gmail desktop loads the hero, logo, and property images from `https://seascape-vacations.com/images/email/save50/`.
- Mobile preview keeps the property cards readable.
- `SAVE50` remains visible when images are blocked.
- Every property card opens the correct Seascape property URL.
- The main CTA opens `https://seascape-vacations.com/properties/`.
- The phone link opens `tel:+19417048545`.
- `View in browser`, `Update preferences`, and `Unsubscribe` resolve through Mailchimp merge links.
- Gmail Promotions placement is recorded as inbox placement evidence, not treated as a delivery failure.

## Repo Verification

Before handing this to Mailchimp, run:

```bash
node --test scripts/enforcement/save50-welcome-email-template.test.js
npm run lint:content
npm run build
```
