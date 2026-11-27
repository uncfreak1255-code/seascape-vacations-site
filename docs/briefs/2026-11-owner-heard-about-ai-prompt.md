# Brief: Ask owners how they heard about Seascape, and which AI prompt

- lifecycle: active
- task scope: Sawyer Beckett approved this intake field in chat on 2026-11-26 at 10:12 PM ET, copying Tally's playbook (ask every lead how they found you; if AI, ask for the prompt). Optional "How did you hear about us?" on every owner-revenue-teardown form, plus a conditional optional "What did you ask it?" when the source is an AI tool. No fee, range, minimum, or partner name. Do not change the stacked phone homepage.
- completion or successor: none yet; cite the merged PR when this ships

## Content Gate Inputs

- persona: a Bradenton or Sarasota pool-home owner filling the revenue-review form
- primary keyword: none; intake fields on existing owner forms, no search target change
- secondary keywords: none
- audience pattern: owners who arrived from search, maps, an AI assistant, a referral, Airbnb or Vrbo, or social media
- proof source: current origin/main owner hub form and shared evaluation partial; Netlify form `owner-revenue-teardown`; contact store and Graph internal notify
- offer claim: unchanged; `seascape-hub/context/owner-offer.md` 48-hour one-page review
- required internal links: /property-management/, /research/owner-fee-revenue-leak-benchmark-2026/
- CTA target: /property-management/#owner-cta
- anti-claims: no management-fee percent or range; no minimum; never name the business partner; do not change other form fields or validation

## Why This Batch

- what changed in the data: Sawyer wants to learn which AI prompts send owners, by asking on the form
- why this cluster wins now: every owner lead currently arrives without a self-reported source or prompt; first-touch referrer/UTM stays separate
- what should explicitly wait: #945's earlier five-option select (superseded by this expanded list plus the prompt field); #1095 Bradenton owner page copy; phone homepage layout

## Experiment And Readback Contract

- hypothesis: none; intake instrumentation, not a ranking experiment
- primary event: existing `owner_form_submit` with optional `heard_about` and `heard_about_prompt` params
- guardrail event: owner form still submits without these fields; required name, email, and authority are unchanged
- entry criteria: Sawyer's 2026-11-26 approval
- readback window: none; no lift claim
- decision rule: ship when the fields post to Netlify, the contact store, the internal notify email, and `owner_form_submit`

## Gate 0 Search And Attack Receipt

Required because `src/property-management/index.njk` is search-facing. This is not a ranking or title/meta batch. OpenSEO, GSC, and DataForSEO were skipped: content-gate records that skip for form-label and intake instrumentation; Compound Writing was skipped for the same reason (two optional field labels).

| Field | Required answer |
| --- | --- |
| Target query family | none added; existing owner hub remains `/property-management/` for property management Bradenton Sarasota |
| Searcher intent | owner who is already sending a revenue-review request |
| Current Seascape URL | /property-management/ |
| SERP observed date | 2026-11-27 |
| SERP stale after | 2026-12-04 |
| Current proof | source audit 2026-11-27: owner-revenue-teardown forms have no self-reported source or AI-prompt field; first-touch referrer/UTM stays separate |
| Top visible competitors | iTrip Sarasota-Bradenton, Luxury Home Escapes, Gulf Coast Property Management, Beach Plus |
| Competitor angle | full-service vacation-rental management with owner inquiry forms; Seascape stays a small local operator with a property-specific review and no public fee percent |
| Visual/format gap | none copied; the new select and text field use each form's existing Waterline field class |
| Seascape gap | owner leads arrive without a self-reported source or AI prompt; no ranking gap is claimed |
| Search fit | `/property-management/` stays the owner money destination; this batch adds optional intake fields only |
| Local/GBP proof | N/A for this batch: no business-profile, category, or NAP change |
| AEO/readback note | N/A for this batch: no AI-answer readback was run; the prompt field is for leads who already arrived |
| Recommendation | ship the optional source and AI-prompt fields; make no title, meta, schema, or fee claim change |
| Attack status | completed |
| Query variants inspected | vacation rental property management Bradenton Sarasota |
| SERP source | source read 2026-11-27; OpenSEO not queried. Prior owner-hub SERP competitors reused from the 2026-11-18 findability receipt because this batch does not change search presentation |
| Competitor URLs inspected | https://www.itrip.net/property-management/sarasota-bradenton ; https://www.luxuryhomeescapes.com/vacation-rental-property-management ; https://www.choosegulfcoast.com/vacation-rentals-management ; https://beachplus.co/for-owners |
| Content gap and Seascape answer | Tally asks every lead how they found the product and, if AI, for the prompt; Seascape's answer is the same two optional fields on the existing revenue-review form, not a new page |
| Design/format strategy | match existing owner-form field styles; 16px select/prompt text so iOS does not zoom; prompt visible without JS |
| Seascape proof available | existing owner hub form, shared evaluation partial, Netlify form `owner-revenue-teardown` |
| Tools/plugins used | source read of owner forms and Netlify contact/email helpers; SERP not re-queried (intake fields, not a measured SEO batch); competitor pages listed from the 2026-11-18 owner-hub receipt; OpenSEO skipped; Compound Writing skipped |
| Decision and reason | Proceed: Sawyer approved this intake scope on 2026-11-26; no new search-facing claim |

## Cluster In Scope

- canonical winner URL(s): /property-management/
- feeder pages: generated owner landers from `property-management.njk`
- aliases or retired URLs: none
- money destination: /property-management/#owner-cta
- active lane: owner acquisition

## Source And Proof Constraints

- property truth needed: none
- owner proof asset needed: none
- claims that are off-limits: any management-fee percent or range; any minimum; naming the business partner
- Seascape-specific proof this page can add: none; this batch only asks how the owner found Seascape

## Page Builder Tasks

- source files changed in this batch:
  - `src/property-management/index.njk`
  - `src/_includes/partials/owner-evaluation-form.njk`
  - `src/_includes/partials/owner-heard-about-field.njk`
  - `src/_includes/partials/owner-form-source-fields.njk`
  - `src/assets/js/owner-heard-about.js`
  - `netlify/functions/_owner-lead-contacts.js`
  - `netlify/functions/_owner-lead-confirmation.js`
- redirect or schema work: none
- internal-link or CTA work: none added
- money CTA and downstream tracking event to verify: `owner_form_submit` with optional `heard_about` and `heard_about_prompt`
