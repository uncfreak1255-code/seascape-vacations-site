# Brief: Owner Form "How Did You Hear About Us?" Field

- lifecycle: active
- task scope: add one optional, self-reported "How did you hear about us?" select to both owner form UIs (`/property-management/` stepped form and the shared `src/_includes/partials/owner-evaluation-form.njk`), store the allowlisted answer with the owner lead contact, and show it in the internal notify email
- completion or successor: record the merged source proof on the PR; no successor planned

## Content Gate Inputs

- persona: property owner already filling in the owner review form who is willing to say how they found Seascape
- primary keyword: owner review form
- secondary keywords: how did you hear about us, vacation rental owner inquiry, Seascape owner form
- audience pattern: owner partway through the form; the question must be clearly optional, take one tap, and never block submission
- proof source: current owner form source in `src/property-management/index.njk` and `src/_includes/partials/owner-evaluation-form.njk`; owner lead capture in `netlify/functions/_owner-lead-contacts.js`; existing first-touch capture in `netlify/functions/_owner-first-touch.js`
- offer claim: none new; the form stays the entry to the 48-hour revenue review in seascape-hub/context/owner-offer.md section 7 ("the 48-hour revenue review and exactly what comes back")
- required internal links: /property-management/maximize-vacation-rental-income-florida/, /property-management/switch-vacation-rental-management-company/
- CTA target: /property-management/
- anti-claims: no new offer, fee, response-time or proof claim; do not treat the self-reported answer as marketing attribution or as a substitute for first-touch `referrer`/UTM evidence; no new tracking event; the field is never required

## Why This Batch

- Owner leads can arrive after an AI assistant answer, and the first-touch referrer often cannot show that (AI apps and copied links arrive with no referrer). A self-reported answer is the cheapest way to see it.
- Kept separate from first-touch evidence: `Came from` in the owner tracker still maps only original referrer/UTM evidence.
- What waits: any tracker column, dashboard, or reporting on the answer.

## Cluster In Scope

- canonical route: `/property-management/`
- shared surface: owner evaluation form partial on owner acquisition pages
- money destination: `/property-management/`
- active lane: owner acquisition

## Source And Proof Constraints

- property truth needed: none
- owner proof asset needed: none
- claims that are off-limits: any claim beyond the question and its five answers

## Page Builder Tasks

- source files likely to change: `src/_includes/partials/owner-heard-about-field.njk` (new), `src/_includes/partials/owner-evaluation-form.njk`, `src/property-management/index.njk`, `src/css/owner.css`, `src/css/owner-lander.css`, `netlify/functions/_owner-lead-contacts.js`, `netlify/functions/_owner-lead-confirmation.js`
- `src/property-management/index.njk` is over the staged file-size limit and may not grow, so its unchanged band image moves into `src/_includes/partials/owner-band-image.njk`
- redirect or schema work: none
- internal-link or CTA work: none; submit wiring and `owner_form_submit` tracking unchanged

## Release Gate Checklist

- routes to smoke test: `/property-management/` and one owner route rendering the shared partial
- commands to run: `node --test scripts/enforcement/owner-heard-about.test.js`, `npm run lint:content`, `npm run build`, `npm test`
- regression risks to watch: the field becoming required, an unknown value rejecting a lead, select styling drifting from Waterline fields

## Done When

- both owner forms show the optional select with: ChatGPT or another AI assistant, Google search, Airbnb or Vrbo, a referral, Other
- an empty, missing or tampered value stores "" and the lead is still captured
- the internal notify email shows the answer or "(none)"

## Not In Scope

- owner tracker columns, Ops/HQ display, or analytics reporting on the answer
- changing first-touch attribution or the `Came from` mapping
- PR #937's owner inquiry copy and photo proof work
