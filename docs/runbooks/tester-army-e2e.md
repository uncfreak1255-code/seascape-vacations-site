# TesterArmy E2E browser flows

Run `npm run test:e2e` with the repository's Node 24 toolchain. This builds
the site, starts the generated site on an isolated localhost port, then runs
the TesterArmy `e2e` SDK and its Playwright web engine in desktop and phone-
sized Chromium. Telemetry is disabled. These tests use locator actions and
assertions; they configure no model, account, or API key.
The browser wall clock is fixed at 2026-10-04 before any site script loads so
date-sensitive trip flows remain stable as the real calendar advances. Browser
timers continue to use the normal runtime clock.

If Chromium is not installed locally, install it with
`npx @e2e-dev/web install chromium` (`--with-deps` for Linux browser system libraries).

## Covered flows

| Guest or owner flow | TesterArmy SDK coverage | Existing Playwright coverage |
| --- | --- | --- |
| Search dates and party size, filter to a suitable home, carry the trip into its details, and follow a checkout CTA | Homepage search through an intercepted checkout | `home-booking-button`, `catalog-card-checkout`, `open-house-journey` |
| Recover from an unreadable availability calendar, retry after changing dates, and keep oversized groups away from checkout | Property availability recovery and capacity guard | `availability-truth`, `home-booking-button`, `open-house-journey` |
| Follow a guide detour through a stay collection into a property while retaining dates, party size, and campaign | Guide-to-stay-to-property continuity | `guest-decision-journey`, `trip-continuity` |
| Complete the four-step owner revenue review, require owner authority, and submit the synthetic request; recover from a temporary POST failure by returning to the form and retrying | Owner intake success and POST-failure recovery with local response fixtures | `owner-form-steps`, `waterline-owner-capture` |
| Retry a failed guest-email capture, reveal the offer only after success, then browse with SAVE50 | Signup recovery and campaign handoff | `waterline-owner-capture` |
| Prepare a property question with trip context while excluding private URL fields | Contact link inspection without opening a mail application | `open-house-journey` |
| Open the phone navigation and reach the owner review form | Phone-sized browser journey | `open-house-journey`, `waterline-owner-capture` |

The existing Playwright suite remains the detailed coverage for property
comparison and shortlist behavior, gallery keyboard handling, homepage scene
interactions, mobile tap and layout floors, no-JavaScript fallbacks, route
snapshots, and accessibility. Run it with `npm run test:visual`.

## Local boundaries

The E2E fixture intercepts availability checks, guest-email capture, owner
form submission, image transformation, and the checkout destination. Other
off-site requests are aborted. Test identities and addresses use reserved
`.test` domains and invented values.

These tests do not verify live Hostaway calendars, checkout totals, payments,
or reservations; production Netlify form handling or reCAPTCHA; guest CRM
tagging or email delivery; opening a native mail application; or any live
production route. Those effects are outside the local test boundary.
