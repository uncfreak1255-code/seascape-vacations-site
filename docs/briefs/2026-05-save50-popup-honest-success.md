# Brief: SAVE50 Popup Honest Success State

## Content Gate Inputs

- persona: direct-booking guests using the SAVE50 popup before or during a booking decision
- primary keyword: Seascape Vacations SAVE50
- secondary keywords: $50 off Seascape Vacations, direct-booking discount, Gulf Coast vacation rentals
- audience pattern: guests who expect the on-page offer state to tell the truth after submitting an email
- proof source: live popup submit proof from the May 26 handoff, Mailchimp staging intake readback, and Gmail delivery proof for a fresh alias
- required internal links: /properties/, /guides/
- CTA target: /properties/
- anti-claims: do not promise a fresh email for repeat subscribers, do not claim Gmail Primary placement, and do not add a resend flow without separate delivery proof

## Why This Batch

- A repeat subscriber can see the same success state as a brand-new subscriber.
- The fresh-address test proved the live capture and follow-up email path works, but the popup copy still promised an email every time.
- The site should show the SAVE50 code honestly on the page without implying a new welcome email was sent to an already-subscribed address.

## Cluster In Scope

- canonical winner URL(s): /
- feeder pages: shared popup partials used on guide and site routes
- aliases or retired URLs: none
- money destination: /properties/
- active lane: direct-book stay intent

## Page Builder Tasks

- source files likely to change: `src/index.njk`, `src/_includes/partials/email-popup.njk`, `src/assets/js/conversion-tracking.js`
- redirect or schema work: none
- internal-link or CTA work: preserve the existing Browse Properties popup CTA
- money CTA and downstream tracking event to verify: preserve `email_capture_submit` and the popup success surface

## Voice Editor Checklist

- tone risks: do not over-explain email deliverability or Gmail Promotions in guest copy
- generic or mechanical patterns to kill: fake certainty that an email was sent on every submit
- proof or specificity checks: keep the offer claim limited to the visible SAVE50 code and 3+ night condition

## Release Gate Checklist

- routes to smoke test: /
- commands to run: `node --test scripts/enforcement/direct-booking-event-smoke.test.js`, `node --test scripts/enforcement/guest-email-capture-receipts.test.js`, `npm run lint:content`, `npm run build`
- regression risks to watch: popup success showing after both capture transports fail, or tracked email submit no longer firing

## Done When

- the success copy no longer says a new email was sent every time
- the code is still visible immediately after a successful capture path
- the success state keeps a short reminder to save the visible code before browsing
- total primary-plus-fallback delivery failure does not hide the form and show success
- focused popup/capture checks pass
