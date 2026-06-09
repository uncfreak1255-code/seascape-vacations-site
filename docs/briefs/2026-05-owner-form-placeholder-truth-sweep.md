# Brief: Owner Form Placeholder Truth Sweep

Date: 2026-05-21
Status: ACTIVE

## Content Gate Inputs

- persona: owner who is comparing managers or questioning the current setup and needs the review form to feel real instead of templated
- primary keyword: owner revenue teardown form
- secondary keywords: vacation rental owner form, property management teardown request, Seascape owner evaluation form
- audience pattern: owner who is ready to send a listing link or address plus what feels off, but loses trust when the public form feels fake, vague, or forces manual clarification later
- proof source: current owner form source in `src/property-management/index.njk`, the shared owner evaluation partial, David's May 21 `Sarasota property` follow-up, and the fresh May 21 Sarasota owner review lead notification payload
- required internal links: /property-management/vacation-rental-management-fees-florida/, /property-management/maximize-vacation-rental-income-florida/
- CTA target: /property-management/
- anti-claims: do not invent owner contact details, do not add fake listing URLs, do not widen into broad owner-page rewrites, do not add new tracking events, and do not claim the submit path proves booked teardown demand

## Why This Batch

- The broader repo-wide placeholder audit after the guest contact fix showed the last obvious public placeholder residue on owner intake surfaces.
- Pat Reilley's Sarasota follow-up showed the first capture still missed the two inputs David had to ask for manually: the listing link or address, and what felt off.
- The fresh May 21 Sarasota owner review lead showed the owner follow-through still needed the listing/address plus a short reason in plain language before the review could be useful.
- The issue is owner-intake truth and payload clarity, not a new form design or a wider owner-page rewrite.

## Cluster In Scope

- canonical route: `/property-management/`
- shared surface: owner evaluation form partial reused across owner acquisition pages
- money destination: `/property-management/`
- active lane: owner acquisition

## Source And Proof Constraints

- property truth needed: none beyond current owner form field purposes
- owner proof asset needed: none
- claims that are off-limits: any new response-time promise, new fee claim, or new owner proof language outside the existing form copy

## Page Builder Tasks

- source files likely to change: `src/property-management/index.njk`, `src/property-management/revenue-review-requested.njk`, `src/property-management/property-management.njk`, `src/_includes/partials/owner-evaluation-form.njk`, `src/_data/seoPages.json`, `src/assets/js/conversion-tracking.js`, and `scripts/enforcement/owner-acquisition.test.js`
- redirect or schema work: none
- internal-link or CTA work: preserve existing owner hub links, keep owner submit tracking unchanged, and route successful form posts to the owner-specific teardown confirmation page
- follow-up email handoff mirror: the owner CTA and confirmation copy should keep the same ask as the live follow-up email, namely a listing link or address plus a short note on what feels off, without adding a sales-call frame, reverting to `review` labels, or adding a new offer

## Release Gate Checklist

- routes to smoke test: `/property-management/`, `/property-management/revenue-review-requested/`, one owner route that renders the shared partial, and the owner benchmark route if the partial is used there
- commands to run: `npm run lint:content`, `node --test scripts/enforcement/owner-acquisition.test.js`, `node --test scripts/enforcement/owner-lead-receipts.test.js`, `npm run build`, `npm run git:merge-check`
- regression risks to watch: reintroducing fake public contact details, weakening the first-pass asks back into vague hints, or letting the owner field-report postcard submit two analytics events or a duplicate `listing_url` value

## Done When

- no public owner intake surface ships fake contact or listing placeholders
- the owner hub and shared owner form ask for the listing link or address plus what feels off in plain owner language
- the owner field-report postcard records one `owner_form_submit`
- the owner post-submit route tells qualified owners to send a listing link or address plus one sentence on what feels off, without upgrading submit wiring into demand proof or reverting to generic review-request copy
- guardrail tests and release checks stay green
