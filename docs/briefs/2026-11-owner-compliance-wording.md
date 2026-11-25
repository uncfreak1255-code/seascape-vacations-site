# Brief: Owner pages, HOA and regulation answers without a compliance promise (2026-11-25)

- lifecycle: completed — source change finished in this PR (agent-issues #102). Source completion is not proof that it is live.
- task scope: two FAQ answers in `src/_data/seoPages.json`, the owner entries `vacation-rental-management-longboat-key` ("How does the Longboat Key homeowners association impact short-term rental operations?") and `vacation-rental-management-siesta-key` ("What are the specific regulations for Siesta Key short-term rentals?"). Plus a guard against compliance promises on owner pages, `scripts/enforcement/owner-compliance-claims.test.js`. No question, title, description, H1, link, CTA, layout or tracking change.
- completion or successor: this PR. Two more live compliance promises the guard found (`new-vacation-rental-owner-guide-florida` permits FAQ, `condo-rental-management-florida` HOA answer) wait on their own ruling from Sawyer; they are exempted by exact match in `PENDING_RULING` in that test until then.

## Approval

Legal wording is Sawyer's (AGENTS.md, Business Priorities). He approved both replacement texts and the optional last line of the Longboat Key answer in Claude Code session chat on 2026-11-25: "yes, ship both with the optional last line". Shipped text differs from the approved draft in one way: "the home" became "your home" in both answers, as `docs/style/banned-patterns.md` asks.

## Content Gate Inputs

- persona: an owner of a Longboat Key condo or Siesta Key home comparing local managers, who needs to know whether their association or the county allows short-term rentals before anything else
- primary keyword: longboat key property management; siesta key vacation rental management
- secondary keywords: longboat key hoa rental rules; siesta key short term rental regulations
- audience pattern: an owner reads the HOA or regulation answer to judge whether the manager knows the local rules and will be honest about them
- proof source: `seascape-hub` `origin/main` a2a4adf2 `context/owner-offer.md` sections 2 and 7, read 2026-11-25; the separate-checks answer already on `origin/main` in `vacation-rental-licensing-florida` (DBPR license, tax registration, adopted local rules, HOA restrictions)
- offer claim: `seascape-hub/context/owner-offer.md` section 7, the free one-page review of the listing or statement the owner sends (what looks right, what deserves a second look, what Seascape would check next); section 2 for setting the nightly rate per home
- required internal links: /property-management/, /property-management/vacation-rental-licensing-florida/
- CTA target: the existing owner evaluation form on each owner page; labels, hrefs, fields and tracking unchanged
- anti-claims: no promise of legal, HOA or regulatory compliance; no legal advice or reading of association documents as a ruling; no new county or Town of Longboat Key rule that is not sourced; no Seascape home placed on Longboat Key or Siesta Key; no review count, response time, revenue or occupancy figure; no software name

## Why This Batch

- What changed: nothing in the data; the copy promised a service Seascape does not offer. The Longboat Key answer said "ensure your property operates in full compliance with community requirements"; the Siesta Key answer said "Seascape Vacations ensures full compliance with all applicable regulations and manages any HOA coordination required" and listed county rules with no source. Owner-offer has no compliance service claim.
- Why now: Sawyer's owner growth push sends owners to these pages, and an owner who relies on a compliance promise and is fined is a worse outcome than a lost lead.
- What should wait: the Florida owner guide and condo page promises (pending ruling, above); the Siesta Key photography answer ("drone images", "directly increases booking rates"), an unbacked service and performance claim noted as a follow-up.

## Experiment And Readback Contract

- hypothesis: an answer that names the real association limits and offers the one-page review keeps owner trust and gives a reason to send documents, without a compliance promise. This is a claim fix; no ranking or lead lift is forecast.
- primary event: `owner_primary_cta_click` on the two owner routes
- guardrail event: owner evaluation form submits on the two routes
- entry criteria: `owner-compliance-claims.test.js` green; voice pass approved; `npm run verify:release` green
- readback window: none of its own. The Longboat Key route is already in `docs/status/page-ledger.json` for PR #1066; this change does not alter the title, description or H1, so it gets no separate ledger entry.
- decision rule: keep. The old wording is not restored under any traffic result, because it promised a service Seascape does not offer.

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | "longboat key property management", "siesta key vacation rental management" |
| Searcher intent | Commercial: an owner choosing a local manager |
| Current Seascape URL | `/property-management/vacation-rental-management-longboat-key/`, `/property-management/vacation-rental-management-siesta-key/` |
| SERP observed date | 2026-11-24 |
| SERP stale after | 2026-12-01 |
| Current proof | Search Console rows recorded in `docs/briefs/2026-11-owner-service-area-truth.md` Gate 0 (Longboat Key: 0 clicks, about 43 impressions, 2026-08-22 to 2026-11-22); no owner lead attributed to either page |
| Top visible competitors | Not read for this batch |
| Competitor angle | Not read for this batch |
| Visual/format gap | None; text in existing FAQ answers only |
| Seascape gap | Claim truth: the answers promised compliance Seascape does not provide |
| Search fit | Existing pages corrected in place; not an expansion branch |
| Local/GBP proof | Not touched |
| AEO/readback note | An assistant quoting either answer now repeats "your association decides" and the separate checks, not a compliance guarantee |
| Recommendation | Replace the two answers; add the owner compliance-promise guard |
| Attack status | none found after named checks |
| Query variants inspected | Search Console rows from the 2026-11-24 service-area receipt (results `bd812264-e9b2-4fcd-986f-c6b66f29d171` for Longboat Key); no new query read for a wording fix that keeps titles and descriptions |
| SERP source | No paid SERP lookup, under `docs/process/openseo.md` Cost Boundary: the change is a claim fix in two FAQ answers with no search-presentation change. Observed 2026-11-24 via the service-area receipt. |
| Competitor URLs inspected | Named checks: current source (hub `context/owner-offer.md`, Site `origin/main` aed5e6e2 owner entries); SERP check skipped under the Cost Boundary (Search Console rows above); competitor pages not fetched, because the decision rests on Seascape's own offer, not on competitor angle |
| Content gap and Seascape answer | The pages promised compliance. Answer: name what associations and agencies actually decide, send the owner to them for the final word, and offer the one-page review |
| Design/format strategy | No layout, template or CSS change |
| Seascape proof available | Owner-offer section 7 review; the licensing page's separate-checks answer |
| Tools/plugins used | None paid. Hub and Site source reads; GBrain recall for prior rulings on #102 (none found) |
| Decision and reason | Ship both answers as Sawyer approved them; they remove live promises and are reversible by plain revert |

## Draft copy rules

- Every service claim maps to owner-offer sections 2 and 7.
- The association or agency has the final word; Seascape reads and asks, never rules.
- Compound Writing (`cw-draft`, `cw-line-edit`) is not installed in this session; drafting was native, with the independent Voice Editor pass below.

## Source Files Changed In This Batch

- `src/_data/seoPages.json` (two FAQ answers only)
- `scripts/enforcement/owner-compliance-claims.test.js` (new: compliance-promise patterns, the pending-ruling exemptions, and fixtures of the replaced and approved wording)
- `docs/status/page-ledger.json` (the Longboat Key note that said the HOA answer waits on #102)

## Boundary Proof

Check from a source other than the new copy: `scripts/enforcement/owner-compliance-claims.test.js`, written from the replaced wording and owner-offer. Observed 2026-11-25: against the `origin/main` copy it fails with four violations on the two pages ("full compliance", "ensures full compliance", "ensure your property operates in full compliance"); against the shipped copy it reports none. Before the pending list existed it also reported the Florida owner guide ("ensuring your property operates in full legal compliance"), which is how that page was found.

## Voice and specificity pass

Independent Voice Editor, 2026-11-25, one round, verdict "Changes needed" with two minor items. Both are kept as Sawyer approved them:

- "we plan the calendar and rates around it": the editor found that "rates" maps to owner-offer section 2 but "calendar" does not. Kept. This is the optional last line Sawyer approved by name, after he was told that planning the calendar around association limits is not in section 2.
- "the rules Sarasota County has adopted for your address": the editor asked for a source for the county. Kept. Siesta Key is unincorporated Sarasota County, and the `origin/main` answer this replaces already named Sarasota County as the rule-setter. The new text claims no county rule, only that the county's adopted rules are a separate check.

It confirmed no compliance promise or legal advice, no home placed on either key, no banned pattern, and no figure, review count or software name.
