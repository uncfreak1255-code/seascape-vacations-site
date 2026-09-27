# Brief: Homepage leave-the-page email signup

## Content Gate Inputs

- persona: desktop visitor on the homepage who is about to leave without booking or joining the email list.
- primary keyword: seascape vacations
- secondary keywords: bradenton vacation rentals, sarasota vacation rentals
- audience pattern: arrives on the homepage, browses the hero and collection, and leaves before scrolling to the inline signup about 70% of the way down.
- proof source: `guest_email_capture_receipts` in seascape-analytics, read 2026-09-27: 478 of 490 receipts came from the homepage popup removed in #559 on 2026-09-10, and none have arrived since. GA4 `email_capture_submit` shows 2 events since 2026-08-26, so real signups were about one a week. Sawyer approved restoring a leave-the-page popup on 2026-09-27.
- required internal links: /properties/, /privacy/
- CTA target: the existing guest email capture (`/.netlify/functions/guest-email-capture`, Mailchimp, SAVE50 success state), placement `home_exit_intent`.
- anti-claims: no savings figure beyond the existing $50 code for a first direct booking of three nights or more; no timed popup; no popup on touch devices; no new offer terms.

## Why This Batch

- The 2026-09-10 redesign removed the only homepage capture that visitors saw before leaving; the inline form below the fold has taken zero signups since.
- The 2026-09-16 bot guard now screens captures, so restoring a popup does not reopen the bot flood.
- Copy, offer, and form fields reuse the approved inline homepage signup word for word except the heading.

## Experiment And Readback Contract

- hypothesis: a desktop visitor who is shown the signup on page leave joins the list more often than one who must scroll to the inline form.
- primary event: `email_capture_submit` with placement `home_exit_intent`
- guardrail event: `email_capture_submit` with placement `home_inline` (the inline form should not fall to zero because of the dialog)
- entry criteria: zero homepage captures from 2026-09-10 to 2026-09-27.
- readback window: 28 days after production deployment
- decision rule: keep the dialog when real (non-proof, bot-screened) `home_exit_intent` receipts exceed zero and homepage sessions do not fall; remove it if captures stay at zero.

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | seascape vacations brand queries |
| Searcher intent | find the Seascape homepage and browse homes |
| Current Seascape URL | `/` |
| SERP observed date | 2026-09-27 |
| SERP stale after | 2026-10-27 |
| Current proof | Search Console BigQuery export read 2026-09-27: homepage 8 to 13 search clicks a week since 2026-09-14 |
| Top visible competitors | none relevant; the change is a closed dialog, not ranking copy |
| Competitor angle | not applicable to a closed dialog |
| Visual/format gap | the homepage has no signup visible to a visitor who leaves before scrolling |
| Seascape gap | homepage email captures fell to zero after the 2026-09-10 redesign |
| Search fit | the dialog is closed on load; headings, title, description, and first-render copy are unchanged |
| Local/GBP proof | Not applicable because no local-profile or map-pack content changes |
| AEO/readback note | answer blocks and quoted homepage copy are unchanged |
| Recommendation | add the leave-the-page dialog on desktop only |
| Attack status | none found after named checks |
| Query variants inspected | seascape vacations; seascape vacations bradenton |
| SERP source | Search Console BigQuery export read 2026-09-27 |
| Competitor URLs inspected | source: Search Console BigQuery export read 2026-09-27; SERP: brand query rows in that export read 2026-09-27; competitor-page: none opened, because the change adds no ranking copy |
| Content gap and Seascape answer | give leaving visitors the same $50 signup the inline form offers |
| Design/format strategy | Waterline dialog reusing the inline signup form classes; no new component style |
| Seascape proof available | analytics receipts and GA4 events dated 2026-09-27 |
| Tools/plugins used | seascape-analytics Postgres, Search Console BigQuery export, Playwright, repository build and content gates |
| Decision and reason | ship; Sawyer approved restoring the popup, and it changes no ranking copy |

## Page Builder Tasks

- source files likely to change:
  - `src/index.njk`
  - `src/assets/js/guest.js`
  - `src/css/arrival.css`
  - `src/_includes/layouts/guest.njk` (cache version)
  - `scripts/enforcement/direct-booking-event-smoke.test.js`
  - this brief

## Release Gate Checklist

- routes to smoke test: `/`
- commands to run: `npm run lint:content`, `npm test`, `npm run verify:release`, `npm run test:visual`.
