# Brief: Owner Form Placeholder Truth Sweep

Date: 2026-05-21
Status: ACTIVE

## Content Gate Inputs

- persona: owner who is comparing managers or questioning the current setup and needs the review form to feel real instead of templated
- primary keyword: owner revenue review form
- secondary keywords: vacation rental owner form, property management review request, Seascape owner evaluation form
- audience pattern: owner who is ready to send a listing link or address plus what feels off, but loses trust when the public form feels fake, vague, or forces manual clarification later
- proof source: current owner form source in `src/property-management/index.njk`, the shared owner evaluation partial, David's May 21 `Sarasota property` follow-up, and the fresh `New Seascape owner revenue review (18)` notification payload
- required internal links: /property-management/vacation-rental-management-fees-florida/, /property-management/maximize-vacation-rental-income-florida/
- CTA target: /property-management/
- anti-claims: do not invent owner contact details, do not add fake listing URLs, do not widen into broad owner-page rewrites, and do not change form destinations or add new tracking events beyond removing duplicate postcard submit noise

## Why This Batch

- The broader repo-wide placeholder audit after the guest contact fix showed the last obvious public placeholder residue on owner intake surfaces.
- Pat Reilley's Sarasota follow-up showed the first capture still missed the two inputs David had to ask for manually: the listing link or address, and what felt off.
- The fresh `New Seascape owner revenue review (18)` payload showed the owner field-report postcard was still mirroring the street address into `Listing Url`, which pollutes the submission email and staged receipt.
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

- source files likely to change: `src/property-management/index.njk`, `src/property-management/property-management.njk`, `src/_includes/partials/owner-evaluation-form.njk`, `src/_data/seoPages.json`, `src/assets/js/conversion-tracking.js`, and `scripts/enforcement/owner-acquisition.test.js`
- redirect or schema work: none
- internal-link or CTA work: preserve existing owner hub links and form routing exactly as-is

## Release Gate Checklist

- routes to smoke test: `/property-management/`, one owner route that renders the shared partial, and the owner benchmark route if the partial is used there
- commands to run: `npm run lint:content`, `node --test scripts/enforcement/owner-acquisition.test.js`, `node --test scripts/enforcement/owner-lead-receipts.test.js`, `npm run build`, `npm run git:merge-check`
- regression risks to watch: reintroducing fake public contact details, weakening the first-pass asks back into vague hints, or letting the owner field-report postcard submit two analytics events or a duplicate `listing_url` value

## Done When

- no public owner intake surface ships fake contact or listing placeholders
- the owner hub and shared owner form ask for the listing link or address plus what feels off in plain owner language
- the owner field-report postcard no longer mirrors `property_address` into `listing_url`, and the postcard path records one `owner_form_submit`
- guardrail tests and release checks stay green
