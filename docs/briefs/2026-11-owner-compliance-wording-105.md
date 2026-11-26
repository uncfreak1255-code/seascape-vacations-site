# Brief: Florida new-owner guide and condo page without a compliance promise (2026-11-26)

- lifecycle: completed — source change finished in this PR (agent-issues #105). Finishing the source change does not prove it is live.
- task scope: owner entries in `src/_data/seoPages.json`, and nothing else on them:
  - `new-vacation-rental-owner-guide-florida`: the answer to "What permits and licenses do I need to operate a vacation rental in Florida?"
  - `condo-rental-management-florida`: the meta description; the first benefit; the answer to "What are the typical restrictions Florida HOAs place on short-term rentals?"; and one sentence removed from the answer to "How should I handle property damage or noise complaints from other condo residents?"
  - The guard in `scripts/enforcement/owner-compliance-claims.test.js` loses its pending exemptions and gains an "HOA compliance" pattern.
  - No question, title, H1, link, CTA, layout or tracking change.
- completion or successor: this PR completes the follow-up from `docs/briefs/2026-11-owner-compliance-wording.md` (agent-issues #102).

## Approval

Legal wording is Sawyer's call (AGENTS.md, Business Priorities). He answered agent-issues #105 in Claude Code session chat on 2026-11-26: "option 1, which applies all the proposed fixes." That covers:

- the three changes in the issue body;
- the condo benefit and description wording proposed in the issue's follow-up comment.

The shipped text matches the proposals word for word.

## Content Gate Inputs

- persona: a Florida owner who is new to renting, or a condo owner comparing managers, who needs to know what has to be checked before listing and who decides it
- primary keyword: condo rental management florida; new vacation rental owner florida
- secondary keywords: florida hoa short term rental rules; florida vacation rental license
- audience pattern: an owner reads the permits or HOA answer to judge whether the manager is honest about who decides
- proof source: `seascape-hub` `origin/main` a2a4adf2 `context/owner-offer.md` section 7 (the one-page review); the separate-checks answer already on `origin/main` in `vacation-rental-licensing-florida` (DBPR license, tax registration, adopted local rules, HOA restrictions)
- offer claim: `seascape-hub/context/owner-offer.md` section 7, the free one-page review of the listing or statement the owner sends (what looks right, what deserves a second look, what Seascape would check next)
- required internal links: /property-management/, /property-management/vacation-rental-licensing-florida/
- CTA target: the existing owner evaluation form on each page. Labels, hrefs, fields and tracking are unchanged
- anti-claims:
  - no promise of legal, HOA or regulatory compliance;
  - no HOA compliance offered as a service;
  - no unsourced rental-length figure;
  - no track-record or reputation claim;
  - no legal advice;
  - no review count, response time, revenue or occupancy figure

## Why This Batch

- What changed: the guard added in PR #1078 found these live promises:
  - "handles all licensing and regulatory requirements, ensuring your property operates in full legal compliance";
  - "positions your rental to comply fully";
  - "HOA compliance" listed as a service;
  - an unbacked "track record with HOA compliance".

  Owner-offer has no compliance service claim.
- Why now: Sawyer ruled on #105, and owner growth sends owners to these pages.
- What should wait: the guide's "helped hundreds of new vacation rental owners" claim and the condo page's "respond immediately to complaints". Both are unbacked, and both are noted as follow-ups outside this ruling.

## Experiment And Readback Contract

- hypothesis: this is a claim fix. No ranking or lead lift is forecast. The condo description change is tracked so that any harm is caught.
- primary event: `owner_primary_cta_click` on the two routes
- guardrail event: owner evaluation form submits on the two routes
- entry criteria: `owner-compliance-claims.test.js` green; voice pass approved; `npm run verify:release` green
- readback window: the condo route has an entry in `docs/status/page-ledger.json` pages, with verdict due 2026-12-28 and a baseline of 0 clicks, 44 impressions and position 11.3 for 2026-08-23 to 11-23. The guide change has a `liveChecks` fact-fix entry.
- decision rule:
  - revert only the condo description wording, and only if impressions fall 30% or more while the site does not, or if "vacation property management in sarasota fl" drops 5 or more positions;
  - never restore a compliance promise;
  - otherwise keep.

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | "condo rental management florida", "florida vacation rental license", "new vacation rental owner florida" |
| Searcher intent | Commercial: an owner choosing a manager or learning what launch needs |
| Current Seascape URL | `/property-management/condo-rental-management-florida/`, `/property-management/new-vacation-rental-owner-guide-florida/` |
| SERP observed date | 2026-11-26 |
| SERP stale after | 2026-12-03 |
| Current proof | Search Console for the condo page, 2026-08-23 to 11-23: 0 clicks, 44 impressions, position 11.3. The top query is "vacation property management in sarasota fl" (15 impressions, position 5.9). No owner lead is attributed to either page |
| Top visible competitors | Not read for this batch |
| Competitor angle | Not read for this batch |
| Visual/format gap | None. The change is limited to text in existing fields |
| Seascape gap | Claim truth: the pages promised compliance and offered it as a service, which Seascape does not provide |
| Search fit | Existing pages corrected in place; not an expansion branch |
| Local/GBP proof | Not touched |
| AEO/readback note | An assistant quoting either page now repeats the separate checks and "your association decides", not a compliance guarantee |
| Recommendation | Apply Sawyer's #105 ruling; drop the guard's pending exemptions |
| Attack status | none found after named checks |
| Query variants inspected | Search Console condo-page query rows (OpenSEO results `6d192cfa-bde9-4f0a-92d3-d08e2c928a9b`, `e3a3593c-7be9-4c5e-b0a6-88c90b8ec3e9`) |
| SERP source | No paid SERP lookup, under the `docs/process/openseo.md` Cost Boundary. This is a claim fix; the one description change swaps a single phrase and keeps the page's terms. Observed 2026-11-26 from Search Console. |
| Competitor URLs inspected | Named checks: current source (hub `context/owner-offer.md`; Site `origin/main` 1286a95f owner entries). SERP check skipped under the Cost Boundary; the Search Console rows above are used instead. Competitor pages were not fetched, because the decision rests on Seascape's own offer |
| Content gap and Seascape answer | The pages promised compliance. The new copy names what associations and agencies decide, sends the owner to them for the final word, and offers the one-page review |
| Design/format strategy | No layout, template or CSS change |
| Seascape proof available | The owner-offer section 7 review; the licensing page's separate-checks answer |
| Tools/plugins used | OpenSEO Search Console read (free); Hub and Site source reads |
| Decision and reason | Ship Sawyer's ruling as proposed. It removes the live promises and can be undone with a plain revert |

## Draft copy rules

- Every service claim maps to owner-offer section 7.
- The association or agency has the final word. Seascape reads and asks; it never rules.
- Compound Writing (`cw-draft`, `cw-line-edit`) is not installed in this session. Sawyer approved the text as proposed in #105, and the independent Voice Editor pass below reviewed it.

## Source Files Changed In This Batch

- `src/_data/seoPages.json` (the five strings named in task scope)
- `scripts/enforcement/owner-compliance-claims.test.js` (pending exemptions removed; "HOA compliance" pattern added)
- `docs/status/page-ledger.json` (a condo route entry and a guide liveChecks entry)

## Boundary Proof

The check comes from a source other than the new copy: `scripts/enforcement/owner-compliance-claims.test.js`, whose patterns are written from the replaced wording and owner-offer. Observed on 2026-11-26 against the `origin/main` 1286a95f copy, it fails with seven violations:

- Condo page: "comply fully", "HOA compliance" (twice) and "HOA rules compliance".
- Guide: "full legal compliance", "ensuring your property operates in full legal compliance" and "handles all licensing".

Against the shipped copy it reports none.

## Voice and specificity pass

Pending: the independent Voice Editor pass on the shipped strings.
