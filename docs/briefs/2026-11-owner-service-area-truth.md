# Brief: Owner service-area truth (2026-11-24)

- lifecycle: active
- task scope: site #1016, items 1 and 2, as Sawyer set them on 2026-11-18. Make three existing pages say where Seascape manages homes today: `/about-us/` (description, the who-we-are sentence, the area tiles), and the owner entries `vacation-rental-management-anna-maria-island` and `vacation-rental-management-longboat-key` in `src/_data/seoPages.json`. No new URL, no layout, CSS, template, form, tracking or redirect change. Titles and H1s stay. No fee, price or legal wording is added or changed.
- completion or successor: this PR. FAQ markup parity (#1016 item 3) ships in its own PRs; item 4 ("Never crowded") was verified and recorded on #1016.

## Content Gate Inputs

- persona: an owner of a home on Anna Maria Island or Longboat Key comparing local managers, and anyone (owner, guest, AI assistant) reading the About page to learn where Seascape works
- primary keyword: anna maria island vacation rental management; longboat key property management
- secondary keywords: longboat key vacation rental management; seascape vacations about
- audience pattern: an owner opens two or three manager pages and checks whether the manager actually runs homes near theirs
- proof source: `seascape-hub` `origin/main` `context/seascape-properties.md` (eight homes: seven in Bradenton, Sarasota Luxe in Sarasota), read 2026-11-24; `seascape-hub` `origin/main` `context/owner-offer.md` sections 6 and 7, read 2026-11-24; Search Console through OpenSEO `get_search_console_performance`, 2026-08-22 to 2026-11-22, read 2026-11-24
- offer claim: `seascape-hub/context/owner-offer.md` section 7 (listing on Airbnb, Vrbo and the direct site; rates set per home and reviewed with the owner; guests screened by a local person; cleaning and maintenance coordinated with a note before the owner has to ask; monthly payout and statement; Sawyer and Patrick answer; the one-page review), carried by the section 6 sentence: "A small local team that gives my home direct attention, tells me what it earned and what needs fixing before I ask, and answers the phone."
- required internal links: /property-management/, /properties/
- CTA target: the existing owner evaluation form on each owner page; labels, hrefs, fields and tracking unchanged
- anti-claims: no Seascape home placed on Anna Maria Island, Longboat Key or Siesta Key; no count of homes; no revenue, occupancy or savings figure; no review count or response time; no guarantee; no passive income or hands-off management; no software name; no HOA or legal compliance promise

## Why This Batch

- What changed: nothing in the data; the copy was wrong. Hub property truth puts every managed home in Bradenton or Sarasota. The About page said Seascape offers rentals "across Anna Maria Island, Bradenton, Sarasota, and Siesta Key". The AMI owner page spoke as the "right island operator" running "island-grade turnover" and an "island takeover". The Longboat Key page said "we market Longboat Key properties", named Old Collier Golf Club (it is in Naples), promised quarterly inspections and five-star reviews, and offered "HOA compliance".
- Why now: Sawyer's owner growth push (agent-issues #82) sends owners to these pages. An owner who asks "which island homes do you run?" finds there are none, and the page loses the trust the offer depends on.
- What should wait: the Siesta Key owner page, which also says "homes we manage" (noted on #1016 as a follow-up, not edited here); the AMI fee FAQ line "tourism and sales taxes remitted for you" and the direct-booking line "the fee gap is real" (fee wording, left byte-identical and noted on #1016).

## Experiment And Readback Contract

- hypothesis: an honest "expanding here" page keeps or improves owner trust without losing search position, because titles and H1s are unchanged. This is a fact fix first; no ranking lift is forecast.
- primary event: `owner_primary_cta_click` on the two owner routes
- guardrail event: owner evaluation form submits on the two routes; Search Console impressions and average position for the queries in Gate 0
- entry criteria: `service-area-truth.test.js` green; voice pass approved; `npm run verify:release` green
- readback window: 28 days after the production publish, judged on the verdict Monday in `docs/status/page-ledger.json`
- decision rule: keep unless an owner route loses 30% or more of its impressions while the site does not, or its main query falls 5 or more positions. A harm result reverts only the snippet (description), never the location truth, since the old wording was false.

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | "anna maria island vacation rental management", "longboat key property management", "longboat key vacation rental management" |
| Searcher intent | Commercial: an owner choosing a local manager |
| Current Seascape URL | `/property-management/vacation-rental-management-anna-maria-island/`, `/property-management/vacation-rental-management-longboat-key/`, `/about-us/` |
| SERP observed date | 2026-11-24 |
| SERP stale after | 2026-12-01 |
| Attack status | none found after named checks |
| Query variants inspected | Search Console rows, 2026-08-22 to 2026-11-22: AMI page 0 clicks, 35 impressions, top query "anna maria island vacation rental management" 24 impressions at position 36.8 (result `3be69859-25a2-49b8-a187-1bdf70fa3a25`); LBK page 0 clicks, about 43 impressions, top query "longboat key property management" 8 at position 19.4 (result `bd812264-e9b2-4fcd-986f-c6b66f29d171`); About 4 clicks, 516 impressions, position 4.5 (result `18b56c60-3bb5-4da3-b425-6047008b52c3`) |
| SERP source | No paid SERP lookup. Volume is too thin to justify one under `docs/process/openseo.md` Cost Boundary, and the change is a truth fix that keeps titles and H1s. |
| Competitor URLs inspected | Named checks: current source (hub `context/seascape-properties.md` and `context/owner-offer.md`, and the three Seascape pages at `origin/main` 55f773e5); SERP check skipped under the Cost Boundary (Search Console rows above); competitor pages not fetched, because the decision rests on Seascape's own property truth, not on competitor angle |
| Top visible competitors | Not read for this batch |
| Competitor angle | Not read for this batch |
| Content gap and Seascape answer | The pages claimed island operations Seascape does not have. Answer: say where the homes are, say plainly that none is on the island or key yet, and say Seascape is taking homes on there, run by the same two people. |
| Visual/format gap | None addressed; text in existing fields only |
| Design/format strategy | No layout, CSS or template change. The About visual baseline changes because the tile words change. |
| Seascape gap | Truth, not snippet: the old copy implied a local portfolio that does not exist |
| Cannibalization check | No title, H1 or target changes, so no page takes another's query |
| Seascape proof available | Hub property truth and owner-offer section 7; the shared owner template already captions these pages "Nearby managed home: X, Bradenton." |
| Current proof | Search Console rows above; no owner lead attributed to either owner page |
| Search fit | Existing pages, corrected in place; not an expansion branch |
| Local/GBP proof | Not touched |
| AEO/readback note | Each owner page gains a first FAQ, "Does Seascape manage any homes on … now?", answered "Not yet" in its first words, so an assistant quoting the page repeats the truth |
| Tools/plugins used | OpenSEO `get_search_console_performance` (free). No paid call, no Hostaway call. |
| Decision and reason | Ship the three corrections as one PR. They remove live false claims, change no title, and are reversible by plain revert. |
| Recommendation | Edit the three pages; add `scripts/enforcement/service-area-truth.test.js`; add ledger entries |

## Draft copy rules

- Location: homes in Bradenton and Sarasota only. Island beaches are "a short drive" from them. Siesta Key is "about 3 miles from Sarasota Luxe" (hub property truth).
- Every service claim maps to owner-offer section 7. Section 7 excluded claims stay out.
- Fee and price strings on both owner entries are byte-identical to `origin/main`: the AMI fee benefit, fee FAQ, fee objection, the proof stats and the geoIntro fee paragraph; the LBK nightly-rates FAQ.
- LBK place facts kept to what a reader can check: Gulf beaches, golf at the Longboat Key Club, St. Armands Circle a short drive south. Old Collier Golf Club removed (Naples).
- Compound Writing (`cw-draft`, `cw-line-edit`) is not installed in this session; drafting was native, with the independent Voice Editor pass below.

## Source Files Changed In This Batch

- `src/about-us/index.njk` (description, who-we-are sentence, area intro and tiles; `pageUpdated` not bumped, to keep clear of PR #1034's front-matter hunk)
- `src/_data/seoPages.json` (the two owner entries only)
- `scripts/enforcement/service-area-truth.test.js` (new)
- `docs/status/page-ledger.json`
- `tests/visual/__screenshots__/*/visual.spec.js/about-seascape.png` if the baseline workflow refreshes it

## Boundary Proof

Must not break: every other `seoPages` entry; the AMI page's "share of your home's net rent" fee line (`recovery-smoke-owner.test.js`); the four About tile links. Must not appear: any wording that places a managed home on Anna Maria Island or Longboat Key, or an About description that lists an island as a rental area.

Check from a source other than the new copy: `scripts/enforcement/service-area-truth.test.js`, written from hub property truth. Observed 2026-11-24:

- against the `origin/main` copy: 3 of 3 tests fail ("names where the managed homes are", "says no home is managed in Longboat Key today", About description lacks "Bradenton and Sarasota")
- against the new copy with "our island homes", "the homes we manage on the island" or "we manage homes on Longboat Key" added to each owner entry: both owner tests fail with "presents Seascape as already operating in …"
- against the shipped copy: 3 of 3 pass

## Overlap

PR #1034 edits `src/about-us/index.njk` front matter (lines 8 and 19) and adds a line after line 68. This PR changes lines 5, 68 and the tiles. The hunks are adjacent; whichever lands second rebases. No other open PR touches these files.

## Voice and specificity pass

Independent Voice Editor, 2026-11-24, two rounds. Round one: no sentence placed a home on the island or key; it asked for ten changes. These were "fast response" and "carefully selected homes" on About (a response-time edge and filler), hedging the HOA answer, removing "quieter pace than Siesta Key", the repetitive "Not yet" answer sentence, the "taking on homes next" pipeline implication, the disclosure repeated four times per page, the circular About intro, an unbacked "a walk from downtown" on the Sarasota tile (property truth says only "in downtown Sarasota"), and the About description opener. All were applied except two items on lines unchanged from `origin/main`: the LBK seasonality FAQ and the LBK `geoIntro` rental-rule sentence. Those are logged on #1016 as follow-ups. Round two returned `Approved`.
