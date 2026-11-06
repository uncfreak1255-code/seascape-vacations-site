# Owner hero Option A polish (prototype)

- lifecycle: draft
- approved scope: Sawyer approved a polished Option A owner hero on 2026-11-06 for review only; this is a deploy-preview prototype, not an approved publication. It must not merge without his selection.
- persona: Bradenton or Sarasota pool-home owner who wants to know what their home earned and what needs attention
- primary keyword: property management Bradenton Sarasota
- secondary keywords: vacation rental management Sarasota, revenue review
- audience pattern: owner who wants one field and one action before reading anything
- proof source: seascape-hub/context/owner-offer.md section 4 and 7; src/_data/properties-fallback.json (The Oasis photograph and name)
- offer claim: context/owner-offer.md sections 4 and 7: free 48-hour one-page revenue review
- required internal links: /about-us/, /property-management/
- CTA target: #owner-cta on /property-management/
- anti-claims: no income, savings, occupancy or response-time claim; no new proof claim; the photograph is of a home Seascape manages and is captioned with its real name
- hypothesis: a photographic opening with one labelled field and one button lowers the effort of the first owner action
- primary event: owner_form_start
- guardrail event: owner_primary_cta_click is no longer fired by the hero link (removed in this prototype); the header Revenue Review link still jumps to #owner-cta. Check its consumer before any publication.
- entry criteria: Sawyer picks this direction from the deploy preview
- readback window: none until selected and published
- decision rule: do not merge; Sawyer selects or rejects from the preview
- Source files changed in this batch:
  - `src/property-management/index.njk`
  - `src/_includes/partials/owner-hero-photo.njk`
  - `src/css/owner.css`

## Gate 0 — none: presentation prototype

No title, meta, schema, redirect or sitemap change, and no new search-facing claim.
No SERP or competitor research was run for this batch; none is claimed.

## Copy and review contract

Hero copy is shortened to a label, the existing headline, one sentence taken from the existing lede, and one field. The visible label under the field repeats the existing field name "Listing link or street address". The owner statement upload moves to step 2 and the "Skip" link is removed; every form field, endpoint and tracking attribute is otherwise unchanged. Not in scope: any other page, DESIGN.md changes, or publication.
