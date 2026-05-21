# Brief: Owner Form Placeholder Truth Sweep

Date: 2026-05-21
Status: ACTIVE

## Content Gate Inputs

- persona: owner who is comparing managers or questioning the current setup and needs the review form to feel real instead of templated
- primary keyword: owner revenue review form
- secondary keywords: vacation rental owner form, property management review request, Seascape owner evaluation form
- audience pattern: owner who is ready to submit a listing, fee quote, or contact details but loses trust when the public form shows fake example contact info
- proof source: current owner form source in `src/property-management/index.njk`, shared owner evaluation partial, and the merged contact-truth sweep that already removed guest-facing placeholder contacts
- required internal links: /property-management/vacation-rental-management-fees-florida/, /property-management/maximize-vacation-rental-income-florida/
- CTA target: /property-management/
- anti-claims: do not invent owner contact details, do not add fake listing URLs, do not widen into owner-page copy rewrites, and do not change form tracking or submission behavior

## Why This Batch

- The broader repo-wide placeholder audit after the guest contact fix showed the last obvious public placeholder residue on owner intake surfaces.
- The issue is trust and truth, not messaging expansion or form redesign.
- Guest-facing contact truth is already merged; this batch is only the owner-form residue that stayed behind.

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

- source files likely to change: `src/property-management/index.njk`, `src/_includes/partials/owner-evaluation-form.njk`, `scripts/enforcement/owner-acquisition.test.js`
- redirect or schema work: none
- internal-link or CTA work: preserve existing owner hub links and form routing exactly as-is

## Release Gate Checklist

- routes to smoke test: `/property-management/`, one owner route that renders the shared partial, and the owner benchmark route if the partial is used there
- commands to run: `npm run lint:content`, `npm run build`, `npm run test:visual`, `npm run git:merge-check`
- regression risks to watch: reintroducing fake public contact details, breaking owner form placeholders into vague unusable hints, or changing owner form tracking/submission fields

## Done When

- no public owner intake surface ships `you@example.com`, `(941) 555-1234`, or `airbnb.com/h/your-listing`
- the owner hub and shared owner form still tell owners what information to provide
- guardrail tests and release checks stay green
