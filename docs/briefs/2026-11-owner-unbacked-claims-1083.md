# Brief: unbacked claims removed from the Florida new-owner guide and condo page (2026-11-25)

- lifecycle: completed — source change finished in this PR (site issue #1083). Finishing the source change does not prove it is live.
- task scope: owner entries in `src/_data/seoPages.json`, and nothing else on them:
  - `new-vacation-rental-owner-guide-florida` geoIntro: remove the "helped hundreds … from day one" sentence and the "ensuring … the returns you anticipated" clause.
  - `condo-rental-management-florida`: remove "We specialize in condo management." from the intro; "respond immediately to complaints" becomes "respond to complaints"; remove "ensures guests understand and comply with HOA rules" from the guest-communication answer; fix the "professional betters" typo to "professional cleaners".
  - The guard in `scripts/enforcement/owner-compliance-claims.test.js` also catches "ensures … comply".
  - No title, meta description, H1, question, link, CTA, layout or tracking change.
- completion or successor: this PR completes #1083, the follow-up named in `docs/briefs/2026-11-owner-compliance-wording-105.md`.

## Approval

Removing unbacked claims from existing owner pages falls under the standing SEO authority (AGENTS.md, Business Priorities). The one compliance-adjacent string is removed rather than reworded, as proposed to Sawyer in Claude Code session chat on 2026-11-25. He answered "yes, do all three in that order".

## Content Gate Inputs

- persona: a Florida owner new to renting, or a condo owner comparing managers, reading for what Seascape actually does
- primary keyword: new vacation rental owner florida; condo rental management florida
- secondary keywords: florida condo vacation rental management; hoa short term rental rules florida
- audience pattern: an owner checks whether the manager's claims hold up before sending a listing
- proof source: `seascape-hub` `origin/main` `context/owner-offer.md`. It has no client count, income or returns promise, response-time figure or condo specialty claim, so each such string is removed
- offer claim: unchanged; the existing one-page review in each page's other answers, from owner-offer section 7
- required internal links: /property-management/, /property-management/vacation-rental-licensing-florida/
- CTA target: the existing owner evaluation form on each page. Labels, hrefs, fields and tracking are unchanged
- anti-claims:
  - no client count or track-record claim;
  - no income, returns or revenue promise;
  - no response-time claim;
  - no compliance promise for guests or owners;
  - no specialty claim without a source

## Why This Batch

- What changed: the reviews for PR #1082 found these strings, which owner-offer does not back.
- Why now: they sit on the same two pages Sawyer's #105 ruling just corrected, and owner growth sends owners there.
- What should wait: other generic operations wording on the condo page ("prevents conflicts and guest violations", "swift corrective action", "detailed welcome messages") makes no number, track-record or compliance promise and is left as it is.

## Experiment And Readback Contract

- hypothesis: this is a claim fix. No ranking or lead lift is forecast, and no search-presentation field changes.
- primary event: `owner_primary_cta_click` on the two routes
- guardrail event: owner evaluation form submits on the two routes
- entry criteria: `owner-compliance-claims.test.js` green; voice pass approved; `npm run verify:release` green
- readback window: one `liveChecks` fact-fix entry for each route in `docs/status/page-ledger.json`, verdict due 2026-11-30
- decision rule: keep; never restore a removed claim without a source in owner-offer

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | "condo rental management florida", "new vacation rental owner florida" |
| Searcher intent | Commercial: an owner choosing a manager or learning what launch needs |
| Current Seascape URL | `/property-management/condo-rental-management-florida/`, `/property-management/new-vacation-rental-owner-guide-florida/` |
| SERP observed date | 2026-11-25 |
| SERP stale after | 2026-12-02 |
| Current proof | Search Console for the condo page, 2026-08-23 to 11-23: 0 clicks, 44 impressions, position 11.3 (OpenSEO results read for #1082). No owner lead is attributed to either page |
| Top visible competitors | Not read for this batch |
| Competitor angle | Not read for this batch |
| Visual/format gap | None. The change is limited to text in existing fields |
| Seascape gap | Claim truth: a client count, a returns promise, a response-time claim, a guest-compliance promise and an unsourced specialty claim |
| Search fit | Existing pages corrected in place; not an expansion branch |
| Local/GBP proof | Not touched |
| AEO/readback note | An assistant quoting either page no longer repeats a client count or a returns promise |
| Recommendation | Remove the unbacked strings and fix the typo |
| Attack status | none found after named checks |
| Query variants inspected | Search Console condo-page query rows (OpenSEO results `6d192cfa-bde9-4f0a-92d3-d08e2c928a9b`, `e3a3593c-7be9-4c5e-b0a6-88c90b8ec3e9`) |
| SERP source | No paid SERP lookup, under the `docs/process/openseo.md` Cost Boundary. This is a claim fix with no title, description or heading change. Observed 2026-11-25 from Search Console. |
| Competitor URLs inspected | Named checks: current source (hub `context/owner-offer.md`; Site `origin/main` cae4f656 owner entries). SERP check skipped under the Cost Boundary; the Search Console rows above are used instead. Competitor pages were not fetched, because the decision rests on Seascape's own offer |
| Content gap and Seascape answer | The pages claimed a track record, returns and response times Seascape cannot back; the new copy drops them |
| Design/format strategy | No layout, template or CSS change |
| Seascape proof available | owner-offer section 7, unchanged on the pages |
| Tools/plugins used | Hub and Site source reads; the Search Console rows already read for #1082 |
| Decision and reason | Remove the claims. Each edit is a deletion or a one-word fix and can be undone with a plain revert |

## Draft copy rules

- Removal over rewording: every edit deletes an unbacked claim or fixes a typo; no new claim is added.
- Compound Writing (`cw-draft`, `cw-line-edit`) is not installed in this session. The edits are deletions, and the independent Voice Editor pass below reviewed them.

## Source Files Changed In This Batch

- `src/_data/seoPages.json` (the six strings named in task scope)
- `scripts/enforcement/owner-compliance-claims.test.js` ("ensures … comply" pattern and fixture)
- `docs/status/page-ledger.json` (two liveChecks entries)

## Boundary Proof

The check is `scripts/enforcement/owner-compliance-claims.test.js`, whose new fixture is the replaced guest-rules sentence. Against the `origin/main` cae4f656 copy with the widened pattern, it fails with one violation: `condo-rental-management-florida::ensures guests understand and comply`. Against the shipped copy it reports none. The other five strings are not compliance wording; their removal is read back from source in this brief's task scope and in the live checks.

## Voice and specificity pass

Pending the independent Voice Editor pass.
