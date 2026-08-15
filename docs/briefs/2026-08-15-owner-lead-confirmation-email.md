# Brief: Owner Lead Confirmation Email Truth

Date: 2026-08-15
Status: ACTIVE

## Content Gate Inputs

- persona: vacation-rental owner who just submitted the revenue review form and needs to know a real person will follow up
- primary keyword: owner revenue review confirmation
- secondary keywords: property management revenue review request, Seascape owner form thank you
- audience pattern: owner who completed `owner-revenue-teardown` and is waiting for the next human step without a sales pitch
- proof source: `netlify/functions/submission-created.js` confirmation send path, `docs/runbooks/owner-lead-confirmation-email.md`, and current thank-you route copy
- required internal links: /property-management/, /property-management/vacation-rental-management-fees-florida/, /property-management/maximize-vacation-rental-income-florida/
- CTA target: /property-management/
- anti-claims: do not promise a finished teardown in the confirmation email, do not claim automated sales outreach, do not invent response times other than the existing 48-hour follow-up window, do not use Mailchimp/guest SAVE50 copy for owners

## Why This Batch

- A prior owner lead went cold because capture was metrics-only plus a Netlify notification and a sleeping Mac.
- The thank-you page promised a confirmation email the site could not prove was sending from `info@seascape-vacations.com`.
- Owner confirmation must be one transactional ack from `info@`, not a drip and not founder-gated sales outreach.

## Cluster In Scope

- canonical route: `/property-management/revenue-review-requested/`
- shared surface: `owner-revenue-teardown` submit path via `submission-created`
- money destination: `/property-management/`
- active lane: owner acquisition intake truth

## Source And Proof Constraints

- property truth needed: none
- owner proof asset needed: none
- claims that are off-limits: revenue lift, booked teardown demand, automated owner-direct sales messaging

## Page Builder Tasks

- source files likely to change: `src/property-management/revenue-review-requested.njk`, `netlify/functions/submission-created.js`, `netlify/functions/_owner-lead-confirmation.js`, `netlify/functions/_owner-lead-mail.js`, `scripts/enforcement/owner-lead-confirmation.test.js`, `scripts/enforcement/owner-acquisition.test.js`, `.env.example`, `docs/runbooks/owner-lead-confirmation-email.md`
- redirect or schema work: none
- internal-link or CTA work: preserve existing confirmation-page links to the fee and income guides
- copy alignment: thank-you page and confirmation email both say a real person follows up within 48 hours and invite a reply with listing/address context

## Release Gate Checklist

- routes to smoke test: `/property-management/revenue-review-requested/`
- commands to run: `npm run lint:content`, `node --test scripts/enforcement/owner-lead-confirmation.test.js scripts/enforcement/owner-lead-contacts.test.js scripts/enforcement/owner-acquisition.test.js`
- regression risks to watch: emailing guest `email_capture` leads, sending without an email address, leaking PII into metrics or public pages, pretending Graph delivery works without Netlify env credentials

## Done When

- a completed owner-form submit with email triggers one Graph send from `info@` when credentials exist, or logs the exact missing env/grant without fake success
- Sawyer/info@ gets an internal notify path that is real once Graph is configured, with Netlify form notification and optional webhook documented as turn-on steps
- thank-you copy matches the confirmation email promise
- tests cover send on valid submit, no send without email, no send for guest forms, and no PII leak
