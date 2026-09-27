# Brief: Owner excluded-claim sweep

## Content Gate Inputs

- persona: Florida Gulf Coast vacation-rental owner comparing managers who will judge Seascape by whether its owner pages match what the team says on the phone.
- primary keyword: vacation rental management Florida
- secondary keywords: Siesta Key vacation rental management, Longboat Key vacation rental management, condo rental management Florida, vacation rental pricing strategy, increase vacation rental bookings, Vrbo management services Florida
- audience pattern: skeptical owner who has seen inflated manager promises and needs plain statements of what Seascape does, with no performance numbers Seascape cannot back.
- proof source: `seascape-hub/context/owner-offer.md` sections 2 and 7 (compiled 2026-09-17, stale-after 2026-12-17), its "Open remediation (found 2026-09-17)" note naming this sweep, and `src/_data/ownerProofAssets.json`.
- offer claim: owner-offer.md section 7, "Approved for public copy: property-specific pricing after a review; the 48-hour revenue review and exactly what comes back ... local, owner-operated, the named team"; each rewritten passage lands that line and the section 7 exclusions.
- required internal links: /property-management/, /property-management/vacation-rental-management-fees-florida/
- CTA target: preserve the existing owner revenue-review CTA and form path on every affected page.
- anti-claims: no revenue, booking, or occupancy figure or percentage lift; no response-time number; no passive-income or hands-off promise; no manager-experience claim on Longboat Key, Siesta Key, condos, or property sales that Seascape does not have; no brokerage or sale-facilitation claim; no fixed Seascape fee; no software or vendor name; published third-party terms (Airbnb's 15.5%, Airbnb Superhost criteria, Stripe's 2.9% + 30 cents) may stay.
- hypothesis: removing excluded claims keeps owner trust intact without changing routes, metadata, or CTAs.
- primary event: `owner_form_submit`
- guardrail event: `owner_primary_cta_click`
- entry criteria: owner-offer.md open remediation dated 2026-09-17 lists roughly thirty-five excluded performance claims still live on owner landers.
- readback window: 48 hours after production deployment
- decision rule: keep the corrected copy if owner CTA clicks and form submits keep firing; reopen a number only when the negative-proof register clears it.

## Gate 0 Search Block — owner excluded-claim sweep

| Field | Answer |
| --- | --- |
| Target query family | Existing Florida owner-management lander queries: Siesta Key, Longboat Key, condo, pricing strategy, increase bookings, Vrbo, new owner, selling a rental |
| Searcher intent | owners researching management; they need accurate statements of scope, not inflated lift numbers |
| Current Seascape URL | `/property-management/vacation-rental-management-siesta-key/`, `/property-management/vacation-rental-management-longboat-key/`, `/property-management/condo-rental-management-florida/`, `/property-management/new-vacation-rental-owner-guide-florida/`, `/property-management/increase-vacation-rental-bookings/`, `/property-management/vacation-rental-pricing-strategy/`, `/property-management/vrbo-management-services-florida/`, `/property-management/airbnb-management-services-sarasota/`, `/property-management/sell-vacation-rental-property-florida/` |
| SERP observed date | 2026-09-26 |
| SERP stale after | 2026-10-26 |
| Current proof | owner-offer.md open remediation note dated 2026-09-17; `next-batch.md` run 2026-09-13 reads owner_money at 0 clicks, so no ranking is at stake in this correction |
| Top visible competitors | None recorded; this is a source-truth correction, not competitor-led expansion |
| Competitor angle | Not used; no competitor claim or comparison is published |
| Visual/format gap | Not applicable; layouts, headings, FAQs count, and CTAs stay as they are |
| Seascape gap | Owner landers promise occupancy targets, percentage income lifts, response times, passive income, and experience Seascape does not have |
| Search fit | Keep each existing URL and its FAQ answer structure while replacing unsupported claims with what Seascape actually does |
| Local/GBP proof | Not applicable because no local-profile or map-pack content changes; routes and NAP stay untouched |
| AEO/readback note | FAQ answers still open with a direct answer so they remain quotable; verify live copy after deploy |
| Recommendation | consolidate: rewrite the offending intro and FAQ passages in place and add a regression test so the excluded claims cannot return |
| Attack status | none found after named checks |
| Query variants inspected | Siesta Key vacation rental management; condo rental management Florida; vacation rental pricing strategy |
| SERP source | No live competitor SERP receipt was used; source: repository inventory against owner-offer.md |
| Competitor URLs inspected | source: repository source inventory; SERP: no competitor SERP evidence; competitor-page: not applicable because no competitor claim is used |
| Content gap and Seascape answer | Replace figures and promises with scope Seascape can show: property-by-property rates, local team, proactive owner updates, and the 48-hour one-page review |
| Design/format strategy | Text-only change inside existing `geoIntro` and FAQ fields; no new sections or pages |
| Seascape proof available | owner-offer.md sections 2 and 7; build and test receipts from this branch |
| Tools/plugins used | Repository content-voice test, content lint, build, and release validators |
| Decision and reason | Ship the narrow correction after release gates pass; owner copy that overpromises costs trust on the first call |

## Page Builder Tasks

- source files likely to change:
  - `src/_data/seoPages.json`
  - `scripts/enforcement/content-voice.test.js`
  - this brief
- redirect or schema work: none.
- internal-link or CTA work: none.

## Voice Editor Checklist

- tone risks: sounding defensive about what Seascape will not promise; drifting into `the owner` instead of `you/your`.
- generic patterns to kill: percentage lift claims, occupancy targets, response-time promises, `passive income`, `extensive experience`, `optimal returns`.
- proof checks: every rewritten sentence traces to owner-offer.md sections 2 or 7.

## Release Gate Checklist

- routes to smoke test: the nine owner pages listed above.
- commands to run: `node --test scripts/enforcement/content-voice.test.js`, `npm run lint:content`, `npm run build`, `npm run verify:release`.

## Done When

- the owner seo page data test reports no excluded performance claim.
- the nine pages keep the same routes, metadata, FAQ count, and CTA path.
