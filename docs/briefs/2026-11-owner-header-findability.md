# Brief: Owner header findability

- lifecycle: active
- task scope: Sawyer, 2026-11-17 8:45 PM ET: keep the Airbnb-style stacked phone homepage of all eight `.g-postcard` cards from #965, and make owner info easy to find. Phone header `Owners` text link to `/property-management/` on every guest page (not duplicated next to Revenue Review on owner pages); move the existing slim homepage `FOR PROPERTY OWNERS` band to sit after the eight cards and `Compare our homes`; 301 `/owners/`, `/owner/`, and `/list-your-property/` to `/property-management/`; fix `Why a eight-home operator` to `Why an eight-home operator`. No new owner offer, fee, or ranking claim.
- completion or successor: none yet; cite the merged PR when this ships

## Content Gate Inputs

- persona: a Bradenton or Sarasota pool-home owner on a phone who wants Seascape's owner page without opening Menu or scrolling past guest signup
- primary keyword: none; findability and grammar repair on existing routes, no search target change
- secondary keywords: none; no search expansion
- audience pattern: owners guess `/owners/`, `/owner/`, or `/list-your-property/` or look for an Owners control in the phone header; guests should still see all eight homes first
- proof source: current origin/main phone homepage (stacked eight `.g-postcard` cards from #965); live `/owners/`, `/owner/`, and `/list-your-property/` 404; `/property-management/` is the only owner hub; source heading `Why a {{ homeCountWord }}-home operator` on `src/property-management/index.njk`
- offer claim: `seascape-hub/context/owner-offer.md` sections 4 and 7: free 48-hour one-page revenue review; this batch does not rewrite that offer
- required internal links: /properties/, /property-management/
- CTA target: `/property-management/` and `/property-management/#owner-cta` (existing revenue-review form)
- anti-claims: no management-fee percent or range; no new income, occupancy, savings, or response-time claim; do not restore the phone focused deck; do not invent amenities

## Why This Batch

- what changed in the data: nothing measured; Sawyer asked for owner findability while keeping the stacked phone homepage
- why this cluster wins now: owners cannot see a header path on a 390px phone, the homepage owner band sits below guides/reviews/signup, guessed URLs 404, and the hub heading uses the wrong article
- what should explicitly wait: title/meta/schema rewrites, new owner pages, fee disclosure, any restoration of the focused phone deck, and measured SEO expansion (`docs/status/next-batch.md`)

## Experiment And Readback Contract

- hypothesis: none; findability and grammar repair, not a growth experiment
- primary event: existing `owner_primary_cta_click` from `data-placement="guest_header_owners"` and the homepage owner band; no new event name
- guardrail event: `tests/visual/home-focused-deck.spec.js` still proves eight stacked phone cards with deck controls hidden
- entry criteria: Sawyer's 2026-11-17 request is the approved scope
- readback window: none; no lift claim will be made
- decision rule: ship when the release gate passes, the phone stacked list is intact, and `/owners/`, `/owner/`, `/list-your-property/` 301 to `/property-management/`

## Gate 0 Search And Attack Receipt

Required because `src/index.njk` and `src/property-management/index.njk` are search-facing. This is not a ranking or title/meta batch. OpenSEO, GSC, and DataForSEO were skipped: content-gate records that skip for typo fixes and layout-only work; Compound Writing was skipped for the same reason (one article change plus a moved unchanged band).

| Field | Required answer |
| --- | --- |
| Target query family | none added; existing owner hub remains `/property-management/` for property management Bradenton Sarasota |
| Searcher intent | owner who wants Seascape's property-management page from a phone or a guessed URL |
| Current Seascape URL | /property-management/ |
| SERP observed date | 2026-11-18 |
| SERP stale after | 2026-11-25 |
| Current proof | source audit 2026-11-18: phone header has logo, phone button, Menu; Property owners is last in the menu; homepage owner band is below guides/reviews/signup; `/owners/`, `/owner/`, `/list-your-property/` 404; heading uses `Why a eight-home operator` |
| Top visible competitors | iTrip Sarasota-Bradenton, Luxury Home Escapes, Gulf Coast Property Management, Beach Plus |
| Competitor angle | full-service vacation-rental management with city photos, portals, and (on some sites) a published fee percent; Seascape stays a small local operator with a property-specific review and no public fee percent |
| Visual/format gap | none copied; phone header `Owners` matches existing 13px Menu type; homepage band copy is unchanged |
| Seascape gap | owners cannot reach `/property-management/` from the phone header without Menu, guessed URLs 404, and the hub heading has a grammar error; no ranking gap is claimed |
| Search fit | `/property-management/` stays the owner money destination; this batch adds aliases and a header path only |
| Local/GBP proof | N/A for this batch: no business-profile, category, or NAP change; phone number on the header is unchanged |
| AEO/readback note | N/A for this batch: no AI-answer readback was run; the grammar fix is so assistants quoting the hub do not repeat "Why a eight-home operator" |
| Recommendation | ship findability, aliases, and the article fix; make no title, meta, schema, or fee claim change |
| Attack status | completed |
| Query variants inspected | vacation rental property management Bradenton Sarasota |
| SERP source | Cursor WebSearch, observed 2026-11-18; OpenSEO not queried |
| Competitor URLs inspected | https://www.itrip.net/property-management/sarasota-bradenton ; https://www.luxuryhomeescapes.com/vacation-rental-property-management ; https://www.choosegulfcoast.com/vacation-rentals-management ; https://beachplus.co/for-owners |
| Content gap and Seascape answer | competitors publish owner landers at obvious URLs; Seascape's answer is `/property-management/` plus 301s from guessed paths, not a new page |
| Design/format strategy | keep #965 stacked phone cards; compact `Owners` text link next to Menu; existing slim owner band moved, not rewritten |
| Seascape proof available | existing owner hub, existing homepage owner band copy, catalog size via `homeOperator` |
| Tools/plugins used | source read, WebSearch on 2026-11-18; OpenSEO skipped (typo and navigation, not a measured SEO batch); Compound Writing skipped (same reason) |
| Decision and reason | Proceed: Sawyer approved this findability scope; no new search-facing claim |

## Cluster In Scope

- canonical winner URL(s): /property-management/
- feeder pages: / (homepage owner band and phone header)
- aliases or retired URLs: /owners/, /owner/, /list-your-property/ (301 to the hub)
- money destination: /property-management/#owner-cta
- active lane: owner acquisition

## Source And Proof Constraints

- property truth needed: none new; home count stays derived from the catalog
- owner proof asset needed: none
- claims that are off-limits: any management-fee percent or range; any new savings, occupancy, or income figure
- Seascape-specific proof this page can add: none; this batch only makes the existing hub reachable

## Page Builder Tasks

- source files changed in this batch:
  - `src/_includes/partials/guest-header.njk`
  - `src/css/guest.css`
  - `src/index.njk`
  - `src/css/trip-sheet.css`
  - `src/property-management/index.njk`
  - `scripts/redirects/owner-aliases`
  - `eleventy.config.js`
- redirect or schema work: 301 `/owners/`, `/owner/`, `/list-your-property/` (and slashless twins) to `/property-management/`; no schema change
- internal-link or CTA work: phone header `Owners` and existing homepage band both keep `owner_primary_cta_click`
- money CTA and downstream tracking event to verify: `/property-management/#owner-cta`

## Voice Editor Checklist

- tone risks: none; no new sentences except the header label `Owners` and `an` in the hub heading
- generic or mechanical patterns to kill: none introduced
- proof or specificity checks: heading uses `homeOperator` so the article follows the catalog size; no fee percent
- customer wording kept where it sounds natural: homepage owner band copy is unchanged

## Release Gate Checklist

- routes to smoke test: `/` phone 390 stacked eight cards; `/properties/` phone header; `/property-management/` Revenue Review without duplicate Owners; `/owners/`, `/owner/`, `/list-your-property/` 301
- commands to run: `npm run check:brief -- docs/briefs/2026-11-owner-header-findability.md`, `npm run lint:content`, `npm run verify:release -- --range origin/main`, `npx playwright test tests/visual/home-focused-deck.spec.js`, `npm run test:visual` if phone `home.png` diffs
- regression risks to watch: restoring the focused phone deck; crowding the phone button; duplicating Owners next to Revenue Review; growing oversized `src/css/guest.css` or `src/_redirects`

## Done When

- phone header shows compact `Owners` next to Menu on guest pages and not on `/property-management/`
- homepage owner band sits after the eight cards and Compare our homes, before guides, reviews, and guest signup
- guessed owner URLs 301 to `/property-management/`
- hub heading reads `Why an eight-home operator` (derived)
- `tests/visual/home-focused-deck.spec.js` still passes unchanged

## Post-Reread Outcome

- reread window used: none; no lift claim
- crawl freshness result: not tracked for this repair
- actual impressions, CTR, position, and downstream event counts: not applicable
- decision taken: ship findability; wait on measured owner SEO expansion
- next branch slug or explicit wait state: this branch `cursor/owner-header-findability-f66e`

## Not In Scope

- restoring the phone focused deck or its controls
- any management-fee percent or range
- title, meta, schema, or new owner landers
- production-branch or early Netlify publish
