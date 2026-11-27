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
- required internal links: none added
- CTA target: existing `/property-management/` and generated owner-lander review forms
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

Skipped: form-label copy on existing owner routes, not a title/meta or ranking batch. OpenSEO, GSC, and DataForSEO were not used. Compound Writing was skipped (field labels only).

| Field | Required answer |
| --- | --- |
| Target query family | none added |
| Searcher intent | owner-management, unchanged |
| Current Seascape URL | `/property-management/` and generated `/property-management/*` landers |
| Current proof | no self-reported source on owner submits today |
| Competitor / SERP gap | Tally asks every lead how they found the product and, if AI, for the prompt |
| Decision | add the optional fields; keep conversion-safe (not required) |
